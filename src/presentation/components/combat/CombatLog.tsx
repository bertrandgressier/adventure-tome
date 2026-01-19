'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { ScrollText, ChevronUp, ChevronDown, Swords, Heart, Sparkles, Wand2, Dices, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export function CombatLog({ events }: CombatLogProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const prevEventsLengthRef = useRef(events.length);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const eventsByRound = groupEventsByRound(events);
  const totalEvents = events.length;

  // Vérifier si on peut scroller vers le bas
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setCanScrollDown(scrollHeight - scrollTop - clientHeight > 10);
    }
  };

  // Auto-scroll vers le bas quand de nouveaux événements arrivent
  useEffect(() => {
    if (scrollRef.current && events.length > prevEventsLengthRef.current) {
      // Scroll smooth vers le bas après un court délai pour l'animation
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
      }, 100);
    }
    prevEventsLengthRef.current = events.length;
  }, [events.length, prefersReducedMotion]);

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

  const lastEventIndex = totalEvents - 1;
  const lastEvent = events[lastEventIndex];

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
            Historique ({totalEvents})
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
                  {eventsByRound.map(({ roundNumber, events: roundEvents }) => (
                    <motion.div
                      key={roundNumber}
                      variants={prefersReducedMotion ? {} : eventVariants}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2 text-xs font-cinzel text-primary/70 border-b border-primary/20 pb-1 sticky top-0 bg-card/95 backdrop-blur-sm z-10">
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

              {lastEvent && (
                <div className="sr-only" aria-live="polite" aria-atomic="true">
                  {formatEventDescription(lastEvent)}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
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
    <motion.div
      className={cn(
        'flex items-start gap-2 text-sm py-1.5 px-2 rounded transition-colors',
        isLast && 'bg-primary/10 font-semibold',
        colorClass
      )}
      animate={isLast ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <div className={cn('flex-shrink-0 mt-0.5', iconColorClass)}>
        {icon}
      </div>
      <span className="flex-1 leading-relaxed">{description}</span>
    </motion.div>
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
