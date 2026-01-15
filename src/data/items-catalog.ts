import catalogJson from '@/data/items-catalog.json';
import { CatalogItem, ItemType, WeaponAbilityDefinition, WeaponEffectDefinition, StatBonus } from '@/src/domain/types/items';
import { WeaponAbilityTrigger } from '@/src/domain/types/WeaponAbilityTrigger';

const VALID_TRIGGERS = Object.values(WeaponAbilityTrigger);
const VALID_EFFECT_TYPES = [
  'extra_attack',
  'heal_on_kill',
  'convert_miss_to_hit',
  'bonus_damage',
  'negate_damage',
] as const;

interface RawWeaponEffectDefinition {
  type: string;
  amount?: number;
  firstAttackOnly?: boolean;
}

interface RawWeaponAbilityDefinition {
  id: string;
  name: string;
  trigger: string;
  effect: RawWeaponEffectDefinition;
  description: string;
  usesPerCombat?: number;
  costChance?: number;
}

/**
 * Validates that a trigger string matches a valid WeaponAbilityTrigger constant
 * @throws {Error} If trigger is invalid
 */
function validateTrigger(trigger: string, itemId: string): void {
  if (!VALID_TRIGGERS.includes(trigger as WeaponAbilityTrigger)) {
    throw new Error(
      `Invalid weapon ability trigger "${trigger}" for item ${itemId}. ` +
      `Valid triggers: ${VALID_TRIGGERS.join(', ')}`
    );
  }
}

/**
 * Validates that an effect type string matches a valid effect type
 * @throws {Error} If effect type is invalid
 */
function validateEffectType(effectType: string, itemId: string): void {
  if (!VALID_EFFECT_TYPES.includes(effectType as typeof VALID_EFFECT_TYPES[number])) {
    throw new Error(
      `Invalid weapon effect type "${effectType}" for item ${itemId}. ` +
      `Valid effect types: ${VALID_EFFECT_TYPES.join(', ')}`
    );
  }
}

/**
 * Maps raw JSON effect definition to typed WeaponEffectDefinition
 * @throws {Error} If effect type is unknown
 */
function mapWeaponEffect(effect: RawWeaponEffectDefinition, itemId: string): WeaponEffectDefinition {
  validateEffectType(effect.type, itemId);

  switch (effect.type) {
    case 'extra_attack':
      return { type: 'extra_attack' };
    case 'heal_on_kill':
      if (effect.amount === undefined) {
        throw new Error(`Missing "amount" for heal_on_kill effect in item ${itemId}`);
      }
      return { type: 'heal_on_kill', amount: effect.amount };
    case 'convert_miss_to_hit':
      return { type: 'convert_miss_to_hit' };
    case 'bonus_damage':
      if (effect.amount === undefined) {
        throw new Error(`Missing "amount" for bonus_damage effect in item ${itemId}`);
      }
      return {
        type: 'bonus_damage',
        amount: effect.amount,
        firstAttackOnly: effect.firstAttackOnly,
      };
    case 'negate_damage':
      return { type: 'negate_damage' };
    default:
      // This should never happen due to validateEffectType, but TypeScript needs exhaustive check
      throw new Error(`Unknown effect type: ${effect.type} for item ${itemId}`);
  }
}

/**
 * Helper to safely cast and assign optional properties to avoid repetitive if checks
 */
function assignOptionalProperty<T, K extends keyof T>(
  target: T,
  source: Record<string, unknown>,
  key: K
): void {
  if (source[key as string] !== undefined) {
    target[key] = source[key as string] as T[K];
  }
}

/**
 * Maps raw JSON catalog item to typed CatalogItem
 * Validates triggers and effect types at load time
 */
function mapCatalogItem(rawItem: Record<string, unknown>): CatalogItem {
  const item: CatalogItem = {
    id: rawItem.id as string,
    name: rawItem.name as string,
    type: rawItem.type as ItemType,
    tome: rawItem.tome as 1 | 2 | 3,
  };

  // Optional primitive properties
  assignOptionalProperty(item, rawItem, 'paragraph');
  assignOptionalProperty(item, rawItem, 'effect');
  assignOptionalProperty(item, rawItem, 'stackable');
  assignOptionalProperty(item, rawItem, 'unique');
  assignOptionalProperty(item, rawItem, 'disappearsOnTimeLoop');
  assignOptionalProperty(item, rawItem, 'attackPoints');
  assignOptionalProperty(item, rawItem, 'healAmount');
  assignOptionalProperty(item, rawItem, 'damageToEnemy');
  assignOptionalProperty(item, rawItem, 'isQuestItem');
  assignOptionalProperty(item, rawItem, 'isLegendary');

  // Complex property: statBonus
  if (rawItem.statBonus !== undefined) {
    item.statBonus = rawItem.statBonus as StatBonus;
  }

  // Complex property: abilities (legendary weapons)
  const abilities = rawItem.abilities;
  if (abilities && Array.isArray(abilities)) {
    item.abilities = abilities.map((ability: RawWeaponAbilityDefinition): WeaponAbilityDefinition => {
      validateTrigger(ability.trigger, item.id);

      return {
        id: ability.id,
        name: ability.name,
        trigger: ability.trigger as WeaponAbilityTrigger,
        effect: mapWeaponEffect(ability.effect, item.id),
        description: ability.description,
        usesPerCombat: ability.usesPerCombat,
        costChance: ability.costChance,
      };
    });
  }

  return item;
}

/**
 * Static catalog loaded from JSON at module load time
 * Validates all triggers and effect types on startup
 */
export const ITEMS_CATALOG: CatalogItem[] = catalogJson.items.map(mapCatalogItem) as CatalogItem[];
