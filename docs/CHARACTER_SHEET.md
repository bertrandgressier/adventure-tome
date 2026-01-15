# Fiche de personnage - La Harpe des Quatre Saisons

## Référence

Basé sur le premier livre de la collection [La Saga de Dagda](https://www.lasagadedagda.fr/) : **La Harpe des Quatre Saisons**

## Structure de la fiche

### 1. Informations de base

```typescript
{
  name: string;              // Nom du personnage
  createdAt: Date;          // Date de création
  book: 1 | 2 | 3;        // Numéro du livre
}
```

### 2. Caractéristiques principales

Selon la fiche officielle du livre :

#### TALENT
- **Tome 1** : 1 talent (liste initiale)
  - Instinct, Herbologie, Discrétion, Persuasion, Observation, Doigts agiles, Empratique
- **Tome 2+** : 1 ou 2 talents
  - Talent initial (liste ci-dessus)
  - Second talent optionnel (Cartographe, Tueur de gobelin, Instinct)
- Défini au moment de la création du personnage

#### DEXTÉRITÉ
- Compétence d'adresse et de toucher en combat
- Score fixe : 7

#### CHANCE
- Score de chance (valeur actuelle et initiale)
- Générée avec 1d6 à la création
- Se réduit à chaque utilisation

#### POINTS DE VIE
- Maximum : 2d6 × 4 (générés à la création)
- Actuels : valeur courante (réduits par les combats)

### 3. Possessions

#### BOULONS
- Monnaie utilisée dans le jeu

#### ARME ÉQUIPÉE
- Une seule arme peut être équipée à la fois
- **Points de dommage** : Chaque arme possède un score de points de dommage

#### DOMMAGES ACTUELS
- **Valeur calculée** = Points de dommage de l'arme + Bonus d'objets passifs
- Mise à jour automatique lors des changements d'équipement
- Utilisée dans la formule de dégâts : `1 + 1d6 + DOMMAGES ACTUELS`
- Peut inclure des bonus conditionnels ("+1 si combat de nuit")

#### INVENTAIRE
- Liste des objets transportés (hors armes)
- Cases à cocher pour les objets possédés

## Format de stockage

```typescript
interface Character {
  // Identité
  id: string;
  name: string;
  book: number;               // Numéro du livre (1, 2, 3)
  talent: string;              // Talent principal
  secondTalent?: string;      // Second talent (Tome 2+, optionnel)
  gameMode: 'narrative' | 'simplified' | 'mortal';
  version: number;            // Version du modèle de données (9)
  createdAt: string;
  updatedAt: string;
  
  // Caractéristiques (selon fiche officielle)
  stats: {
    dexterite: number;         // Score fixe (7 par défaut)
    chance: number;            // Score actuel de chance
    chanceInitiale: number;    // Score initial de chance
    pointsDeVieMax: number;    // Points de vie maximum (2d6 × 4)
    pointsDeVieActuels: number;// Points de vie actuels
    reputation?: number;       // Réputation (Tome 2)
  };
  
  // Inventaire
  inventory: {
    boulons: number;           // Monnaie du jeu
    weapon?: {                 // Arme équipée (une seule)
      name: string;
      attackPoints: number;    // Points de dommage de l'arme
    };
    items: Array<{             // Objets (hors armes)
      name: string;
      possessed: boolean;
      type?: 'item' | 'special';
    }>;
  };
  
  // Progression (non présent sur la fiche officielle, mais nécessaire pour l'app)
  progress: {
    currentParagraph: number;
    history: number[];
    lastSaved: string;
    daysElapsed?: number;      // Jours écoulés (Tome 2)
    nextWakeUpParagraph?: number; // Paragraphe de prochain réveil (Tome 2)
  };
  
  // Notes (non présent sur la fiche officielle, mais utile)
  notes: string;
}
## Règles de jeu

### Création du personnage

Règles pour "La Harpe des Quatre Saisons" :

1. **Nom** : Choisir le nom de votre héros
2. **Talent** : Choisir parmi Artisan, Explorateur, Guerrier, Magicien, Négociant, Voleur
3. **DEXTÉRITÉ** : 7 (valeur fixe)
4. **CHANCE** : Lancer 1d6
5. **POINTS DE VIE MAXIMUM** : Lancer 2d6 et multiplier par 4

**Équipement de départ** : À définir en début d'aventure
   - Boulons (monnaie)
   - Arme de départ avec ses points de dommage
   - Objets de départ selon les instructions du livre

### Combat

Voir le document [COMBAT.md](./COMBAT.md) pour les règles détaillées de combat.

**Résumé** :
1. L'attaquant lance 2d6 pour toucher (≤ DEXTÉRITÉ = touché)
2. Si touché : Lancer 1d6 pour les dégâts
3. Dégâts = 1 (base) + 1d6 + DOMMAGES ACTUELS (arme + objets)
4. Alterner les attaquants à chaque round
5. Recommencer jusqu'à ce que l'un des combattants tombe (Points de Vie = 0)

### Tenter sa Chance

1. Lancer 2 dés
2. Résultat ≤ Chance actuelle : **Chanceux** ✓
3. Résultat > Chance actuelle : **Malchanceux** ✗
4. **Important** : Réduire la Chance de 1 point après chaque Tentez votre Chance

**Utilisation en combat** :
- Vous pouvez Tenter votre Chance pour augmenter les dégâts infligés ou réduire les dégâts subis
- Si Chanceux : +1 point de dégât infligé OU -1 point de dégât subi
- Si Malchanceux : -1 point de dégât infligé OU +1 point de dégât subi (au choix de l'auteur)

### Restauration

#### Provisions
- Coût : 1 provision
- Restaure : 4 points d'Endurance
- Impossible de dépasser l'Endurance initiale
- Ne peut être consommée qu'en dehors des combats

#### Repos
- Selon les indications du livre
### Restauration

Selon les règles spécifiques indiquées dans le livre "La Harpe des Quatre Saisons".
## Interface utilisateur

### Écran principal du personnage

Basé sur la fiche officielle :

```
┌─────────────────────────────────┐
│ FEUILLE DE PERSONNAGE           │
│ La Harpe des Quatre Saisons     │
├─────────────────────────────────┤
│ POINTS DE VIE MAXIMUM           │
│                                 │
│ [____]                          │
│                                 │
├─────────────────────────────────┤
│ HABILETÉ         TALENT         │
│ [____]           [____]         │
│                                 │
│ CHANCE           DEXTÉRITÉ      │
│ [____]           [____]         │
│                                 │
├─────────────────────────────────┤
│ INVENTAIRE                      │
│                                 │
│ □ _________________________     │
│ □ _________________________     │
│ □ _________________________     │
│ □ _________________________     │
│ (liste déroulante...)           │
│                                 │
├─────────────────────────────────┤
│ [Combat] [Dés] [Notes]         │
│ [Sauvegarder] [Exporter]       │
└─────────────────────────────────┘
``` Sauvegarder position
- ⚔️ Lancer combat
- 🎲 Lancer dés
- 📤 Exporter personnage

### Actions rapides

- ✓ Cocher/décocher objet dans inventaire
- ➕ Ajouter objet personnalisé
- 📝 Éditer notes
### Contraintes

```typescript
const validation = {
  name: {
    minLength: 1,
    maxLength: 50,
    required: true
  },
  
  stats: {
    habilete: { min: 0, max: 99 },
    endurance: { min: 0, max: 99 },
    chance: { min: 0, max: 99 },
    dexterite: { min: 0, max: 99 }
  },
  
  pointsDeVieMaximum: { min: 0, max: 999 },
  
  inventory: {
    items: { maxItems: 100 }  // Grande liste avec cases à cocher
  },
  
  progress: {
    currentParagraph: { min: 1, max: 999 }
  }
};
```
```json
{
  "version": "1.0",
  "character": {
    "id": "uuid-v4",
```json
{
  "version": "1.0",
  "character": {
    "id": "1731412345678-abc123",
    "name": "Eldric le Brave",
    "book": "La Harpe des Quatre Saisons",
    "talent": "Guerrier",
    "createdAt": "2025-11-12T10:00:00Z",
    "updatedAt": "2025-11-12T14:32:00Z",
    "stats": {
      "dexterite": 7,
      "chance": 5,
      "chanceInitiale": 6,
      "pointsDeVieMax": 32,
      "pointsDeVieActuels": 28
    },
    "inventory": {
      "boulons": 15,
      "weapon": {
        "name": "Épée longue",
        "attackPoints": 5
      },
      "items": [
        { "name": "Bouclier", "possessed": true, "type": "item" },
        { "name": "Potion de guérison", "possessed": true, "type": "special" },
        { "name": "Clé rouillée", "possessed": true, "type": "item" }
      ]
    },
    "progress": {
      "currentParagraph": 142,
      "history": [1, 15, 23, 67, 89, 142],
      "lastSaved": "2025-11-12T14:32:00Z"
    },
    "notes": "Attention au dragon dans la salle 200!"
  }
}
```