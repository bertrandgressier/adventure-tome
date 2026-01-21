# Combat V3 - Analyse du flux des phases et solution de fluidification

## Problème identifié

Le joueur décrit une expérience fragmentée :
1. Joueur clique "Attaquer"
2. L'attaque se produit ✅
3. **Bouton "Continuer" apparaît** ⚠️
4. Le joueur doit cliquer "Continuer"
5. L'ennemi attaque ✅
6. **Bouton "Continuer" apparaît à nouveau** ⚠️
7. Le joueur doit cliquer "Continuer"
8. Le cycle recommence

**Expérience souhaitée** : Flux fluide sans interruptions
- Joueur attaque → automatiquement ennemi attaque → automatiquement retour au joueur

## Diagnostic technique

### Architecture actuelle (V3)

Le système utilise **4 phases** avec une phase `TURN_COMPLETE` qui nécessite une action `SKIP` :

```typescript
// src/domain/types/CombatPhase.ts
export enum CombatPhase {
  WAITING_ATTACK_ROLL = 'waiting_attack_roll',    // ← Joueur clique "Attaquer"
  WAITING_DAMAGE_ROLL = 'waiting_damage_roll',    // ← Appliqué automatiquement
  TURN_COMPLETE = 'turn_complete',                // ← PROBLÈME: nécessite "Continuer"
  ENDED = 'ended',
}
```

### Flux détaillé actuel

#### Tour du joueur
```
WAITING_ATTACK_ROLL (player)
  ↓ [Joueur clique "Attaquer"]
  ↓ resolveAttack() → hit detected
  ↓
WAITING_DAMAGE_ROLL (player)
  ↓ [dégâts appliqués immédiatement dans resolveAttack()]
  ↓ PhaseManager.advancePhase() → auto-avance
  ↓
TURN_COMPLETE (player) ⚠️
  ↓ [UI affiche bouton "Continuer" (SKIP)]
  ↓ [Joueur doit cliquer "Continuer"]
  ↓ resolveSkip() → PhaseManager.skipToNextTurn()
  ↓
WAITING_ATTACK_ROLL (enemy)
  ↓ [Tour ennemi démarre automatiquement]
```

#### Tour de l'ennemi
```
WAITING_ATTACK_ROLL (enemy)
  ↓ [Attaque auto-déclenchée par UI ou logique]
  ↓
WAITING_DAMAGE_ROLL (enemy)
  ↓ [dégâts appliqués automatiquement]
  ↓
TURN_COMPLETE (enemy) ⚠️
  ↓ [UI affiche bouton "Continuer" (SKIP)]
  ↓ [Joueur doit cliquer "Continuer"]
  ↓ resolveSkip() → round++
  ↓
WAITING_ATTACK_ROLL (player)
  ↓ [Retour au joueur]
```

### Code responsable du bouton "Continuer"

#### 1. CombatValidator.ts - Ajoute l'action SKIP

```typescript
// src/domain/services/combat/CombatValidator.ts:66-77
if (state.phase === CombatPhase.TURN_COMPLETE) {
  // Allow reroll if: player's turn just ended, they missed, haven't used reroll yet
  if (
    state.currentTurn === 'player' &&
    state.lastRoll &&
    !state.lastRoll.success &&
    !state.usedReroll
  ) {
    actions.push({ action: { type: CombatActionType.REROLL }, enabled: true });
  }
  actions.push({ action: { type: CombatActionType.SKIP }, enabled: true }); // ← PROBLÈME
}
```

#### 2. combatUIHelpers.ts - Définit le label "Continuer"

```typescript
// src/presentation/components/combat/combatUIHelpers.ts:88
export const COMBAT_ACTION_METADATA: Record<string, ActionMetadata> = {
  attack: { label: 'Attaquer', icon: '⚔️' },
  use_item: { label: 'Objet', icon: '🎒' },
  // ...
  skip: { label: 'Continuer', icon: '▶️' }, // ← Label du bouton
};
```

#### 3. ActionPanel.tsx - Affiche le bouton

```typescript
// src/presentation/components/combat/ActionPanel.tsx:79-110
availableActions.map((action, index) => {
  const actionInfo = getActionMetadata(action.action.type); // ← "Continuer"
  return (
    <Button
      onClick={() => handleAction(action.action.type as CombatActionType)}
    >
      <span>{actionInfo.label}</span> {/* ← Affiche "Continuer" */}
    </Button>
  );
})
```

## Pourquoi la phase TURN_COMPLETE existe-t-elle ?

### Raisons d'origine

