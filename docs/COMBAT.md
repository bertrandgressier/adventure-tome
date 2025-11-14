# Système de combat - Adventure Tome

## Vue d'ensemble

Le système de combat dans "Le jeu dont tu es le héro" est basé sur des lancers de dés et la comparaison de Forces d'Attaque.

## Les règles de base

### 1. Les talents

Chaque combattant (personnage ou adversaire) possède deux caractéristiques principales pour le combat :

- **HABILETÉ** : Adresse au combat, compétence martiale
- **ENDURANCE** : Points de vie, capacité à encaisser les coups

### 2. Déroulement d'un combat

#### Phase 1 : Test pour toucher

**L'attaquant** (tour par tour) :
1. Lancez 2 dés (résultat entre 2 et 12)
2. Comparez avec votre score de **DEXTÉRITÉ**
3. **Si 2d6 ≤ DEXTÉRITÉ** : **L'attaque touche** → Passer à la Phase 2
4. **Si 2d6 > DEXTÉRITÉ** : **L'attaque rate** → Passer au prochain round

#### Phase 2 : Calcul des dégâts (si touché)

1. Lancez 1 dé (résultat entre 1 et 6)
2. **Dégâts = 1 (base) + 1d6 + Points de dommage de l'arme**
3. Exemple : 1 + 4 (dé) + 5 (arme) = **10 points de dégâts**

#### Phase 3 : Application des dégâts

1. **Déduisez les dégâts** des Points de Vie du défenseur
2. Si les Points de Vie tombent à **0 ou moins** : le combattant est **vaincu**

#### Phase 4 : Nouvel assaut

1. **Alternez l'attaquant** : si c'était vous, c'est maintenant l'adversaire (et inversement)
2. Recommencez les phases 1, 2 et 3 avec le nouvel attaquant
3. Continuez ainsi jusqu'à ce que :
   - Les **Points de Vie** de l'adversaire tombent à **0 ou moins** → **VICTOIRE**
   - Vos **Points de Vie** tombent à **0 ou moins** → **DÉFAITE** (généralement mort)
   - Le livre vous offre une option de **FUITE** (selon le paragraphe)

## Options de combat avancées

### Fuite

Certains combats permettent de **fuir** :
- Le livre vous indiquera si la fuite est possible
- Vous perdez automatiquement **2 Points de Vie** en fuyant
- Rendez-vous au paragraphe indiqué pour fuir

## Combats multiples

### Affronter plusieurs adversaires

Lorsque vous affrontez **plusieurs créatures en même temps** :

#### Méthode 1 : Combat séparé
- Combattez-les **l'une après l'autre**
- Suivez l'ordre indiqué dans le livre

#### Méthode 2 : Combat simultané
- Calculez la Force d'Attaque de **chaque adversaire** séparément
- Calculez **votre** Force d'Attaque (une seule fois)
- Comparez votre FA avec celle de chaque adversaire
- Vous subissez **les dégâts de tous les adversaires** qui vous battent lors de cet assaut
- Vous ne blessez **qu'un seul adversaire** (celui désigné dans le livre ou celui avec la FA la plus faible)

### Modificateurs de combat

### HABILETÉ et armes

Votre Force d'Attaque dépend de :
- **HABILETÉ** : Score de combat de base
- **ARME ÉQUIPÉE** : Points d'attaque de l'arme utilisée
- **Modificateurs situationnels** (voir ci-dessous)

**Formule complète** : Force d'Attaque = 2d6 + HABILETÉ + Points d'attaque de l'arme + Modificateurs

### Situations spéciales

