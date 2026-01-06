'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCharacterStore } from '@/src/presentation/providers/character-store-provider';
import { trackCharacterCreation, trackDiceRoll } from '@/src/infrastructure/analytics/tracking';
import { BookTag, BOOK_TITLES } from '@/components/ui/book-tag';
import { TALENTS } from '@/src/presentation/constants/talents';
import type { GameMode } from '@/src/domain/entities/Character';
import { DiceService } from '@/src/domain/services/DiceService';

const BOOKS = [1, 2, 3];

const GAME_MODES: Array<{ id: GameMode; name: string; description: string; icon: string }> = [
  { 
    id: 'narrative', 
    name: 'Narratif', 
    description: 'Mode histoire : victoire automatique des combats, focus sur l\'aventure',
    icon: '📖'
  },
  { 
    id: 'simplified', 
    name: 'Simplifié', 
    description: 'Mode normal : combats réels avec possibilité de sauvegarder manuellement',
    icon: '⚔️'
  },
  { 
    id: 'mortal', 
    name: 'Mortel', 
    description: 'Mode hardcore : une seule vie, pas de sauvegarde manuelle possible',
    icon: '💀'
  },
];

export default function NewCharacterPage() {
  const router = useRouter();
  const createCharacter = useCharacterStore((state) => state.createCharacter);
  const [step, setStep] = useState<'book' | 'name' | 'gameMode' | 'talent' | 'stats'>('book');
  const [selectedBook, setSelectedBook] = useState<number>(1);
  const [name, setName] = useState('');
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>('mortal');
  const [selectedTalent, setSelectedTalent] = useState('');
  const [manualMode, setManualMode] = useState(false);
  
  // Stats avec valeurs initiales
  const [stats, setStats] = useState({
    dexterite: 0,
    chance: 0,
    pointsDeVieMax: 0,
  });

  // Générer toutes les stats selon les règles du livre (utilise DiceService)
  const generateStats = () => {
    const generated = DiceService.generateCharacterStats();
    setStats(generated);

    // Tracker les lancers de dés pour la création de personnage
    trackDiceRoll('1d6', generated.chance, 'character_creation_chance');
    trackDiceRoll('2d6', generated.pointsDeVieMax / 4, 'character_creation_hp');
  };

  const handleCreateCharacter = async () => {
    try {
      // Utiliser le store pour créer le personnage (met à jour le state global)
      const newCharacter = await createCharacter({
        name,
        book: selectedBook,
        talent: selectedTalent,
        gameMode: selectedGameMode,
        stats: {
          dexterite: stats.dexterite,
          chance: stats.chance,
          chanceInitiale: stats.chance,
          pointsDeVieMax: stats.pointsDeVieMax,
          pointsDeVieActuels: stats.pointsDeVieMax,
          reputation: 0, // Initialiser la réputation à 0 pour tous les tomes
        },
      });
      
      // Tracker la création du personnage
      trackCharacterCreation(selectedTalent, {
        dexterite: stats.dexterite,
        chance: stats.chance,
        pointsDeVieMax: stats.pointsDeVieMax,
      });
      
      // Rediriger vers la page du nouveau personnage
      router.push(`/characters/${newCharacter.id}`);
    } catch (error) {
      console.error('Error saving character:', error);
      alert('Erreur lors de la sauvegarde du personnage');
    }
  };

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-[var(--font-uncial)] text-3xl sm:text-4xl tracking-wider text-primary mb-2">
              Créer un héros
            </h1>
            <div className="flex items-center gap-2">
              <BookTag book={selectedBook} />
            </div>
          </div>
          <Link
            href="/characters"
            className="text-muted-light hover:text-primary transition-colors text-2xl"
          >
            <span className="sr-only">Retour</span>
            ←
          </Link>
        </div>

        {/* Étape 0 : Choix du livre */}
        {step === 'book' && (
          <div className="bg-card glow-border rounded-lg p-4 sm:p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="font-[var(--font-uncial)] text-xl sm:text-2xl tracking-wide text-light">
                Choisissez votre livre
              </h2>
              <p className="font-[var(--font-merriweather)] text-xs sm:text-sm text-muted-light">
                Sélectionnez le tome de la saga de Dagda auquel votre héros appartient
              </p>
            </div>

            <div className="space-y-3">
              {BOOKS.map((bookId) => (
                <button
                  key={bookId}
                  onClick={() => setSelectedBook(bookId)}
                  className={`w-full text-left bg-background border-2 rounded-lg p-3 sm:p-4 transition-all ${
                    selectedBook === bookId
                      ? 'border-primary shadow-[0_0_10px_hsl(var(--primary)/0.4)]'
                      : 'border-primary/30 hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <BookTag book={bookId} className="text-xs sm:text-base px-2 py-0.5 sm:px-3 sm:py-1 flex-shrink-0" />
                    <div className="font-[var(--font-uncial)] text-sm sm:text-lg tracking-wide text-light leading-tight">
                      {BOOK_TITLES[bookId]}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep('name')}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-[var(--font-uncial)] font-bold tracking-wider py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_hsl(var(--primary)/0.6)] hover:scale-[1.02] active:scale-[0.98] text-lg"
            >
              Continuer
            </button>
          </div>
        )}

        {/* Étape 1 : Nom du personnage */}
        {step === 'name' && (
          <div className="bg-card glow-border rounded-lg p-4 sm:p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="font-[var(--font-uncial)] text-xl sm:text-2xl tracking-wide text-light">
                Nom de votre héros
              </h2>
              <p className="font-[var(--font-merriweather)] text-xs sm:text-sm text-muted-light">
                Choisissez un nom pour votre personnage
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Entrez le nom du héros"
                className="w-full bg-background border-2 border-primary/30 rounded-lg px-4 py-3 text-light font-[var(--font-merriweather)] text-lg focus:outline-none focus:border-primary transition-colors"
                maxLength={50}
                autoFocus
              />

              <button
                onClick={() => setStep('gameMode')}
                disabled={!name.trim()}
                className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed text-primary-foreground font-[var(--font-uncial)] font-bold tracking-wider py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_hsl(var(--primary)/0.6)] hover:scale-[1.02] active:scale-[0.98] text-lg disabled:hover:scale-100 disabled:hover:shadow-none"
              >
                Continuer
              </button>
            </div>
          </div>
        )}

        {/* Étape 2 : Choix du mode de jeu */}
        {step === 'gameMode' && (
          <div className="bg-card glow-border rounded-lg p-4 sm:p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="font-[var(--font-uncial)] text-xl sm:text-2xl tracking-wide text-light">
                Mode de jeu
              </h2>
              <p className="font-[var(--font-merriweather)] text-xs sm:text-sm text-muted-light">
                Choisissez la difficulté de votre aventure
              </p>
            </div>

            <div className="space-y-3">
              {GAME_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedGameMode(mode.id)}
                  className={`w-full text-left bg-background border-2 rounded-lg p-3 sm:p-4 transition-all ${
                    selectedGameMode === mode.id
                      ? 'border-primary shadow-[0_0_10px_hsl(var(--primary)/0.4)]'
                      : 'border-primary/30 hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <span className="text-xl sm:text-2xl mt-0.5 flex-shrink-0">{mode.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-[var(--font-uncial)] text-base sm:text-lg tracking-wide text-light mb-1">
                        {mode.name}
                      </div>
                      <div className="font-[var(--font-merriweather)] text-xs sm:text-sm text-muted-light leading-tight">
                        {mode.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep('talent')}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-[var(--font-uncial)] font-bold tracking-wider py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_hsl(var(--primary)/0.6)] hover:scale-[1.02] active:scale-[0.98] text-lg"
            >
              Continuer
            </button>
          </div>
        )}

        {/* Étape 3 : Choix du talent */}
        {step === 'talent' && (
          <div className="bg-card glow-border rounded-lg p-4 sm:p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="font-[var(--font-uncial)] text-xl sm:text-2xl tracking-wide text-light">
                Choisissez votre talent
              </h2>
              <p className="font-[var(--font-merriweather)] text-xs sm:text-sm text-muted-light">
                Votre talent définit votre spécialité
              </p>
            </div>

            <div className="space-y-3">
              {TALENTS.map((talent) => (
                <button
                  key={talent.id}
                  onClick={() => setSelectedTalent(talent.id)}
                  className={`w-full text-left bg-background border-2 rounded-lg p-3 sm:p-4 transition-all ${
                    selectedTalent === talent.id
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
            </div>

            <button
              onClick={() => setStep('stats')}
              disabled={!selectedTalent}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed text-primary-foreground font-[var(--font-uncial)] font-bold tracking-wider py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_hsl(var(--primary)/0.6)] hover:scale-[1.02] active:scale-[0.98] text-lg disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              Continuer
            </button>
          </div>
        )}

        {/* Étape 4 : Génération des statistiques */}
        {step === 'stats' && (
          <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-card/60 border border-primary/30 rounded-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                <h2 className="font-[var(--font-uncial)] text-lg sm:text-xl tracking-wide text-light">
                  📜 Règles de création
                </h2>
                <button
                  onClick={() => {
                    setManualMode(!manualMode);
                    setStats({ dexterite: 0, chance: 0, pointsDeVieMax: 0 });
                  }}
                  className="text-xs sm:text-sm font-[var(--font-merriweather)] bg-background border border-primary/50 text-light hover:bg-primary/20 hover:border-primary transition-colors px-3 py-1.5 rounded whitespace-nowrap"
                >
                  {manualMode ? '🎲 Mode dés' : '✏️ Mode manuel'}
                </button>
              </div>
              <ul className="font-[var(--font-merriweather)] text-xs sm:text-sm text-muted-light space-y-2">
                <li>• <strong className="text-light">DEXTÉRITÉ</strong> : 7 (fixe)</li>
                <li>• <strong className="text-light">CHANCE</strong> : 1d6</li>
                <li>• <strong className="text-light">POINTS DE VIE MAX</strong> : 2d6 × 4</li>
              </ul>
            </div>

            {/* Carte des statistiques */}
            <div className="bg-card glow-border rounded-lg p-4 sm:p-8 space-y-6">
              <div className="text-center space-y-2">
                <h2 className="font-[var(--font-uncial)] text-xl sm:text-2xl tracking-wide text-light">
                  {name}
                </h2>
                <p className="font-[var(--font-merriweather)] text-sm sm:text-base text-light">
                  Talent : <span className="text-primary font-semibold">{TALENTS.find(t => t.id === selectedTalent)?.name}</span>
                </p>
                <p className="font-[var(--font-merriweather)] text-xs sm:text-sm text-muted-light">
                  Lancez les dés pour déterminer vos caractéristiques
                </p>
              </div>

              {/* Grille des stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-background border-2 border-primary/30 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-xs font-[var(--font-uncial)] tracking-wide text-muted-light mb-2">
                    DEXTÉRITÉ
                  </div>
                  {manualMode ? (
                    <input
                      type="number"
                      value={stats.dexterite || ''}
                      onChange={(e) => setStats({...stats, dexterite: parseInt(e.target.value) || 0})}
                      className="w-full bg-transparent border-none text-center font-[var(--font-geist-mono)] text-4xl sm:text-5xl font-bold text-light focus:outline-none focus:ring-2 focus:ring-primary rounded"
                      placeholder="7"
                      min="1"
                      max="99"
                    />
                  ) : (
                    <div className="font-[var(--font-geist-mono)] text-4xl sm:text-5xl font-bold text-light">
                      {stats.dexterite || '—'}
                    </div>
                  )}
                </div>

                <div className="bg-background border-2 border-primary/30 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-xs font-[var(--font-uncial)] tracking-wide text-muted-light mb-2">
                    CHANCE
                  </div>
                  {manualMode ? (
                    <input
                      type="number"
                      value={stats.chance || ''}
                      onChange={(e) => setStats({...stats, chance: parseInt(e.target.value) || 0})}
                      className="w-full bg-transparent border-none text-center font-[var(--font-geist-mono)] text-4xl sm:text-5xl font-bold text-light focus:outline-none focus:ring-2 focus:ring-primary rounded"
                      placeholder="6"
                      min="1"
                      max="99"
                    />
                  ) : (
                    <div className="font-[var(--font-geist-mono)] text-4xl sm:text-5xl font-bold text-light">
                      {stats.chance || '—'}
                    </div>
                  )}
                </div>

                <div className="bg-background border-2 border-primary/30 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-xs font-[var(--font-uncial)] tracking-wide text-muted-light mb-2">
                    PV MAX
                  </div>
                  {manualMode ? (
                    <input
                      type="number"
                      value={stats.pointsDeVieMax || ''}
                      onChange={(e) => setStats({...stats, pointsDeVieMax: parseInt(e.target.value) || 0})}
                      className="w-full bg-transparent border-none text-center font-[var(--font-geist-mono)] text-4xl sm:text-5xl font-bold text-light focus:outline-none focus:ring-2 focus:ring-primary rounded"
                      placeholder="36"
                      min="1"
                      max="999"
                    />
                  ) : (
                    <div className="font-[var(--font-geist-mono)] text-4xl sm:text-5xl font-bold text-light">
                      {stats.pointsDeVieMax || '—'}
                    </div>
                  )}
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="space-y-3">
                {!manualMode && (
                  <button
                    onClick={generateStats}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-[var(--font-uncial)] font-bold tracking-wider py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_hsl(var(--primary)/0.6)] hover:scale-[1.02] active:scale-[0.98] text-lg"
                  >
                    🎲 Lancer les dés
                  </button>
                )}

                {((manualMode && stats.dexterite > 0 && stats.chance > 0 && stats.pointsDeVieMax > 0) || (!manualMode && stats.dexterite > 0)) && (
                  <button
                    onClick={handleCreateCharacter}
                    className="w-full bg-primary/20 hover:bg-primary/30 border-2 border-primary text-light font-[var(--font-uncial)] font-bold tracking-wider py-4 px-8 rounded-lg transition-all duration-300 text-lg"
                  >
                    ✓ Créer le personnage
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
