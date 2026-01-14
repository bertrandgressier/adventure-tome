---
description: Develop an issue autonomously from start to PR
---

# Mission: Développement Autonome d'une Issue GitHub

Tu es chargé de développer **l'issue #$1** de manière totalement autonome, de la lecture de l'issue jusqu'à la création d'une Pull Request validée.

## Contexte du Projet

Ce projet utilise **Clean Architecture** avec des règles strictes définies dans `AGENTS.md`. Tu DOIS lire et respecter ces règles.

Feature branch cible: **`epic/combatV2`**

---

## Workflow à Suivre (Étapes Obligatoires)

### 1. 📋 Analyse de l'Issue

```bash
gh issue view $1
```

**Actions requises:**
- Lire l'intégralité de l'issue #$1
- Identifier les objectifs business
- Lister les fichiers à créer/modifier
- Identifier les dépendances (issues bloquantes)
- Challenger le plan: est-il cohérent avec l'architecture actuelle?

**Output attendu:**
- Résumé de l'issue en 3 points
- Liste des fichiers impactés
- Identification des risques/incohérences potentielles

---

### 2. 🔍 Vérification des Dépendances

```bash
# Si l'issue mentionne "Requires: #XX"
gh issue view <issue_bloquante> --json state,title
```

**Actions:**
- Vérifier que les issues bloquantes sont CLOSED
- Si bloquées, ARRÊTER et notifier l'utilisateur

---

### 3. 🌿 Création de la Branche de Travail

```bash
# Vérifier l'état actuel
git status
git branch

# Créer branche depuis epic/combatV2
git checkout -b feat/combat-v2/issue-$1 origin/epic/combatV2
```

**Naming convention:** `feat/combat-v2/issue-$1` (ex: `feat/combat-v2/issue-62`)

---

### 4. 💻 Implémentation

**RÈGLES CRITIQUES** (lire `AGENTS.md` en entier):

1. **Clean Architecture**: Respecter les layers (Domain → Application → Infrastructure → Presentation)
2. **NO BUSINESS LOGIC IN UI**: Toute logique métier dans Domain/Application
3. **Immutabilité**: Utiliser spread operators, jamais de mutations directes
4. **Types stricts**: TypeScript strict mode, pas de `any`
5. **Tests obligatoires**: Chaque fonction publique doit avoir des tests

**Workflow d'implémentation:**

```typescript
// 1. Créer les types d'abord (si Phase 1)
// 2. Implémenter la logique Domain (pure functions)
// 3. Ajouter les tests unitaires
// 4. Implémenter Application layer (orchestration)
// 5. Ajouter Infrastructure si nécessaire
// 6. Implémenter Presentation (UI)
// 7. Tests d'intégration
```

**Patterns à suivre:**
- `withChanges()` pour immutabilité dans Character
- `handleSliceError()` pour gestion d'erreurs dans slices
- Zustand slices pour state management

---

### 5. ✅ Vérification des Tests

```bash
# Lancer les tests
pnpm test

# Vérifier la couverture
pnpm test:coverage
```

**Critères de succès:**
- [ ] TOUS les tests existants (293+) passent
- [ ] Les nouveaux tests couvrent les cas nominaux
- [ ] Les edge cases sont testés
- [ ] Coverage maintenu ou augmenté

**Si tests échouent:**
- Analyser les failures
- Corriger le code (PAS de skip de tests)
- Re-tester jusqu'à 100% vert

---

### 6. 🔧 Vérification Lint & Build

```bash
# ESLint
pnpm lint

# TypeScript compilation
pnpm build
```

**Critères:**
- [ ] 0 erreur ESLint
- [ ] 0 erreur TypeScript
- [ ] Build production réussit

**Si erreurs:**
- Corriger immédiatement
- Ne JAMAIS bypass avec `@ts-ignore` ou `eslint-disable`

---

### 7. 📝 Commit des Changements

```bash
# Vérifier les fichiers modifiés
git status
git diff

# Commit avec message conventionnel
git add <fichiers>
git commit -m "feat(combat): implement #$1 - <résumé court>"
```

