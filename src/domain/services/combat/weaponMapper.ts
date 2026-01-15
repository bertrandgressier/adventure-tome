import type { CatalogItem } from '../../types/items';
import type { CombatWeapon, WeaponAbility } from '../../types/combatants';
import { WeaponAbilityTrigger } from '../../types/WeaponAbilityTrigger';

export function catalogWeaponToCombatWeapon(catalogItem: CatalogItem): CombatWeapon {
  if (catalogItem.type !== 'weapon') {
    throw new Error(`Item ${catalogItem.id} is not a weapon`);
  }

  const combatWeapon: CombatWeapon = {
    id: catalogItem.id,
    name: catalogItem.name,
    bonus: catalogItem.attackPoints ?? 0,
  };

  if (catalogItem.abilities && catalogItem.abilities.length > 0) {
    const catalogAbility = catalogItem.abilities[0];

    combatWeapon.ability = {
      id: catalogAbility.id,
      name: catalogAbility.name,
      trigger: catalogAbility.trigger as WeaponAbilityTrigger,
      effect: catalogAbility.effect,
      usesPerCombat: catalogAbility.usesPerCombat,
      costChance: catalogAbility.costChance,
    } as WeaponAbility;
  }

  return combatWeapon;
}
