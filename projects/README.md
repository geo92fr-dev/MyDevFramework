#  PROJECTS - Projets Archivés et Références

##  Organisation Projets Framework

Ce dossier contient tous les projets qui ont contribué au développement du framework personnel.

##  Structure

###  Learning Project
```
learning-project/
 src/                    # Code source Svelte complet
 scripts/                # Scripts intelligence (orchestrateur, validation)
 tests/                  # Suite tests complète
 roadmap/                #  RÉFÉRENCES TECHNIQUES DÉTAILLÉES
    references/         # Patterns implémentés
       auth/          # Authentification Firebase
       data/          # Types et gestion données  
       ui/            # Composants et patterns UI
       testing/       # Stratégies tests
    implementations/    # Implémentations par phase
    guides/            # Guides développement
 ROADMAP_LEARNING.md     # Roadmap projet spécifique
 README.md              # Documentation complète
```

##  Utilisation dans Framework

### Extraction de Patterns
```bash
# Identifier nouveau pattern dans learning-project
fw analyze projects/learning-project/src/lib/

# Extraire vers snippets framework
fw snippet extract "projects/learning-project/src/lib/Component.svelte" "component-name"

# Créer template depuis implémentation
fw template create "projects/learning-project/" "new-template-name"
```

### Références Techniques
```bash
# Consulter références auth
Get-Content projects/learning-project/roadmap/references/auth/firebase-auth.md

# Explorer patterns UI
Get-Content projects/learning-project/roadmap/references/ui/component-patterns.md

# Étudier stratégie tests
Get-Content projects/learning-project/roadmap/references/testing/testing-strategy.md
```

##  Valeur pour Framework

### Learning Project = Référentiel Vivant
-  **Implémentations réelles** de tous patterns framework
-  **Documentation technique** détaillée par domaine
-  **Code source complet** pour validation patterns
-  **Tests complets** prouvant efficacité approche

### Roadmap Structure = Gold Mine
-  **Références techniques** réutilisables (`roadmap/references/`)
-  **Implémentations phased** (`roadmap/implementations/`)
-  **Guides pratiques** (`roadmap/guides/`)
-  **Stratégies validation** (`roadmap/references/testing/`)

##  Évolution Future

### Nouveaux Projets
Chaque nouveau projet framework important sera archivé ici avec:
- Code source préservé
- Documentation patterns spécifiques  
- Références techniques extraites
- Contribution évolution framework

### Pattern Mining
Utiliser `learning-project/roadmap/references/` comme source pour:
- Créer nouveaux snippets framework
- Développer templates avancés
- Documenter best practices
- Valider approches techniques

**Les projets archivés ici sont le PATRIMOINE TECHNIQUE du framework !**
