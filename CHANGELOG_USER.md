# 📝 Historique des nouveautés

Bienvenue dans l'historique des nouveautés d'Adventure Tome ! 🗡️

Cette page liste uniquement les changements visibles pour vous, les aventuriers :

- ✨ Nouvelles fonctionnalités
- 🐛 Corrections de bugs
- ⚡ Améliorations de performance

Pour les détails techniques complets, consultez le [CHANGELOG.md](./CHANGELOG.md).

---

## Version 5.0.1
*1 février 2026*

### 🐛 Corrections de bugs

- correct HP persistence after combat victory ([#153](https://github.com/bertrandgressier/adventure-tome/issues/153))

---

## Version 5.0.0
*30 janvier 2026*

### ✨ Nouvelles fonctionnalités

- Combat V3 - Système de combat conforme aux règles officielles ([#151](https://github.com/bertrandgressier/adventure-tome/issues/151))
- Remove flee functionality from Combat V3
- CombatEngine now accepts a single enemy instead of an array
- Remove generic SPEND_CHANCE action type
- EnemyConfig no longer contains weapon, chance, or isBoss properties
- negate_damage weapon ability no longer supported in V3
- fix(combat): complete V3 migration - build fixes and test adaptations
- feat(store): add descriptive action names for Redux DevTools
- docs: add Redux DevTools actions reference guide
- refactor(combat): remove V2 dead code from AttackResolver
- refactor(combat): remove remaining V2 dead code from resolvers
- fix(store): use StateCreator type for Redux DevTools action naming
- fix(lint): remove unused imports and replace 'any' with proper types
- fix(combat): ajouter +1 automatique dans formule de dégâts AttackResolver
- fix(combat): reroll applique les dégâts + historique affiche les actions
- feat(combat): auto-skip + auto-play ennemi sans setTimeout
- feat(combat): animations Framer Motion avec useCombatAnimations hook
- fix(combat): amélioration timing et visibilité des animations
- refactor(combat): auto-play ennemi géré dans React avec délai
- fix(combat): attendre fin animations avant auto-play ennemi
- refactor(combat): callback onAnimationComplete pour auto-play ennemi
- fix(combat): empêcher auto-skip pendant tour ennemi
- revert: remettre shouldAutoSkip original
- feat(combat): implement state-based combat sequencing architecture
- fix(combat): prevent auto-skip when player has REROLL available
- refactor(combat): hide SKIP button during animations and cleanup
- chore: fix ESLint errors and remove dead code
- feat(combat-v3): migrate to DiceAnimation3D in CombatArena and DiceRoller
- Legacy combat components are no longer used

### 🐛 Corrections de bugs

- correct storybook imports and remove unused variables
- corrige tous les tests échouants

---

## Version 4.6.0
*14 janvier 2026*

### ✨ Nouvelles fonctionnalités

- add État and Statut fields for Tome 3+ (issue [#84](https://github.com/bertrandgressier/adventure-tome/issues/84))

### 🐛 Corrections de bugs

- restore larger input widths for EditableStatField
- update CURRENT_VERSION to 14 after merge

---

## Version 4.5.0
*14 janvier 2026*

### ✨ Nouvelles fonctionnalités

- Add talent levels for Tome 3 ([#85](https://github.com/bertrandgressier/adventure-tome/issues/85))
- add OpenCode custom command for autonomous issue development

---

## Version 4.4.0
*13 janvier 2026*

### ✨ Nouvelles fonctionnalités

- Add experience tracking for Tome 3+ characters
- add simplified issue templates with dev-ready variants

### 🐛 Corrections de bugs

- Add size prop to EditableStatField for responsive input width
- Add xs size option for tighter grid layout
- Convert null to undefined for experience field type compatibility
- Initialize experience to 0 for Tome 3+ and increase input width

---

## Version 4.3.0
*13 janvier 2026*

### ✨ Nouvelles fonctionnalités

- améliorer l'UX mobile de la modale AddItemModal

---

## Version 4.2.0
*12 janvier 2026*

### ✨ Nouvelles fonctionnalités

- add InventoryItemRef type for catalog-based inventory

### 🐛 Corrections de bugs

- add fallbackName to preserve unknown item names during v11 migration
- correct GetState type in characterListSlice
- implement custom items persistence and remove code duplication
- update tests and linter for itemsCatalog refactoring

---

## Version 4.1.0
*6 janvier 2026*

### ✨ Nouvelles fonctionnalités

- unifier la gestion des armes avec AddItemModal ([#45](https://github.com/bertrandgressier/adventure-tome/issues/45))

---

## Version 4.0.0
*6 janvier 2026*

Cette version contient des améliorations techniques et des corrections mineures.

---

## Version 3.4.1
*5 janvier 2026*

Cette version contient des améliorations techniques et des corrections mineures.

---

## Version 3.4.0
*5 janvier 2026*

### ✨ Nouvelles fonctionnalités

- adapt AddWeaponModal to use catalog with manual fallback

---

## Version 3.3.0
*5 janvier 2026*

### ✨ Nouvelles fonctionnalités

- add catalog item selection modal
- add tome filter with auto-selection

### 🐛 Corrections de bugs

- prevent adding bourse and weapons to inventory

---

## Version 3.2.0
*3 janvier 2026*

### ✨ Nouvelles fonctionnalités

- create item catalog with 47 items and migration v10
- add visual item type badges and quick actions overlay

### 🐛 Corrections de bugs

- update CharacterDTO to match new InventoryItem interface
- update characterInventorySlice to use new InventoryItem type
- update CharacterService.addItemToInventory signature

---

## Version 3.1.0
*1 janvier 2026*

### ✨ Nouvelles fonctionnalités

- add second talent for Tome 2+ characters

---

## Version 3.0.1
*29 décembre 2025*

### 🐛 Corrections de bugs

- iOS installation button detection (fixes [#12](https://github.com/bertrandgressier/adventure-tome/issues/12))
- adjust current health when max health is reduced

---

## Version 3.0.0
*19 novembre 2025*

### ✨ Nouvelles fonctionnalités

- add reputation system for Tome 2
- add reset button (0) to time tracking gauge
- add time tracking for Tome 2 (days elapsed and next wake up)
- migrate book from string to number + conditional Constitution display
- add gameMode and version to Character entity
- add optional constitution stat for tome 2 & 3
- add data migration system
- integrate auto-migration in repository
- make day circles clickable in time tracking gauge
- add game mode selection in character creation
- add interactive game mode info dialog on character list
- display game mode badge on character list and detail pages
- remove 'Caractéristiques' title from character detail page
- reorganize character stats layout
- Items no longer have toggleable possession state
- Existing characters with book strings will be auto-migrated to numbers on load

### 🐛 Corrections de bugs

- add aria-describedby to DialogContent for accessibility compliance
- correct reputation initialization and serialization
- improve mobile responsiveness for book selection dialog
- improve mobile responsiveness for Combat and Dice buttons
- improve reset UX for time tracking gauge
- improve time tracking gauge UX
- replace "Modifier" text with Pencil icon in CharacterNotes
- replace emoji + buttons with lucide-react Plus icon
- use standard markdown list syntax in user changelog
- remove item possession toggle feature

---

## Version 2.2.1
*19 novembre 2025*

### 🐛 Corrections de bugs

- correct user changelog generation regex for header levels
- improve character list design for mobile
- improve visual distinction for critical health and death states
- update character detail stats to match home screen design

---

## Version 2.2.0
*19 novembre 2025*

### ✨ Nouvelles fonctionnalités

- add character notebook feature with persistence
- improve user changelog generation and link

---

## Version 2.1.0
*19 novembre 2025*

### 🐛 Corrections de bugs

- translate error messages to French

### ✨ Nouvelles fonctionnalités

- allow changing book from paragraph section with dialog

---

## Version 2.0.0
*18 novembre 2025*

### ✨ Nouvelles fonctionnalités

- implémentation de Zustand pour la gestion d'état centralisée

---

## Version 1.7.0
*17 novembre 2025*

### ✨ Nouvelles fonctionnalités

- affichage fantomatique des personnages morts et simplification popup défaite
- ajout composant BookTag pour identifier les 3 livres de la saga

---

## Version 1.6.0
*14 novembre 2025*

### ✨ Nouvelles fonctionnalités

- ajout du lien de donation PayPal

---

## Version 1.5.1
*14 novembre 2025*

### 🐛 Corrections de bugs

- retirer autoFocus du formulaire de combat pour mobile

---

## Version 1.4.4
*14 novembre 2025*

### 🐛 Corrections de bugs

- prevent incorrect playing state on first load

---

## Version 1.4.3
*14 novembre 2025*

### 🐛 Corrections de bugs

- preserve NEXT_PUBLIC_GA_ID in .env.production

---

## Version 1.4.2
*14 novembre 2025*

### 🐛 Corrections de bugs

- wrap GoogleAnalytics in Suspense for useSearchParams

---

## Version 1.4.0
*14 novembre 2025*

### ⚡ Améliorations de performance

- optimize CI build caching

---

## Version 1.3.1
*14 novembre 2025*

### 🐛 Corrections de bugs

- icône musique affichée correctement au démarrage

---

## Version 1.3.0
*14 novembre 2025*

### 🐛 Corrections de bugs

- génération correcte des tags Docker avec version

### ✨ Nouvelles fonctionnalités

- support Google Analytics avec injection runtime

---

## Version 1.2.0
*14 novembre 2025*

### ✨ Nouvelles fonctionnalités

- ajout lien vers CHANGELOG depuis la version
- release uniquement sur changements du code applicatif

---

## Version 1.1.1
*14 novembre 2025*

### 🐛 Corrections de bugs

- séparation des workflows release et docker

---

## Version 1.1.0
*14 novembre 2025*

### 🐛 Corrections de bugs

- correction des titres en double et nettoyage
- corrections UI et ESLint

### ✨ Nouvelles fonctionnalités

- ajout liens GitHub et signalement de bugs

---

## Version 1.0.0
*13 novembre 2025*

### 🐛 Corrections de bugs

- apply dark theme to InstallPrompt component
- correct collection name to 'La Saga Dadga'
- improve button readability with bold font and larger text
- make button visible with proper background and border
- recreate character creation page from scratch
- remove duplicate code causing parsing error
- remove starting equipment (not in book rules)
- use explicit golden color for button background
- use pure black text on golden button for maximum contrast

### ✨ Nouvelles fonctionnalités

- add character creation page with dice rolling
- character creation with correct talents and stats rules + manual mode
- implement dark sepia theme with medieval styling
- improve character list presentation with better visibility
- IndexedDB storage for characters + display character list
- mise en place semantic-release et CI/CD automatique
- update character creation with correct stats and talent selection
