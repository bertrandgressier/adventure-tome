# Animation Architecture - Combat V3

## Vue d'ensemble

Le système d'animations du combat utilise **Framer Motion** avec une architecture séparée entre logique métier (Domain/Application) et présentation (React).

### Principe clé

```
Action utilisateur → CombatEngine (sync) → State update → React détecte changement → Animations (async)
```

**Avantages** :
- ✅ Logique pure dans le slice (pas de setTimeout)
- ✅ Animations découplées du state management
- ✅ Facile à désactiver (prefers-reduced-motion)
- ✅ Testable (animations ne bloquent pas les tests)

---

## Architecture des couches

### 1. Domain/Application Layer (combatSlice.ts)

**Responsabilité** : Gérer le state pur, auto-skip uniquement

```typescript
export interface CombatSlice {
  combat: CombatState | null;
  availableActions: AvailableAction[];
  lastActionTimestamp: number; // ← Trigger pour React
  error: string | null;
  
  executeAction(action, diceOverrides?): void;
}
```

**Mécanisme** :
- `executeAction()` :
  1. Résout l'action (CombatEngine)
  2. Auto-skip uniquement (CombatAutoPlayService) - PAS l'ennemi
  3. Update state + `lastActionTimestamp: Date.now()`
- Pas de setTimeout, tout est synchrone
- Le state reste sur `currentTurn: 'enemy'` → permet l'affichage "Tour de l'ennemi"

### 2. Presentation Layer - CombatArena (auto-play ennemi)

**Responsabilité** : Déclencher l'attaque ennemi après délai d'animation

```typescript
// Auto-play ennemi : déclencher l'attaque ennemi après les animations
useEffect(() => {
  if (!combat || isAnimating) return;
  
  const shouldAutoPlayEnemy = CombatValidator.shouldAutoPlayEnemy(combat);
  
  if (shouldAutoPlayEnemy) {
    const delay = prefersReducedMotion ? 200 : 600;
    
    const timeoutId = setTimeout(() => {
      executeAction({ type: CombatActionType.ATTACK });
    }, delay);
    
    return () => clearTimeout(timeoutId);
  }
}, [combat, isAnimating, executeAction, prefersReducedMotion]);
```

**Avantages** :
- Le state reflète la réalité : `currentTurn: 'enemy'` pendant le délai
- L'UI affiche "Tour de l'ennemi" correctement
- Le délai est géré dans la présentation (où il doit être)
- Simplicité : un seul endroit pour le setTimeout de l'ennemi

### 2. Presentation Layer - Hook (useCombatAnimations.ts)

**Responsabilité** : Observer le state et déclencher les animations

```typescript
export function useCombatAnimations(
  combat: CombatState | null,
  lastActionTimestamp: number
) {
  const [animationPhase, setAnimationPhase] = useState<CombatAnimationPhase>('idle');
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    // Nouvelle action détectée
    if (lastActionTimestamp !== lastTimestampRef.current && lastActionTimestamp > 0) {
      // Séquencer : rolling → result → damage → idle
    }
  }, [lastActionTimestamp, combat]);
  
  return { animationPhase, isAnimating, prefersReducedMotion };
}
```

**Phases d'animation** :
- `rolling` : Dés qui roulent (800ms ou 100ms)
- `result` : Affichage résultat (600ms ou 100ms)
- `damage` : Indicateur de dégâts (1500ms ou 200ms)
- `idle` : Retour au calme

**Durées respectent `prefers-reduced-motion`** :
- Standard : 800ms → 600ms → 1500ms
- Reduced : 100ms → 100ms → 200ms

### 3. Presentation Layer - Composants

#### CombatArena.tsx

