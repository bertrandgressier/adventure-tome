'use client';

import { useState } from 'react';
import { Trash2, Plus, X } from 'lucide-react';
import { useCharacter } from '@/src/presentation/hooks/useCharacter';
import { MAX_ITEMS, BOURSE_ITEM_NAME } from '@/src/domain/value-objects/Inventory';
import { ItemTypeBadge } from './ItemTypeBadge';
import { ItemType } from '@/src/domain/types/items';
import { Badge } from '@/components/ui/badge';

interface CharacterInventoryProps {
  characterId: string;
  onUpdate?: () => void;
  onOpenAddItemModal?: () => void;
}

export default function CharacterInventory({
  characterId,
  onUpdate,
  onOpenAddItemModal,
}: CharacterInventoryProps) {
  const { character, isLoading, error, removeItem } = useCharacter(characterId);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  const handleDeleteItem = async (index: number) => {
    if (!character) return;

    const items = character.getInventory().items;
    const item = items[index];

    if (!confirm(`Supprimer "${item.name}" de l'inventaire ?`)) {
      return;
    }

    await removeItem(index);
    setSelectedItemIndex(null);
    onUpdate?.();
  };

  const handleItemClick = (index: number, e: React.MouseEvent) => {
    if (!character) return;
    const item = character.getInventory().items[index];

    if (item.name === BOURSE_ITEM_NAME) return;

    e.stopPropagation();
    setSelectedItemIndex(selectedItemIndex === index ? null : index);
  };

  const handleClickOutside = () => {
    setSelectedItemIndex(null);
  };

  if (isLoading) {
    return (
      <div className="bg-card glow-border rounded-lg p-6">
        <p className="text-muted-light text-center">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card glow-border rounded-lg p-6">
        <p className="text-red-400 text-center">Erreur: {error}</p>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="bg-card glow-border rounded-lg p-6">
        <p className="text-muted-light text-center">Personnage non trouvé</p>
      </div>
    );
  }

  const inventory = character.getInventory();
  const items = inventory.items;
  const isFull = items.length >= MAX_ITEMS;

  return (
    <div className="bg-card glow-border rounded-lg p-6" onClick={handleClickOutside}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="font-[var(--font-uncial)] text-xl tracking-wide text-light">
            Inventaire
          </h2>
          <span className={`text-sm font-mono ${isFull ? 'text-red-400' : 'text-muted-light'}`}>
            ({items.length}/{MAX_ITEMS})
          </span>
        </div>
        <button
          onClick={onOpenAddItemModal}
          disabled={isFull}
          className={`transition-colors rounded-lg p-2 ${
            isFull
              ? 'text-muted-light bg-muted cursor-not-allowed opacity-50'
              : 'text-primary hover:text-yellow-300 bg-primary/10 hover:bg-primary/20'
          }`}
          title={isFull ? "Inventaire plein" : "Ajouter un objet"}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      {items.length === 0 ? (
        <span className="text-sm text-muted-light">Aucun objet dans l&apos;inventaire</span>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="relative"
            >
              <div
                className={`bg-background rounded-lg p-3 transition-colors cursor-pointer ${
                  selectedItemIndex === index ? 'ring-2 ring-primary/50' : 'hover:bg-background/80'
                }`}
                onClick={(e) => handleItemClick(index, e)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-[var(--font-merriweather)] text-light">
                        {item.name}
                      </span>
                      {item.type === ItemType.ACTIVE && item.quantity && item.quantity > 1 && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0">
                          ×{item.quantity}
                        </Badge>
                      )}
                    </div>
                    {item.effect && (
                      <p className="text-xs text-muted-light mt-1 font-[var(--font-merriweather)]">
                        {item.effect}
                      </p>
                    )}
                  </div>
                  <ItemTypeBadge type={item.type} showLabel={false} />
                </div>
              </div>

              {selectedItemIndex === index && item.name !== BOURSE_ITEM_NAME && (
                <div
                  className="absolute inset-0 bg-card/95 backdrop-blur-sm rounded-lg flex items-center justify-center gap-2 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleDeleteItem(index)}
                    className="flex items-center gap-2 px-4 py-3 bg-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg transition-colors touch-manipulation active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-[var(--font-merriweather)]">Supprimer</span>
                  </button>
                  <button
                    onClick={() => setSelectedItemIndex(null)}
                    className="flex items-center justify-center p-3 bg-muted/50 hover:bg-muted/70 text-muted-light rounded-lg transition-colors touch-manipulation active:scale-95"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