**Format commit:** Suivre Conventional Commits
- `feat(scope):` pour nouvelles fonctionnalités
- `fix(scope):` pour corrections
- `refactor(scope):` pour refactoring
- `test(scope):` pour tests

---

### 8. 🚀 Création de la Pull Request

```bash
# Push vers origin
git push -u origin feature/issue-$1

# Créer PR vers epic/combatV2
gh pr create \
  --base epic/combatV2 \
  --title "feat(combat): Issue #$1 - <titre issue>" \
  --body "$(cat <<'EOF'
## 🎯 Résumé

Implémentation de l'issue #$1

## ✅ Checklist

- [x] Tests unitaires ajoutés et passent (293+)
- [x] Lint passe (0 erreur)
- [x] Build production réussit
- [x] Pas de régression
- [x] Documentation mise à jour si nécessaire

## 🔗 Liens

Closes #$1

## 📸 Screenshots (si UI)

<!-- Ajouter captures si composants visuels -->
EOF
)"
```

**PR doit cibler:** `epic/combatV2` branch (PAS `main`)

---

### 9. 🤖 Vérification des GitHub Actions

```bash
# Attendre les checks CI/CD
gh pr checks

# Si échec, voir les logs
gh pr checks --watch
```

**Checks obligatoires:**
- [ ] Commitlint (format commit)
- [ ] ESLint
- [ ] Tests (293+)
- [ ] Build production
- [ ] TypeScript compilation

**Si checks échouent:**
- Lire les logs d'erreur
- Fix le problème
- Commit + push
- Re-vérifier jusqu'à vert

---

### 10. ✅ Validation Finale

Une fois TOUS les checks verts:

```bash
# Récapitulatif
gh pr view

# Lister les fichiers modifiés
gh pr diff --name-only
```

**Confirmer:**
- [ ] PR créée vers `epic/combatV2`
- [ ] Tous les GitHub Actions sont verts
- [ ] Tests passent (293+)
- [ ] Lint passe
- [ ] Build réussit
- [ ] Issue #$1 liée (closes)

---

## ⚠️ Points d'Attention

### Ne JAMAIS:
- Skipper des tests
- Utiliser `@ts-ignore` ou `any`
- Commit du code qui ne build pas
- Créer une PR vers `main` (cible = `epic/combatV2`)
- Modifier des fichiers hors scope de l'issue
- Ignorer les échecs de CI/CD

### TOUJOURS:
- Lire `AGENTS.md` en entier avant de coder
- Respecter Clean Architecture
- Écrire des tests AVANT ou PENDANT le dev
- Vérifier que 100% des checks sont verts
- Challenger le plan de l'issue si incohérent
- Demander clarification si ambiguïté

---

## 📊 Output Attendu en Fin de Mission

Fournir un rapport final structuré:

```
## ✅ Mission Terminée - Issue #$1

### Résumé
- Issue: #$1 - <titre>
- Branch: feat/combat-v2/issue-$1
- PR: #<numero_pr>

### Fichiers Modifiés
- `<fichier1>` (création/modification)
- `<fichier2>` (création/modification)

### Tests
- Tests ajoutés: X
- Tests passants: 293+
- Coverage: XX%

### Checks GitHub Actions
- ✅ Commitlint
- ✅ ESLint
- ✅ Tests
- ✅ Build
- ✅ TypeScript

### Challenges Rencontrés
- <challenge1 et résolution>

### Prêt pour Review
✅ Oui, tous les critères sont validés
```

---

## 🚨 En Cas de Blocage

Si tu rencontres un blocage (dépendances manquantes, architecture incohérente, specs ambiguës):

1. **STOP immédiatement**
2. Documenter le problème précisément
3. Notifier l'utilisateur avec:
   - Nature du blocage
   - Fichiers/code concernés
   - Suggestions de résolution

**Ne JAMAIS improviser** une solution qui viole Clean Architecture ou les règles du projet.

---

## 📚 Ressources Clés

- `AGENTS.md` - **LECTURE OBLIGATOIRE**
- `docs/ARCHITECTURE.md` - Architecture détaillée
- `docs/COMBAT.md` - Règles de combat
- `.github/ISSUE_TEMPLATE/` - Templates d'issues

---

**GO! Commence maintenant l'analyse de l'issue #$1**
