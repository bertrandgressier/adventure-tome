import type { Meta } from '@storybook/react';

/**
 * Documentation des helpers utilitaires pour le Combat V2
 * 
 * Ces fonctions pures sont utilisées pour calculer les états visuels
 * et les métadonnées d'affichage des composants de combat.
 */
const meta = {
  title: 'Combat V2/Helpers',
  parameters: {
    docs: {
      description: {
        component: `
# Combat UI Helpers

Fonctions utilitaires pour l'affichage du combat. Toutes les fonctions sont pures et sans effets de bord.

## getCombatantHealthInfo(endurance, enduranceMax)

Calcule l'état visuel de santé d'un combattant.

**Returns:**
- \`healthPercent\`: Pourcentage de vie (0-100)
- \`status\`: 'normal' | 'critical' (≤25%) | 'dead' (0)
- \`barColorClass\`: Classe CSS pour la barre de vie
- \`textColorClass\`: Classe CSS pour le texte

**Exemples:**
\`\`\`typescript
getCombatantHealthInfo(20, 20) // { healthPercent: 100, status: 'normal', ... }
getCombatantHealthInfo(4, 20)  // { healthPercent: 20, status: 'critical', ... }
getCombatantHealthInfo(0, 20)  // { healthPercent: 0, status: 'dead', ... }
\`\`\`

---

## wouldBeLethal(currentHealth, damage)

Détermine si des dégâts seraient fatals.

**Returns:** \`boolean\`

**Exemples:**
\`\`\`typescript
wouldBeLethal(10, 5)  // false
wouldBeLethal(10, 10) // true
wouldBeLethal(10, 15) // true
\`\`\`

---

## getActionMetadata(actionType)

Récupère les métadonnées d'affichage pour une action de combat.

**Returns:** \`{ label: string, icon: string }\`

**Actions disponibles:**
- \`attack\`: ⚔️ Attaquer
- \`use_item\`: 🎒 Objet
- \`spend_chance\`: 🍀 CHANCE
- \`weapon_ability\`: ✨ Pouvoir
- \`flee\`: 🏃 Fuir
- \`reroll\`: 🎲 Relancer
- \`block\`: 🛡️ Bloquer

**Exemples:**
\`\`\`typescript
getActionMetadata('attack')      // { label: 'Attaquer', icon: '⚔️' }
getActionMetadata('flee')        // { label: 'Fuir', icon: '🏃' }
getActionMetadata('unknown')     // { label: 'unknown', icon: '?' }
\`\`\`

---

## isEnemy(combatant)

Type guard pour distinguer joueur et ennemi.

**Returns:** \`boolean\`

**Exemples:**
\`\`\`typescript
isEnemy(combat.player)      // false
isEnemy(combat.enemies[0])  // true
\`\`\`
        `,
      },
    },
  },
} satisfies Meta;

export default meta;

// Pas de stories visuelles, seulement documentation
export const Documentation = {};
