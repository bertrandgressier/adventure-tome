'use client';

import { Badge } from '@/components/ui/badge';
import { Box, Shield, FlaskConical, Sword, Sparkles } from 'lucide-react';
import { ItemType } from '@/src/domain/types/items';

interface ItemTypeBadgeProps {
  type: ItemType;
  showLabel?: boolean;
}

const TYPE_CONFIG: Record<ItemType, {
  icon: typeof Box;
  color: string;
  label: string;
  tooltip: string;
}> = {
  [ItemType.BASIC]: {
    icon: Box,
    color: 'text-gray-300 bg-gray-800/50 border-gray-700',
    label: 'Objet',
    tooltip: 'Item basique sans effet particulier'
  },
  [ItemType.PASSIVE]: {
    icon: Shield,
    color: 'text-purple-300 bg-purple-900/50 border-purple-700',
    label: 'Passif',
    tooltip: 'Item passif : bonus tant qu\'il est possédé'
  },
  [ItemType.ACTIVE]: {
    icon: FlaskConical,
    color: 'text-green-300 bg-green-900/50 border-green-700',
    label: 'Actif',
    tooltip: 'Item actif : consommable (potion, nourriture)'
  },
  [ItemType.WEAPON]: {
    icon: Sword,
    color: 'text-red-300 bg-red-900/50 border-red-700',
    label: 'Arme',
    tooltip: 'Arme : bonus de dégâts en combat'
  },
  [ItemType.SPECIAL]: {
    icon: Sparkles,
    color: 'text-yellow-300 bg-yellow-900/50 border-yellow-700',
    label: 'Spécial',
    tooltip: 'Item spécial : effets magiques ou uniques'
  }
};

export function ItemTypeBadge({ type, showLabel = true }: ItemTypeBadgeProps) {
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`flex items-center gap-1 ${config.color}`}
      title={config.tooltip}
    >
      <Icon className="w-3 h-3" />
      {showLabel && <span className="text-xs">{config.label}</span>}
    </Badge>
  );
}
