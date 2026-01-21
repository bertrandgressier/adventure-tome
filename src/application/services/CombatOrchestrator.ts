import type { Character } from '@/src/domain/entities/Character';
import type {
  CombatState,
  PlayerConfig,
  CombatWeapon,
  CombatEvent,
} from '@/src/domain/types';
import type { CharacterService } from './CharacterService';
import { CombatEventType } from '@/src/domain/types/CombatEventType';

/**
 * Résumé de fin de combat pour l'UI
 */
export interface CombatEndSummary {
  result: 'victory' | 'defeat';
  rounds: number;
  damageDealt: number;
  damageTaken: number;
  chanceUsed: number;
}

/**
 * Changements à persister après un combat
 */
export interface CombatPersistenceChanges {
  damageTaken: number;
  newChance: number;
  hpGained?: number; // HP gagnés via capacités d'armes (Marteau de la Terre)
}

/**
 * CombatOrchestrator - Application Service
 * 
 * Orchestre le système de combat V2 entre :
 * - CombatEngine (Domain - logique pure)
 * - CharacterService (Application - persistence)
 * - combatSlice (Presentation - état UI)
 * 
 * Responsabilités :
 * - Préparer les données du personnage pour le combat
 * - Calculer les modifications à persister
 * - Appliquer les changements au personnage
 * - Générer le résumé de fin de combat
 */
export class CombatOrchestrator {
  constructor(private characterService: CharacterService) {}

  /**
   * Prépare les données du personnage pour initialiser un combat
   * Extrait les statistiques et l'arme équipée
   */
  prepareCombatantFromCharacter(character: Character): PlayerConfig {
    const stats = character.getStats();
    const inventory = character.getInventory();

    return {
      name: character.name,
      dexterite: stats.dexterite,
      endurance: stats.pointsDeVieActuels,
      enduranceMax: stats.pointsDeVieMax,
      chance: stats.chance,
      weapon: this.extractWeaponFromCharacter(inventory.weapon),
    };
  }

  /**
   * Extrait l'arme équipée du personnage
   * Génère un ID basé sur le nom (cohérent avec combatSlice)
   */
  private extractWeaponFromCharacter(weapon: { name: string; attackPoints: number } | undefined): CombatWeapon {
    if (!weapon) {
      return {
        id: 'default-fist',
        name: 'Poings',
        bonus: 0,
      };
    }

    // Générer un ID basé sur le nom (même pattern que combatSlice.extractWeapon)
    return {
      id: `weapon-${weapon.name.replace(/\s+/g, '-').toLowerCase()}`,
      name: weapon.name,
      bonus: weapon.attackPoints,
    };
  }

  /**
   * Calcule les changements à persister à la fin d'un combat
   * Compare l'état initial et final pour déterminer les modifications
   */
  calculatePersistenceChanges(
    initialState: CombatState,
    finalState: CombatState
  ): CombatPersistenceChanges {
    const damageTaken = initialState.player.endurance - finalState.player.endurance;
    const hpGained = this.getHpGainedFromAbilities(finalState.events);

    return {
      damageTaken: Math.max(0, damageTaken - (hpGained ?? 0)),
      newChance: finalState.player.chance,
      hpGained,
    };
  }

  /**
   * Persiste les changements du combat au personnage
   * Applique les dégâts et met à jour la chance
   */
  async persistCombatChanges(
    characterId: string,
    changes: CombatPersistenceChanges
  ): Promise<void> {
    // 1. Appliquer les dégâts
    if (changes.damageTaken > 0) {
      await this.characterService.applyDamage(characterId, changes.damageTaken);
    }

    // 2. Mettre à jour la chance si elle a changé
    const character = await this.characterService.getCharacter(characterId);
    if (character && character.getStats().chance !== changes.newChance) {
      await this.characterService.updateCharacterStats(characterId, {
        chance: changes.newChance,
      });
    }
  }

  /**
   * Génère un résumé de fin de combat pour l'UI
   * Calcule les statistiques globales du combat
   */
  generateCombatSummary(
    initialState: CombatState,
    finalState: CombatState
  ): CombatEndSummary {
    const chanceUsed = initialState.player.chance - finalState.player.chance;

    return {
      result: this.determineCombatResult(finalState),
      rounds: finalState.roundNumber,
      damageDealt: this.calculateTotalDamageDealt(finalState.events),
      damageTaken: initialState.player.endurance - finalState.player.endurance,
      chanceUsed,
    };
  }

  /**
   * Calcule les HP gagnés via les capacités d'armes (ex: Marteau de la Terre)
   */
  private getHpGainedFromAbilities(events: CombatEvent[]): number | undefined {
    let totalGained = 0;
    for (const event of events) {
      if (event.type === CombatEventType.WEAPON_ABILITY && event.healAmount) {
        totalGained += event.healAmount;
      }
    }
    return totalGained > 0 ? totalGained : undefined;
  }

  /**
   * Détermine le résultat du combat selon l'état
   * Note: En V3, on doit regarder les HP pour déterminer le résultat
   */
  private determineCombatResult(state: CombatState): 'victory' | 'defeat' {
    if (state.player.endurance <= 0) return 'defeat';
    if (state.enemy.endurance <= 0) return 'victory';
    return 'defeat'; // Fallback (ne devrait jamais arriver)
  }

  /**
   * Calcule le total des dégâts infligés par le joueur
   */
  private calculateTotalDamageDealt(events: CombatEvent[]): number {
    let total = 0;
    for (const event of events) {
      if (event.type === CombatEventType.DAMAGE_DEALT && event.damage && event.attacker === 'player') {
        total += event.damage;
      }
    }
    return total;
  }
}
