# Fonctionnalités - Adventure Hero

## Vue d'ensemble

Application PWA mobile pour gérer vos personnages des livres "Le jeu dont tu es le héro" de la collection [La Saga d'Agda](https://www.lasagadedagda.fr/).

Première implémentation : **La Harpe des Quatre Saisons**

## 📱 Fonctionnalités principales

### 1. Écran de lancement
- Splash screen avec thème heroic fantasy
- Accueil avec navigation principale
- Logo et branding de l'application

### 2. Gestion des personnages

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
- Édition de toutes les statistiques
- Mise à jour de l'inventaire
- Modification des points de vie/endurance

#### Supprimer un personnage
- Confirmation avant suppression
- Suppression définitive du stockage local

### 3. Gestion de la progression

#### Sauvegarde de position
- Enregistrer le numéro de paragraphe actuel
- Historique des dernières positions
- Horodatage des sauvegardes

### 4. Système de combat

#### Phase de combat
- Interface dédiée au combat
- Calcul automatique des Forces d'Attaque
- Lancer de dés pour chaque assaut
- Gestion des points d'endurance en temps réel
- Affichage des adversaires avec leurs stats
- Option "Tentez votre Chance" après chaque assaut
- Possibilité de fuir (si autorisé)
- Historique des assauts
- Animations visuelles des dégâts
- Résolution automatique jusqu'à victoire ou défaite

### 5. Lancer de dés

#### Dés à 6 faces
- Lancer 1 dé
- Lancer 2 dés
- Affichage animé des résultats
- Historique des lancers récents

### 6. Bloc-notes

#### Notes personnelles
- Prise de notes libre
- Mémos pour l'aventure
- Indices et rappels
- Sauvegarde automatique

### 7. Import/Export

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
