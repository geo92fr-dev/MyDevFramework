#  LEARNING PROJECT - Structure Complète Préservée

##  Architecture Projet Learning

Ce projet contient l'intégralité du projet FunLearning original qui a servi de base au framework personnel.

##  Structure Complète

###  Code Source
```
src/
 lib/               # Composants Svelte réutilisables
 routes/            # Pages et routes SvelteKit
 app.html           # Template HTML principal
 app.d.ts           # Déclarations TypeScript
```

###  Scripts Intelligence
```
scripts/
 UTIL_dev_ia_orchestrator.js    # Orchestrateur autonome
 VALID_*.js                     # Scripts validation
 TEMPLATE_*.js                  # Templates scripts
 README.md                      # Documentation scripts
```

###  Tests
```
tests/
 unit/              # Tests unitaires
 integration/       # Tests intégration
 e2e/              # Tests end-to-end
```

###  Roadmap & Références
```
roadmap/
 references/        # Références techniques réutilisables
    auth/         # Authentification Firebase
    data/         # Types et gestion données
    ui/           # Composants et patterns UI
    testing/      # Stratégies de tests
 implementations/   # Implémentations par phase
 guides/           # Guides développement
 README.md         # Documentation roadmap
```

###  Documentation Projet
```
 ROADMAP_LEARNING.md           # Roadmap spécifique projet
 package.json                  # Configuration projet
 README.md                     # Documentation projet
```

##  Relation avec Framework

### Ce Projet Contient
-  **Implémentations concrètes** de tous les patterns framework
-  **Références techniques détaillées** pour chaque fonctionnalité
-  **Code source complet** Svelte + Firebase
-  **Scripts d'intelligence** (orchestrateur, validation)
-  **Tests complets** (unit, intégration, e2e)

### Le Framework Utilise
-  Scripts core extraits vers `framework/tools/core-scripts/`
-  Templates généralisés vers `framework/templates/`
-  Patterns UI vers snippets framework
-  Méthodologies vers `framework/docs/`

##  Utilisation

### Étudier les Implémentations
```bash
# Explorer code source original
cd src && Get-ChildItem -Recurse

# Consulter références techniques  
cd roadmap/references && Get-ChildItem -Recurse

# Analyser scripts intelligence
cd scripts && Get-Content README.md
```

### Extraire Nouveaux Patterns
```bash
# Depuis racine framework
fw extract-pattern "chemin/vers/code" "nom-pattern"

# Créer snippet depuis implémentation
fw snippet add "nom-snippet" "projects/learning-project/src/lib/Component.svelte"
```

##  Valeur pour Framework

Ce projet est le **référentiel vivant** du framework :
-  **Documentation par l'exemple** : Chaque pattern framework a son implémentation concrète ici
-  **Banc de test** : Validation des templates et snippets framework
-  **Source d'extraction** : Nouveaux patterns identifiés et extraits depuis ce code
-  **Validation réaliste** : Framework testé sur projet complet et complexe

**Ce projet Learning est la "preuve de concept" vivante du framework !**
