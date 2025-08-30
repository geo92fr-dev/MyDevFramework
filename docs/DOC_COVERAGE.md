#  COVERAGE - Rapports de Couverture de Tests

##  Qu'est-ce que le dossier Coverage ?

Le dossier `coverage/` contient les **rapports de couverture de tests** générés automatiquement lors de l'exécution des tests avec analyse de couverture.

##  Contenu du dossier Coverage

```
coverage/
 index.html               Rapport HTML interactif
 coverage-final.json      Données couverture JSON
 clover.xml              Format Clover (CI/CD)
 base.css                Styles rapport HTML
 prettify.css            Coloration syntaxique
 prettify.js             JavaScript rapport
 block-navigation.js     Navigation dans le code
 sorter.js               Tri des métriques
 sort-arrow-sprite.png   Icônes interface
 favicon.png             Icône rapport
```

##  Génération Coverage

### Scripts de Test avec Coverage
```bash
# Test avec couverture complète
npm run test:coverage

# Test unitaires simples  
npm run test

# Test avec surveillance
npm run test:watch
```

### Outils Utilisés
- **Vitest** : Framework de tests
- **@vitest/coverage-v8** : Génération rapports couverture
- **V8 Coverage API** : Analyse couverture native

##  Métriques de Couverture

### Types de Couverture Mesurés
1. **Line Coverage** : % lignes de code exécutées
2. **Branch Coverage** : % branches conditionnelles testées
3. **Function Coverage** : % fonctions appelées
4. **Statement Coverage** : % déclarations exécutées

### Seuils Qualité (CONFIG_quality_gates.json)
```json
{
  "testing": {
    "coverage": {
      "lines": 80,
      "branches": 75,
      "functions": 80,
      "statements": 80
    }
  }
}
```

##  Utilisation des Rapports

### Rapport HTML Interactif
- Ouvrir `coverage/index.html` dans navigateur
- Navigation par fichier/dossier
- Code source avec coloration couverture
- Métriques détaillées par fonction

### Intégration CI/CD
- `clover.xml` : Format standard pour outils CI/CD
- `coverage-final.json` : Données pour scripts automatisation
- Hooks Git : Validation seuils avant push

##  Configuration Framework

### Dans package.json
```json
{
  "scripts": {
    "test:coverage": "vitest run --coverage",
    "check:coverage": "node tools/check-coverage.js"
  }
}
```

### Hooks Git (.husky)
```bash
# pre-push hook
npm run test:coverage
# Vérifie seuils avant autoriser push
```

##  Importance pour Framework

### Qualité Code
-  **Validation automatique** seuils qualité
-  **Détection code non testé** 
-  **Métriques évolution** couverture
-  **Reporting visuel** zones à améliorer

### Intégration Orchestrateur
L'orchestrateur autonome utilise coverage pour :
- Gates de qualité par phase
- Post-mortem automatique
- Recommandations amélioration
- Tracking progression tests

##  Pourquoi Pas dans Framework ?

Le dossier `coverage/` est **généré automatiquement** et ne doit pas être versionné :

```gitignore
# Test coverage (généré automatiquement)
coverage/
```

**Raisons :**
-  Contenu change à chaque exécution tests
-  Fichiers volumineux (HTML, JSON, assets)
-  Spécifique à environnement local
-  Rapports reproductibles sur toute machine

##  Best Practices

### Génération Régulière
```bash
# Avant chaque commit
npm run test:coverage

# Vérification qualité
npm run check:all  # Inclut coverage
```

### Analyse Rapports
1. **Ouvrir index.html** pour analyse visuelle
2. **Identifier fichiers < 80%** couverture
3. **Ajouter tests** pour code non couvert
4. **Valider seuils** avant push

**Le coverage est un outil ESSENTIEL de qualité, mais reste local à chaque projet !** 
