# Thème - Adventure Hero

## Design System

Application du thème **heroic fantasy / magie** avec shadcn/ui et Tailwind CSS.

## Palette de couleurs

### Thème sombre (par défaut - mobile)

```css
:root {
  /* Couleurs de base - Fantasy */
  --background: 222.2 84% 4.9%;           /* Noir profond */
  --foreground: 210 40% 98%;              /* Blanc cassé */

  /* Cartes et éléments */
  --card: 222.2 84% 4.9%;                 /* Noir profond */
  --card-foreground: 210 40% 98%;         /* Blanc cassé */

  /* Popover */
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;

  /* Primaire - Or mystique */
  --primary: 45 100% 50%;                 /* Or brillant */
  --primary-foreground: 222.2 47.4% 11.2%; /* Texte sur or */

  /* Secondaire - Violet magique */
  --secondary: 270 60% 50%;               /* Violet royal */
  --secondary-foreground: 210 40% 98%;

  /* Accent - Bleu arcane */
  --accent: 217.2 91.2% 59.8%;            /* Bleu magique */
  --accent-foreground: 222.2 47.4% 11.2%;

  /* Destructif - Rouge feu */
  --destructive: 0 84.2% 60.2%;           /* Rouge dragon */
  --destructive-foreground: 210 40% 98%;

  /* Bordures */
  --border: 217.2 32.6% 17.5%;            /* Gris-bleu sombre */
  --input: 217.2 32.6% 17.5%;

  /* Anneaux de focus */
  --ring: 45 100% 50%;                    /* Or pour focus */

  /* Rayon de bordure */
  --radius: 0.5rem;

  /* Chart colors */
  --chart-1: 45 100% 50%;                 /* Or */
  --chart-2: 270 60% 50%;                 /* Violet */
  --chart-3: 217.2 91.2% 59.8%;           /* Bleu */
  --chart-4: 0 84.2% 60.2%;               /* Rouge */
  --chart-5: 142.1 76.2% 36.3%;           /* Vert */
}
```

### Variables supplémentaires - Fantasy

```css
:root {
  /* Couleurs thématiques supplémentaires */
  --fantasy-gold: 45 100% 50%;
  --fantasy-silver: 0 0% 75%;
  --fantasy-bronze: 30 70% 40%;
  
  --magic-purple: 270 60% 50%;
  --magic-blue: 217.2 91.2% 59.8%;
  --magic-green: 142.1 76.2% 36.3%;
  
  --element-fire: 0 84.2% 60.2%;
  --element-water: 200 80% 50%;
  --element-earth: 30 40% 40%;
  --element-air: 190 70% 80%;
  
  /* Gradients */
  --gradient-magic: linear-gradient(135deg, 
    hsl(var(--magic-purple)), 
    hsl(var(--magic-blue))
  );
  
  --gradient-fire: linear-gradient(135deg,
    hsl(var(--element-fire)),
    hsl(30, 100%, 50%)
  );
  
  --gradient-gold: linear-gradient(135deg,
    hsl(35, 100%, 45%),
    hsl(45, 100%, 60%)
  );
}
```

## Typographie

### Polices

```css
:root {
  /* Police principale - Medieval/Fantasy */
  --font-primary: 'Cinzel', serif;        /* Titres heroic */
  --font-secondary: 'Merriweather', serif; /* Texte principal */
  --font-ui: 'Inter', sans-serif;         /* UI moderne */
  --font-mono: 'JetBrains Mono', monospace; /* Code/stats */
}
```

### Échelle typographique

```css
.text-display {
  font-family: var(--font-primary);
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.1;
}

.text-h1 {
  font-family: var(--font-primary);
  font-size: 2.5rem;
  font-weight: 600;
  line-height: 1.2;
}

.text-h2 {
  font-family: var(--font-primary);
  font-size: 2rem;
  font-weight: 600;
  line-height: 1.3;
}

.text-h3 {
  font-family: var(--font-primary);
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.4;
}

.text-body {
  font-family: var(--font-secondary);
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.6;
}

.text-stats {
  font-family: var(--font-mono);
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.05em;
}
```

## Composants thématiques

### Boutons

```typescript
// Primary - Or héroïque
<Button variant="default" className="bg-gradient-to-r from-yellow-600 to-yellow-400">
  Commencer l'aventure
</Button>

// Destructive - Rouge dragon
<Button variant="destructive">
  Attaquer
</Button>

// Secondary - Violet mystique
<Button variant="secondary" className="bg-purple-700 hover:bg-purple-600">
  Magie
</Button>

// Ghost - Subtil
<Button variant="ghost">
  Retour
</Button>
```

### Cartes de personnage

