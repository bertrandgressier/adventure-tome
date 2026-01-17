'use client';

import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import type { CatalogItem } from '@/src/domain/types/items';
import { itemPickerVariants, itemOptionVariants } from './motion';

export interface ItemPickerProps {
  items: CatalogItem[];
  onSelect: (itemId: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function ItemPicker({ items, onSelect, onClose, isOpen }: ItemPickerProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            variants={itemPickerVariants.backdrop}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            aria-label="Fermer le sélecteur d'objets"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Sélecteur d'objets de combat"
            className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border rounded-t-xl p-4 safe-area-bottom"
            variants={itemPickerVariants.content}
            initial="hidden"
            animate="visible"
            custom={prefersReducedMotion}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-cinzel text-primary">Choisir un objet</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Fermer"
                className="h-8 w-8"
              >
                ✕
              </Button>
            </div>

            {items.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun objet utilisable disponible
              </p>
            ) : (
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {items.map((item, index) => (
                  <motion.button
                    key={item.id}
                    variants={itemOptionVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    custom={index}
                    onClick={() => {
                      onSelect(item.id);
                      onClose();
                    }}
                    className="w-full text-left p-3 bg-card border border-border rounded-lg hover:bg-primary/10 transition-colors min-h-[44px] flex items-start gap-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground">{item.name}</span>
                        {item.tome && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                            T{item.tome}
                          </span>
                        )}
                      </div>
                      {item.effect && (
                        <p className="text-sm text-muted-foreground">{item.effect}</p>
                      )}
                      {item.healAmount && (
                        <p className="text-sm text-green-500">
                          +{item.healAmount} PV
                        </p>
                      )}
      {item.damageToEnemy && (
        <p className="text-sm text-destructive">
          -{item.damageToEnemy} dégâts à l&apos;ennemi
        </p>
      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            <Button
              variant="outline"
              onClick={onClose}
              className="w-full mt-4 btn-mobile"
            >
              Annuler
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
