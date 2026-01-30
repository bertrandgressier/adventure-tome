# Solution : Visualisation d'États Combat Sans Bouton

## Problème
- Bouton "Démarrer le combat" de `CombatDemo` non cliquable dans Storybook
- Besoin de voir l'interface complète dans différents états **instantanément**

## Solution : `CombatStateDemo` ✅

### Nouveau composant créé
**`src/presentation/components/combat/CombatStateDemo.tsx`**
- Wrapper simple autour de `CombatArena`
- Affiche directement l'interface complète
- État injecté via decorator (pas de bouton)

### 12 Stories disponibles
**Navigation Storybook** : **Combat V2 > État Combat Complet**

1. **SimpleGoblinPlayerTurn** - Combat 1v1, tour du joueur
2. **SimpleGoblinEnemyTurn** - Tour de l'ennemi  
3. **SimpleGoblinRolling** - Animation des dés
4. **MidCombatWithHistory** - Combat en cours Round 2 avec historique
5. **MultipleEnemiesPlayerTurn** - 3 ennemis (Orc, Gobelin, Loup)
6. **BossFightPlayerTurn** - Dragon (boss, pas de fuite)
7. **BossFightEnemyTurn** - Dragon attaque
8. **CriticalHealthPlayerTurn** - Joueur à 3 PV (santé critique)
9. **VictoryScreen** - Écran de victoire
10. **DefeatScreen** - Écran de défaite
11. **RestrictedCombatPlayerTurn** - Combat mortel (pas fuite ni objets)
12. **MultipleEnemiesSecondEnemy** - 2e ennemi actif (Orc vaincu)

## Ce que vous voyez dans chaque story

✅ **Interface complète instantanée** :
- Cartes des combattants (joueur + ennemi actif)
- Panneau d'actions (actif/désactivé selon le state)
- Animation des dés (si phase rolling)
- Historique des événements en bas
- Écrans spéciaux (victoire/défaite)

✅ **Pas d'interaction nécessaire** :
- Cliquez sur une story → Interface affichée immédiatement
- Changez de story → Nouvel état instantané
- Parfait pour valider l'UI et faire des captures

## Différence avec les autres composants

| Composant | Usage | Interaction |
|-----------|-------|-------------|
| **CombatStateDemo** ⭐ | Voir interface complète par état | Aucune (visuel seulement) |
| CombatDemo | Tester flow complet | Cliquer "Démarrer" |
| CombatArena | Idem que CombatStateDemo | Aucune |
| ActionPanel | Tester boutons isolés | Boutons actifs |
| CombatLog | Voir historique isolé | Scroll |

## Utilisation

```bash
pnpm storybook
```

1. Ouvrir http://localhost:6006
2. Naviguer : **Combat V2** > **État Combat Complet**
3. Cliquer sur un scénario (ex: SimpleGoblinPlayerTurn)
4. ✨ Interface complète affichée instantanément

## Fichiers modifiés/créés

### Nouveau
- `src/presentation/components/combat/CombatStateDemo.tsx`
- `src/presentation/components/combat/CombatStateDemo.stories.tsx`

### Mis à jour
- `src/presentation/components/combat/index.ts` - Export CombatStateDemo
- `docs/STORYBOOK.md` - Documentation mise à jour

## Avantages

✅ **Pas de bouton** : Affichage instantané  
✅ **12 scénarios** : Couvre tous les cas (tour joueur/ennemi, victoire, défaite, critique)  
✅ **Interface complète** : Tous les composants visibles ensemble  
✅ **Fixtures réutilisées** : Utilise `mockCombatData.ts` existant  
✅ **Facile à étendre** : Ajouter un scénario = copier/coller + modifier le state

## Exemple d'ajout de scénario

```typescript
export const MonNouveauScenario: Story = {
  args: {
    characterId: 'test-character',
    onExit: fn(),
  },
  decorators: [
    withCombatState(() =>
      createSimpleCombatState({
        phase: 'player_turn',
        player: {
          // Personnaliser l'état...
        },
      })
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Description de ce scénario',
      },
    },
  },
};
```

C'est exactement ce que vous vouliez : **voir l'état du combat avec tous ses composants** directement ! 🎉