```typescript
<Card className="border-2 border-yellow-600/50 bg-gradient-to-br from-gray-900 to-gray-800">
  <CardHeader className="border-b border-yellow-600/30">
    <CardTitle className="font-cinzel text-yellow-500">
      Nom du héros
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Statistiques */}
  </CardContent>
</Card>
```

### Badges de stats

```typescript
// Habileté - Bleu
<Badge className="bg-blue-600">Habileté: 12</Badge>

// Endurance - Vert/Rouge selon valeur
<Badge className={endurance > 50% ? "bg-green-600" : "bg-red-600"}>
  Endurance: 18/20
</Badge>

// Chance - Violet
<Badge className="bg-purple-600">Chance: 10</Badge>

// Or - Jaune
<Badge className="bg-yellow-600">Or: 45</Badge>
```

## Effets visuels

### Ombres

```css
/* Ombre douce */
.shadow-soft {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Ombre héroïque */
.shadow-heroic {
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 0 20px rgba(234, 179, 8, 0.1);
}

/* Ombre magique */
.shadow-magic {
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 0 20px rgba(147, 51, 234, 0.2);
}

/* Ombre de combat */
.shadow-combat {
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 0 20px rgba(239, 68, 68, 0.2);
}
```

### Animations

```css
/* Pulsation magique */
@keyframes magic-pulse {
  0%, 100% {
    opacity: 1;
    filter: brightness(1);
  }
  50% {
    opacity: 0.8;
    filter: brightness(1.2);
  }
}

.animate-magic {
  animation: magic-pulse 2s ease-in-out infinite;
}

/* Scintillement or */
@keyframes gold-shimmer {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

.gold-shimmer {
  background: linear-gradient(
    90deg,
    hsl(45, 100%, 45%),
    hsl(45, 100%, 60%),
    hsl(45, 100%, 45%)
  );
  background-size: 200% auto;
  animation: gold-shimmer 3s linear infinite;
}

/* Shake (dégâts) */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.animate-damage {
  animation: shake 0.5s ease-in-out;
}
```

## Icônes et symboles

### Bibliothèque recommandée
- **Lucide Icons** (inclus avec shadcn/ui)
- Icônes fantasy supplémentaires : **Game Icons** (optionnel)

### Mapping thématique

```typescript
// Caractéristiques
const icons = {
  habilete: <Sword />,
  endurance: <Heart />,
  chance: <Sparkles />,
  or: <Coins />,
  provisions: <Utensils />,
  equipement: <Shield />,
  objetsSpeciaux: <Wand2 />,
  
  // Actions
  combat: <Swords />,
  dice: <Dices />,
  notes: <BookOpen />,
  save: <Save />,
  export: <Download />,
  import: <Upload />,
  delete: <Trash2 />,
  
  // Navigation
  home: <Home />,
  back: <ArrowLeft />,
  menu: <Menu />,
};
```

## Responsive design

### Breakpoints

```typescript
const breakpoints = {
  sm: '640px',   // Mobile large
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
};
```

### Mobile-first

```css
/* Base : Mobile */
.hero-card {
  padding: 1rem;
  font-size: 0.875rem;
}

/* Tablet et + */
@media (min-width: 768px) {
  .hero-card {
    padding: 1.5rem;
    font-size: 1rem;
  }
}

/* Desktop et + */
@media (min-width: 1024px) {
  .hero-card {
    padding: 2rem;
    font-size: 1.125rem;
  }
}
```

## Touch targets

### Tailles minimales (mobile)

```css
/* Boutons */
.btn-mobile {
  min-height: 44px;
  min-width: 44px;
  padding: 0.75rem 1.5rem;
}

/* Inputs */
.input-mobile {
  min-height: 44px;
  font-size: 16px; /* Évite zoom sur iOS */
}

/* Cards cliquables */
.card-interactive {
  padding: 1rem;
  min-height: 64px;
}
```

## Accessibilité

### Contraste

```css
/* Ratio minimum 4.5:1 pour texte normal */
/* Ratio minimum 3:1 pour texte large */

/* Vérifier avec : */
/* https://webaim.org/resources/contrastchecker/ */

/* Exemples validés */
.text-on-dark {
  color: hsl(210, 40%, 98%); /* Blanc cassé sur noir */
}

.text-on-gold {
  color: hsl(222.2, 47.4%, 11.2%); /* Noir sur or */
}
```

### Focus visible

```css
.focusable {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

.focusable:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

## Implémentation

### Installation shadcn/ui

```bash
npx shadcn@latest init
```

### Configuration tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        merriweather: ['Merriweather', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        fantasy: {
          gold: 'hsl(var(--fantasy-gold))',
          silver: 'hsl(var(--fantasy-silver))',
          bronze: 'hsl(var(--fantasy-bronze))',
        },
        magic: {
          purple: 'hsl(var(--magic-purple))',
          blue: 'hsl(var(--magic-blue))',
          green: 'hsl(var(--magic-green))',
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```
