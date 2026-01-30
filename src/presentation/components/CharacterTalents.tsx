'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCharacterStore } from '@/src/presentation/providers/character-store-provider';
import { TALENTS, SECOND_TALENTS_TOME2 } from '@/src/presentation/constants/talents';
import EditableStatField from '@/src/presentation/components/EditableStatField';
import { Sparkles } from 'lucide-react';

interface CharacterTalentsProps {
  characterId: string;
}

export default function CharacterTalents({ characterId }: CharacterTalentsProps) {
  const character = useCharacterStore((state) => state.getCharacter(characterId));
  const updateSecondTalent = useCharacterStore((state) => state.updateSecondTalent);
  const updateTalentLevel = useCharacterStore((state) => state.updateTalentLevel);
  const updateSecondTalentLevel = useCharacterStore((state) => state.updateSecondTalentLevel);
  const [showEditModal, setShowEditModal] = useState(false);

  if (!character) return null;

  const primaryTalentName = TALENTS.find(t => t.id === character.talentId)?.name || character.talentId;
  const secondTalentName = character.secondTalentId
    ? SECOND_TALENTS_TOME2.find(t => t.id === character.secondTalentId)?.name || character.secondTalentId
    : null;

  const availableTalents = SECOND_TALENTS_TOME2.filter(t => t.id !== character.talentId);

  const handleSelectSecondTalent = async (talentId: string | undefined) => {
    try {
      await updateSecondTalent(characterId, talentId);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating second talent:', error);
      alert('Erreur lors de la mise à jour du second talent');
    }
  };

  return (
    <>
      <div className="bg-card glow-border rounded-lg p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-[var(--font-uncial)] text-xl sm:text-2xl tracking-wide text-light">
              Talents
            </h2>
            {character.book >= 2 && (
              <button
                onClick={() => setShowEditModal(true)}
                className="text-xs sm:text-sm font-[var(--font-merriweather)] bg-background border border-primary/50 text-light hover:bg-primary/20 hover:border-primary transition-colors px-3 py-1.5 rounded whitespace-nowrap"
                title="Modifier le second talent"
              >
                ✏️ Modifier
              </button>
            )}
          </div>

          <div className="space-y-3">
            <div className="bg-background border-2 border-primary/30 rounded-lg p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="text-xs font-[var(--font-uncial)] tracking-wide text-muted-light mb-1">
                    Talent principal
                  </div>
                  <div className="font-[var(--font-uncial)] text-base sm:text-lg tracking-wide text-primary font-semibold">
                    {primaryTalentName}
                  </div>
                </div>
                {character.book >= 3 && (
                  <EditableStatField
                    value={character.talentLevel}
                    onSave={(value) => updateTalentLevel(characterId, value ?? 1)}
                    min={1}
                    icon={<Sparkles className="size-4" />}
                    label="NIV."
                    size="xs"
                  />
                )}
              </div>
            </div>

            {character.book >= 2 && (
              <div className="bg-background border-2 border-primary/30 rounded-lg p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-xs font-[var(--font-uncial)] tracking-wide text-muted-light mb-1">
                      Second talent
                    </div>
                    <div className="font-[var(--font-uncial)] text-base sm:text-lg tracking-wide text-light font-semibold">
                      {secondTalentName || 'Aucun'}
                    </div>
                  </div>
                  {character.book >= 3 && character.secondTalentId && (
                    <EditableStatField
                      value={character.secondTalentLevel ?? null}
                      onSave={(value) => updateSecondTalentLevel(characterId, value ?? 1)}
                      min={1}
                      icon={<Sparkles className="size-4" />}
                      label="NIV."
                      size="xs"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showEditModal && (
        <Dialog open={true} onOpenChange={(open) => !open && setShowEditModal(false)}>
          <DialogContent className="bg-card border-2 border-primary/50 rounded-lg p-6 max-w-md w-full" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle className="font-[var(--font-uncial)] text-3xl tracking-wide text-primary mb-6 text-center">
                ✨ Choisir un second talent
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              {availableTalents.map((talent) => (
                <button
                  key={talent.id}
                  onClick={() => handleSelectSecondTalent(talent.id)}
                  className={`w-full text-left bg-background border-2 rounded-lg p-3 sm:p-4 transition-all ${
                    character.secondTalentId === talent.id
                      ? 'border-primary shadow-[0_0_10px_hsl(var(--primary)/0.4)]'
                      : 'border-primary/30 hover:border-primary/50'
                  }`}
                >
                  <div className="font-[var(--font-uncial)] text-base sm:text-lg tracking-wide text-light mb-1">
                    {talent.name}
                  </div>
                  <div className="font-[var(--font-merriweather)] text-xs sm:text-sm text-muted-light leading-tight">
                    {talent.description}
                  </div>
                </button>
              ))}
              <button
                onClick={() => handleSelectSecondTalent(undefined)}
                className={`w-full text-left bg-background border-2 rounded-lg p-3 sm:p-4 transition-all ${
                  !character.secondTalentId
                    ? 'border-primary shadow-[0_0_10px_hsl(var(--primary)/0.4)]'
                    : 'border-primary/30 hover:border-primary/50'
                }`}
              >
                <div className="font-[var(--font-uncial)] text-base sm:text-lg tracking-wide text-light mb-1">
                  Aucun second talent
                </div>
                <div className="font-[var(--font-merriweather)] text-xs sm:text-sm text-muted-light leading-tight">
                  Continuer avec un seul talent
                </div>
              </button>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="w-full bg-muted hover:bg-muted/80 text-light font-[var(--font-merriweather)] font-bold px-6 py-3 rounded-lg transition-colors border border-primary/20"
              >
                Annuler
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
