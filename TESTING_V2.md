# Guide de test pour V2: Affichage des types d'items avec badges visuels

## 📋 Résumé des changements

### Fichiers ajoutés
- `src/presentation/components/ItemTypeBadge.tsx` - Composant badge pour les types d'items
- `src/presentation/components/ItemTypeBadge.test.tsx` - Tests unitaires
- `components/ui/badge.tsx` - Composant shadcn/ui (ajouté via CLI)
- `tests/helpers/test-character-v2.ts` - Helpers pour créer des personnages de test

### Fichiers modifiés
- `src/presentation/components/CharacterInventory.tsx` - Intégration des badges dans l'inventaire

## 🚀 Comment tester

### Méthode 1: Utiliser le script de test (RECOMMANDÉ)

Cette méthode est la plus simple pour tester tous les types d'items rapidement.

1. **Démarrer le serveur de développement**
   ```bash
   pnpm dev
   ```

2. **Ouvrir l'application et aller sur un personnage**
   - URL: http://localhost:3000/characters/<votre-character-id>

3. **Charger le script de test dans la console**
   - Ouvrez la console du navigateur (F12 ou Cmd+Option+I sur Mac)
   - Copiez et collez ce script dans la console :

   ```javascript
   fetch('/test-v2-items.js')
     .then(r => r.text())
     .then(code => eval(code));
   ```

4. **Exécuter la fonction d'ajout d'items**
   ```javascript
   addTestItems("<votre-character-id>")
   ```

   Exemple : `addTestItems("123456789-abcde")`

5. **Actualiser la page**
   - Les items de tous les types apparaîtront dans l'inventaire
   - Vous pourrez voir les badges, effets et quantités

### Méthode 2: Test manuel avec un personnage existant

1. **Démarrer le serveur de développement**
   ```bash
   pnpm dev
   ```

2. **Ouvrir l'application**
   - URL: http://localhost:3000
   - Naviguez vers un personnage existant avec des items

3. **Observer les badges**
   - Chaque item affiche maintenant un badge coloré avec une icône selon son type
   - Les effets des items s'affichent en dessous du nom
   - Les items actifs avec quantité > 1 affichent "×N" (ex: Potion de soin ×3)

### Méthode 3: Créer un nouveau personnage avec des items variés

1. **Créer un nouveau personnage** via l'interface
2. **Ajouter manuellement des items de chaque type**:
   - **Objet** (BASIC): Torche, Clé
   - **Passif** (PASSIVE): Collier de charisme
   - **Actif** (ACTIVE): Potion de soin (ajoutez-en plusieurs pour voir la quantité)
   - **Arme** (WEAPON): Épée courte (+1)
   - **Spécial** (SPECIAL): Bague de la deuxième chance

3. **Vérifier l'affichage**:
   - ✅ Badges colorés avec icônes
   - ✅ Descriptions des effets sous les noms
   - ✅ Quantités affichées pour les items actifs
   - ✅ Tooltips au survol des badges

### Méthode 4: Utiliser les helpers de test

Vous pouvez utiliser le helper `createTestCharacterForV2()` dans la console ou dans un composant de test pour créer un personnage avec tous les types d'items pré-configurés.

## 🎨 Types d'items et leurs badges

| Type | Icône | Couleur | Label | Exemple |
|------|-------|---------|-------|---------|
| BASIC | 📦 Box | Gris | Objet | Torche, Clé |
| PASSIVE | 🛡️ Shield | Violet | Passif | Collier de charisme |
| ACTIVE | 🧪 FlaskConical | Vert | Actif | Potion de soin |
| WEAPON | ⚔️ Sword | Rouge | Arme | Épée courte (+1) |
| SPECIAL | ✨ Sparkles | Jaune | Spécial | Bague de la deuxième chance |

## ✅ Checklist de validation

- [ ] Les badges s'affichent correctement pour chaque type d'item
- [ ] Les icônes sont correctes et visibles
- [ ] Les couleurs sont cohérentes avec le type
- [ ] Les tooltips apparaissent au survol
- [ ] Les effets des items s'affichent sous le nom
- [ ] Les quantités s'affichent pour les items actifs (ex: "×3")
- [ ] L'affichage est responsive sur mobile (375px)
- [ ] Le contraste respecte les exigences d'accessibilité
- [ ] L'UI reste cohérente avec le thème heroic fantasy

## 🐛 Problèmes connus

Aucun problème connu à ce jour.

## 🔍 Debugging

Si les badges ne s'affichent pas, vérifiez:
1. Que le serveur de développement est bien lancé
2. Que les items ont bien un champ `type` défini
3. Que le composant `ItemTypeBadge` est bien importé
4. Les erreurs dans la console du navigateur

## 📝 Tests unitaires

Tous les tests passent :
- Tests du composant `ItemTypeBadge`: 10 tests ✓
- Tests existants: 175 tests ✓

Lancer les tests:
```bash
pnpm run test -- ItemTypeBadge
```
