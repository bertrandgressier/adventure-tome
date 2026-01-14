
import { describe, it, expect, beforeEach } from 'vitest';
import { CharacterService } from '@/src/application/services/CharacterService';
import { IndexedDBCharacterRepository } from '@/src/infrastructure/repositories/IndexedDBCharacterRepository';
import { Character } from '@/src/domain/entities/Character';
import { migrateCharacter } from '@/src/infrastructure/persistence/migrations';

describe('Integration: Time Tracking (Tome 2)', () => {
  let service: CharacterService;
  let repository: IndexedDBCharacterRepository;

  beforeEach(async () => {
    repository = new IndexedDBCharacterRepository();
    service = new CharacterService(repository);
  });

  it('devrait initialiser les champs de suivi du temps à la création', async () => {
    const character = await service.createCharacter({
      name: 'Time Traveler',
      book: 2,
      talent: 'instinct',
      gameMode: 'narrative',
      stats: {
        dexterite: 8,
        chance: 6,
        chanceInitiale: 6,
        pointsDeVieMax: 30,
        pointsDeVieActuels: 30,
      },
    });

    const progress = character.getProgress();
    expect(progress.daysElapsed).toBe(0);
    expect(progress.nextWakeUpParagraph).toBeUndefined();
  });

  it('devrait persister la mise à jour des jours écoulés', async () => {
    const character = await service.createCharacter({
      name: 'Day Watcher',
      book: 2,
      talent: 'instinct',
      gameMode: 'narrative',
      stats: {
        dexterite: 8,
        chance: 6,
        chanceInitiale: 6,
        pointsDeVieMax: 30,
        pointsDeVieActuels: 30,
      },
    });

    // Mise à jour à 2 jours
    await service.updateDaysElapsed(character.id, 2);

    // Vérification persistance
    const retrieved = await service.getCharacter(character.id);
    expect(retrieved?.getProgress().daysElapsed).toBe(2);

    // Mise à jour à 4 jours (max)
    await service.updateDaysElapsed(character.id, 4);
    const retrieved2 = await service.getCharacter(character.id);
    expect(retrieved2?.getProgress().daysElapsed).toBe(4);
  });

  it('devrait persister la mise à jour du prochain réveil', async () => {
    const character = await service.createCharacter({
      name: 'Sleeper',
      book: 2,
      talent: 'instinct',
      gameMode: 'narrative',
      stats: {
        dexterite: 8,
        chance: 6,
        chanceInitiale: 6,
        pointsDeVieMax: 30,
        pointsDeVieActuels: 30,
      },
    });

    // Définir un paragraphe de réveil
    await service.updateNextWakeUpParagraph(character.id, 150);

    // Vérification persistance
    const retrieved = await service.getCharacter(character.id);
    expect(retrieved?.getProgress().nextWakeUpParagraph).toBe(150);

    // Supprimer le paragraphe de réveil (undefined)
    await service.updateNextWakeUpParagraph(character.id, undefined);
    const retrieved2 = await service.getCharacter(character.id);
    expect(retrieved2?.getProgress().nextWakeUpParagraph).toBeUndefined();
  });

  it('devrait migrer correctement un personnage v7 vers v8 (ajout des champs)', () => {
    // Données v7 (avant l'ajout du time tracking)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v7Data: any = {
      id: 'v7-legacy',
      name: 'Legacy Hero',
      book: 2,
      talent: 'force',
      gameMode: 'mortal',
      version: 7,
      createdAt: '2025-01-01T10:00:00.000Z',
      updatedAt: '2025-01-01T10:00:00.000Z',
      stats: {
        dexterite: 10,
        chance: 10,
        chanceInitiale: 10,
        pointsDeVieMax: 20,
        pointsDeVieActuels: 20,
      },
      inventory: {
        boulons: 10,
        items: [],
      },
      progress: {
        currentParagraph: 1,
        history: [1],
        lastSaved: '2025-01-01T10:00:00.000Z',
        // daysElapsed et nextWakeUpParagraph sont absents
      },
      notes: '',
    };

    // Migration
    const migratedData = migrateCharacter(v7Data);
    const character = Character.fromData(migratedData);
    const progress = character.getProgress();

    // Vérification
    expect(character.version).toBe(13);
    expect(progress.daysElapsed).toBe(0); // Initialisé à 0
    expect(progress.nextWakeUpParagraph).toBeUndefined(); // Initialisé à undefined
  });
});
