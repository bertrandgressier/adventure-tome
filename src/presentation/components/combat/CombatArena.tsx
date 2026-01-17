'use client';

import { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCharacterStore } from '@/src/presentation/providers/character-store-provider';
import { CombatantCard } from './CombatantCard';
import { DiceAnimation } from './DiceAnimation';
import type { DiceRollResult } from './DiceAnimation';
import { ActionPanel } from './ActionPanel';
import { CombatLog } from './CombatLog';
import type { DiceRoll } from '@/src/domain/types/combat-v2';
import {
  wouldBeLethal,
} from './combatUIHelpers';
import {
  combatArenaVariants,
  damageIndicatorVariants,
  victoryScreenVariants,
  defeatScreenVariants,
} from './motion';

export interface CombatArenaProps {
  characterId: string;
  onExit: () => void;
}

/**
 * Adapter: Convertit DiceRoll (Combat V2) vers DiceRollResult (DiceAnimation)
 */
function convertToDiceRollResult(
  roll: DiceRoll,
  playerDexterite: number,
  weaponBonus: number
): DiceRollResult {
  return {
    dice: [roll.dice1, roll.dice2],
    total: roll.total,
    modifiers: {
      habilete: playerDexterite,
      weaponBonus: weaponBonus,
    },
    finalScore: roll.modifiedTotal ?? roll.total,
    isDouble: roll.isDouble,
    success: roll.success,
  };
}

export function CombatArena({ characterId, onExit }: CombatArenaProps) {
  const combat = useCharacterStore((state) => state.combat);
  const isAnimating = useCharacterStore((state) => state.isAnimating);
  const prefersReducedMotion = useReducedMotion() ?? false;

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleExit = () => {
    if (combat && combat.phase !== 'victory' && combat.phase !== 'defeat') {
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

  const activeEnemy = combat.enemies?.[combat.activeEnemyIndex];

  // Adapter le lastRoll pour DiceAnimation
  const diceResult = combat.lastRoll
    ? convertToDiceRollResult(
        combat.lastRoll,
        combat.player.dexterite,
        combat.player.weapon.bonus
      )
    : null;

  // Déterminer l'outcome basé sur le dernier roll
  const outcome = combat.lastRoll?.success !== undefined
    ? combat.lastRoll.success
      ? ('win' as const)
      : ('lose' as const)
    : undefined;

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

      <div className="flex-1 flex flex-col p-4 pb-20 relative">
        <div className="flex-1 min-h-0 flex flex-col">
          {activeEnemy ? (
            <CombatantCard
              combatant={activeEnemy}
              type="enemy"
              isActive={combat.currentAttacker === 'enemy'}
            />
          ) : (
            <div className="bg-card/50 border border-border/50 rounded-lg p-4 min-h-[120px] flex items-center justify-center">
              <span className="text-muted-foreground">Combatant non disponible</span>
            </div>
          )}

          {/* Spacer pour garder l'espacement vertical */}
          <div className="flex-1" />

          <DamageIndicator
            damage={combat.pendingDamage?.amount}
            playerHealth={combat.player.endurance}
            playerMaxHealth={combat.player.enduranceMax}
          />

          <CombatantCard
            combatant={combat.player}
            type="player"
            isActive={combat.currentAttacker === 'player'}
          />
        </div>

        {/* DiceAnimation en position absolue, centré entre les deux combattants */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 px-4">
          <div className="pointer-events-auto">
            <DiceAnimation
              diceResult={diceResult}
              isRolling={isAnimating}
              outcome={outcome}
            />
          </div>
        </div>

        <div className="mt-4">
          {combat.phase === 'victory' && (
            <VictoryScreen characterId={characterId} />
          )}
          {combat.phase === 'defeat' && (
            <DefeatScreen characterId={characterId} />
          )}
          {combat.phase !== 'victory' && combat.phase !== 'defeat' && (
            <ActionPanel characterId={characterId} />
          )}
        </div>
      </div>

      {/* CombatLog positionné en fixed en bas de l'écran */}
      <CombatLog events={combat.events} />
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
  if (!damage || playerHealth === undefined || playerMaxHealth === undefined) {
    return null;
  }

  const isLethal = wouldBeLethal(playerHealth, damage);

  return (
    <motion.div
      className={`fixed inset-0 z-40 pointer-events-none ${
        isLethal ? 'bg-red-900/30' : 'bg-red-500/20'
      }`}
      variants={damageIndicatorVariants}
      initial="hidden"
      animate="visible"
      exit="floating"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="text-6xl font-cinzel font-bold text-red-500 mb-2"
            variants={damageIndicatorVariants}
            animate="floating"
          >
            -{damage}
          </motion.div>
          <div className="text-lg text-white/80">
            {isLethal ? 'MORT !' : 'DÉGÂTS !'}
          </div>
        </div>
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
