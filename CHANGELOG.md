# [4.2.0](https://github.com/bertrandgressier/adventure-tome/compare/v4.1.0...v4.2.0) (2026-01-12)


### Bug Fixes

* add fallbackName to preserve unknown item names during v11 migration ([41f87aa](https://github.com/bertrandgressier/adventure-tome/commit/41f87aadc340b237f2b077157918c5dee66fd9c9))
* **build:** resolve Inventory constructor call for new format ([838a062](https://github.com/bertrandgressier/adventure-tome/commit/838a062e482b051b635e40c17a31934dd0f5171f))
* correct GetState type in characterListSlice ([e42cdf2](https://github.com/bertrandgressier/adventure-tome/commit/e42cdf24de10fae0f42121674e81eb1fdaf31b72))
* implement custom items persistence and remove code duplication ([5e90e19](https://github.com/bertrandgressier/adventure-tome/commit/5e90e19022e2776073bb203bda701036a7cee518))
* update tests and linter for itemsCatalog refactoring ([cc3adf5](https://github.com/bertrandgressier/adventure-tome/commit/cc3adf56626ad258aea1e660b67ef6dca3381344))


### Features

* **inventory:** add InventoryItemRef type for catalog-based inventory ([0c1915f](https://github.com/bertrandgressier/adventure-tome/commit/0c1915f5d7a2d8668df3863e9c65c135b81d512d)), closes [#54](https://github.com/bertrandgressier/adventure-tome/issues/54)

# [4.1.0](https://github.com/bertrandgressier/adventure-tome/compare/v4.0.0...v4.1.0) (2026-01-06)


### Features

* unifier la gestion des armes avec AddItemModal ([#45](https://github.com/bertrandgressier/adventure-tome/issues/45)) ([3f3a9e3](https://github.com/bertrandgressier/adventure-tome/commit/3f3a9e3b26044ac6a72d2a1620ff42b02417504a))

# [4.0.0](https://github.com/bertrandgressier/adventure-tome/compare/v3.4.1...v4.0.0) (2026-01-06)


### Code Refactoring

* enforce Clean Architecture with DRY patterns ([d22231a](https://github.com/bertrandgressier/adventure-tome/commit/d22231add70f2535afdbfc7ecbf852c67cabccc4))


### BREAKING CHANGES

* Business logic removed from UI components

- Create DiceService for random generation (centralized Math.random)

- Add withChanges() helper in Character entity (DRY)

- Add handleSliceError() helper in sliceHelpers (DRY)

- Add setBoulons() coordination logic in slice

- Refactor app/characters/new/page.tsx (remove 28 lines)

- Refactor CharacterProgress component (remove 10 lines)

- Update documentation (AGENTS.md, ARCHITECTURE.md, README.md)

- Delete obsolete files

Test results: 293/293 pass (13 new DiceService tests)

## [3.4.1](https://github.com/bertrandgressier/adventure-tome/compare/v3.4.0...v3.4.1) (2026-01-05)


### Bug Fixes

* **lint:** resolve ESLint errors in test files ([37bc230](https://github.com/bertrandgressier/adventure-tome/commit/37bc23078f987de8c4b01f0d77c545bd28cb7404))

# [3.4.0](https://github.com/bertrandgressier/adventure-tome/compare/v3.3.0...v3.4.0) (2026-01-05)


### Features

* **ui:** adapt AddWeaponModal to use catalog with manual fallback ([ba28f25](https://github.com/bertrandgressier/adventure-tome/commit/ba28f259686e66fa93b66d738cafc5714044899f)), closes [#23](https://github.com/bertrandgressier/adventure-tome/issues/23)

# [3.3.0](https://github.com/bertrandgressier/adventure-tome/compare/v3.2.0...v3.3.0) (2026-01-05)


### Bug Fixes

* **inventory:** prevent adding bourse and weapons to inventory ([ea11315](https://github.com/bertrandgressier/adventure-tome/commit/ea11315d671369ced649fbd144ebd86b5a958194))


### Features

* **inventory:** add catalog item selection modal ([dd9bb0d](https://github.com/bertrandgressier/adventure-tome/commit/dd9bb0db674157d97426d00de523e6f1315c36f2))
* **inventory:** add tome filter with auto-selection ([4999259](https://github.com/bertrandgressier/adventure-tome/commit/4999259782b6c32354e1c6537e6108437069224a))

# [3.2.0](https://github.com/bertrandgressier/adventure-tome/compare/v3.1.0...v3.2.0) (2026-01-03)


### Bug Fixes

* update CharacterDTO to match new InventoryItem interface ([404861e](https://github.com/bertrandgressier/adventure-tome/commit/404861ed1d9d1adf0f2579884266750c807e578a))
* update characterInventorySlice to use new InventoryItem type ([9fc99ac](https://github.com/bertrandgressier/adventure-tome/commit/9fc99ac22a8be8fe21905fd512709b7f36e2bb89))
* update CharacterService.addItemToInventory signature ([85e8587](https://github.com/bertrandgressier/adventure-tome/commit/85e858768cdd2b30cd890f4f94b967ea2a78cce8))


### Features

* **data:** create item catalog with 47 items and migration v10 ([a1cb7fd](https://github.com/bertrandgressier/adventure-tome/commit/a1cb7fd9baa0d1bc9c25debcfa31625f6e6261dd)), closes [#19](https://github.com/bertrandgressier/adventure-tome/issues/19)
* **inventory:** add visual item type badges and quick actions overlay ([dd7fb1c](https://github.com/bertrandgressier/adventure-tome/commit/dd7fb1c3a66721cce7153f6d91c8fc9c18b7f604)), closes [#20](https://github.com/bertrandgressier/adventure-tome/issues/20)

# [3.1.0](https://github.com/bertrandgressier/adventure-tome/compare/v3.0.1...v3.1.0) (2026-01-01)


### Features

* **talent:** add second talent for Tome 2+ characters ([3450a76](https://github.com/bertrandgressier/adventure-tome/commit/3450a7658149483bc896e7d3c7db4f6c0e00d66c))

## [3.0.1](https://github.com/bertrandgressier/adventure-tome/compare/v3.0.0...v3.0.1) (2025-12-29)


### Bug Fixes

* iOS installation button detection (fixes [#12](https://github.com/bertrandgressier/adventure-tome/issues/12)) ([8bfaa73](https://github.com/bertrandgressier/adventure-tome/commit/8bfaa734762cc9ef149b7a6500e1a43c9344bc0a))
* **issue-14:** adjust current health when max health is reduced ([0c0283b](https://github.com/bertrandgressier/adventure-tome/commit/0c0283b69dc96c0a71cfa3c521fda1024285e5b2))

# [3.0.0](https://github.com/bertrandgressier/adventure-tome/compare/v2.2.1...v3.0.0) (2025-11-19)


### Bug Fixes

* add aria-describedby to DialogContent for accessibility compliance ([c8494cd](https://github.com/bertrandgressier/adventure-tome/commit/c8494cdc11b33b9bf65b1c8d3a333cf79442ffac))
* correct reputation initialization and serialization ([cbf61c9](https://github.com/bertrandgressier/adventure-tome/commit/cbf61c9532b1377bf4ca262e3c70938ba4ab9092))
* improve mobile responsiveness for book selection dialog ([165f9fe](https://github.com/bertrandgressier/adventure-tome/commit/165f9fe3a0e6bca5609e3dc3286fb943dd88b943))
* improve mobile responsiveness for Combat and Dice buttons ([606002b](https://github.com/bertrandgressier/adventure-tome/commit/606002b062cf3d80fb232d3ab636268516ce1d5d))
* improve reset UX for time tracking gauge ([302b87e](https://github.com/bertrandgressier/adventure-tome/commit/302b87e993272dd6eac1032807a47d24b205d433))
* improve time tracking gauge UX ([91fa686](https://github.com/bertrandgressier/adventure-tome/commit/91fa686b14f01170caa13599dddcfb76f32472bb))
* **lint:** add eslint-disable for necessary any types in migrations ([ffba496](https://github.com/bertrandgressier/adventure-tome/commit/ffba496f75b83d4b4fc67cc2e2f3417627926147))
* **lint:** ignore coverage and test-results in ESLint config ([2bf2fec](https://github.com/bertrandgressier/adventure-tome/commit/2bf2fec7eb1deedbdb18324841bb462e9c5f2428))
* replace "Modifier" text with Pencil icon in CharacterNotes ([fdb21c6](https://github.com/bertrandgressier/adventure-tome/commit/fdb21c617d57d8b4b684da38f0bd7bb780020fd2))
* replace emoji + buttons with lucide-react Plus icon ([2da9823](https://github.com/bertrandgressier/adventure-tome/commit/2da98238fa7e7635ead022b3a1ddf252e88945e7))
* use standard markdown list syntax in user changelog ([edd6163](https://github.com/bertrandgressier/adventure-tome/commit/edd6163b5b2db5d7ae1001ffe998529e33427d21))


### Code Refactoring

* **inventory:** remove item possession toggle feature ([3aeb559](https://github.com/bertrandgressier/adventure-tome/commit/3aeb55930586fff819a0f9b3df5575bfab9e30a1))


### Features

* add reputation system for Tome 2 ([d949108](https://github.com/bertrandgressier/adventure-tome/commit/d9491085d1ba53ef20f9f09933ef77ecf267a6f3))
* add reset button (0) to time tracking gauge ([1b7c3a4](https://github.com/bertrandgressier/adventure-tome/commit/1b7c3a476dd5823110e81cceace5237e24915992))
* add time tracking for Tome 2 (days elapsed and next wake up) ([a7062d8](https://github.com/bertrandgressier/adventure-tome/commit/a7062d8082afc435a2fb9cccc675208d82457c21))
* **data:** migrate book from string to number + conditional Constitution display ([c1dd952](https://github.com/bertrandgressier/adventure-tome/commit/c1dd9527bd676164c96690f9908d02a50bfc1bac))
* **domain:** add gameMode and version to Character entity ([cf91a94](https://github.com/bertrandgressier/adventure-tome/commit/cf91a949a6c1c0875f6193afd3c63a7faa17d8b3))
* **domain:** add optional constitution stat for tome 2 & 3 ([0e2f140](https://github.com/bertrandgressier/adventure-tome/commit/0e2f140f91f2e14f012971679c6a409b3dcb2a1e))
* **infrastructure:** add data migration system ([0b2a0ff](https://github.com/bertrandgressier/adventure-tome/commit/0b2a0ff2119b79340b8e08825df6286aabea915e))
* **infrastructure:** integrate auto-migration in repository ([b478797](https://github.com/bertrandgressier/adventure-tome/commit/b478797dd4d6e56db3e2e4cd2debe1dcded8e63d))
* make day circles clickable in time tracking gauge ([48c4593](https://github.com/bertrandgressier/adventure-tome/commit/48c4593ac6443e4a4fa1e2bb603ac23b998f063e))
* **ui:** add game mode selection in character creation ([a170622](https://github.com/bertrandgressier/adventure-tome/commit/a170622aa3dc6d8b525f9f28b89975daa2558f3c))
* **ui:** add interactive game mode info dialog on character list ([7afb20f](https://github.com/bertrandgressier/adventure-tome/commit/7afb20f5e70e2de8987b03619240ec737e577bfc))
* **ui:** display game mode badge on character list and detail pages ([c03e9e8](https://github.com/bertrandgressier/adventure-tome/commit/c03e9e884c138b5e93c1f8cef66a07471236465c))
* **ui:** remove 'Caractéristiques' title from character detail page ([9c3fe40](https://github.com/bertrandgressier/adventure-tome/commit/9c3fe4056483b23d838a3f3dd967615d58048619))
* **ui:** reorganize character stats layout ([bda336a](https://github.com/bertrandgressier/adventure-tome/commit/bda336a1dc23a7a50e1a54ebd1b8415dd514aaec))


### BREAKING CHANGES

* **inventory:** Items no longer have toggleable possession state
* **data:** Existing characters with book strings will be auto-migrated to numbers on load

## [2.2.1](https://github.com/bertrandgressier/adventure-tome/compare/v2.2.0...v2.2.1) (2025-11-19)


### Bug Fixes

* correct user changelog generation regex for header levels ([433c57e](https://github.com/bertrandgressier/adventure-tome/commit/433c57e42ec629026eb1896016c07307f5402843))
* **home:** improve character list design for mobile ([1afc8e4](https://github.com/bertrandgressier/adventure-tome/commit/1afc8e4f1490db3af2215fec4ad80507d02420cc))
* **ui:** improve visual distinction for critical health and death states ([f09f706](https://github.com/bertrandgressier/adventure-tome/commit/f09f70630f6a74ff947dff5a1c6ed0eeb4e32430))
* **ui:** update character detail stats to match home screen design ([95049e1](https://github.com/bertrandgressier/adventure-tome/commit/95049e159883ac6715bff015bf1bf52138fe5f4c))

# [2.2.0](https://github.com/bertrandgressier/adventure-tome/compare/v2.1.0...v2.2.0) (2025-11-19)


### Features

* add character notebook feature with persistence ([7c3a27e](https://github.com/bertrandgressier/adventure-tome/commit/7c3a27ecb012b2b4b49d163b2939e7f8e9419987))
* improve user changelog generation and link ([525a24d](https://github.com/bertrandgressier/adventure-tome/commit/525a24d9c467361a2dd9e5a53d1acf827d4c04d1))

# [2.1.0](https://github.com/bertrandgressier/adventure-tome/compare/v2.0.0...v2.1.0) (2025-11-19)


### Bug Fixes

* apply code review recommendations ([a96bbbd](https://github.com/bertrandgressier/adventure-tome/commit/a96bbbdb7aa60de34ac76591e043f0da8e3e6bdd))
* **characters:** use store for creation to ensure list update and improve redirect ([7d9e4ef](https://github.com/bertrandgressier/adventure-tome/commit/7d9e4ef63340c0ed7369c246b58368af8080ecc8))
* correct broken emojis in README ([47ffef7](https://github.com/bertrandgressier/adventure-tome/commit/47ffef70415fde0fba58dbfc9a0429f5e5182f21))
* translate error messages to French ([2df913c](https://github.com/bertrandgressier/adventure-tome/commit/2df913c36a2576541ae71ec718ffb804bebdb9b4))
* **ui:** remove redundant wrapper around boulons stat field ([eba2aa0](https://github.com/bertrandgressier/adventure-tome/commit/eba2aa0e120df333fe4dd696d07ec41b125263a6))


### Features

* **ci:** enhance codecov integration with badge, graph and config ([8ce6199](https://github.com/bertrandgressier/adventure-tome/commit/8ce6199ca63eecf29f30496d47eedbcdf46626f5))
* **ui:** allow changing book from paragraph section with dialog ([218e638](https://github.com/bertrandgressier/adventure-tome/commit/218e638c16dec14e3d512c10fc168656b4054468))

# [2.0.0](https://github.com/bertrandgressier/adventure-tome/compare/v1.7.0...v2.0.0) (2025-11-18)


### Bug Fixes

* **changelog:** escape asterisk in regex pattern ([0e9876c](https://github.com/bertrandgressier/adventure-tome/commit/0e9876c22400af1978213af0694a3e1e81046e80))
* **ci:** remove --from-stdin flag for commitlint v20 ([e896c7a](https://github.com/bertrandgressier/adventure-tome/commit/e896c7a760a996d6a301e22021ae8c9c01dcfbc7))
* **ci:** use .mjs extension for ESM script ([f705064](https://github.com/bertrandgressier/adventure-tome/commit/f7050645439fe665813225e1f7267a04fc14b597))
* **ci:** use pnpm exec commitlint from package.json deps ([f60df99](https://github.com/bertrandgressier/adventure-tome/commit/f60df990f946a8bbec809ca05972d5f7b6b5c15d))
* **lint:** convert changelog script to ESM ([ca6c41a](https://github.com/bertrandgressier/adventure-tome/commit/ca6c41a65bfc292a7243fbeb92ecc27e7240e247))
* **navigation:** move router.push to useEffect to avoid setState during render ([bcebbaf](https://github.com/bertrandgressier/adventure-tome/commit/bcebbafe04d2c8519ad85c16f5755ce5d3a7ec90))
* **store:** add hasInitialLoad flag to prevent race condition on page reload ([70ca17c](https://github.com/bertrandgressier/adventure-tome/commit/70ca17cd3baff2170e30a9936b39d5947972c0ee))


### Code Refactoring

* migrate lib/ to src/ for Clean Architecture consistency ([d71bdd5](https://github.com/bertrandgressier/adventure-tome/commit/d71bdd56cb1fa739ed16483c828d101bdd673172))
* reorganize project structure to follow Next.js best practices ([ab272ae](https://github.com/bertrandgressier/adventure-tome/commit/ab272ae16b66138df6f8288063487c31231fef5f))


### Features

* **application:** add character service with use cases ([6e29a57](https://github.com/bertrandgressier/adventure-tome/commit/6e29a57a0edbe52a08390d82e35a2e356024aba4))
* **domain:** implement clean architecture domain layer ([893dcc4](https://github.com/bertrandgressier/adventure-tome/commit/893dcc4ca35d17c80b4b8e2f17a8fe62e3d8fa51))
* implémentation de Zustand pour la gestion d'état centralisée ([40fc880](https://github.com/bertrandgressier/adventure-tome/commit/40fc880e6bad598d3ab412f98e0a088f88136c43))
* **infrastructure:** add IndexedDB repository adapter ([4663d88](https://github.com/bertrandgressier/adventure-tome/commit/4663d88127546cc391a6d448d45cb6d0cd8df814))
* **presentation:** add useCharacter hook and refactored components ([a682f88](https://github.com/bertrandgressier/adventure-tome/commit/a682f889bcc9b30e617a29357f0212d75738dee9))


### BREAKING CHANGES

* All lib/ imports now use @/src/* except @/lib/utils
* Component imports now use @/components instead of @/app/components
* **domain:** None - Data structure 100% compatible with existing IndexedDB schema

# [1.7.0](https://github.com/bertrandgressier/adventure-tome/compare/v1.6.0...v1.7.0) (2025-11-17)


### Features

* affichage fantomatique des personnages morts et simplification popup défaite ([5f0927c](https://github.com/bertrandgressier/adventure-tome/commit/5f0927c4315b1cdf98b095de69fb6bb398568621)), closes [#3d1f1f](https://github.com/bertrandgressier/adventure-tome/issues/3d1f1f)
* ajout composant BookTag pour identifier les 3 livres de la saga ([013db6b](https://github.com/bertrandgressier/adventure-tome/commit/013db6ba8791bbb4a6b1b1d00e3373b32ead7021))

# [1.6.0](https://github.com/bertrandgressier/adventure-tome/compare/v1.5.1...v1.6.0) (2025-11-14)


### Features

* ajout du lien de donation PayPal ([2f923ab](https://github.com/bertrandgressier/adventure-tome/commit/2f923abdcc65f81500d9d066978a03bf60db288a))

## [1.5.1](https://github.com/bertrandgressier/adventure-tome/compare/v1.5.0...v1.5.1) (2025-11-14)


### Bug Fixes

* retirer autoFocus du formulaire de combat pour mobile ([111370c](https://github.com/bertrandgressier/adventure-tome/commit/111370cf9b507bb78dbf8803e0d2a6d559872f80))

# [1.5.0](https://github.com/bertrandgressier/adventure-tome/compare/v1.4.4...v1.5.0) (2025-11-14)


### Features

* **analytics:** add custom event tracking for user actions ([dfab43e](https://github.com/bertrandgressier/adventure-tome/commit/dfab43e6d12d974b557a72dc73b43fe9cfdb7175))

## [1.4.4](https://github.com/bertrandgressier/adventure-tome/compare/v1.4.3...v1.4.4) (2025-11-14)


### Bug Fixes

* **lint:** move localStorage read to useState initializer ([e589395](https://github.com/bertrandgressier/adventure-tome/commit/e5893957b5277612af7ae9de81658209563c793a))
* **music:** prevent incorrect playing state on first load ([0645dec](https://github.com/bertrandgressier/adventure-tome/commit/0645decad2b06bf687402a6ac5d27ca06a20040a))

## [1.4.3](https://github.com/bertrandgressier/adventure-tome/compare/v1.4.2...v1.4.3) (2025-11-14)


### Bug Fixes

* **analytics:** simplify Google Analytics implementation ([c2ea552](https://github.com/bertrandgressier/adventure-tome/commit/c2ea552e782cf95b7ea06a0868998a1b5b4a2523))
* **release:** preserve NEXT_PUBLIC_GA_ID in .env.production ([3f19568](https://github.com/bertrandgressier/adventure-tome/commit/3f19568b6006606705fcc3ca6298b338bd214e19))

## [1.4.2](https://github.com/bertrandgressier/adventure-tome/compare/v1.4.1...v1.4.2) (2025-11-14)


### Bug Fixes

* **ci:** make release depend on CI success ([ae8f748](https://github.com/bertrandgressier/adventure-tome/commit/ae8f7485df398c4e4ae9025a1c31ba5556fb66c0))
* wrap GoogleAnalytics in Suspense for useSearchParams ([aa458d0](https://github.com/bertrandgressier/adventure-tome/commit/aa458d06784cbf37941db34b945bc170780646ab))

## [1.4.1](https://github.com/bertrandgressier/adventure-tome/compare/v1.4.0...v1.4.1) (2025-11-14)


### Bug Fixes

* **analytics:** use NEXT_PUBLIC_GA_ID for proper client-side tracking ([76fda3c](https://github.com/bertrandgressier/adventure-tome/commit/76fda3cb20304f908fbb0b38cbb68490f8abce06))

# [1.4.0](https://github.com/bertrandgressier/adventure-tome/compare/v1.3.1...v1.4.0) (2025-11-14)


### Bug Fixes

* **ci:** setup pnpm before setup-node cache ([f49cce2](https://github.com/bertrandgressier/adventure-tome/commit/f49cce271c359704e100ed15113951425cee4476))


### Features

* **ci:** add manual trigger for release workflow ([7587813](https://github.com/bertrandgressier/adventure-tome/commit/75878137bda74a49f7acfe8f47dd10504255845f))


### Performance Improvements

* optimize CI build caching ([b00b80d](https://github.com/bertrandgressier/adventure-tome/commit/b00b80deff82b3e2106bcebeaebfaa4a915a8cad))

## [1.3.1](https://github.com/bertrandgressier/adventure-tome/compare/v1.3.0...v1.3.1) (2025-11-14)


### Bug Fixes

* icône musique affichée correctement au démarrage ([bad15ab](https://github.com/bertrandgressier/adventure-tome/commit/bad15ab2a8363ba84e0f8bbf842eac34913f4d60))

# [1.3.0](https://github.com/bertrandgressier/adventure-tome/compare/v1.2.0...v1.3.0) (2025-11-14)


### Bug Fixes

* génération correcte des tags Docker avec version ([d35f5c2](https://github.com/bertrandgressier/adventure-tome/commit/d35f5c2fa13e756cbc1a07d9ae866826e4fc5988))


### Features

* support Google Analytics avec injection runtime ([8dafaba](https://github.com/bertrandgressier/adventure-tome/commit/8dafaba3fe3f0b568d5e705afc827d31e864146c))

# [1.2.0](https://github.com/bertrandgressier/adventure-tome/compare/v1.1.1...v1.2.0) (2025-11-14)


### Features

* ajout lien vers CHANGELOG depuis la version ([47ec98c](https://github.com/bertrandgressier/adventure-tome/commit/47ec98c52088dbebd9f60561fe9dba1f5c5bff30))
* release uniquement sur changements du code applicatif ([6079fcd](https://github.com/bertrandgressier/adventure-tome/commit/6079fcdde89e16ec016981f97452717f933f6df5))

## [1.1.1](https://github.com/bertrandgressier/adventure-tome/compare/v1.1.0...v1.1.1) (2025-11-14)


### Bug Fixes

* séparation des workflows release et docker ([f42b44c](https://github.com/bertrandgressier/adventure-tome/commit/f42b44c4221f3927f11d5be34be7c08a599560e2))

# [1.1.0](https://github.com/bertrandgressier/adventure-tome/compare/v1.0.0...v1.1.0) (2025-11-14)


### Bug Fixes

* correction des titres en double et nettoyage ([b881191](https://github.com/bertrandgressier/adventure-tome/commit/b8811919de7bc04af6fda0cfa7bfbee4e831f038))
* corrections UI et ESLint ([be085c1](https://github.com/bertrandgressier/adventure-tome/commit/be085c1eb2a145df8063b52261f6bfddf2575699))


### Features

* ajout liens GitHub et signalement de bugs ([0da26bb](https://github.com/bertrandgressier/adventure-tome/commit/0da26bb8c1625701ff0fb24caf793e4a452611ec))

# 1.0.0 (2025-11-13)


### Bug Fixes

* apply dark theme to InstallPrompt component ([4440d0f](https://github.com/bertrandgressier/adventure-hero/commit/4440d0fec7a2ba17fbf7230bdba9536f9b98d72f))
* correct collection name to 'La Saga Dadga' ([22c5496](https://github.com/bertrandgressier/adventure-hero/commit/22c5496674644fa07f00a53bbeb7d7329fe13dc4))
* improve button readability with bold font and larger text ([4dced03](https://github.com/bertrandgressier/adventure-hero/commit/4dced039321dd9b1140722ef6f95260af19fdfee))
* make button visible with proper background and border ([0049fc6](https://github.com/bertrandgressier/adventure-hero/commit/0049fc62a5cdd262b1d6ccc5fd13d28185974c17))
* recreate character creation page from scratch ([e2f30fa](https://github.com/bertrandgressier/adventure-hero/commit/e2f30fad55c3a7625343eefa8aea186a84cba5fc))
* remove duplicate code causing parsing error ([e1debb6](https://github.com/bertrandgressier/adventure-hero/commit/e1debb643765767b948388ad0ce73b68cf26a950))
* remove starting equipment (not in book rules) ([b90c121](https://github.com/bertrandgressier/adventure-hero/commit/b90c1218affcee8e37a2b55be5486d3d85daaf9f))
* use explicit golden color for button background ([45ae90c](https://github.com/bertrandgressier/adventure-hero/commit/45ae90ca4242608c99792a693f00c7ebefa1dd7a))
* use pure black text on golden button for maximum contrast ([961b836](https://github.com/bertrandgressier/adventure-hero/commit/961b836fc4a58af63a8259124219ccd24bd3a712))


### Features

* add character creation page with dice rolling ([58aadb0](https://github.com/bertrandgressier/adventure-hero/commit/58aadb0e3b35f3a94aa2a63576c7fdec9bfe485a))
* character creation with correct talents and stats rules + manual mode ([657d94a](https://github.com/bertrandgressier/adventure-hero/commit/657d94a2a947ff2de59345fbbd771c25a8d41594))
* implement dark sepia theme with medieval styling ([4a6509b](https://github.com/bertrandgressier/adventure-hero/commit/4a6509b45e6718493dd4f630175bee5612a340a7)), closes [#1a140f](https://github.com/bertrandgressier/adventure-hero/issues/1a140f) [hi#contrast](https://github.com/hi/issues/contrast)
* improve character list presentation with better visibility ([bcd2795](https://github.com/bertrandgressier/adventure-hero/commit/bcd2795dcc1028f00c38a1f8609256702ebf59a9))
* IndexedDB storage for characters + display character list ([a463c0d](https://github.com/bertrandgressier/adventure-hero/commit/a463c0d4ee70189287828cfcdd215232f73a810e))
* mise en place semantic-release et CI/CD automatique ([4236270](https://github.com/bertrandgressier/adventure-hero/commit/42362707370125f0d2155a88aa40253b0f534b3b))
* update character creation with correct stats and talent selection ([c0fad1c](https://github.com/bertrandgressier/adventure-hero/commit/c0fad1cf412132a3336cb4c54a0655d8a5113f5a))
