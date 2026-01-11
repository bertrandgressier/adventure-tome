'use client';

import { useState } from 'react';
import { Trash2, X, Minus } from 'lucide-react';
import { useCharacter } from '@/src/presentation/hooks/useCharacter';
import { useCharacterStore } from '@/src/presentation/providers/character-store-provider';
import { MAX_ITEMS, BOURSE_ITEM_ID } from '@/src/domain/value-objects/Inventory';
import { ItemTypeBadge } from './ItemTypeBadge';
import { ItemType } from '@/src/domain/types/items';
import { AddItemModal } from './AddItemModal';
import { Badge } from '@/components/ui/badge';

interface CharacterInventoryProps {
  characterId: string;
  onUpdate?: () => void;
}

export default function CharacterInventory({
  characterId,
  onUpdate,
}: CharacterInventoryProps) {
  const { character, isLoading, error, removeItem } = useCharacter(characterId);
  const addItemFromCatalog = useCharacterStore((state) => state.addItemFromCatalog);
  const addCustomItem = useCharacterStore((state) => state.addCustomItem);
  const consumeItem = useCharacterStore((state) => state.consumeItem);
  const getItemDetails = useCharacterStore((state) => state.getItemDetails);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  const handleDeleteItem = async (index: number) => {
    if (!character) return;

    const items = character.getInventory().items;
    const itemRef = items[index];
    const catalogItem = getItemDetails(itemRef);

    if (!catalogItem) return;

    if (!confirm(`Supprimer "${catalogItem.name}" de l'inventaire ?`)) {
      return;
    }

    await removeItem(index);
    setSelectedItemIndex(null);
    onUpdate?.();
  };

  const handleConsumeItem = async (index: number) => {
    if (!character) return;

    const items = character.getInventory().items;
    const itemRef = items[index];
    const catalogItem = getItemDetails(itemRef);

    if (!catalogItem) return;

    if (!confirm(`Consommer 1 "${catalogItem.name}" ?`)) {
      return;
    }

    if (itemRef.quantity <= 1) {
      await removeItem(index);
    } else {
      await consumeItem(characterId, index);
    }
    setSelectedItemIndex(null);
    onUpdate?.();
  };

  const handleItemClick = (index: number, e: React.MouseEvent) => {
    if (!character) return;
    const itemRef = character.getInventory().items[index];
    const catalogItem = getItemDetails(itemRef);

    if (catalogItem && catalogItem.id === BOURSE_ITEM_ID) return;

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
  const presentItemIds = items.filter((item) => item.possessed).map((item) => item.itemId);

  return (
    <div className="bg-card glow-border rounded-lg p-6" onClick={handleClickOutside}>
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="font-[var(--font-uncial)] text-xl tracking-wide text-light whitespace-nowrap">
            Inventaire
          </h2>
          <span className={`text-sm font-mono ${isFull ? 'text-red-400' : 'text-muted-light'} shrink-0`}>
            ({items.length}/{MAX_ITEMS})
          </span>
        </div>
        <AddItemModal
          onAddItem={async (catalogItem, quantity) => {
            if (catalogItem.id.startsWith('custom-')) {
              await addCustomItem(characterId, catalogItem.id, quantity);
            } else {
              await addItemFromCatalog(characterId, catalogItem.id, quantity);
            }
            onUpdate?.();
          }}
          disabled={isFull}
          currentTome={character.book as 1 | 2 | 3}
          presentItemIds={presentItemIds}
        />
      </div>
      {items.length === 0 ? (
        <span className="text-sm text-muted-light">Aucun objet dans l&apos;inventaire</span>
      ) : (
        <div className="space-y-2">
          {items.map((itemRef, index) => {
            const catalogItem = getItemDetails(itemRef);

            if (!catalogItem) {
              return (
                <div key={index} className="bg-background/50 rounded-lg p-3 opacity-50">
                  <span className="text-sm text-muted-light">Item inconnu: {itemRef.itemId}</span>
                  {itemRef.quantity > 1 && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      ×{itemRef.quantity}
                    </Badge>
                  )}
                </div>
              );
            }

            return (
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
                          {catalogItem.name}
                        </span>
                        {catalogItem.type === ItemType.ACTIVE && itemRef.quantity > 1 && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0">
                            ×{itemRef.quantity}
                          </Badge>
                        )}
                      </div>
                      {catalogItem.effect && (
                        <p className="text-xs text-muted-light mt-1 font-[var(--font-merriweather)]">
                          {catalogItem.effect}
                        </p>
                      )}
                    </div>
                    <ItemTypeBadge type={catalogItem.type} showLabel={false} />
                  </div>
                </div>

                 {selectedItemIndex === index && catalogItem.id !== BOURSE_ITEM_ID && (
                    <div
                      className="absolute inset-0 bg-card/95 backdrop-blur-sm rounded-lg flex items-center justify-center gap-2 z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleConsumeItem(index)}
                        className="flex items-center gap-2 px-4 py-3 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors touch-manipulation active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!catalogItem.stackable}
                      >
                        <Minus className="w-4 h-4" />
                        <span className="text-sm font-[var(--font-merriweather)]">Consommer</span>
                      </button>
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
            );
          })}
        </div>
      )}
    </div>
  );
}
