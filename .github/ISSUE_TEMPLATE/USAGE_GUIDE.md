# Guide d'utilisation des templates d'issues

Ce guide vous montre comment utiliser les templates d'issues pour Adventure Tome.

## 🎯 Workflow recommandé

### 1. Identifier le type d'issue

Avant de créer une issue, déterminez son type :

| Cas d'usage | Template |
|-------------|----------|
| Nouvelle fonctionnalité à développer | 🚀 **Feature Request** |
| Amélioration d'une fonctionnalité existante | ✨ **Enhancement** |
| Refactorisation du code | ♻️ **Refactor** |
| Bug ou comportement inattendu | 🐛 **Bug Report** |

### 2. Créer l'issue

#### Option A : Via GitHub CLI (recommandé)

```bash
# Créer une feature
gh issue create --template feature.yml

# Créer un bug report
gh issue create --template bug.yml

# Créer une amélioration
gh issue create --template enhancement.yml

# Créer un refactor
gh issue create --template refactor.yml
```

#### Option B : Via l'interface web

1. Aller sur : https://github.com/bertrandgressier/adventure-tome/issues/new/choose
2. Sélectionner le template approprié
3. Remplir le formulaire

### 3. Compléter les labels manuellement

Les templates ajoutent automatiquement les labels de **type**, mais vous devez ajouter :

```bash
# Ajouter des labels après création
gh issue edit <numéro> --add-label "scope: ui,size: medium"
```

## 📝 Exemples pratiques

### Exemple 1 : Créer une feature

```bash
# Créer l'issue via template
gh issue create --template feature.yml

# Remplir dans l'éditeur :
```

**Titre :** `[Feature]: Système de sauvegarde cloud`

**Sections à remplir :**

```markdown
## 🎯 Objectif Business
Permettre aux joueurs de synchroniser leurs personnages entre appareils via le cloud.

## 📋 Contexte
Actuellement, les personnages sont stockés uniquement dans IndexedDB local.
Si l'utilisateur change d'appareil ou réinstalle le navigateur, il perd ses données.

## 🚀 Étapes d'implémentation

### 1. Créer le service de synchronisation
Fichier: `src/infrastructure/cloud/CloudSyncService.ts`

### 2. Ajouter l'authentification
- Intégrer Supabase Auth
- Gérer les tokens

### 3. Tests
- Tests unitaires pour CloudSyncService
- Tests d'intégration sync

## ✅ Livrables
- [ ] Service CloudSyncService créé
- [ ] Authentification intégrée
- [ ] UI de synchronisation
- [ ] Tests
- [ ] Documentation

## 📦 Scope
ui, infrastructure, data

## 📏 Taille estimée
size: large (3-5 jours)
```

**Après création, ajouter les labels :**
```bash
gh issue edit <numéro> --add-label "scope: infrastructure,scope: data,size: large"
```

---

### Exemple 2 : Reporter un bug

```bash
gh issue create --template bug.yml
```

**Titre :** `[Bug]: Crash lors de la sélection du second talent`

**Sections à remplir :**

```markdown
## 🐛 Description du bug
L'application crash avec une erreur "Cannot read property 'name' of undefined" lors de la sélection d'un second talent pour un personnage Tome 2.

## 🔄 Étapes de reproduction
1. Aller sur /characters/new
2. Sélectionner 'Tome 2'
3. Remplir nom et talent principal
4. Sélectionner un second talent
5. Cliquer sur "Créer le personnage"
6. Observer le crash

## ✅ Comportement attendu
Le personnage devrait être créé avec les deux talents.

## ❌ Comportement observé
Erreur dans la console : "Cannot read property 'name' of undefined"

## 📝 Logs / Messages d'erreur
```
Error: Cannot read property 'name' of undefined
  at CharacterService.createCharacter (CharacterService.ts:45)
```

## 🔥 Sévérité
high (fonctionnalité importante cassée)

## 🌐 Navigateur
Chrome, Safari

## 📱 Type d'appareil
Desktop, Mobile (iOS)

## 🔁 Fréquence
always (100% du temps)
```

---

### Exemple 3 : Proposer un refactor

```bash
gh issue create --template refactor.yml
```

**Titre :** `[Refactor]: Centraliser la gestion des erreurs dans les slices`

**Sections à remplir :**

```markdown
## 🎯 Objectif Business
Éliminer la duplication du code de gestion d'erreurs dans les 16 catch blocks des slices Zustand.

## 📋 Contexte
Actuellement, chaque slice duplique la même logique de gestion d'erreurs :

```typescript
catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Erreur';
  set({ error: errorMessage });
}
```

## 💡 Solution proposée
Créer un helper `handleSliceError()` centralisé :

```typescript
export function handleSliceError(set: SetState, error: unknown): void {
  const errorMessage = error instanceof Error ? error.message : 'Erreur de mise à jour';
  set({ error: errorMessage });
}
```

## 📊 Étude d'Impact

### Presentation Layer Impact
- `characterStatsSlice.ts` - Remplacer 4 catch blocks
- `characterInventorySlice.ts` - Remplacer 6 catch blocks
- `characterMutationSlice.ts` - Remplacer 3 catch blocks
- `characterMetadataSlice.ts` - Remplacer 3 catch blocks

**Complexité:** Faible - remplacement mécanique

## 🎯 Livrables

### Phase 1: Créer le helper
- [ ] Créer `sliceHelpers.ts`
- [ ] Tests pour handleSliceError

### Phase 2: Refactor slices
- [ ] Refactor characterStatsSlice
- [ ] Refactor characterInventorySlice
- [ ] Refactor characterMutationSlice
- [ ] Refactor characterMetadataSlice

### Phase 3: Tests
- [ ] Tous les tests existants passent
- [ ] Coverage maintenu

## ⚠️ Risques
1. **Tests**: Risque de casser des tests existants
   - Mitigation: Lancer les tests après chaque slice refactoré

## 📈 Avantages attendus
1. **Maintenabilité**: Code plus DRY
2. **Cohérence**: Gestion d'erreurs uniforme
3. **Évolutivité**: Facile d'ajouter du logging centralisé

## 📦 Scope
presentation

## 📏 Taille estimée
size: small (< 1 jour)
```

