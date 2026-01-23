'use client';

import { motion, useReducedMotion } from 'framer-motion';

export interface ItemEffectAnimationProps {
  /** Type d'effet : heal (+PV) ou damage (dégâts à l'ennemi) */
  type: 'heal' | 'damage';
  /** Valeur numérique à afficher */
  amount: number;
  /** Nom de l'item utilisé */
  itemName: string;
}

/**
 * ItemEffectAnimation
 * 
 * Animation visuelle pour les effets d'items en combat :
 * - Heal : Texte vert montant avec particules vertes
 * - Damage : Texte rouge descendant avec particules rouges
 * 
 * Respecte les préférences d'accessibilité (prefers-reduced-motion)
 */
export function ItemEffectAnimation({ type, amount, itemName }: ItemEffectAnimationProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;

  const isHeal = type === 'heal';
  const color = isHeal ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'; // green-500 : red-500
  const bgColor = isHeal ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)';
  const sign = isHeal ? '+' : '-';
  const label = isHeal ? 'SOIN' : 'DÉGÂTS';

  return (
    <motion.div
      className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: prefersReducedMotion ? 0.1 : 0.4 }}
    >
      {/* Background overlay */}
      <motion.div
        className="absolute inset-0"
        style={{ backgroundColor: bgColor }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />

      {/* Particules d'effet */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: color,
                left: '50%',
                top: '50%',
              }}
              initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
              animate={{
                scale: [0, 1, 0],
                x: Math.cos((i * Math.PI) / 4) * 120,
                y: Math.sin((i * Math.PI) / 4) * 120,
                opacity: [1, 0.5, 0],
              }}
              transition={{
                duration: 0.6,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Valeur principale */}
      <div className="relative z-10 text-center">
        <motion.div
          className="text-7xl font-cinzel font-bold mb-2"
          style={{ color }}
          initial={{ scale: 0.5, opacity: 0, y: 0 }}
          animate={{ scale: 1, opacity: 1, y: isHeal ? -20 : 20 }}
          exit={{ scale: 1.2, opacity: 0, y: isHeal ? -60 : 60 }}
          transition={{
            duration: prefersReducedMotion ? 0.2 : 0.5,
            ease: 'easeOut',
          }}
        >
          {sign}{amount}
        </motion.div>

        {/* Label + nom item */}
        <motion.div
          className="text-lg font-semibold"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <div className="mb-1">{label}</div>
          <div className="text-sm opacity-80">{itemName}</div>
        </motion.div>

        {/* Effet de brillance */}
        {!prefersReducedMotion && (
          <motion.div
            className="absolute inset-0 -z-10 blur-2xl rounded-full"
            style={{ backgroundColor: color }}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        )}
      </div>
    </motion.div>
  );
}
