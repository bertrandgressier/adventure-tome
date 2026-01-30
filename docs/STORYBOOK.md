# Storybook pour Adventure Tome

Guide d'utilisation de Storybook pour le développement et le test des composants Combat V2.

> 📖 **Guide complet Combat V2** : [docs/STORYBOOK_COMBAT_GUIDE.md](./STORYBOOK_COMBAT_GUIDE.md)

## 🚀 Démarrage rapide

### Lancer Storybook

```bash
pnpm storybook
```

Storybook sera accessible sur `http://localhost:6006`

### Composants de démonstration

#### 🎯 **État Combat Complet** (RECOMMANDÉ ⭐)
**Affichage direct de l'interface complète par état**
- ✅ Pas de bouton à cliquer
- ✅ État pré-chargé instantanément
- ✅ Interface complète visible (combattants + actions + historique)
- ✅ 12 scénarios prêts (tour joueur, ennemi, victoire, défaite, boss, critique)

**Navigation** : Combat V2 > **État Combat Complet**

**Scénarios disponibles** :
- SimpleGoblinPlayerTurn - Combat basique tour joueur
- SimpleGoblinEnemyTurn - Tour de l'ennemi
- SimpleGoblinRolling - Animation dés
- MidCombatWithHistory - Milieu de combat avec historique
- MultipleEnemiesPlayerTurn - 3 ennemis
- BossFightPlayerTurn - Combat de boss
- CriticalHealthPlayerTurn - Santé critique
- VictoryScreen - Écran de victoire
- DefeatScreen - Écran de défaite
- RestrictedCombatPlayerTurn - Combat mortel
- Et plus...

#### 🎮 **CombatDemo** (Interactif)
Pour tester le flow complet avec bouton :
- Configuration visuelle (ennemis, options)
- Bouton "Démarrer le combat"
- Test bout en bout (nécessite store fonctionnel)

**Navigation** : Combat V2 > CombatDemo

#### 📦 Autres stories disponibles
- **CombatArena** : États directs (similaire à État Combat Complet)
- **ActionPanel** : Test des boutons d'action isolés
- **CombatLog** : Historique avec différents événements
- **CombatantCard** : Cartes joueur/ennemi
- **DiceAnimation** : Animation des dés

### Build de production

```bash
pnpm build-storybook
```

Génère un build statique dans `storybook-static/`

---

## 📚 Structure

### Stories disponibles

Toutes les stories sont organisées sous **Combat V2/**:

- **CombatArena** - Arène de combat complète avec tous les états
- **ActionPanel** - Panneau d'actions du joueur
- **CombatantCard** - Cartes joueur/ennemi avec états de santé
- **DiceAnimation** - Animation de lancer de dés
- **ItemPicker** - Sélecteur d'objets de combat
- **Helpers** - Documentation des fonctions utilitaires

### Fichiers de configuration

```
.storybook/
├── main.ts          # Configuration Storybook (addons, webpack)
├── preview.tsx      # Décorateurs globaux (CharacterStore, styles)
└── helpers/
    └── mockStore.ts # Helpers pour mocker le store Zustand
```

---

## 🎨 Utilisation

### Visualiser les composants

1. Ouvrir Storybook (`pnpm storybook`)
2. Naviguer dans l'arborescence **Combat V2/**
3. Sélectionner une story
4. Utiliser les **Controls** pour modifier les props en temps réel

### Controls interactifs

Chaque story expose des controls dans le panneau de droite:

```typescript
// Exemple: CombatantCard
export const PlayerHealthy: Story = {
  args: {
    combatant: { ... },
    type: 'player',      // Radio: player | enemy
    isActive: false,     // Boolean toggle
    lastDamage: 0,       // Number input
  },
};
```

### Actions logging

Les actions Zustand sont automatiquement loggées dans l'onglet **Actions**:

```typescript
// Dans une story
export const WithActions: Story = {
  args: {
    onExit: fn(),        // fn() de @storybook/test
  },
};
```

---

## 🧪 Tester différents états

### Mocker le store Zustand

Utilisez `createMockStore()` et `createMockCombatState()`:

```typescript
import { createMockCombatState } from '@/.storybook/helpers/mockStore';

export const PlayerTurn: Story = {
  decorators: [
    (Story) => {
      // Créer un state personnalisé
      const combatState = createMockCombatState({
        phase: 'playerTurn',
        player: {
          name: 'Héros',
          currentEndurance: 15,
          maxEndurance: 20,
          habilete: 12,
        },
      });

      // Injecter dans le store via Context
      return <Story />;
    },
  ],
};
```

### États de combat prédéfinis

Le helper `createMockCombatState()` génère un état valide par défaut:

```typescript
{
  characterId: 'test-character',
  phase: 'idle',
  round: 1,
  player: { name: 'Héros', endurance: 20, ... },
  enemies: [{ name: 'Gobelin', endurance: 6, ... }],
  config: { allowFlee: true, allowItems: true },
  history: [],
}
```

Override uniquement les propriétés nécessaires:

```typescript
createMockCombatState({
  phase: 'victory',
  player: { ...player, currentEndurance: 2 },
})
```

---

## 📝 Créer une nouvelle story

### 1. Créer le fichier `.stories.tsx`

Placer à côté du composant:

```
src/presentation/components/combat/
├── MyComponent.tsx
└── MyComponent.stories.tsx  ← Ici
```

### 2. Template de base

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';
import { fn } from '@storybook/test';

const meta = {
  title: 'Combat V2/MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'centered', // ou 'fullscreen', 'padded'
  },
  tags: ['autodocs'],
  argTypes: {
    // Définir les types de controls
    myProp: { control: 'text' },
    isActive: { control: 'boolean' },
    variant: {
      control: 'radio',
      options: ['primary', 'secondary'],
    },
  },
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * État par défaut
 */
