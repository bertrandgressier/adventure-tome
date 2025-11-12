export interface Character {
  id: string;
  name: string;
  book: string;
  talent: string;
  createdAt: string;
  updatedAt: string;
  
  stats: {
    dexterite: number;
    chance: number;
    chanceInitiale: number;
    pointsDeVieMax: number;
    pointsDeVieActuels: number;
  };
  
  inventory: {
    items: Array<{
      name: string;
      possessed: boolean;
      attackPoints?: number;
      type?: 'weapon' | 'item' | 'special';
    }>;
  };
  
  progress: {
    currentParagraph: number;
    history: number[];
    lastSaved: string;
  };
  
  notes: string;
}
