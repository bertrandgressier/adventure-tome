'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const TALENTS = [
  { id: 'instinct', name: 'Instinct', description: 'Capacité à pressentir le danger et prendre les bonnes décisions' },
  { id: 'herbologie', name: 'Herbologie', description: 'Connaissance des plantes et de leurs propriétés' },
  { id: 'discretion', name: 'Discrétion', description: 'Art de se déplacer et agir sans être remarqué' },
  { id: 'persuasion', name: 'Persuasion', description: 'Capacité à convaincre et négocier' },
  { id: 'observation', name: 'Observation', description: 'Sens du détail et capacité à repérer des indices' },
  { id: 'doigts-agiles', name: 'Doigts agiles', description: 'Dextérité manuelle et agilité des mains' },
  { id: 'empratique', name: 'Empratique', description: 'Capacité à comprendre et ressentir les émotions d\'autrui' },
];

export default function NewCharacterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'name' | 'talent' | 'stats'>('name');
  const [name, setName] = useState('');
  const [selectedTalent, setSelectedTalent] = useState('');
  const [manualMode, setManualMode] = useState(false);
  
  // Stats avec valeurs initiales
  const [stats, setStats] = useState({
    dexterite: 0,
    chance: 0,
    pointsDeVieMax: 0,
  });

  // Fonction pour lancer les dés (2d6)
  const rollDice = () => {
    return Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
  };

  // Fonction pour lancer 1 dé
  const rollOneDice = () => {
    return Math.floor(Math.random() * 6) + 1;
  };

  // Générer toutes les stats selon les règles du livre
  const generateStats = () => {
    // DEXTÉRITÉ : 7 (valeur fixe)
    const dexterite = 7;
    
    // CHANCE : 1d6
    const chance = rollOneDice();
    
    // POINTS DE VIE MAXIMUM : 2d6 × 4
    const pointsDeVieMax = rollDice() * 4;

    setStats({
      dexterite,
      chance,
      pointsDeVieMax,
    });
  };

  const handleCreateCharacter = () => {
    // TODO: Sauvegarder le personnage dans IndexedDB
    const character = {
      id: crypto.randomUUID(),
      name,
      book: 'La Harpe des Quatre Saisons',
      talent: selectedTalent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        dexterite: stats.dexterite,
        chance: stats.chance,
        chanceInitiale: stats.chance,
        pointsDeVieMax: stats.pointsDeVieMax,
        pointsDeVieActuels: stats.pointsDeVieMax,
      },
      inventory: {
        items: [],
      },
      progress: {
        currentParagraph: 1,
        history: [1],
        lastSaved: new Date().toISOString(),
      },
      notes: '',
    };

    console.log('Character created:', character);
    
    // Rediriger vers la page des personnages
    router.push('/characters');
  };

  return (
    <main className="min-h-screen bg-[#1a140f] p-4">
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-[var(--font-uncial)] text-3xl sm:text-4xl tracking-wider text-[#FFBF00] mb-2">
              Créer un héros
            </h1>
            <p className="font-[var(--font-merriweather)] text-muted-light">
              La Harpe des Quatre Saisons
            </p>
          </div>
          <Link
            href="/characters"
            className="text-muted-light hover:text-primary transition-colors text-2xl"
          >
            <span className="sr-only">Retour</span>
            ←
          </Link>
        </div>

        {/* Étape 1 : Nom du personnage */}
        {step === 'name' && (
          <div className="bg-[#2a1e17] glow-border rounded-lg p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="font-[var(--font-uncial)] text-2xl tracking-wide text-light">
                Nom de votre héros
              </h2>
              <p className="font-[var(--font-merriweather)] text-sm text-muted-light">
                Choisissez un nom pour votre personnage
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Entrez le nom du héros"
                className="w-full bg-[#1a140f] border-2 border-primary/30 rounded-lg px-4 py-3 text-light font-[var(--font-merriweather)] text-lg focus:outline-none focus:border-primary transition-colors"
                maxLength={50}
                autoFocus
              />

              <button
                onClick={() => setStep('talent')}
                disabled={!name.trim()}
                className="w-full bg-[#FFBF00] hover:bg-yellow-400 disabled:bg-muted disabled:cursor-not-allowed text-[#000000] font-[var(--font-uncial)] font-bold tracking-wider py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(255,191,0,0.6)] hover:scale-[1.02] active:scale-[0.98] text-lg disabled:hover:scale-100 disabled:hover:shadow-none"
              >
                Continuer
              </button>
            </div>
          </div>
        )}

        {/* Étape 2 : Choix du talent */}
        {step === 'talent' && (
          <div className="bg-[#2a1e17] glow-border rounded-lg p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="font-[var(--font-uncial)] text-2xl tracking-wide text-light">
                Choisissez votre talent
              </h2>
              <p className="font-[var(--font-merriweather)] text-sm text-muted-light">
                Votre talent définit votre spécialité
              </p>
            </div>

            <div className="space-y-3">
              {TALENTS.map((talent) => (
                <button
                  key={talent.id}
                  onClick={() => setSelectedTalent(talent.id)}
                  className={`w-full text-left bg-[#1a140f] border-2 rounded-lg p-4 transition-all ${
                    selectedTalent === talent.id
                      ? 'border-primary shadow-[0_0_10px_rgba(255,191,0,0.4)]'
                      : 'border-primary/30 hover:border-primary/50'
                  }`}
                >
                  <div className="font-[var(--font-uncial)] text-lg tracking-wide text-light mb-1">
                    {talent.name}
                  </div>
                  <div className="font-[var(--font-merriweather)] text-sm text-muted-light">
                    {talent.description}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep('stats')}
              disabled={!selectedTalent}
              className="w-full bg-[#FFBF00] hover:bg-yellow-400 disabled:bg-muted disabled:cursor-not-allowed text-[#000000] font-[var(--font-uncial)] font-bold tracking-wider py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(255,191,0,0.6)] hover:scale-[1.02] active:scale-[0.98] text-lg disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              Continuer
            </button>
          </div>
        )}

        {/* Étape 3 : Génération des statistiques */}
        {step === 'stats' && (
          <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-[#2a1e17]/60 border border-primary/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-[var(--font-uncial)] text-xl tracking-wide text-light">
                  📜 Règles de création
                </h2>
                <button
                  onClick={() => {
                    setManualMode(!manualMode);
                    setStats({ dexterite: 0, chance: 0, pointsDeVieMax: 0 });
                  }}
                  className="text-sm font-[var(--font-merriweather)] bg-[#1a140f] border border-primary/50 text-light hover:bg-primary/20 hover:border-primary transition-colors px-3 py-1.5 rounded"
                >
                  {manualMode ? '🎲 Mode dés' : '✏️ Mode manuel'}
                </button>
              </div>
              <ul className="font-[var(--font-merriweather)] text-sm text-muted-light space-y-2">
                <li>• <strong className="text-light">DEXTÉRITÉ</strong> : 7 (fixe)</li>
                <li>• <strong className="text-light">CHANCE</strong> : 1d6</li>
                <li>• <strong className="text-light">POINTS DE VIE MAX</strong> : 2d6 × 4</li>
              </ul>
            </div>

            {/* Carte des statistiques */}
            <div className="bg-[#2a1e17] glow-border rounded-lg p-8 space-y-6">
              <div className="text-center space-y-2">
                <h2 className="font-[var(--font-uncial)] text-2xl tracking-wide text-light">
                  {name}
                </h2>
                <p className="font-[var(--font-merriweather)] text-base text-light">
                  Talent : <span className="text-primary font-semibold">{TALENTS.find(t => t.id === selectedTalent)?.name}</span>
                </p>
                <p className="font-[var(--font-merriweather)] text-sm text-muted-light">
                  Lancez les dés pour déterminer vos caractéristiques
                </p>
              </div>

              {/* Grille des stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#1a140f] border-2 border-primary/30 rounded-lg p-4 text-center">
                  <div className="text-xs font-[var(--font-uncial)] tracking-wide text-muted-light mb-2">
                    DEXTÉRITÉ
                  </div>
                  {manualMode ? (
                    <input
                      type="number"
                      value={stats.dexterite || ''}
                      onChange={(e) => setStats({...stats, dexterite: parseInt(e.target.value) || 0})}
                      className="w-full bg-transparent border-none text-center font-[var(--font-geist-mono)] text-5xl font-bold text-light focus:outline-none focus:ring-2 focus:ring-primary rounded"
                      placeholder="7"
                      min="1"
                      max="99"
                    />
                  ) : (
                    <div className="font-[var(--font-geist-mono)] text-5xl font-bold text-light">
                      {stats.dexterite || '—'}
                    </div>
                  )}
                </div>

                <div className="bg-[#1a140f] border-2 border-primary/30 rounded-lg p-4 text-center">
                  <div className="text-xs font-[var(--font-uncial)] tracking-wide text-muted-light mb-2">
                    CHANCE
                  </div>
                  {manualMode ? (
                    <input
                      type="number"
                      value={stats.chance || ''}
                      onChange={(e) => setStats({...stats, chance: parseInt(e.target.value) || 0})}
                      className="w-full bg-transparent border-none text-center font-[var(--font-geist-mono)] text-5xl font-bold text-light focus:outline-none focus:ring-2 focus:ring-primary rounded"
                      placeholder="6"
                      min="1"
                      max="99"
                    />
                  ) : (
                    <div className="font-[var(--font-geist-mono)] text-5xl font-bold text-light">
                      {stats.chance || '—'}
                    </div>
                  )}
                </div>

                <div className="bg-[#1a140f] border-2 border-primary/30 rounded-lg p-4 text-center">
                  <div className="text-xs font-[var(--font-uncial)] tracking-wide text-muted-light mb-2">
                    PV MAX
                  </div>
                  {manualMode ? (
                    <input
                      type="number"
                      value={stats.pointsDeVieMax || ''}
                      onChange={(e) => setStats({...stats, pointsDeVieMax: parseInt(e.target.value) || 0})}
                      className="w-full bg-transparent border-none text-center font-[var(--font-geist-mono)] text-5xl font-bold text-light focus:outline-none focus:ring-2 focus:ring-primary rounded"
                      placeholder="36"
                      min="1"
                      max="999"
                    />
                  ) : (
                    <div className="font-[var(--font-geist-mono)] text-5xl font-bold text-light">
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
                    className="w-full bg-[#FFBF00] hover:bg-yellow-400 text-[#000000] font-[var(--font-uncial)] font-bold tracking-wider py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(255,191,0,0.6)] hover:scale-[1.02] active:scale-[0.98] text-lg"
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
