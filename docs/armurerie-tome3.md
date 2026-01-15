# Feature: Intégration des Armes Légendaires (Compendium Tome 3)

## Contexte
Ajout du contenu du "Compendium de l'Apprenti" (Tome 3). Sélection d'armes uniques modifiant la boucle de gameplay.

## Fonctionnalités Requises

### 1. Sélection de l'Arme (L'Armurerie)
- [ ] Ajouter une étape "L'Armurerie" (déclenchement via code/event).
- [ ] Sélection exclusive (1 parmi 5) remplaçant l'arme actuelle.

### 2. Liste des Armes et Implémentation

#### A. Lame de l'Aube Éternelle
**Description UI :** "Cette épée droite aux reflets dorés semble capturer la lumière du jour. Sa lame parfaitement équilibrée tranche l'air avec grâce."
* **Bonus :** +2 Dommages
* **Mécanique :** Sur un jet double (ex: 5 et 5), relance immédiate d'une attaque gratuite.

#### B. Marteau de la Terre
**Description UI :** "Forgé dans les métaux les plus rares des entrailles du Royaume, ce marteau de guerre massif résonne d'une puissance tellurique."
* **Bonus :** +1 Dommage
* **Mécanique :** À la mort d'un ennemi tué par l'arme, rend immédiatement 1 PV (max non dépassé).

#### C. Arc des Vents
**Description UI :** "Taillé dans le bois d'un arbre millénaire, cet arc élégant permet de tirer des flèches guidées par de la magie pure."
* **Bonus :** +1 Dommage
* **Mécanique :** En cas d'échec (Jet > Dextérité), possibilité de dépenser 1 CHANCE pour transformer en réussite automatique.

#### D. Dague des Ombres
**Description UI :** "Cette lame courbe et effilée absorbe la lumière autour d'elle. Maniée par les guerriers de la Confrérie, elle frappe là où on ne l'attend pas."
* **Bonus :** +1 Dommage
* **Mécanique :** Si attaque surprise ou ennemi non alerté : +2 Dommages supplémentaires sur la première attaque.

#### E. Bâton du Sage
**Description UI :** "Ce long bâton de combat sculpté est couvert de symboles mystiques qui courent le long de sa surface polie."
* **Bonus :** +1 Dommage
* **Mécanique :** Une fois par combat (Active), annule tous les dégâts reçus lors du tour ennemi.

## Assets
- [ ] Intégrer les textes d'ambiance ci-dessus.
- [ ] Placeholder ou icônes pour chaque type d'arme.