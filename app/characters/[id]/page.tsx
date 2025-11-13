'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getCharacter, deleteCharacter, updateCharacter } from '@/lib/storage/characters';
import type { Character } from '@/lib/types/character';
import type { Enemy, CombatMode } from '@/lib/types/combat';
import CombatSetup from '@/app/components/adventure/CombatSetup';
import CombatInterface from '@/app/components/adventure/CombatInterface';
import CombatEndModal from '@/app/components/adventure/CombatEndModal';

export default function CharacterDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingParagraph, setEditingParagraph] = useState(false);
  const [paragraphValue, setParagraphValue] = useState('');
  const [editingBoulons, setEditingBoulons] = useState(false);
  const [boulonsValue, setBoulonsValue] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newWeaponName, setNewWeaponName] = useState('');
  const [newWeaponAttack, setNewWeaponAttack] = useState('');
  const [showWeaponModal, setShowWeaponModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showDiceModal, setShowDiceModal] = useState(false);
  const [diceResult, setDiceResult] = useState<number[]>([]);
  const [diceTotal, setDiceTotal] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  
  // Combat states
  const [showCombatSetup, setShowCombatSetup] = useState(false);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [combatMode, setCombatMode] = useState<CombatMode>('auto');
  const [showCombat, setShowCombat] = useState(false);
  const [combatEndStatus, setCombatEndStatus] = useState<'victory' | 'defeat' | null>(null);
  const [finalEndurance, setFinalEndurance] = useState(0);
  const [editingWeaponName, setEditingWeaponName] = useState(false);
  const [weaponNameValue, setWeaponNameValue] = useState('');
  const [editingWeaponAttack, setEditingWeaponAttack] = useState(false);
  const [weaponAttackValue, setWeaponAttackValue] = useState('');
  const [editingDexterite, setEditingDexterite] = useState(false);
  const [dexteriteValue, setDexteriteValue] = useState('');
  const [editingChance, setEditingChance] = useState(false);
  const [chanceValue, setChanceValue] = useState('');
  const [editingPvMax, setEditingPvMax] = useState(false);
  const [pvMaxValue, setPvMaxValue] = useState('');
  const [editingPvActuels, setEditingPvActuels] = useState(false);
  const [pvActuelsValue, setPvActuelsValue] = useState('');
  const paragraphInputRef = useRef<HTMLInputElement>(null);
  const boulonsInputRef = useRef<HTMLInputElement>(null);
  const weaponNameInputRef = useRef<HTMLInputElement>(null);
  const weaponAttackInputRef = useRef<HTMLInputElement>(null);
  const dexteriteInputRef = useRef<HTMLInputElement>(null);
  const chanceInputRef = useRef<HTMLInputElement>(null);
  const pvMaxInputRef = useRef<HTMLInputElement>(null);
  const pvActuelsInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCharacter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (editingParagraph && paragraphInputRef.current) {
      paragraphInputRef.current.focus();
      paragraphInputRef.current.select();
    }
  }, [editingParagraph]);

  useEffect(() => {
    if (editingBoulons && boulonsInputRef.current) {
      boulonsInputRef.current.focus();
      boulonsInputRef.current.select();
    }
  }, [editingBoulons]);

  useEffect(() => {
    if (editingWeaponName && weaponNameInputRef.current) {
      weaponNameInputRef.current.focus();
      weaponNameInputRef.current.select();
    }
  }, [editingWeaponName]);

  useEffect(() => {
    if (editingWeaponAttack && weaponAttackInputRef.current) {
      weaponAttackInputRef.current.focus();
      weaponAttackInputRef.current.select();
    }
  }, [editingWeaponAttack]);

  useEffect(() => {
    if (editingDexterite && dexteriteInputRef.current) {
      dexteriteInputRef.current.focus();
      dexteriteInputRef.current.select();
    }
  }, [editingDexterite]);

  useEffect(() => {
    if (editingChance && chanceInputRef.current) {
      chanceInputRef.current.focus();
      chanceInputRef.current.select();
    }
  }, [editingChance]);

  useEffect(() => {
    if (editingPvMax && pvMaxInputRef.current) {
      pvMaxInputRef.current.focus();
      pvMaxInputRef.current.select();
    }
  }, [editingPvMax]);

  useEffect(() => {
    if (editingPvActuels && pvActuelsInputRef.current) {
      pvActuelsInputRef.current.focus();
      pvActuelsInputRef.current.select();
    }
  }, [editingPvActuels]);

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

  const handleUpdateParagraph = async () => {
    if (!character) return;

    const newParagraph = parseInt(paragraphValue);
    if (isNaN(newParagraph) || newParagraph < 1) {
      setEditingParagraph(false);
      setParagraphValue('');
      return;
    }

    try {
      const updatedCharacter = {
        ...character,
        progress: {
          ...character.progress,
          currentParagraph: newParagraph,
          history: [...character.progress.history, newParagraph],
          lastSaved: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      };

      await updateCharacter(updatedCharacter);
      setCharacter(updatedCharacter);
      setEditingParagraph(false);
      setParagraphValue('');
    } catch (error) {
      console.error('Error updating paragraph:', error);
    }
  };

  const handleUpdateBoulons = async () => {
    if (!character) return;

    const newBoulons = parseInt(boulonsValue);
    if (isNaN(newBoulons) || newBoulons < 0) {
      setEditingBoulons(false);
      setBoulonsValue('');
      return;
    }

    try {
      const updatedCharacter = {
        ...character,
        inventory: {
          ...character.inventory,
          boulons: newBoulons
        },
        updatedAt: new Date().toISOString()
      };

      await updateCharacter(updatedCharacter);
      setCharacter(updatedCharacter);
      setEditingBoulons(false);
      setBoulonsValue('');
    } catch (error) {
      console.error('Error updating boulons:', error);
    }
  };

  const handleAddItemWithModal = async () => {
    if (!character || !newItemName.trim()) return;

    try {
      const updatedCharacter = {
        ...character,
        inventory: {
          ...character.inventory,
          items: [
            ...character.inventory.items,
            {
              name: newItemName.trim(),
              possessed: true,
              type: 'item' as const
            }
          ]
        },
        updatedAt: new Date().toISOString()
      };
      await updateCharacter(updatedCharacter);
      setCharacter(updatedCharacter);
      setNewItemName('');
      setShowItemModal(false);
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleAddWeapon = async () => {
    if (!character || !newWeaponName.trim()) return;

    try {
      const attackPoints = parseInt(newWeaponAttack) || 0;
      const updatedCharacter = {
        ...character,
        inventory: {
          ...character.inventory,
          weapon: {
            name: newWeaponName.trim(),
            attackPoints
          }
        },
        updatedAt: new Date().toISOString()
      };
      await updateCharacter(updatedCharacter);
      setCharacter(updatedCharacter);
      setNewWeaponName('');
      setNewWeaponAttack('');
      setShowWeaponModal(false);
    } catch (error) {
      console.error('Error adding weapon:', error);
    }
  };

  const rollDice = (count: 1 | 2) => {
    setIsRolling(true);
    setDiceResult([]);
    setDiceTotal(0);

    // Animation de lancer pendant 1.5 secondes
    setTimeout(() => {
      const results: number[] = [];
      for (let i = 0; i < count; i++) {
        results.push(Math.floor(Math.random() * 6) + 1);
      }
      setDiceResult(results);
      setDiceTotal(results.reduce((sum, val) => sum + val, 0));
      setIsRolling(false);
    }, 1500);
  };

  const handleUpdateWeaponName = async () => {
    if (!character || !character.inventory.weapon) return;

    if (!weaponNameValue.trim()) {
      setEditingWeaponName(false);
      setWeaponNameValue('');
      return;
    }

    try {
      const updatedCharacter = {
        ...character,
        inventory: {
          ...character.inventory,
          weapon: {
            ...character.inventory.weapon,
            name: weaponNameValue.trim()
          }
        },
        updatedAt: new Date().toISOString()
      };

      await updateCharacter(updatedCharacter);
      setCharacter(updatedCharacter);
      setEditingWeaponName(false);
      setWeaponNameValue('');
    } catch (error) {
      console.error('Error updating weapon name:', error);
    }
  };

  const handleUpdateWeaponAttack = async () => {
    if (!character || !character.inventory.weapon) return;

    const newAttack = parseInt(weaponAttackValue);
    if (isNaN(newAttack) || newAttack < 0) {
      setEditingWeaponAttack(false);
      setWeaponAttackValue('');
      return;
    }

    try {
      const updatedCharacter = {
        ...character,
        inventory: {
          ...character.inventory,
          weapon: {
            ...character.inventory.weapon,
            attackPoints: newAttack
          }
        },
        updatedAt: new Date().toISOString()
      };

      await updateCharacter(updatedCharacter);
      setCharacter(updatedCharacter);
      setEditingWeaponAttack(false);
      setWeaponAttackValue('');
    } catch (error) {
      console.error('Error updating weapon attack:', error);
    }
  };

  const handleRemoveWeapon = async () => {
    if (!character) return;

    try {
      const updatedCharacter = {
        ...character,
        inventory: {
          ...character.inventory,
          weapon: undefined
        },
        updatedAt: new Date().toISOString()
      };

      await updateCharacter(updatedCharacter);
      setCharacter(updatedCharacter);
    } catch (error) {
      console.error('Error removing weapon:', error);
    }
  };

  const handleUpdateDexterite = async () => {
    if (!character) return;

    const newValue = parseInt(dexteriteValue);
    if (isNaN(newValue) || newValue < 1) {
      setEditingDexterite(false);
      setDexteriteValue('');
      return;
    }

    try {
      const updatedCharacter = {
        ...character,
        stats: {
          ...character.stats,
          dexterite: newValue
        },
        updatedAt: new Date().toISOString()
      };

      await updateCharacter(updatedCharacter);
      setCharacter(updatedCharacter);
      setEditingDexterite(false);
      setDexteriteValue('');
    } catch (error) {
      console.error('Error updating dexterite:', error);
    }
  };

  const handleUpdateChance = async () => {
    if (!character) return;

    const newValue = parseInt(chanceValue);
    if (isNaN(newValue) || newValue < 0) {
      setEditingChance(false);
      setChanceValue('');
      return;
    }

    try {
      const updatedCharacter = {
        ...character,
        stats: {
          ...character.stats,
          chance: newValue
        },
        updatedAt: new Date().toISOString()
      };

      await updateCharacter(updatedCharacter);
      setCharacter(updatedCharacter);
      setEditingChance(false);
      setChanceValue('');
    } catch (error) {
      console.error('Error updating chance:', error);
    }
  };

  const handleUpdatePvMax = async () => {
    if (!character) return;

    const newValue = parseInt(pvMaxValue);
    if (isNaN(newValue) || newValue < 1) {
      setEditingPvMax(false);
      setPvMaxValue('');
      return;
    }

    try {
      const updatedCharacter = {
        ...character,
        stats: {
          ...character.stats,
          pointsDeVieMax: newValue
        },
        updatedAt: new Date().toISOString()
      };

      await updateCharacter(updatedCharacter);
      setCharacter(updatedCharacter);
      setEditingPvMax(false);
      setPvMaxValue('');
    } catch (error) {
      console.error('Error updating PV max:', error);
    }
  };

  const handleUpdatePvActuels = async () => {
    if (!character) return;

    const newValue = parseInt(pvActuelsValue);
    if (isNaN(newValue) || newValue < 0) {
      setEditingPvActuels(false);
      setPvActuelsValue('');
      return;
    }

    try {
      const updatedCharacter = {
        ...character,
        stats: {
          ...character.stats,
          pointsDeVieActuels: newValue
        },
        updatedAt: new Date().toISOString()
      };

      await updateCharacter(updatedCharacter);
      setCharacter(updatedCharacter);
      setEditingPvActuels(false);
      setPvActuelsValue('');
    } catch (error) {
      console.error('Error updating PV actuels:', error);
    }
  };

  const handleToggleItem = async (index: number) => {
    if (!character) return;

    try {
      const updatedItems = [...character.inventory.items];
      updatedItems[index] = {
        ...updatedItems[index],
        possessed: !updatedItems[index].possessed
      };

      const updatedCharacter = {
        ...character,
        inventory: {
          ...character.inventory,
          items: updatedItems
        },
        updatedAt: new Date().toISOString()
      };

      await updateCharacter(updatedCharacter);
      setCharacter(updatedCharacter);
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  };

  const handleDeleteItem = async (index: number) => {
    if (!character) return;

    try {
      const updatedItems = character.inventory.items.filter((_, i) => i !== index);

      const updatedCharacter = {
        ...character,
        inventory: {
          ...character.inventory,
          items: updatedItems
        },
        updatedAt: new Date().toISOString()
      };

      await updateCharacter(updatedCharacter);
      setCharacter(updatedCharacter);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  // Combat handlers
  const handleStartCombat = (enemy: Enemy, mode: CombatMode) => {
    setCurrentEnemy(enemy);
    setCombatMode(mode);
    setShowCombatSetup(false);
    setShowCombat(true);
  };

  const handleCombatEnd = async (status: 'victory' | 'defeat', finalEnd: number) => {
    if (!character) return;

    setCombatEndStatus(status);
    setFinalEndurance(finalEnd);

    // Mettre à jour les PV du personnage
    try {
      const updatedCharacter = {
        ...character,
        stats: {
          ...character.stats,
          pointsDeVieActuels: finalEnd
        },
        updatedAt: new Date().toISOString()
      };
      await updateCharacter(updatedCharacter);
      setCharacter(updatedCharacter);
    } catch (error) {
      console.error('Error updating character endurance:', error);
    }

    setShowCombat(false);
  };

  const handleResurrect = async () => {
    if (!character) return;

    try {
      const updatedCharacter = {
        ...character,
        stats: {
          ...character.stats,
          pointsDeVieActuels: 0
        },
        updatedAt: new Date().toISOString()
      };
      await updateCharacter(updatedCharacter);
      setCharacter(updatedCharacter);
      setCombatEndStatus(null);
    } catch (error) {
      console.error('Error resurrecting character:', error);
    }
  };

  const handleDeleteCharacterAfterDeath = async () => {
    await handleDelete();
  };

  const handleFlee = () => {
    setShowCombat(false);
    setCombatEndStatus(null);
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
          <div className="flex-1">
            <h1 className="font-[var(--font-uncial)] text-3xl sm:text-4xl tracking-wider text-[#FFBF00] mb-2">
              {character.name}
            </h1>
            <p className="font-[var(--font-merriweather)] text-muted-light">
              Talent : <span className="text-primary">{character.talent}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCombatSetup(true)}
              className="text-2xl hover:scale-110 transition-transform"
              title="Lancer un combat"
            >
              ⚔️
            </button>
            <button
              onClick={() => setShowDiceModal(true)}
              className="text-2xl hover:scale-110 transition-transform"
              title="Lancer les dés"
            >
              🎲
            </button>
            <button
              onClick={() => router.push('/characters')}
              className="text-muted-light hover:text-primary transition-colors text-2xl"
            >
              ←
            </button>
            <button
              onClick={handleDelete}
              className="text-muted-light hover:text-destructive transition-colors text-2xl"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-[#2a1e17] glow-border rounded-lg p-6">
          <h2 className="font-[var(--font-uncial)] text-xl tracking-wide text-light mb-4">Caractéristiques</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1a140f] border border-primary/20 rounded-lg p-4 text-center">
              <div className="text-xs font-[var(--font-uncial)] tracking-wide text-muted-light mb-2">DEXTÉRITÉ</div>
              {editingDexterite ? (
                <div className="flex items-center justify-center gap-2">
                  <input
                    ref={dexteriteInputRef}
                    type="number"
                    value={dexteriteValue}
                    onChange={(e) => setDexteriteValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdateDexterite();
                      } else if (e.key === 'Escape') {
                        setEditingDexterite(false);
                        setDexteriteValue('');
                      }
                    }}
                    className="w-20 bg-[#2a1e17] border border-primary/20 rounded px-2 py-1 font-[var(--font-geist-mono)] text-2xl text-center text-light focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={handleUpdateDexterite}
                    className="bg-[#FFBF00] hover:bg-yellow-400 text-[#000000] font-bold px-2 py-1 rounded transition-all text-xs"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => {
                      setEditingDexterite(false);
                      setDexteriteValue('');
                    }}
                    className="bg-muted hover:bg-muted/80 text-light font-bold px-2 py-1 rounded transition-all text-xs"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditingDexterite(true);
                    setDexteriteValue(character.stats.dexterite.toString());
                  }}
                  className="font-[var(--font-geist-mono)] text-3xl font-bold text-light hover:text-primary transition-colors cursor-pointer"
                >
                  {character.stats.dexterite}
                </button>
              )}
            </div>
            <div className="bg-[#1a140f] border border-primary/20 rounded-lg p-4 text-center">
              <div className="text-xs font-[var(--font-uncial)] tracking-wide text-muted-light mb-2">CHANCE</div>
              {editingChance ? (
                <div className="flex items-center justify-center gap-2">
                  <input
                    ref={chanceInputRef}
                    type="number"
                    value={chanceValue}
                    onChange={(e) => setChanceValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdateChance();
                      } else if (e.key === 'Escape') {
                        setEditingChance(false);
                        setChanceValue('');
                      }
                    }}
                    className="w-20 bg-[#2a1e17] border border-primary/20 rounded px-2 py-1 font-[var(--font-geist-mono)] text-2xl text-center text-light focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={handleUpdateChance}
                    className="bg-[#FFBF00] hover:bg-yellow-400 text-[#000000] font-bold px-2 py-1 rounded transition-all text-xs"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => {
                      setEditingChance(false);
                      setChanceValue('');
                    }}
                    className="bg-muted hover:bg-muted/80 text-light font-bold px-2 py-1 rounded transition-all text-xs"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditingChance(true);
                    setChanceValue(character.stats.chance.toString());
                  }}
                  className="font-[var(--font-geist-mono)] text-3xl font-bold text-light hover:text-primary transition-colors cursor-pointer"
                >
                  {character.stats.chance}
                  <span className="text-sm text-muted-light ml-2">(init: {character.stats.chanceInitiale})</span>
                </button>
              )}
            </div>
            <div className="bg-[#1a140f] border border-primary/20 rounded-lg p-4 text-center">
              <div className="text-xs font-[var(--font-uncial)] tracking-wide text-muted-light mb-2">PV MAX</div>
              {editingPvMax ? (
                <div className="flex items-center justify-center gap-2">
                  <input
                    ref={pvMaxInputRef}
                    type="number"
                    value={pvMaxValue}
                    onChange={(e) => setPvMaxValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdatePvMax();
                      } else if (e.key === 'Escape') {
                        setEditingPvMax(false);
                        setPvMaxValue('');
                      }
                    }}
                    className="w-20 bg-[#2a1e17] border border-primary/20 rounded px-2 py-1 font-[var(--font-geist-mono)] text-2xl text-center text-light focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={handleUpdatePvMax}
                    className="bg-[#FFBF00] hover:bg-yellow-400 text-[#000000] font-bold px-2 py-1 rounded transition-all text-xs"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => {
                      setEditingPvMax(false);
                      setPvMaxValue('');
                    }}
                    className="bg-muted hover:bg-muted/80 text-light font-bold px-2 py-1 rounded transition-all text-xs"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditingPvMax(true);
                    setPvMaxValue(character.stats.pointsDeVieMax.toString());
                  }}
                  className="font-[var(--font-geist-mono)] text-3xl font-bold text-light hover:text-primary transition-colors cursor-pointer"
                >
                  {character.stats.pointsDeVieMax}
                </button>
              )}
            </div>
            <div className="bg-[#1a140f] border border-primary/20 rounded-lg p-4 text-center">
              <div className="text-xs font-[var(--font-uncial)] tracking-wide text-muted-light mb-2">PV ACTUELS</div>
              {editingPvActuels ? (
                <div className="flex items-center justify-center gap-2">
                  <input
                    ref={pvActuelsInputRef}
                    type="number"
                    value={pvActuelsValue}
                    onChange={(e) => setPvActuelsValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdatePvActuels();
                      } else if (e.key === 'Escape') {
                        setEditingPvActuels(false);
                        setPvActuelsValue('');
                      }
                    }}
                    className="w-20 bg-[#2a1e17] border border-primary/20 rounded px-2 py-1 font-[var(--font-geist-mono)] text-2xl text-center text-light focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={handleUpdatePvActuels}
                    className="bg-[#FFBF00] hover:bg-yellow-400 text-[#000000] font-bold px-2 py-1 rounded transition-all text-xs"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => {
                      setEditingPvActuels(false);
                      setPvActuelsValue('');
                    }}
                    className="bg-muted hover:bg-muted/80 text-light font-bold px-2 py-1 rounded transition-all text-xs"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditingPvActuels(true);
                    setPvActuelsValue(character.stats.pointsDeVieActuels.toString());
                  }}
                  className="font-[var(--font-geist-mono)] text-3xl font-bold text-light hover:text-primary transition-colors cursor-pointer"
                >
                  {character.stats.pointsDeVieActuels}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Progression Section */}
        <div className="bg-[#2a1e17] glow-border rounded-lg p-6">
          <h2 className="font-[var(--font-uncial)] text-xl tracking-wide text-light mb-4">Progression</h2>
          <div className="flex items-center gap-4">
            <p className="font-[var(--font-merriweather)] text-muted-light">Paragraphe actuel:</p>
            {editingParagraph ? (
              <div className="flex items-center gap-2">
                <input
                  ref={paragraphInputRef}
                  type="number"
                  value={paragraphValue}
                  onChange={(e) => setParagraphValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUpdateParagraph();
                    } else if (e.key === 'Escape') {
                      setEditingParagraph(false);
                      setParagraphValue('');
                    }
                  }}
                  className="bg-[#1a140f] border border-primary/20 rounded px-3 py-2 w-32 font-[var(--font-geist-mono)] text-light focus:outline-none focus:border-primary"
                />
                <button
                  onClick={handleUpdateParagraph}
                  className="bg-[#FFBF00] hover:bg-yellow-400 text-[#000000] font-bold px-4 py-2 rounded transition-all"
                >
                  ✓
                </button>
                <button
                  onClick={() => {
                    setEditingParagraph(false);
                    setParagraphValue('');
                  }}
                  className="bg-muted hover:bg-muted/80 text-light font-bold px-4 py-2 rounded transition-all"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setEditingParagraph(true);
                  setParagraphValue(character.progress.currentParagraph.toString());
                }}
                className="font-[var(--font-geist-mono)] text-3xl font-bold text-light hover:text-primary transition-colors cursor-pointer"
              >
                §{character.progress.currentParagraph}
              </button>
            )}
          </div>
        </div>

        {/* Inventory Section */}
        <div className="bg-[#2a1e17] glow-border rounded-lg p-6">
          <h2 className="font-[var(--font-uncial)] text-xl tracking-wide text-light mb-4">Inventaire</h2>
          
          {/* Boulons */}
          <div className="mb-6 flex items-center gap-4">
            <p className="font-[var(--font-merriweather)] text-muted-light">Boulons:</p>
            {editingBoulons ? (
              <div className="flex items-center gap-2">
                <input
                  ref={boulonsInputRef}
                  type="number"
                  value={boulonsValue}
                  onChange={(e) => setBoulonsValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUpdateBoulons();
                    } else if (e.key === 'Escape') {
                      setEditingBoulons(false);
                      setBoulonsValue('');
                    }
                  }}
                  className="bg-[#1a140f] border border-primary/20 rounded px-3 py-2 w-32 font-[var(--font-geist-mono)] text-light focus:outline-none focus:border-primary"
                />
                <button
                  onClick={handleUpdateBoulons}
                  className="bg-[#FFBF00] hover:bg-yellow-400 text-[#000000] font-bold px-4 py-2 rounded transition-all"
                >
                  ✓
                </button>
                <button
                  onClick={() => {
                    setEditingBoulons(false);
                    setBoulonsValue('');
                  }}
                  className="bg-muted hover:bg-muted/80 text-light font-bold px-4 py-2 rounded transition-all"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setEditingBoulons(true);
                  setBoulonsValue(character.inventory.boulons?.toString() || '0');
                }}
                className="font-[var(--font-geist-mono)] text-2xl font-bold text-light hover:text-primary transition-colors cursor-pointer"
              >
                🔩 {character.inventory.boulons || 0}
              </button>
            )}
          </div>

          {/* Arme */}
          <div className="mb-6 bg-[#1a140f] border-2 border-primary/30 rounded-lg p-4">
            <h3 className="font-[var(--font-uncial)] text-sm tracking-wide text-primary mb-3">⚔️ ARME</h3>
            {character.inventory.weapon ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="font-[var(--font-merriweather)] text-muted-light text-sm">Nom:</span>
                  {editingWeaponName ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        ref={weaponNameInputRef}
                        type="text"
                        value={weaponNameValue}
                        onChange={(e) => setWeaponNameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateWeaponName();
                          } else if (e.key === 'Escape') {
                            setEditingWeaponName(false);
                            setWeaponNameValue('');
                          }
                        }}
                        className="flex-1 bg-[#2a1e17] border border-primary/20 rounded px-3 py-1 font-[var(--font-merriweather)] text-light focus:outline-none focus:border-primary"
                      />
                      <button
                        onClick={handleUpdateWeaponName}
                        className="bg-[#FFBF00] hover:bg-yellow-400 text-[#000000] font-bold px-3 py-1 rounded transition-all text-sm"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => {
                          setEditingWeaponName(false);
                          setWeaponNameValue('');
                        }}
                        className="bg-muted hover:bg-muted/80 text-light font-bold px-3 py-1 rounded transition-all text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingWeaponName(true);
                        setWeaponNameValue(character.inventory.weapon?.name || '');
                      }}
                      className="flex-1 text-left font-[var(--font-merriweather)] text-light hover:text-primary transition-colors cursor-pointer"
                    >
                      {character.inventory.weapon.name}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-[var(--font-merriweather)] text-muted-light text-sm">Points d'attaque:</span>
                  {editingWeaponAttack ? (
                    <div className="flex items-center gap-2">
                      <input
                        ref={weaponAttackInputRef}
                        type="number"
                        value={weaponAttackValue}
                        onChange={(e) => setWeaponAttackValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateWeaponAttack();
                          } else if (e.key === 'Escape') {
                            setEditingWeaponAttack(false);
                            setWeaponAttackValue('');
                          }
                        }}
                        className="w-24 bg-[#2a1e17] border border-primary/20 rounded px-3 py-1 font-[var(--font-geist-mono)] text-light focus:outline-none focus:border-primary"
                      />
                      <button
                        onClick={handleUpdateWeaponAttack}
                        className="bg-[#FFBF00] hover:bg-yellow-400 text-[#000000] font-bold px-3 py-1 rounded transition-all text-sm"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => {
                          setEditingWeaponAttack(false);
                          setWeaponAttackValue('');
                        }}
                        className="bg-muted hover:bg-muted/80 text-light font-bold px-3 py-1 rounded transition-all text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingWeaponAttack(true);
                        setWeaponAttackValue(character.inventory.weapon?.attackPoints.toString() || '0');
                      }}
                      className="font-[var(--font-geist-mono)] text-xl font-bold text-primary hover:text-yellow-400 transition-colors cursor-pointer"
                    >
                      +{character.inventory.weapon.attackPoints}
                    </button>
                  )}
                </div>
                <button
                  onClick={handleRemoveWeapon}
                  className="text-sm text-destructive hover:text-destructive/80 transition-colors"
                >
                  Retirer l'arme
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowWeaponModal(true)}
                className="w-full bg-[#2a1e17] border border-primary/20 rounded px-4 py-3 font-[var(--font-merriweather)] text-muted-light hover:text-primary hover:border-primary/40 transition-colors text-center"
              >
                + Ajouter une arme
              </button>
            )}
          </div>

          {/* Items List */}
          <div className="space-y-2 mb-4">
            {character.inventory.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-[#1a140f] border border-primary/20 rounded-lg p-3 group hover:border-primary/40 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={item.possessed}
                  onChange={() => handleToggleItem(index)}
                  className="w-5 h-5 cursor-pointer accent-primary"
                />
                <span className={`flex-1 font-[var(--font-merriweather)] ${item.possessed ? 'text-light' : 'text-muted-light line-through'}`}>
                  {item.name}
                </span>
                <button
                  onClick={() => handleDeleteItem(index)}
                  className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive/80 transition-opacity text-xl"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Add Item */}
          <button
            onClick={() => setShowItemModal(true)}
            className="w-full bg-[#FFBF00] hover:bg-yellow-400 text-[#000000] font-[var(--font-uncial)] font-bold px-6 py-3 rounded transition-all"
          >
            + Ajouter un objet
          </button>
        </div>

        {/* Modal Arme */}
        {showWeaponModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setShowWeaponModal(false)}>
            <div className="bg-[#2a1e17] border-2 border-primary/50 rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-[var(--font-uncial)] text-2xl tracking-wide text-primary mb-4">⚔️ Ajouter une arme</h3>
              <div className="space-y-4">
                <div>
                  <label className="font-[var(--font-merriweather)] text-muted-light text-sm mb-2 block">Nom de l'arme</label>
                  <input
                    value={newWeaponName}
                    onChange={(e) => setNewWeaponName(e.target.value)}
                    placeholder="Ex: Épée longue"
                    autoFocus
                    className="w-full bg-[#1a140f] border border-primary/20 rounded px-4 py-2 font-[var(--font-merriweather)] text-light placeholder:text-muted-light focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="font-[var(--font-merriweather)] text-muted-light text-sm mb-2 block">Points d'attaque</label>
                  <input
                    type="number"
                    value={newWeaponAttack}
                    onChange={(e) => setNewWeaponAttack(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddWeapon();
                      } else if (e.key === 'Escape') {
                        setShowWeaponModal(false);
                      }
                    }}
                    placeholder="Ex: 3"
                    className="w-full bg-[#1a140f] border border-primary/20 rounded px-4 py-2 font-[var(--font-geist-mono)] text-light placeholder:text-muted-light focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowWeaponModal(false);
                      setNewWeaponName('');
                      setNewWeaponAttack('');
                    }}
                    className="flex-1 bg-muted hover:bg-muted/80 text-light font-[var(--font-merriweather)] font-bold px-4 py-2 rounded transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddWeapon}
                    className="flex-1 bg-[#FFBF00] hover:bg-yellow-400 text-[#000000] font-[var(--font-uncial)] font-bold px-4 py-2 rounded transition-all"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Objet */}
        {showItemModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setShowItemModal(false)}>
            <div className="bg-[#2a1e17] border-2 border-primary/50 rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-[var(--font-uncial)] text-2xl tracking-wide text-primary mb-4">📦 Ajouter un objet</h3>
              <div className="space-y-4">
                <div>
                  <label className="font-[var(--font-merriweather)] text-muted-light text-sm mb-2 block">Nom de l'objet</label>
                  <input
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddItemWithModal();
                      } else if (e.key === 'Escape') {
                        setShowItemModal(false);
                      }
                    }}
                    placeholder="Ex: Potion de soin"
                    autoFocus
                    className="w-full bg-[#1a140f] border border-primary/20 rounded px-4 py-2 font-[var(--font-merriweather)] text-light placeholder:text-muted-light focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowItemModal(false);
                      setNewItemName('');
                    }}
                    className="flex-1 bg-muted hover:bg-muted/80 text-light font-[var(--font-merriweather)] font-bold px-4 py-2 rounded transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddItemWithModal}
                    className="flex-1 bg-[#FFBF00] hover:bg-yellow-400 text-[#000000] font-[var(--font-uncial)] font-bold px-4 py-2 rounded transition-all"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Lancer de dés */}
        {showDiceModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={() => setShowDiceModal(false)}>
            <div className="bg-[#2a1e17] border-2 border-primary/50 rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-[var(--font-uncial)] text-3xl tracking-wide text-primary mb-6 text-center">🎲 Lancer de dés</h3>
              
              <div className="mb-6 min-h-[200px] flex flex-col items-center justify-center">
                {isRolling ? (
                  <div className="flex justify-center gap-4">
                    {[1, 2].slice(0, diceResult.length === 0 ? 2 : diceResult.length).map((_, index) => (
                      <div
                        key={index}
                        className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center text-5xl font-bold text-[#1a140f] shadow-lg animate-[dice-roll_1.5s_ease-in-out]"
                        style={{ 
                          animationDelay: `${index * 0.1}s`,
                          transformStyle: 'preserve-3d',
                          perspective: '1000px'
                        }}
                      >
                        🎲
                      </div>
                    ))}
                  </div>
                ) : diceResult.length > 0 ? (
                  <div>
                    <div className="flex justify-center gap-4 mb-4">
                      {diceResult.map((value, index) => (
                        <div
                          key={index}
                          className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center text-5xl font-bold text-[#1a140f] shadow-lg animate-[dice-bounce_0.6s_ease-in-out]"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          {value}
                        </div>
                      ))}
                    </div>
                    <div className="text-center">
                      <p className="font-[var(--font-merriweather)] text-muted-light text-lg mb-2">Total :</p>
                      <p className="font-[var(--font-uncial)] text-primary text-5xl font-bold animate-[gold-shimmer_2s_ease-in-out]">{diceTotal}</p>
                    </div>
                  </div>
                ) : (
                  <p className="font-[var(--font-merriweather)] text-muted-light text-center">
                    Cliquez sur un bouton pour lancer les dés
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => rollDice(1)}
                  disabled={isRolling}
                  className="w-full bg-primary hover:bg-yellow-400 text-[#1a140f] font-[var(--font-uncial)] font-bold px-6 py-3 rounded-lg text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Lancer 1 dé
                </button>
                <button
                  onClick={() => rollDice(2)}
                  disabled={isRolling}
                  className="w-full bg-primary hover:bg-yellow-400 text-[#1a140f] font-[var(--font-uncial)] font-bold px-6 py-3 rounded-lg text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Lancer 2 dés
                </button>
                <button
                  onClick={() => setShowDiceModal(false)}
                  className="w-full bg-muted hover:bg-muted/80 text-light font-[var(--font-merriweather)] font-bold px-6 py-3 rounded-lg transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes Section */}
        {character.notes && (
          <div className="bg-[#2a1e17] glow-border rounded-lg p-6">
            <h2 className="font-[var(--font-uncial)] text-xl tracking-wide text-light mb-4">Notes</h2>
            <p className="font-[var(--font-merriweather)] text-light whitespace-pre-wrap">{character.notes}</p>
          </div>
        )}

        {/* Combat Setup Modal */}
        {showCombatSetup && (
          <CombatSetup
            onStartCombat={handleStartCombat}
            onCancel={() => setShowCombatSetup(false)}
          />
        )}

        {/* Combat Interface */}
        {showCombat && currentEnemy && (
          <CombatInterface
            character={character}
            enemy={currentEnemy}
            mode={combatMode}
            onCombatEnd={handleCombatEnd}
            onFlee={handleFlee}
          />
        )}

        {/* Combat End Modal */}
        {combatEndStatus && (
          <CombatEndModal
            status={combatEndStatus}
            playerName={character.name}
            enemyName={currentEnemy?.name || 'Adversaire'}
            roundsCount={0}
            characterId={id}
            onResurrect={handleResurrect}
            onDelete={handleDeleteCharacterAfterDeath}
          />
        )}
      </div>
    </main>
  );
}
