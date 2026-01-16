'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCharacterStore } from '@/src/presentation/providers/character-store-provider';
import { CombatantCard } from './CombatantCard';
import type { CombatState, CombatActionType } from '@/src/domain/types/combat-v2';
import {
  wouldBeLethal,
  getActionMetadata,
} from './combatUIHelpers';

export interface CombatArenaProps {
  characterId: string;
  onExit: () => void;
}

export function CombatArena({ characterId, onExit }: CombatArenaProps) {
  const combat = useCharacterStore((state) => state.combat);

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

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col safe-area-top safe-area-bottom">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleExit}
        className="absolute top-2 right-2 z-10"
        aria-label="Quitter le combat"
      >
        <X className="size-6" />
      </Button>

      <div className="flex-1 flex flex-col p-4">
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

          <div className="flex-1 flex items-center justify-center">
            <DiceAnimation roll={combat.lastRoll} />
          </div>

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

        <div className="mt-4">
          <ActionPanel characterId={characterId} />
        </div>
      </div>
    </div>
  );
}

function DiceAnimation({ roll }: { roll?: CombatState['lastRoll'] }) {
  if (!roll) {
    return (
      <div className="text-center">
        <span className="text-muted-foreground text-sm">Prêt pour le combat</span>
      </div>
    );
  }

  return (
    <div className="text-center space-y-2">
      <div className="flex items-center justify-center gap-4">
        <div className="w-16 h-16 bg-card border-2 border-primary/30 rounded-lg flex items-center justify-center">
          <span className="text-3xl font-cinzel text-primary">{roll.dice1}</span>
        </div>
        <span className="text-2xl text-muted-foreground">+</span>
        <div className="w-16 h-16 bg-card border-2 border-primary/30 rounded-lg flex items-center justify-center">
          <span className="text-3xl font-cinzel text-primary">{roll.dice2}</span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-4xl font-cinzel text-primary font-bold">
          {roll.total}
        </div>
        {roll.isDouble && (
          <span className="inline-block px-3 py-1 bg-accent text-accent-foreground text-xs font-bold rounded-full">
            DOUBLE !
          </span>
        )}
        {roll.success !== undefined && (
          <div
            className={`text-sm font-bold ${
              roll.success ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {roll.success ? 'TOUCHÉ !' : 'RATÉ !'}
          </div>
        )}
      </div>
    </div>
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
    <div
      className={`fixed inset-0 z-40 pointer-events-none ${
        isLethal ? 'bg-red-900/30' : 'bg-red-500/20'
      } animate-damage`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl font-cinzel font-bold text-red-500 mb-2">
            -{damage}
          </div>
          <div className="text-lg text-white/80">
            {isLethal ? 'MORT !' : 'DÉGÂTS !'}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionPanel({ characterId }: { characterId: string }) {
  const availableActions = useCharacterStore((state) => state.availableActions);
  const executeAction = useCharacterStore((state) => state.executeAction);
  const isAnimating = useCharacterStore((state) => state.isAnimating);
  const combat = useCharacterStore((state) => state.combat);
  const endCombat = useCharacterStore((state) => state.endCombat);

  const handleAction = (actionType: CombatActionType) => {
    if (isAnimating) return;

    // Délégation au store sans logique complexe
    executeAction({ type: actionType });
  };

  const handleFlee = () => {
    if (isAnimating) return;
    if (confirm('Fuir le combat ?')) {
      executeAction({ type: 'flee' });
    }
  };

  if (combat?.phase === 'victory') {
    return (
      <div className="bg-gradient-magic p-4 rounded-lg border border-primary/30 text-center">
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
      </div>
    );
  }

  if (combat?.phase === 'defeat') {
    return (
      <div className="bg-gradient-fire p-4 rounded-lg border border-destructive/30 text-center">
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
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {availableActions.map((action) => {
        const actionInfo = getActionMetadata(action.action.type);

        return (
          <Button
            key={action.action.type}
            variant={action.action.type === 'flee' ? 'outline' : 'default'}
            disabled={!action.enabled || isAnimating}
            onClick={() => action.action.type === 'flee' ? handleFlee() : handleAction(action.action.type as CombatActionType)}
            className="btn-mobile h-14"
            title={action.disabledReason}
          >
            <span className="text-xl mr-2">{actionInfo.icon}</span>
            <span className="text-sm">{actionInfo.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
