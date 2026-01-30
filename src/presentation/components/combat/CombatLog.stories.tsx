import type { Meta, StoryObj } from '@storybook/nextjs';
import { CombatLog } from './CombatLog';

// Temporarily disabled pending refactor (issue #116)
// TODO: Update to use correct CombatEventType values

const meta = {
  title: 'Combat/CombatLog',
  component: CombatLog,
  tags: ['autodocs'],
  args: {
    history: [],
  },
} satisfies Meta<typeof CombatLog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Disabled: Story = {
  args: {
    history: [],
  },
};