export const Default: Story = {
  args: {
    myProp: 'valeur',
    isActive: true,
  },
};

/**
 * État alternatif avec documentation
 */
export const Variant: Story = {
  args: {
    myProp: 'autre',
    isActive: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Description détaillée de cet état.',
      },
    },
  },
};
```

### 3. Avec actions Zustand

```typescript
export const WithStoreActions: Story = {
  args: {
    onAction: fn(), // Logged dans Actions panel
  },
  decorators: [
    (Story) => {
      // Setup store si nécessaire
      return <Story />;
    },
  ],
};
```

---

## 🔍 Debugging

### Console logs du store

Le middleware `storybookDevtools` log automatiquement:

```
[Zustand] Previous state: { combat: null, ... }
[Zustand] Next state: { combat: { phase: 'idle' }, ... }
[Zustand] Partial update: { combat: { ... } }
```

### React DevTools

Storybook inclut React DevTools pour inspecter la hiérarchie des composants.

### Tester les animations

- Désactiver `prefersReducedMotion` dans les DevTools pour voir les animations
- Utiliser les Controls pour déclencher les transitions d'état

---

## ⚡ Best Practices

### 1. Isoler les composants

✅ **Bon**: Tester le composant seul avec props mockées

```typescript
export const Isolated: Story = {
  args: {
    combatant: { name: 'Test', endurance: 10 },
  },
};
```

❌ **Mauvais**: Dépendre du store global complet

### 2. Couvrir tous les états

Créer des stories pour:
- État initial
- États intermédiaires
- États d'erreur
- États edge cases (vide, plein, critique)

### 3. Documenter les stories

```typescript
export const Critical: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Affichage quand l\'endurance est < 25%',
      },
    },
  },
};
```

### 4. Respecter Clean Architecture

⚠️ **Pas de logique métier dans les stories**

```typescript
// ❌ Mauvais
const damage = Math.floor(Math.random() * 10);

// ✅ Bon
const damage = 5; // Valeur fixe pour reproductibilité
```

---

## 🐛 Troubleshooting

### "useCharacterStore must be used within CharacterStoreProvider"

Le décorateur global `withCharacterStore` dans `.storybook/preview.tsx` devrait résoudre ce problème. Si ce n'est pas le cas, ajouter un décorateur local:

```typescript
export const MyStory: Story = {
  decorators: [
    (Story) => (
      <CharacterStoreProvider>
        <Story />
      </CharacterStoreProvider>
    ),
  ],
};
```

### Styles Tailwind manquants

Vérifier que `@/app/globals.css` est importé dans `.storybook/preview.tsx`.

### Alias `@/` non résolu

Vérifier la config webpack dans `.storybook/main.ts`:

```typescript
webpackFinal: async (config) => {
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname, '../'),
  };
  return config;
},
```

---

## 📦 Addons installés

- **@storybook/addon-a11y** - Tests d'accessibilité automatiques
- **@storybook/addon-docs** - Documentation auto-générée
- **@storybook/test** - Helpers de test (`fn()`, matchers)

### Ajouter un addon

```bash
pnpm add -D @storybook/addon-nom@^10.1.11
```

Puis dans `.storybook/main.ts`:

```typescript
addons: [
  '@storybook/addon-a11y',
  '@storybook/addon-docs',
  '@storybook/addon-nom', // ← Ajouter ici
],
```

---

## 🚀 Prochaines étapes

### Fonctionnalités futures (non-scope actuel)

- [ ] Tests de régression visuelle (Chromatic)
- [ ] Stories pour composants Character (Stats, Inventory)
- [ ] Tests E2E Playwright intégrés
- [ ] Snapshot testing avec addon-storyshots

### Contribution

1. Créer une story pour chaque nouveau composant Combat
2. Documenter les états edge cases
3. Utiliser les Controls pour l'interactivité
4. Logger les actions importantes

---

## 📚 Ressources

- [Storybook Next.js Guide](https://storybook.js.org/docs/get-started/frameworks/nextjs)
- [Storybook Controls](https://storybook.js.org/docs/essentials/controls)
- [Storybook Actions](https://storybook.js.org/docs/essentials/actions)
- Projet: `docs/COMBAT_V2_UI_GUIDE.md`
- Projet: `AGENTS.md` (règles Clean Architecture)
