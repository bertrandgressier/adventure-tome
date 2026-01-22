'use client';

import { useEffect } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCharacterStore } from '@/src/presentation/providers/character-store-provider';
import { useCombatOrchestrator } from '@/src/presentation/hooks/useCombatOrchestrator';
import { CombatValidator } from '@/src/domain/services/combat/CombatValidator';
import { CombatantCard } from './CombatantCard';
import { DiceAnimation } from './DiceAnimation';
import type { DiceRollResult } from './DiceAnimation';
import { ActionPanel } from './ActionPanel';
import { CombatLog } from './CombatLog';
import {
  wouldBeLethal,
} from './combatUIHelpers';
import {
  combatArenaVariants,
  victoryScreenVariants,
  defeatScreenVariants,
} from './motion';

export interface CombatArenaProps {
  characterId: string;
  onExit: () => void;
}

/**
 * Adapter: Convertit HitRollDetails (CombatHistoryEntry) vers DiceRollResult (DiceAnimation)
 */
function convertHistoryHitRollToDiceRollResult(
  hitRoll: import('@/src/domain/types/combat-history').HitRollDetails,
  dexterite: number,
  weaponBonus: number
): DiceRollResult {
  return {
    dice: hitRoll.dice,
    total: hitRoll.total,
    modifiers: {
      habilete: dexterite,
      weaponBonus: weaponBonus,
    },
    finalScore: hitRoll.total, // HitRollDetails n'a pas de modifiedTotal
    isDouble: hitRoll.dice[0] === hitRoll.dice[1],
    success: hitRoll.success,
  };
}

export function CombatArena({ characterId, onExit }: CombatArenaProps) {
  const combat = useCharacterStore((state) => state.combat);
  const turnPhase = useCharacterStore((state) => state.turnPhase);

  // Hook orchestrateur : gère le séquençage des animations et actions
  const { animationPhase, isAnimating, prefersReducedMotion } = useCombatOrchestrator();

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleExit = () => {
    if (combat && CombatValidator.checkCombatEnd(combat) === 'ongoing') {
      if (confirm('Quitter le combat en cours ? La progression sera perdue.')) {
        onExit();
      }
    } else {
      onExit();
    }
  };

  if (!combat) {
    return null;
  }

  const activeEnemy = combat.enemy;

  // Adapter le lastRoll pour DiceAnimation : afficher la dernière action
  const lastHistoryEntry = combat.history.length > 0 
    ? combat.history[combat.history.length - 1] 
    : undefined;
    
  const diceResult = lastHistoryEntry?.hitRoll
    ? convertHistoryHitRollToDiceRollResult(
        lastHistoryEntry.hitRoll,
        lastHistoryEntry.turn === 'player' ? combat.player.dexterite : (activeEnemy?.dexterite ?? 0),
        lastHistoryEntry.turn === 'player' ? combat.player.weapon.bonus : 0 // Enemies have no weapon bonus
      )
    : null;

  // Déterminer l'outcome basé sur la dernière action
  const outcome = lastHistoryEntry?.hitRoll?.success !== undefined
    ? lastHistoryEntry.hitRoll.success
      ? ('win' as const)
      : ('lose' as const)
    : undefined;

  // Déterminer si c'est le tour du joueur ou de l'ennemi pour l'UI
  // turnPhase reflète la RÉALITÉ du combat
  const isEnemyPhase = turnPhase === 'ENEMY_TURN_START' || turnPhase === 'ENEMY_ATTACKING';
  const isPlayerTurn = !isEnemyPhase && turnPhase !== 'COMBAT_ENDED';
  const isEnemyTurn = isEnemyPhase;

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background flex flex-col safe-area-top safe-area-bottom"
      variants={combatArenaVariants}
      initial="enter"
      animate="enter"
      exit="exit"
      custom={prefersReducedMotion}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={handleExit}
        className="absolute top-2 right-2 z-10"
        aria-label="Quitter le combat"
      >
        <X className="size-6" />
      </Button>

      {/* Turn Indicator Banner */}
      <TurnIndicator 
        isPlayerTurn={isPlayerTurn} 
        isEnemyTurn={isEnemyTurn}
        isAnimating={isAnimating}
        enemyName={activeEnemy?.name ?? 'Ennemi'}
      />

      <div className="flex-1 flex flex-col p-4 pb-20">
        <div className="flex-1 min-h-0 flex flex-col relative">
          {activeEnemy ? (
            <CombatantCard
              combatant={activeEnemy}
              type="enemy"
              isActive={isEnemyTurn}
            />
          ) : (
            <div className="bg-card/50 border border-border/50 rounded-lg p-4 min-h-[120px] flex items-center justify-center">
              <span className="text-muted-foreground">Combatant non disponible</span>
            </div>
          )}

          {/* Spacer pour garder l'espacement vertical */}
          <div className="flex-1" />

          <CombatantCard
            combatant={combat.player}
            type="player"
            isActive={isPlayerTurn}
          />

          {/* DiceAnimation - Réactivé avec animations basées sur useCombatAnimations */}
          <AnimatePresence>
            {(animationPhase === 'rolling' || animationPhase === 'result') && diceResult && (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="pointer-events-auto">
                  <DiceAnimation
                    diceResult={diceResult}
                    isRolling={animationPhase === 'rolling'}
                    outcome={outcome}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Damage Indicator - Réactivé */}
        <AnimatePresence>
          {animationPhase === 'damage' && lastHistoryEntry && (() => {
            const damage = lastHistoryEntry.damageRoll?.total;
            if (damage && lastHistoryEntry.turn === 'enemy') {
              // Dégâts subis par le joueur
              return (
                <DamageIndicator
                  damage={damage}
                  playerHealth={combat.player.endurance}
                  playerMaxHealth={combat.player.enduranceMax}
                />
              );
            }
            return null;
          })()}
        </AnimatePresence>

        <div className="mt-4">
          {CombatValidator.checkCombatEnd(combat) === 'victory' && (
            <VictoryScreen characterId={characterId} />
          )}
          {CombatValidator.checkCombatEnd(combat) === 'defeat' && (
            <DefeatScreen characterId={characterId} />
          )}
          {CombatValidator.checkCombatEnd(combat) === 'ongoing' && (
            <ActionPanel characterId={characterId} isAnimating={isAnimating} />
          )}
        </div>
      </div>

      {/* CombatLog positionné en fixed en bas de l'écran */}
      <CombatLog history={combat.history} />
    </motion.div>
  );
}

