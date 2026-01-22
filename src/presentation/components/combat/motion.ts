/**
 * Motion Variants for Combat Animations
 *
 * Shared animation variants using Framer Motion.
 * All animations respect prefers-reduced-motion.
 */

import type { Variants } from 'framer-motion';

/**
 * Combat Arena transition variants
 */
export const combatArenaVariants: Variants = {
  enter: (prefersReducedMotion: boolean) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: prefersReducedMotion ? 0 : 0.3, ease: 'easeOut' },
  }),
  exit: (prefersReducedMotion: boolean) => ({
    opacity: 0,
    scale: 1.05,
    transition: { duration: prefersReducedMotion ? 0 : 0.2, ease: 'easeOut' },
  }),
};

/**
 * Dice roll animation variants
 */
export const diceRollVariants: Variants = {
  idle: { rotateX: 0, rotateY: 0, scale: 1, opacity: 1 },
  rolling: (prefersReducedMotion: boolean) => ({
    rotateX: prefersReducedMotion ? 0 : [0, 360, 720, 1080],
    rotateY: prefersReducedMotion ? 0 : [0, 180, 360, 540],
    scale: [0.5, 1.2, 0.9, 1.1, 1],
    opacity: [0, 1, 1, 1, 1],
    transition: {
      duration: prefersReducedMotion ? 0 : 0.8,
      ease: 'easeOut',
    },
  }),
  result: {
    rotateX: 720,
    rotateY: 720,
    scale: 1,
    opacity: 1,
    transition: { duration: 0.1 },
  },
};

export const diceBounceVariants: Variants = {
  idle: { y: 0, scale: 1 },
  bouncing: (prefersReducedMotion: boolean) => ({
    y: prefersReducedMotion ? 0 : [-15, 0, -10, 0],
    scale: prefersReducedMotion ? 1 : [1.05, 1, 1.03, 1],
    transition: {
      duration: prefersReducedMotion ? 0 : 0.6,
      ease: 'easeInOut',
    },
  }),
};

/**
 * Damage indicator variants
 */
export const damageIndicatorVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.1 },
  },
  floating: (prefersReducedMotion: boolean) => ({
    opacity: 0,
    y: prefersReducedMotion ? 0 : -50,
    scale: 1.2,
    transition: {
      duration: prefersReducedMotion ? 0 : 1.2,
      ease: 'easeOut',
    },
  }),
};

/**
 * Damage indicator variants
 */
export const hpBarVariants: Variants = {
  initial: {},
  animate: (prefersReducedMotion: boolean) => ({
    transition: {
      type: prefersReducedMotion ? 'tween' : 'spring',
      stiffness: prefersReducedMotion ? 0 : 100,
      damping: prefersReducedMotion ? 0 : 15,
      duration: prefersReducedMotion ? 0 : 0.5,
    },
  }),
};

/**
 * Victory/Defeat screen variants
 */
export const victoryScreenVariants: Variants = {
  hidden: { scale: 0, rotate: -180, opacity: 0 },
  visible: (prefersReducedMotion: boolean) => ({
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      bounce: prefersReducedMotion ? 0 : 0.5,
      duration: prefersReducedMotion ? 0 : 0.8,
    },
  }),
};

export const defeatScreenVariants: Variants = {
  hidden: { scale: 1.5, opacity: 0 },
  visible: (prefersReducedMotion: boolean) => ({
    scale: 1,
    opacity: 1,
    transition: {
      duration: prefersReducedMotion ? 0 : 0.6,
      ease: 'easeOut',
    },
  }),
};

/**
 * Combatant card variants
 */
export const combatantCardVariants: Variants = {
  idle: {
    scale: 1,
    borderColor: 'hsl(var(--border) / 0.5)',
  },
  active: (prefersReducedMotion: boolean) => ({
    scale: prefersReducedMotion ? 1 : 1.03,
    borderColor: 'hsl(var(--primary) / 0.7)',
    boxShadow: prefersReducedMotion
      ? 'none'
      : '0 0 20px rgba(234, 179, 8, 0.3), 0 0 10px rgba(234, 179, 8, 0.2)',
    transition: {
      type: 'spring',
      stiffness: prefersReducedMotion ? 0 : 60,
      damping: prefersReducedMotion ? 0 : 12,
      duration: prefersReducedMotion ? 0 : 0.4,
    },
  }),
  damaged: (prefersReducedMotion: boolean) => ({
    x: prefersReducedMotion ? 0 : [-10, 10, -10, 10, 0],
    borderColor: 'hsl(var(--destructive) / 0.5)',
    backgroundColor: 'hsl(0 70% 50% / 0.1)',
    transition: {
      duration: prefersReducedMotion ? 0 : 0.5,
      ease: 'easeOut',
    },
  }),
  healing: (prefersReducedMotion: boolean) => ({
    scale: prefersReducedMotion ? 1 : [1, 1.02, 1],
    borderColor: 'hsl(142.1 50% 40% / 0.5)',
    backgroundColor: 'hsl(142.1 50% 40% / 0.1)',
    transition: {
      duration: prefersReducedMotion ? 0 : 0.6,
      ease: 'easeInOut',
    },
  }),
  dead: {
    opacity: 0.5,
    filter: 'grayscale(100%)',
    borderColor: 'hsl(0 0% 50% / 0.3)',
    transition: { duration: 0.3 },
  },
};

/**
 * Shake animation for damage
 */
export const shakeVariants: Variants = {
  idle: { x: 0 },
  shaking: (prefersReducedMotion: boolean) => ({
    x: prefersReducedMotion ? 0 : [0, -10, 10, -10, 10, 0],
    transition: {
      duration: prefersReducedMotion ? 0 : 0.5,
      ease: 'easeOut',
    },
  }),
};

/**
 * Action panel container variants
 */
export const actionPanelContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (prefersReducedMotion: boolean) => ({
    opacity: 1,
    transition: {
      duration: prefersReducedMotion ? 0 : 0.3,
      staggerChildren: prefersReducedMotion ? 0 : 0.05,
    },
  }),
};

/**
 * Action panel button variants
 */
export const actionPanelVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut' as const,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.15 },
  },
};

/**
 * Action button icon pulse variants (for weapon ability highlight)
 */
export const actionButtonVariants: Variants = {
  idle: { scale: 1, opacity: 1 },
  pulse: (prefersReducedMotion: boolean) => ({
    scale: [1, 1.1, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: prefersReducedMotion ? 0 : 1.5,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  }),
};

/**
 * Item picker variants
 */
export const itemPickerVariants = {
  backdrop: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
  },
  content: {
    hidden: { y: '100%', opacity: 0 },
    visible: (prefersReducedMotion: boolean) => ({
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        damping: prefersReducedMotion ? 0 : 25,
        stiffness: prefersReducedMotion ? 0 : 300,
        duration: prefersReducedMotion ? 0 : 0.4,
      },
    }),
  },
} as const;

/**
 * Item option variants
 */
export const itemOptionVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: index * 0.05,
      duration: 0.2,
      ease: 'easeOut' as const,
    },
  }),
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.15 },
  },
};
