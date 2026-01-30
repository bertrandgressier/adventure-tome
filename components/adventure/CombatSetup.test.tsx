import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CombatSetup from '@/components/adventure/CombatSetup';

describe('CombatSetup - Issue 80', () => {
  const mockOnStartCombat = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait afficher le formulaire simplifié pour un seul ennemi', () => {
    render(
      <CombatSetup
        onStartCombat={mockOnStartCombat}
        onCancel={mockOnCancel}
      />
    );

    // Vérifier les champs présents
    expect(screen.getByLabelText(/Nom de l'ennemi/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/DEXTÉRITÉ/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ENDURANCE/i)).toBeInTheDocument();
    
    // Vérifier l'option "qui commence"
    expect(screen.getByRole('button', { name: /Vous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ennemi/i })).toBeInTheDocument();
    
    // Vérifier les boutons
    expect(screen.getByText(/Annuler/i)).toBeInTheDocument();
    expect(screen.getByText(/Commencer/i)).toBeInTheDocument();
  });

  it('ne devrait pas avoir de champ pour les points d\'attaque de l\'ennemi', () => {
    render(
      <CombatSetup
        onStartCombat={mockOnStartCombat}
        onCancel={mockOnCancel}
      />
    );

    // L'ennemi n'a pas d'arme selon les règles
    expect(screen.queryByLabelText(/Points d'attaque/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Arme/i)).not.toBeInTheDocument();
  });

  it('devrait valider que le nom est requis', async () => {
    render(
      <CombatSetup
        onStartCombat={mockOnStartCombat}
        onCancel={mockOnCancel}
      />
    );

    // Laisser le nom vide et cliquer sur Commencer
    fireEvent.click(screen.getByText(/Commencer/i));

    // Vérifier le message d'erreur
    await waitFor(() => {
      expect(screen.getByText(/Le nom de l'ennemi est requis/i)).toBeInTheDocument();
    });

    // Vérifier que onStartCombat n'a pas été appelé
    expect(mockOnStartCombat).not.toHaveBeenCalled();
  });

  it('devrait démarrer le combat avec les bonnes valeurs', async () => {
    render(
      <CombatSetup
        onStartCombat={mockOnStartCombat}
        onCancel={mockOnCancel}
      />
    );

    // Remplir le formulaire
    fireEvent.change(screen.getByLabelText(/Nom de l'ennemi/i), {
      target: { value: 'Gobelin' },
    });
    fireEvent.change(screen.getByLabelText(/DEXTÉRITÉ/i), {
      target: { value: '8' },
    });
    fireEvent.change(screen.getByLabelText(/ENDURANCE/i), {
      target: { value: '15' },
    });

    // Cliquer sur Commencer
    fireEvent.click(screen.getByText(/Commencer/i));

    // Vérifier que onStartCombat a été appelé avec les bonnes valeurs
    await waitFor(() => {
      expect(mockOnStartCombat).toHaveBeenCalledWith(
        {
          name: 'Gobelin',
          dexterite: 8,
          endurance: 15,
          enduranceMax: 15,
        },
        'player' // Par défaut, le joueur commence
      );
    });
  });

  it('devrait permettre de choisir qui commence', async () => {
    render(
      <CombatSetup
        onStartCombat={mockOnStartCombat}
        onCancel={mockOnCancel}
      />
    );

    // Remplir le formulaire
    fireEvent.change(screen.getByLabelText(/Nom de l'ennemi/i), {
      target: { value: 'Orc' },
    });
    fireEvent.change(screen.getByLabelText(/DEXTÉRITÉ/i), {
      target: { value: '6' },
    });
    fireEvent.change(screen.getByLabelText(/ENDURANCE/i), {
      target: { value: '10' },
    });

    // Choisir que l'ennemi commence
    fireEvent.click(screen.getByRole('button', { name: /Ennemi/i }));

    // Cliquer sur Commencer
    fireEvent.click(screen.getByText(/Commencer/i));

    // Vérifier que l'ennemi commence
    await waitFor(() => {
      expect(mockOnStartCombat).toHaveBeenCalledWith(
        expect.any(Object),
        'enemy'
      );
    });
  });

  it('devrait appeler onCancel quand on clique sur Annuler', () => {
    render(
      <CombatSetup
        onStartCombat={mockOnStartCombat}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText(/Annuler/i));

    expect(mockOnCancel).toHaveBeenCalled();
    expect(mockOnStartCombat).not.toHaveBeenCalled();
  });
});