1. **Support du relancer (REROLL)**
   - Le joueur peut relancer après un échec
   - Nécessite une pause après l'attaque manquée

2. **Weapon abilities contextuelles (ON_MISS)**
   - Certaines armes ont des pouvoirs activables après un échec
   - Exemple: "Relancer avec bonus après un échec"

3. **Validation de fin de combat**
   - Vérifier si un combattant est mort avant de continuer
   - Afficher l'écran de victoire/défaite

4. **Architecture modulaire**
   - Séparation claire : attaque → résolution → transition
   - Facilite le testing et les weapon abilities

### Code concerné par REROLL

```typescript
// src/domain/services/combat/CombatValidator.ts:66-75
if (state.phase === CombatPhase.TURN_COMPLETE) {
  // ✅ LÉGITIME : Reroll après échec du joueur
  if (
    state.currentTurn === 'player' &&
    state.lastRoll &&
    !state.lastRoll.success &&
    !state.usedReroll
  ) {
    actions.push({ action: { type: CombatActionType.REROLL }, enabled: true });
  }
  // ⚠️ PROBLÉMATIQUE : Skip toujours disponible même sans reroll
  actions.push({ action: { type: CombatActionType.SKIP }, enabled: true });
}
```

## Solutions envisagées

### Option 1 : Auto-skip conditionnel (RECOMMANDÉE) ⭐

**Principe** : Avancer automatiquement si aucune action manuelle n'est nécessaire

**Logique** :
- Si `TURN_COMPLETE` + aucune action manuelle disponible → auto-skip
- Si `TURN_COMPLETE` + REROLL disponible → attendre input joueur
- Si `TURN_COMPLETE` + weapon ability (ON_MISS) → attendre input joueur

**Implémentation** :

```typescript
// src/domain/services/combat/CombatValidator.ts
static getAvailableActions(state: CombatState): AvailableAction[] {
  const actions: AvailableAction[] = [];

  // ... existing code ...

  if (state.phase === CombatPhase.TURN_COMPLETE) {
    let hasManualActions = false;

    // Allow reroll if player missed and hasn't used reroll
    if (
      state.currentTurn === 'player' &&
      state.lastRoll &&
      !state.lastRoll.success &&
      !state.usedReroll
    ) {
      actions.push({ action: { type: CombatActionType.REROLL }, enabled: true });
      hasManualActions = true;
    }

    // Check for ON_MISS weapon ability
    const weaponAbility = state.player.weapon.ability;
    if (
      weaponAbility &&
      weaponAbility.trigger === WeaponAbilityTrigger.ON_MISS &&
      state.currentTurn === 'player' &&
      state.lastRoll &&
      !state.lastRoll.success
    ) {
      const { canUse } = WeaponAbilityResolver.canUseAbility(state, weaponAbility.id);
      if (canUse) {
        actions.push({
          action: { type: CombatActionType.WEAPON_ABILITY, payload: { abilityId: weaponAbility.id } },
          enabled: true,
        });
        hasManualActions = true;
      }
    }

    // ✅ NOUVEAU : Skip uniquement si aucune action manuelle
    if (hasManualActions) {
      actions.push({ action: { type: CombatActionType.SKIP }, enabled: true });
    }
    // Sinon, l'UI ou le store doit auto-skip
  }

  return actions;
}
```

**Logique UI/Store** (nouvelle méthode nécessaire) :

```typescript
// src/presentation/stores/slices/characterCombatSlice.ts
executeAction: async (characterId: string, action: CombatAction) => {
  // ... existing code ...
  
  const result = CombatEngine.resolve(combat, action);
  set({ combat: result.state, events: result.events });

  // ✅ NOUVEAU : Auto-skip si TURN_COMPLETE sans actions manuelles
  if (result.state.phase === CombatPhase.TURN_COMPLETE) {
    const availableActions = CombatValidator.getAvailableActions(result.state);
    const hasOnlySkip = availableActions.length === 1 && availableActions[0].action.type === 'skip';
    
    if (hasOnlySkip || availableActions.length === 0) {
      // Auto-skip après un délai pour l'animation
      setTimeout(() => {
        const skipResult = CombatEngine.resolve(result.state, { type: CombatActionType.SKIP });
        set({ combat: skipResult.state, events: skipResult.events });
        
        // Si c'est le tour de l'ennemi, déclencher son attaque automatiquement
        if (skipResult.state.currentTurn === 'enemy') {
          setTimeout(() => {
            get().executeAction(characterId, { type: CombatActionType.ATTACK });
          }, 500); // Délai pour animation
        }
      }, 500); // Délai pour afficher résultat
    }
  }

  // ✅ NOUVEAU : Auto-attaque ennemie après transition
  if (result.state.currentTurn === 'enemy' && result.state.phase === CombatPhase.WAITING_ATTACK_ROLL) {
    setTimeout(() => {
      get().executeAction(characterId, { type: CombatActionType.ATTACK });
    }, 1000); // Délai pour animation
  }
},
```

