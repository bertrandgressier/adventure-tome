'use client';

import { useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useCharacterStore } from '@/src/presentation/providers/character-store-provider';
import { CombatValidator } from '@/src/domain/services/combat/CombatValidator';
import { ItemPicker, type ItemWithQuantity } from './ItemPicker';
import { CombatActionType } from '@/src/domain/types/CombatActionType';
import { getActionMetadata } from './combatUIHelpers';
import {
  actionPanelVariants,
  actionButtonVariants,
  actionPanelContainerVariants,
} from './motion';

export interface ActionPanelProps {
  characterId: string;
  /** Si true, masque le bouton SKIP (Continuer) pendant les animations */
  isAnimating?: boolean;
}

export function ActionPanel({ characterId, isAnimating = false }: ActionPanelProps) {
  const availableActions = useCharacterStore((state) => state.availableActions);
  const executeAction = useCharacterStore((state) => state.executeAction);
  const combat = useCharacterStore((state) => state.combat);
  const characters = useCharacterStore((state) => state.characters);
  const getCharacter = (id: string) => characters[id];
  const getItem = useCharacterStore((state) => state.getItem);
  const prefersReducedMotion = useReducedMotion() ?? false;

  const [isItemPickerOpen, setIsItemPickerOpen] = useState(false);

  // Early return if no combat or combat ended
  if (!combat || CombatValidator.checkCombatEnd(combat) !== 'ongoing') {
    return null;
  }

  // Filtrer SKIP pendant les animations pour éviter les clics accidentels
  const filteredActions = isAnimating
    ? availableActions.filter(a => a.action.type !== CombatActionType.SKIP)
    : availableActions;

  const character = getCharacter(characterId);
  const inventory = character?.getInventory();

  // Compter combien de fois chaque itemIndex a été utilisé dans ce combat
  const usedItemsCount = new Map<number, number>();
  if (combat) {
    combat.usedItems.forEach(usedItem => {
      const count = usedItemsCount.get(usedItem.itemIndex) || 0;
      usedItemsCount.set(usedItem.itemIndex, count + 1);
    });
  }

  const usableItems: ItemWithQuantity[] = inventory?.items
    .map((itemRef, index) => ({ itemRef, index }))
    .filter(({ itemRef, index }) => {
      if (!itemRef.possessed || itemRef.quantity <= 0) return false;
      
      // Vérifier si toutes les quantités ont été utilisées
      const usedCount = usedItemsCount.get(index) || 0;
      return usedCount < itemRef.quantity;
    })
    .map(({ itemRef, index }) => {
      const item = getItem(itemRef.itemId);
      const usedCount = usedItemsCount.get(index) || 0;
      return item ? { item, quantity: itemRef.quantity, usedCount } : null;
    })
    .filter((entry): entry is ItemWithQuantity => 
      entry !== null && 
      (entry.item.type === 'active' || entry.item.type === 'special') &&
      (entry.item.healAmount !== undefined || entry.item.damageToEnemy !== undefined)
    ) ?? [];

  const handleAction = (actionType: CombatActionType) => {

    if (actionType === 'use_item') {
      setIsItemPickerOpen(true);
      return;
    }

    executeAction({ type: actionType });
  };

  const handleItemSelect = (itemId: string) => {
    setIsItemPickerOpen(false);
    
    // Trouver l'item dans le catalogue
    const catalogItem = getItem(itemId);
    if (!catalogItem) {
      console.error(`Item not found in catalog: ${itemId}`);
      return;
    }
    
    // Trouver l'index de l'item dans l'inventaire
    const itemIndex = inventory?.items.findIndex(ref => ref.itemId === itemId) ?? -1;
    if (itemIndex < 0) {
      console.error(`Item not found in inventory: ${itemId}`);
      return;
    }

    const inventoryItem = inventory!.items[itemIndex];
    
    // Construire le CombatUsableItem
    const combatItem = {
      id: catalogItem.id,
      name: catalogItem.name,
      itemIndex,
      quantity: inventoryItem.quantity,
      healAmount: catalogItem.healAmount,
      damageToEnemy: catalogItem.damageToEnemy,
    };
    
    executeAction({ type: 'use_item', payload: combatItem });
  };

  return (
    <>
      <motion.div
        className="flex flex-wrap gap-2 justify-center"
        variants={actionPanelContainerVariants}
        initial="hidden"
        animate="visible"
        custom={prefersReducedMotion}
      >
        <AnimatePresence mode="popLayout">
          {filteredActions.map((action, index) => {
            const actionInfo = getActionMetadata(action.action.type);
            const isWeaponAbility = action.action.type === 'weapon_ability';

            return (
              <motion.div
                key={action.action.type}
                variants={actionPanelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                custom={index}
                transition={{
                  delay: prefersReducedMotion ? 0 : index * 0.05,
                }}
              >
                <Button
                  variant="default"
                  disabled={!action.enabled}
                  onClick={() => handleAction(action.action.type as CombatActionType)}
                  className="btn-mobile min-h-[44px] relative group"
                  aria-label={actionInfo.label}
                  aria-disabled={!action.enabled}
                >
                  <motion.span
                    className="text-xl mr-2"
                    variants={actionButtonVariants}
                    animate={isWeaponAbility && action.enabled ? 'pulse' : 'idle'}
                    custom={prefersReducedMotion}
                  >
                    {actionInfo.icon}
                  </motion.span>
                  <span className="text-sm">{actionInfo.label}</span>

                  {!action.enabled && action.disabledReason && (
                    <span className="sr-only">
                      {action.disabledReason}
                    </span>
                  )}

                  {isWeaponAbility && action.enabled && (
                    <motion.div
                      className="absolute inset-0 rounded-md ring-2 ring-primary/50"
                      variants={actionButtonVariants}
                      animate="pulse"
                      custom={prefersReducedMotion}
                    />
                  )}
                </Button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {isItemPickerOpen && (
          <ItemPicker
            items={usableItems}
            onSelect={handleItemSelect}
            onClose={() => setIsItemPickerOpen(false)}
            isOpen={isItemPickerOpen}
          />
        )}
      </AnimatePresence>
    </>
  );
}
