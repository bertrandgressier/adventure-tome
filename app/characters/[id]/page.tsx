'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCharacterStore } from '@/src/presentation/providers/character-store-provider';
import type { Enemy, CombatMode } from '@/src/domain/types/combat';
import type { CatalogItem } from '@/src/domain/types/items';
import { ItemType } from '@/src/domain/types/items';
import CombatSetup from '@/components/adventure/CombatSetup';
import CombatInterface from '@/components/adventure/CombatInterface';
import CombatEndModal from '@/components/adventure/CombatEndModal';
import CharacterStats from '@/src/presentation/components/CharacterStats';
import CharacterProgress from '@/src/presentation/components/CharacterProgress';
import CharacterTalents from '@/src/presentation/components/CharacterTalents';
import CharacterTimeTracking from '@/src/presentation/components/CharacterTimeTracking';
import CharacterWeapon from '@/src/presentation/components/CharacterWeapon';
import CharacterInventory from '@/src/presentation/components/CharacterInventory';
import CharacterNotes from '@/src/presentation/components/CharacterNotes';
import DiceRoller from '@/components/character/DiceRoller';
import { AddItemModal } from '@/src/presentation/components/AddItemModal';
import { GameModeBadge } from '@/components/ui/game-mode-badge';
import { CombatArena } from '@/src/presentation/components/combat';
import type { EnemyConfig, CombatConfig } from '@/src/domain/types/combat-v2';

