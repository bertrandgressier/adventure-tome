'use client';

import { useState } from 'react';
import type { Enemy } from '@/lib/types/combat';

interface CombatSetupProps {
  onStartCombat: (enemy: Enemy, mode: 'auto' | 'manual', firstAttacker: 'player' | 'enemy') => void;
  onCancel: () => void;
}

export default function CombatSetup({ onStartCombat, onCancel }: CombatSetupProps) {
  const [formData, setFormData] = useState<Partial<Enemy>>({
    dexterite: 6,
    endurance: 6,
    enduranceMax: 6,
    attackPoints: 0
  });
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [firstAttacker, setFirstAttacker] = useState<'player' | 'enemy'>('player');

  const handleStart = () => {
    const { dexterite, endurance, enduranceMax, attackPoints } = formData;

    if (!dexterite || !endurance || !enduranceMax || attackPoints === undefined) {
      alert('Veuillez remplir tous les champs correctement');
      return;
    }

    if (dexterite < 1 || endurance < 1 || attackPoints < 0) {
      alert('Les valeurs doivent être valides (dextérité et endurance >= 1, points d\'attaque >= 0)');
      return;
    }

    const enemy: Enemy = {
      name: 'Adversaire',
      dexterite,
      endurance,
      enduranceMax,
      attackPoints
    };

    onStartCombat(enemy, mode, firstAttacker);
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
          {/* Dextérité */}
          <div>
            <label className="font-[var(--font-merriweather)] text-muted-light text-sm mb-2 block">
              DEXTÉRITÉ
            </label>
            <input
              type="number"
              value={formData.dexterite || ''}
              onChange={(e) => setFormData({ ...formData, dexterite: parseInt(e.target.value) || 0 })}
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
              value={formData.endurance || ''}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setFormData({ ...formData, endurance: val, enduranceMax: val });
              }}
              placeholder="Points de vie"
              min="1"
              className="w-full bg-[#1a140f] border border-primary/20 rounded px-4 py-2 font-[var(--font-geist-mono)] text-light placeholder:text-muted-light focus:outline-none focus:border-primary"
            />
          </div>

          {/* Points d'attaque (arme) */}
          <div>
            <label className="font-[var(--font-merriweather)] text-muted-light text-sm mb-2 block">
              Points d&apos;attaque (arme)
            </label>
            <input
              type="number"
              value={formData.attackPoints ?? ''}
              onChange={(e) => setFormData({ ...formData, attackPoints: parseInt(e.target.value) || 0 })}
              placeholder="Bonus de dommages"
              min="0"
              className="w-full bg-[#1a140f] border border-primary/20 rounded px-4 py-2 font-[var(--font-geist-mono)] text-light placeholder:text-muted-light focus:outline-none focus:border-primary"
            />
          </div>

          {/* Qui commence */}
          <div>
            <label className="font-[var(--font-merriweather)] text-muted-light text-sm mb-2 block">
              Qui attaque en premier ?
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setFirstAttacker('player')}
                className={`flex-1 px-4 py-3 rounded-lg font-[var(--font-uncial)] font-bold transition-all ${
                  firstAttacker === 'player'
                    ? 'bg-yellow-600 text-[#000000] shadow-lg shadow-yellow-600/50 border-2 border-yellow-600'
                    : 'bg-[#1a140f] border-2 border-muted-light/30 text-muted-light hover:border-muted-light/50'
                }`}
              >
                🛡️ Vous
              </button>
              <button
                onClick={() => setFirstAttacker('enemy')}
                className={`flex-1 px-4 py-3 rounded-lg font-[var(--font-uncial)] font-bold transition-all ${
                  firstAttacker === 'enemy'
                    ? 'bg-yellow-600 text-[#000000] shadow-lg shadow-yellow-600/50 border-2 border-yellow-600'
                    : 'bg-[#1a140f] border-2 border-muted-light/30 text-muted-light hover:border-muted-light/50'
                }`}
              >
                ⚔️ Ennemi
              </button>
            </div>
          </div>

          {/* Mode de combat */}
          <div>
            <label className="font-[var(--font-merriweather)] text-muted-light text-sm mb-2 block">
              Mode de combat
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setMode('auto')}
                className={`flex-1 px-4 py-3 rounded-lg font-[var(--font-uncial)] font-bold transition-all ${
                  mode === 'auto'
                    ? 'bg-yellow-600 text-[#000000] shadow-lg shadow-yellow-600/50 border-2 border-yellow-600'
                    : 'bg-[#1a140f] border-2 border-muted-light/30 text-muted-light hover:border-muted-light/50'
                }`}
              >
                ⚡ Auto
              </button>
              <button
                onClick={() => setMode('manual')}
                className={`flex-1 px-4 py-3 rounded-lg font-[var(--font-uncial)] font-bold transition-all ${
                  mode === 'manual'
                    ? 'bg-yellow-600 text-[#000000] shadow-lg shadow-yellow-600/50 border-2 border-yellow-600'
                    : 'bg-[#1a140f] border-2 border-muted-light/30 text-muted-light hover:border-muted-light/50'
                }`}
              >
                🎲 Manuel
              </button>
            </div>
            <p className="text-xs text-muted-light mt-2 font-[var(--font-merriweather)]">
              {mode === 'auto' 
                ? 'Les dés sont lancés automatiquement à chaque round' 
                : 'Vous lancez les dés manuellement pour chaque round'}
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
            className="flex-1 bg-[#FFBF00] hover:bg-yellow-400 text-[#000000] font-[var(--font-uncial)] font-bold px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-[0_0_20px_rgba(255,191,0,0.6)] hover:scale-[1.02] active:scale-[0.98]"
          >
            Commencer
          </button>
        </div>
      </div>
    </div>
  );
}

