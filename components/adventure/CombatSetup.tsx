'use client';

import React from 'react';
import { useState } from 'react';
import type { Enemy } from '@/src/domain/types/combat';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CombatSetupProps {
  onStartCombat: (enemy: Enemy, firstAttacker: 'player' | 'enemy') => void;
  onCancel: () => void;
}

export default function CombatSetup({ onStartCombat, onCancel }: CombatSetupProps) {
  const [formData, setFormData] = useState<Partial<Enemy>>({
    name: '',
    dexterite: 6,
    endurance: 6,
    enduranceMax: 6,
  });
  const [firstAttacker, setFirstAttacker] = useState<'player' | 'enemy'>('player');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Le nom de l\'ennemi est requis';
    }

    if (!formData.dexterite || formData.dexterite < 1) {
      newErrors.dexterite = 'La dextérité doit être au moins 1';
    }

    if (!formData.endurance || formData.endurance < 1) {
      newErrors.endurance = 'L\'endurance doit être au moins 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStart = () => {
    if (!validateForm()) {
      return;
    }

    const { name, dexterite, endurance } = formData;

    const enemy: Enemy = {
      name: name!.trim(),
      dexterite: dexterite!,
      endurance: endurance!,
      enduranceMax: endurance!,
    };

    onStartCombat(enemy, firstAttacker);
  };

  const handleEnduranceChange = (value: string) => {
    const val = parseInt(value) || 0;
    setFormData({ ...formData, endurance: val, enduranceMax: val });
    if (errors.endurance) {
      setErrors({ ...errors, endurance: '' });
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="bg-card border-2 border-primary/50 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="font-[var(--font-uncial)] text-3xl tracking-wide text-primary mb-6 text-center">
            ⚔️ Configuration du Combat
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mb-6">
          {/* Nom de l'ennemi */}
          <div>
            <label htmlFor="enemy-name" className="font-[var(--font-merriweather)] text-muted-light text-sm mb-2 block">
              Nom de l&apos;ennemi
            </label>
            <input
              id="enemy-name"
              type="text"
              value={formData.name || ''}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              placeholder="Ex: Gobelin, Orc, Troll..."
              className="w-full bg-background border border-primary/20 rounded px-4 py-2 font-[var(--font-geist-mono)] text-light placeholder:text-muted-light focus:outline-none focus:border-primary"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Dextérité */}
          <div>
            <label htmlFor="enemy-dexterite" className="font-[var(--font-merriweather)] text-muted-light text-sm mb-2 block">
              DEXTÉRITÉ (Habileté au combat)
            </label>
            <input
              id="enemy-dexterite"
              type="number"
              value={formData.dexterite || ''}
              onChange={(e) => {
                setFormData({ ...formData, dexterite: parseInt(e.target.value) || 0 });
                if (errors.dexterite) setErrors({ ...errors, dexterite: '' });
              }}
              placeholder="Score de combat"
              min="1"
              className="w-full bg-background border border-primary/20 rounded px-4 py-2 font-[var(--font-geist-mono)] text-light placeholder:text-muted-light focus:outline-none focus:border-primary"
            />
            {errors.dexterite && (
              <p className="text-red-500 text-sm mt-1">{errors.dexterite}</p>
            )}
          </div>

          {/* Endurance */}
          <div>
            <label htmlFor="enemy-endurance" className="font-[var(--font-merriweather)] text-muted-light text-sm mb-2 block">
              ENDURANCE (Points de vie)
            </label>
            <input
              id="enemy-endurance"
              type="number"
              value={formData.endurance || ''}
              onChange={(e) => handleEnduranceChange(e.target.value)}
              placeholder="Points de vie"
              min="1"
              className="w-full bg-background border border-primary/20 rounded px-4 py-2 font-[var(--font-geist-mono)] text-light placeholder:text-muted-light focus:outline-none focus:border-primary"
            />
            {errors.endurance && (
              <p className="text-red-500 text-sm mt-1">{errors.endurance}</p>
            )}
          </div>

          {/* Qui commence */}
          <div>
            <label className="font-[var(--font-merriweather)] text-muted-light text-sm mb-2 block">
              Qui attaque en premier ?
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFirstAttacker('player')}
                className={`flex-1 px-4 py-3 rounded-lg font-[var(--font-uncial)] font-bold transition-all ${
                  firstAttacker === 'player'
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/50 border-2 border-primary'
                    : 'bg-background border-2 border-muted-light/30 text-muted-light hover:border-muted-light/50'
                }`}
              >
                🛡️ Vous
              </button>
              <button
                type="button"
                onClick={() => setFirstAttacker('enemy')}
                className={`flex-1 px-4 py-3 rounded-lg font-[var(--font-uncial)] font-bold transition-all ${
                  firstAttacker === 'enemy'
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/50 border-2 border-primary'
                    : 'bg-background border-2 border-muted-light/30 text-muted-light hover:border-muted-light/50'
                }`}
              >
                ⚔️ Ennemi
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-muted hover:bg-muted/80 text-light font-[var(--font-merriweather)] font-bold px-6 py-3 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleStart}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-[var(--font-uncial)] font-bold px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-[0_0_20px_hsl(var(--primary)/0.6)] hover:scale-[1.02] active:scale-[0.98]"
          >
            Commencer ⚔️
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
