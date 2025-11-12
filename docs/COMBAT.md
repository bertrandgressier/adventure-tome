# Système de combat - Adventure Hero

## Vue d'ensemble

Le système de combat dans "Le jeu dont tu es le héro" est basé sur des lancers de dés et la comparaison de Forces d'Attaque.

## Les règles de base

### 1. Les talents

Chaque combattant (personnage ou adversaire) possède deux caractéristiques principales pour le combat :

- **HABILETÉ** : Adresse au combat, compétence martiale
- **ENDURANCE** : Points de vie, capacité à encaisser les coups

### 2. Déroulement d'un combat

#### Phase 1 : Calcul des Forces d'Attaque

**Pour votre personnage :**
1. Lancez 2 dés (résultat entre 2 et 12)
2. Ajoutez votre score d'HABILETÉ actuel
3. **Ajoutez les points d'attaque de votre arme équipée**
4. **Total = FORCE D'ATTAQUE du personnage**

**Pour l'adversaire :**
1. Lancez 2 dés (résultat entre 2 et 12)
2. Ajoutez son score d'HABILETÉ (indiqué dans le livre)
3. Ajoutez ses points d'attaque (si indiqué)
4. **Total = FORCE D'ATTAQUE de l'adversaire**

#### Phase 2 : Comparaison et résolution

1. Comparez les deux Forces d'Attaque

2. **Détermination du vainqueur de l'assaut :**
   - Si votre Force d'Attaque > Force d'Attaque adverse : **VOUS gagnez l'assaut**
   - Si Force d'Attaque adverse > votre Force d'Attaque : **L'ADVERSAIRE gagne l'assaut**
   - Si les Forces d'Attaque sont **égales** : **AUCUN dégât** (vous esquivez tous les deux)

3. **Application des dégâts :**
   - Le perdant de l'assaut perd **2 points d'ENDURANCE**
   - Déduisez immédiatement ces points du total d'Endurance

#### Phase 3 : Nouvel assaut

1. Recommencez les phases 1 et 2
2. Continuez ainsi jusqu'à ce que :
   - L'ENDURANCE de l'adversaire tombe à **0 ou moins** → **VICTOIRE**
   - Votre ENDURANCE tombe à **0 ou moins** → **DÉFAITE** (généralement mort)
   - Le livre vous offre une option de **FUITE** (selon le paragraphe)

## Options de combat avancées

### Tentez votre Chance en combat

Vous pouvez **Tenter votre Chance** pour influencer le résultat d'un assaut :

#### Quand l'utiliser ?

1. **Après avoir blessé un adversaire** (pour infliger plus de dégâts)
2. **Après avoir été blessé** (pour réduire les dégâts subis)

#### Comment ça marche ?

**Si vous blessez l'adversaire :**
- Lancez 2 dés
- Si résultat ≤ votre CHANCE actuelle → **Chanceux**
  - Dégâts infligés : **3 points** au lieu de 2 (dégât supplémentaire)
- Si résultat > votre CHANCE actuelle → **Malchanceux**
  - Dégâts infligés : **1 point** seulement au lieu de 2 (coup moins efficace)

**Si vous êtes blessé :**
- Lancez 2 dés
- Si résultat ≤ votre CHANCE actuelle → **Chanceux**
  - Dégâts subis : **1 point** au lieu de 2 (vous parez partiellement)
- Si résultat > votre CHANCE actuelle → **Malchanceux**
  - Dégâts subis : **3 points** au lieu de 2 (le coup est plus grave)

⚠️ **Important :** Après chaque Tentez votre Chance, réduisez votre score de CHANCE de **1 point**.

### Fuite

Certains combats permettent de **fuir** après un certain nombre d'assauts :
- Le livre vous indiquera si la fuite est possible
- Généralement, vous pouvez fuir après le premier assaut
- L'adversaire vous inflige automatiquement **2 points de dégâts** dans le dos
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
Vous (HABILETÉ 10, ENDURANCE 20, CHANCE 9) avec une **Épée (5 points d'attaque)** affrontez un **GOBELIN** (HABILETÉ 6, ENDURANCE 5, Points d'attaque 2).

