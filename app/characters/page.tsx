'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAllCharacters, deleteCharacter, saveCharacter } from '@/lib/storage/characters';
import { Character } from '@/lib/types/character';

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      const chars = await getAllCharacters();
      setCharacters(chars);
    } catch (error) {
      console.error('Error loading characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${name} ?`)) {
      try {
        await deleteCharacter(id);
        await loadCharacters();
      } catch (error) {
        console.error('Error deleting character:', error);
        alert('Erreur lors de la suppression du personnage');
      }
    }
  };

  const handleDuplicate = async (character: Character) => {
    try {
      const duplicatedCharacter: Character = {
        ...character,
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: `${character.name} (Copie)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveCharacter(duplicatedCharacter);
      await loadCharacters();
    } catch (error) {
      console.error('Error duplicating character:', error);
      alert('Erreur lors de la duplication du personnage');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#1a140f] p-4">
        <div className="max-w-4xl mx-auto py-8">
          <h1 className="font-[var(--font-uncial)] text-3xl sm:text-4xl tracking-wider text-[#FFBF00] mb-8">
            Vos héros
          </h1>
          <p className="text-muted-light text-center py-8">Chargement...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#1a140f] p-4">
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        {/* En-tête */}
        <div>
          <h1 className="font-[var(--font-uncial)] text-3xl sm:text-4xl tracking-wider text-[#FFBF00] mb-2">
            Vos héros
          </h1>
          <p className="font-[var(--font-merriweather)] text-muted-light">
            Gérez vos personnages d&apos;aventure
          </p>
        </div>

        {/* Bouton créer */}
        <Link
          href="/characters/new"
          className="block w-full bg-[#FFBF00] hover:bg-yellow-400 text-[#000000] font-[var(--font-uncial)] font-bold tracking-wider py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(255,191,0,0.6)] hover:scale-[1.02] active:scale-[0.98] text-center text-lg"
        >
          ✨ Créer un héros
        </Link>

        {/* Liste des personnages */}
        {characters.length === 0 ? (
          <div className="relative bg-[#2a1e17] glow-border rounded-lg p-12 text-center">
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
            {characters.map((character) => (
              <div
                key={character.id}
                className="bg-[#2a1e17] glow-border rounded-lg p-6 hover:bg-[#2a1e17]/80 transition-all"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="font-[var(--font-uncial)] text-2xl tracking-wide text-light mb-2">
                      {character.name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-[var(--font-merriweather)] text-light font-semibold">
                        Talent : <span className="text-primary">{character.talent}</span>
                      </span>
                      <span className="text-muted-light">•</span>
                      <span className="text-muted-light">
                        La Harpe des Quatre Saisons
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDuplicate(character)}
                      className="text-xl hover:scale-110 transition-transform text-muted-light hover:text-primary"
                      title="Dupliquer le personnage"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => handleDelete(character.id, character.name)}
                      className="text-xl hover:scale-110 transition-transform text-muted-light hover:text-destructive"
                      title="Supprimer le personnage"
                    >
                      🗑️
                    </button>
                    <Link
                      href={`/characters/${character.id}`}
                      className="text-3xl hover:scale-110 transition-transform"
                      title="Voir la fiche"
                    >
                      ⚔️
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-[#1a140f] border border-primary/20 rounded-lg p-4 text-center">
                    <div className="text-xs font-[var(--font-uncial)] tracking-wide text-muted-light mb-2">
                      DEXTÉRITÉ
                    </div>
                    <div className="font-[var(--font-geist-mono)] text-3xl font-bold text-light">
                      {character.stats.dexterite}
                    </div>
                  </div>
                  <div className="bg-[#1a140f] border border-primary/20 rounded-lg p-4 text-center">
                    <div className="text-xs font-[var(--font-uncial)] tracking-wide text-muted-light mb-2">
                      CHANCE
                    </div>
                    <div className="font-[var(--font-geist-mono)] text-3xl font-bold text-light">
                      {character.stats.chance}
                    </div>
                  </div>
                  <div className="bg-[#1a140f] border border-primary/20 rounded-lg p-4 text-center">
                    <div className="text-xs font-[var(--font-uncial)] tracking-wide text-muted-light mb-2">
                      POINTS DE VIE
                    </div>
                    <div className="font-[var(--font-geist-mono)] text-3xl font-bold text-light">
                      {character.stats.pointsDeVieActuels}<span className="text-xl text-muted-light">/{character.stats.pointsDeVieMax}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-primary/20">
                  <div className="flex items-center gap-2 text-sm text-muted-light">
                    <span className="font-[var(--font-geist-mono)]">§{character.progress.currentParagraph}</span>
                    <span>•</span>
                    <span>{new Date(character.updatedAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <Link
                    href={`/characters/${character.id}`}
                    className="font-[var(--font-merriweather)] text-sm text-light hover:text-primary transition-colors font-semibold"
                  >
                    Voir la fiche →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bouton retour à l'accueil */}
        <Link
          href="/"
          className="block w-full bg-[#2a1e17] hover:bg-[#2a1e17]/80 border border-primary/30 text-light font-[var(--font-uncial)] tracking-wider py-4 px-8 rounded-lg transition-all duration-300 hover:border-primary text-center"
        >
          ← Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
