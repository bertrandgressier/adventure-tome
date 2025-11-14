'use client';

import { useState } from 'react';

interface AddItemModalProps {
  onAdd: (name: string) => Promise<void>;
  onClose: () => void;
}

export default function AddItemModal({ onAdd, onClose }: AddItemModalProps) {
  const [newItemName, setNewItemName] = useState('');

  const handleAdd = async () => {
    if (!newItemName.trim()) {
      alert('Veuillez entrer un nom d\'objet');
      return;
    }

    await onAdd(newItemName.trim());
    setNewItemName('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-[#2a1e17] border-2 border-primary/50 rounded-lg p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-[var(--font-uncial)] text-3xl tracking-wide text-primary mb-6 text-center">
          📦 Nouvel objet
        </h3>

        <div className="mb-6">
          <label className="font-[var(--font-merriweather)] text-muted-light text-sm mb-2 block">
            Nom de l&apos;objet
          </label>
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
            }}
            placeholder="Ex: Potion, Clé, Parchemin..."
            className="w-full bg-[#1a140f] border border-primary/20 rounded px-4 py-2 font-[var(--font-merriweather)] text-light placeholder:text-muted-light focus:outline-none focus:border-primary"
            autoFocus
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-muted hover:bg-muted/80 text-light font-[var(--font-merriweather)] font-bold px-6 py-3 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleAdd}
            className="flex-1 bg-primary hover:bg-yellow-400 text-[#1a140f] font-[var(--font-uncial)] font-bold px-6 py-3 rounded-lg transition-colors"
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}
