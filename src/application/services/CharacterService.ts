import { Character, type GameMode } from '@/src/domain/entities/Character';
import { ICharacterRepository } from '@/src/domain/repositories/ICharacterRepository';
import { StatsData } from '@/src/domain/value-objects/Stats';
import { CharacterNotFoundError } from '@/src/domain/errors/DomainErrors';
import type { InventoryItem } from '@/src/domain/value-objects/Inventory';
import { InventoryItemRef } from '@/src/domain/types/items';

/**
 * CharacterService - Application Service
 * Orchestre les use cases de gestion des personnages
 */
export class CharacterService {
  constructor(private readonly repository: ICharacterRepository) {}

  /**
   * Récupère un personnage par son ID
   */
  async getCharacter(id: string): Promise<Character | null> {
    return this.repository.findById(id);
  }

  /**
   * Récupère tous les personnages
   */
  async getAllCharacters(): Promise<Character[]> {
    return this.repository.findAll();
  }

  /**
   * Crée un nouveau personnage
   */
  async createCharacter(data: {
    name: string;
    book: number;
    talent: string;
    secondTalent?: string;
    gameMode: GameMode;
    stats: StatsData;
  }): Promise<Character> {
    // La logique métier est dans Character.create()
    const character = Character.create(data);
    
    await this.repository.save(character);
    
    return character;
  }

  /**
   * Supprime un personnage
   */
  async deleteCharacter(id: string): Promise<void> {
    const exists = await this.repository.exists(id);
    if (!exists) {
      throw new CharacterNotFoundError(id);
    }
    
    await this.repository.delete(id);
  }

  /**
   * Met à jour le nom d'un personnage
   */
  async updateCharacterName(id: string, newName: string): Promise<Character> {
    const character = await this.repository.findById(id);
    if (!character) {
      throw new CharacterNotFoundError(id);
    }

    // La logique métier (validation) est dans Character.updateName()
    const updated = character.updateName(newName);
    
    await this.repository.save(updated);
    
    return updated;
  }

  /**
   * Met à jour les statistiques d'un personnage
   */
  async updateCharacterStats(
    id: string,
    statsUpdate: Partial<StatsData>
  ): Promise<Character> {
    const character = await this.repository.findById(id);
    if (!character) {
      throw new CharacterNotFoundError(id);
    }

    // La logique métier (validation) est dans Character.updateStats()
    const updated = character.updateStats(statsUpdate);
    
    await this.repository.save(updated);
    
    return updated;
  }

  /**
   * Applique des dégâts à un personnage
   */
  async applyDamage(id: string, damage: number): Promise<Character> {
    const character = await this.repository.findById(id);
    if (!character) {
      throw new CharacterNotFoundError(id);
    }

    const updated = character.takeDamage(damage);
    
    await this.repository.save(updated);
    
    return updated;
  }

  /**
   * Soigne un personnage
   */
  async healCharacter(id: string, amount: number): Promise<Character> {
    const character = await this.repository.findById(id);
    if (!character) {
      throw new CharacterNotFoundError(id);
    }

    const updated = character.heal(amount);
    
    await this.repository.save(updated);
    
    return updated;
  }

  /**
   * Équipe une arme à un personnage
   */
  async equipWeapon(
    id: string,
    weapon: { name: string; attackPoints: number }
  ): Promise<Character> {
    const character = await this.repository.findById(id);
    if (!character) {
      throw new CharacterNotFoundError(id);
    }

    const updated = character.equipWeapon(weapon);
    
    await this.repository.save(updated);
    
    return updated;
  }

  /**
   * Ajoute un objet à l'inventaire
   */
  async addItemToInventory(
    id: string,
    item: Partial<InventoryItem> & { name: string; possessed?: boolean }
  ): Promise<Character> {
    const character = await this.repository.findById(id);
    if (!character) {
      throw new CharacterNotFoundError(id);
    }

    const updated = character.addItem(item);

    await this.repository.save(updated);

    return updated;
  }

  /**
   * Ajoute un objet à l'inventaire via une référence au catalog
   */
  async addItemToInventoryWithRef(
    id: string,
    itemRef: InventoryItemRef,
    isStackable: boolean,
    isBourse: boolean
  ): Promise<Character> {
    const character = await this.repository.findById(id);
    if (!character) {
      throw new CharacterNotFoundError(id);
    }

    const updated = character.addItemWithRef(itemRef, isStackable, isBourse);

    await this.repository.save(updated);

    return updated;
  }

  /**
   * Change le paragraphe actuel
   */
  async goToParagraph(id: string, paragraph: number): Promise<Character> {
    const character = await this.repository.findById(id);
    if (!character) {
      throw new CharacterNotFoundError(id);
    }

    const updated = character.goToParagraph(paragraph);
    
    await this.repository.save(updated);
    
    return updated;
  }

