'use client';

import { useState } from 'react';
import { Coins } from 'lucide-react';
import { useCharacter } from '@/src/presentation/hooks/useCharacter';
import EditableStatField from '@/src/presentation/components/EditableStatField';
import { BookTag, BOOK_TITLES } from '@/components/ui/book-tag';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const BOOKS = [1, 2, 3];

interface CharacterProgressProps {
  characterId: string;
  onUpdate?: () => void;
}

/**
 * Composant refactorisé pour afficher et éditer la progression du personnage.
 * 
 * Avant: 4 useState + 2 useRef + 2 useEffect + logique métier dupliquée
 * Après: 1 hook useCharacter + réutilisation de EditableStatField
 * 
 * Gère:
 * - Paragraphe actuel (avec historique)
 * - Boulons (monnaie du jeu)
 * - Date de dernière mise à jour
 */
export default function CharacterProgress({ characterId, onUpdate }: CharacterProgressProps) {
  const { character, isLoading, error, goToParagraph, setBoulons, updateBook } = useCharacter(characterId);
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);

  const handleUpdateProgress = async (paragraph: number) => {
    await goToParagraph(paragraph);
    onUpdate?.();
  };

  const handleUpdateBoulons = async (newValue: number | null) => {
    if (newValue === null) return;
    await setBoulons(newValue);
    onUpdate?.();
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-light">
        Chargement...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-400">
        Erreur: {error}
      </div>
    );
  }

  if (!character) {
    return (
      <div className="text-center py-8 text-muted-light">
        Personnage non trouvé
      </div>
    );
  }

  const progressData = character.getProgress();
  const inventoryData = character.getInventory();
  const characterData = character.toData();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Paragraphe actuel */}
      <div className="bg-background border border-primary/20 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-[var(--font-uncial)] tracking-wide text-muted-light">
            PARAGRAPHE
          </div>
          <div className="text-xs font-[var(--font-merriweather)] text-muted-light">
            {new Date(characterData.updatedAt).toLocaleString('fr-FR', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div
            onClick={() => {
              const newParagraph = prompt('Nouveau paragraphe:', progressData.currentParagraph.toString());
              if (newParagraph) {
                const value = parseInt(newParagraph);
                if (!isNaN(value) && value >= 1) {
                  handleUpdateProgress(value);
                }
              }
            }}
            className="font-[var(--font-geist-mono)] text-4xl text-primary hover:text-yellow-300 cursor-pointer transition-colors"
            title="Cliquer pour modifier"
          >
            #{progressData.currentParagraph}
          </div>

          <Dialog open={isBookDialogOpen} onOpenChange={setIsBookDialogOpen}>
            <DialogTrigger asChild>
              <button className="hover:scale-105 transition-transform">
                <BookTag book={characterData.book} />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md" aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle className="font-[var(--font-uncial)] text-xl sm:text-2xl text-center mb-2 sm:mb-4">
                  Changer de livre
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-2 sm:gap-3">
                {BOOKS.map((bookId) => (
                  <button
                    key={bookId}
                    onClick={() => {
                      updateBook(bookId);
                      setIsBookDialogOpen(false);
                    }}
                    className={`p-3 sm:p-4 rounded-lg border-2 transition-all text-left ${
                      characterData.book === bookId
                        ? 'border-primary bg-primary/10'
                        : 'border-transparent hover:border-primary/50 bg-card'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                      <BookTag book={bookId} className="flex-shrink-0" />
                      <span className="font-[var(--font-merriweather)] text-xs sm:text-sm text-light leading-tight">
                        {BOOK_TITLES[bookId]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Boulons */}
      <EditableStatField
        label="BOULONS"
        value={inventoryData.boulons}
        onSave={handleUpdateBoulons}
        min={0}
        icon={<Coins className="size-4" />}
      />
    </div>
  );
}
