'use client';

import { CombatArena } from './CombatArena';

export interface CombatStateDemoProps {
  /**
   * ID du personnage
   */
  characterId: string;
  
  /**
   * Callback optionnel pour la sortie
   */
  onExit?: () => void;
}

/**
 * Wrapper simple pour CombatArena dans Storybook
 * L'état du combat est injecté via decorator
 */
export function CombatStateDemo({ characterId, onExit }: CombatStateDemoProps) {
  return <CombatArena characterId={characterId} onExit={onExit || (() => {})} />;
}
