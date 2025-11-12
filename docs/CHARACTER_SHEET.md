# Fiche de personnage - La Harpe des Quatre Saisons

## Référence

Basé sur le premier livre de la collection [La Saga d'Agda](https://www.lasagadedagda.fr/) : **La Harpe des Quatre Saisons**

## Structure de la fiche

### 1. Informations de base

```typescript
{
  name: string;              // Nom du personnage
  createdAt: Date;          // Date de création
  book: "La Harpe des Quatre Saisons";
}
```

### 2. Caractéristiques principales

Selon la fiche officielle du livre :

#### HABILETÉ
- Score de combat
- Valeur initiale et valeur actuelle

#### ENDURANCE  
- Points de vie
- Valeur initiale et valeur actuelle

#### CHANCE
- Score de chance
- Valeur initiale et valeur actuelle

#### DEXTÉRITÉ
- Compétence d'adresse
- Score fixe

### 3. Possessions

#### POINTS DE VIE MAXIMUM
- Total de points de vie obtenus

#### INVENTAIRE
- Liste des objets transportés
- Cases à cocher pour les objets possédés
- **Points d'attaque des armes** : Chaque arme possède un score de points d'attaque à utiliser en combat

## Format de stockage

```typescript
interface Character {
  // Identité
  id: string;
  name: string;
  book: string;
  createdAt: string;
  updatedAt: string;
  
  // Caractéristiques (selon fiche officielle)
  stats: {
    habilete: number;
    habileteInitiale: number;
    endurance: number;
    enduranceInitiale: number;
    chance: number;
    chanceInitiale: number;
    dexterite: number;  // Score fixe
  };
  
  // Points de vie
  pointsDeVieMaximum: number;
  
  // Inventaire (cases à cocher)
  inventory: {
    items: Array<{
      name: string;
      possessed: boolean;
      attackPoints?: number;  // Points d'attaque pour les armes
      type?: 'weapon' | 'item' | 'special';
    }>;
  };
  
  // Progression (non présent sur la fiche officielle, mais nécessaire pour l'app)
  progress: {
    currentParagraph: number;
    history: number[];
    lastSaved: string;
  };
  
  // Notes (non présent sur la fiche officielle, mais utile)
## Règles de jeu

### Création du personnage

⚠️ **Important** : Ces règles doivent être vérifiées dans le livre "La Harpe des Quatre Saisons" car elles varient selon les livres de la collection.

Les règles générales de création sont :

1. **Habileté** : Méthode à définir selon le livre
2. **Endurance** : Méthode à définir selon le livre
3. **Chance** : Méthode à définir selon le livre
4. **Dextérité** : Méthode à définir selon le livre
5. **Points de Vie Maximum** : À calculer selon le livre

**Équipement de départ** : Selon les instructions spécifiques du livre
   - Sac à dos
   - Provisions (quantité selon le livre)
   - Or (montant selon le livre)
   - Équipement spécial selon les instructions du livre

### Combat

Voir le document [COMBAT.md](./COMBAT.md) pour les règles détaillées de combat.

**Résumé** :
1. Lancer 2 dés pour votre personnage + votre Habileté = Force d'Attaque
2. Lancer 2 dés pour l'adversaire + son Habileté = Force d'Attaque
3. Comparer les Forces d'Attaque :
   - La plus haute inflige 2 points de dégâts à l'autre
   - En cas d'égalité, aucun dégât
4. Recommencer jusqu'à ce que l'un des combattants tombe (Endurance = 0)

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
    "id": "uuid-v4",
    "name": "Eldric le Brave",
    "book": "La Harpe des Quatre Saisons",
    "createdAt": "2025-11-12T10:00:00Z",
    "updatedAt": "2025-11-12T14:32:00Z",
    "stats": {
      "habilete": 12,
      "habileteInitiale": 12,
      "endurance": 18,
      "enduranceInitiale": 20,
      "chance": 10,
      "chanceInitiale": 11,
      "dexterite": 8
    "inventory": {
      "items": [
        { "name": "Épée", "possessed": true, "type": "weapon", "attackPoints": 5 },
        { "name": "Bouclier", "possessed": true, "type": "item" },
        { "name": "Potion de guérison", "possessed": true, "type": "special" },
        { "name": "Dague", "possessed": false, "type": "weapon", "attackPoints": 3 },
        { "name": "Clé rouillée", "possessed": true, "type": "item" }
      ]
    },  { "name": "Clé rouillée", "possessed": true }
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