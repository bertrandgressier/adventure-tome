import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ItemPicker, type ItemWithQuantity } from './ItemPicker';
import type { CatalogItem } from '@/src/domain/types/items';
import { ItemType } from '@/src/domain/types/items';

describe('ItemPicker', () => {
  const mockOnSelect = vi.fn();
  const mockOnClose = vi.fn();

  const mockCatalogItems: CatalogItem[] = [
    {
      id: 'tome1-potion-soin',
      name: 'Potion de soin',
      type: ItemType.ACTIVE,
      tome: 1,
      healAmount: 5,
      effect: 'Restaure 5 points de vie',
    },
    {
      id: 'tome1-potion-vigueur',
      name: 'Potion de vigueur',
      type: ItemType.ACTIVE,
      tome: 1,
      healAmount: 3,
      effect: 'Restaure 3 points de vie',
    },
    {
      id: 'tome1-bombe-feu',
      name: 'Bombe de feu',
      type: ItemType.SPECIAL,
      tome: 1,
      damageToEnemy: 3,
      effect: 'Inflige 3 dégâts à l\'ennemi',
    },
  ];

  const mockItems: ItemWithQuantity[] = mockCatalogItems.map((item) => ({
    item,
    quantity: 2,
    usedCount: 0,
  }));

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('when open', () => {
    beforeEach(() => {
      render(
        <ItemPicker
          items={mockItems}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
          isOpen={true}
        />
      );
    });

    it('should render item picker', () => {
      expect(screen.getByText('Choisir un objet')).toBeInTheDocument();
    });

    it('should render all items', () => {
      expect(screen.getByText('Potion de soin')).toBeInTheDocument();
      expect(screen.getByText('Potion de vigueur')).toBeInTheDocument();
      expect(screen.getByText('Bombe de feu')).toBeInTheDocument();
    });

    it('should display item names', () => {
      expect(screen.getByText('Potion de soin')).toBeInTheDocument();
      expect(screen.getByText('Potion de vigueur')).toBeInTheDocument();
      expect(screen.getByText('Bombe de feu')).toBeInTheDocument();
    });

    it('should display item effects', () => {
      expect(screen.getByText('Restaure 5 points de vie')).toBeInTheDocument();
      expect(screen.getByText('Restaure 3 points de vie')).toBeInTheDocument();
      expect(screen.getByText('Inflige 3 dégâts à l\'ennemi')).toBeInTheDocument();
    });

    it('should display heal amount for healing items', () => {
      expect(screen.getByText('+5 PV')).toBeInTheDocument();
      expect(screen.getByText('+3 PV')).toBeInTheDocument();
    });

    it('should display damage for offensive items', () => {
      expect(screen.getByText('-3 dégâts à l\'ennemi')).toBeInTheDocument();
    });

    it('should display tome number', () => {
      const tomeBadges = screen.getAllByText('T1');
      expect(tomeBadges.length).toBe(3);
    });

    it('should render close button', () => {
      expect(screen.getByLabelText('Fermer')).toBeInTheDocument();
    });

    it('should render cancel button', () => {
      expect(screen.getByText('Annuler')).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();

      const closeButton = screen.getByLabelText('Fermer');
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();

      const cancelButton = screen.getByText('Annuler');
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when backdrop is clicked', async () => {
      const user = userEvent.setup();

      const backdrop = screen.getByLabelText('Fermer le sélecteur d\'objets');
      await user.click(backdrop);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onSelect with item id when item is clicked', async () => {
      const user = userEvent.setup();

      const potionItem = screen.getByText('Potion de soin').closest('button');
      await user.click(potionItem!);

      expect(mockOnSelect).toHaveBeenCalledWith('tome1-potion-soin');
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should render items in scrollable container when many items', () => {
      const manyCatalogItems: CatalogItem[] = Array.from({ length: 20 }, (_, i) => ({
        id: `item-${i}`,
        name: `Item ${i}`,
        type: ItemType.ACTIVE,
        tome: 1,
        healAmount: 1,
        effect: 'Effect',
      }));

      const manyItems: ItemWithQuantity[] = manyCatalogItems.map(item => ({
        item,
        quantity: 1,
        usedCount: 0,
      }));

      render(
        <ItemPicker
          items={manyItems}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
          isOpen={true}
        />
      );

      const scrollContainers = screen.getAllByText('Choisir un objet')
        .map(el => el.closest('.fixed')?.querySelector('.max-h-\\[50vh\\]'))
        .filter(Boolean);

      expect(scrollContainers.length).toBeGreaterThan(0);
      expect(scrollContainers[0]).toBeInTheDocument();
    });
  });

  describe('when closed', () => {
    beforeEach(() => {
      render(
        <ItemPicker
          items={mockItems}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
          isOpen={false}
        />
      );
    });

    it('should not render item picker', () => {
      expect(screen.queryByText('Choisir un objet')).not.toBeInTheDocument();
      expect(screen.queryByText('Potion de soin')).not.toBeInTheDocument();
    });

    it('should not render backdrop', () => {
      expect(
        screen.queryByLabelText('Fermer le sélecteur d\'objets')
      ).not.toBeInTheDocument();
    });
  });

  describe('when empty items list', () => {
    it('should display empty message', () => {
      render(
        <ItemPicker
          items={[]}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
          isOpen={true}
        />
      );

      expect(
        screen.getByText('Aucun objet utilisable disponible')
      ).toBeInTheDocument();
    });

    it('should still render close button', () => {
      render(
        <ItemPicker
          items={[]}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
          isOpen={true}
        />
      );

      expect(screen.getByLabelText('Fermer')).toBeInTheDocument();
    });

    it('should still render cancel button', () => {
      render(
        <ItemPicker
          items={[]}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
          isOpen={true}
        />
      );

      expect(screen.getByText('Annuler')).toBeInTheDocument();
    });
  });

  describe('when open', () => {
    describe('Accessibility', () => {
      it('should have close button with aria-label', () => {
        render(
          <ItemPicker
            items={mockItems}
            onSelect={mockOnSelect}
            onClose={mockOnClose}
            isOpen={true}
          />
        );

        expect(screen.getByLabelText('Fermer')).toBeInTheDocument();
      });

      it('should have backdrop with aria-label', () => {
        render(
          <ItemPicker
            items={mockItems}
            onSelect={mockOnSelect}
            onClose={mockOnClose}
            isOpen={true}
          />
        );

        expect(
          screen.getByLabelText('Fermer le sélecteur d\'objets')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Item types', () => {
    it('should display items with only damage effect', () => {
      const damageCatalogItem: CatalogItem = {
        id: 'tome1-bombe-feu',
        name: 'Bombe de feu',
        type: ItemType.SPECIAL,
        tome: 1,
        damageToEnemy: 5,
        effect: 'Explosion de feu',
      };

      const damageItem: ItemWithQuantity[] = [{
        item: damageCatalogItem,
        quantity: 1,
        usedCount: 0,
      }];

      render(
        <ItemPicker
          items={damageItem}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
          isOpen={true}
        />
      );

      expect(screen.getByText('-5 dégâts à l\'ennemi')).toBeInTheDocument();
    });

    it('should display items with only heal effect', () => {
      const healCatalogItem: CatalogItem = {
        id: 'tome1-potion-soin',
        name: 'Potion de soin',
        type: ItemType.ACTIVE,
        tome: 1,
        healAmount: 10,
        effect: 'Grande potion',
      };

      const healItem: ItemWithQuantity[] = [{
        item: healCatalogItem,
        quantity: 1,
        usedCount: 0,
      }];

      render(
        <ItemPicker
          items={healItem}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
          isOpen={true}
        />
      );

      expect(screen.getByText('+10 PV')).toBeInTheDocument();
    });

    it('should display items with both heal and damage', () => {
      const hybridCatalogItem: CatalogItem = {
        id: 'tome1-potion-guerriere',
        name: 'Potion guerrière',
        type: ItemType.SPECIAL,
        tome: 1,
        healAmount: 5,
        damageToEnemy: 3,
        effect: 'Soin + dégâts',
      };

      const hybridItem: ItemWithQuantity[] = [{
        item: hybridCatalogItem,
        quantity: 1,
        usedCount: 0,
      }];

      render(
        <ItemPicker
          items={hybridItem}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
          isOpen={true}
        />
      );

      expect(screen.getByText('+5 PV')).toBeInTheDocument();
      expect(screen.getByText('-3 dégâts à l\'ennemi')).toBeInTheDocument();
    });

    it('should display items with only effect text', () => {
      const effectOnlyCatalogItem: CatalogItem = {
        id: 'tome1-bague-chance',
        name: 'Bague de chance',
        type: ItemType.SPECIAL,
        tome: 1,
        effect: 'Augmente la chance',
      };

      const effectOnlyItem: ItemWithQuantity[] = [{
        item: effectOnlyCatalogItem,
        quantity: 1,
        usedCount: 0,
      }];

      render(
        <ItemPicker
          items={effectOnlyItem}
          onSelect={mockOnSelect}
          onClose={mockOnClose}
          isOpen={true}
        />
      );

      expect(screen.getByText('Augmente la chance')).toBeInTheDocument();
      expect(screen.queryByText(/\+\d+ PV/)).not.toBeInTheDocument();
      expect(screen.queryByText(/-\d+ dégâts/)).not.toBeInTheDocument();
    });
  });
});
