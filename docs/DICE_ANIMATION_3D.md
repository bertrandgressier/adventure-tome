# DiceAnimation3D - Animation 3D des dés

## 📋 Description

Composant d'animation 3D réaliste pour les dés de combat, utilisant Framer Motion et CSS 3D transforms. Remplace l'animation 2D basique par une vraie simulation de cube 3D avec 6 faces visibles.

## ✨ Caractéristiques

### Animation 3D
- **Cube 3D authentique** : 6 faces avec CSS `transform-style: preserve-3d`
- **Rotation multi-axes** : rotateX, rotateY, rotateZ simultanés
- **Rebond spring** : Animation élastique vers la position finale
- **Perspective** : Vue 3D immersive avec `perspective: 1000px`

### Points visuels
- **Faces numérotées** : Dots pattern authentique (1-6)
- **Face active** : Bordure dorée + background teinté
- **Gradient** : Effet de profondeur sur chaque face
- **Shadow inset** : Rendu réaliste du cube

### Accessibilité
- ✅ **prefers-reduced-motion** : Désactivation complète des rotations
- ✅ **ARIA labels** : `role="region"` avec description
- ✅ **Performance** : 60fps même sur mobile

## 📦 API

```typescript
interface DiceAnimation3DProps {
  result: [number, number];  // Valeurs finales [1-6, 1-6]
  isRolling: boolean;         // État rolling
  onComplete?: () => void;    // Callback fin animation
}
```

## 🎨 Usage

### Basique
```tsx
<DiceAnimation3D
  result={[3, 4]}
  isRolling={false}
/>
```

### Avec callback
```tsx
<DiceAnimation3D
  result={[6, 6]}
  isRolling={false}
  onComplete={() => console.log('Animation terminée')}
/>
```

### Animation rolling
```tsx
const [isRolling, setIsRolling] = useState(true);
const [result, setResult] = useState<[number, number]>([3, 4]);

useEffect(() => {
  if (isRolling) {
    setTimeout(() => {
      setResult([rollDice(), rollDice()]);
      setIsRolling(false);
    }, 1200);
  }
}, [isRolling]);

<DiceAnimation3D
  result={result}
  isRolling={isRolling}
  onComplete={() => console.log('Terminé')}
/>
```

## 🔧 Détails techniques

### Structure du cube 3D

Chaque dé est un conteneur avec 6 faces `<div>` positionnées avec `transform`:

```css
.dice-face-front  { transform: translateZ(40px); }
.dice-face-back   { transform: rotateY(180deg) translateZ(40px); }
.dice-face-right  { transform: rotateY(90deg) translateZ(40px); }
.dice-face-left   { transform: rotateY(-90deg) translateZ(40px); }
.dice-face-top    { transform: rotateX(90deg) translateZ(40px); }
.dice-face-bottom { transform: rotateX(-90deg) translateZ(40px); }
```

### Rotation finale (par valeur)

| Valeur | rotateX | rotateY | rotateZ | Face |
|--------|---------|---------|---------|------|
| 1      | 0°      | 0°      | 0°      | Front |
| 2      | 0°      | 180°    | 0°      | Back |
| 3      | 0°      | -90°    | 0°      | Right |
| 4      | 0°      | 90°     | 0°      | Left |
| 5      | -90°    | 0°      | 0°      | Top |
| 6      | 90°     | 0°      | 0°      | Bottom |

### Animation rolling

```typescript
{
  rotateX: [0, 360, 720, 1080, 1440],
  rotateY: [0, 270, 540, 810, 1080],
  rotateZ: [0, 180, 360, 540, 720],
  scale: [1, 1.15, 1.05, 1.1, 1],
  transition: {
    duration: 1.2,
    ease: 'easeOut',
  },
}
```

### Animation result

```typescript
{
  ...getFaceRotation(value),  // Rotation finale
  scale: 1,
  transition: {
    type: 'spring',
    stiffness: 150,
    damping: 15,
  },
}
```

## 🎯 Differences avec DiceAnimation V1

| Aspect | V1 (2D) | V2 (3D) |
|--------|---------|---------|
| **Technologie** | rotateX/Y 2D | CSS 3D cube |
| **Faces** | Nombre unique | 6 faces visibles |
| **Rotation** | 2 axes | 3 axes (X, Y, Z) |
| **Perspective** | ❌ | ✅ preserve-3d |
| **Immersion** | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Complexité** | Simple | Avancée |

## 📊 Performance

- **Desktop** : 60fps constant
- **Mobile** : 60fps (testé iPhone 12, Android mid-range)
- **Reduced motion** : 0ms transitions (instant)
- **Bundle size** : +2kb (styles JSX inline)

## 🧪 Tests

30 tests couvrant :
- ✅ Rendering (3 tests)
- ✅ Rolling state (3 tests)
- ✅ Result state (5 tests)
- ✅ Dice dots (6 tests)
- ✅ Callback onComplete (3 tests)
- ✅ Accessibility (2 tests)
- ✅ 3D transforms (3 tests)
- ✅ Edge cases (4 tests)
- ✅ Reduced motion (1 test)

```bash
pnpm test DiceAnimation3D
```

## 📚 Storybook

10 stories disponibles :
- Idle / Rolling / Result states
- Low/High/Medium rolls
- Interactive demo
- Gallery (36 combinaisons)
- Reduced motion

```bash
pnpm storybook
# http://localhost:6006/?path=/story/combat-v3-diceanimation3d
```

## 🔗 Liens

- Issue: #72
- Epic: #115 (Combat V3)
- Docs Framer Motion: https://www.framer.com/motion/
- CSS 3D Transforms: https://developer.mozilla.org/en-US/docs/Web/CSS/transform-style

## 🎨 Design notes

### Responsive
- Desktop : cube 96x96px (24x24 rem)
- Mobile : cube 80x80px (20x20 rem)
- Dots : 10px → 8px

### Colors
- Border active : `hsl(var(--primary) / 0.8)`
- Background gradient : `card` → `card/0.8`
- Dots : `hsl(var(--primary))`

### Timing
- Rolling duration : 1.2s
- Spring stiffness : 150
- Spring damping : 15
- onComplete delay : 1.5s (normal) / 0.1s (reduced)

## 🚀 Future improvements

- [ ] Sons de dés (optionnel)
- [ ] Vibration mobile sur result
- [ ] Particules lors du rebond
- [ ] Shadow dynamique selon rotation
- [ ] Mode "slow motion" debug
