# Guide de Test - Combat V2 (CombatArena)

## 🎯 Objectif

Tester l'interface utilisateur du nouveau système de combat (Combat V2) pendant le développement.

## 🚀 Démarrage

### 1. Lancer l'application

```bash
pnpm dev
```

### 2. Accéder à un personnage

1. Aller sur http://localhost:3000
2. Cliquer sur un personnage existant (ou en créer un nouveau)

### 3. Lancer le Combat V2

Sur la page du personnage, chercher la section **violette** :

```
┌─────────────────────────────────────────┐
│ 🧪 DEV - Combat V2    En développement  │
├─────────────────────────────────────────┤
│ [  ⚔️  Combat V2 (Test Gobelin)  ]     │
│                                         │
│ Démarre un combat contre un Gobelin     │
│ de test                                 │
└─────────────────────────────────────────┘
```

Cliquer sur le bouton **"Combat V2 (Test Gobelin)"**.

## 🎮 Interface du Combat V2

### Structure

```
┌─────────────────────────────────────────┐
│ [X]                                     │  ← Bouton sortie
├─────────────────────────────────────────┤
│                                         │
│         Gobelin (Test)                  │  ← Carte ennemi
│         DEX: 6       PV: 8/8           │
│         [██████████████████] 100%       │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│      [🎲]   +   [🎲]                   │  ← Dés
│            TOTAL                        │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│         Hero (nom du perso)             │  ← Carte joueur
│         DEX: 12      PV: 20/20         │
│         [██████████████████] 100%       │
│                                         │
├─────────────────────────────────────────┤
│ [⚔️ Attaquer] [🎒 Objet]               │  ← Actions
│ [🍀 CHANCE]   [🏃 Fuir]                │
└─────────────────────────────────────────┘
```

### Fonctionnalités testables

#### ✅ Disponibles (PR #103)

- **Layout full-screen** : Occupe tout l'écran, overlay sur le reste
- **Scroll lock** : Le body ne scroll plus quand combat actif
- **Cartes combattants** :
  - Nom, DEX, PV (courant/max)
  - Barre de vie avec couleurs dynamiques :
    - 🟢 Vert (>25% PV) = normal
    - 🟠 Orange (≤25% PV) = critique
    - 🔴 Rouge (0% PV) = mort
  - Badge "BOSS" pour les ennemis boss (pas visible avec le Gobelin de test)
  - Arme équipée + bonus
- **Zone dés** : Affiche "Prêt pour le combat" en attendant
- **Panel d'actions** :
  - Boutons Attaquer, Objet, CHANCE, Fuir
  - Boutons désactivés si conditions non remplies
  - Touch-friendly (min 44px hauteur)
- **Bouton sortie (X)** :
  - Quitte immédiatement si combat terminé
  - Demande confirmation si combat en cours
- **Safe area iOS** : Respect des encoches iPhone
- **Responsive** : Testé à partir de 375px (iPhone SE)

#### ⏳ En développement (PRs futures)

- **Animations de dés** : Roll des dés avec animations
- **Affichage résultats** : TOUCHÉ ! / RATÉ !
- **Indicateur de dégâts** : Overlay rouge avec "-X PV"
- **Actions fonctionnelles** :
  - Attaquer (actuellement placeholder)
  - Utiliser objet
  - Dépenser CHANCE
  - Fuir
- **Tour par tour** : Alternance joueur/ennemi
- **Phase victoire/défaite** : Écrans de fin

## 🧪 Scénarios de Test

### Test 1 : Affichage initial

1. Lancer le combat
2. ✅ Vérifier que l'écran est en full-screen
3. ✅ Vérifier que le reste de la page ne scroll plus
4. ✅ Vérifier l'affichage des 2 cartes (joueur + Gobelin)
5. ✅ Vérifier les barres de vie (100% vertes)
6. ✅ Vérifier les boutons d'action

### Test 2 : Responsive mobile

1. Ouvrir DevTools (F12)
2. Passer en mode "iPhone SE" (375px)
3. Lancer le combat
4. ✅ Vérifier que tout est lisible
5. ✅ Vérifier que les boutons sont cliquables (min 44px)
6. ✅ Tester les safe areas (pas de contenu coupé)

### Test 3 : Sortie du combat

1. Lancer le combat
2. Cliquer sur le bouton X en haut à droite
3. ✅ Doit afficher "Quitter le combat en cours ? La progression sera perdue."
4. Cliquer "Annuler" → ✅ Reste dans le combat
5. Cliquer X à nouveau
6. Cliquer "OK" → ✅ Retour à la page personnage

### Test 4 : Barres de vie critiques (à venir)

Une fois les actions fonctionnelles :

1. Lancer le combat
2. Réduire la santé du Gobelin à ≤ 25%
3. ✅ Barre devrait passer en orange
4. Réduire à 0%
5. ✅ Barre devrait passer en rouge

## 📊 Couverture des Tests

### Tests automatisés

```bash
pnpm test src/presentation/components/combat/CombatArena.test.tsx
```

**23 tests unitaires** couvrent :
- Render sans combat
- Layout full-screen
- Scroll lock/unlock
- Cartes combattants
- Actions disponibles
- Bouton de sortie
- Confirmation de sortie
- Phases victoire/défaite
- Responsive mobile
- Safe area iOS

### Tests manuels

Utiliser ce document pour valider l'UI dans le navigateur.

## 🐛 Problèmes Connus

### Attendus (en développement)

- ❌ Cliquer sur "Attaquer" ne fait rien → **Normal**, logique pas encore implémentée
- ❌ Pas de dés qui roulent → **Normal**, animations à venir (PR #72)
- ❌ CHANCE toujours désactivée → **Normal**, logique à venir (PR #75)

### À Signaler

Si tu observes :

- ❌ Composant ne s'affiche pas
- ❌ Erreur console
- ❌ Scroll de page toujours actif pendant le combat
- ❌ Bouton X ne ferme pas le combat
- ❌ Layout cassé sur mobile
- ❌ Barres de vie incorrectes

→ **Créer une issue** avec capture d'écran + console log

## 📝 Retours

Pour donner ton feedback sur l'UI :

1. Tester les scénarios ci-dessus
2. Noter ce qui fonctionne ✅ / ne fonctionne pas ❌
3. Ajouter un commentaire sur **PR #103**
4. Ou créer une issue avec le tag `combat-v2`

## 🔗 Liens Utiles

- **PR #103** : https://github.com/bertrandgressier/adventure-tome/pull/103
- **Issue #70** : https://github.com/bertrandgressier/adventure-tome/issues/70
- **Epic Combat V2** : https://github.com/bertrandgressier/adventure-tome/issues/61
- **Guide UI Combat V2** : `docs/COMBAT_V2_UI_GUIDE.md`

---

**Version** : PR #103 (CombatArena layout)  
**Dernière mise à jour** : 16 janvier 2026
