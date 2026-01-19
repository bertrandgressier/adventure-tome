# Guide Storybook - Combat V2

## 📚 Vue d'ensemble

Le système de combat V2 est entièrement documenté dans Storybook avec des stories interactives pour chaque composant et scénario.

## 🚀 Démarrage

```bash
pnpm storybook
```

Ouvrir http://localhost:6006 dans votre navigateur.

## 📁 Structure des Stories

### Combat V2/CombatDemo ⭐ **RECOMMANDÉ**

**Composant de haut niveau pour tester le combat complet avec configuration**

Stories disponibles :
- `SimpleGoblin` - Combat 1v1 basique
- `MultipleEnemies` - Combat contre 3 ennemis
- `BossFight` - Combat de boss (Dragon, sans fuite)
- `DifficultFight` - Troll avec arme
- `RestrictedDuel` - Duel mortel (pas de fuite ni objets)
- `EasyFight` - 2 rats géants
- `NoItems` - Combat sans objets
- `NoFlee` - Combat sans fuite

**Usage** :
1. Sélectionner une story
2. Cliquer sur "Démarrer le combat"
3. Tester les actions, animations, victoire/défaite

### Combat V2/CombatArena

**Arène de combat complète** (affichage direct sans setup)

Stories disponibles :
- `Idle` - Pas de combat actif
- `Rolling` - Animation des dés
- `PlayerTurn` - Tour du joueur
- `EnemyTurn` - Tour de l'ennemi
- `MidCombat` - Combat en cours avec historique
- `Victory` - Écran de victoire
- `Defeat` - Écran de défaite
- `CriticalHealth` - Joueur avec faible endurance
- `MultipleEnemies` - Combat multiple

### Combat V2/ActionPanel

**Panneau d'actions de combat**

Stories disponibles :
- `AllActionsAvailable` - Toutes les actions
- `WithItemsAvailable` - Avec objets
- `FleeDisabled` - Fuite désactivée
- `ItemsDisabled` - Objets désactivés
- `DuringAnimation` - Actions désactivées (animation)
- `NoActions` - Combat restreint

### Combat V2/CombatLog

**Historique des événements de combat**

Stories disponibles :
- `Empty` - Historique vide
- `SimpleEvents` - Quelques événements
- `MultipleRounds` - Combat complet (3 rounds)
- `WithItems` - Avec utilisation d'objets
- `Defeat` - Combat perdu
- `VariedEvents` - Événements variés (doubles, capacités)

### Autres composants

- **CombatantCard** - Affichage joueur/ennemi
- **DiceAnimation** - Animation 3D des dés
- **ItemPicker** - Modal de sélection d'objets

## 🎯 Cas d'usage

### Tester une nouvelle fonctionnalité

1. Utiliser **CombatDemo** pour un test complet
2. Configurer les ennemis et options
3. Jouer le combat comme un utilisateur final

### Tester un état spécifique

1. Utiliser **CombatArena** avec decorators
2. L'état est pré-configuré (ex: santé critique, victoire)
3. Voir immédiatement le rendu

### Tester un composant isolé

1. Utiliser les stories individuelles (ActionPanel, CombatLog)
2. Vérifier le comportement isolé
3. Tester les interactions

## 🛠️ Fixtures et Helpers

### `.storybook/helpers/mockCombatData.ts`

Fonctions pour créer des états de combat :

```typescript
import {
  createSimpleCombatState,
  createMultipleEnemiesCombatState,
  createBossCombatState,
  createMidCombatState,
  createVictoryState,
  createDefeatState,
  createRestrictedCombatState,
} from '@/.storybook/helpers/mockCombatData';

// Créer un état personnalisé
const customState = createSimpleCombatState({
  phase: 'player_turn',
  player: {
    name: 'Mon Héros',
    currentEndurance: 15,
    maxEndurance: 20,
    dexterite: 14,
    weapon: { id: 'épée-magique', name: 'Épée Magique', bonus: 2 },
  },
  config: {
    allowFlee: false,
    allowItems: true,
    deathOnDefeat: true,
  },
});
```

### `.storybook/helpers/mockStore.ts`

Fonction pour créer un store mocké :

```typescript
import { createMockStore } from '@/.storybook/helpers/mockStore';

const mockStore = createMockStore({
  combat: createSimpleCombatState(),
  isAnimating: false,
});
```

## ✍️ Créer une nouvelle story

### Pour un composant existant

```typescript
// MonComposant.stories.tsx
export const NouveauScenario: Story = {
  args: {
    characterId: 'test-character',
  },
  decorators: [
    withCombatState(() =>
      createSimpleCombatState({
        // Configuration personnalisée
        phase: 'player_turn',
        enemies: [
          {
            id: 'boss-1',
            name: 'Nouveau Boss',
            currentEndurance: 30,
            maxEndurance: 30,
            dexterite: 18,
          },
        ],
      })
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Description du scénario',
      },
    },
  },
};
```

### Pour un nouveau composant

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { MonComposant } from './MonComposant';

const meta = {
  title: 'Combat V2/MonComposant',
  component: MonComposant,
  parameters: {
    layout: 'padded', // ou 'fullscreen'
    docs: {
      description: {
        component: 'Description du composant',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MonComposant>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Props par défaut
  },
};
```

## 🎨 Customisation

### Changer le theme

Les stories utilisent le thème global de l'application (`.storybook/preview.tsx`).

### Ajouter un decorator global

```typescript
// .storybook/preview.tsx
const withMyDecorator: Decorator = (Story) => (
  <div className="my-wrapper">
    <Story />
  </div>
);

const preview: Preview = {
  decorators: [withCharacterStore, withMyDecorator],
  // ...
};
```

## 📊 Tests visuels

Storybook peut être utilisé pour :
- Tests de régression visuelle (Chromatic)
- Validation manuelle des UI
- Documentation vivante
- Développement isolé de composants

## 🐛 Troubleshooting

### "Cannot read property 'combat' of undefined"

**Solution** : Vérifier que le decorator `withCombatState` est appliqué à la story.

### "Character not found"

**Solution** : Utiliser le decorator `withTestCharacter` dans CombatDemo.stories.tsx.

### Les animations ne fonctionnent pas

**Solution** : Vérifier que `AnimatePresence` et `motion` sont correctement utilisés dans le composant.

### Le store n'est pas mis à jour

**Solution** : S'assurer que le `CharacterStoreProvider` est dans les decorators globaux (`.storybook/preview.tsx`).

## 📚 Ressources

- [Storybook Docs](https://storybook.js.org/docs)
- [Testing Library](https://testing-library.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Architecture Combat V2](../docs/COMBAT_V2_UI_GUIDE.md)

## 🎯 Checklist pour nouvelle fonctionnalité

- [ ] Créer fixtures dans `mockCombatData.ts`
- [ ] Créer/mettre à jour le composant
- [ ] Créer stories avec cas nominaux
- [ ] Créer stories avec cas limites
- [ ] Ajouter JSDoc + descriptions
- [ ] Tester visuellement dans Storybook
- [ ] Ajouter tests unitaires
- [ ] Mettre à jour ce README si nécessaire
