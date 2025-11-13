'use client';

import { useRouter } from 'next/navigation';

interface CombatEndModalProps {
  status: 'victory' | 'defeat';
  playerName: string;
  enemyName: string;
  roundsCount: number;
  characterId: string;
  onResurrect: () => void;
  onDelete: () => void;
}

export default function CombatEndModal({
  status,
  playerName,
  enemyName,
  roundsCount,
  characterId,
  onResurrect,
  onDelete
}: CombatEndModalProps) {
  const router = useRouter();

  if (status === 'victory') {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
        <div className="bg-[#2a1e17] border-4 border-primary rounded-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4 animate-[float_2s_ease-in-out_infinite]">🎉</div>
          <h2 className="font-[var(--font-uncial)] text-4xl text-primary mb-4">
            VICTOIRE !
          </h2>
          <p className="font-[var(--font-merriweather)] text-light text-lg mb-2">
            {playerName} a vaincu {enemyName} !
          </p>
          <p className="font-[var(--font-merriweather)] text-muted-light mb-6">
            Combat terminé en {roundsCount} assaut{roundsCount > 1 ? 's' : ''}
          </p>
          <button
            onClick={() => router.push(`/characters/${characterId}`)}
            className="w-full bg-primary hover:bg-yellow-400 text-[#1a140f] font-[var(--font-uncial)] font-bold px-6 py-3 rounded-lg transition-colors text-lg"
          >
            Continuer l'aventure
          </button>
        </div>
      </div>
    );
  }

  // Défaite
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      <div className="bg-[#2a1e17] border-4 border-red-500 rounded-lg p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">💀</div>
        <h2 className="font-[var(--font-uncial)] text-4xl text-red-400 mb-4">
          DÉFAITE
        </h2>
        <p className="font-[var(--font-merriweather)] text-light text-lg mb-2">
          {playerName} est tombé au combat...
        </p>
        <p className="font-[var(--font-merriweather)] text-muted-light mb-6">
          {enemyName} a vaincu votre héros après {roundsCount} assaut{roundsCount > 1 ? 's' : ''}
        </p>

        <div className="bg-[#1a140f] border border-red-500/30 rounded-lg p-4 mb-6">
          <p className="font-[var(--font-merriweather)] text-muted-light text-sm mb-3">
            Votre personnage est mort. Que souhaitez-vous faire ?
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={onResurrect}
              className="w-full bg-primary hover:bg-yellow-400 text-[#1a140f] font-[var(--font-uncial)] font-bold px-6 py-3 rounded-lg transition-colors"
            >
              ✨ Ressusciter (PV à 0)
            </button>
            <button
              onClick={onDelete}
              className="w-full bg-red-600 hover:bg-red-700 text-light font-[var(--font-uncial)] font-bold px-6 py-3 rounded-lg transition-colors"
            >
              🗑️ Supprimer le personnage
            </button>
          </div>
        </div>

        <button
          onClick={() => router.push('/characters')}
          className="text-muted-light hover:text-light font-[var(--font-merriweather)] text-sm transition-colors"
        >
          Retour à la liste des personnages
        </button>
      </div>
    </div>
  );
}
