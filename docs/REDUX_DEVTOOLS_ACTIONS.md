# Redux DevTools - Actions Reference

Ce document liste toutes les actions Zustand disponibles dans Redux DevTools pour faciliter le debugging.

## 🎮 Combat Actions (`combatSlice`)

### Gestion du Combat
- **`combat/startCombat`** - Démarre un nouveau combat
- **`combat/endCombat`** - Termine le combat et persiste les changements au personnage
- **`combat/cancelCombat`** - Annule le combat sans sauvegarder
- **`combat/setAnimating`** - Contrôle l'état d'animation

### Exécution d'Actions
- **`combat/executeAction/attack`** - Attaque du joueur
- **`combat/executeAction/use_item`** - Utilisation d'objet
- **`combat/executeAction/spend_chance`** - Dépense de points de CHANCE
- **`combat/executeAction/flee`** - Fuite du combat

### Séquences d'Animation (Joueur)
- **`combat/showResult`** - Affiche le résultat du jet de dés
- **`combat/showDamage`** - Affiche l'indicateur de dégâts
- **`combat/clearDamage`** - Nettoie l'animation de dégâts
- **`combat/idleNoDamage`** - Retour à l'état idle (pas de dégâts)

### Séquences d'Animation (Ennemi)
- **`combat/enemyAttack`** - Attaque automatique de l'ennemi
- **`combat/enemyResult`** - Résultat du jet de l'ennemi
- **`combat/enemyDamage`** - Dégâts infligés au joueur
- **`combat/enemyClearDamage`** - Nettoie l'animation de dégâts ennemis
- **`combat/enemyIdleNoDamage`** - Retour idle ennemi (raté)

### Gestion d'Erreurs
- **`combat/error`** - Erreur pendant l'exécution du combat

---

## 👤 Character Actions

### Stats (`characterStatsSlice`)
- **`character/updateStats`** - Met à jour les statistiques du personnage
- **`character/applyDamage`** - Applique des dégâts
- **`character/heal`** - Soigne le personnage

### CRUD (`characterMutationSlice`)
- **`character/createCharacter:start`** - Début création personnage
- **`character/createCharacter:success`** - Personnage créé avec succès
- **`character/createCharacter:error`** - Erreur de création
- **`character/deleteCharacter:start`** - Début suppression
- **`character/deleteCharacter:success`** - Personnage supprimé
- **`character/deleteCharacter:error`** - Erreur de suppression

### Chargement (`characterListSlice`)
- **`character/loadAll:start`** - Début chargement tous les personnages
- **`character/loadAll:success`** - Personnages chargés
- **`character/loadAll:error`** - Erreur de chargement
- **`character/loadOne:start`** - Début chargement d'un personnage
- **`character/loadOne:success`** - Personnage chargé
- **`character/loadOne:notFound`** - Personnage non trouvé
- **`character/loadOne:error`** - Erreur de chargement

---

## 🎒 Inventory Actions (`characterInventorySlice`)

### Équipement
- **`inventory/equipWeapon`** - Équipe une arme
- **`inventory/unequipWeapon`** - Déséquipe l'arme

### Items
- **`inventory/addItemFromCatalog`** - Ajoute un item depuis le catalogue
- **`inventory/addItem`** - Ajoute un item personnalisé
- **`inventory/removeItem`** - Supprime un item
- **`inventory/consumeItem`** - Consomme un item (réduit quantité de 1)

### Monnaie
- **`inventory/addBoulons`** - Ajoute des boulons
- **`inventory/removeBoulons`** - Retire des boulons
- **`inventory/setBoulons`** - Définit le montant exact de boulons

---

## 📝 Metadata Actions (`characterMetadataSlice`)

### Informations Générales
- **`metadata/updateName`** - Change le nom du personnage
- **`metadata/updateBook`** - Change le tome actuel
- **`metadata/updateNotes`** - Met à jour les notes du joueur
- **`metadata/updateSecondTalent`** - Définit le second talent

