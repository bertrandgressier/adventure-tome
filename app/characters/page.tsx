'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllCharacters } from '@/lib/storage/characters';
import { Character } from '@/lib/types/character';

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-[var(--font-uncial)] text-3xl sm:text-4xl tracking-wider text-[#FFBF00] mb-2">
              Vos héros
            </h1>
            <p className="font-[var(--font-merriweather)] text-muted-light">
              Gérez vos personnages d&apos;aventure
            </p>
          </div>
          <Link
            href="/"
            className="text-muted-light hover:text-primary transition-colors text-2xl"
          >
            <span className="sr-only">Retour</span>
            ←
          </Link>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {characters.map((character) => (
              <Link
                key={character.id}
                href={`/characters/${character.id}`}
                className="bg-[#2a1e17] glow-border rounded-lg p-6 hover:scale-[1.02] transition-transform"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-[var(--font-uncial)] text-xl tracking-wide text-light mb-1">
                      {character.name}
                    </h3>
                    <p className="font-[var(--font-merriweather)] text-sm text-primary">
                      {character.talent}
                    </p>
                  </div>
                  <div className="text-2xl">⚔️</div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-[#1a140f] rounded p-2 text-center">
                    <div className="text-xs text-muted-light mb-1">DEX</div>
                    <div className="font-[var(--font-geist-mono)] text-lg font-bold text-light">
                      {character.stats.dexterite}
                    </div>
                  </div>
                  <div className="bg-[#1a140f] rounded p-2 text-center">
                    <div className="text-xs text-muted-light mb-1">CHC</div>
                    <div className="font-[var(--font-geist-mono)] text-lg font-bold text-light">
                      {character.stats.chance}
                    </div>
                  </div>
                  <div className="bg-[#1a140f] rounded p-2 text-center">
                    <div className="text-xs text-muted-light mb-1">PV</div>
                    <div className="font-[var(--font-geist-mono)] text-lg font-bold text-light">
                      {character.stats.pointsDeVieActuels}/{character.stats.pointsDeVieMax}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-light">
                  <span>§{character.progress.currentParagraph}</span>
                  <span>{new Date(character.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
