'use client';

import type { Character } from '@/lib/types/character';

interface CharacterInventoryProps {
  character: Character;
  onUpdate: (character: Character) => Promise<void>;
  onOpenAddItemModal?: () => void;
}

export default function CharacterInventory({ 
  character, 
  onUpdate,
  onOpenAddItemModal
}: CharacterInventoryProps) {
  const handleToggleItem = async (index: number) => {
    const updatedItems = character.inventory.items.map((item, i) =>
      i === index ? { ...item, possessed: !item.possessed } : item
    );

    const updatedCharacter = {
      ...character,
      inventory: {
        ...character.inventory,
        items: updatedItems
      },
      updatedAt: new Date().toISOString()
    };

    await onUpdate(updatedCharacter);
  };

  const handleDeleteItem = async (index: number) => {
    const item = character.inventory.items[index];
    if (!confirm(`Supprimer "${item.name}" de l'inventaire ?`)) {
      return;
    }

    const updatedItems = character.inventory.items.filter((_, i) => i !== index);

    const updatedCharacter = {
      ...character,
      inventory: {
        ...character.inventory,
        items: updatedItems
      },
      updatedAt: new Date().toISOString()
    };

    await onUpdate(updatedCharacter);
  };

  return (
    <div className="bg-[#2a1e17] glow-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-[var(--font-uncial)] text-xl tracking-wide text-light">
          Inventaire
        </h2>
        <button
          onClick={onOpenAddItemModal}
          className="text-primary hover:text-yellow-300 text-2xl transition-colors bg-primary/10 hover:bg-primary/20 rounded-lg px-3 py-1"
          title="Ajouter un objet"
        >
          ➕
        </button>
      </div>
      {character.inventory.items.length === 0 ? (
                        <span className="text-sm text-muted-light">Aucun objet dans l&apos;inventaire</span>
      ) : (
        <div className="space-y-2">
          {character.inventory.items.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 bg-[#1a140f] rounded-lg p-3 group hover:bg-[#1a140f]/80 transition-colors"
            >
              <input
                type="checkbox"
                checked={item.possessed}
                onChange={() => handleToggleItem(index)}
                className="w-5 h-5 rounded border-2 border-primary/30 bg-[#2a1e17] checked:bg-primary checked:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
              />
              <span
                className={`flex-1 font-[var(--font-merriweather)] ${
                  item.possessed ? 'text-light' : 'text-muted-light line-through'
                }`}
              >
                {item.name}
              </span>
              <button
                onClick={() => handleDeleteItem(index)}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all text-sm"
                title="Supprimer"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
