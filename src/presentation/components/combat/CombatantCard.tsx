'use client';

import type { CombatantState, EnemyState } from '@/src/domain/types/combat-v2';
import { getCombatantHealthInfo, isEnemy } from './combatUIHelpers';
import { cn } from '@/lib/utils';

export type CardVisualState = 'idle' | 'active' | 'damaged' | 'healing' | 'dead';

export interface CombatantCardProps {
  combatant: CombatantState | EnemyState;
  type: 'player' | 'enemy';
  isActive: boolean;
  lastDamage?: number;
}

export function CombatantCard({
  combatant,
  type,
  isActive,
  lastDamage,
}: CombatantCardProps) {
  const healthInfo = getCombatantHealthInfo(combatant.endurance, combatant.enduranceMax);
  const visualState = getVisualState(isActive, healthInfo.status, lastDamage);

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
    <div
      className={cn(
        'bg-card/50 border border-border/50 rounded-lg p-4 min-h-[120px] transition-all duration-300',
        getVisualClasses(visualState)
      )}
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
        {type === 'enemy' && isEnemy(combatant) && combatant.isBoss && (
          <span className="text-xs text-destructive font-bold" aria-label="Ennemi boss">
            BOSS
          </span>
        )}
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
          <div
            className={cn('h-full transition-all duration-300', healthInfo.barColorClass)}
            style={{ width: `${healthInfo.healthPercent}%` }}
            role="progressbar"
            aria-valuenow={combatant.endurance}
            aria-valuemin={0}
            aria-valuemax={combatant.enduranceMax}
            aria-label={`${Math.round(healthInfo.healthPercent)}% des points de vie`}
          />
        </div>

        {combatant.weapon && (
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
    </div>
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

function getVisualClasses(visualState: CardVisualState): string {
  switch (visualState) {
    case 'active':
      return 'border-primary/50 shadow-[0_0_10px_rgba(234,179,8,0.2)] animate-pulse';
    case 'damaged':
      return 'animate-damage bg-red-500/10 border-red-500/50';
    case 'healing':
      return 'bg-green-500/10 border-green-500/50';
    case 'dead':
      return 'opacity-50 grayscale border-gray-500/30';
    case 'idle':
    default:
      return '';
  }
}
