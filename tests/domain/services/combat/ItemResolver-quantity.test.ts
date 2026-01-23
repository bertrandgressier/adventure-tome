import { describe, it, expect } from 'vitest';
import { ItemResolver, type CombatUsableItem } from '@/src/domain/services/combat/ItemResolver';
import type { CombatState } from '@/src/domain/types/combat-state';

/**
 * Test end-to-end pour l'utilisation d'items avec quantity > 1
 * 
 * Reproduit le bug signalé :
 * - Utilisateur a 1 item (Potion de soin) avec quantity=2
 * - Première utilisation : OK
 * - Deuxième utilisation : Erreur "already used"
 * 
 * Comportement attendu :
 * - quantity=2 permet d'utiliser l'item 2 fois dans le même combat
 * - quantity=1 bloque après la première utilisation
 */
describe('ItemResolver - Quantity Management', () => {
  const createMockCombatState = (): CombatState => ({
    player: {
      name: 'Test',
      dexterite: 12,
      endurance: 15,
      enduranceMax: 20,
      weapon: null,
      chance: 10,
    },
    enemy: {
      name: 'Goblin',
      dexterite: 8,
      endurance: 6,
      enduranceMax: 6,
    },
    roundNumber: 1,
    events: [],
    usedItems: [],
    history: [],
  });

  const potionDeSoin: CombatUsableItem = {
    id: 'potion-soin',
    name: 'Potion de soin',
    itemIndex: 0,
    healAmount: 4,
    quantity: 2, // Key: quantity > 1
  };

  it('should allow using an item twice when quantity=2', () => {
    const initialState = createMockCombatState();

    // Première utilisation
    const result1 = ItemResolver.resolve(initialState, potionDeSoin);
    expect(result1.state.usedItems).toHaveLength(1);
    expect(result1.state.usedItems[0]).toEqual({
      itemId: 'potion-soin',
      itemIndex: 0,
    });
    expect(result1.state.player.endurance).toBe(19); // 15 + 4

    // Deuxième utilisation (SHOULD NOT THROW)
    const result2 = ItemResolver.resolve(result1.state, potionDeSoin);
    expect(result2.state.usedItems).toHaveLength(2);
    expect(result2.state.player.endurance).toBe(20); // 19 + 1 (capped at max)
  });

  it('should block third usage when quantity=2', () => {
    const initialState = createMockCombatState();

    // Utiliser 2 fois
    const result1 = ItemResolver.resolve(initialState, potionDeSoin);
    const result2 = ItemResolver.resolve(result1.state, potionDeSoin);

    // Troisième tentative : SHOULD THROW
    expect(() => {
      ItemResolver.resolve(result2.state, potionDeSoin);
    }).toThrow('Potion de soin : quantité épuisée (2/2 utilisées)');
  });

  it('should block second usage when quantity=1', () => {
    const initialState = createMockCombatState();
    const singlePotion: CombatUsableItem = {
      ...potionDeSoin,
      quantity: 1,
    };

    // Première utilisation : OK
    const result1 = ItemResolver.resolve(initialState, singlePotion);
    expect(result1.state.usedItems).toHaveLength(1);

    // Deuxième tentative : SHOULD THROW
    expect(() => {
      ItemResolver.resolve(result1.state, singlePotion);
    }).toThrow('Potion de soin : quantité épuisée (1/1 utilisées)');
  });

  it('should count usages per itemIndex', () => {
    const initialState = createMockCombatState();
    
    const potion1: CombatUsableItem = {
      id: 'potion-1',
      name: 'Potion A',
      itemIndex: 0,
      healAmount: 2,
      quantity: 1,
    };

    const potion2: CombatUsableItem = {
      id: 'potion-2',
      name: 'Potion B',
      itemIndex: 1,
      healAmount: 2,
      quantity: 1,
    };

    // Utiliser potion 1
    const result1 = ItemResolver.resolve(initialState, potion1);
    expect(result1.state.usedItems).toHaveLength(1);

    // Utiliser potion 2 (itemIndex différent) : SHOULD WORK
    const result2 = ItemResolver.resolve(result1.state, potion2);
    expect(result2.state.usedItems).toHaveLength(2);
  });

  it('should handle multiple items with different quantities', () => {
    const initialState = createMockCombatState();

    const commonPotion: CombatUsableItem = {
      id: 'common-potion',
      name: 'Potion commune',
      itemIndex: 0,
      healAmount: 2,
      quantity: 3, // Peut être utilisée 3 fois
    };

    // Utiliser 3 fois : toutes OK
    const result1 = ItemResolver.resolve(initialState, commonPotion);
    const result2 = ItemResolver.resolve(result1.state, commonPotion);
    const result3 = ItemResolver.resolve(result2.state, commonPotion);

    expect(result3.state.usedItems).toHaveLength(3);

    // Quatrième tentative : SHOULD THROW
    expect(() => {
      ItemResolver.resolve(result3.state, commonPotion);
    }).toThrow('Potion commune : quantité épuisée (3/3 utilisées)');
  });
});
