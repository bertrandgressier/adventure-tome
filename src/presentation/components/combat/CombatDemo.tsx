'use client';

import { useState } from 'react';
import type { CombatConfig } from '@/src/domain/types/combat-v2';
import { CombatArena } from './CombatArena';
import { Button } from '@/components/ui/button';
import { useCharacterStore } from '@/src/presentation/providers/character-store-provider';

export interface CombatDemoProps {
  /**
   * ID du personnage (doit exister dans le store)
   */
  characterId: string;
  
  /**
   * Configuration du combat
   */
  config: CombatConfig;
  
  /**
   * Ennemis à affronter
   */
  enemies: Array<{
    name: string;
    endurance: number;
    dexterite: number;
    weaponBonus?: number;
  }>;
  
  /**
   * Callback appelé à la fin du combat
   */
  onComplete?: (result: 'victory' | 'defeat' | 'fled') => void;
}

/**
 * Composant de démo haut niveau pour tester le Combat V2 dans Storybook
 * 
 * Permet de :
 * - Configurer facilement un combat (ennemis, config)
 * - Démarrer/arrêter le combat avec un bouton
 * - Voir l'état complet du combat
 * 
 * @example
 * ```tsx
 * <CombatDemo
 *   characterId="test-character"
 *   config={{ allowFlee: true, allowItems: true }}
 *   enemies={[{ name: 'Gobelin', endurance: 6, dexterite: 5 }]}
 * />
 * ```
 */
export function CombatDemo({ 
  characterId, 
  config, 
  enemies,
  onComplete,
}: CombatDemoProps) {
  const [isActive, setIsActive] = useState(false);
  const combat = useCharacterStore((state) => state.combat);
  const startCombat = useCharacterStore((state) => state.startCombat);
  const endCombat = useCharacterStore((state) => state.endCombat);

  const handleStart = () => {
    startCombat(characterId, enemies, config);
    setIsActive(true);
  };

  const handleExit = () => {
    const result = combat?.phase === 'victory' 
      ? 'victory' 
      : combat?.phase === 'defeat' 
      ? 'defeat' 
      : 'fled';
    
    endCombat();
    setIsActive(false);
    onComplete?.(result);
  };

  if (isActive && combat) {
    return <CombatArena characterId={characterId} onExit={handleExit} />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-cinzel text-4xl text-primary">Combat Demo</h1>
          <p className="text-muted-foreground">
            Configuration de test pour le système de combat V2
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div>
            <h2 className="font-cinzel text-xl text-primary mb-2">Ennemis</h2>
            <ul className="space-y-2">
              {enemies.map((enemy, index) => (
                <li key={index} className="flex justify-between items-center bg-card/50 p-3 rounded">
                  <span className="font-merriweather">{enemy.name}</span>
                  <div className="text-sm text-muted-foreground space-x-4">
                    <span>END: {enemy.endurance}</span>
                    <span>DEX: {enemy.dexterite}</span>
                    {enemy.weaponBonus && <span>Arme: +{enemy.weaponBonus}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-cinzel text-xl text-primary mb-2">Configuration</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card/50 p-3 rounded">
                <span className="text-sm text-muted-foreground">Fuite autorisée</span>
                <p className="font-semibold">{config.allowFlee ? '✓ Oui' : '✗ Non'}</p>
              </div>
              <div className="bg-card/50 p-3 rounded">
                <span className="text-sm text-muted-foreground">Objets autorisés</span>
                <p className="font-semibold">{config.allowItems ? '✓ Oui' : '✗ Non'}</p>
              </div>
              <div className="bg-card/50 p-3 rounded col-span-2">
                <span className="text-sm text-muted-foreground">Mort en cas de défaite</span>
                <p className="font-semibold">{config.deathOnDefeat ? '✓ Oui' : '✗ Non'}</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleStart}
            className="w-full"
            size="lg"
          >
            Démarrer le combat
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Personnage ID: <code className="bg-card px-2 py-1 rounded">{characterId}</code></p>
        </div>
      </div>
    </div>
  );
}
