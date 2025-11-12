'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewCharacterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'name' | 'stats'>('name');
  const [name, setName] = useState('');
  
  // Stats avec valeurs initiales
  const [stats, setStats] = useState({
    habilete: 0,
    endurance: 0,
    chance: 0,
    dexterite: 0,
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
    // HABILETÉ : 1d6 + 6
    const habilete = rollOneDice() + 6;
    
    // ENDURANCE : 2d6 + 12
    const endurance = rollDice() + 12;
    
    // CHANCE : 1d6 + 6
    const chance = rollOneDice() + 6;
    
    // DEXTÉRITÉ : 1d6 + 6
    const dexterite = rollOneDice() + 6;

    setStats({
      habilete,
      endurance,
      chance,
      dexterite,
    });
  };

  const handleCreateCharacter = () => {
    // TODO: Sauvegarder le personnage dans IndexedDB
    const character = {
      id: crypto.randomUUID(),
      name,
      book: 'La Harpe des Quatre Saisons',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        habilete: stats.habilete,
        habileteInitiale: stats.habilete,
        endurance: stats.endurance,
        enduranceInitiale: stats.endurance,
        chance: stats.chance,
        chanceInitiale: stats.chance,
        dexterite: stats.dexterite,
      },
      pointsDeVieMaximum: stats.endurance,
      inventory: {
        items: [
          { name: 'Sac à dos', possessed: true, type: 'item' },
          { name: 'Provisions (10)', possessed: true, type: 'item' },
          { name: 'Or (30 pièces)', possessed: true, type: 'item' },
        ],
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
                onClick={() => setStep('stats')}
                disabled={!name.trim()}
                className="w-full bg-[#FFBF00] hover:bg-yellow-400 disabled:bg-muted disabled:cursor-not-allowed text-[#000000] font-[var(--font-uncial)] font-bold tracking-wider py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(255,191,0,0.6)] hover:scale-[1.02] active:scale-[0.98] text-lg disabled:hover:scale-100 disabled:hover:shadow-none"
              >
                Continuer
              </button>
            </div>
          </div>
        )}

        {/* Étape 2 : Génération des statistiques */}
        {step === 'stats' && (
          <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-[#2a1e17]/60 border border-primary/30 rounded-lg p-6">
              <h2 className="font-[var(--font-uncial)] text-xl tracking-wide text-light mb-3">
                📜 Règles de création
              </h2>
              <ul className="font-[var(--font-merriweather)] text-sm text-muted-light space-y-2">
                <li>• <strong className="text-light">HABILETÉ</strong> : 1d6 + 6</li>
                <li>• <strong className="text-light">ENDURANCE</strong> : 2d6 + 12</li>
                <li>• <strong className="text-light">CHANCE</strong> : 1d6 + 6</li>
                <li>• <strong className="text-light">DEXTÉRITÉ</strong> : 1d6 + 6</li>
              </ul>
            </div>

            {/* Carte des statistiques */}
            <div className="bg-[#2a1e17] glow-border rounded-lg p-8 space-y-6">
              <div className="text-center space-y-2">
                <h2 className="font-[var(--font-uncial)] text-2xl tracking-wide text-light">
                  {name}
                </h2>
                <p className="font-[var(--font-merriweather)] text-sm text-muted-light">
                  Lancez les dés pour déterminer vos caractéristiques
                </p>
              </div>

              {/* Grille des stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1a140f] border-2 border-primary/30 rounded-lg p-4 text-center">
                  <div className="text-xs font-[var(--font-uncial)] tracking-wide text-muted-light mb-2">
                    HABILETÉ
                  </div>
                  <div className="font-[var(--font-geist-mono)] text-4xl font-bold text-primary">
                    {stats.habilete || '—'}
                  </div>
                </div>

                <div className="bg-[#1a140f] border-2 border-primary/30 rounded-lg p-4 text-center">
                  <div className="text-xs font-[var(--font-uncial)] tracking-wide text-muted-light mb-2">
                    ENDURANCE
                  </div>
                  <div className="font-[var(--font-geist-mono)] text-4xl font-bold text-primary">
                    {stats.endurance || '—'}
                  </div>
                </div>

                <div className="bg-[#1a140f] border-2 border-primary/30 rounded-lg p-4 text-center">
                  <div className="text-xs font-[var(--font-uncial)] tracking-wide text-muted-light mb-2">
                    CHANCE
                  </div>
                  <div className="font-[var(--font-geist-mono)] text-4xl font-bold text-primary">
                    {stats.chance || '—'}
                  </div>
                </div>

                <div className="bg-[#1a140f] border-2 border-primary/30 rounded-lg p-4 text-center">
                  <div className="text-xs font-[var(--font-uncial)] tracking-wide text-muted-light mb-2">
                    DEXTÉRITÉ
                  </div>
                  <div className="font-[var(--font-geist-mono)] text-4xl font-bold text-primary">
                    {stats.dexterite || '—'}
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="space-y-3">
                <button
                  onClick={generateStats}
                  className="w-full bg-[#FFBF00] hover:bg-yellow-400 text-[#000000] font-[var(--font-uncial)] font-bold tracking-wider py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(255,191,0,0.6)] hover:scale-[1.02] active:scale-[0.98] text-lg"
                >
                  🎲 Lancer les dés
                </button>

                {stats.habilete > 0 && (
                  <button
                    onClick={handleCreateCharacter}
                    className="w-full bg-primary/20 hover:bg-primary/30 border-2 border-primary text-light font-[var(--font-uncial)] font-bold tracking-wider py-4 px-8 rounded-lg transition-all duration-300 text-lg"
                  >
                    ✓ Créer le personnage
                  </button>
                )}
              </div>
            </div>

            {/* Équipement de départ */}
            {stats.habilete > 0 && (
              <div className="bg-[#2a1e17]/60 border border-primary/30 rounded-lg p-6">
                <h3 className="font-[var(--font-uncial)] text-lg tracking-wide text-light mb-3">
                  🎒 Équipement de départ
                </h3>
                <ul className="font-[var(--font-merriweather)] text-sm text-muted-light space-y-1">
                  <li>• Sac à dos</li>
                  <li>• 10 Provisions</li>
                  <li>• 30 pièces d'or</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