  /**
   * Met à jour les notes
   */
  async updateNotes(id: string, notes: string): Promise<Character> {
    const character = await this.repository.findById(id);
    if (!character) {
      throw new CharacterNotFoundError(id);
    }

    const updated = character.updateNotes(notes);
    
    await this.repository.save(updated);
    
    return updated;
  }

  /**
   * Retire l'arme équipée
   */
  async unequipWeapon(id: string): Promise<Character> {
    const character = await this.repository.findById(id);
    if (!character) {
      throw new CharacterNotFoundError(id);
    }

    const updated = character.unequipWeapon();
    
    await this.repository.save(updated);
    
    return updated;
  }

  /**
   * Supprimer un objet de l'inventaire
   */
  async removeItemFromInventory(id: string, itemIndex: number): Promise<Character> {
    const character = await this.repository.findById(id);
    if (!character) {
      throw new CharacterNotFoundError(id);
    }

    const updated = character.removeItem(itemIndex);
    
    await this.repository.save(updated);
    
    return updated;
  }

  /**
   * Ajouter des boulons
   */
  async addBoulons(id: string, amount: number): Promise<Character> {
    const character = await this.repository.findById(id);
    if (!character) {
      throw new CharacterNotFoundError(id);
    }

    const updated = character.addBoulons(amount);
    
    await this.repository.save(updated);
    
    return updated;
  }

  /**
   * Retirer des boulons
   */
  async removeBoulons(id: string, amount: number): Promise<Character> {
    const character = await this.repository.findById(id);
    if (!character) {
      throw new CharacterNotFoundError(id);
    }

    const updated = character.removeBoulons(amount);

    await this.repository.save(updated);

    return updated;
  }

  /**
   * Retire 1 quantité d'un item stackable
   */
  async removeOneQuantity(id: string, itemIndex: number): Promise<Character> {
    const character = await this.repository.findById(id);
    if (!character) {
      throw new CharacterNotFoundError(id);
    }

    const items = character.getInventory().items;
    const item = items[itemIndex];

    if (!item) {
      throw new Error('Item non trouvé');
    }

    if (!item.stackable) {
      throw new Error('Cet item n\'est pas consommable');
    }

    const quantity = item.quantity || 1;
    if (quantity <= 1) {
      throw new Error('Quantité invalide, utilisez removeItemFromInventory à la place');
    }

    const updated = character.updateItemQuantity(itemIndex, quantity - 1);
    
    await this.repository.save(updated);
    
    return updated;
  }

  /**
   * Duplique un personnage
   */
  async duplicateCharacter(id: string): Promise<Character> {
    const original = await this.repository.findById(id);
    if (!original) {
      throw new CharacterNotFoundError(id);
    }

    // Créer une copie avec un nouveau nom et ID
    const copy = Character.create({
      name: `${original.name} (Copie)`,
      book: original.book,
      talent: original.talent,
      gameMode: original.gameMode,
      stats: original.getStats(),
    });

    await this.repository.save(copy);
    
    return copy;
  }

  /**
   * Met à jour le livre d'un personnage
   */
  async updateBook(id: string, newBook: number): Promise<Character> {
    const character = await this.repository.findById(id);
    if (!character) {
      throw new CharacterNotFoundError(id);
    }

    const updated = character.updateBook(newBook);
    
    await this.repository.save(updated);
    
    return updated;
  }

  /**
   * Met à jour les jours écoulés (Tome 2)
   */
  async updateDaysElapsed(id: string, days: number): Promise<Character> {
    const character = await this.repository.findById(id);
    if (!character) {
      throw new CharacterNotFoundError(id);
    }

    const updated = character.updateDaysElapsed(days);
    
    await this.repository.save(updated);
    
    return updated;
  }

  /**
   * Met à jour le paragraphe de prochain réveil (Tome 2)
   */
  async updateNextWakeUpParagraph(id: string, paragraph: number | undefined): Promise<Character> {
    const character = await this.repository.findById(id);
    if (!character) {
      throw new CharacterNotFoundError(id);
    }

    const updated = character.updateNextWakeUpParagraph(paragraph);
    
    await this.repository.save(updated);
    
    return updated;
  }

  /**
   * Met à jour le second talent (Tome 2+)
   */
  async updateSecondTalent(id: string, secondTalent: string | undefined): Promise<Character> {
    const character = await this.repository.findById(id);
    if (!character) {
      throw new CharacterNotFoundError(id);
    }

    const updated = character.updateSecondTalent(secondTalent);
    
    await this.repository.save(updated);
    
    return updated;
  }
}
