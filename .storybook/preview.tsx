import type { Preview, Decorator } from '@storybook/nextjs';
import React from 'react';
import { CharacterStoreProvider } from '@/src/presentation/providers/character-store-provider';
import '@/app/globals.css';

/**
 * Décorateur global pour le CharacterStore
 * Permet à toutes les stories d'accéder au store Zustand
 */
const withCharacterStore: Decorator = (Story) => {
  return (
    <CharacterStoreProvider>
      <Story />
    </CharacterStoreProvider>
  );
};

const preview: Preview = {
  decorators: [withCharacterStore],

  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      options: {
        dark: {
          name: 'dark',
          value: '#0a0a0a',
        },

        light: {
          name: 'light',
          value: '#ffffff',
        }
      }
    },
    actions: { argTypesRegex: '^on[A-Z].*' },
  },

  initialGlobals: {
    backgrounds: {
      value: 'dark'
    }
  }
};

export default preview;
