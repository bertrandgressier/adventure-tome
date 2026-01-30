'use client';

import { useState } from 'react';
import { trackDiceRoll } from '@/src/infrastructure/analytics/tracking';
import { DiceAnimation3D } from '@/src/presentation/components/combat/DiceAnimation3D';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DiceRollerProps {
  onClose: () => void;
}

export default function DiceRoller({ onClose }: DiceRollerProps) {
  const [diceResult, setDiceResult] = useState<[number] | [number, number] | null>(null);
  const [diceTotal, setDiceTotal] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [pendingTotal, setPendingTotal] = useState<number | null>(null);

  const rollDice = (count: 1 | 2) => {
    setIsRolling(true);

    const roll1 = Math.floor(Math.random() * 6) + 1 as 1 | 2 | 3 | 4 | 5 | 6;
    const roll2 = count === 2 ? Math.floor(Math.random() * 6) + 1 as 1 | 2 | 3 | 4 | 5 | 6 : 0;
    const total = count === 1 ? roll1 : roll1 + roll2;

    // Mettre à jour immédiatement le nombre de dés pour l'animation
    const results: [number] | [number, number] = count === 1 ? [roll1] : [roll1, roll2];
    setDiceResult(results);
    setDiceTotal(null); // Masquer le total pendant l'animation
    setPendingTotal(total); // Stocker le total pour l'afficher après l'animation

    setTimeout(() => {
      setIsRolling(false);
      
      // Tracker le lancer de dés
      trackDiceRoll(count === 1 ? '1d6' : '2d6', total, 'general');
    }, 1200); // Match DiceAnimation3D duration
  };

  const handleAnimationComplete = () => {
    // Afficher le total uniquement quand l'animation est complètement terminée
    if (pendingTotal !== null) {
      setDiceTotal(pendingTotal);
      setPendingTotal(null);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-2 border-primary rounded-lg p-6 max-w-md w-full" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="font-[var(--font-uncial)] text-3xl tracking-wide text-primary mb-6 text-center">
            🎲 Lancer de dés
          </DialogTitle>
        </DialogHeader>

        {/* DiceAnimation3D - Remplace les emojis (issue #133) */}
        <div className="mb-6">
          {diceResult ? (
            <>
              <DiceAnimation3D
                result={diceResult}
                isRolling={isRolling}
                onComplete={handleAnimationComplete}
              />
              {/* Réserver l'espace pour le total pour éviter le "saut" */}
              <div className="font-[var(--font-uncial)] text-3xl text-center mt-4 min-h-[3rem]">
                {diceTotal !== null && (
                  <span>
                    Total: <span className="text-primary text-4xl font-bold">{diceTotal}</span>
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="h-32 flex items-center justify-center text-muted-foreground font-[var(--font-merriweather)] text-center px-4">
              Cliquez sur un bouton pour lancer les dés
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            onClick={() => rollDice(1)}
            disabled={isRolling}
            className="bg-gradient-to-br from-primary to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-primary-foreground font-[var(--font-uncial)] font-bold px-6 py-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {isRolling ? '⏳' : '1 dé'}
          </button>
          <button
            onClick={() => rollDice(2)}
            disabled={isRolling}
            className="bg-gradient-to-br from-primary to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-primary-foreground font-[var(--font-uncial)] font-bold px-6 py-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {isRolling ? '⏳' : '2 dés'}
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-background border border-muted-light/30 hover:border-primary text-light font-[var(--font-merriweather)] px-6 py-3 rounded-lg transition-colors"
        >
          Fermer
        </button>
      </DialogContent>
    </Dialog>
  );
}
