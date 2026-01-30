import type { Meta, StoryObj } from '@storybook/nextjs';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

/**
 * DamageIndicator Component
 *
 * Affiche une animation de dégâts avec flash rouge et texte flottant.
 * Utilisé dans CombatArena pour montrer les dégâts subis.
 */

interface DamageIndicatorProps {
  damage: number;
  playerHealth: number;
  playerMaxHealth: number;
  onComplete?: () => void;
}

function DamageIndicatorStory({ damage, playerHealth, onComplete }: DamageIndicatorProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const isLethal = playerHealth - damage <= 0;
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, prefersReducedMotion ? 500 : 1500);
    return () => clearTimeout(timer);
  }, [prefersReducedMotion, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed inset-0 z-40 pointer-events-none flex items-center justify-center ${
            isLethal ? 'bg-red-900/30' : 'bg-red-500/20'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="text-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0, y: -50 }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.3 }}
          >
            <div className="text-6xl font-cinzel font-bold text-red-500 mb-2">
              -{damage}
            </div>
            <div className="text-lg text-white/80 font-cinzel">
              {isLethal ? 'COUP FATAL !' : 'DÉGÂTS !'}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StoryContainer({ children, title, description }: { children: React.ReactNode; title: string; description: string }) {
  const [key, setKey] = useState(0);
  return (
    <div className="relative w-full h-screen bg-gray-900 flex flex-col items-center justify-center gap-4">
      <div className="text-white text-center">
        <h3 className="font-cinzel text-xl mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
      <Button onClick={() => setKey(k => k + 1)} variant="outline">
        Rejouer l&apos;animation
      </Button>
      <div key={key}>{children}</div>
    </div>
  );
}

const meta: Meta<typeof DamageIndicatorStory> = {
  title: 'Combat/Animations/DamageIndicator',
  component: DamageIndicatorStory,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Animation de dégâts avec flash rouge et texte flottant. Respecte prefers-reduced-motion.',
      },
    },
  },
  argTypes: {
    damage: {
      control: { type: 'number', min: 1, max: 20 },
      description: 'Montant des dégâts affichés',
    },
    playerHealth: {
      control: { type: 'number', min: 0, max: 30 },
      description: 'Points de vie actuels du joueur',
    },
    playerMaxHealth: {
      control: { type: 'number', min: 1, max: 30 },
      description: 'Points de vie maximum du joueur',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DamageIndicatorStory>;

/**
 * Dégâts normaux - Le joueur survit
 */
export const NormalDamage: Story = {
  args: {
    damage: 5,
    playerHealth: 15,
    playerMaxHealth: 20,
  },
  render: (args: DamageIndicatorProps) => (
    <StoryContainer title="Dégâts Normaux" description="Flash rouge standard">
      <DamageIndicatorStory {...args} />
    </StoryContainer>
  ),
};

/**
 * Coup fatal - Le joueur meurt
 */
export const LethalDamage: Story = {
  args: {
    damage: 10,
    playerHealth: 8,
    playerMaxHealth: 20,
  },
  render: (args: DamageIndicatorProps) => (
    <StoryContainer title="Coup Fatal" description="Flash rouge foncé + message spécial">
      <DamageIndicatorStory {...args} />
    </StoryContainer>
  ),
};

/**
 * Dégâts faibles
 */
export const LowDamage: Story = {
  args: {
    damage: 2,
    playerHealth: 18,
    playerMaxHealth: 20,
  },
  render: (args: DamageIndicatorProps) => (
    <StoryContainer title="Dégâts Faibles" description="Petits dégâts (1-3)">
      <DamageIndicatorStory {...args} />
    </StoryContainer>
  ),
};

/**
 * Dégâts élevés
 */
export const HighDamage: Story = {
  args: {
    damage: 12,
    playerHealth: 15,
    playerMaxHealth: 20,
  },
  render: (args: DamageIndicatorProps) => (
    <StoryContainer title="Dégâts Élevés" description="Gros dégâts sans être fatal">
      <DamageIndicatorStory {...args} />
    </StoryContainer>
  ),
};
