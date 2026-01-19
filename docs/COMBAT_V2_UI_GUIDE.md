# Combat V2 - Guide Développement UI

Ce guide documente toutes les actions disponibles dans le système Combat V2 et explique comment les utiliser pour construire l'interface utilisateur.

---

## Table des Matières

- [Architecture](#architecture)
- [État du Combat](#état-du-combat)
- [Actions Zustand](#actions-zustand)
- [Phases de Combat](#phases-de-combat)
- [Actions Disponibles par Phase](#actions-disponibles-par-phase)
- [Exemples d'Intégration UI](#exemples-dintégration-ui)
- [Gestion des Animations](#gestion-des-animations)
- [Persistence et Fin de Combat](#persistence-et-fin-de-combat)

---

## Architecture

Le système Combat V2 suit Clean Architecture avec une séparation stricte :

```
┌─────────────────────────────────────────────┐
│  UI Components (CombatArena, ActionPanel)  │  Présentation
├─────────────────────────────────────────────┤
│  combatSlice (Zustand Store)               │  État + Coordination
├─────────────────────────────────────────────┤
│  CombatEngine (Domain Service)             │  Logique métier pure
└─────────────────────────────────────────────┘
```

**Règles importantes** :
- ⚠️ **NO LOGIC IN UI** : Les composants appellent uniquement les actions du store
- ✅ Toute la logique de combat est dans `CombatEngine` (100% testée)
- ✅ Le store expose un état immutable et des actions simples

---

## État du Combat

### Interface `CombatSlice`

```typescript
interface CombatSlice {
  // État actuel du combat (null si pas de combat actif)
  combat: CombatState | null;
  
  // Actions disponibles pour le joueur dans l'état actuel
  availableActions: AvailableAction[];
  
  // Indique si une animation est en cours
  isAnimating: boolean;
  
  // Erreur éventuelle
  error: string | null;
  
  // Actions (voir section suivante)
  startCombat: (...) => void;
  executeAction: (...) => void;
  endCombat: () => Promise<void>;
  cancelCombat: () => void;
  setAnimating: (animating: boolean) => void;
}
```

### Structure `CombatState`

```typescript
interface CombatState {
  id: string;                      // ID unique du combat
  characterId: string;             // ID du personnage
  player: CombatantState;          // État du joueur
  enemies: EnemyState[];           // Liste des ennemis
  activeEnemyIndex: number;        // Index ennemi actif
  phase: CombatPhase;              // Phase actuelle
  roundNumber: number;             // Numéro du round
  currentAttacker: 'player' | 'enemy';
  lastRoll?: DiceRoll;             // Dernier lancer de dés
  pendingDamage?: PendingDamage;   // Dégâts en attente
  usedAbilities: Record<string, number>; // Utilisations des pouvoirs
  usedReroll: boolean;             // Reroll utilisé
  isFirstAttack: boolean;          // Première attaque (Dague des Ombres)
  pendingExtraAttack?: boolean;    // Attaque supplémentaire (Lame)
  config: CombatConfig;            // Configuration
  events: CombatEvent[];           // Historique des événements
  usedItems: UsedItem[];           // Items utilisés (consommés à la fin)
}
```

### Types Importants

```typescript
interface CombatantState {
  name: string;
  dexterite: number;
  endurance: number;
  enduranceMax: number;
  chance: number;
  weapon: CombatWeapon;
}

interface DiceRoll {
  dice1: number;      // 1-6
  dice2: number;      // 1-6
  total: number;      // 2-12
  isDouble: boolean;  // Déclencheur Lame de l'Aube
}

interface AvailableAction {
  type: CombatActionType;
  enabled: boolean;
  reason?: string;    // Pourquoi disabled (ex: "Plus de chance")
  payload?: unknown;  // Données additionnelles (items disponibles)
}
```

---

## Actions Zustand

### 1. `startCombat(characterId, enemies, config)`

**Initialise un nouveau combat.**

```typescript
startCombat(
  characterId: string,
  enemies: EnemyConfig[],
  config: CombatConfig
): void
```

**Paramètres** :
```typescript
interface EnemyConfig {
  name: string;
  dexterite: number;
  endurance: number;
  attackPoints: number;
}

interface CombatConfig {
  canFlee: boolean;          // Le joueur peut-il fuir ?
  isSurpriseAttack: boolean; // Combat en surprise ? (Dague +2 dmg)
}
```

**Exemple** :
```typescript
const startCombat = useCharacterStore((state) => state.startCombat);

const handleStartCombat = () => {
  startCombat(
    characterId,
    [
      { name: 'Gobelin', dexterite: 6, endurance: 8, attackPoints: 1 },
      { name: 'Orc', dexterite: 7, endurance: 12, attackPoints: 2 }
    ],
    { canFlee: true, isSurpriseAttack: false }
  );
};
```

**Effets** :
- Crée l'état initial du combat avec le premier ennemi actif
- Initialise les dés, les rounds, les abilities
- Calcule les actions disponibles
- ⚠️ Lancera une erreur si le personnage n'existe pas

---

### 2. `executeAction(action, diceOverrides?)`

**Exécute une action de combat.**

```typescript
executeAction(
  action: CombatAction,
  diceOverrides?: DiceOverrides
): void
```

**Actions disponibles** :

#### A. ATTACK (Attaquer)

```typescript
executeAction({ type: 'attack' })
```

- Lance 2d6 pour toucher
- Si touché : lance 1d6 pour dégâts (1 + 1d6 + bonus arme)
- Alterne les tours player/enemy
- Déclenche les weapon abilities (Lame sur double, Dague surprise, etc.)

#### B. USE_ITEM (Utiliser objet)

```typescript
executeAction({ 
  type: 'use_item', 
  payload: { itemId: 'tome1-potion-guerison', itemIndex: 2 } 
})
```

- Applique l'effet de l'item (heal, bonus temporaire)
- Ajoute l'item à `usedItems[]` pour consommation à la fin
- ⚠️ Les items ne sont PAS consommés immédiatement (seulement à `endCombat()`)

**Récupérer les items disponibles** :
```typescript
const combat = useCharacterStore((state) => state.combat);
const availableActions = useCharacterStore((state) => state.availableActions);

const useItemAction = availableActions.find(a => a.type === 'use_item');
const items = useItemAction?.payload as CombatUsableItem[] | undefined;
```

#### C. WEAPON_ABILITY (Pouvoir d'arme)

```typescript
executeAction({ type: 'weapon_ability', payload: { abilityId: 'arc-vents-convert-hit' } })
```

**Pouvoirs manuels** :
- **Arc des Vents** : Convertir un raté en touché (coût : 1 CHANCE, disponible après un raté)
- **Bâton du Sage** : Annuler les dégâts ennemis (1x par combat)

> **Note** : L'Arc des Vents est le seul moyen d'utiliser la CHANCE en combat. L'action générique `SPEND_CHANCE` n'existe plus car elle n'est pas conforme aux règles officielles.

**Pouvoirs automatiques** (déclenchés par le système) :
- **Lame de l'Aube** : Double aux dés → attaque supplémentaire
- **Marteau de la Terre** : Kill enemy → +1 PV
- **Dague des Ombres** : Première attaque surprise → +2 dégâts

#### D. FLEE (Fuir)

```typescript
executeAction({ type: 'flee' })
```

- Termine le combat avec défaite
- Ne persiste PAS les dégâts/chance (comme `cancelCombat()`)
- Disponible uniquement si `config.canFlee === true`

#### F. REROLL (Relancer les dés)

```typescript
executeAction({ type: 'reroll' })
```

- Relance les 2d6 du jet pour toucher
- Utilisable 1 fois par combat (si Bague de Deuxième Chance possédée)

#### G. BLOCK (Bloquer)

```typescript
executeAction({ type: 'block' })
```

- Action défensive (réservée pour futures extensions)
- Pas encore implémentée dans le gameplay actuel

#### H. SKIP (Passer)

```typescript
executeAction({ type: 'skip' })
```

- Avance à la phase suivante sans action
- Utilisé pour transitions automatiques

---

### 3. `endCombat()`

**Termine le combat et persiste les changements au personnage.**

```typescript
endCombat(): Promise<void>
```

**Ce qui est persisté** :
1. **Dégâts** : `characterService.applyDamage()` si PV perdus
2. **Chance** : `characterService.updateStats({ chance })` si CHANCE dépensée
3. **Items** : `characterService.consumeItem()` pour chaque item utilisé

**Exemple** :
```typescript
const endCombat = useCharacterStore((state) => state.endCombat);
const combat = useCharacterStore((state) => state.combat);

const handleEndCombat = async () => {
  if (combat?.phase === 'victory' || combat?.phase === 'defeat') {
    await endCombat();
    router.push(`/characters/${characterId}`);
  }
};
```

**⚠️ Important** :
- Attendre `await` avant de naviguer ou afficher un feedback
- Les items dans `combat.usedItems[]` sont consommés dans l'ordre inverse (éviter décalage d'index)

---

### 4. `cancelCombat()`

**Annule le combat sans persister les changements.**

```typescript
cancelCombat(): void
```

- Réinitialise l'état : `combat = null`, `availableActions = []`
- Aucun dégât/chance/item n'est persisté
- Utilisé pour "Quitter sans sauvegarder"

**Exemple** :
```typescript
const cancelCombat = useCharacterStore((state) => state.cancelCombat);

const handleCancel = () => {
  if (confirm('Quitter sans sauvegarder ?')) {
    cancelCombat();
    router.push(`/characters/${characterId}`);
  }
};
```

---

### 5. `setAnimating(animating)`

**Contrôle l'état d'animation pour l'UI.**

```typescript
setAnimating(animating: boolean): void
```

- Utilisé pour désactiver les boutons pendant les animations
- L'UI doit vérifier `isAnimating` avant d'afficher les actions

**Exemple** :
```typescript
const setAnimating = useCharacterStore((state) => state.setAnimating);
const isAnimating = useCharacterStore((state) => state.isAnimating);

const playAttackAnimation = async () => {
  setAnimating(true);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Animation dés
  setAnimating(false);
};
```

---

## Phases de Combat

```typescript
type CombatPhase =
  | 'setup'          // Initialisation (non utilisé dans l'UI)
  | 'player_turn'    // Tour du joueur (choisir action)
  | 'player_attack'  // Attaque joueur en cours
  | 'enemy_turn'     // Tour de l'ennemi (pas d'input)
  | 'enemy_attack'   // Attaque ennemie en cours
  | 'round_end'      // Fin de round
  | 'victory'        // Victoire (ennemi mort)
  | 'defeat'         // Défaite (joueur mort)
```

---

## Actions Disponibles par Phase

Le `CombatEngine` calcule automatiquement les actions disponibles selon la phase :

### Phase `player_turn`

**Actions disponibles** :
- `ATTACK` : Toujours disponible
- `USE_ITEM` : Si items utilisables dans l'inventaire
- `WEAPON_ABILITY` : Si pouvoir manuel disponible (Arc, Bâton)
- `FLEE` : Si `config.canFlee === true`

**Exemple UI** :
```typescript
const combat = useCharacterStore((state) => state.combat);
const actions = useCharacterStore((state) => state.availableActions);

if (combat?.phase === 'player_turn') {
  return (
    <ActionPanel>
      {actions.map(action => (
        <ActionButton 
          key={action.type}
          action={action}
          disabled={!action.enabled}
          tooltip={action.reason}
        />
      ))}
    </ActionPanel>
  );
}
```

### Phase `enemy_attack`

**Actions disponibles** :
- `REROLL` : Si bague possédée et non utilisée
- `WEAPON_ABILITY` : Si Bâton du Sage disponible (1x)
- `SKIP` : Accepter les dégâts

**Exemple UI** :
```typescript
if (combat?.phase === 'enemy_attack' && combat.pendingDamage) {
  return (
    <DamagePanel damage={combat.pendingDamage.amount}>
      <Button onClick={() => executeAction({ type: 'weapon_ability', payload: { abilityId: 'baton-sage-negate' }})}>
        Utiliser Bâton du Sage
      </Button>
    </DamagePanel>
  );
}
```

### Phase `victory` ou `defeat`

**Actions disponibles** :
- Aucune action de combat
- Afficher modal de fin + bouton "Terminer"

**Exemple UI** :
```typescript
if (combat?.phase === 'victory') {
  return (
    <VictoryModal>
      <Button onClick={endCombat}>Terminer le combat</Button>
    </VictoryModal>
  );
}
```

---

## Exemples d'Intégration UI

### Exemple 1 : CombatArena (Composant Principal)

```typescript
'use client';

import { useCharacterStore } from '@/src/presentation/providers/character-store-provider';

export function CombatArena({ characterId }: { characterId: string }) {
  const combat = useCharacterStore((state) => state.combat);
  const executeAction = useCharacterStore((state) => state.executeAction);
  const endCombat = useCharacterStore((state) => state.endCombat);
  const cancelCombat = useCharacterStore((state) => state.cancelCombat);

  if (!combat) {
    return <div>Pas de combat actif</div>;
  }

  const handleAttack = () => {
    executeAction({ type: 'attack' });
  };

  const handleEndCombat = async () => {
    await endCombat();
    // Rediriger ou afficher feedback
  };

  return (
    <div className="fixed inset-0 bg-background">
      {/* Ennemi en haut */}
      <CombatantCard combatant={combat.enemies[combat.activeEnemyIndex]} type="enemy" />
      
      {/* Zone centrale dés/animations */}
      <DiceAnimation roll={combat.lastRoll} />
      
      {/* Joueur en bas */}
      <CombatantCard combatant={combat.player} type="player" />
      
      {/* Actions */}
      {combat.phase === 'player_turn' && (
        <ActionPanel onAttack={handleAttack} />
      )}
      
      {/* Modal victoire/défaite */}
      {combat.phase === 'victory' && (
        <VictoryModal onEnd={handleEndCombat} />
      )}
      
      {/* Bouton quitter */}
      <Button onClick={cancelCombat}>Quitter (sans sauvegarder)</Button>
    </div>
  );
}
```

### Exemple 2 : ActionPanel (Boutons d'Action)

```typescript
export function ActionPanel() {
  const actions = useCharacterStore((state) => state.availableActions);
  const executeAction = useCharacterStore((state) => state.executeAction);
  const isAnimating = useCharacterStore((state) => state.isAnimating);

  const handleAction = (action: AvailableAction) => {
    if (!action.enabled || isAnimating) return;
    
    if (action.type === 'attack') {
      executeAction({ type: 'attack' });
    } else if (action.type === 'use_item') {
      // Ouvrir modal sélection item
      openItemModal(action.payload as CombatUsableItem[]);
    }
  };

  return (
    <div className="flex gap-2 p-4">
      {actions.map(action => (
        <Button
          key={action.type}
          disabled={!action.enabled || isAnimating}
          onClick={() => handleAction(action)}
        >
          {getActionLabel(action.type)}
        </Button>
      ))}
    </div>
  );
}
```

### Exemple 3 : Utiliser un Item

```typescript
export function ItemPickerModal({ items }: { items: CombatUsableItem[] }) {
  const executeAction = useCharacterStore((state) => state.executeAction);

  const handleUseItem = (item: CombatUsableItem) => {
    executeAction({
      type: 'use_item',
      payload: { itemId: item.itemId, itemIndex: item.itemIndex }
    });
    closeModal();
  };

  return (
    <Modal>
      <h2>Choisir un objet</h2>
      {items.map(item => (
        <div key={item.itemId} onClick={() => handleUseItem(item)}>
          <p>{item.name}</p>
          <p>{item.effect}</p>
        </div>
      ))}
    </Modal>
  );
}
```

### Exemple 4 : Weapon Ability (Arc des Vents)

```typescript
export function ChanceSpendPanel() {
  const combat = useCharacterStore((state) => state.combat);
  const actions = useCharacterStore((state) => state.availableActions);
  const executeAction = useCharacterStore((state) => state.executeAction);

  const abilityAction = actions.find(a => a.type === 'weapon_ability');
  const canConvertHit = abilityAction?.enabled && 
    combat?.player.weapon.ability?.id === 'arc-vents-convert-hit';

  if (!canConvertHit) return null;

  return (
    <div className="bg-magic-blue p-4 rounded">
      <p>Attaque ratée ! Utiliser Arc des Vents pour convertir en touché ?</p>
      <p>Coût : 1 CHANCE</p>
      <Button onClick={() => executeAction({ 
        type: 'weapon_ability', 
        payload: { abilityId: 'arc-vents-convert-hit' } 
      })}>
        Convertir en Touché
      </Button>
    </div>
  );
}
```

---

## Gestion des Animations

### Pattern Recommandé

1. **Détecter un changement d'état** (nouveau dés, nouveau round)
2. **Activer `setAnimating(true)`**
3. **Jouer l'animation** (CSS, Framer Motion)
4. **Attendre la fin** (Promise, onAnimationEnd)
5. **Désactiver `setAnimating(false)`**

### Exemple avec Dice Animation

```typescript
export function DiceAnimation({ roll }: { roll?: DiceRoll }) {
  const setAnimating = useCharacterStore((state) => state.setAnimating);
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    if (!roll) return;

    setIsRolling(true);
    setAnimating(true);

    // Animation dés pendant 1 seconde
    const timeout = setTimeout(() => {
      setIsRolling(false);
      setAnimating(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [roll, setAnimating]);

  if (!roll) return null;

  return (
    <div className={isRolling ? 'animate-roll' : ''}>
      <Dice value={roll.dice1} />
      <Dice value={roll.dice2} />
      <span className="text-2xl">{roll.total}</span>
      {roll.isDouble && <Badge>DOUBLE!</Badge>}
    </div>
  );
}
```

---

## Persistence et Fin de Combat

### Flux Complet

```
Combat Start
    ↓
Player actions (attaquer, items, etc.)
    ↓
Combat State updates (immutable)
    ↓
Victory/Defeat detected
    ↓
User clicks "Terminer"
    ↓
endCombat() called
    ↓
Persist damage → updateStats → consumeItems
    ↓
combat = null
    ↓
Redirect to character page
```

### Important : Ordre de Consommation des Items

Les items sont consommés **dans l'ordre décroissant d'index** pour éviter les décalages :

```typescript
// ❌ WRONG: Consommer dans l'ordre croissant décale les index
for (const item of usedItems) {
  consumeItem(characterId, item.itemIndex); // Index invalide après la 1ère consommation
}

// ✅ CORRECT: Trier par index décroissant
const sorted = [...usedItems].sort((a, b) => b.itemIndex - a.itemIndex);
for (const item of sorted) {
  consumeItem(characterId, item.itemIndex); // Toujours valide
}
```

---

## Checklist Développement UI

### Composants Essentiels

- [ ] **CombatArena** : Layout full-screen, scroll lock
- [ ] **CombatantCard** : Affichage joueur/ennemi (PV, stats, arme)
- [ ] **ActionPanel** : Boutons d'actions contextuels par phase
- [ ] **DiceAnimation** : Animation 2d6 avec feedback visuel
- [ ] **DamageIndicator** : Flash rouge/vert pour dégâts/soins
- [ ] **ItemPickerModal** : Sélection d'item depuis inventaire
- [ ] **WeaponAbilityIndicator** : Badge pour pouvoirs disponibles
- [ ] **VictoryModal / DefeatModal** : Écrans de fin + bouton Terminer
- [ ] **CombatLog** : Historique des rounds (optionnel)

### Intégration Store

- [ ] Utiliser `useCharacterStore` pour accéder au combat
- [ ] Vérifier `combat.phase` pour afficher les bons composants
- [ ] Utiliser `availableActions` pour activer/désactiver boutons
- [ ] Gérer `isAnimating` pour désactiver input pendant animations
- [ ] Appeler `endCombat()` avec `await` avant redirection
- [ ] Confirmer avant `cancelCombat()` (perte de progression)

### Tests UI (Recommandés)

- [ ] Test render de chaque phase (setup, player_turn, victory, etc.)
- [ ] Test disabled state quand `isAnimating = true`
- [ ] Test affichage actions disponibles selon phase
- [ ] Test modal item picker avec items vides/multiples
- [ ] Test weapon ability indicator avec/sans pouvoir

---

## Références

- **Types** : `src/domain/types/combat-v2/`
- **Store** : `src/presentation/stores/slices/combatSlice.ts`
- **Engine** : `src/domain/services/combat/CombatEngine.ts`
- **Tests E2E** : `tests/integration/combat-v2-e2e.test.ts`

Pour toute question sur la logique métier, consulter les tests E2E qui couvrent tous les scénarios (460 tests passent).