### Assaut 1
1. **Votre lancer** : 🎲🎲 = 7 + 10 (HAB) + 5 (Épée) = **22** (Force d'Attaque)
2. **Lancer du Gobelin** : 🎲🎲 = 5 + 6 (HAB) + 2 (Arme) = **13** (Force d'Attaque)
3. **Résultat** : 22 > 13 → **Vous gagnez l'assaut**
4. Le Gobelin perd 2 points → ENDURANCE : 5 - 2 = **3**

### Assaut 2
1. **Votre lancer** : 🎲🎲 = 4 + 10 + 5 = **19**
2. **Lancer du Gobelin** : 🎲🎲 = 9 + 6 + 2 = **17**
3. **Résultat** : 19 > 17 → **Vous gagnez l'assaut**
4. Le Gobelin perd 2 points → ENDURANCE : 3 - 2 = **1**

### Assaut 3
1. **Votre lancer** : 🎲🎲 = 3 + 10 + 5 = **18**
2. **Lancer du Gobelin** : 🎲🎲 = 10 + 6 + 2 = **18**
3. **Résultat** : 18 = 18 → **Égalité, aucun dégât**

### Assaut 4
1. **Votre lancer** : 🎲🎲 = 6 + 10 + 5 = **21**
2. **Lancer du Gobelin** : 🎲🎲 = 4 + 6 + 2 = **12**
3. **Résultat** : 21 > 12 → **Vous gagnez l'assaut**
4. Le Gobelin perd 2 points → ENDURANCE : 1 - 2 = **-1** (mort)

### 🎉 VICTOIRE !
- Votre état final : HABILETÉ 10, ENDURANCE 20, CHANCE 9, Épée (5 pts)
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
│  HAB: 10                 HAB: 6     │
│  END: 20/20             END: 5/5    │
│  Arme: Épée (5 pts)     Arme: 2 pts │
│                                     │
├─────────────────────────────────────┤
│           ASSAUT N°1                │
├─────────────────────────────────────┤
│                                     │
│  Votre lancer:     [LANCER DÉS]    │
│  Force d'Attaque:  --               │
│  (2d6 + HAB 10 + Arme 5)           │
│                                     │
│  Adversaire:       (auto)           │
│  Force d'Attaque:  --               │
│  (2d6 + HAB 6 + Arme 2)            │
│                                     │
├─────────────────────────────────────┤
│  [TENTEZ VOTRE CHANCE]  [FUIR]     │
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
  playerDiceRoll: number;
  playerAttackStrength: number;
  playerWeaponPoints: number;  // Points d'attaque de l'arme
  enemyDiceRoll: number;
  enemyAttackStrength: number;
  enemyWeaponPoints: number;
  winner: 'player' | 'enemy' | 'draw';
  damageDealt: number;
  luckUsed: boolean;
  luckResult?: 'lucky' | 'unlucky';
  adjustedDamage?: number;
}

function resolveCombatRound(
  playerSkill: number,
  playerStamina: number,
  playerWeaponPoints: number,  // Nouveau paramètre
  enemySkill: number,
  enemyStamina: number,
  enemyWeaponPoints: number    // Nouveau paramètre
): CombatRound {
  // 1. Lancer les dés
  const playerRoll = rollTwoDice(); // 2d6
  const enemyRoll = rollTwoDice();
  
  // 2. Calculer Forces d'Attaque (avec armes)
  const playerAS = playerRoll + playerSkill + playerWeaponPoints;
  const enemyAS = enemyRoll + enemySkill + enemyWeaponPoints;
  
  // 3. Déterminer le gagnant
  let winner: 'player' | 'enemy' | 'draw';
  let damageDealt = 0;
  
  if (playerAS > enemyAS) {
    winner = 'player';
    damageDealt = 2;
    enemyStamina -= damageDealt;
  } else if (enemyAS > playerAS) {
    winner = 'enemy';
    damageDealt = 2;
    playerStamina -= damageDealt;
  } else {
    winner = 'draw';
  }
  
  return {
    roundNumber,
    playerDiceRoll: playerRoll,
    playerAttackStrength: playerAS,
    playerWeaponPoints,
    enemyDiceRoll: enemyRoll,
    enemyAttackStrength: enemyAS,
    enemyWeaponPoints,
    winner,
    damageDealt,
    luckUsed: false
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

1. **Choisissez la bonne arme** : Équipez l'arme avec le plus de points d'attaque
2. **Évaluez avant de combattre** : Comparez votre Force d'Attaque totale (HAB + Arme) avec celle de l'adversaire
3. **Gérez votre Chance** : Ne l'utilisez pas trop vite, gardez-en pour les moments critiques
4. **Fuyez si nécessaire** : Si l'adversaire a beaucoup plus de points d'attaque, parfois fuir est la meilleure option
5. **Surveillez votre Endurance** : Récupérez selon les règles du livre avant d'atteindre un niveau critique
6. **Objets magiques** : Certaines armes magiques ont des points d'attaque très élevés
7. **Arme cassée** : Ayez toujours une arme de secours dans votre inventaire

1. **Évaluez avant de combattre** : Vérifiez si l'adversaire a une Habileté très élevée
2. **Gérez votre Chance** : Ne l'utilisez pas trop vite, gardez-en pour les moments critiques
3. **Fuyez si nécessaire** : Parfois, 2 points de dégâts valent mieux qu'une mort certaine
4. **Surveillez votre Endurance** : Mangez des provisions avant d'atteindre un niveau critique
5. **Objets magiques** : Utilisez-les au bon moment pour maximiser leur effet
