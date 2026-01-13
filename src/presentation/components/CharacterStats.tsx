'use client';

import { Hand, Clover, Heart, Shield, Star } from 'lucide-react';
import { useCharacter } from '@/src/presentation/hooks/useCharacter';
import EditableStatField from '@/src/presentation/components/EditableStatField';
import { ReputationControl } from '@/components/adventure/ReputationControl';

interface CharacterStatsProps {
  characterId: string;
  onUpdate?: () => void; // Callback optionnel pour notifier le parent
}

/**
 * Composant refactorisé avec Clean Architecture.
 * 
 * Avant: 8 useState + 4 useRef + logique métier dupliquée
 * Après: 1 hook useCharacter qui encapsule tout
 * 
 * Avantages:
 * - Code réduit de ~300 lignes à ~70 lignes
 * - Logique métier testable (dans Character entity)
 * - Composant réutilisable (EditableStatField)
 * - Pas de duplication de updatedAt
 */
export default function CharacterStats({ characterId, onUpdate }: CharacterStatsProps) {
  const { character, isLoading, error, updateStats } = useCharacter(characterId);
  
  const handleUpdate = async (updates: Parameters<typeof updateStats>[0]) => {
    await updateStats(updates);
    onUpdate?.(); // Notifier le parent si nécessaire
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

  const stats = character.getStatsObject();
  const statsData = stats.toData();
  const showConstitution = character.book > 1;
  const showReputation = character.book === 2;
  const showExperience = character.book >= 3;

  // Styles dynamiques pour les PV actuels
  const getPvStyles = () => {
    if (stats.isDead()) {
      return {
        text: 'text-red-600 drop-shadow-[0_0_2px_rgba(220,38,38,0.8)]',
        container: 'border-red-600 bg-red-950/30 shadow-[0_0_10px_rgba(220,38,38,0.2)]'
      };
    }
    if (stats.isCriticalHealth()) {
      return {
        text: 'text-orange-500 drop-shadow-[0_0_2px_rgba(249,115,22,0.8)]',
        container: 'border-orange-500 bg-orange-950/30 shadow-[0_0_10px_rgba(249,115,22,0.2)]'
      };
    }
    return {
      text: 'text-primary',
      container: ''
    };
  };

  const pvStyles = getPvStyles();

  return (
    <div className="flex flex-col gap-2">
      {/* Ligne 1 : Vie */}
      <div className="grid grid-cols-2 gap-2">
        <EditableStatField
          label="VIE MAX"
          value={statsData.pointsDeVieMax}
          onSave={(value) => handleUpdate({ pointsDeVieMax: value ?? 1 })}
          min={1}
          icon={<Heart className="size-4" />}
        />

        <EditableStatField
          label="VIE"
          value={statsData.pointsDeVieActuels}
          onSave={(value) => handleUpdate({ pointsDeVieActuels: value ?? 0 })}
          min={0}
          icon={<Heart className="size-4" />}
          colorClass={pvStyles.text}
          containerClassName={pvStyles.container}
        />
      </div>

      {/* Ligne 2 : Caractéristiques */}
      <div className={`grid ${showConstitution ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
        <EditableStatField
          label="DEXT."
          value={statsData.dexterite}
          onSave={(value) => handleUpdate({ dexterite: value ?? 1 })}
          min={1}
          icon={<Hand className="size-4" />}
        />

        {showConstitution && (
          <EditableStatField
            label="CONST."
            value={statsData.constitution ?? null}
            onSave={(value) => handleUpdate({ constitution: value === null ? undefined : value })}
            min={0}
            icon={<Shield className="size-4" />}
            placeholder="-"
          />
        )}

        <EditableStatField
          label="CHANCE"
          value={statsData.chance}
          onSave={(value) => handleUpdate({ chance: value ?? 0 })}
          min={0}
          icon={<Clover className="size-4" />}
        />
      </div>

      {/* Ligne 3 : Réputation (Tome 2 uniquement) */}
      {showReputation && statsData.reputation !== null && statsData.reputation !== undefined && (
        <div className="mt-2 bg-card/50 p-3 rounded-lg border border-border/50">
          <ReputationControl
            value={statsData.reputation}
            onChange={(value) => handleUpdate({ reputation: value })}
          />
        </div>
      )}

      {/* Ligne 4 : Expérience (Tome 3+) */}
      {showExperience && (
        <div className="mt-2">
          <EditableStatField
            label="EXPÉRIENCE"
            value={statsData.experience ?? 0}
            onSave={(value) => handleUpdate({ experience: value })}
            min={0}
            icon={<Star className="size-4" />}
          />
        </div>
      )}
    </div>
  );
}
