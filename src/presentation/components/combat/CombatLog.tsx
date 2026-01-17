'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { ScrollText, ChevronUp, ChevronDown, Swords, Heart, Sparkles, Wand2, Dices, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { CombatEvent } from '@/src/domain/types/combat-v2';
import { CombatEventType } from '@/src/domain/types/CombatEventType';
import {
  getIconColorClass,
  getEventColorClass,
  formatEventDescription,
} from './combatLogHelpers';

export interface CombatLogProps {
  events: readonly CombatEvent[];
}

const logContainerVariants = {
  collapsed: {
    height: 'auto',
  },
  expanded: {
    height: 'max-content',
  },
};

const logContentVariants = {
  collapsed: {
    opacity: 0,
    height: 0,
  },
  expanded: {
    opacity: 1,
    height: 'auto',
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.05,
    },
  },
};

const eventVariants = {
  collapsed: { opacity: 0, x: -20 },
  expanded: { opacity: 1, x: 0 },
};

export function CombatLog({ events }: CombatLogProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion() ?? false;

  const eventsByRound = groupEventsByRound(events);
  const totalEvents = events.length;

  useEffect(() => {
    if (isExpanded && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isExpanded, events]);

  const lastEventIndex = totalEvents - 1;
  const lastEvent = events[lastEventIndex];

  return (
    <div className="flex flex-col gap-2">
      <motion.div variants={prefersReducedMotion ? {} : logContainerVariants} initial="collapsed" animate={isExpanded ? 'expanded' : 'collapsed'}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'w-full justify-between font-cinzel text-sm border-primary/50 bg-card/50 hover:bg-card',
            isExpanded && 'border-primary'
          )}
          aria-expanded={isExpanded}
          aria-controls="combat-log-content"
        >
          <span className="flex items-center gap-2">
            <ScrollText className="size-4" />
            Historique ({totalEvents})
          </span>
          {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </Button>

        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.div
              id="combat-log-content"
              ref={scrollRef}
              variants={prefersReducedMotion ? {} : logContentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="mt-2 overflow-hidden max-h-[40vh] border border-border/50 rounded-lg bg-card/30"
            >
              <ScrollArea className="h-full">
                <div className="p-3 space-y-3">
                  {eventsByRound.map(({ roundNumber, events: roundEvents }) => (
                    <motion.div
                      key={roundNumber}
                      variants={prefersReducedMotion ? {} : eventVariants}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2 text-xs font-cinzel text-primary/70 border-b border-primary/20 pb-1">
                        <span>Round {roundNumber}</span>
                      </div>

                      <div className="space-y-1.5 pl-2">
                        {roundEvents.map((event, idx) => (
                          <CombatLogEntry key={`${event.type}-${event.timestamp}-${idx}`} event={event} isLast={event.type === lastEvent?.type && event.timestamp === lastEvent?.timestamp} />
                        ))}
                      </div>
                    </motion.div>
                  ))}

                  {totalEvents === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-4">
                      Aucun événement pour le moment
                    </div>
                  )}
                </div>
              </ScrollArea>

              {lastEvent && (
                <div className="sr-only" aria-live="polite" aria-atomic="true">
                  {formatEventDescription(lastEvent)}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

interface CombatLogEntryProps {
  event: CombatEvent;
  isLast: boolean;
}

function CombatLogEntry({ event, isLast }: CombatLogEntryProps) {
  const description = formatEventDescription(event);
  const colorClass = getEventColorClass(event.type);
  const iconColorClass = getIconColorClass(event.type);
  const icon = getEventIcon(event.type);

  return (
    <div
      className={cn(
        'flex items-start gap-2 text-sm py-1',
        isLast && 'font-semibold',
        colorClass
      )}
    >
      <div className={cn('flex-shrink-0 mt-0.5', iconColorClass)}>
        {icon}
      </div>
      <span className="flex-1 leading-relaxed">{description}</span>
    </div>
  );
}

/**
 * Groupe les événements de combat par numéro de round
 * Cette fonction est purement utilitaire et ne contient pas de logique métier
 */
function groupEventsByRound(events: readonly CombatEvent[]): Array<{ roundNumber: number; events: CombatEvent[] }> {
  const grouped = new Map<number, CombatEvent[]>();

  for (const event of events) {
    const round = event.round ?? 0;
    if (!grouped.has(round)) {
      grouped.set(round, []);
    }
    grouped.get(round)!.push(event);
  }

  return Array.from(grouped.entries())
    .map(([roundNumber, events]) => ({ roundNumber, events }))
    .sort((a, b) => a.roundNumber - b.roundNumber);
}

/**
 * Retourne l'icône JSX pour un type d'événement
 */
function getEventIcon(type: string): React.ReactNode {
  switch (type) {
    case CombatEventType.COMBAT_START:
      return <Swords className="size-4" />;
    case CombatEventType.COMBAT_END:
      return <Sparkles className="size-4" />;
    case CombatEventType.ROUND_START:
    case CombatEventType.ROUND_END:
      return <Dices className="size-4" />;
    case CombatEventType.ATTACK_ROLL:
      return <Swords className="size-4" />;
    case CombatEventType.DAMAGE_DEALT:
      return <Heart className="size-4" />;
    case CombatEventType.HEAL:
      return <Sparkles className="size-4" />;
    case CombatEventType.ABILITY_USED:
    case CombatEventType.WEAPON_ABILITY:
      return <Wand2 className="size-4" />;
    case CombatEventType.LUCK_TEST:
      return <Sparkles className="size-4" />;
    case CombatEventType.CHANCE_SPENT:
      return <Zap className="size-4" />;
    case CombatEventType.FLEE:
      return <ArrowRight className="size-4" />;
    case CombatEventType.ITEM_USED:
      return <Wand2 className="size-4" />;
    default:
      return <Dices className="size-4" />;
  }
}
