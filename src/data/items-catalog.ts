import catalogJson from '@/data/items-catalog.json';
import { CatalogItem, ItemType, WeaponAbilityDefinition, WeaponEffectDefinition } from '@/src/domain/types/items';
import { WeaponAbilityTrigger } from '@/src/domain/types/WeaponAbilityTrigger';

const VALID_TRIGGERS = Object.values(WeaponAbilityTrigger);

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

function validateTrigger(trigger: string, itemId: string): void {
  if (!VALID_TRIGGERS.includes(trigger as WeaponAbilityTrigger)) {
    throw new Error(
      `Invalid weapon ability trigger "${trigger}" for item ${itemId}. ` +
      `Valid triggers: ${VALID_TRIGGERS.join(', ')}`
    );
  }
}

function mapWeaponEffect(effect: RawWeaponEffectDefinition): WeaponEffectDefinition {
  switch (effect.type) {
    case 'extra_attack':
      return { type: 'extra_attack' };
    case 'heal_on_kill':
      return { type: 'heal_on_kill', amount: effect.amount ?? 0 };
    case 'convert_miss_to_hit':
      return { type: 'convert_miss_to_hit' };
    case 'bonus_damage':
      return {
        type: 'bonus_damage',
        amount: effect.amount ?? 0,
        firstAttackOnly: effect.firstAttackOnly,
      };
    case 'negate_damage':
      return { type: 'negate_damage' };
    default:
      throw new Error(`Unknown effect type: ${effect.type}`);
  }
}

function mapCatalogItem(rawItem: Record<string, unknown>): CatalogItem {
  const item: CatalogItem = {
    id: rawItem.id as string,
    name: rawItem.name as string,
    type: rawItem.type as ItemType,
    tome: rawItem.tome as 1 | 2 | 3,
  };

  if (rawItem.paragraph !== undefined) {
    item.paragraph = rawItem.paragraph as number;
  }
  if (rawItem.effect !== undefined) {
    item.effect = rawItem.effect as string;
  }
  if (rawItem.stackable !== undefined) {
    item.stackable = rawItem.stackable as boolean;
  }
  if (rawItem.unique !== undefined) {
    item.unique = rawItem.unique as boolean;
  }
  if (rawItem.disappearsOnTimeLoop !== undefined) {
    item.disappearsOnTimeLoop = rawItem.disappearsOnTimeLoop as boolean;
  }
  if (rawItem.attackPoints !== undefined) {
    item.attackPoints = rawItem.attackPoints as number;
  }
  if (rawItem.healAmount !== undefined) {
    item.healAmount = rawItem.healAmount as number;
  }
  if (rawItem.damageToEnemy !== undefined) {
    item.damageToEnemy = rawItem.damageToEnemy as number;
  }
  if (rawItem.statBonus !== undefined) {
    item.statBonus = rawItem.statBonus as {
      dexterite?: number;
      chance?: number;
      vie?: number;
      pvMax?: number;
      damageBonus?: number;
      conditionalDamage?: string;
    };
  }
  if (rawItem.isQuestItem !== undefined) {
    item.isQuestItem = rawItem.isQuestItem as boolean;
  }
  if (rawItem.isLegendary !== undefined) {
    item.isLegendary = rawItem.isLegendary as boolean;
  }

  const abilities = rawItem.abilities;
  if (abilities && Array.isArray(abilities)) {
    item.abilities = abilities.map((ability: RawWeaponAbilityDefinition): WeaponAbilityDefinition => {
      validateTrigger(ability.trigger, rawItem.id as string);

      return {
        id: ability.id,
        name: ability.name,
        trigger: ability.trigger as WeaponAbilityTrigger,
        effect: mapWeaponEffect(ability.effect),
        description: ability.description,
        usesPerCombat: ability.usesPerCombat,
        costChance: ability.costChance,
      };
    });
  }

  return item;
}

export const ITEMS_CATALOG: CatalogItem[] = catalogJson.items.map(mapCatalogItem) as CatalogItem[];
