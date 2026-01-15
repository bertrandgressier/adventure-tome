# Système de combat - Adventure Tome

> ⚠️ **SOURCE DE VÉRITÉ** : Ce document est conforme aux règles officielles de `docs/regles.md`

## Vue d'ensemble

Le système de combat dans La Saga de Dagda est basé sur des lancers de dés et la comparaison avec la **DEXTÉRITÉ**.

---

## Les règles de base

### Caractéristiques de combat

Chaque combattant possède :

- **DEXTÉRITÉ** : Adresse au combat, capacité à toucher l'adversaire
- **POINTS DE VIE** : Capacité à encaisser les coups
- **ARME** : Points de dommage supplémentaires
- **DOMMAGES ACTUELS** : Total des bonus de dégâts (voir ci-dessous)

### DOMMAGES ACTUELS (règle officielle)

> "Additionnez tous les dommages supplémentaires que vous infligez grâce à vos armes **et objets**, puis inscrivez le résultat dans la case DOMMAGES ACTUELS"

**Formule** : `DOMMAGES ACTUELS = Points de dommage de l'arme + Bonus d'objets`

Les objets peuvent donner des bonus de dommages :
- **Passifs** : +1 dommage permanent
- **Conditionnels** : "+1 dommage si le combat a lieu la nuit"

**Exemple** :
- Épée longue : +2 dommages
- Collier de force : +1 dommage
- **DOMMAGES ACTUELS = 3**

### Déroulement d'un combat

Le combat se déroule en **4 phases** qui se répètent :

#### Phase 1 : Toucher votre ennemi

1. Lancez **2 dés à six faces** (2d6)
2. Additionnez le résultat
3. **Si 2d6 ≤ DEXTÉRITÉ** → **Touché !** Passez à la Phase 2
4. **Si 2d6 > DEXTÉRITÉ** → **Raté !** Passez à la Phase 3

#### Phase 2 : Infliger des dégâts

Si vous touchez votre ennemi :

1. L'ennemi perd automatiquement **1 Point de Vie**
2. Lancez **1 dé à six faces** (1d6)
3. L'ennemi perd ce nombre de Points de Vie supplémentaires
4. Ajoutez vos **DOMMAGES ACTUELS** (arme + bonus objets)

**Formule** : `Dégâts = 1 + 1d6 + DOMMAGES ACTUELS`

#### Phase 3 : Jouer pour l'ennemi

Appliquez les mêmes règles (Phase 1 et 2) pour l'attaque de l'ennemi contre vous.

#### Phase 4 : Fin du combat

- **Victoire** : Les Points de Vie de l'ennemi tombent à 0
- **Défaite** : Vos Points de Vie tombent à 0
- Continuez les phases 1-2-3 jusqu'à la fin

---

## La CHANCE

### Réserve consommable

La CHANCE fonctionne comme une **réserve de points** que vous pouvez dépenser pour modifier le résultat d'un jet de dés.

**Règle** : Dépenser **N points de CHANCE** = ajouter **N au résultat** du jet

### Exemple

> Vous possédez 5 en CHANCE. Pour ouvrir une porte, vous devez faire 5 avec un dé : vous obtenez 3. Vous choisissez d'utiliser 2 points de CHANCE pour régler votre dé sur 5. Votre CHANCE passe de 5 à 3.

### Utilisation en combat

Vous pouvez dépenser de la CHANCE pour :
- **Augmenter un jet de dégâts** (plus de dommages)
- **Modifier un jet hors combat** (tests spéciaux)

> ⚠️ Le livre ne vous rappellera pas cette capacité. C'est à VOUS de la garder en mémoire.

---

## Combats multiples

### Règle officielle

> **Plusieurs ennemis en simultané sont considérés comme un seul adversaire plus puissant.**

Lorsque vous affrontez un groupe :
- Les ennemis sont **fusionnés** en un seul combattant
- **DEXTÉRITÉ** : Maximum du groupe
- **Points de Vie** : Somme des PV de tous les ennemis
- **Arme** : Bonus maximum du groupe

### Limite

Cette règle s'applique jusqu'à **5 adversaires simultanés**. Au-delà, le combat se déroule différemment (voir les instructions du livre).

---

## Modes de jeu

### Mode Narratif

- Les combats sont automatiquement gagnés
- Centré sur l'aventure et les décisions
- Limite : 5 adversaires maximum (au-delà, combat normal)

### Mode Simplifié

- Toutes les règles s'appliquent
- 3 sauvegardes possibles

### Mode Mortel

- Toutes les règles s'appliquent
- Mort = recommencer au chapitre 1

---

## Exemple de combat

### Situation

**Vous** : DEXTÉRITÉ 7, PV 32/32, CHANCE 5, Épée longue (+5 dommages), DOMMAGES ACTUELS: 5

**Ennemi** : GOBELIN - DEXTÉRITÉ 6, PV 15/15, Arme +2

### Round 1 - Vous attaquez

1. **Jet pour toucher** : 🎲🎲 = 5 ≤ 7 (DEX) → **Touché !**
2. **Jet de dégâts** : 🎲 = 4
3. **Dégâts** : 1 + 4 + 5 (DOMMAGES ACTUELS) = **10 points**
4. Gobelin : PV 15 → **5**

### Round 2 - Le Gobelin attaque

1. **Jet pour toucher** : 🎲🎲 = 8 > 6 (DEX) → **Raté !**
2. Aucun dégât

### Round 3 - Vous attaquez

