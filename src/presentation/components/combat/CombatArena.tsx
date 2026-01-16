'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCharacterStore } from '@/src/presentation/providers/character-store-provider';
import type { CombatState } from '@/src/domain/types/combat-v2';

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
          <CombatantCard
            combatant={activeEnemy}
            type="enemy"
            isActive={combat.currentAttacker === 'enemy'}
          />

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

function CombatantCard({
  combatant,
  type,
  isActive,
}: {
  combatant: CombatState['player'] | CombatState['enemies'][number];
  type: 'player' | 'enemy';
  isActive?: boolean;
}) {
  if (!combatant) {
    return (
      <div className="bg-card/50 border border-border/50 rounded-lg p-4 min-h-[120px] flex items-center justify-center">
        <span className="text-muted-foreground">Combatant non disponible</span>
      </div>
    );
  }

  const healthPercent = (combatant.endurance / combatant.enduranceMax) * 100;
  const isCritical = healthPercent <= 25 && healthPercent > 0;
  const isDead = healthPercent <= 0;

  return (
    <div
      className={`bg-card/50 border border-border/50 rounded-lg p-4 min-h-[120px] ${
        isActive ? 'border-primary/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-cinzel text-lg text-primary">{combatant.name}</h3>
          <p className="text-sm text-muted-foreground">
            DEX: {combatant.dexterite}
          </p>
        </div>
        {type === 'enemy' && 'isBoss' in combatant && combatant.isBoss && (
          <span className="text-xs text-destructive font-bold">BOSS</span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">PV</span>
          <span
            className={`font-mono ${
              isDead
                ? 'text-red-600 drop-shadow-[0_0_2px_rgba(220,38,38,0.8)]'
                : isCritical
                  ? 'text-orange-500 drop-shadow-[0_0_2px_rgba(249,115,22,0.8)]'
                  : 'text-primary'
            }`}
          >
            {combatant.endurance}/{combatant.enduranceMax}
          </span>
        </div>

        <div className="h-2 bg-input/50 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isDead
                ? 'bg-red-600'
                : isCritical
                  ? 'bg-orange-500'
                  : 'bg-primary'
            }`}
            style={{ width: `${Math.max(0, healthPercent)}%` }}
          />
        </div>

        {combatant.weapon && (
          <div className="text-sm text-muted-foreground">
            <span className="text-xs text-secondary">{combatant.weapon.name}</span>
            {combatant.weapon.bonus > 0 && (
              <span className="text-xs text-accent ml-1">
                (+{combatant.weapon.bonus})
              </span>
            )}
          </div>
        )}
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

  const wouldKill = playerHealth - damage <= 0;

  return (
    <div
      className={`fixed inset-0 z-40 pointer-events-none ${
        wouldKill ? 'bg-red-900/30' : 'bg-red-500/20'
      } animate-damage`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl font-cinzel font-bold text-red-500 mb-2">
            -{damage}
          </div>
          <div className="text-lg text-white/80">
            {wouldKill ? 'MORT !' : 'DÉGÂTS !'}
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

  const handleAction = (actionType: string) => {
    if (isAnimating) return;

    if (actionType === 'attack') {
      executeAction({ type: 'attack' });
    } else if (actionType === 'flee') {
      if (confirm('Fuir le combat ?')) {
        executeAction({ type: 'flee' });
      }
    } else if (actionType === 'use_item') {
    } else if (actionType === 'spend_chance') {
    } else if (actionType === 'weapon_ability') {
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
        const labels: Record<string, { label: string; icon: string }> = {
          attack: { label: 'Attaquer', icon: '⚔️' },
          use_item: { label: 'Objet', icon: '🎒' },
          spend_chance: { label: 'CHANCE', icon: '🍀' },
          weapon_ability: { label: 'Pouvoir', icon: '✨' },
          flee: { label: 'Fuir', icon: '🏃' },
          reroll: { label: 'Relancer', icon: '🎲' },
          block: { label: 'Bloquer', icon: '🛡️' },
        };

        const actionInfo = labels[action.action.type] || { label: action.action.type, icon: '?' };

        return (
          <Button
            key={action.action.type}
            variant={action.action.type === 'flee' ? 'outline' : 'default'}
            disabled={!action.enabled || isAnimating}
            onClick={() => handleAction(action.action.type)}
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
