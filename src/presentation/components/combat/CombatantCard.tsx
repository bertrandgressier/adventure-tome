'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { PlayerState, EnemyState } from '@/src/domain/types/combat-v2';
import { getCombatantHealthInfo } from './combatUIHelpers';
import { cn } from '@/lib/utils';
import { combatantCardVariants } from './motion';

export type CardVisualState = 'idle' | 'active' | 'damaged' | 'healing' | 'dead';

export interface CombatantCardProps {
  combatant: PlayerState | EnemyState;
  type: 'player' | 'enemy';
  isActive: boolean;
  lastDamage?: number;
}

function isPlayer(combatant: PlayerState | EnemyState): combatant is PlayerState {
  return 'weapon' in combatant && 'chance' in combatant;
}

export function CombatantCard({
  combatant,
  type,
  isActive,
  lastDamage,
}: CombatantCardProps) {
  const healthInfo = getCombatantHealthInfo(combatant.endurance, combatant.enduranceMax);
  const visualState = getVisualState(isActive, healthInfo.status, lastDamage);
  const prefersReducedMotion = useReducedMotion() ?? false;

  // Message d'accessibilité pour les lecteurs d'écran
  const getAriaLiveMessage = (): string | undefined => {
    if (visualState === 'damaged' && lastDamage) {
      return `${combatant.name} subit ${lastDamage} points de dégâts`;
    }
    if (visualState === 'healing' && lastDamage) {
      return `${combatant.name} récupère ${Math.abs(lastDamage)} points de vie`;
    }
    if (visualState === 'dead') {
      return `${combatant.name} est vaincu`;
    }
    return undefined;
  };

  return (
    <motion.div
      className={cn(
        'bg-card/50 border border-border/50 rounded-lg p-4 min-h-[120px]'
      )}
      variants={combatantCardVariants}
      initial="idle"
      animate={visualState}
      role="region"
      aria-label={`Carte de ${type === 'player' ? 'joueur' : 'ennemi'}: ${combatant.name}`}
    >
      {/* Annonces pour lecteurs d'écran */}
      {getAriaLiveMessage() && (
        <div className="sr-only" aria-live="assertive" aria-atomic="true">
          {getAriaLiveMessage()}
        </div>
      )}

      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-cinzel text-lg text-primary">{combatant.name}</h3>
          <p className="text-sm text-muted-foreground">
            DEX: {combatant.dexterite}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">PV</span>
          <span
            className={cn('font-mono', healthInfo.textColorClass)}
            aria-label={`Points de vie: ${combatant.endurance} sur ${combatant.enduranceMax}`}
          >
            {combatant.endurance}/{combatant.enduranceMax}
          </span>
        </div>

        <div className="h-2 bg-input/50 rounded-full overflow-hidden">
          <motion.div
            className={cn('h-full', healthInfo.barColorClass)}
            style={{ width: `${healthInfo.healthPercent}%` }}
            animate={{ width: `${healthInfo.healthPercent}%` }}
            transition={{
              type: prefersReducedMotion ? 'tween' : 'spring',
              stiffness: prefersReducedMotion ? 0 : 100,
              damping: prefersReducedMotion ? 0 : 15,
              duration: prefersReducedMotion ? 0 : 0.5,
            }}
            role="progressbar"
            aria-valuenow={combatant.endurance}
            aria-valuemin={0}
            aria-valuemax={combatant.enduranceMax}
            aria-label={`${Math.round(healthInfo.healthPercent)}% des points de vie`}
          />
        </div>

        {type === 'player' && isPlayer(combatant) && combatant.weapon && (
          <div className="text-sm text-muted-foreground">
            <span className="text-xs text-secondary">{combatant.weapon.name}</span>
            {combatant.weapon.bonus > 0 && (
              <span
                className="text-xs text-accent ml-1"
                aria-label={`Bonus d'arme: +${combatant.weapon.bonus}`}
              >
                (+{combatant.weapon.bonus})
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function getVisualState(
  isActive: boolean,
  healthStatus: 'normal' | 'critical' | 'dead',
  lastDamage?: number
): CardVisualState {
  if (healthStatus === 'dead') return 'dead';
  if (lastDamage && lastDamage < 0) return 'healing';
  if (lastDamage && lastDamage > 0) return 'damaged';
  if (isActive) return 'active';
  return 'idle';
}
