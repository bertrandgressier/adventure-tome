import type { CatalogItem } from '../../types/items';
import type { CombatWeapon, WeaponAbility } from '../../types/combatants';
import { WeaponAbilityTrigger } from '../../types/WeaponAbilityTrigger';
import { COMBAT_ERRORS } from './constants';

/**
 * Type guard to validate WeaponAbilityTrigger values from catalog
 */
function isValidWeaponAbilityTrigger(value: unknown): value is WeaponAbilityTrigger {
  return (
    typeof value === 'string' &&
    Object.values(WeaponAbilityTrigger).includes(value as WeaponAbilityTrigger)
  );
}

export function catalogWeaponToCombatWeapon(catalogItem: CatalogItem): CombatWeapon {
  if (catalogItem.type !== 'weapon') {
    throw new Error(COMBAT_ERRORS.WEAPON_MAPPER.NOT_A_WEAPON(catalogItem.id));
  }

  const combatWeapon: CombatWeapon = {
    id: catalogItem.id,
    name: catalogItem.name,
    bonus: catalogItem.attackPoints ?? 0,
  };

  if (catalogItem.abilities && catalogItem.abilities.length > 0) {
    const catalogAbility = catalogItem.abilities[0];

    // Validate trigger value before casting
    if (!isValidWeaponAbilityTrigger(catalogAbility.trigger)) {
      throw new Error(
        COMBAT_ERRORS.WEAPON_MAPPER.INVALID_TRIGGER(catalogAbility.trigger, catalogItem.id)
      );
    }

    combatWeapon.ability = {
      id: catalogAbility.id,
      name: catalogAbility.name,
      trigger: catalogAbility.trigger,
      effect: catalogAbility.effect,
      usesPerCombat: catalogAbility.usesPerCombat,
      costChance: catalogAbility.costChance,
    } as WeaponAbility;
  }

  return combatWeapon;
}