**Avantages** :
- ✅ Conserve REROLL et weapon abilities (ON_MISS)
- ✅ Fluidifie 95% des cas (attaque normale sans échec)
- ✅ Pas de breaking change dans le moteur
- ✅ Facile à tester et debugger

**Inconvénients** :
- ⚠️ Logique dupliquée UI/Store (auto-skip + auto-attaque ennemi)
- ⚠️ Délais hardcodés (500ms, 1000ms) pour animations

---

### Option 2 : Supprimer TURN_COMPLETE (RISQUÉ) ⚠️

**Principe** : Fusionner `WAITING_DAMAGE_ROLL` → `TURN_COMPLETE` en une seule transition

**Implémentation** :

```typescript
// src/domain/services/combat/PhaseManager.ts
static advancePhase(state: CombatState, context: { hit?: boolean; combatEnded?: boolean }) {
  if (context.combatEnded) {
    return { phase: CombatPhase.ENDED, ... };
  }

  switch (state.phase) {
    case CombatPhase.WAITING_ATTACK_ROLL:
      // ✅ NOUVEAU : Passer directement au tour suivant
      const nextTurn: CurrentTurn = state.currentTurn === 'player' ? 'enemy' : 'player';
      const shouldIncrementRound = state.currentTurn === 'enemy';

      return {
        phase: CombatPhase.WAITING_ATTACK_ROLL, // ← Sauter TURN_COMPLETE
        currentTurn: nextTurn,
        roundNumber: shouldIncrementRound ? state.roundNumber + 1 : state.roundNumber,
      };

    // ... supprimer les cas WAITING_DAMAGE_ROLL et TURN_COMPLETE
  }
}
```

**Avantages** :
- ✅ Flux ultra-fluide : attaque → attaque → attaque
- ✅ Simplifie l'architecture (3 phases → 2 phases)
- ✅ Moins de code à maintenir

**Inconvénients** :
- ❌ CASSE REROLL : impossible de relancer après le tour
- ❌ CASSE ON_MISS abilities : pas de phase pour les déclencher
- ❌ Breaking change massif : 50+ tests à réécrire
- ❌ Complexifie la gestion des cas spéciaux

---

### Option 3 : Phase TURN_COMPLETE conditionnelle (COMPLEXE) 🔧

**Principe** : `TURN_COMPLETE` n'existe que si REROLL ou ON_MISS disponible

**Implémentation** :

```typescript
// src/domain/services/combat/PhaseManager.ts
static advancePhase(
  state: CombatState,
  context: {
    hit?: boolean;
    combatEnded?: boolean;
    hasManualActionsAvailable?: boolean; // ← NOUVEAU
  }
) {
  switch (state.phase) {
    case CombatPhase.WAITING_DAMAGE_ROLL:
      // ✅ NOUVEAU : Conditionnel selon actions disponibles
      if (context.hasManualActionsAvailable) {
        return { phase: CombatPhase.TURN_COMPLETE, ... };
      } else {
        // Skip direct au tour suivant
        const nextTurn = state.currentTurn === 'player' ? 'enemy' : 'player';
        return { phase: CombatPhase.WAITING_ATTACK_ROLL, currentTurn: nextTurn, ... };
      }
  }
}
```

**Problème** : Nécessite de calculer `hasManualActionsAvailable` AVANT d'avancer la phase
→ Couplage fort entre PhaseManager et CombatValidator
→ Plus difficile à tester

**Avantages** :
- ✅ Phase TURN_COMPLETE uniquement quand nécessaire
- ✅ Conserve REROLL et weapon abilities

**Inconvénients** :
- ❌ Complexifie PhaseManager (dépendance circulaire)
- ❌ Tests plus complexes (mock CombatValidator)
- ❌ Logique métier éparpillée

---

## Recommandation finale

**Implémenter l'Option 1 : Auto-skip conditionnel** ⭐

### Plan d'implémentation (4 étapes)

#### Étape 1 : Modifier CombatValidator.getAvailableActions()

**Fichier** : `src/domain/services/combat/CombatValidator.ts`

**Changements** :
- Ne pas ajouter `SKIP` si aucune action manuelle disponible
- Retourner tableau vide si auto-skip nécessaire

#### Étape 2 : Ajouter auto-skip dans characterCombatSlice

