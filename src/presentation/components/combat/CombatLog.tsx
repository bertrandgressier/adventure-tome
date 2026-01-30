'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { ScrollText, ChevronUp, ChevronDown, Swords, Sparkles, Wand2, Dices } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CombatHistoryEntry } from '@/src/domain/types/combat-history';
import { CombatActionType } from '@/src/domain/types/CombatActionType';
import { Attacker } from '@/src/domain/types/Attacker';

export interface CombatLogProps {
  history?: readonly CombatHistoryEntry[];
}

const logContentVariants = {
  collapsed: {
    opacity: 0,
    height: 0,
    transition: {
      height: { duration: 0.2 },
      opacity: { duration: 0.15 },
    },
  },
  expanded: {
    opacity: 1,
    height: 'auto',
    transition: {
      height: { duration: 0.3, ease: 'easeOut' },
      opacity: { duration: 0.2, delay: 0.1 },
      when: 'beforeChildren',
      staggerChildren: 0.02,
    },
  },
};

const eventVariants = {
  collapsed: { opacity: 0, y: 10 },
  expanded: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.2,
    },
  },
};

export function CombatLog({ history = [] }: CombatLogProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const prevHistoryLengthRef = useRef(history.length);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const historyByRound = groupHistoryByRound(history);
  const totalEntries = history.length;

  // Vérifier si on peut scroller vers le bas
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setCanScrollDown(scrollHeight - scrollTop - clientHeight > 10);
    }
  };

  // Auto-scroll vers le bas quand de nouvelles entrées arrivent
  useEffect(() => {
    if (scrollRef.current && history.length > prevHistoryLengthRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
      }, 100);
    }
    prevHistoryLengthRef.current = history.length;
  }, [history.length, prefersReducedMotion]);

  // Scroll initial quand on ouvre le log
  useEffect(() => {
    if (isExpanded && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
      }, 150);
    }
  }, [isExpanded, prefersReducedMotion]);

  const lastEntryIndex = totalEntries - 1;
  const lastEntry = history[lastEntryIndex];

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none"
      initial={{ y: 0 }}
      animate={{ y: 0 }}
    >
      <div className="pointer-events-auto px-4 pb-4 safe-area-bottom">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'w-full justify-between font-cinzel text-sm border-primary/50 bg-card/90 hover:bg-card backdrop-blur-sm shadow-lg',
            isExpanded && 'border-primary rounded-b-none'
          )}
          aria-expanded={isExpanded}
          aria-controls="combat-log-content"
        >
          <span className="flex items-center gap-2">
            <ScrollText className="size-4" />
            Historique ({totalEntries})
          </span>
          {isExpanded ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
        </Button>

        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.div
              id="combat-log-content"
              variants={prefersReducedMotion ? {} : logContentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="overflow-hidden border-x border-t border-border/50 rounded-t-lg bg-card/95 backdrop-blur-md shadow-xl relative"
            >
              <div 
                ref={scrollRef}
                className="max-h-[50vh] overflow-y-auto"
                onScroll={checkScroll}
              >
                <div className="p-3 space-y-3">
                  {historyByRound.map(({ roundNumber, entries }) => (
                    <motion.div
                      key={roundNumber}
                      variants={prefersReducedMotion ? {} : eventVariants}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2 text-xs font-cinzel text-primary/70 border-b border-primary/20 pb-1 sticky top-0 bg-card/95 backdrop-blur-sm z-10">
                        <span>Round {roundNumber}</span>
                      </div>

                      <div className="space-y-1.5 pl-2">
                        {entries.map((entry) => (
                          <CombatHistoryEntryDisplay 
                            key={entry.id} 
                            entry={entry} 
                            isLast={entry.id === lastEntry?.id} 
                          />
                        ))}
                      </div>
                    </motion.div>
                  ))}

                  {totalEntries === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-4">
                      Aucune action pour le moment
                    </div>
                  )}
                </div>
              </div>

              {/* Indicateur de scroll */}
              <AnimatePresence>
                {canScrollDown && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card/95 to-transparent pointer-events-none flex items-end justify-center pb-2"
                  >
                    <div className="bg-primary/20 rounded-full p-1">
                      <ChevronDown className="size-4 text-primary animate-bounce" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {lastEntry && (
                <div className="sr-only" aria-live="polite" aria-atomic="true">
                  {lastEntry.description}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

interface CombatHistoryEntryDisplayProps {
  entry: CombatHistoryEntry;
  isLast: boolean;
}

function CombatHistoryEntryDisplay({ entry, isLast }: CombatHistoryEntryDisplayProps) {
  const icon = getActionIcon(entry.action, entry.turn);
  const colorClass = getActionColorClass(entry.action);

  return (
    <motion.div
      className={cn(
        'flex items-start gap-2 text-sm py-1.5 px-2 rounded transition-colors',
        isLast && 'bg-primary/10 font-semibold',
        colorClass
      )}
      animate={isLast ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <div className="flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 leading-relaxed space-y-1">
        <div>{entry.description}</div>
        {entry.hitRoll && entry.action !== CombatActionType.WEAPON_ABILITY && (
          <div className="text-xs text-muted-foreground">
            🎲 [{entry.hitRoll.dice[0]}+{entry.hitRoll.dice[1]}] = {entry.hitRoll.total} 
            {entry.hitRoll.success ? ' → Touché !' : ' → Raté !'}
          </div>
        )}
        {entry.damageRoll && (
          <div className="text-xs text-orange-500">
            ⚔️ 1+{entry.damageRoll.dice}+{entry.damageRoll.bonus} = {entry.damageRoll.total} dégâts
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Groupe les entrées d'historique par numéro de round
 */
function groupHistoryByRound(history: readonly CombatHistoryEntry[]): Array<{ roundNumber: number; entries: CombatHistoryEntry[] }> {
  const grouped = new Map<number, CombatHistoryEntry[]>();

  for (const entry of history) {
    const round = entry.round;
    if (!grouped.has(round)) {
      grouped.set(round, []);
    }
    grouped.get(round)!.push(entry);
  }

  return Array.from(grouped.entries())
    .map(([roundNumber, entries]) => ({ roundNumber, entries }))
    .sort((a, b) => a.roundNumber - b.roundNumber);
}

/**
 * Retourne l'icône pour un type d'action
 */
function getActionIcon(action: CombatActionType, attacker: Attacker): React.ReactNode {
  const isPlayer = attacker === Attacker.PLAYER;
  
  switch (action) {
    case CombatActionType.ATTACK:
      return isPlayer ? <Swords className="size-4 text-primary" /> : <Swords className="size-4 text-red-500" />;
    case CombatActionType.REROLL:
      return <Dices className="size-4 text-blue-500" />;
    case CombatActionType.USE_ITEM:
      return <Sparkles className="size-4 text-green-500" />;
    case CombatActionType.WEAPON_ABILITY:
      return <Wand2 className="size-4 text-purple-500" />;
    default:
      return <Dices className="size-4" />;
  }
}

/**
 * Retourne la classe de couleur pour un type d'action
 */
function getActionColorClass(action: CombatActionType): string {
  switch (action) {
    case CombatActionType.ATTACK:
      return 'text-foreground';
    case CombatActionType.REROLL:
      return 'text-blue-400';
    case CombatActionType.USE_ITEM:
      return 'text-green-400';
    case CombatActionType.WEAPON_ABILITY:
      return 'text-purple-400';
    default:
      return 'text-muted-foreground';
  }
}
