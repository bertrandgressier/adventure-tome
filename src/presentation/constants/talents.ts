export interface Talent {
  id: string;
  name: string;
  description: string;
}

export const TALENTS: Talent[] = [
  { id: 'instinct', name: 'Instinct', description: 'Capacité à pressentir le danger et prendre les bonnes décisions' },
  { id: 'herbologie', name: 'Herbologie', description: 'Connaissance des plantes et de leurs propriétés' },
  { id: 'discretion', name: 'Discrétion', description: 'Art de se déplacer et agir sans être remarqué' },
  { id: 'persuasion', name: 'Persuasion', description: 'Capacité à convaincre et négocier' },
  { id: 'observation', name: 'Observation', description: 'Sens du détail et capacité à repérer des indices' },
  { id: 'doigts-agiles', name: 'Doigts agiles', description: 'Dextérité manuelle et agilité des mains' },
  { id: 'empratique', name: 'Empratique', description: 'Capacité à comprendre et ressentir les émotions d\'autrui' },
];

export const SECOND_TALENTS_TOME2: Talent[] = [
  { id: 'cartographe', name: 'Cartographe', description: 'Capacité à lire les cartes et s\'orienter' },
  { id: 'tueur-de-gobelin', name: 'Tueur de gobelin', description: 'Expertise contre les gobelins' },
  { id: 'instinct', name: 'Instinct', description: 'Capacité à pressentir le danger et prendre les bonnes décisions' },
];
