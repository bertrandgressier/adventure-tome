'use client';

import { useState, useEffect, useRef } from 'react';
import type { CharacterDTO } from '@/src/infrastructure/dto/CharacterDTO';
import type { Enemy, CombatState, CombatMode } from '@/src/domain/types/combat';
import { CombatService } from '@/src/domain/services/CombatService';
import CombatRoundDisplay from './CombatRoundDisplay';
import { trackCombatStart } from '@/src/infrastructure/analytics/tracking';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CombatInterfaceProps {
  character: CharacterDTO;
  enemy: Enemy;
  mode: CombatMode;
  firstAttacker: 'player' | 'enemy';
  onCombatEnd: (status: 'victory' | 'defeat', finalEndurance: number, roundsCount: number) => void;
  onClose?: () => void;
}

export default function CombatInterface({
  character,
  enemy: initialEnemy,
  mode: initialMode,
  firstAttacker,
  onCombatEnd,
  onClose
}: CombatInterfaceProps) {
  const [combatState, setCombatState] = useState<CombatState>({
    enemy: { ...initialEnemy },
    rounds: [],
    playerEndurance: character.stats.pointsDeVieActuels,
    enemyEndurance: initialEnemy.endurance,
    status: 'ongoing',
    nextAttacker: firstAttacker
  });

  const [currentMode, setCurrentMode] = useState<CombatMode>(initialMode);
  const [isRolling, setIsRolling] = useState(false);
  const [showEndButton, setShowEndButton] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);
  const combatTrackedRef = useRef(false); // Pour tracker le début une seule fois
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Nettoyage des timers au démontage
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Tracker le début du combat
  useEffect(() => {
    if (!combatTrackedRef.current) {
      trackCombatStart(initialEnemy.name, {
        habilete: character.stats.dexterite,
        endurance: character.stats.pointsDeVieActuels,
      });
      combatTrackedRef.current = true;
    }
  }, [initialEnemy.name, character.stats.dexterite, character.stats.pointsDeVieActuels]);

  const executeRound = (hitDiceRoll?: number, damageDiceRoll?: number) => {
    setIsRolling(true);

    // Simuler un délai pour l'animation des dés
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const playerWeaponPoints = character.inventory.weapon?.attackPoints || 0;
      const roundNumber = combatState.rounds.length + 1;

      const round = CombatService.resolveCombatRound(
        roundNumber,
        combatState.nextAttacker,
        character.stats.dexterite,
        combatState.playerEndurance,
        playerWeaponPoints,
        combatState.enemy,
        combatState.enemyEndurance,
        hitDiceRoll,
        damageDiceRoll
      );

      // Alterner l'attaquant pour le prochain round
      const nextAttacker = combatState.nextAttacker === 'player' ? 'enemy' : 'player';

      // Appliquer le round
      setCombatState(prev => ({
        ...prev,
        rounds: [...prev.rounds, round],
        playerEndurance: round.playerEnduranceAfter,
        enemyEndurance: round.enemyEnduranceAfter,
        enemy: { ...prev.enemy, endurance: round.enemyEnduranceAfter },
        nextAttacker
      }));
      
      setIsRolling(false);
    }, currentMode === 'auto' ? 1000 : 0);
  };

  // Scroll automatique vers le bas à chaque nouveau round
  useEffect(() => {
    if (historyRef.current && combatState.rounds.length > 0) {
      // Utiliser setTimeout pour s'assurer que le DOM est mis à jour
      setTimeout(() => {
        if (historyRef.current) {
          historyRef.current.scrollTop = historyRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [combatState.rounds.length]);

  // Mode automatique : lancer les rounds automatiquement
  useEffect(() => {
    if (currentMode === 'auto' && combatState.status === 'ongoing' && !isRolling && !showEndButton) {
      const timer = setTimeout(() => {
        executeRound();
      }, 1000);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMode, combatState.status, combatState.rounds.length, isRolling, showEndButton]);

  // Vérifier la fin du combat
  useEffect(() => {
    if (combatState.playerEndurance <= 0 || combatState.enemyEndurance <= 0) {
      setShowEndButton(true);
      setCurrentMode('manual'); // Stop auto mode on end
    }
  }, [combatState.playerEndurance, combatState.enemyEndurance]);

  const playerWeaponName = character.inventory.weapon?.name || 'Aucune';
  const playerWeaponPoints = character.inventory.weapon?.attackPoints || 0;

  const handleEndCombat = () => {
    if (combatState.playerEndurance <= 0) {
      setCombatState(prev => ({ ...prev, status: 'defeat' }));
      onCombatEnd('defeat', 0, combatState.rounds.length);
    } else if (combatState.enemyEndurance <= 0) {
      setCombatState(prev => ({ ...prev, status: 'victory' }));
      onCombatEnd('victory', combatState.playerEndurance, combatState.rounds.length);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose && onClose()}>
      <DialogContent className="max-w-4xl w-full bg-card border-2 border-primary p-4 h-[90vh] flex flex-col sm:max-w-4xl" aria-describedby={undefined}>
        <DialogHeader className="shrink-0">
          <DialogTitle className="font-[var(--font-uncial)] text-2xl text-primary text-center mb-2">
            ⚔️ COMBAT EN COURS ⚔️
          </DialogTitle>
        </DialogHeader>

        {/* Stats des combattants */}
        <div className="grid grid-cols-2 gap-3 mb-4 shrink-0">
          {/* Joueur */}
          <div className={`bg-background border-2 rounded-lg p-3 transition-all duration-300 ${
            combatState.nextAttacker === 'player' && combatState.status === 'ongoing'
              ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)] scale-[1.02] z-10' 
              : 'border-green-500/30 opacity-70 grayscale-[0.3]'
          }`}>
            <h3 className="font-[var(--font-uncial)] text-lg text-primary mb-2 truncate flex items-center gap-2">
              {combatState.nextAttacker === 'player' && combatState.status === 'ongoing' && <span className="text-green-500 animate-pulse">▶</span>}
              {character.name}
            </h3>
            <div className="space-y-1 font-[var(--font-geist-mono)] text-xs">
              <div className="flex justify-between">
                <span className="text-muted-light">DEXTÉRITÉ:</span>
                <span className="text-light font-bold">{character.stats.dexterite}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-light">ENDURANCE:</span>
                <span className={`font-bold ${
                  combatState.playerEndurance <= character.stats.pointsDeVieMax / 4
                    ? 'text-red-400'
                    : 'text-green-400'
                }`}>
                  {combatState.playerEndurance}/{character.stats.pointsDeVieMax}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-light">ARME:</span>
                <span className="text-primary font-bold truncate ml-2">
                  {playerWeaponName} (+{playerWeaponPoints})
                </span>
              </div>
            </div>
          </div>

          {/* Ennemi */}
          <div className={`bg-background border-2 rounded-lg p-3 transition-all duration-300 ${
            combatState.nextAttacker === 'enemy' && combatState.status === 'ongoing'
              ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] scale-[1.02] z-10' 
              : 'border-red-500/30 opacity-70 grayscale-[0.3]'
          }`}>
            <h3 className="font-[var(--font-uncial)] text-lg text-primary mb-2 truncate flex items-center gap-2 justify-end">
              {combatState.enemy.name}
              {combatState.nextAttacker === 'enemy' && combatState.status === 'ongoing' && <span className="text-red-500 animate-pulse">◀</span>}
            </h3>
            <div className="space-y-1 font-[var(--font-geist-mono)] text-xs">
              <div className="flex justify-between">
                <span className="text-muted-light">DEXTÉRITÉ:</span>
                <span className="text-light font-bold">{combatState.enemy.dexterite}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-light">ENDURANCE:</span>
                <span className={`font-bold ${
                  combatState.enemyEndurance <= combatState.enemy.enduranceMax / 4
                    ? 'text-red-400'
                    : 'text-green-400'
                }`}>
                  {combatState.enemyEndurance}/{combatState.enemy.enduranceMax}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Historique des rounds - Zone flexible avec scroll */}
        <div className="flex-1 min-h-0 bg-background rounded-lg p-3 mb-4 flex flex-col border border-primary/20">
          <h3 className="font-[var(--font-uncial)] text-base text-primary mb-2 flex items-center justify-between shrink-0">
            <span>Historique</span>
            {combatState.rounds.length > 0 && (
              <span className="text-xs font-[var(--font-geist-mono)] text-muted-light">
                {combatState.rounds.length} assaut{combatState.rounds.length > 1 ? 's' : ''}
              </span>
            )}
          </h3>
          
          <div ref={historyRef} className="flex-1 overflow-y-auto pr-1 space-y-2 scroll-smooth">
            {combatState.rounds.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="font-[var(--font-merriweather)] text-muted-light text-sm italic">
                  Le combat commence...
                </p>
              </div>
            ) : (
              combatState.rounds.map((round, index) => (
                <CombatRoundDisplay
                  key={index}
                  round={round}
                  playerName={character.name}
                  enemyName={combatState.enemy.name}
                />
              ))
            )}
          </div>
        </div>

        {/* Boutons d'action - Fixe en bas */}
        <div className="shrink-0 space-y-3">
          {showEndButton ? (
            <button
              onClick={handleEndCombat}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-[var(--font-uncial)] font-bold px-6 py-4 rounded-lg text-xl shadow-lg shadow-primary/50 animate-bounce transition-all"
            >
              ✓ Voir le résultat
            </button>
          ) : (
            <div className="flex gap-3">
              {/* Bouton Toggle Auto */}
              <button
                onClick={() => setCurrentMode(prev => prev === 'auto' ? 'manual' : 'auto')}
                disabled={combatState.status !== 'ongoing' || showEndButton}
                className={`px-4 py-3 rounded-lg font-[var(--font-uncial)] font-bold text-sm transition-all border-2 flex flex-col items-center justify-center min-w-[80px] ${
                  currentMode === 'auto'
                    ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_hsl(var(--primary)/0.3)]'
                    : 'bg-background border-muted-light/30 text-muted-light hover:border-primary/50 hover:text-primary'
                }`}
              >
                <span className="text-xl mb-1">{currentMode === 'auto' ? '⚡' : '🎲'}</span>
                {currentMode === 'auto' ? 'AUTO' : 'MANUEL'}
              </button>

              {/* Bouton Principal d'Action */}
              <button
                onClick={() => executeRound()}
                disabled={isRolling || combatState.status !== 'ongoing' || currentMode === 'auto'}
                className={`flex-1 font-[var(--font-uncial)] font-bold px-6 py-3 rounded-lg text-lg transition-all shadow-lg flex items-center justify-center gap-2 ${
                  currentMode === 'auto'
                    ? 'bg-muted opacity-50 cursor-not-allowed text-muted-foreground'
                    : 'bg-gradient-to-r from-primary to-yellow-400 hover:from-yellow-400 hover:to-primary text-primary-foreground hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {currentMode === 'auto' ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Combat automatique...
                  </>
                ) : isRolling ? (
                  <>
                    <span className="animate-spin">🎲</span>
                    Lancer...
                  </>
                ) : (
                  <>
                    <span>🎲</span>
                    Lancer les dés
                  </>
                )}
              </button>
            </div>
          )}
          
          <p className="text-[10px] text-muted-light text-center font-[var(--font-merriweather)]">
            Round #{combatState.rounds.length + 1} • {currentMode === 'auto' ? 'Les dés sont lancés automatiquement' : 'Lancez les dés pour combattre'}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

