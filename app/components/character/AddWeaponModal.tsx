'use client';

import { useState } from 'react';

interface AddWeaponModalProps {
  onAdd: (name: string, attackPoints: number) => Promise<void>;
  onClose: () => void;
}

export default function AddWeaponModal({ onAdd, onClose }: AddWeaponModalProps) {
  const [newWeaponName, setNewWeaponName] = useState('');
  const [newWeaponAttack, setNewWeaponAttack] = useState('');

  const handleAdd = async () => {
    const attack = parseInt(newWeaponAttack);
    
    if (!newWeaponName.trim()) {
      alert('Veuillez entrer un nom d\'arme');
      return;
    }
    
    if (isNaN(attack) || attack < 0) {
      alert('Les points d\'attaque doivent être un nombre positif ou nul');
      return;
    }

    await onAdd(newWeaponName.trim(), attack);
    setNewWeaponName('');
    setNewWeaponAttack('');
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
          ⚔️ Nouvelle arme
        </h3>

        <div className="space-y-4 mb-6">
          <div>
            <label className="font-[var(--font-merriweather)] text-muted-light text-sm mb-2 block">
              Nom de l&apos;arme
            </label>
            <input
              type="text"
              value={newWeaponName}
              onChange={(e) => setNewWeaponName(e.target.value)}
              placeholder="Ex: Épée longue, Arc, Dague..."
              className="w-full bg-[#1a140f] border border-primary/20 rounded px-4 py-2 font-[var(--font-merriweather)] text-light placeholder:text-muted-light focus:outline-none focus:border-primary"
              autoFocus
            />
          </div>

          <div>
            <label className="font-[var(--font-merriweather)] text-muted-light text-sm mb-2 block">
              Points d&apos;attaque
            </label>
            <input
              type="number"
              value={newWeaponAttack}
              onChange={(e) => setNewWeaponAttack(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full bg-[#1a140f] border border-primary/20 rounded px-4 py-2 font-[var(--font-geist-mono)] text-light placeholder:text-muted-light focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-[#3a2e27] hover:bg-[#4a3e37] text-light font-[var(--font-merriweather)] font-bold px-6 py-3 rounded-lg transition-colors border border-primary/20"
          >
            Annuler
          </button>
          <button
            onClick={handleAdd}
            className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-[#1a140f] font-[var(--font-uncial)] font-bold px-6 py-3 rounded-lg transition-all shadow-[0_0_20px_rgba(255,191,0,0.8)] hover:shadow-[0_0_30px_rgba(255,191,0,1)] border-2 border-yellow-300"
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}
