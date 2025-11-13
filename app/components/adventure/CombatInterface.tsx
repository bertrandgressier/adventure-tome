'use client';

import { useState, useEffect } from 'react';
import type { Character } from '@/lib/types/character';
import type { Enemy, CombatRound, CombatState, CombatMode } from '@/lib/types/combat';
import { resolveCombatRound, testLuck, applyCombatLuck } from '@/lib/game/combat';
import CombatRoundDisplay from './CombatRoundDisplay';

interface CombatInterfaceProps {
  character: Character;
  enemy: Enemy;
  mode: CombatMode;
  onCombatEnd: (status: 'victory' | 'defeat', finalEndurance: number) => void;
  onFlee: () => void;
}

export default function CombatInterface({
  character,
  enemy: initialEnemy,
  mode,
  onCombatEnd,
  onFlee
}: CombatInterfaceProps) {
  const [combatState, setCombatState] = useState<CombatState>({
    enemy: { ...initialEnemy },
    rounds: [],
    playerEndurance: character.stats.pointsDeVieActuels,
    enemyEndurance: initialEnemy.endurance,
    status: 'ongoing',
    canFlee: true
  });

  const [isRolling, setIsRolling] = useState(false);
  const [showLuckPrompt, setShowLuckPrompt] = useState(false);
  const [pendingRound, setPendingRound] = useState<CombatRound | null>(null);
  const [playerChance, setPlayerChance] = useState(character.stats.chance);

  // Vérifier la fin du combat
  useEffect(() => {
    if (combatState.playerEndurance <= 0) {
      setCombatState(prev => ({ ...prev, status: 'defeat' }));
      onCombatEnd('defeat', 0);
    } else if (combatState.enemyEndurance <= 0) {
      setCombatState(prev => ({ ...prev, status: 'victory' }));
      onCombatEnd('victory', combatState.playerEndurance);
    }
  }, [combatState.playerEndurance, combatState.enemyEndurance, onCombatEnd]);

  const executeRound = (playerDiceRoll?: number, enemyDiceRoll?: number) => {
    setIsRolling(true);

    // Simuler un délai pour l'animation des dés
    setTimeout(() => {
      const weaponPoints = character.inventory.weapon?.attackPoints || 0;
      const roundNumber = combatState.rounds.length + 1;

      const round = resolveCombatRound(
        roundNumber,
        character.stats.dexterite,
        combatState.playerEndurance,
        weaponPoints,
        combatState.enemy,
        playerDiceRoll,
        enemyDiceRoll
      );

      // Si ce n'est pas une égalité, proposer d'utiliser la chance
      if (round.winner !== 'draw' && playerChance > 0) {
        setPendingRound(round);
        setShowLuckPrompt(true);
        setIsRolling(false);
      } else {
        // Appliquer le round directement
        applyRound(round);
      }
    }, mode === 'auto' ? 1500 : 0);
  };

  const applyRound = (round: CombatRound) => {
    setCombatState(prev => ({
      ...prev,
      rounds: [...prev.rounds, round],
      playerEndurance: round.playerEnduranceAfter,
      enemyEndurance: round.enemyEnduranceAfter,
      enemy: { ...prev.enemy, endurance: round.enemyEnduranceAfter }
    }));
    setIsRolling(false);
    setPendingRound(null);
    setShowLuckPrompt(false);
  };

  const handleUseLuck = () => {
    if (!pendingRound) return;

    const { isLucky, diceRoll } = testLuck(playerChance);
    const modifiedRound = applyCombatLuck(
      pendingRound,
      isLucky,
      combatState.playerEndurance,
      combatState.enemyEndurance
    );

    // Réduire la chance de 1
    setPlayerChance(prev => prev - 1);

    applyRound(modifiedRound);
  };

  const handleSkipLuck = () => {
    if (!pendingRound) return;
    applyRound(pendingRound);
  };

  const handleFlee = () => {
    // L'adversaire inflige 2 points de dégâts automatiquement
    const fleeDamage = 2;
    const newEndurance = Math.max(0, combatState.playerEndurance - fleeDamage);
    
    setCombatState(prev => ({
      ...prev,
      playerEndurance: newEndurance,
      status: 'defeat'
    }));
    
    onFlee();
  };

  const playerWeaponName = character.inventory.weapon?.name || 'Aucune';
  const playerWeaponPoints = character.inventory.weapon?.attackPoints || 0;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#2a1e17] border-2 border-primary rounded-lg p-6 max-w-4xl w-full my-4">
        {/* En-tête */}
        <h2 className="font-[var(--font-uncial)] text-3xl text-primary text-center mb-6">
          ⚔️ COMBAT EN COURS ⚔️
        </h2>

        {/* Stats des combattants */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Joueur */}
          <div className="bg-[#1a140f] border-2 border-green-500/50 rounded-lg p-4">
            <h3 className="font-[var(--font-uncial)] text-xl text-primary mb-3">
              {character.name}
            </h3>
            <div className="space-y-2 font-[var(--font-geist-mono)] text-sm">
              <div className="flex justify-between">
                <span className="text-muted-light">HABILETÉ:</span>
                <span className="text-light font-bold">{character.stats.dexterite}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-light">ENDURANCE:</span>
                <span className={`font-bold ${
                  combatState.playerEndurance <= character.stats.pointsDeVieMax / 4
                    ? 'text-red-400'
                    : 'text-green-400'
                }`}>
                  {combatState.playerEndurance}/{character.stats.pointsDeVieMax}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-light">CHANCE:</span>
                <span className="text-light font-bold">{playerChance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-light">ARME:</span>
                <span className="text-primary font-bold">
                  {playerWeaponName} (+{playerWeaponPoints})
                </span>
              </div>
            </div>
          </div>

          {/* Ennemi */}
          <div className="bg-[#1a140f] border-2 border-red-500/50 rounded-lg p-4">
            <h3 className="font-[var(--font-uncial)] text-xl text-primary mb-3">
              {combatState.enemy.name}
            </h3>
            <div className="space-y-2 font-[var(--font-geist-mono)] text-sm">
              <div className="flex justify-between">
                <span className="text-muted-light">HABILETÉ:</span>
                <span className="text-light font-bold">{combatState.enemy.habilete}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-light">ENDURANCE:</span>
                <span className={`font-bold ${
                  combatState.enemyEndurance <= combatState.enemy.enduranceMax / 4
                    ? 'text-red-400'
                    : 'text-green-400'
                }`}>
                  {combatState.enemyEndurance}/{combatState.enemy.enduranceMax}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-light">ARME:</span>
                <span className="text-primary font-bold">+{combatState.enemy.attackPoints}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Prompt pour utiliser la chance */}
        {showLuckPrompt && pendingRound && (
          <div className="bg-primary/10 border-2 border-primary rounded-lg p-4 mb-4">
            <p className="font-[var(--font-merriweather)] text-light text-center mb-3">
              {pendingRound.winner === 'player'
                ? `Vous avez blessé ${combatState.enemy.name}. Voulez-vous Tenter votre Chance pour infliger plus de dégâts ?`
                : `Vous avez été blessé par ${combatState.enemy.name}. Voulez-vous Tenter votre Chance pour réduire les dégâts ?`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleUseLuck}
                className="flex-1 bg-primary hover:bg-yellow-400 text-[#1a140f] font-[var(--font-uncial)] font-bold px-4 py-2 rounded transition-colors"
              >
                ✨ Tenter ma Chance ({playerChance})
              </button>
              <button
                onClick={handleSkipLuck}
                className="flex-1 bg-muted hover:bg-muted/80 text-light font-[var(--font-merriweather)] font-bold px-4 py-2 rounded transition-colors"
              >
                Continuer sans chance
              </button>
            </div>
          </div>
        )}

        {/* Historique des rounds */}
        <div className="bg-[#1a140f] rounded-lg p-4 mb-4 max-h-96 overflow-y-auto">
          <h3 className="font-[var(--font-uncial)] text-lg text-primary mb-3">
            Historique des assauts
          </h3>
          {combatState.rounds.length === 0 ? (
            <p className="font-[var(--font-merriweather)] text-muted-light text-center py-4">
              Aucun assaut pour le moment
            </p>
          ) : (
            <div className="space-y-2">
              {combatState.rounds.map((round, index) => (
                <CombatRoundDisplay
                  key={index}
                  round={round}
                  playerName={character.name}
                  enemyName={combatState.enemy.name}
                />
              ))}
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-3">
          {combatState.canFlee && (
            <button
              onClick={handleFlee}
              disabled={isRolling || showLuckPrompt}
              className="bg-red-600 hover:bg-red-700 text-light font-[var(--font-uncial)] font-bold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🏃 Fuir (-2 END)
            </button>
          )}
          
          {mode === 'manual' ? (
            <button
              onClick={() => executeRound()}
              disabled={isRolling || showLuckPrompt || combatState.status !== 'ongoing'}
              className="flex-1 bg-primary hover:bg-yellow-400 text-[#1a140f] font-[var(--font-uncial)] font-bold px-6 py-3 rounded-lg text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRolling ? '⏳ Lancer en cours...' : '🎲 Lancer les dés'}
            </button>
          ) : (
            <button
              onClick={() => executeRound()}
              disabled={isRolling || showLuckPrompt || combatState.status !== 'ongoing'}
              className="flex-1 bg-primary hover:bg-yellow-400 text-[#1a140f] font-[var(--font-uncial)] font-bold px-6 py-3 rounded-lg text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRolling ? '⏳ Assaut en cours...' : '⚡ Prochain assaut'}
            </button>
          )}
        </div>

        {/* Info mode */}
        <p className="text-xs text-muted-light text-center mt-3 font-[var(--font-merriweather)]">
          Mode {mode === 'auto' ? 'automatique' : 'manuel'} • 
          Assaut #{combatState.rounds.length + 1}
        </p>
      </div>
    </div>
  );
}
