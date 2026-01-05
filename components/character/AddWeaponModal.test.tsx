import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddWeaponModal from '@/components/character/AddWeaponModal';

describe('AddWeaponModal', () => {
  const onAdd = vi.fn();
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dialog with catalog mode by default', () => {
    render(<AddWeaponModal onAdd={onAdd} onClose={onClose} />);

    expect(screen.getByText('⚔️ Nouvelle arme')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Catalogue' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manuel' })).toBeInTheDocument();
  });

  it('should display weapons from catalog', async () => {
    render(<AddWeaponModal onAdd={onAdd} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByText('Arc et carquois')).toBeInTheDocument();
      expect(screen.getByText('Épée courte (+1)')).toBeInTheDocument();
      expect(screen.getByText('Épée courte (+2)')).toBeInTheDocument();
    });
  });

  it('should filter weapons by search term', async () => {
    render(<AddWeaponModal onAdd={onAdd} onClose={onClose} />);

    const searchInput = screen.getByPlaceholderText('Rechercher une arme (ex: épée, arc...)');
    fireEvent.change(searchInput, { target: { value: 'épée' } });

    await waitFor(() => {
      expect(screen.getByText('Épée courte (+1)')).toBeInTheDocument();
      expect(screen.getByText('Épée courte (+2)')).toBeInTheDocument();
      expect(screen.queryByText('Arc et carquois')).not.toBeInTheDocument();
    });
  });

  it('should call onAdd with correct values when adding from catalog', async () => {
    render(<AddWeaponModal onAdd={onAdd} onClose={onClose} />);

    const weapon = screen.getByText('Épée courte (+1)');
    fireEvent.click(weapon);

    await waitFor(() => {
      expect(onAdd).toHaveBeenCalledWith('Épée courte (+1)', 1);
    });
  });

  it('should close dialog and reset search after adding from catalog', async () => {
    render(<AddWeaponModal onAdd={onAdd} onClose={onClose} />);

    const searchInput = screen.getByPlaceholderText('Rechercher une arme (ex: épée, arc...)');
    fireEvent.change(searchInput, { target: { value: 'épée' } });

    const weapon = screen.getByText('Épée courte (+1)');
    fireEvent.click(weapon);

    await waitFor(() => {
      expect(onAdd).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should switch to manual mode', async () => {
    render(<AddWeaponModal onAdd={onAdd} onClose={onClose} />);

    const manualButton = screen.getByRole('button', { name: 'Manuel' });
    fireEvent.click(manualButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Ex: Épée longue, Arc, Dague...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('0')).toBeInTheDocument();
    });
  });

  it('should add weapon manually with correct values', async () => {
    render(<AddWeaponModal onAdd={onAdd} onClose={onClose} />);

    const manualButton = screen.getByRole('button', { name: 'Manuel' });
    fireEvent.click(manualButton);

    const nameInput = screen.getByPlaceholderText('Ex: Épée longue, Arc, Dague...');
    fireEvent.change(nameInput, { target: { value: 'Hache de guerre' } });

    const attackInput = screen.getByPlaceholderText('0');
    fireEvent.change(attackInput, { target: { value: '3' } });

    const addButton = screen.getByRole('button', { name: 'Ajouter' });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(onAdd).toHaveBeenCalledWith('Hache de guerre', 3);
    });
  });

  it('should show alert when adding weapon with empty name in manual mode', async () => {
    const originalAlert = global.alert;
    const alertSpy = vi.fn();
    global.alert = alertSpy;

    render(<AddWeaponModal onAdd={onAdd} onClose={onClose} />);

    const manualButton = screen.getByRole('button', { name: 'Manuel' });
    fireEvent.click(manualButton);

    const addButton = screen.getByRole('button', { name: 'Ajouter' });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Veuillez entrer un nom d\'arme');
      expect(onAdd).not.toHaveBeenCalled();
    });

    global.alert = originalAlert;
  });

  it('should show alert when adding weapon with invalid attack points in manual mode', async () => {
    const originalAlert = global.alert;
    const alertSpy = vi.fn();
    global.alert = alertSpy;

    render(<AddWeaponModal onAdd={onAdd} onClose={onClose} />);

    const manualButton = screen.getByRole('button', { name: 'Manuel' });
    fireEvent.click(manualButton);

    const nameInput = screen.getByPlaceholderText('Ex: Épée longue, Arc, Dague...');
    fireEvent.change(nameInput, { target: { value: 'Épée' } });

    const attackInput = screen.getByPlaceholderText('0');
    fireEvent.change(attackInput, { target: { value: '-5' } });

    const addButton = screen.getByRole('button', { name: 'Ajouter' });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Les points d\'attaque doivent être un nombre positif ou nul');
      expect(onAdd).not.toHaveBeenCalled();
    });

    global.alert = originalAlert;
  });

  it('should show empty message when no weapons match search', async () => {
    render(<AddWeaponModal onAdd={onAdd} onClose={onClose} />);

    const searchInput = screen.getByPlaceholderText('Rechercher une arme (ex: épée, arc...)');
    fireEvent.change(searchInput, { target: { value: 'xyz' } });

    await waitFor(() => {
      expect(screen.getByText('Aucune arme trouvée. Essayez le mode manuel.')).toBeInTheDocument();
    });
  });

  it('should close dialog when clicking close button in manual mode', async () => {
    render(<AddWeaponModal onAdd={onAdd} onClose={onClose} />);

    const manualButton = screen.getByRole('button', { name: 'Manuel' });
    fireEvent.click(manualButton);

    const cancelButton = screen.getByRole('button', { name: 'Annuler' });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should close dialog after adding weapon manually', async () => {
    render(<AddWeaponModal onAdd={onAdd} onClose={onClose} />);

    const manualButton = screen.getByRole('button', { name: 'Manuel' });
    fireEvent.click(manualButton);

    const nameInput = screen.getByPlaceholderText('Ex: Épée longue, Arc, Dague...');
    fireEvent.change(nameInput, { target: { value: 'Épée longue' } });

    const attackInput = screen.getByPlaceholderText('0');
    fireEvent.change(attackInput, { target: { value: '2' } });

    const addButton = screen.getByRole('button', { name: 'Ajouter' });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(onAdd).toHaveBeenCalledWith('Épée longue', 2);
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should display attack points for each weapon from catalog', async () => {
    render(<AddWeaponModal onAdd={onAdd} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByText('+0 dégâts')).toBeInTheDocument();
      expect(screen.getByText('+1 dégâts')).toBeInTheDocument();
      expect(screen.getByText('+2 dégâts')).toBeInTheDocument();
    });
  });
});