**Fichier** : `src/presentation/stores/slices/characterCombatSlice.ts`

**Changements** :
- Détecter `TURN_COMPLETE` sans actions manuelles
- Déclencher `SKIP` automatiquement après délai (500ms)
- Propager au tour ennemi si nécessaire

#### Étape 3 : Ajouter auto-attaque ennemie

**Fichier** : `src/presentation/stores/slices/characterCombatSlice.ts`

**Changements** :
- Détecter `currentTurn === 'enemy'` + `phase === WAITING_ATTACK_ROLL`
- Déclencher `ATTACK` automatiquement après délai (1000ms)
- Gérer récursion : ennemi attaque → auto-skip → retour joueur

#### Étape 4 : Tests

**Fichiers** :
- `tests/unit/domain/services/combat/CombatValidator.test.ts`
- `tests/unit/presentation/stores/slices/characterCombatSlice.test.ts`
- `tests/integration/combat-flow.test.ts` (nouveau)

**Scénarios à tester** :
- ✅ Attaque réussie joueur → auto-skip → ennemi attaque → auto-skip → joueur
- ✅ Attaque ratée joueur + REROLL disponible → afficher bouton "Relancer" + "Continuer"
- ✅ Attaque ratée joueur + ON_MISS ability → afficher bouton "Pouvoir" + "Continuer"
- ✅ Ennemi attaque → auto-skip → retour joueur (pas de bouton)
- ✅ Victoire/défaite → pas d'auto-skip (afficher écran de fin)

### Délais d'animation recommandés

```typescript
const ANIMATION_DELAYS = {
  AUTO_SKIP: 800,           // Délai après résultat attaque avant auto-skip
  ENEMY_ATTACK: 1200,       // Délai avant attaque automatique ennemi
  COMBAT_END_DISPLAY: 2000, // Délai avant écran victoire/défaite
};
```

**Justification** :
- 800ms : Temps de lire résultat attaque + animation dégâts
- 1200ms : Transition visuelle vers tour ennemi
- 2000ms : Afficher animation victoire/défaite complète

### Gestion des edge cases

#### Cas 1 : Ennemi tué pendant auto-skip

```typescript
if (CombatValidator.checkCombatEnd(skipResult.state) !== 'ongoing') {
  // Ne PAS déclencher auto-attaque ennemi
  set({ combat: skipResult.state, phase: 'ENDED' });
  return;
}
```

#### Cas 2 : Double attaque (ON_DOUBLE ability)

```typescript
if (result.state.pendingExtraAttack) {
  // Ne PAS auto-skip, attendre extra attaque
  return;
}
```

#### Cas 3 : Mode narratif (auto-win)

```typescript
if (combat.config.mode === 'narrative') {
  // Activer auto-skip immédiat (0ms)
  ANIMATION_DELAYS.AUTO_SKIP = 0;
  ANIMATION_DELAYS.ENEMY_ATTACK = 0;
}
```

---

## Métriques de succès

Après implémentation, vérifier :

1. **Flux fluide** : 0 clics "Continuer" dans 95% des combats normaux
2. **REROLL fonctionnel** : Bouton "Relancer" apparaît après échec joueur
3. **Animations visibles** : Délais suffisants pour lire résultats
4. **Tests passent** : 293/293 tests (aucune régression)
5. **Performance** : Pas de lag visible sur mobile (60fps)

---

## Alternatives futures (V4)

Si l'Option 1 ne suffit pas, envisager :

### Refonte complète en "Battle Log" (Turn-based classique)

**Principe** : Résoudre tout le round d'un coup, afficher résultats dans un log

```
Round 1:
  ⚔️ Vous attaquez : 🎲 7 (réussite) → 🩸 5 dégâts
  ⚔️ Gobelin attaque : 🎲 9 (échec)
  
Round 2:
  ⚔️ Vous attaquez : 🎲 11 (échec)
  ⚔️ Gobelin attaque : 🎲 6 (réussite) → 🩸 3 dégâts
```

**Avantages** :
- Ultra-rapide (1 clic par round)
- Historique complet visible
- Simplifie massively le code

**Inconvénients** :
- Change complètement l'UX
- Pas d'animations individuelles
- Moins immersif

---

## Conclusion

La phase `TURN_COMPLETE` est **nécessaire** pour supporter REROLL et weapon abilities ON_MISS, mais peut être **automatisée** dans les cas simples.

**Action immédiate** : Implémenter Option 1 (auto-skip conditionnel)
**Durée estimée** : 2-3 heures (code + tests)
**Impact utilisateur** : +90% de fluidité perçue