### Progression
- **`metadata/goToParagraph`** - Navigue vers un paragraphe
- **`metadata/updateDaysElapsed`** - Met à jour les jours écoulés
- **`metadata/updateNextWakeUpParagraph`** - Définit le paragraphe de réveil

---

## 📦 Catalog Actions (`itemsCatalogSlice`)

- **`catalog/createCustomItem`** - Crée un objet personnalisé
- **`catalog/removeCustomItem`** - Supprime un objet personnalisé

---

## 🔍 Comment Utiliser Redux DevTools

### Installation
1. Installer l'extension [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd) pour Chrome/Edge/Firefox
2. Ouvrir l'onglet Redux dans les DevTools du navigateur

### Navigation
- **Actions** : Liste chronologique de toutes les actions
- **State** : État global du store après chaque action
- **Diff** : Différences entre l'état avant/après l'action
- **Trace** : Stack trace de l'action (si activé)

### Fonctionnalités Utiles
- **Time Travel** : Cliquer sur une action pour "voyager" dans l'état à ce moment
- **Skip** : Ignorer une action dans le replay
- **Jump** : Aller directement à un état
- **Export/Import** : Sauvegarder et rejouer des scénarios de test

### Debugging d'un Combat
1. Démarrer un combat → Voir `combat/startCombat`
2. Attaquer → Voir `combat/executeAction/attack`
3. Observer les phases d'animation :
   - `combat/showResult` (dés)
   - `combat/showDamage` (dégâts)
   - `combat/enemyAttack` (tour ennemi)
4. Terminer → `combat/endCombat`

### Debugging de l'Inventaire
1. Ajouter un item → `inventory/addItemFromCatalog`
2. Équiper une arme → `inventory/equipWeapon`
3. Utiliser en combat → `combat/executeAction/use_item`
4. Consommer → `inventory/consumeItem`

---

## 📊 Patterns de Nommage

### Format Général
```
<domaine>/<action>[:<statut>]
```

### Exemples
- **Synchrone** : `combat/setAnimating`, `inventory/equipWeapon`
- **Asynchrone avec statut** : `character/createCharacter:start/success/error`
- **Action dynamique** : `combat/executeAction/[type]` où `[type]` = attack, use_item, etc.

### Domaines
- **`combat`** : Combat V3
- **`character`** : Gestion des personnages (CRUD + chargement)
- **`inventory`** : Inventaire et équipement
- **`metadata`** : Métadonnées du personnage
- **`catalog`** : Catalogue d'objets

---

## ⚠️ Notes Importantes

1. **Action Names sont obligatoires** : Chaque appel à `set()` DOIT avoir un nom d'action en 3ème paramètre
2. **Format cohérent** : Utiliser `domaine/action` (pas de caractères spéciaux sauf `:` et `/`)
3. **Statuts asynchrones** : Utiliser `:start`, `:success`, `:error` pour les actions async
4. **Tests** : Les tests doivent vérifier le nom d'action exact

### Exemple de Code
```typescript
// ✅ Correct
set({ isAnimating: true }, false, 'combat/setAnimating');

// ❌ Incorrect (pas de nom)
set({ isAnimating: true });

// ❌ Incorrect (nom non descriptif)
set({ isAnimating: true }, false, 'anonymous');
```

---

## 🚀 Ajout d'une Nouvelle Action

1. **Définir l'action** dans le slice
2. **Nommer l'action** dans l'appel `set()`
3. **Mettre à jour ce document** avec le nouveau nom
4. **Tester** que le nom apparaît correctement dans Redux DevTools

### Template
```typescript
myNewAction: async (id: string) => {
  const character = get().characters[id];
  if (!character) return;

  try {
    const updated = await service.doSomething(id);
    set((state) => ({
      characters: { ...state.characters, [id]: updated },
    }), false, 'domain/myNewAction'); // ← Nom ici
  } catch (error) {
    handleSliceError(set, error);
    throw error;
  }
},
```

---

**Dernière mise à jour** : 21 janvier 2026  
**Version** : Combat V3 Migration Complete