export default function CharacterDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  // Zustand store - chargé depuis le cache
  const character = useCharacterStore((state) => state.getCharacter(id));
  const isLoading = useCharacterStore((state) => state.isLoading);
  const hasInitialLoad = useCharacterStore((state) => state.hasInitialLoad);
  const loadOne = useCharacterStore((state) => state.loadOne);
  const updateName = useCharacterStore((state) => state.updateName);
  const equipWeapon = useCharacterStore((state) => state.equipWeapon);
  const applyDamage = useCharacterStore((state) => state.applyDamage);

  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  // Modal states
  const [showItemModal, setShowItemModal] = useState(false);
  const [showDiceModal, setShowDiceModal] = useState(false);
  const [showCombatV2, setShowCombatV2] = useState(false);



  // Combat states
  const [showCombatSetup, setShowCombatSetup] = useState(false);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [combatMode, setCombatMode] = useState<CombatMode>('auto');
  const [firstAttacker, setFirstAttacker] = useState<'player' | 'enemy'>('player');
  const [showCombat, setShowCombat] = useState(false);
  const [combatEndStatus, setCombatEndStatus] = useState<'victory' | 'defeat' | null>(null);
  const [roundsCount, setRoundsCount] = useState(0);
  const [remainingEndurance, setRemainingEndurance] = useState(0);

  // Charger le personnage spécifique s'il n'est pas dans le cache
  useEffect(() => {
    if (hasInitialLoad && !character && !isLoading) {
      loadOne(id);
    }
  }, [hasInitialLoad, character, isLoading, id, loadOne]);

  // Redirect si personnage non trouvé après chargement
  useEffect(() => {
    if (hasInitialLoad && !isLoading && !character) {
      router.push('/characters');
    }
  }, [hasInitialLoad, isLoading, character, router]);

  // Modal handlers for adding weapon/item
  const handleEquipItem = async (catalogItem: CatalogItem) => {
    try {
      await equipWeapon(id, { name: catalogItem.name, attackPoints: catalogItem.attackPoints || 0 });
      setShowItemModal(false);
    } catch (error) {
      console.error('Error adding weapon:', error);
    }
  };

  // Combat handlers
  const handleStartCombat = (enemy: Enemy, mode: CombatMode, firstAttacker: 'player' | 'enemy') => {
    setCurrentEnemy(enemy);
    setCombatMode(mode);
    setFirstAttacker(firstAttacker);
    setShowCombatSetup(false);
    setShowCombat(true);
  };

  const handleCombatEnd = async (status: 'victory' | 'defeat', finalEnd: number, rounds: number) => {
    if (!character) return;

    setCombatEndStatus(status);
    setRoundsCount(rounds);
    setRemainingEndurance(finalEnd);

    // Calculer les dégâts et appliquer via le store
    const data = character.toData();
    const damageAmount = data.stats.pointsDeVieActuels - finalEnd;
    if (damageAmount > 0) {
      await applyDamage(id, damageAmount);
    }

    setShowCombat(false);
  };

  const handleCloseCombatModal = () => {
    setCombatEndStatus(null);
  };

  const handleNameClick = () => {
    if (!character) return;
    setTempName(character.name);
    setEditingName(true);
  };

  const handleNameSave = async () => {
    if (!character || !tempName.trim()) return;
    
    try {
      await updateName(id, tempName.trim());
      setEditingName(false);
    } catch (error) {
      console.error('Error updating name:', error);
    }
  };

  const handleNameCancel = () => {
    setEditingName(false);
    setTempName('');
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      handleNameCancel();
    }
  };

  // Combat V2 handlers
  const startCombat = useCharacterStore((state) => state.startCombat);

  const handleStartCombatV2 = () => {
    if (!character) return;

    // Configuration de test avec un ennemi simple
    const testEnemy: EnemyConfig = {
      name: 'Gobelin (Test)',
      dexterite: 6,
      endurance: 8,
      enduranceMax: 8,
      chance: 0,
      weapon: { id: 'dagger', name: 'Dague', bonus: 1 },
      isBoss: false,
    };

    const config: CombatConfig = {
      allowFlee: true,
      maxEnemies: 1,
      damageFormula: 'standard',
      isSurprise: false,
    };

    try {
      startCombat(id, [testEnemy], config);
      setShowCombatV2(true);
    } catch (error) {
      console.error('Error starting Combat V2:', error);
    }
  };

  const handleExitCombatV2 = () => {
    setShowCombatV2(false);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto py-8">
          <p className="text-muted-light text-center py-8">Chargement...</p>
        </div>
      </main>
    );
  }

  if (!character) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/characters')}
            className="text-muted-light hover:text-primary transition-colors text-2xl mr-4"
          >
            ←
          </button>
          <div className="flex-1">
            {editingName ? (
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={handleNameKeyDown}
                  autoFocus
                  onFocus={(e) => e.target.select()}
                  className="font-[var(--font-uncial)] text-3xl sm:text-4xl tracking-wider text-primary bg-background border-2 border-primary rounded px-2 py-1 focus:outline-none focus:border-primary"
                />
                <button
                  onClick={handleNameSave}
                  className="text-green-400 hover:text-green-300 text-2xl"
                >
                  ✓
                </button>
                <button
                  onClick={handleNameCancel}
                  className="text-red-400 hover:text-red-300 text-2xl"
                >
                  ✕
                </button>
              </div>
            ) : (
              <h1 
                onClick={handleNameClick}
                className="font-[var(--font-uncial)] text-3xl sm:text-4xl tracking-wider text-primary mb-2 cursor-pointer hover:text-primary/80 transition-colors"
              >
                {character.name}
              </h1>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-[var(--font-merriweather)] text-muted-light">
                Talent : <span className="text-primary">{character.talent}</span>
              </p>
              <span className="text-muted-light">•</span>
              <GameModeBadge gameMode={character.gameMode} showLabel />
            </div>
          </div>
        </div>

        {/* Actions principales */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <button
            onClick={() => setShowCombatSetup(true)}
            className="bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-[var(--font-uncial)] font-bold px-3 py-3 sm:px-6 sm:py-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-500/50 hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-lg flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3"
            title="Lancer un combat"
          >
            <span className="text-xl sm:text-2xl">⚔️</span>
            <span className="leading-tight">Combat</span>
          </button>
          <button
            onClick={() => setShowDiceModal(true)}
            className="bg-gradient-to-br from-primary to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-primary-foreground font-[var(--font-uncial)] font-bold px-3 py-3 sm:px-6 sm:py-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-lg flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3"
            title="Lancer les dés"
          >
            <span className="text-xl sm:text-2xl">🎲</span>
            <span className="leading-tight">Lancer les dés</span>
          </button>
        </div>

        {/* Bouton de test Combat V2 (DEV) */}
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-purple-400 font-bold text-sm">🧪 DEV - Combat V2</h3>
            <span className="text-xs text-purple-300/60">En développement</span>
          </div>
          <button
            onClick={handleStartCombatV2}
            className="w-full bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white font-[var(--font-uncial)] font-bold px-4 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98] text-sm flex items-center justify-center gap-2"
            title="Tester le nouveau système de combat (PR #103)"
          >
            <span className="text-xl">⚔️</span>
            <span>Combat V2 (Test Gobelin)</span>
          </button>
          <p className="text-xs text-purple-300/60 mt-2 text-center">
            Démarre un combat contre un Gobelin de test
          </p>
        </div>

        {/* Stats Section */}
        <div className="bg-card glow-border rounded-lg p-6">
          <CharacterStats characterId={id} />
        </div>

        {/* Talents Section */}
        <CharacterTalents characterId={id} />

        {/* Progress Section */}
        <CharacterProgress characterId={id} />

        {/* Time Tracking Section (Tome 2 only) */}
        {character.book === 2 && (
          <CharacterTimeTracking characterId={id} />
        )}

        {/* Weapon Section */}
        <div>
          <CharacterWeapon
            characterId={id}
            onOpenAddWeaponModal={() => setShowItemModal(true)}
          />
        </div>

        {/* Inventory Section */}
        <CharacterInventory
          characterId={id}
        />

        {/* Notes Section */}
        <CharacterNotes characterId={id} />

        {/* Modals */}
        <AddItemModal
          open={showItemModal}
          onOpenChange={setShowItemModal}
          onAddItem={handleEquipItem}
          currentTome={character.book as 1 | 2 | 3}
          mode="equipped"
          filterType={ItemType.WEAPON}
        />

        {showDiceModal && (
          <DiceRoller onClose={() => setShowDiceModal(false)} />
        )}

        {showCombatSetup && (
          <CombatSetup
            onStartCombat={handleStartCombat}
            onCancel={() => setShowCombatSetup(false)}
          />
        )}

        {showCombat && currentEnemy && character && (
          <CombatInterface
            character={character.toData()}
            enemy={currentEnemy}
            mode={combatMode}
            firstAttacker={firstAttacker}
            onCombatEnd={handleCombatEnd}
            onClose={() => setShowCombat(false)}
          />
        )}

        {combatEndStatus && (
          <CombatEndModal
            status={combatEndStatus}
            playerName={character.name}
            enemyName={currentEnemy?.name || 'Adversaire'}
            roundsCount={roundsCount}
            remainingEndurance={remainingEndurance}
            characterId={id}
            onClose={handleCloseCombatModal}
          />
        )}

        {/* Combat V2 Arena */}
        {showCombatV2 && (
          <CombatArena characterId={id} onExit={handleExitCombatV2} />
        )}
      </div>
    </main>
  );
}
