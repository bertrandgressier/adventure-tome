import type { Meta, StoryObj } from '@storybook/nextjs';
import CombatSetupV3 from './CombatSetupV3';

const meta: Meta<typeof CombatSetupV3> = {
  title: 'Combat/CombatSetupV3',
  component: CombatSetupV3,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onStartCombat: { action: 'onStartCombat' },
    onCancel: { action: 'onCancel' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Configuration simplifiée du combat V3 - Un seul ennemi sans arme, conformément aux règles officielles.',
      },
    },
  },
};

export const GobelinExample: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Exemple avec un Gobelin : DEX 6, END 8. L\'ennemi n\'a pas d\'arme ni de bonus de dégâts.',
      },
    },
  },
};
