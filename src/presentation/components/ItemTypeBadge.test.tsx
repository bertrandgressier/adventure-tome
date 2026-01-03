import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ItemTypeBadge } from './ItemTypeBadge';
import { ItemType } from '@/src/domain/types/items';

describe('ItemTypeBadge', () => {
  describe('basic type', () => {
    it('should render correct icon and label for BASIC type', () => {
      render(<ItemTypeBadge type={ItemType.BASIC} />);
      expect(screen.getByText('Objet')).toBeInTheDocument();
    });

    it('should render Box icon for BASIC type', () => {
      const { container } = render(<ItemTypeBadge type={ItemType.BASIC} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should have correct color classes for BASIC type', () => {
      const { container } = render(<ItemTypeBadge type={ItemType.BASIC} />);
      const badge = container.querySelector('[class*="text-gray-300"]');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('passive type', () => {
    it('should render correct label for PASSIVE type', () => {
      render(<ItemTypeBadge type={ItemType.PASSIVE} />);
      expect(screen.getByText('Passif')).toBeInTheDocument();
    });
  });

  describe('active type', () => {
    it('should render correct label for ACTIVE type', () => {
      render(<ItemTypeBadge type={ItemType.ACTIVE} />);
      expect(screen.getByText('Actif')).toBeInTheDocument();
    });
  });

  describe('weapon type', () => {
    it('should render correct label for WEAPON type', () => {
      render(<ItemTypeBadge type={ItemType.WEAPON} />);
      expect(screen.getByText('Arme')).toBeInTheDocument();
    });
  });

  describe('special type', () => {
    it('should render correct label for SPECIAL type', () => {
      render(<ItemTypeBadge type={ItemType.SPECIAL} />);
      expect(screen.getByText('Spécial')).toBeInTheDocument();
    });
  });

  describe('label display', () => {
    it('should hide label when showLabel is false', () => {
      render(<ItemTypeBadge type={ItemType.BASIC} showLabel={false} />);
      expect(screen.queryByText('Objet')).not.toBeInTheDocument();
    });

    it('should show label by default', () => {
      render(<ItemTypeBadge type={ItemType.BASIC} />);
      expect(screen.getByText('Objet')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have tooltip for each type', () => {
      const { container } = render(<ItemTypeBadge type={ItemType.BASIC} />);
      const badge = container.querySelector('[title]');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('title', 'Item basique sans effet particulier');
    });
  });
});