Certaines situations peuvent **modifier temporairement** votre Force d'Attaque :
- **Combattre dans le noir** : Malus possible
- **Arme brisée** : Perte des points d'attaque de l'arme
- **Désarmé** : Combattre sans arme (0 points d'attaque)
- **Arme magique** : Bonus supplémentaires aux points d'attaque

⚠️ Ces modificateurs sont **temporaires** et ne changent pas votre Habileté initiale.

### Bonus et malus
### Situation
Vous (DEXTÉRITÉ 7, PV 32/32, CHANCE 5) avec une **Épée longue (5 points de dommage)** affrontez un **GOBELIN** (DEXTÉRITÉ 6, PV 15/15, Arme 2 pts).

### Round 1 - Vous attaquez
1. **Lancer pour toucher** : 🎲🎲 = 5 ≤ 7 (DEX) → **Touché !**
2. **Lancer de dégâts** : 🎲 = 4
3. **Dégâts** : 1 + 4 + 5 (Épée) = **10 points**
4. Le Gobelin perd 10 PV → PV : 15 - 10 = **5**

### Round 2 - Le Gobelin attaque
1. **Lancer pour toucher** : 🎲🎲 = 8 > 6 (DEX) → **Raté !**
2. Aucun dégât

### Round 3 - Vous attaquez
1. **Lancer pour toucher** : 🎲🎲 = 6 ≤ 7 (DEX) → **Touché !**
2. **Lancer de dégâts** : 🎲 = 2
3. **Dégâts** : 1 + 2 + 5 (Épée) = **8 points**
4. Le Gobelin perd 8 PV → PV : 5 - 8 = **-3** (mort)

### 🎉 VICTOIRE !
- Votre état final : DEXTÉRITÉ 7, PV 32/32, CHANCE 5, Épée longue (5 pts)
- Vous pouvez continuer votre aventure au paragraphe indiqué
### Assaut 4
1. **Votre lancer** : 🎲🎲 = 6 + 10 = **16**
2. **Lancer du Gobelin** : 🎲🎲 = 4 + 6 = **10**
3. **Résultat** : 16 > 10 → **Vous gagnez l'assaut**
4. Le Gobelin perd 2 points → ENDURANCE : 1 - 2 = **-1** (mort)

### 🎉 VICTOIRE !
- Votre état final : HABILETÉ 10, ENDURANCE 19, CHANCE 8
- Vous pouvez continuer votre aventure au paragraphe indiqué

## Interface de combat (Application)

### Affichage recommandé

```
┌─────────────────────────────────────┐
│        ⚔️ COMBAT EN COURS ⚔️         │
├─────────────────────────────────────┤
```
┌─────────────────────────────────────┐
│        ⚔️ COMBAT EN COURS ⚔️         │
├─────────────────────────────────────┤
│                                     │
│  VOUS                    GOBELIN    │
│  DEX: 7                  DEX: 6     │
│  PV: 32/32              PV: 15/15   │
│  Arme: Épée (5 pts)     Arme: 2 pts │
│                                     │
├─────────────────────────────────────┤
│           ROUND N°1                 │
│         Attaquant: VOUS             │
├─────────────────────────────────────┤
│                                     │
│  Test toucher:    [LANCER DÉS]     │
│  (2d6 ≤ DEX 7)                     │
│                                     │
│  Si touché:                         │
│  Dégâts: 1 + 1d6 + 5 (Arme)       │
│                                     │
├─────────────────────────────────────┤
│  [FUIR (-2 PV)]                    │
└─────────────────────────────────────┘
```**Affichage en temps réel** :
   - Statistiques des deux combattants
   - Numéro de l'assaut en cours
   - Historique des assauts précédents

2. **Actions disponibles** :
   - Bouton "Lancer les dés" (automatique pour adversaire)
   - Bouton "Tentez votre Chance" (après résolution d'un assaut)
   - Bouton "Fuir" (si autorisé)

3. **Feedback visuel** :
   - Animation des dés
   - Indication du gagnant de l'assaut (vert/rouge)
   - Dégâts infligés/subis avec animation
   - Barres de vie (Endurance)

4. **Historique** :
   - Liste déroulante des assauts précédents
   - Résultats de chaque lancer
   - Utilisation de la Chance

5. **Fin de combat** :
   - Écran de victoire/défaite
   - Résumé du combat
   - Bouton pour continuer l'aventure

## Calculs automatiques

### Algorithme de combat

```typescript
```typescript
interface CombatRound {
  roundNumber: number;
  attacker: 'player' | 'enemy';
  
  // Test pour toucher
  hitDiceRoll: number;           // 2d6
  hitSuccess: boolean;           // hitDiceRoll ≤ DEXTÉRITÉ
  
  // Si touché, calcul des dégâts
  damageDiceRoll?: number;       // 1d6
  weaponDamage?: number;         // Points de dommage de l'arme
  totalDamage?: number;          // 1 + 1d6 + weaponDamage
  
  playerEnduranceAfter: number;
  enemyEnduranceAfter: number;
}

function resolveCombatRound(
  roundNumber: number,
  attacker: 'player' | 'enemy',
  playerDexterite: number,
  playerEndurance: number,
  playerWeaponDamage: number,
  enemy: Enemy,
  enemyEndurance: number
): CombatRound {
  const isPlayerAttacking = attacker === 'player';
  const attackerDex = isPlayerAttacking ? playerDexterite : enemy.dexterite;
  const attackerWeapon = isPlayerAttacking ? playerWeaponDamage : enemy.attackPoints;
  
  // 1. Test pour toucher (2d6 ≤ DEXTÉRITÉ)
  const hitRoll = rollTwoDice();
  const hitSuccess = hitRoll <= attackerDex;
  
  let playerEnduranceAfter = playerEndurance;
  let enemyEnduranceAfter = enemyEndurance;
  let totalDamage: number | undefined;
  let damageRoll: number | undefined;
  
  // 2. Si touché, calculer les dégâts (1 + 1d6 + arme)
  if (hitSuccess) {
    damageRoll = rollOneDie();
    totalDamage = 1 + damageRoll + attackerWeapon;
    
    // Appliquer les dégâts
    if (isPlayerAttacking) {
      enemyEnduranceAfter = Math.max(0, enemyEndurance - totalDamage);
    } else {
      playerEnduranceAfter = Math.max(0, playerEndurance - totalDamage);
    }
  }
  
  return {
    roundNumber,
    attacker,
    hitDiceRoll: hitRoll,
    hitSuccess,
    damageDiceRoll: damageRoll,
    weaponDamage: hitSuccess ? attackerWeapon : undefined,
    totalDamage,
    playerEnduranceAfter,
    enemyEnduranceAfter
  };
}
function testLuck(currentLuck: number): boolean {
  const roll = rollTwoDice();
  return roll <= currentLuck;
}

function applyLuckToCombat(
  round: CombatRound,
  isLucky: boolean,
  damageType: 'dealt' | 'taken'
): number {
  const baseDamage = round.damageDealt;
  
  if (damageType === 'dealt') {
    // Vous avez blessé l'adversaire
    return isLucky ? baseDamage + 1 : baseDamage - 1;
  } else {
    // Vous avez été blessé
    return isLucky ? baseDamage - 1 : baseDamage + 1;
  }
}
```

## Cas spéciaux

### Mort instantanée
Certains adversaires ou situations peuvent causer la mort instantanée (Endurance = 0 immédiatement).

### Créatures immunisées
Certaines créatures ne peuvent être blessées que par des armes magiques ou des objets spéciaux.

## Conseils stratégiques

1. **Choisissez la bonne arme** : Équipez l'arme avec le plus de points de dommage
2. **Évaluez la DEXTÉRITÉ** : Plus elle est élevée, plus vous avez de chances de toucher
3. **Armes puissantes** : Les points de dommage augmentent les dégâts, pas la chance de toucher
4. **Fuyez si nécessaire** : Si l'adversaire a trop de Points de Vie ou une DEXTÉRITÉ élevée, parfois fuir (-2 PV) est la meilleure option
5. **Surveillez vos Points de Vie** : Utilisez les boulons pour acheter des objets de soin
6. **Premier attaquant** : Choisissez bien qui attaque en premier, cela peut faire la différence

1. **Évaluez avant de combattre** : Vérifiez si l'adversaire a une Habileté très élevée
2. **Gérez votre Chance** : Ne l'utilisez pas trop vite, gardez-en pour les moments critiques
3. **Fuyez si nécessaire** : Parfois, 2 points de dégâts valent mieux qu'une mort certaine
4. **Surveillez votre Endurance** : Mangez des provisions avant d'atteindre un niveau critique
5. **Objets magiques** : Utilisez-les au bon moment pour maximiser leur effet
