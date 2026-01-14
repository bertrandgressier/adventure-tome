'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { Copy, Trash2, Swords, Hand, Clover, Heart } from 'lucide-react';
import { useCharacterStore } from '@/src/presentation/providers/character-store-provider';
import { BookTag } from '@/components/ui/book-tag';
import { GameModeBadge, GAME_MODE_CONFIG } from '@/components/ui/game-mode-badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { Character, GameMode } from '@/src/domain/entities/Character';

export default function CharactersPage() {
  const characters = useCharacterStore((state) => state.getAllCharacters());
  const isLoading = useCharacterStore((state) => state.isLoading);
  const deleteCharacter = useCharacterStore((state) => state.deleteCharacter);
  const createCharacter = useCharacterStore((state) => state.createCharacter);
  
  const [gameModeInfoOpen, setGameModeInfoOpen] = useState(false);
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode | null>(null);

  const isDead = useCallback((character: Character) => character.isDead(), []);
  
  const handleGameModeClick = useCallback((gameMode: GameMode, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation to character detail
    setSelectedGameMode(gameMode);
    setGameModeInfoOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string, name: string) => {
      if (confirm(`Êtes-vous sûr de vouloir supprimer ${name} ?`)) {
        await deleteCharacter(id);
      }
    },
    [deleteCharacter]
  );

  const handleDuplicate = useCallback(
    async (character: Character) => {
    try {
      const characterData = character.toData();
      
      // Créer un nouveau personnage avec les mêmes données
      await createCharacter({
        name: `${characterData.name} (Copie)`,
        book: characterData.book,
        talent: typeof characterData.talent === 'string' ? characterData.talent : characterData.talent.id,
        gameMode: characterData.gameMode,
        stats: characterData.stats,
      });
    } catch (error) {
      console.error('Error duplicating character:', error);
      alert('Erreur lors de la duplication du personnage');
    }
  }, [createCharacter]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto py-8">
          <h1 className="font-[var(--font-uncial)] text-3xl sm:text-4xl tracking-wider text-primary mb-8">
            Vos héros
          </h1>
          <p className="text-muted-light text-center py-8">Chargement...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        {/* En-tête */}
        <div>
          <h1 className="font-[var(--font-uncial)] text-3xl sm:text-4xl tracking-wider text-primary mb-2">
            Vos héros
          </h1>
          <p className="font-[var(--font-merriweather)] text-muted-light">
            Gérez vos personnages d&apos;aventure
          </p>
        </div>

        {/* Bouton créer */}
        <Link
          href="/characters/new"
          className="block w-full bg-primary hover:bg-primary/90 text-primary-foreground font-[var(--font-uncial)] font-bold tracking-wider py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_hsl(var(--primary)/0.6)] hover:scale-[1.02] active:scale-[0.98] text-center text-lg"
        >
          ✨ Créer un héros
        </Link>

        {/* Liste des personnages */}
        {characters.length === 0 ? (
          <div className="relative bg-card glow-border rounded-lg p-12 text-center">
            <div className="max-w-sm mx-auto space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-amber-600/20 border-2 border-primary/50 flex items-center justify-center">
                <span className="text-4xl">📜</span>
              </div>
              
              <div className="space-y-2">
                <h2 className="font-[var(--font-uncial)] text-xl tracking-wide text-light">
                  Aucun héro créé
                </h2>
                <p className="font-[var(--font-merriweather)] text-sm text-muted-light">
                  Créez votre premier personnage pour commencer votre aventure
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {characters.map((character: Character) => {
              const characterData = character.toData();
              const stats = character.getStatsObject().toData();
              const progress = character.getProgress();
              
              return (
              <div
                key={character.id}
                className={`rounded-lg p-6 transition-all ${
                  isDead(character)
                    ? 'bg-destructive/20 border-2 border-destructive/50 opacity-50 grayscale hover:opacity-60'
                    : 'bg-card glow-border hover:bg-card/80'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate font-[var(--font-uncial)] text-2xl tracking-wide text-light mb-1" title={characterData.name}>
                      {characterData.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted-light font-[var(--font-merriweather)]">
                      {isDead(character) && (
                        <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 bg-destructive text-destructive-foreground rounded-full text-xs shadow-sm" title="Décédé">
                          💀
                        </span>
                      )}
                      <BookTag book={characterData.book} />
                      <GameModeBadge 
                        gameMode={characterData.gameMode} 
                        clickable 
                        onClick={(e) => handleGameModeClick(characterData.gameMode, e)} 
                      />
                      <span className="whitespace-nowrap">
                        • <span className="font-[var(--font-geist-mono)] text-primary">§{progress.currentParagraph}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDuplicate(character)}
                      className="h-11 w-11 text-muted-light hover:text-primary hover:bg-primary/10 transition-all hover:scale-110"
                      title="Dupliquer le personnage"
                    >
                      <Copy className="size-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(character.id, character.name)}
                      className="h-11 w-11 text-muted-light hover:text-destructive hover:bg-destructive/10 transition-all hover:scale-110"
                      title="Supprimer le personnage"
                    >
                      <Trash2 className="size-5" />
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 text-muted-light hover:text-primary hover:bg-primary/10 transition-all hover:scale-110"
                      title="Voir la fiche"
                    >
                      <Link href={`/characters/${character.id}`}>
                        <Swords className="size-6" />
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-background border border-primary/20 rounded-lg p-2 text-center flex flex-col items-center justify-center min-h-[80px]">
                    <div className="flex items-center gap-1.5 text-muted-light mb-1">
                      <Hand className="size-4" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">Dext.</span>
                    </div>
                    <div className="font-[var(--font-geist-mono)] text-2xl font-bold text-light">
                      {stats.dexterite}
                    </div>
                  </div>
                  <div className="bg-background border border-primary/20 rounded-lg p-2 text-center flex flex-col items-center justify-center min-h-[80px]">
                    <div className="flex items-center gap-1.5 text-muted-light mb-1">
                      <Clover className="size-4" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">Chance</span>
                    </div>
                    <div className="font-[var(--font-geist-mono)] text-2xl font-bold text-light">
                      {stats.chance}
                    </div>
                  </div>
                  <div className="bg-background border border-primary/20 rounded-lg p-2 text-center flex flex-col items-center justify-center min-h-[80px]">
                    <div className="flex items-center gap-1.5 text-muted-light mb-1">
                      <Heart className="size-4" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">Vie</span>
                    </div>
                    <div className="font-[var(--font-geist-mono)] font-bold text-light flex items-baseline justify-center gap-0.5">
                      <span className="text-2xl">{stats.pointsDeVieActuels}</span>
                      <span className="text-sm text-muted-light">/{stats.pointsDeVieMax}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        )}

        {/* Bouton retour à l'accueil */}
        <Link
          href="/"
          className="block w-full bg-card hover:bg-card/80 border border-primary/30 text-light font-[var(--font-uncial)] tracking-wider py-4 px-8 rounded-lg transition-all duration-300 hover:border-primary text-center"
        >
          ← Retour à l&apos;accueil
        </Link>
      </div>
      
      {/* Dialog d'information sur le mode de jeu */}
      <Dialog open={gameModeInfoOpen} onOpenChange={setGameModeInfoOpen}>
        <DialogContent className="bg-card border-2 border-primary/50 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-[var(--font-uncial)] text-2xl tracking-wide text-primary flex items-center gap-2">
              {selectedGameMode && (
                <>
                  <span className="text-3xl">{GAME_MODE_CONFIG[selectedGameMode].icon}</span>
                  Mode {GAME_MODE_CONFIG[selectedGameMode].label}
                </>
              )}
            </DialogTitle>
            <DialogDescription className="font-[var(--font-merriweather)] text-light pt-2">
              {selectedGameMode && GAME_MODE_CONFIG[selectedGameMode].details}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-4">
            <Button
              onClick={() => setGameModeInfoOpen(false)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-[var(--font-uncial)] tracking-wider"
            >
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
