/**
 * Script de test pour V2: Item Type Badges
 *
 * Permet de créer un personnage de test avec tous les types d'items pour valider l'affichage des badges
 */

import { Character } from '@/src/domain/entities/Character';
// import { Inventory } from '@/src/domain/value-objects/Inventory';

/**
 * Crée un personnage de test avec des items de tous les types
 * Note: Cette fonction est prête à être utilisée mais nécessite d'être connectée au système d'inventaire
 */
export function createTestCharacterForV2(): Character {
  const character = Character.create({
    name: 'Testeur V2',
    book: 1,
    talent: 'Guerrier',
    gameMode: 'simplified',
    stats: {
      dexterite: 12,
      chance: 9,
      chanceInitiale: 9,
      pointsDeVieMax: 24,
      pointsDeVieActuels: 24
    }
  });

  return character;
}

/**
 * Liste des scénarios de test à valider manuellement
 */
export const TEST_SCENARIOS = [
  {
    name: 'Affichage des badges de type',
    description: 'Vérifier que chaque item affiche le bon badge avec la bonne icône et couleur',
    items: ['Torche (Objet)', 'Collier de charisme (Passif)', 'Potion de soin (Actif)', 'Épée courte (Arme)', 'Bague de la deuxième chance (Spécial)']
  },
  {
    name: 'Affichage des effets',
    description: 'Vérifier que la description de l\'effet s\'affiche sous le nom de l\'item',
    items: ['Tous les items avec effect']
  },
  {
    name: 'Affichage de la quantité',
    description: 'Vérifier que les items actifs avec quantité > 1 affichent "×N"',
    items: ['Potion de soin (×3)']
  },
  {
    name: 'Tooltips',
    description: 'Vérifier que les tooltips s\'affichent au survol des badges',
    items: ['Survolez chaque badge']
  },
  {
    name: 'Responsive',
    description: 'Vérifier l\'affichage sur mobile (375px)',
    items: ['Testez sur différents écrans']
  }
];
