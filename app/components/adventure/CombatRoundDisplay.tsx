'use client';

import type { CombatRound } from '@/lib/types/combat';

interface CombatRoundDisplayProps {
  round: CombatRound;
  playerName: string;
  enemyName: string;
}

export default function CombatRoundDisplay({ round, playerName, enemyName }: CombatRoundDisplayProps) {
  const attackerName = round.attacker === 'player' ? playerName : enemyName;
  const defenderName = round.attacker === 'player' ? enemyName : playerName;
  const attackerColor = round.attacker === 'player' ? 'green' : 'red';

  const getDamageBreakdown = () => {
    if (!round.hitSuccess || !round.totalDamage) return null;
    
    return (
      <div className="text-xs font-[var(--font-geist-mono)] text-muted-light mt-1">
        Dégâts: 1 (base) + {round.damageDiceRoll} (dé) + {round.weaponDamage} (arme) = {round.totalDamage}
      </div>
    );
  };

  return (
    <div className="bg-[#1a140f] border border-primary/20 rounded-lg p-4 mb-3">
      {/* En-tête du round */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-[var(--font-uncial)] text-lg text-primary">
          Round #{round.roundNumber}
        </h4>
        <span className={`font-[var(--font-uncial)] text-sm text-${attackerColor}-400`}>
          {attackerName} attaque
        </span>
      </div>

      {/* Détails de l'attaque */}
      <div className={`bg-[#2a1e17] rounded p-3 border-l-4 border-${attackerColor}-500/50`}>
        {/* Test pour toucher */}
        <div className="mb-2">
          <div className="text-xs font-[var(--font-merriweather)] text-muted-light mb-1">
            Test pour toucher
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎲</span>
            <span className="font-[var(--font-geist-mono)] text-xl text-light">
              {round.hitDiceRoll}
            </span>
            {round.hitSuccess ? (
              <span className="text-green-400 font-[var(--font-uncial)] text-sm ml-2">
                ✓ Touché !
              </span>
            ) : (
              <span className="text-red-400 font-[var(--font-uncial)] text-sm ml-2">
                ✗ Raté
              </span>
            )}
          </div>
        </div>

        {/* Dégâts (si touché) */}
        {round.hitSuccess && round.totalDamage !== undefined && (
          <div>
            <div className="text-xs font-[var(--font-merriweather)] text-muted-light mb-1">
              Dégâts infligés
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💥</span>
              <span className="font-[var(--font-geist-mono)] text-2xl text-primary">
                {round.totalDamage}
              </span>
            </div>
            {getDamageBreakdown()}
          </div>
        )}
      </div>

      {/* Endurance après le round */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="text-center">
          <div className="text-xs font-[var(--font-merriweather)] text-muted-light">
            {playerName}
          </div>
          <div className={`font-[var(--font-geist-mono)] text-lg ${
            round.playerEnduranceAfter <= 3 ? 'text-red-400' : 'text-green-400'
          }`}>
            END: {round.playerEnduranceAfter}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-[var(--font-merriweather)] text-muted-light">
            {enemyName}
          </div>
          <div className={`font-[var(--font-geist-mono)] text-lg ${
            round.enemyEnduranceAfter <= 3 ? 'text-red-400' : 'text-green-400'
          }`}>
            END: {round.enemyEnduranceAfter}
          </div>
        </div>
      </div>

      {/* Message de résultat */}
      {round.hitSuccess && round.totalDamage !== undefined && (
        <div className={`text-sm font-[var(--font-merriweather)] text-center py-2 rounded mt-3 ${
          round.attacker === 'player' 
            ? 'bg-green-900/20 text-green-400' 
            : 'bg-red-900/20 text-red-400'
        }`}>
          {defenderName} perd {round.totalDamage} point{round.totalDamage > 1 ? 's' : ''} d&apos;ENDURANCE
        </div>
      )}
    </div>
  );
}

