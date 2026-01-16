import type { Character } from '@/src/domain/entities/Character';
import type { CatalogItem } from '@/src/domain/types/items';
import type {
  CombatState,
  CombatantConfig,
  CombatWeapon,
  CombatEvent,
} from '@/src/domain/types/combat-v2';
import type { CharacterService } from './CharacterService';
import { CombatEventType } from '@/src/domain/types/CombatEventType';

export interface CombatEndSummary {
  result: 'victory' | 'defeat' | 'fled';
  rounds: number;
  damageDealt: number;
  damageTaken: number;
  itemsConsumed: Array<{ itemId: string; quantity: number }>;
  chanceUsed: number;
}

export interface CombatPersistenceChanges {
  damageTaken: number;
  newChance: number;
  itemsToRemove: Array<{ itemId: string; quantity: number }>;
  hpGained?: number;
}

export class CombatOrchestrator {
  constructor(
    private characterService: CharacterService,
    private findItemByName: (name: string) => CatalogItem | undefined
  ) {}

  /**
   * Prépare les données du personnage pour initialiser un combat
   */
  prepareCombatantFromCharacter(character: Character): CombatantConfig {
    const stats = character.getStats();
    const inventory = character.getInventory();

    return {
      name: character.name,
      dexterite: stats.dexterite,
      endurance: stats.pointsDeVieActuels,
      enduranceMax: stats.pointsDeVieMax,
      chance: stats.chance,
      weapon: this.extractWeaponFromCharacter(inventory),
    };
  }

  /**
   * Extrait l'arme équipée avec ses capacités légendaires
   */
  private extractWeaponFromCharacter(inventory: { weapon?: { name: string; attackPoints: number } }): CombatWeapon {
    if (!inventory.weapon) {
      return {
        id: 'default-fist',
        name: 'Poings',
        bonus: 0,
      };
    }

    const weaponName = inventory.weapon.name;
    const weaponCatalogItem = this.findWeaponInCatalog(weaponName);

    return {
      id: weaponCatalogItem?.id ?? `weapon-${weaponName.replace(/\s+/g, '-').toLowerCase()}`,
      name: weaponName,
      bonus: inventory.weapon.attackPoints,
      ability: weaponCatalogItem?.abilities?.[0] ? {
        id: weaponCatalogItem.abilities[0].id,
        name: weaponCatalogItem.abilities[0].name,
        trigger: weaponCatalogItem.abilities[0].trigger,
        effect: this.mapWeaponEffect(weaponCatalogItem.abilities[0].effect),
        usesPerCombat: weaponCatalogItem.abilities[0].usesPerCombat,
        costChance: weaponCatalogItem.abilities[0].costChance,
      } : undefined,
    };
  }

  /**
   * Cherche une arme dans le catalogue par son nom
   */
  private findWeaponInCatalog(weaponName: string): CatalogItem | undefined {
    return this.findItemByName(weaponName);
  }

  /**
   * Convertit l'effet d'un WeaponEffectDefinition en effet de combat
   */
  private mapWeaponEffect(effect: import('@/src/domain/types/items').WeaponEffectDefinition): import('@/src/domain/types/combatants').WeaponEffect {
    switch (effect.type) {
      case 'extra_attack':
        return { type: 'extra_attack' };
      case 'heal_on_kill':
        return { type: 'heal_on_kill', amount: effect.amount };
      case 'convert_miss_to_hit':
        return { type: 'convert_miss_to_hit' };
      case 'bonus_damage':
        return {
          type: 'bonus_damage',
          amount: effect.amount,
          firstAttackOnly: effect.firstAttackOnly,
        };
      case 'negate_damage':
        return { type: 'negate_damage' };
    }
  }

  /**
   * Calcule les changements à persister à la fin d'un combat
   */
  calculatePersistenceChanges(
    initialState: CombatState,
    finalState: CombatState
  ): CombatPersistenceChanges {
    const damageTaken = initialState.player.endurance - finalState.player.endurance;

    const itemsToRemove = this.getConsumedItemsFromEvents(finalState.events);
    const hpGained = this.getHpGainedFromAbilities(finalState.events);

    return {
      damageTaken: Math.max(0, damageTaken - (hpGained ?? 0)),
      newChance: finalState.player.chance,
      itemsToRemove,
      hpGained,
    };
  }

  /**
   * Persiste les changements du combat au personnage
   */
  async persistCombatChanges(
    characterId: string,
    changes: CombatPersistenceChanges
  ): Promise<void> {
    if (changes.damageTaken > 0) {
      await this.characterService.applyDamage(characterId, changes.damageTaken);
    }

    const character = await this.characterService.getCharacter(characterId);
    if (character && character.getStats().chance !== changes.newChance) {
      await this.characterService.updateCharacterStats(characterId, {
        chance: changes.newChance,
      });
    }

    for (const item of changes.itemsToRemove) {
      await this.characterService.removeItemQuantity(
        characterId,
        item.itemId,
        item.quantity
      );
    }
  }

  /**
   * Génère un résumé de fin de combat pour l'UI
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
      itemsConsumed: this.getConsumedItemsFromEvents(finalState.events),
      chanceUsed,
    };
  }

  /**
   * Extrait les items consommés depuis les événements de combat
   * NOTE: Les items utilisables en combat ne sont pas encore implémentés dans CombatEngine
   * Cette méthode est prête pour l'implémentation future
   */
  private getConsumedItemsFromEvents(events: CombatEvent[]): Array<{ itemId: string; quantity: number }> {
    // TODO: Add 'item_used' to CombatEventType when implementing items in combat
    // Filter for item_used events (to be implemented in CombatEngine)
    const itemUseEvents = events.filter((e) => (e.type as string) === 'item_used' && 'itemId' in e);
    const consumed = new Map<string, number>();
    for (const event of itemUseEvents) {
      if ('itemId' in event && typeof event.itemId === 'string') {
        const current = consumed.get(event.itemId) ?? 0;
        consumed.set(event.itemId, current + 1);
      }
    }
    return Array.from(consumed.entries()).map(([itemId, quantity]) => ({ itemId, quantity }));
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
   * Détermine le résultat du combat (victoire, défaite, fuite)
   */
  private determineCombatResult(state: CombatState): 'victory' | 'defeat' | 'fled' {
    if (state.phase === 'victory') return 'victory';
    if (state.phase === 'defeat') {
      const fleeEvent = state.events.find((e) => e.type === CombatEventType.FLEE && 'success' in e && e.success);
      return fleeEvent ? 'fled' : 'defeat';
    }
    return 'defeat';
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