/**
 * Turn Indicator - Shows whose turn it is with animation
 */
function TurnIndicator({
  isPlayerTurn,
  isEnemyTurn,
  enemyName,
  isAnimating,
}: {
  isPlayerTurn: boolean;
  isEnemyTurn: boolean;
  enemyName: string;
  isAnimating: boolean;
}) {
  const prefersReducedMotion = useReducedMotion() ?? false;

  // Determine the text and style based on current turn
  const turnText = isPlayerTurn ? 'Votre tour' : isEnemyTurn ? `Tour de ${enemyName}` : 'Combat';
  const bgClass = isPlayerTurn 
    ? 'bg-primary/20 border-primary/50' 
    : isEnemyTurn 
      ? 'bg-destructive/20 border-destructive/50' 
      : 'bg-card/50 border-border/50';
  const textClass = isPlayerTurn 
    ? 'text-primary' 
    : isEnemyTurn 
      ? 'text-destructive' 
      : 'text-muted-foreground';

  return (
    <motion.div 
      className={`mx-4 mt-12 mb-2 px-4 py-2 rounded-lg border text-center ${bgClass}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isAnimating && !prefersReducedMotion ? [1, 1.02, 1] : 1,
      }}
      transition={{ 
        duration: 0.3,
        scale: { duration: 0.5, repeat: isAnimating ? Infinity : 0 }
      }}
    >
      <span className={`font-cinzel font-bold ${textClass}`}>
        {turnText}
      </span>
      {isAnimating && (
        <motion.span 
          className="ml-2 inline-block"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          🎲
        </motion.span>
      )}
    </motion.div>
  );
}

function DamageIndicator({
  damage,
  playerHealth,
  playerMaxHealth,
}: {
  damage?: number;
  playerHealth?: number;
  playerMaxHealth?: number;
}) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  
  if (!damage || playerHealth === undefined || playerMaxHealth === undefined) {
    return null;
  }

  const isLethal = wouldBeLethal(playerHealth, damage);

  return (
    <motion.div
      className={`fixed inset-0 z-40 pointer-events-none ${
        isLethal ? 'bg-red-900/30' : 'bg-red-500/20'
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0, y: -50 }}
          transition={{ duration: prefersReducedMotion ? 0.1 : 0.3 }}
        >
          <div className="text-6xl font-cinzel font-bold text-red-500 mb-2">
            -{damage}
          </div>
          <div className="text-lg text-white/80">
            {isLethal ? 'COUP FATAL !' : 'DÉGÂTS !'}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function VictoryScreen({ characterId }: { characterId: string }) {
  const endCombat = useCharacterStore((state) => state.endCombat);
  const prefersReducedMotion = useReducedMotion() ?? false;

  return (
    <motion.div
      className="bg-gradient-magic p-4 rounded-lg border border-primary/30 text-center"
      variants={victoryScreenVariants}
      initial="hidden"
      animate="visible"
      custom={prefersReducedMotion}
    >
      <h3 className="text-2xl font-cinzel text-primary mb-2">VICTOIRE !</h3>
      <Button
        onClick={async () => {
          await endCombat();
          window.location.href = `/characters/${characterId}`;
        }}
        variant="default"
        className="btn-mobile"
      >
        Terminer
      </Button>
    </motion.div>
  );
}

function DefeatScreen({ characterId }: { characterId: string }) {
  const endCombat = useCharacterStore((state) => state.endCombat);
  const prefersReducedMotion = useReducedMotion() ?? false;

  return (
    <motion.div
      className="bg-gradient-fire p-4 rounded-lg border border-destructive/30 text-center"
      variants={defeatScreenVariants}
      initial="hidden"
      animate="visible"
      custom={prefersReducedMotion}
    >
      <h3 className="text-2xl font-cinzel text-destructive mb-2">DÉFAITE...</h3>
      <Button
        onClick={async () => {
          await endCombat();
          window.location.href = `/characters/${characterId}`;
        }}
        variant="destructive"
        className="btn-mobile"
      >
        Terminer
      </Button>
    </motion.div>
  );
}
