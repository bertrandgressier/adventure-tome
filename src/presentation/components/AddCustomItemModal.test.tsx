import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AddCustomItemModal } from './AddCustomItemModal';
import { ItemType } from '@/src/domain/types/items';

describe('AddCustomItemModal', () => {
  const mockOnAddCustomItem = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    mockOnAddCustomItem.mockClear();
    mockOnOpenChange.mockClear();
  });

  it('should render all required fields', () => {
    render(
      <AddCustomItemModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onAddCustomItem={mockOnAddCustomItem}
      />
    );

    expect(screen.getByLabelText(/nom de l'item/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/type d'item/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description \/ effet/i)).toBeInTheDocument();
  });

  it('should validate that name is required', async () => {
    render(
      <AddCustomItemModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onAddCustomItem={mockOnAddCustomItem}
      />
    );

    const submitButton = screen.getByRole('button', { name: /créer l'item/i });
    expect(submitButton).toBeDisabled();

    const nameInput = screen.getByLabelText(/nom de l'item/i);
    await fireEvent.change(nameInput, { target: { value: 'Épée légendaire' } });

    expect(submitButton).not.toBeDisabled();
  });

  it('should create custom item and call onAddCustomItem', async () => {
    render(
      <AddCustomItemModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onAddCustomItem={mockOnAddCustomItem}
      />
    );

    const nameInput = screen.getByLabelText(/nom de l'item/i);
    const effectInput = screen.getByLabelText(/description \/ effet/i);
    const submitButton = screen.getByRole('button', { name: /créer l'item/i });

    await fireEvent.change(nameInput, { target: { value: 'Potion de soin' } });
    await fireEvent.change(effectInput, { target: { value: 'Restaure 5 points de vie' } });

    await fireEvent.click(submitButton);

    expect(mockOnAddCustomItem).toHaveBeenCalledTimes(1);
    expect(mockOnAddCustomItem).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Potion de soin',
        type: ItemType.BASIC,
        effect: 'Restaure 5 points de vie',
      }),
      1
    );
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should show disappearsOnTimeLoop checkbox for BASIC type (default)', () => {
    render(
      <AddCustomItemModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onAddCustomItem={mockOnAddCustomItem}
      />
    );

    expect(screen.getByLabelText(/disparaît lors des resets temporels/i)).toBeInTheDocument();
  });

  it('should reset form when modal closes', async () => {
    render(
      <AddCustomItemModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onAddCustomItem={mockOnAddCustomItem}
      />
    );

    const nameInput = screen.getByLabelText(/nom de l'item/i);
    await fireEvent.change(nameInput, { target: { value: 'Potion de guérison' } });

    const cancelButton = screen.getByRole('button', { name: /annuler/i });
    await fireEvent.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should generate unique ID for custom items', async () => {
    render(
      <AddCustomItemModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onAddCustomItem={mockOnAddCustomItem}
      />
    );

    const nameInput = screen.getByLabelText(/nom de l'item/i);
    await fireEvent.change(nameInput, { target: { value: 'Potion' } });

    const submitButton = screen.getByRole('button', { name: /créer l'item/i });
    await fireEvent.click(submitButton);

    expect(mockOnAddCustomItem).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.stringMatching(/^custom-\d+-[a-z0-9]+$/),
      }),
      1
    );
  });

  it('should close dialog without calling onAddCustomItem when cancelled', async () => {
    render(
      <AddCustomItemModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onAddCustomItem={mockOnAddCustomItem}
      />
    );

    const nameInput = screen.getByLabelText(/nom de l'item/i);
    await fireEvent.change(nameInput, { target: { value: 'Test Item' } });

    const cancelButton = screen.getByRole('button', { name: /annuler/i });
    await fireEvent.click(cancelButton);

    expect(mockOnAddCustomItem).not.toHaveBeenCalled();
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should not submit when name is empty', async () => {
    render(
      <AddCustomItemModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onAddCustomItem={mockOnAddCustomItem}
      />
    );

    const submitButton = screen.getByRole('button', { name: /créer l'item/i });
    await fireEvent.click(submitButton);

    expect(mockOnAddCustomItem).not.toHaveBeenCalled();
  });

  it('should trim whitespace from name', async () => {
    render(
      <AddCustomItemModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onAddCustomItem={mockOnAddCustomItem}
      />
    );

    const nameInput = screen.getByLabelText(/nom de l'item/i);
    await fireEvent.change(nameInput, { target: { value: '  Potion  ' } });

    const submitButton = screen.getByRole('button', { name: /créer l'item/i });
    await fireEvent.click(submitButton);

    expect(mockOnAddCustomItem).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Potion',
      }),
      1
    );
  });
});
