# Audit Combat V3 - 21 janvier 2026

## 🎯 Objectif

Synthèse de l'audit pour finaliser la migration Combat V3 et faire le ménage dans les issues/PRs.

## 📊 État des lieux actuel

### Ménage issues/PRs effectué

| Action | Élément | Statut |
|--------|---------|--------|
| ✅ Fermée | Issue #81 (Audit Framer Motion) | Résolue par PR #130 |
| ✅ Fermée | PR #122 (Epic branch vide) | Epic branch obsolète |
| ✅ Fermée | Issue #138 | Fermée par PR #139 |

### Issues ouvertes liées au Combat V3

| # | Titre | Priorité |
|---|-------|----------|
| #115 | [Epic] Combat V3 | Epic principale |
| #121 | Suite de tests E2E complète | Haute |
| #135 | Intégration V3 et suppression V2 | **CRITIQUE** |
| #75 | Audit animations Storybook | Basse |
| #76 | ChanceSpendPanel | Moyenne |
| #77 | Pouvoirs d'armes UI | Moyenne |
| #80 | CombatSetup simplifié | Moyenne |
| #83 | Documentation V3 | Basse |

## 🔴 Problème critique identifié

**Le combat ne fonctionne pas après le premier tour** car le code est dans un état hybride V2/V3.

### Fichiers avec code mixte V2/V3

| Fichier | Problème |
|---------|----------|
| `combatSlice.ts` ligne 210 | Vérifie `phase === 'enemy_turn'` mais V3 utilise `currentTurn: 'enemy'` |
| `CombatArena.tsx` | Vérifie `'player_turn'` et `'enemy_turn'` au lieu de `currentTurn` |
| `AttackResolver.ts` | Utilise `CombatPhase.PLAYER_TURN` (V2) |
| `ReactionResolver.ts` | Utilise `CombatPhase.ENEMY_TURN` (V2) |
| `WeaponAbilityResolver.ts` | Utilise `CombatPhase.PLAYER_TURN` (V2) |

### Types à nettoyer

- `src/domain/types/CombatPhase.ts` - 8 phases V2 (SETUP, PLAYER_TURN, etc.)
- `src/domain/types/CombatPhaseV3.ts` - 4 phases V3 (WAITING_ATTACK_ROLL, etc.)
- Le code utilise les deux simultanément !

### Tests cassés (20/738)

| Fichier | Cause |
|---------|-------|
| `PhaseManagerV3.test.ts` | Import `PhaseManagerV3` qui n'existe plus (renommé `PhaseManager`) |
| `CombatValidatorV3.test.ts` | Import `CombatValidatorV3` qui n'existe plus (renommé `CombatValidator`) |
| `combat-v2-e2e.test.ts` | Teste les phases V2 (`CombatPhase.PLAYER_TURN`) |
| `CombatEngine.scenarios.test.ts` | Même problème |
| `CombatEngine.global.test.ts` | Même problème |
| `history-integration.test.ts` | History non populé correctement |
| `combatSlice.test.ts` | Events mal accumulés |
| `combatUIHelpers.test.ts` | Référence à `isBoss` supprimé |

## ✅ Actions recommandées

### Phase 1 : Migration complète V3 (Issue #135 - PRIORITÉ CRITIQUE)

1. **Renommer les types** :
   - `CombatPhaseV3` → `CombatPhase`
   - Supprimer l'ancien `CombatPhase.ts` (8 phases)

2. **Adapter les Resolvers** :
   - `AttackResolver.ts` → utiliser `currentTurn` au lieu de `phase`
   - `ReactionResolver.ts` → idem
   - `WeaponAbilityResolver.ts` → idem

3. **Adapter la Slice** :
   - `combatSlice.ts` ligne 210 : `currentTurn === 'enemy'` au lieu de `phase === 'enemy_turn'`

4. **Adapter l'UI** :
   - `CombatArena.tsx` → utiliser `currentTurn`

5. **Adapter les tests** :
   - Renommer imports `PhaseManagerV3` → `PhaseManager`
   - Renommer imports `CombatValidatorV3` → `CombatValidator`
   - Mettre à jour assertions avec nouvelles phases

### Phase 2 : Tests E2E (Issue #121)

- Corriger les 20 tests cassés
- Ajouter tests items/armes légendaires
- Atteindre >90% coverage

### Phase 3 : Documentation et cleanup (Issue #83)

- Mettre à jour `docs/COMBAT.md`
- Supprimer fichiers V2 obsolètes
- Archiver ce document d'audit

## 🏗️ Architecture cible

```
CombatEngine.ts (source de vérité - stateless)
     │
     ▼
CombatState (types/combat-state.ts)
  - phase: CombatPhase (4 valeurs: waiting_attack_roll, waiting_damage_roll, turn_complete, ended)
  - currentTurn: 'player' | 'enemy'
  - history: CombatHistoryEntry[]
     │
     ▼
combatSlice.ts (orchestration)
  - Délègue au CombatEngine
  - Gère les animations
  - Auto-résout le tour ennemi
     │
     ▼
CombatArena.tsx (affichage)
  - Lit currentTurn pour savoir qui joue
  - Lit phase pour les états d'attente
```

## 🤔 Question sur l'architecture

### Moteur stateful vs stateless ?

**Situation actuelle** : 
- `CombatEngine` est stateless (pure functions)
- `CombatState` est la source de vérité
- `combatSlice` orchestre et gère l'état côté Zustand

**Avantages de l'approche actuelle** :
- Moteur testable facilement (pure functions)
- État sérialisable et persistable
- Pas de side effects dans le domaine

**Inconvénients** :
- Duplication entre `CombatState` et slice
- Animations gérées via `setTimeout` dans la slice (fragile)

**Recommandation** : Garder l'architecture actuelle mais simplifier la slice en déplaçant la logique d'animation dans un hook dédié (`useCombatAnimations`).

## 📎 Références

- Epic #115
- Issue #135 (intégration V3)
- PR #139 (dernière PR mergée)
- `docs/COMBAT.md`
- `docs/regles.md`
