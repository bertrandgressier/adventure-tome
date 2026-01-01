/**
 * Item Types - Domain Types
 * 
 * Définit les types pour les items du catalogue et l'inventaire
 * Inspiré du glossaire des objets des 3 tomes de la Saga de Dagda
 */

/**
 * Type d'item selon sa classification
 */
export enum ItemType {
  BASIC = 'basic',       // Objets simples sans effet (torche, clé, bourse)
  PASSIVE = 'passive',   // Objets qui donnent des bonus permanents (collier +2 CHANCE)
  ACTIVE = 'active',     // Consommables (potion +5 PV, pomme +2 PV)
  WEAPON = 'weapon',     // Armes avec bonus de dégâts (épée +1, arc)
  SPECIAL = 'special'    // Objets magiques avec effets complexes (bague 2ème chance, anneau des échos)
}

/**
 * Bonus de stats pour les items passifs
 */
export interface StatBonus {
  dexterite?: number;
  chance?: number;
  vie?: number;
  pvMax?: number;
}

/**
 * Item du catalogue (définition de l'item)
 */
export interface CatalogItem {
  id: string;              // ex: "tome1-potion-soin"
  name: string;
  type: ItemType;
  tome: 1 | 2 | 3;
  paragraph?: number;
  effect?: string;         // Description des effets en texte
  stackable?: boolean;     // Pour items actifs (potions)
  unique?: boolean;        // Pour items spéciaux
  disappearsOnTimeLoop?: boolean; // Pour Tome3 - items qui disparaissent lors des resets temporels
  attackPoints?: number;   // Pour armes
  healAmount?: number;     // Pour consommables
  damageToEnemy?: number;  // Pour potions offensives
  statBonus?: StatBonus;   // Pour passifs
  isQuestItem?: boolean;   // Pour items de quête
}

/**
 * Item dans l'inventaire d'un personnage
 */
export interface InventoryItem {
  id: string;
  name: string;
  type: ItemType;
  possessed: boolean;
  effect?: string;

  // Nouveaux champs
  quantity?: number;                    // Pour items actifs stackables
  stackable?: boolean;                 // Pour items actifs
  unique?: boolean;                    // Pour items spéciaux
  disappearsOnTimeLoop?: boolean;      // Pour Tome 3

  // Champs optionnels selon le type
  attackPoints?: number;                // Pour armes
  healAmount?: number;                  // Pour consommables
  statBonus?: StatBonus;               // Pour passifs
  isQuestItem?: boolean;               // Pour items de quête
}