1. **Jet pour toucher** : 🎲🎲 = 6 ≤ 7 (DEX) → **Touché !**
2. **Jet de dégâts** : 🎲 = 2
3. **Dégâts** : 1 + 2 + 5 (DOMMAGES ACTUELS) = **8 points**
4. Gobelin : PV 5 → **-3** (mort)

### 🎉 VICTOIRE !

État final : DEXTÉRITÉ 7, PV 32/32, CHANCE 5

---

## Interface de combat (Application)

### Affichage

```
┌─────────────────────────────────────┐
│        ⚔️ COMBAT EN COURS ⚔️         │
├─────────────────────────────────────┤
│                                     │
│  VOUS                    GOBELIN    │
│  DEX: 7                  DEX: 6     │
│  PV: 32/32              PV: 15/15   │
│  DOMMAGES: 5            Arme: +2    │
│  CHANCE: 5                          │
│                                     │
├─────────────────────────────────────┤
│           ROUND N°1                 │
│         Attaquant: VOUS             │
├─────────────────────────────────────┤
│                                     │
│  🎲 Jet: 5 ≤ 7 → TOUCHÉ !          │
│  💥 Dégâts: 1 + 4 + 5 = 10         │
│                                     │
│  [Dépenser CHANCE: +1 +2 +3]       │
│                                     │
├─────────────────────────────────────┤
│  [🎲 Attaquer] [🧪 Potion] [🏃 Fuir]│
└─────────────────────────────────────┘
```

### Actions disponibles

1. **Attaquer** : Lancer les dés pour toucher
2. **Utiliser un objet** : Potions, consommables
3. **Dépenser CHANCE** : Modifier un jet (+N points)
4. **Fuir** : Perdre 2 PV et quitter le combat (si autorisé)

---

## Armes légendaires (Tome 3)

Voir [armurerie-tome3.md](armurerie-tome3.md) pour les armes spéciales du Compendium.

| Arme | Bonus | Pouvoir Spécial |
|------|-------|-----------------|
| Lame de l'Aube Éternelle | +2 | Double = attaque gratuite |
| Marteau de la Terre | +1 | +1 PV à chaque kill |
| Arc des Vents | +1 | 1 CHANCE = échec → réussite |
| Dague des Ombres | +1 | +2 première attaque surprise |
| Bâton du Sage | +1 | 1x/combat : annuler dégâts |

---

## Algorithme de combat

```typescript
interface CombatRound {
  roundNumber: number;
  attacker: 'player' | 'enemy';
  
  // Test pour toucher
  hitDiceRoll: number;           // 2d6
  hitSuccess: boolean;           // hitDiceRoll ≤ DEXTÉRITÉ
  
  // Si touché, calcul des dégâts
  damageDiceRoll?: number;       // 1d6
  totalDamageBonus?: number;     // DOMMAGES ACTUELS (arme + objets)
  totalDamage?: number;          // 1 + 1d6 + DOMMAGES ACTUELS
  
  // Modificateur de CHANCE (optionnel)
  chanceSpent?: number;          // Points dépensés
  modifiedDamage?: number;       // Dégâts après modification
  
  playerEnduranceAfter: number;
  enemyEnduranceAfter: number;
}

function resolveCombatRound(
  roundNumber: number,
  attacker: 'player' | 'enemy',
  playerDexterite: number,
  playerEndurance: number,
  playerTotalDamageBonus: number,  // DOMMAGES ACTUELS (arme + objets)
  enemy: Enemy,
  enemyEndurance: number
): CombatRound {
  const isPlayerAttacking = attacker === 'player';
  const attackerDex = isPlayerAttacking ? playerDexterite : enemy.dexterite;
  const attackerDamageBonus = isPlayerAttacking ? playerTotalDamageBonus : enemy.attackPoints;
  
  // 1. Test pour toucher (2d6 ≤ DEXTÉRITÉ)
  const hitRoll = rollTwoDice();
  const hitSuccess = hitRoll <= attackerDex;
  
  let playerEnduranceAfter = playerEndurance;
  let enemyEnduranceAfter = enemyEndurance;
  let totalDamage: number | undefined;
  let damageRoll: number | undefined;
  
  // 2. Si touché, calculer les dégâts (1 + 1d6 + DOMMAGES ACTUELS)
  if (hitSuccess) {
    damageRoll = rollOneDie();
    totalDamage = 1 + damageRoll + attackerDamageBonus;
    
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
    totalDamageBonus: hitSuccess ? attackerDamageBonus : undefined,
    totalDamage,
    playerEnduranceAfter,
    enemyEnduranceAfter
  };
}
```

---

## Conseils stratégiques

1. **Optimisez vos DOMMAGES ACTUELS** : Équipez l'arme et les objets avec les meilleurs bonus
2. **Évaluez la DEXTÉRITÉ** : Plus elle est élevée, plus vous avez de chances de toucher
3. **Gérez votre CHANCE** : Réserve précieuse, à utiliser pour les moments critiques
4. **Fuyez si nécessaire** : Parfois 2 PV perdus valent mieux qu'une mort certaine
5. **Surveillez vos Points de Vie** : Utilisez les potions avant d'atteindre un niveau critique
6. **Vérifiez les bonus conditionnels** : "+1 si combat de nuit" - profitez-en !

---

## Références

- [regles.md](regles.md) - Règles officielles complètes
- [armurerie-tome3.md](armurerie-tome3.md) - Armes légendaires
- [CHARACTER_SHEET.md](CHARACTER_SHEET.md) - Structure du personnage
