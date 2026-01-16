/**
 * Data Migration System
 * 
 * Inspired by Zustand persist middleware versioning pattern.
 * Each character has a version field to track data structure evolution.
 * 
 * When adding new fields to Character:
 * 1. Increment CURRENT_VERSION
 * 2. Add migration in migrations array
 * 3. Provide default values for backward compatibility
 * 4. Test in data-migration.test.ts
 */

import { BOURSE_ITEM_NAME } from '@/src/domain/value-objects/Inventory';

export const CURRENT_VERSION = 13;

/**
 * Known weapon name to itemId mapping for migration
 * Used to retroactively add itemId to existing weapons
 */
const WEAPON_NAME_TO_ID: Record<string, string> = {
  // Tome 1 weapons
  'arc et carquois': 'tome1-arc-carquois',
  'épée courte (+1)': 'tome1-epee-courte-1',
  'epee courte (+1)': 'tome1-epee-courte-1',
  'épée courte (+2)': 'tome1-epee-courte-2',
  'epee courte (+2)': 'tome1-epee-courte-2',
  // Tome 3 legendary weapons
  "lame de l'aube éternelle": 'tome3-lame-aube-eternelle',
  "lame de l'aube eternelle": 'tome3-lame-aube-eternelle',
  'marteau de la terre': 'tome3-marteau-terre',
  'arc des vents': 'tome3-arc-vents',
  'dague des ombres': 'tome3-dague-ombres',
  'bâton du sage': 'tome3-baton-sage',
  'baton du sage': 'tome3-baton-sage',
};

/**
 * Find weapon itemId by matching weapon name (case-insensitive)
 * Returns undefined if no match found
 */
function findWeaponItemIdByName(name: string | undefined): string | undefined {
  if (!name) return undefined;
  
  const normalizedName = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  
  return WEAPON_NAME_TO_ID[normalizedName];
}

/**
 * Legacy item type (pre-v10)
 */
interface LegacyItem {
  id?: string;
  name?: string;
  possessed?: boolean;
  type?: 'item' | 'special';
  attackPoints?: number;
}

/**
 * Full inventory item type (pre-v11)
 */
interface FullInventoryItem {
  id: string;
  name: string;
  type: string;
  possessed: boolean;
  effect?: string;
  quantity?: number;
  stackable?: boolean;
  unique?: boolean;
  disappearsOnTimeLoop?: boolean;
  attackPoints?: number;
  healAmount?: number;
  damageToEnemy?: number;
  statBonus?: Record<string, number>;
  isQuestItem?: boolean;
}

/**
 * Migration interface
 * Each migration transforms data from version N to version N+1
 */
export interface Migration {
  version: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  migrate: (data: any) => any;
}

/**
 * Registry of all migrations (chronological order)
 * 
 * Migration v1 → v2: Add gameMode and version fields
 * - Legacy characters (no version field) get gameMode='mortal' (preserve current behavior)
 * - Add version=2 to track migration
 * 
 * Migration v2 → v3: Add optional constitution field to stats
 * - New optional stat for tome 2 & 3
 * - Default to null (not set)
 * 
 * Migration v3 → v4: Convert book title to book number
 * - "La Harpe des Quatre Saisons" -> 1
 * - "La Confrérie de NUADA" -> 2
 * - "Les Entrailles du temps" -> 3
 * - Default to 1 if unknown
 * 
 * Migration v4 → v5: Add reputation field to stats
 * - New stat for tome 2
 * - Default to 0 if book is 2, else null
 * 
 * Migration v5 → v6: Add mandatory Bourse item to inventory
 * - Ensure all characters have the Bourse item
 * - Add it at the beginning if missing
 * 
 * Migration v6 → v7: Fix reputation for book 2
 * - Ensure reputation is 0 (not undefined) for book 2
 * - Keep null for other books
 * 
 * Migration v7 → v8: Add days elapsed and next wake up paragraph for Tome 2
 * - Add daysElapsed (default 0) and nextWakeUpParagraph (default undefined)
 * - Only used for Tome 2 time tracking
 * 
 * Migration v8 → v9: Add optional second talent for Tome 2+ characters
 * - Add secondTalent (default undefined) for characters from Tome 2 and beyond
 * - Characters can now have 1 or 2 talents based on their book
 *
 * Migration v9 → v10: Add item types and inventory structure
 * - Migrate existing inventory items to have an ID and proper type (basic by default)
 * - Add all new item fields with default values (quantity, stackable, unique, etc.)
 * - Ensure backward compatibility with legacy inventory items
 *
 * Migration v10 → v11: Convert inventory items to references
 * - Convert full inventory items to InventoryItemRef (itemId + quantity + possessed)
 * - Remove duplication: items no longer store name, effect, type, etc.
 * - Items are now looked up from the catalog at runtime
 *
 * Migration v11 → v12: Add experience field to stats
 * - Add experience (optional) for Tome 3+ characters
 * - Default to 0 for book >= 3, null for book < 3
 *
 * Migration v12 → v13: Add itemId to weapon for catalog lookup
 * - Add itemId field to weapon for abilities lookup
 * - Try to match existing weapon name to catalog items
 * - Enables legendary weapon abilities in combat
 */
