import type { Meta, StoryObj } from '@storybook/nextjs';
import { CombatArena } from './CombatArena';

// Temporarily disabled pending mockCombatData fix (issue #116)
// TODO: Re-enable after mockCombatData is updated to new CombatState interface

const meta = {
  title: 'Combat/CombatArena',
  component: CombatArena,
  tags: ['autodocs'],
} satisfies Meta<typeof CombatArena>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Disabled: Story = {};
