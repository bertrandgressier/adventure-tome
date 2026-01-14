/**
 * CharacterDTO - Data Transfer Object
 *
 * Format de persistance pour IndexedDB.
 * Représente la structure exacte des données stockées.
 *
 * Ce type est différent de l'entité Character (domain) qui contient la logique métier.
 */
import { InventoryItemRef } from '@/src/domain/types/items';
import { TalentRef } from '@/src/domain/types/talents';

export interface CharacterDTO {
  id: string;
  name: string;
  book: number;
  talent: TalentRef;
  secondTalent?: TalentRef; // For Tome 2+
  gameMode?: 'narrative' | 'simplified' | 'mortal'; // Optional for legacy data
  version?: number; // Optional for legacy data
  createdAt: string;
  updatedAt: string;

  stats: {
    dexterite: number;
    chance: number;
    chanceInitiale: number;
    pointsDeVieMax: number;
    pointsDeVieActuels: number;
    constitution?: number; // Optional for Tome 2+
    reputation?: number; // Optional for Tome 2
  };

  inventory: {
    boulons: number;
    weapon?: {
      name: string;
      attackPoints: number;
    };
    items: InventoryItemRef[];
  };

  progress: {
    currentParagraph: number;
    history: number[];
    lastSaved: string;
    daysElapsed?: number; // Optional for Tome 2
    nextWakeUpParagraph?: number; // Optional for Tome 2
  };

  notes: string;
}
