# Adventure Tome - Guide des Commits

## Format des commits (Conventional Commits)

Pour que semantic-release fonctionne correctement, tous les commits doivent suivre le format :

```
<type>(<scope>): <description>

[corps optionnel]

[footer optionnel]
```

### Types de commits

- **feat**: Nouvelle fonctionnalité → version **MINOR** (0.1.0 → 0.2.0)
- **fix**: Correction de bug → version **PATCH** (0.1.0 → 0.1.1)
- **docs**: Changements de documentation uniquement
- **style**: Changements de formatage (espaces, virgules, etc.)
- **refactor**: Refactorisation sans changement de fonctionnalité
- **perf**: Amélioration de performance
- **test**: Ajout ou modification de tests
- **build**: Changements du système de build
- **ci**: Changements de la CI/CD
- **chore**: Autres changements (maintenance, etc.)

### Breaking Changes

Pour une version **MAJOR** (0.1.0 → 1.0.0), ajoutez `BREAKING CHANGE:` dans le footer :

```bash
feat: nouvelle API de combat

BREAKING CHANGE: l'ancienne API de combat a été supprimée
```

Ou utilisez `!` après le type :

```bash
feat!: nouvelle API de combat
```

### Exemples

```bash
# Nouvelle fonctionnalité (MINOR)
git commit -m "feat: ajout du système de magie"
git commit -m "feat(combat): ajout des sorts magiques"

# Correction de bug (PATCH)
git commit -m "fix: correction du calcul de dégâts"
git commit -m "fix(inventory): correction de la sauvegarde des objets"

# Breaking change (MAJOR)
git commit -m "feat!: refonte complète du système de combat"

# Autres types (pas de release)
git commit -m "docs: mise à jour du README"
git commit -m "style: formatage du code"
git commit -m "chore: mise à jour des dépendances"
```

### Scope (optionnel)

Le scope précise la partie du projet concernée :
- `combat`, `character`, `inventory`, `ui`, `storage`, `docker`, `ci`

### Multi-line commits

Pour des commits plus détaillés :

```bash
git commit -m "feat(combat): ajout du système de magie" -m "
- Sorts offensifs et défensifs
- Gestion du mana
- Interface de sélection des sorts
"
```

## Workflow avec semantic-release

1. **Développer** sur une branche feature
2. **Commit** avec le bon format
3. **Créer une PR** vers main
4. **Merge** la PR → semantic-release se déclenche automatiquement :
   - Analyse les commits
   - Détermine la nouvelle version
   - Génère le CHANGELOG.md
   - Crée un tag et une release GitHub
   - Build et push l'image Docker

## Validation

Le workflow `commitlint` vérifie automatiquement le format des PR titles.

## Ressources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Release](https://semantic-release.gitbook.io/)
