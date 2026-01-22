import type { Meta, StoryObj } from '@storybook/nextjs';
import { CombatDemo } from './CombatDemo';

// Temporarily disabled pending mockCombatData fix (issue #116)
// TODO: Re-enable after mockCombatData is updated to new CombatState interface

const meta = {
  title: 'Combat/CombatDemo',
  component: CombatDemo,
  tags: ['autodocs'],
} satisfies Meta<typeof CombatDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Disabled: Story = {};
