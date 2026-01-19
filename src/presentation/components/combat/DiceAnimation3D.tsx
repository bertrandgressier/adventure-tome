'use client';

import { useEffect, useRef, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface DiceAnimation3DProps {
  result: [number, number];
  isRolling: boolean;
  onComplete?: () => void;
}

interface Die3DProps {
  value: number | null;
  isRolling: boolean;
  prefersReducedMotion: boolean;
  delay?: number;
}

/**
 * Get the 3D rotation for a specific dice face value (1-6)
 * Using rotateX, rotateY, rotateZ to position the correct face
 */
function getFaceRotation(value: number): { rotateX: number; rotateY: number; rotateZ: number } {
  switch (value) {
    case 1:
      return { rotateX: 0, rotateY: 0, rotateZ: 0 }; // Front face
    case 2:
      return { rotateX: 0, rotateY: 180, rotateZ: 0 }; // Back face
    case 3:
      return { rotateX: 0, rotateY: -90, rotateZ: 0 }; // Right face
    case 4:
      return { rotateX: 0, rotateY: 90, rotateZ: 0 }; // Left face
    case 5:
      return { rotateX: -90, rotateY: 0, rotateZ: 0 }; // Top face
    case 6:
      return { rotateX: 90, rotateY: 0, rotateZ: 0 }; // Bottom face
    default:
      return { rotateX: 0, rotateY: 0, rotateZ: 0 };
  }
}

/**
 * 3D Die Component - Renders a cube with 6 faces using CSS 3D transforms
 */
function Die3D({ value, isRolling, prefersReducedMotion, delay = 0 }: Die3DProps) {
  // Derive rotation directly from props instead of using state
  const currentRotation = useMemo(() => {
    if (isRolling || value === null) {
      return { rotateX: 0, rotateY: 0, rotateZ: 0 };
    }
    return getFaceRotation(value);
  }, [isRolling, value]);

  const rollingAnimation = useMemo(() => {
    if (prefersReducedMotion) {
      return {
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        scale: 1,
      };
    }

    return {
      rotateX: [0, 360, 720, 1080, 1440],
      rotateY: [0, 270, 540, 810, 1080],
      rotateZ: [0, 180, 360, 540, 720],
      scale: [1, 1.15, 1.05, 1.1, 1],
      transition: {
        duration: 1.2,
        ease: 'easeOut',
        delay,
      },
    };
  }, [prefersReducedMotion, delay]);

  const resultAnimation = useMemo(() => {
    if (prefersReducedMotion) {
      return {
        ...currentRotation,
        scale: 1,
        transition: { duration: 0 },
      };
    }

    return {
      ...currentRotation,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 150,
        damping: 15,
        delay,
      },
    };
  }, [currentRotation, prefersReducedMotion, delay]);

  return (
    <div className="perspective-container w-20 h-20 sm:w-24 sm:h-24">
      <motion.div
        className="dice-3d"
        animate={isRolling ? rollingAnimation : resultAnimation}
        style={{
          transformStyle: 'preserve-3d',
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        {/* Front face - 1 */}
        <div
          className={cn(
            'dice-face dice-face-front',
            value === 1 && !isRolling && 'dice-face-active'
          )}
          data-face="1"
        >
          <DiceDots value={1} />
        </div>

        {/* Back face - 2 */}
        <div
          className={cn(
            'dice-face dice-face-back',
            value === 2 && !isRolling && 'dice-face-active'
          )}
          data-face="2"
        >
          <DiceDots value={2} />
        </div>

        {/* Right face - 3 */}
        <div
          className={cn(
            'dice-face dice-face-right',
            value === 3 && !isRolling && 'dice-face-active'
          )}
          data-face="3"
        >
          <DiceDots value={3} />
        </div>

        {/* Left face - 4 */}
        <div
          className={cn(
            'dice-face dice-face-left',
            value === 4 && !isRolling && 'dice-face-active'
          )}
          data-face="4"
        >
          <DiceDots value={4} />
        </div>

        {/* Top face - 5 */}
        <div
          className={cn(
            'dice-face dice-face-top',
            value === 5 && !isRolling && 'dice-face-active'
          )}
          data-face="5"
        >
          <DiceDots value={5} />
        </div>

        {/* Bottom face - 6 */}
        <div
          className={cn(
            'dice-face dice-face-bottom',
            value === 6 && !isRolling && 'dice-face-active'
          )}
          data-face="6"
        >
          <DiceDots value={6} />
        </div>
      </motion.div>

      <style jsx>{`
        .perspective-container {
          perspective: 1000px;
        }

        .dice-3d {
          transform-style: preserve-3d;
        }

        .dice-face {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card) / 0.8) 100%);
          border: 2px solid hsl(var(--border));
          border-radius: 12px;
          backface-visibility: hidden;
          box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3);
        }

        .dice-face-active {
          border-color: hsl(var(--primary) / 0.8);
          background: linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--primary) / 0.1) 100%);
        }

        .dice-face-front {
          transform: translateZ(40px);
        }

        .dice-face-back {
          transform: rotateY(180deg) translateZ(40px);
        }

        .dice-face-right {
          transform: rotateY(90deg) translateZ(40px);
        }

        .dice-face-left {
          transform: rotateY(-90deg) translateZ(40px);
        }

        .dice-face-top {
          transform: rotateX(90deg) translateZ(40px);
        }

        .dice-face-bottom {
          transform: rotateX(-90deg) translateZ(40px);
        }

        @media (max-width: 640px) {
          .dice-face-front {
            transform: translateZ(32px);
          }

          .dice-face-back {
            transform: rotateY(180deg) translateZ(32px);
          }

          .dice-face-right {
            transform: rotateY(90deg) translateZ(32px);
          }

          .dice-face-left {
            transform: rotateY(-90deg) translateZ(32px);
          }

          .dice-face-top {
            transform: rotateX(90deg) translateZ(32px);
          }

          .dice-face-bottom {
            transform: rotateX(-90deg) translateZ(32px);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Render dice dots for a specific value
 */
function DiceDots({ value }: { value: number }) {
  const dotPatterns = {
    1: [{ row: 2, col: 2 }],
    2: [
      { row: 1, col: 1 },
      { row: 3, col: 3 },
    ],
    3: [
      { row: 1, col: 1 },
      { row: 2, col: 2 },
      { row: 3, col: 3 },
    ],
    4: [
      { row: 1, col: 1 },
      { row: 1, col: 3 },
      { row: 3, col: 1 },
      { row: 3, col: 3 },
    ],
    5: [
      { row: 1, col: 1 },
      { row: 1, col: 3 },
      { row: 2, col: 2 },
      { row: 3, col: 1 },
      { row: 3, col: 3 },
    ],
    6: [
      { row: 1, col: 1 },
      { row: 1, col: 3 },
      { row: 2, col: 1 },
      { row: 2, col: 3 },
      { row: 3, col: 1 },
      { row: 3, col: 3 },
    ],
  };

  const dots = dotPatterns[value as keyof typeof dotPatterns] || [];

  return (
    <div className="dice-dots-grid">
      {dots.map((dot, index) => (
        <div
          key={index}
          className="dice-dot"
          style={{
            gridRow: dot.row,
            gridColumn: dot.col,
          }}
        />
      ))}

      <style jsx>{`
        .dice-dots-grid {
          display: grid;
          grid-template-rows: repeat(3, 1fr);
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          padding: 10px;
          width: 100%;
          height: 100%;
        }

        .dice-dot {
          width: 10px;
          height: 10px;
          background-color: hsl(var(--primary));
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        @media (max-width: 640px) {
          .dice-dots-grid {
            gap: 6px;
            padding: 8px;
          }

          .dice-dot {
            width: 8px;
            height: 8px;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * DiceAnimation3D - Main component with 3D cube dice animation
 */
export function DiceAnimation3D({ result, isRolling, onComplete }: DiceAnimation3DProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const previousIsRolling = useRef(isRolling);

  useEffect(() => {
    // Detect rolling → result transition
    if (previousIsRolling.current && !isRolling && onComplete) {
      const delay = prefersReducedMotion ? 100 : 1500;
      const timer = setTimeout(() => {
        onComplete();
      }, delay);

      return () => clearTimeout(timer);
    }

    previousIsRolling.current = isRolling;
  }, [isRolling, onComplete, prefersReducedMotion]);

  return (
    <div
      className="flex items-center justify-center gap-6 p-6"
      data-testid="dice-animation-3d"
      role="region"
      aria-label="Animation de lancer de dés 3D"
    >
      <Die3D
        value={isRolling ? null : result[0]}
        isRolling={isRolling}
        prefersReducedMotion={prefersReducedMotion}
        delay={0}
      />
      <Die3D
        value={isRolling ? null : result[1]}
        isRolling={isRolling}
        prefersReducedMotion={prefersReducedMotion}
        delay={0.1}
      />
    </div>
  );
}
