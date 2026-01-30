import type { Meta, StoryObj } from '@storybook/nextjs';
import { ActionPanel } from './ActionPanel';

// Temporarily disabled pending mockCombatData fix (issue #116)
// TODO: Re-enable after mockCombatData is updated to new CombatState interface

const meta = {
  title: 'Combat/ActionPanel',
  component: ActionPanel,
  tags: ['autodocs'],
  args: {
    characterId: 'test-character',
  },
} satisfies Meta<typeof ActionPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Disabled: Story = {
  args: {
    characterId: 'disabled-character',
  },
};
