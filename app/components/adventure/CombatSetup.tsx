'use client';

import { useState } from 'react';
import type { Enemy } from '@/lib/types/combat';

interface CombatSetupProps {
  onStartCombat: (enemy: Enemy, mode: 'auto' | 'manual') => void;
  onCancel: () => void;
}

export default function CombatSetup({ onStartCombat, onCancel }: CombatSetupProps) {
  const [enemyName, setEnemyName] = useState('');
  const [dexterite, setDexterite] = useState('');
  const [endurance, setEndurance] = useState('');
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');

  const handleStart = () => {
    const dex = parseInt(dexterite);
    const end = parseInt(endurance);

    if (!enemyName.trim() || isNaN(dex) || isNaN(end)) {
      alert('Veuillez remplir tous les champs correctement');
      return;
    }

    if (dex < 1 || end < 1) {
      alert('Les valeurs doivent être positives');
      return;
    }

    const enemy: Enemy = {
      name: enemyName.trim(),
      dexterite: dex,
      endurance: end,
      enduranceMax: end
    };

    onStartCombat(enemy, mode);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={(e) => {
      if (e.target === e.currentTarget) onCancel();
    }}>
      <div className="bg-[#2a1e17] border-2 border-primary/50 rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-[var(--font-uncial)] text-3xl tracking-wide text-primary mb-6 text-center">
          ⚔️ Nouveau Combat
        </h3>

        <div className="space-y-4 mb-6">
          {/* Nom de l'adversaire */}
          <div>
            <label className="font-[var(--font-merriweather)] text-muted-light text-sm mb-2 block">
              Nom de l'adversaire
            </label>
            <input
              type="text"
              value={enemyName}
              onChange={(e) => setEnemyName(e.target.value)}
              placeholder="Ex: Gobelin, Orc, Dragon..."
              className="w-full bg-[#1a140f] border border-primary/20 rounded px-4 py-2 font-[var(--font-merriweather)] text-light placeholder:text-muted-light focus:outline-none focus:border-primary"
              autoFocus
            />
          </div>

          {/* Dextérité */}
          <div>
            <label className="font-[var(--font-merriweather)] text-muted-light text-sm mb-2 block">
              DEXTÉRITÉ
            </label>
            <input
              type="number"
              value={dexterite}
              onChange={(e) => setDexterite(e.target.value)}
              placeholder="Score de combat"
              min="1"
              className="w-full bg-[#1a140f] border border-primary/20 rounded px-4 py-2 font-[var(--font-geist-mono)] text-light placeholder:text-muted-light focus:outline-none focus:border-primary"
            />
          </div>

          {/* Endurance */}
          <div>
            <label className="font-[var(--font-merriweather)] text-muted-light text-sm mb-2 block">
              ENDURANCE (Points de vie)
            </label>
            <input
              type="number"
              value={endurance}
              onChange={(e) => setEndurance(e.target.value)}
              placeholder="Points de vie"
              min="1"
              className="w-full bg-[#1a140f] border border-primary/20 rounded px-4 py-2 font-[var(--font-geist-mono)] text-light placeholder:text-muted-light focus:outline-none focus:border-primary"
            />
          </div>

          {/* Mode de combat */}
          <div>
            <label className="font-[var(--font-merriweather)] text-muted-light text-sm mb-2 block">
              Mode de combat
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setMode('auto')}
                className={`flex-1 px-4 py-3 rounded-lg font-[var(--font-uncial)] font-bold transition-colors ${
                  mode === 'auto'
                    ? 'bg-primary text-[#1a140f]'
                    : 'bg-[#1a140f] border border-primary/20 text-muted-light hover:border-primary/40'
                }`}
              >
                ⚡ Auto
              </button>
              <button
                onClick={() => setMode('manual')}
                className={`flex-1 px-4 py-3 rounded-lg font-[var(--font-uncial)] font-bold transition-colors ${
                  mode === 'manual'
                    ? 'bg-primary text-[#1a140f]'
                    : 'bg-[#1a140f] border border-primary/20 text-muted-light hover:border-primary/40'
                }`}
              >
                🎲 Manuel
              </button>
            </div>
            <p className="text-xs text-muted-light mt-2 font-[var(--font-merriweather)]">
              {mode === 'auto' 
                ? 'Les dés sont lancés automatiquement à chaque assaut' 
                : 'Vous lancez les dés manuellement pour chaque assaut'}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-muted hover:bg-muted/80 text-light font-[var(--font-merriweather)] font-bold px-6 py-3 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleStart}
            className="flex-1 bg-primary hover:bg-yellow-400 text-[#1a140f] font-[var(--font-uncial)] font-bold px-6 py-3 rounded-lg transition-colors"
          >
            Commencer
          </button>
        </div>
      </div>
    </div>
  );
}
