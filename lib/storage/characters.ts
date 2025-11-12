import { getDB } from './db';
import { Character } from '../types/character';

export async function saveCharacter(character: Character): Promise<void> {
  const db = await getDB();
  await db.put('characters', character);
}

export async function getCharacter(id: string): Promise<Character | undefined> {
  const db = await getDB();
  return db.get('characters', id);
}

export async function getAllCharacters(): Promise<Character[]> {
  const db = await getDB();
  return db.getAll('characters');
}

export async function deleteCharacter(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('characters', id);
}

export async function updateCharacter(character: Character): Promise<void> {
  const db = await getDB();
  character.updatedAt = new Date().toISOString();
  await db.put('characters', character);
}
