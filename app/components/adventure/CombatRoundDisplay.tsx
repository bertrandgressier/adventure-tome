'use client';

import type { CombatRound } from '@/lib/types/combat';

interface CombatRoundDisplayProps {
  round: CombatRound;
  playerName: string;
  enemyName: string;
}

export default function CombatRoundDisplay({ round, playerName, enemyName }: CombatRoundDisplayProps) {
  const getWinnerColor = (winner: 'player' | 'enemy' | 'draw') => {
    if (winner === 'player') return 'text-green-400';
    if (winner === 'enemy') return 'text-red-400';
    return 'text-yellow-400';
  };

  const getWinnerText = (winner: 'player' | 'enemy' | 'draw') => {
    if (winner === 'player') return `${playerName} gagne l'assaut !`;
    if (winner === 'enemy') return `${enemyName} gagne l'assaut !`;
    return 'Égalité - aucun dégât';
  };

  const getDamageText = () => {
    if (round.winner === 'draw') return null;
    
    const damage = round.damageDealt;
    const target = round.winner === 'player' ? enemyName : playerName;
    
    return `${target} perd ${damage} point${damage > 1 ? 's' : ''} d'ENDURANCE`;
  };

  return (
    <div className="bg-[#1a140f] border border-primary/20 rounded-lg p-4 mb-3">
      {/* En-tête du round */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-[var(--font-uncial)] text-lg text-primary">
          Assaut #{round.roundNumber}
        </h4>
        <span className={`font-[var(--font-uncial)] text-sm ${getWinnerColor(round.winner)}`}>
          {getWinnerText(round.winner)}
        </span>
      </div>

      {/* Détails des lancers */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        {/* Joueur */}
        <div className="bg-[#2a1e17] rounded p-3 border-l-4 border-green-500/50">
          <div className="text-xs font-[var(--font-merriweather)] text-muted-light mb-1">
            {playerName}
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🎲</span>
            <span className="font-[var(--font-geist-mono)] text-xl text-light">
              {round.playerDiceRoll}
            </span>
          </div>
          <div className="text-xs font-[var(--font-geist-mono)] text-muted-light">
            {round.playerDiceRoll} + DEX + Arme ({round.playerWeaponPoints})
          </div>
          <div className="font-[var(--font-geist-mono)] text-2xl text-primary mt-1">
            FA: {round.playerAttackStrength}
          </div>
          <div className="text-xs font-[var(--font-merriweather)] text-muted-light mt-1">
            END: {round.playerEnduranceAfter}
          </div>
        </div>

        {/* Ennemi */}
        <div className="bg-[#2a1e17] rounded p-3 border-l-4 border-red-500/50">
          <div className="text-xs font-[var(--font-merriweather)] text-muted-light mb-1">
            {enemyName}
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🎲</span>
            <span className="font-[var(--font-geist-mono)] text-xl text-light">
              {round.enemyDiceRoll}
            </span>
          </div>
          <div className="text-xs font-[var(--font-geist-mono)] text-muted-light">
            {round.enemyDiceRoll} + DEX
          </div>
          <div className="font-[var(--font-geist-mono)] text-2xl text-primary mt-1">
            FA: {round.enemyAttackStrength}
          </div>
          <div className="text-xs font-[var(--font-merriweather)] text-muted-light mt-1">
            END: {round.enemyEnduranceAfter}
          </div>
        </div>
      </div>

      {/* Résultat des dégâts */}
      {getDamageText() && (
        <div className={`text-sm font-[var(--font-merriweather)] text-center py-2 rounded ${
          round.winner === 'player' ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
        }`}>
          {getDamageText()}
        </div>
      )}
    </div>
  );
}
