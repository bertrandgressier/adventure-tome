import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CombatSetupV3 from './CombatSetupV3';

describe('CombatSetupV3 - Issue 80', () => {
  const mockOnStartCombat = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait afficher le formulaire simplifié pour un seul ennemi', () => {
    render(
      <CombatSetupV3
        characterId="char-123"
        onStartCombat={mockOnStartCombat}
        onCancel={mockOnCancel}
      />
    );

    // Vérifier les champs présents
    expect(screen.getByLabelText(/Nom de l'ennemi/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/DEXTÉRITÉ/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ENDURANCE/i)).toBeInTheDocument();
    
    // Vérifier l'option "qui commence"
    expect(screen.getByText(/🛡️ Vous/i)).toBeInTheDocument();
    expect(screen.getByText(/⚔️ Ennemi/i)).toBeInTheDocument();
    
    // Vérifier les boutons
    expect(screen.getByText(/Annuler/i)).toBeInTheDocument();
    expect(screen.getByText(/Commencer/i)).toBeInTheDocument();
  });

  it('ne devrait pas avoir de champ pour les points d\'attaque de l\'ennemi', () => {
    render(
      <CombatSetupV3
        characterId="char-123"
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
      <CombatSetupV3
        characterId="char-123"
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
      <CombatSetupV3
        characterId="char-123"
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
      <CombatSetupV3
        characterId="char-123"
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
    fireEvent.click(screen.getByText(/⚔️ Ennemi/i));

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
      <CombatSetupV3
        characterId="char-123"
        onStartCombat={mockOnStartCombat}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText(/Annuler/i));

    expect(mockOnCancel).toHaveBeenCalled();
    expect(mockOnStartCombat).not.toHaveBeenCalled();
  });

  it('devrait créer un EnemyConfig sans weapon ni chance', async () => {
    render(
      <CombatSetupV3
        characterId="char-123"
        onStartCombat={mockOnStartCombat}
        onCancel={mockOnCancel}
      />
    );

    // Remplir avec un gobelin
    fireEvent.change(screen.getByLabelText(/Nom de l'ennemi/i), {
      target: { value: 'Gobelin' },
    });
    fireEvent.change(screen.getByLabelText(/DEXTÉRITÉ/i), {
      target: { value: '6' },
    });
    fireEvent.change(screen.getByLabelText(/ENDURANCE/i), {
      target: { value: '8' },
    });

    fireEvent.click(screen.getByText(/Commencer/i));

    await waitFor(() => {
      const enemyConfig = mockOnStartCombat.mock.calls[0][0];
      
      // Vérifier la structure EnemyConfig
      expect(enemyConfig).toHaveProperty('name', 'Gobelin');
      expect(enemyConfig).toHaveProperty('dexterite', 6);
      expect(enemyConfig).toHaveProperty('endurance', 8);
      expect(enemyConfig).toHaveProperty('enduranceMax', 8);
      
      // Vérifier qu'il n'y a pas de weapon ou chance
      expect(enemyConfig).not.toHaveProperty('weapon');
      expect(enemyConfig).not.toHaveProperty('chance');
    });
  });
});
