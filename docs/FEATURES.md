# Fonctionnalités - Adventure Tome

## Vue d'ensemble

Application PWA mobile pour gérer vos personnages des livres "Le jeu dont tu es le héro" de la collection [La Saga de Dagda](https://www.lasagadedagda.fr/).

Première implémentation : **La Harpe des Quatre Saisons**

## 📱 Fonctionnalités principales

### 1. Écran de lancement
- Splash screen avec thème heroic fantasy
- Accueil avec navigation principale
- Logo et branding de l'application

### 2. Choix du talent

**Tome 1** : 1 talent parmi 7 talents initiaux :
- **Instinct** : Capacité à pressentir le danger et prendre les bonnes décisions
- **Herbologie** : Connaissance des plantes et de leurs propriétés
- **Discrétion** : Art de se déplacer et agir sans être remarqué
- **Persuasion** : Capacité à convaincre et négocier
- **Observation** : Sens du détail et capacité à repérer des indices
- **Doigts agiles** : Dextérité manuelle et agilité des mains
- **Empratique** : Capacité à comprendre et ressentir les émotions d'autrui

**Tome 2+** : 1 ou 2 talents
- 1 talent initial (liste ci-dessus)
- 1 second talent optionnel (Tome 2 et suivants) :
  - **Cartographe** : Capacité à lire les cartes et s'orienter
  - **Tueur de gobelin** : Expertise contre les gobelins
  - **Instinct** : Capacité à pressentir le danger et prendre les bonnes décisions
- Le second talent est optionnel et peut être ignoré

### 3. Gestion des personnages

#### Liste des personnages
- Affichage de tous les personnages sauvegardés
- Aperçu rapide des statistiques principales
- Accès rapide aux actions (éditer, supprimer, exporter)

#### Créer un personnage
- Formulaire de création basé sur la fiche du livre
- Saisie des attributs de base :
  - Nom du personnage
  - Habileté
  - Endurance
  - Chance
  - Or
  - Provisions
  - Équipement
  - Notes spéciales

#### Modifier un personnage
- **Édition inline du nom** : clic sur le nom pour l'éditer directement
- **Édition inline des stats** : clic sur DEXTÉRITÉ, CHANCE, PV MAX, PV ACTUELS pour éditer
- **Édition inline du paragraphe et des boulons** : clic direct sur les valeurs
- Mise à jour de l'arme équipée
- Ajout/suppression d'objets dans l'inventaire
- Modification des notes

#### Dupliquer/Supprimer un personnage
- **Bouton dupliquer** (📋) directement dans la liste des personnages
- **Bouton supprimer** (🗑️) directement dans la liste des personnages
- Confirmation avant suppression
- Suppression définitive du stockage local

### 4. Gestion de la progression

#### Sauvegarde de position
- Enregistrer le numéro de paragraphe actuel
- Historique des dernières positions
- Horodatage des sauvegardes

### 5. Système de combat

#### Phase de combat
- Configuration de l'adversaire (nom, DEXTÉRITÉ, PV, points de dommage)
- Choix du mode : **Automatique** (dés lancés automatiquement) ou **Manuel** (contrôle total)
- Choix du premier attaquant (joueur ou ennemi)
- Interface dédiée au combat
- **Test pour toucher** : 2d6 ≤ DEXTÉRITÉ
- **Calcul automatique des dégâts** : 1 + 1d6 + Points de dommage de l'arme
- Alternance automatique des attaquants
- Gestion des Points de Vie en temps réel
- Affichage côte à côte : vous vs adversaire
- Possibilité de fuir (-2 PV)
- Historique des rounds avec auto-scroll
- Détection automatique de la victoire ou de la défaite
- Modal de fin de combat (victoire ou défaite)
- Option de résurrection (PV à 0) en cas de défaite

### 6. Lancer de dés

#### Dés à 6 faces
- Lancer 1 dé
- Lancer 2 dés
- Affichage animé des résultats
- Historique des lancers récents

### 7. Musique d'ambiance

#### Lecteur audio
- Musique de fond automatique au lancement
- Bouton de contrôle (🔊/🔇) en haut à droite
- Arrêt complet du média (pas de ressource active dans le navigateur)
- Préférence sauvegardée dans le navigateur (localStorage)

### 8. Bloc-notes

#### Notes personnelles
- Prise de notes libre
- Mémos pour l'aventure
- Indices et rappels
- Sauvegarde automatique

### 9. Import/Export

#### Sauvegarde des données
- Export du personnage au format JSON
- Import de personnages existants
- Partage entre appareils
- Backup des données

## 🎨 Interface utilisateur

### Design
- Thème heroic fantasy/magie
- Composants shadcn/ui
- Palette de couleurs adaptée
- Typographie médiévale

### UX Mobile
- Interface optimisée pour mobile
- Navigation intuitive
- Gestes tactiles
- Feedback visuel
- Performance optimisée

## 💾 Stockage

### LocalStorage/IndexedDB
- Stockage 100% local
- Pas de serveur requis
- Données persistantes
- Hors ligne total

## 📦 Progressive Web App

### Capacités PWA
- Installation sur écran d'accueil
- Mode standalone
- Fonctionne hors ligne
- Icônes adaptées
- Manifest configuré

## 🔄 Fonctionnalités futures

- Support de plusieurs livres de la collection
- Statistiques de progression
- Achievements/succès
- Mode sombre/clair
- Synchronisation cloud (optionnelle)
- Partage de personnages
