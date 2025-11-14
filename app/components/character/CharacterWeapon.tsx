'use client';

import { useState, useEffect, useRef } from 'react';
import type { Character } from '@/lib/types/character';

interface CharacterWeaponProps {
  character: Character;
  onUpdate: (character: Character) => Promise<void>;
  onOpenAddWeaponModal?: () => void;
}

export default function CharacterWeapon({ 
  character, 
  onUpdate,
  onOpenAddWeaponModal
}: CharacterWeaponProps) {
  const [editingWeaponName, setEditingWeaponName] = useState(false);
  const [weaponNameValue, setWeaponNameValue] = useState('');
  const [editingWeaponAttack, setEditingWeaponAttack] = useState(false);
  const [weaponAttackValue, setWeaponAttackValue] = useState('');
  
  const weaponNameInputRef = useRef<HTMLInputElement>(null);
  const weaponAttackInputRef = useRef<HTMLInputElement>(null);

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

  const startEditWeaponName = () => {
    setWeaponNameValue(character.inventory.weapon?.name || '');
    setEditingWeaponName(true);
  };

  const saveWeaponName = async () => {
    if (!weaponNameValue.trim()) {
      alert('Le nom de l\'arme ne peut pas être vide');
      return;
    }
    if (!character.inventory.weapon) return;
    
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
    await onUpdate(updatedCharacter);
    setEditingWeaponName(false);
  };

  const startEditWeaponAttack = () => {
    setWeaponAttackValue((character.inventory.weapon?.attackPoints || 0).toString());
    setEditingWeaponAttack(true);
  };

  const saveWeaponAttack = async () => {
    const newValue = parseInt(weaponAttackValue);
    if (isNaN(newValue) || newValue < 0) {
      alert('Les points d\'attaque doivent être un nombre positif ou nul');
      return;
    }
    if (!character.inventory.weapon) return;
    
    const updatedCharacter = {
      ...character,
      inventory: {
        ...character.inventory,
        weapon: {
          ...character.inventory.weapon,
          attackPoints: newValue
        }
      },
      updatedAt: new Date().toISOString()
    };
    await onUpdate(updatedCharacter);
    setEditingWeaponAttack(false);
  };

  const handleDeleteWeapon = async () => {
    if (!confirm(`Perdre l'arme "${character.inventory.weapon?.name}" ?`)) {
      return;
    }
    const updatedCharacter = {
      ...character,
      inventory: {
        ...character.inventory,
        weapon: undefined
      },
      updatedAt: new Date().toISOString()
    };
    await onUpdate(updatedCharacter);
  };

  return (
    <div className="bg-[#2a1e17] glow-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-[var(--font-uncial)] text-xl tracking-wide text-light">
          Arme équipée
        </h2>
        {character.inventory.weapon ? (
          <button
            onClick={handleDeleteWeapon}
            className="text-red-400 hover:text-red-300 text-xl transition-colors"
            title="Perdre cette arme"
          >
            🗑️
          </button>
        ) : (
          <button
            onClick={onOpenAddWeaponModal}
            className="text-primary hover:text-yellow-300 text-2xl transition-colors"
            title="Ajouter une arme"
          >
            ➕
          </button>
        )}
      </div>
      {character.inventory.weapon ? (
        <div className="space-y-4">
          {/* Nom de l'arme */}
          <div>
            <div className="text-xs font-[var(--font-merriweather)] text-muted-light mb-1">
              Nom
            </div>
            {editingWeaponName ? (
              <div className="flex items-center gap-2">
                <input
                  ref={weaponNameInputRef}
                  type="text"
                  value={weaponNameValue}
                  onChange={(e) => setWeaponNameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveWeaponName();
                    if (e.key === 'Escape') setEditingWeaponName(false);
                  }}
                  className="flex-1 bg-[#1a140f] border border-primary/50 rounded px-3 py-2 font-[var(--font-merriweather)] text-light focus:outline-none focus:border-primary"
                />
                <button
                  onClick={saveWeaponName}
                  className="text-green-400 hover:text-green-300 text-xl"
                  title="Valider"
                >
                  ✓
                </button>
                <button
                  onClick={() => setEditingWeaponName(false)}
                  className="text-red-400 hover:text-red-300 text-xl"
                  title="Annuler"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div
                onClick={startEditWeaponName}
                className="font-[var(--font-merriweather)] text-lg text-primary hover:text-yellow-300 cursor-pointer transition-colors"
                title="Cliquer pour modifier"
              >
                {character.inventory.weapon.name}
              </div>
            )}
          </div>

          {/* Points d'attaque */}
          <div>
            <div className="text-xs font-[var(--font-merriweather)] text-muted-light mb-1">
              Points d&apos;attaque
            </div>
            {editingWeaponAttack ? (
              <div className="flex items-center gap-2">
                <input
                  ref={weaponAttackInputRef}
                  type="number"
                  value={weaponAttackValue}
                  onChange={(e) => setWeaponAttackValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveWeaponAttack();
                    if (e.key === 'Escape') setEditingWeaponAttack(false);
                  }}
                  className="w-24 bg-[#1a140f] border border-primary/50 rounded px-3 py-2 font-[var(--font-geist-mono)] text-lg text-primary focus:outline-none focus:border-primary"
                  min="0"
                />
                <button
                  onClick={saveWeaponAttack}
                  className="text-green-400 hover:text-green-300 text-xl"
                  title="Valider"
                >
                  ✓
                </button>
                <button
                  onClick={() => setEditingWeaponAttack(false)}
                  className="text-red-400 hover:text-red-300 text-xl"
                  title="Annuler"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div
                onClick={startEditWeaponAttack}
                className="font-[var(--font-geist-mono)] text-2xl text-primary hover:text-yellow-300 cursor-pointer transition-colors inline-block"
                title="Cliquer pour modifier"
              >
                +{character.inventory.weapon.attackPoints}
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="font-[var(--font-merriweather)] text-muted-light">
          Aucune arme équipée
        </p>
      )}
    </div>
  );
}
