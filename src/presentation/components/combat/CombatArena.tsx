'use client';

import { useEffect } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCharacterStore } from '@/src/presentation/providers/character-store-provider';
import { useCombatOrchestrator } from '@/src/presentation/hooks/useCombatOrchestrator';
import { CombatValidator } from '@/src/domain/services/combat/CombatValidator';
import { CombatantCard } from './CombatantCard';
import { DiceResultCard } from './DiceResultCard';
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
  impactFlashVariants,
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
  const { animationPhase, isAnimating, prefersReducedMotion, showEndScreen } = useCombatOrchestrator();

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

      <div className="flex-1 flex flex-col p-4 pt-12 pb-20">
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

          {/* DiceResultCard - Migration vers animation 3D (issue #133) */}
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
                  <DiceResultCard
                    diceResult={diceResult}
                    isRolling={animationPhase === 'rolling'}
                    outcome={outcome}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Impact Flash - Flash d'impact seulement quand joueur touche */}
          <AnimatePresence>
            {animationPhase === 'result' && 
             lastHistoryEntry && 
             lastHistoryEntry.turn === 'player' && 
             lastHistoryEntry.damageRoll && (
              <ImpactFlash />
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

        {CombatValidator.checkCombatEnd(combat) === 'ongoing' && (
          <div className="mt-4">
            <ActionPanel characterId={characterId} isAnimating={isAnimating} />
          </div>
        )}
      </div>

      {/* CombatLog positionné en fixed en bas de l'écran */}
      <CombatLog history={combat.history} />

      {/* Écrans de fin en plein écran */}
      <AnimatePresence>
        {showEndScreen && CombatValidator.checkCombatEnd(combat) === 'victory' && (
          <VictoryScreen characterId={characterId} />
        )}
        {showEndScreen && CombatValidator.checkCombatEnd(combat) === 'defeat' && (
          <DefeatScreen characterId={characterId} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ImpactFlash() {
  const prefersReducedMotion = useReducedMotion() ?? false;

  return (
    <motion.div
      className="fixed inset-0 z-30 pointer-events-none"
      style={{ backgroundColor: 'rgba(234, 179, 8, 1)' }}
      variants={impactFlashVariants}
      initial="hidden"
      animate="flash"
      exit="hidden"
      custom={prefersReducedMotion}
    />
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="bg-gradient-magic p-8 rounded-2xl border-2 border-primary/50 text-center shadow-2xl max-w-md mx-4"
        variants={victoryScreenVariants}
        initial="hidden"
        animate="visible"
        custom={prefersReducedMotion}
      >
        <motion.h2 
          className="text-5xl font-cinzel font-bold text-primary mb-6"
          initial={{ scale: 0.5, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
        >
          VICTOIRE !
        </motion.h2>
        <p className="text-lg text-muted-foreground mb-6">Vous avez triomphé !</p>
        <Button
          onClick={async () => {
            await endCombat();
            window.location.href = `/characters/${characterId}`;
          }}
          variant="default"
          className="btn-mobile text-lg px-8 py-6"
          size="lg"
        >
          Terminer
        </Button>
      </motion.div>
    </motion.div>
  );
}

function DefeatScreen({ characterId }: { characterId: string }) {
  const endCombat = useCharacterStore((state) => state.endCombat);
  const prefersReducedMotion = useReducedMotion() ?? false;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="bg-gradient-fire p-8 rounded-2xl border-2 border-destructive/50 text-center shadow-2xl max-w-md mx-4"
        variants={defeatScreenVariants}
        initial="hidden"
        animate="visible"
        custom={prefersReducedMotion}
      >
        <motion.h2 
          className="text-5xl font-cinzel font-bold text-destructive mb-6"
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          DÉFAITE
        </motion.h2>
        <p className="text-lg text-muted-foreground mb-6">Vous avez été vaincu...</p>
        <Button
          onClick={async () => {
            await endCombat();
            window.location.href = `/characters/${characterId}`;
          }}
          variant="destructive"
          className="btn-mobile text-lg px-8 py-6"
          size="lg"
        >
          Terminer
        </Button>
      </motion.div>
    </motion.div>
  );
}
