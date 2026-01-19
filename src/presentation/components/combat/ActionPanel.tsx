'use client';

import { useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useCharacterStore } from '@/src/presentation/providers/character-store-provider';
import { ItemPicker } from './ItemPicker';
import type { CombatActionType } from '@/src/domain/types/combat-v2';
import type { CatalogItem } from '@/src/domain/types/items';
import { getActionMetadata } from './combatUIHelpers';
import {
  actionPanelVariants,
  actionButtonVariants,
  actionPanelContainerVariants,
} from './motion';

export interface ActionPanelProps {
  characterId: string;
}

export function ActionPanel({ characterId }: ActionPanelProps) {
  const availableActions = useCharacterStore((state) => state.availableActions);
  const executeAction = useCharacterStore((state) => state.executeAction);
  const isAnimating = useCharacterStore((state) => state.isAnimating);
  const combat = useCharacterStore((state) => state.combat);
  const characters = useCharacterStore((state) => state.characters);
  const getCharacter = (id: string) => characters[id];
  const getItem = useCharacterStore((state) => state.getItem);
  const prefersReducedMotion = useReducedMotion() ?? false;

  const [isItemPickerOpen, setIsItemPickerOpen] = useState(false);

  // Early return if no combat or end phases
  if (!combat || combat.phase === 'victory' || combat.phase === 'defeat') {
    return null;
  }

  const character = getCharacter(characterId);
  const inventory = character?.getInventory();

  const usableItems: CatalogItem[] = inventory?.items
    .filter(itemRef => itemRef.possessed && itemRef.quantity > 0)
    .map(itemRef => getItem(itemRef.itemId))
    .filter((item): item is CatalogItem => item !== undefined && (item.type === 'active' || item.type === 'special'))
    .filter(item => 
      item.healAmount !== undefined ||
      item.damageToEnemy !== undefined ||
      item.effect !== undefined
    ) ?? [];

  const handleAction = (actionType: CombatActionType) => {
    if (isAnimating) return;

    if (actionType === 'use_item') {
      setIsItemPickerOpen(true);
      return;
    }

    executeAction({ type: actionType });
  };

  const handleItemSelect = (itemId: string) => {
    setIsItemPickerOpen(false);
    executeAction({ type: 'use_item', payload: { itemId } });
  };

  return (
    <>
      <motion.div
        className="grid grid-cols-2 gap-2"
        variants={actionPanelContainerVariants}
        initial="hidden"
        animate="visible"
        custom={prefersReducedMotion}
      >
        <AnimatePresence mode="popLayout">
          {availableActions.map((action, index) => {
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
                  disabled={!action.enabled || isAnimating}
                  onClick={() => handleAction(action.action.type as CombatActionType)}
                  className="btn-mobile min-h-[44px] relative group"
                  aria-label={actionInfo.label}
                  aria-disabled={!action.enabled || isAnimating}
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