```typescript
export function CombatArena({ characterId, onExit }: CombatArenaProps) {
  const combat = useCharacterStore((state) => state.combat);
  const lastActionTimestamp = useCharacterStore((state) => state.lastActionTimestamp);
  
  // Hook centralisé
  const { animationPhase, isAnimating } = useCombatAnimations(combat, lastActionTimestamp);
  
  return (
    <>
      <TurnIndicator isAnimating={isAnimating} />
      
      {/* Dés - affichés pendant rolling + result */}
      <AnimatePresence>
        {(animationPhase === 'rolling' || animationPhase === 'result') && (
          <DiceAnimation isRolling={animationPhase === 'rolling'} />
        )}
      </AnimatePresence>
      
      {/* Dégâts - affichés pendant damage */}
      <AnimatePresence>
        {animationPhase === 'damage' && <DamageIndicator />}
      </AnimatePresence>
    </>
  );
}
```

#### CombatantCard.tsx

**Barre de vie animée** (déjà existant) :

```typescript
<motion.div
  className={cn('h-full', healthInfo.barColorClass)}
  animate={{ width: `${healthInfo.healthPercent}%` }}
  transition={{
    type: prefersReducedMotion ? 'tween' : 'spring',
    stiffness: 100,
    damping: 15,
    duration: 0.5,
  }}
/>
```

**État visuel** (shake, glow, etc.) :

```typescript
const visualState = getVisualState(isActive, healthStatus, lastDamage);
// 'idle' | 'active' | 'damaged' | 'healing' | 'dead'

<motion.div
  variants={combatantCardVariants}
  initial="idle"
  animate={visualState}
/>
```

---

## Composants d'animation

### DiceAnimation

**Fichier** : `components/combat/DiceAnimation.tsx`

**Props** :
```typescript
interface DiceAnimationProps {
  diceResult: DiceRollResult | null;
  isRolling: boolean;
  outcome?: 'win' | 'lose';
}
```

**Comportement** :
- `isRolling=true` : Dés qui roulent (animation 3D)
- `isRolling=false` : Résultat statique avec outcome (vert/rouge)

### DamageIndicator

**Fichier** : `components/combat/CombatArena.tsx`

**Affichage** :
- Overlay rouge semi-transparent
- Nombre de dégâts en gros (text-6xl)
- Animation : scale 0.5→1 puis fade out + move up

### TurnIndicator

**Fichier** : `components/combat/CombatArena.tsx`

**Animations** :
- Pulse pendant `isAnimating=true`
- Icône 🎲 qui tourne
- Couleur selon le tour (primary/destructive)

---

## Flux d'une action complète

### Exemple : Joueur attaque et touche

1. **User click "Attaquer"** → `executeAction({ type: ATTACK })`

2. **combatSlice** (synchrone) :
   ```
   - CombatEngine.resolve() → jet dés, dégâts, currentTurn = 'enemy'
   - CombatAutoPlayService → auto-skip uniquement (pas l'ennemi)
   - set({ combat, lastActionTimestamp: Date.now() })
   ```

3. **useCombatAnimations** (React, asynchrone) :
   ```
   - Détecte lastActionTimestamp changé
   - setAnimationPhase('rolling')
   - setTimeout 1000ms → setAnimationPhase('result')
   - setTimeout 1800ms → setAnimationPhase('damage')
   - setTimeout 2000ms → setAnimationPhase('idle'), isAnimating = false
   ```

4. **CombatArena useEffect** (après animations) :
   ```
   - isAnimating = false ET currentTurn = 'enemy'
   - shouldAutoPlayEnemy() = true
   - setTimeout 600ms → executeAction({ type: ATTACK }) ← Ennemi attaque
   ```

5. **Nouvelle action ennemi** :
   ```
   - CombatEngine.resolve() → ennemi lance dés, fait dégâts
   - currentTurn = 'player' (retour au joueur)
   - lastActionTimestamp mis à jour → animations ennemi
   ```

6. **Pendant les animations** :
   - Le state `combat` reflète toujours la phase actuelle
   - L'historique affiche "Tour de l'ennemi" → "L'ennemi vous touche"
   - Le TurnIndicator affiche correctement le tour actif
   - Les boutons d'action sont calculés sur le state réel

---

## Avantages de cette architecture

### ✅ Séparation des responsabilités