export const migrations: Migration[] = [
  {
    version: 2,
    migrate: (data) => ({
      ...data,
      gameMode: data.gameMode ?? 'mortal', // Default to mortal mode for legacy characters
      version: 2,
    }),
  },
  {
    version: 3,
    migrate: (data) => ({
      ...data,
      stats: {
        ...data.stats,
        constitution: data.stats?.constitution ?? null, // Optional field, default null
      },
      version: 3,
    }),
  },
  {
    version: 4,
    migrate: (data) => {
      const bookMapping: Record<string, number> = {
        "La Harpe des Quatre Saisons": 1,
        "La Confrérie de NUADA": 2,
        "Les Entrailles du temps": 3,
      };
      return {
        ...data,
        book: typeof data.book === 'string' ? (bookMapping[data.book] ?? 1) : data.book,
        version: 4,
      };
    },
  },
  {
    version: 5,
    migrate: (data) => ({
      ...data,
      stats: {
        ...data.stats,
        reputation: data.stats.reputation ?? (data.book === 2 ? 0 : null),
      },
      version: 5,
    }),
  },
  {
    version: 6,
    migrate: (data) => {
      const items = data.inventory?.items || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hasBourse = items.some((item: any) => item.name === BOURSE_ITEM_NAME);
      
      return {
        ...data,
        inventory: {
          ...data.inventory,
          items: hasBourse 
            ? items 
            : [{ name: BOURSE_ITEM_NAME, possessed: true }, ...items],
        },
        version: 6,
      };
    },
  },
  {
    version: 7,
    migrate: (data) => {
      // Fix reputation for book 2: ensure it's 0 if undefined, keep null for other books
      const currentReputation = data.stats?.reputation;
      const fixedReputation = data.book === 2 
        ? (currentReputation ?? 0) 
        : (currentReputation ?? null);
      
      return {
        ...data,
        stats: {
          ...data.stats,
          reputation: fixedReputation,
        },
        version: 7,
      };
    },
  },
  {
    version: 8,
    migrate: (data) => {
      // Add days elapsed and next wake up paragraph for progress tracking (Tome 2)
      return {
        ...data,
        progress: {
          ...data.progress,
          daysElapsed: data.progress?.daysElapsed ?? 0,
          nextWakeUpParagraph: data.progress?.nextWakeUpParagraph,
        },
        version: 8,
      };
    },
  },
  {
    version: 9,
    migrate: (data) => {
      // Add optional second talent for Tome 2+ characters
      return {
        ...data,
        secondTalent: data.secondTalent ?? undefined,
        version: 9,
      };
    },
  },
  {
    version: 10,
    migrate: (data) => {
      // Add item types and inventory structure
      const items = data.inventory?.items || [];
      
      // Migrate existing items to new structure
      const migratedItems = items.map((item: LegacyItem, index: number) => ({
        id: item.id || `legacy-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 9)}`,
        name: item.name || 'Item inconnu',
        type: 'basic',
        possessed: item.possessed ?? true,
        effect: item.attackPoints ? `Arme avec +${item.attackPoints} dégâts` : undefined,
        quantity: 1,
        stackable: false,
        unique: false,
        disappearsOnTimeLoop: false,
        attackPoints: item.attackPoints,
        healAmount: undefined,
        damageToEnemy: undefined,
        statBonus: undefined,
        isQuestItem: false,
      }));

      return {
        ...data,
        inventory: {
          ...data.inventory,
          items: migratedItems,
        },
        version: 10,
      };
    },
  },
  {
    version: 11,
    migrate: (data) => {
      const items = data.inventory?.items || [];

      const migratedItems = items.map((item: FullInventoryItem) => ({
        itemId: item.id,
        quantity: item.quantity ?? 1,
        possessed: item.possessed,
        fallbackName: item.name,
      }));

      return {
        ...data,
        inventory: {
          ...data.inventory,
          items: migratedItems,
        },
        version: 11,
      };
    },
  },
  {
    version: 12,
    migrate: (data) => {
      const currentExperience = data.stats?.experience;
      const newExperience = currentExperience ?? (data.book >= 3 ? 0 : null);

      return {
        ...data,
        stats: {
          ...data.stats,
          experience: newExperience,
        },
        version: 12,
      };
    },
  },
  {
    version: 13,
    migrate: (data) => {
      // Add itemId to weapon for catalog lookup (enables legendary abilities)
      const weapon = data.inventory?.weapon;
      
      if (!weapon) {
        return { ...data, version: 13 };
      }

      // If already has itemId, keep it
      if (weapon.itemId) {
        return { ...data, version: 13 };
      }

      // Try to find itemId by matching weapon name to catalog
      const weaponItemId = findWeaponItemIdByName(weapon.name);

      return {
        ...data,
        inventory: {
          ...data.inventory,
          weapon: {
            ...weapon,
            itemId: weaponItemId,
          },
        },
        version: 13,
      };
    },
  },
  // Future migrations here
];

/**
 * Migrate character data to current version
 * 
 * @param data - Raw character data from IndexedDB
 * @returns Migrated data at CURRENT_VERSION
 * 
 * @example
 * // Legacy character (v1)
 * const legacyData = { id: '123', name: 'Aragorn', stats: { ... } };
 * const migrated = migrateCharacter(legacyData);
 * // migrated = { id: '123', name: 'Aragorn', gameMode: 'mortal', version: 4, book: 1, stats: { constitution: null, ... } }
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function migrateCharacter(data: any): any {
  const currentVersion = data.version ?? 1; // Default to v1 if no version field
  
  // Already at current version
  if (currentVersion >= CURRENT_VERSION) {
    return data;
  }
  
  // Apply all necessary migrations sequentially
  return migrations
    .filter(m => m.version > currentVersion)
    .sort((a, b) => a.version - b.version)
    .reduce((acc, migration) => migration.migrate(acc), data);
}
