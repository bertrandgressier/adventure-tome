import type { CatalogItem } from '../../types/items';

export class DamageCalculator {
  static calculateTotalDamageBonus(
    weaponDamage: number,
    items: Array<CatalogItem>
  ): number {
    const passiveBonus = items.reduce(
      (sum, item) => sum + (item.statBonus?.damageBonus ?? 0),
      0
    );
    return weaponDamage + passiveBonus;
  }
}