- **Domain** : Règles de combat (CombatEngine, CombatValidator)
- **Application** : Orchestration (CombatAutoPlayService)
- **Slice** : State management pur (pas d'animations)
- **Hooks** : Coordination animations (useCombatAnimations)
- **Components** : Affichage et interactions

### ✅ Testabilité

```typescript
// Tests du slice : pas d'attente d'animations
slice.executeAction({ type: ATTACK });
expect(state.combat.enemy.endurance).toBe(8); // Immédiat
```

### ✅ Accessibilité

- Respecte `prefers-reduced-motion`
- Durées réduites à ~100-200ms si préférence activée
- ARIA live regions pour lecteurs d'écran

### ✅ Maintenabilité

- Logique d'animation centralisée dans `useCombatAnimations`
- Ajout de nouvelles animations : juste ajouter des phases
- Pas de setTimeout éparpillés dans le code

### ✅ Performance

- Animations GPU-accelerated (Framer Motion)
- State updates synchrones (pas de lag)
- `AnimatePresence` pour smooth mount/unmount

---

## Diagramme de séquence

```
User                 Slice              Hook              Components
  |                    |                 |                    |
  |--executeAction---->|                 |                    |
  |                    |---resolve------>|                    |
  |                    |   (sync)        |                    |
  |                    |<--state+ts------|                    |
  |                    |                 |                    |
  |                    |                 |<--ts changed-------|
  |                    |                 |                    |
  |                    |                 |---rolling--------->|
  |                    |                 |   (800ms)          |
  |                    |                 |                    |---<DiceAnimation>
  |                    |                 |---result---------->|
  |                    |                 |   (600ms)          |
  |                    |                 |                    |---outcome color
  |                    |                 |---damage---------->|
  |                    |                 |   (1500ms)         |
  |                    |                 |                    |---<DamageIndicator>
  |                    |                 |---idle------------>|
  |                    |                 |                    |---clean
```

---

## Modifications futures possibles

### Ajout d'une nouvelle animation

1. **Ajouter une phase** dans `CombatAnimationPhase`
2. **Modifier useCombatAnimations** pour séquencer la nouvelle phase
3. **Ajouter le composant** dans `CombatArena` avec `AnimatePresence`

Exemple :
```typescript
export type CombatAnimationPhase = 
  | 'idle' 
  | 'rolling' 
  | 'result' 
  | 'damage' 
  | 'heal'; // ← Nouvelle phase

// Dans useCombatAnimations
if (lastEntry.healAmount) {
  setTimeout(() => setAnimationPhase('heal'), HEAL_DELAY);
}

// Dans CombatArena
{animationPhase === 'heal' && <HealAnimation />}
```

### Animation de capacité d'arme

Les capacités d'arme (double roll, heal on kill, etc.) peuvent avoir leurs propres animations :

```typescript
const lastEntry = combat.history[combat.history.length - 1];
if (lastEntry.action === CombatActionType.WEAPON_ABILITY) {
  // Déclencher animation spéciale
}
```

---

## Fichiers modifiés

### Créés
- `src/presentation/hooks/useCombatAnimations.ts` (nouveau hook)

### Modifiés
- `src/presentation/stores/slices/combatSlice.ts` (+lastActionTimestamp)
- `src/presentation/components/combat/CombatArena.tsx` (réactivation animations)
- `src/presentation/components/combat/CombatArena.test.tsx` (mock lastActionTimestamp)

### Conservés (déjà animés)
- `src/presentation/components/combat/CombatantCard.tsx` (barre de vie)
- `src/presentation/components/combat/DiceAnimation.tsx` (dés 3D)
- `src/presentation/components/combat/motion.ts` (variants Framer Motion)

---

## Références

- [Framer Motion Docs](https://www.framer.com/motion/)
- [useReducedMotion](https://www.framer.com/motion/use-reduced-motion/)
- [AnimatePresence](https://www.framer.com/motion/animate-presence/)
- [AGENTS.md - Animations section](../../../AGENTS.md#animations-avec-framer-motion)