---

## 🏷️ Gestion des labels

### Labels automatiques (via template)
- `type: feature` - Ajouté par `feature.yml`
- `type: refactor` - Ajouté par `refactor.yml`
- `type: bug` - Ajouté par `bug.yml`
- `enhancement` - Ajouté par `enhancement.yml`

### Labels à ajouter manuellement

```bash
# Après création de l'issue
gh issue edit <numéro> --add-label "scope: ui,size: medium"

# Exemple complet
gh issue edit 50 --add-label "scope: inventory,scope: ui,size: large,priority: high"
```

### Combinaisons recommandées

**Feature complexe :**
```bash
gh issue edit <numéro> --add-label "scope: domain,scope: infrastructure,size: xlarge"
```

**Bug critique :**
```bash
gh issue edit <numéro> --add-label "priority: critical,scope: combat"
```

**Refactor simple :**
```bash
gh issue edit <numéro> --add-label "scope: presentation,size: small"
```

---

## 💡 Bonnes pratiques

### ✅ DO

- **Être spécifique** : Détailler les étapes techniques
- **Référencer la documentation** : Liens vers `docs/`, `AGENTS.md`
- **Suivre les règles officielles** : Pas d'invention de mécaniques (voir `docs/COMBAT.md`)
- **Inclure des exemples de code** : Snippets TypeScript avec syntax highlighting
- **Estimer la complexité** : size: small/medium/large/xlarge
- **Lister les dépendances** : Issues bloquantes ou features requises
- **Considérer les edge cases** : Cas limites à tester
- **Prévoir les tests** : Tests unitaires + intégration

### ❌ DON'T

- **Issues vagues** : "Améliorer l'UI" → préciser quoi exactement
- **Mélanger les types** : Feature + Bug dans la même issue → séparer
- **Ignorer l'architecture** : Respecter Clean Architecture (Domain → Application → Infrastructure → Presentation)
- **Oublier les migrations** : Si changement de modèle de données, migration requise
- **Inventer des mécaniques** : Toujours se référer aux livres officiels
- **Négliger les tests** : Toutes les issues doivent inclure des tests

---

## 🔄 Workflow AI Agent

Si vous travaillez avec un agent AI (GitHub Copilot, etc.) :

```markdown
Agent, développe la feature issue #44, utilise gh pour récupérer le ticket.
- Assure-toi que la branche est synchronisée avec main remote, rebase avec origin/main
- Lis AGENTS.md avant de commencer
- Prends le temps d'analyser la demande
- Puis tu peux développer en toute autonomie ce qui est demandé
- Assure-toi de rajouter des tests manquants si nécessaire
- Assure-toi que les tests et le lint sont ok
- Assure-toi de conserver une cohérence sur l'UI/UX
- Ne commit pas, quand tout est ok, dis-le moi pour que je teste
```

L'agent utilisera automatiquement les informations structurées du template !

---

## 📊 Statistiques

Pour analyser vos issues :

```bash
# Compter les issues par type
gh issue list --label "type: feature" --state all | wc -l
gh issue list --label "type: bug" --state all | wc -l
gh issue list --label "type: refactor" --state all | wc -l

# Issues par scope
gh issue list --label "scope: ui" --state open
gh issue list --label "scope: combat" --state open

# Issues par taille
gh issue list --label "size: large" --state open
```

---

## 🎓 Formation

### Pour les contributeurs

1. **Lire ce guide** avant de créer votre première issue
2. **Consulter [AGENTS.md](../../AGENTS.md)** pour comprendre l'architecture
3. **Examiner les issues existantes** pour voir des exemples concrets :
   - Issue #44 (Feature) - Suppression d'items personnalisés
   - Issue #35 (Feature) - Second talent Tome 2
   - Issue #49 (Refactor) - Références par ID
   - Issue #47 (Enhancement) - Amélioration des combats

### Pour les mainteneurs

1. **Valider la structure** : L'issue suit-elle le template ?
2. **Compléter les labels** : Ajouter scope + size si manquants
3. **Vérifier la cohérence** : Respecte-t-elle les règles du jeu ?
4. **Assigner** : Attribuer à un contributeur

---

## 🆘 Support

- **Questions sur les templates** : Ouvrir une Discussion
- **Bugs sur les templates** : Créer une issue (type: bug) 😄
- **Suggestions d'amélioration** : Créer une issue (enhancement)

---

**Dernière mise à jour :** 8 janvier 2026
