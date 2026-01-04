import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AddItemModal } from './AddItemModal';
import { ItemType } from '@/src/domain/types/items';

describe('AddItemModal', () => {
  const onAddItem = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render add button', () => {
    render(<AddItemModal onAddItem={onAddItem} currentTome={1} />);
    expect(screen.getByRole('button', { name: /ajouter un item/i })).toBeInTheDocument();
  });

  it('should open dialog when button is clicked', async () => {
    render(<AddItemModal onAddItem={onAddItem} currentTome={1} />);

    const button = screen.getByRole('button', { name: /ajouter un item/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Ajouter un item depuis le catalogue')).toBeInTheDocument();
    });
  });

  it('should display all items when dialog is opened', async () => {
    render(<AddItemModal onAddItem={onAddItem} currentTome={1} />);

    const button = screen.getByRole('button', { name: /ajouter un item/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Potion de soin')).toBeInTheDocument();
      expect(screen.getByText('Collier de charisme')).toBeInTheDocument();
    });
  });

  it('should filter items by search term', async () => {
    render(<AddItemModal onAddItem={onAddItem} currentTome={1} />);

    const button = screen.getByRole('button', { name: /ajouter un item/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Ajouter un item depuis le catalogue')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Rechercher un item (ex: potion, collier...)');
    fireEvent.change(searchInput, { target: { value: 'potion' } });

    await waitFor(() => {
      expect(screen.getByText('Potion de soin')).toBeInTheDocument();
      expect(screen.queryByText('Collier de charisme')).not.toBeInTheDocument();
    });
  });

  it('should filter items by type', async () => {
    render(<AddItemModal onAddItem={onAddItem} currentTome={1} />);

    const button = screen.getByRole('button', { name: /ajouter un item/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Ajouter un item depuis le catalogue')).toBeInTheDocument();
    });

    const activeButton = screen.getByRole('button', { name: 'Actifs' });
    fireEvent.click(activeButton);

    await waitFor(() => {
      expect(screen.getByText('Potion de soin')).toBeInTheDocument();
      expect(screen.queryByText('Collier de charisme')).not.toBeInTheDocument();
    });
  });

  it('should call onAddItem when an item is clicked', async () => {
    render(<AddItemModal onAddItem={onAddItem} currentTome={1} />);

    const button = screen.getByRole('button', { name: /ajouter un item/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Ajouter un item depuis le catalogue')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Rechercher un item (ex: potion, collier...)');
    fireEvent.change(searchInput, { target: { value: 'potion' } });

    await waitFor(() => {
      const item = screen.getByText('Potion de soin');
      fireEvent.click(item);
    });

    expect(onAddItem).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'tome1-potion-soin',
        name: 'Potion de soin',
        type: ItemType.ACTIVE
      })
    );
  });

  it('should close dialog after adding item', async () => {
    render(<AddItemModal onAddItem={onAddItem} currentTome={1} />);

    const button = screen.getByRole('button', { name: /ajouter un item/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Ajouter un item depuis le catalogue')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Rechercher un item (ex: potion, collier...)');
    fireEvent.change(searchInput, { target: { value: 'potion' } });

    await waitFor(() => {
      const item = screen.getByText('Potion de soin');
      fireEvent.click(item);
    });

    await waitFor(() => {
      expect(screen.queryByText('Ajouter un item depuis le catalogue')).not.toBeInTheDocument();
    });
  });

  it('should show empty message when no items match search', async () => {
    render(<AddItemModal onAddItem={onAddItem} currentTome={1} />);

    const button = screen.getByRole('button', { name: /ajouter un item/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Ajouter un item depuis le catalogue')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Rechercher un item (ex: potion, collier...)');
    fireEvent.change(searchInput, { target: { value: 'xyz' } });

    await waitFor(() => {
      expect(screen.getByText('Aucun item trouvé')).toBeInTheDocument();
    });
  });

  it('should be disabled when disabled prop is true', () => {
    render(<AddItemModal onAddItem={onAddItem} disabled currentTome={1} />);
    const button = screen.getByRole('button', { name: /ajouter un item/i });
    expect(button).toBeDisabled();
  });

  it('should filter items by tome', async () => {
    render(<AddItemModal onAddItem={onAddItem} currentTome={2} />);

    const button = screen.getByRole('button', { name: /ajouter un item/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Ajouter un item depuis le catalogue')).toBeInTheDocument();
    });

    expect(screen.getByText('Champignon à poils longs')).toBeInTheDocument();
    expect(screen.queryByText('Potion de soin')).not.toBeInTheDocument();
  });

  it('should default to current tome filter', async () => {
    render(<AddItemModal onAddItem={onAddItem} currentTome={1} />);

    const button = screen.getByRole('button', { name: /ajouter un item/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Ajouter un item depuis le catalogue')).toBeInTheDocument();
    });

    const tome1Button = screen.getByRole('button', { name: 'Tome 1' });
    expect(tome1Button).toHaveClass('bg-primary');
  });
});
