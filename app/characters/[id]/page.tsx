'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getCharacter, deleteCharacter, updateCharacter } from '@/lib/storage/characters';
import type { Character } from '@/lib/types/character';
import type { Enemy, CombatMode } from '@/lib/types/combat';
import CombatSetup from '@/app/components/adventure/CombatSetup';
import CombatInterface from '@/app/components/adventure/CombatInterface';
import CombatEndModal from '@/app/components/adventure/CombatEndModal';
import CharacterStats from '@/app/components/character/CharacterStats';
import CharacterProgress from '@/app/components/character/CharacterProgress';
import CharacterWeapon from '@/app/components/character/CharacterWeapon';
import CharacterInventory from '@/app/components/character/CharacterInventory';
import DiceRoller from '@/app/components/character/DiceRoller';
import AddWeaponModal from '@/app/components/character/AddWeaponModal';
import AddItemModal from '@/app/components/character/AddItemModal';

export default function CharacterDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  
  // Modal states
  const [showWeaponModal, setShowWeaponModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showDiceModal, setShowDiceModal] = useState(false);
  
  // Combat states
  const [showCombatSetup, setShowCombatSetup] = useState(false);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [combatMode, setCombatMode] = useState<CombatMode>('auto');
  const [firstAttacker, setFirstAttacker] = useState<'player' | 'enemy'>('player');
  const [showCombat, setShowCombat] = useState(false);
  const [combatEndStatus, setCombatEndStatus] = useState<'victory' | 'defeat' | null>(null);
  const [roundsCount, setRoundsCount] = useState(0);

  useEffect(() => {
    loadCharacter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadCharacter = async () => {
    try {
      const char = await getCharacter(id);
      if (!char) {
        router.push('/characters');
        return;
      }
      setCharacter(char);
    } catch (error) {
      console.error('Error loading character:', error);
      router.push('/characters');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce personnage ?')) {
      return;
    }

    try {
      await deleteCharacter(id);
      router.push('/characters');
    } catch (error) {
      console.error('Error deleting character:', error);
    }
  };

  // Generic character update handler
  const handleUpdateCharacter = async (updatedCharacter: Character) => {
    try {
      await updateCharacter(updatedCharacter);
      setCharacter(updatedCharacter);
    } catch (error) {
      console.error('Error updating character:', error);
    }
  };

  // Modal handlers for adding weapon/item
  const handleAddWeapon = async (name: string, attackPoints: number) => {
    if (!character) return;

    const updatedCharacter = {
      ...character,
      inventory: {
        ...character.inventory,
        weapon: { name, attackPoints }
      },
      updatedAt: new Date().toISOString()
    };
    await handleUpdateCharacter(updatedCharacter);
  };

  const handleAddItem = async (name: string) => {
    if (!character) return;

    const updatedCharacter = {
      ...character,
      inventory: {
        ...character.inventory,
        items: [
          ...character.inventory.items,
          { name, possessed: true }
        ]
      },
      updatedAt: new Date().toISOString()
    };
    await handleUpdateCharacter(updatedCharacter);
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

    // Mettre à jour les PV du personnage
    const updatedCharacter = {
      ...character,
      stats: {
        ...character.stats,
        pointsDeVieActuels: finalEnd
      },
      updatedAt: new Date().toISOString()
    };
    await handleUpdateCharacter(updatedCharacter);

    setShowCombat(false);
  };

  const handleResurrect = async () => {
    if (!character) return;

    const updatedCharacter = {
      ...character,
      stats: {
        ...character.stats,
        pointsDeVieActuels: 0
      },
      updatedAt: new Date().toISOString()
    };
    await handleUpdateCharacter(updatedCharacter);
    setCombatEndStatus(null);
  };

  const handleDeleteCharacterAfterDeath = async () => {
    await handleDelete();
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
    
    const updatedCharacter = {
      ...character,
      name: tempName.trim(),
      updatedAt: new Date().toISOString()
    };
    await handleUpdateCharacter(updatedCharacter);
    setEditingName(false);
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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#1a140f] p-4">
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
    <main className="min-h-screen bg-[#1a140f] p-4">
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
                  className="font-[var(--font-uncial)] text-3xl sm:text-4xl tracking-wider text-[#FFBF00] bg-[#1a140f] border-2 border-primary rounded px-2 py-1 focus:outline-none focus:border-yellow-400"
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
                className="font-[var(--font-uncial)] text-3xl sm:text-4xl tracking-wider text-[#FFBF00] mb-2 cursor-pointer hover:text-yellow-400 transition-colors"
              >
                {character.name}
              </h1>
            )}
            <p className="font-[var(--font-merriweather)] text-muted-light">
              Talent : <span className="text-primary">{character.talent}</span>
            </p>
          </div>
        </div>

        {/* Actions principales */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setShowCombatSetup(true)}
            className="bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-[var(--font-uncial)] font-bold px-6 py-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-500/50 hover:scale-[1.02] active:scale-[0.98] text-lg flex items-center justify-center gap-3"
            title="Lancer un combat"
          >
            <span className="text-2xl">⚔️</span>
            <span>Combat</span>
          </button>
          <button
            onClick={() => setShowDiceModal(true)}
            className="bg-gradient-to-br from-primary to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-[#000000] font-[var(--font-uncial)] font-bold px-6 py-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] text-lg flex items-center justify-center gap-3"
            title="Lancer les dés"
          >
            <span className="text-2xl">🎲</span>
            <span>Lancer les dés</span>
          </button>
        </div>

        {/* Stats Section */}
        <div className="bg-[#2a1e17] glow-border rounded-lg p-6">
          <h2 className="font-[var(--font-uncial)] text-xl tracking-wide text-light mb-4">Caractéristiques</h2>
          <CharacterStats character={character} onUpdate={handleUpdateCharacter} />
        </div>

        {/* Progress Section */}
        <CharacterProgress
          character={character}
          onUpdate={handleUpdateCharacter}
        />

        {/* Weapon Section */}
        <CharacterWeapon
          character={character}
          onUpdate={handleUpdateCharacter}
          onOpenAddWeaponModal={() => setShowWeaponModal(true)}
        />

        {/* Inventory Section */}
        <CharacterInventory
          character={character}
          onUpdate={handleUpdateCharacter}
          onOpenAddItemModal={() => setShowItemModal(true)}
        />

        {/* Action Buttons - Supprimés car les icônes + sont dans les sections */}

        {/* Notes Section */}
        {character.notes && (
          <div className="bg-[#2a1e17] glow-border rounded-lg p-6">
            <h2 className="font-[var(--font-uncial)] text-xl tracking-wide text-light mb-4">Notes</h2>
            <p className="font-[var(--font-merriweather)] text-light whitespace-pre-wrap">{character.notes}</p>
          </div>
        )}

        {/* Modals */}
        {showWeaponModal && (
          <AddWeaponModal
            onAdd={handleAddWeapon}
            onClose={() => setShowWeaponModal(false)}
          />
        )}

        {showItemModal && (
          <AddItemModal
            onAdd={handleAddItem}
            onClose={() => setShowItemModal(false)}
          />
        )}

        {showDiceModal && (
          <DiceRoller onClose={() => setShowDiceModal(false)} />
        )}

        {showCombatSetup && (
          <CombatSetup
            onStartCombat={handleStartCombat}
            onCancel={() => setShowCombatSetup(false)}
          />
        )}

        {showCombat && currentEnemy && (
          <CombatInterface
            character={character}
            enemy={currentEnemy}
            mode={combatMode}
            firstAttacker={firstAttacker}
            onCombatEnd={handleCombatEnd}
          />
        )}

        {combatEndStatus && (
          <CombatEndModal
            status={combatEndStatus}
            playerName={character.name}
            enemyName={currentEnemy?.name || 'Adversaire'}
            roundsCount={roundsCount}
            characterId={id}
            onResurrect={handleResurrect}
            onDelete={handleDeleteCharacterAfterDeath}
            onClose={handleCloseCombatModal}
          />
        )}
      </div>
    </main>
  );
}
