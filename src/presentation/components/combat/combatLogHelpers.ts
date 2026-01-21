import type { CombatEvent } from '@/src/domain/types/combat-state';
import { CombatEventType } from '@/src/domain/types/CombatEventType';

/**
 * Configuration pour le formatage des événements de combat
 * Centralise les couleurs
 */
interface EventStyleConfig {
  iconColor: string;
  textColor: string;
}

const EVENT_STYLE_MAP: Record<string, EventStyleConfig> = {
  [CombatEventType.DAMAGE_DEALT]: {
    iconColor: 'text-destructive',
    textColor: 'text-destructive/90',
  },
  [CombatEventType.HEAL]: {
    iconColor: 'text-green-500',
    textColor: 'text-green-400/90',
  },
  [CombatEventType.WEAPON_ABILITY]: {
    iconColor: 'text-magic-purple',
    textColor: 'text-magic-purple/90',
  },
  [CombatEventType.ABILITY_USED]: {
    iconColor: 'text-magic-purple',
    textColor: 'text-magic-purple/90',
  },
  [CombatEventType.LUCK_TEST]: {
    iconColor: 'text-secondary',
    textColor: 'text-secondary/90',
  },
  [CombatEventType.CHANCE_SPENT]: {
    iconColor: 'text-secondary',
    textColor: 'text-secondary/90',
  },
};

const DEFAULT_STYLE: EventStyleConfig = {
  iconColor: 'text-primary',
  textColor: 'text-foreground/90',
};

/**
 * Retourne la classe de couleur pour l'icône
 */
export function getIconColorClass(type: string): string {
  return EVENT_STYLE_MAP[type]?.iconColor ?? DEFAULT_STYLE.iconColor;
}

/**
 * Retourne la classe de couleur pour le texte
 */
export function getEventColorClass(type: string): string {
  return EVENT_STYLE_MAP[type]?.textColor ?? DEFAULT_STYLE.textColor;
}

/**
 * Formate la description d'un événement de combat
 * RÈGLE: Cette fonction ne contient QUE du formatage de texte pour l'affichage
 * Toute logique métier (calculs, conditions complexes) doit être dans le domaine
 */
export function formatEventDescription(event: CombatEvent): string {
  const actor = event.attacker === 'player' ? 'Vous' : "L'ennemi";
  const verb = event.attacker === 'player' ? 'z' : '';

  switch (event.type) {
    case CombatEventType.COMBAT_START:
      return '⚔️ Combat commencé';

    case CombatEventType.COMBAT_END:
      return event.result === 'victory' ? '🏆 VICTOIRE !' : '💀 DÉFAITE...';

    case CombatEventType.ROUND_START:
      return `📢 Début du round ${event.round}`;

    case CombatEventType.ROUND_END:
      return `🏁 Fin du round ${event.round}`;

    case CombatEventType.ATTACK_ROLL: {
      if (!event.roll) return `${actor} attaque${verb}`;
      // ✅ Utilisation des données calculées par le domaine (event.roll.total)
      const result = event.hit !== undefined ? (event.hit ? '→ Touché !' : '→ Raté !') : '';
      return `⚔️ ${actor} attaque${verb} : [${event.roll.dice1}+${event.roll.dice2}] = ${event.roll.total}${result}`;
    }

    case CombatEventType.DAMAGE_DEALT: {
      if (event.damage === undefined) return `${actor} inflige${verb} des dégâts`;
      const damageTarget = event.attacker === 'player' ? "l'ennemi" : 'vous';
      return `💥 ${actor} inflige${verb} ${event.damage} dégâts à ${damageTarget}`;
    }

    case CombatEventType.HEAL:
      if (event.healAmount === undefined) return '💚 Soin effectué';
      return `💚 Vous récupérez ${event.healAmount} points de vie`;

    case CombatEventType.ABILITY_USED:
      if (event.abilityId) return `✨ Capacité utilisée : ${event.abilityId}`;
      return '✨ Capacité utilisée';

    case CombatEventType.WEAPON_ABILITY:
      if (event.abilityId) return `⚔️ ${actor} utilise${verb} ${event.abilityId}`;
      return `⚔️ ${actor} utilise${verb} son arme`;

    case CombatEventType.LUCK_TEST:
      return `🎲 Test de chance`;

    case CombatEventType.CHANCE_SPENT:
      if (event.pointsSpent) return `⚡ ${event.pointsSpent} point(s) de chance dépensé(s)`;
      return '⚡ Chance dépensée';

    case CombatEventType.ITEM_USED:
      if (event.abilityId) return `🎒 Item utilisé : ${event.abilityId}`;
      return '🎒 Item utilisé';

    default:
      return `Événement : ${event.type}`;
  }
}
