import type { Meta, StoryObj } from '@storybook/nextjs';
import CombatSetup from '@/components/adventure/CombatSetup';

const meta: Meta<typeof CombatSetup> = {
  title: 'Adventure/CombatSetup',
  component: CombatSetup,
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
        story: 'Configuration simplifiée du combat V3 - Un seul ennemi, pas de fuite.',
      },
    },
  },
};

export const WithCallbacks: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Le composant appelle onStartCombat avec l\'ennemi configuré et qui attaque en premier.',
      },
    },
  },
};
