import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Character } from '../types/character';

interface AdventureHeroDB extends DBSchema {
  characters: {
    key: string;
    value: Character;
    indexes: { 'by-date': string };
  };
}

const DB_NAME = 'adventure-tome-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<AdventureHeroDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<AdventureHeroDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<AdventureHeroDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Créer le store des personnages
      if (!db.objectStoreNames.contains('characters')) {
        const characterStore = db.createObjectStore('characters', {
          keyPath: 'id',
        });
        characterStore.createIndex('by-date', 'createdAt');
      }
    },
  });

  return dbInstance;
}
