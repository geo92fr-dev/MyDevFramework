# 📁 Scripts FunLearning V1.0

Ce dossier contient tous les scripts d'automatisation, validation et orchestration du projet FunLearning.

## 🤖 Orchestration Autonome

### `UTIL_dev_ia_orchestrator.js` - Cerveau Central
**Usage :** `npm run dev:ia`

L'orchestrateur principal qui implémente le système d'auto-apprentissage :
- 🧠 **Cerveau centralisé** pour tout le workflow de développement
- 🛡️ **Prévention proactive** avec gates de qualité par phase
- 📊 **Auto-apprentissage** via post-mortem automatique
- 🔄 **Orchestration complète** : CBD → Roadmap → Git → Qualité → Commit

**Workflow automatique :**
1. Validation CBD et conformité protocole
2. Vérification roadmap avec protection déviations
3. Synchronisation Git intelligente (si remote configuré)
4. Analyse qualité (ESLint, tests, sécurité)
5. Génération commit automatique si succès
6. Post-mortem et métriques d'amélioration continue

## 🔍 Scripts de Validation

### `VALID_cbd.js` - Validation Protocole CBD
**Usage :** `npm run validate:cbd`

Valide la conformité au protocole CBD (Collaboration-Based Development) :
- ✅ Structure des sections CBD
- 📋 Cohérence des workflows
- 🎯 Respect des standards de documentation
- 🔄 Intégration avec l'orchestrateur autonome

### `VALID_roadmap_compliance.js` - Protection Roadmap
**Usage :** `npm run validate:roadmap`

Système de protection contre les déviations non autorisées :
- 🗺️ **Détection phase courante** automatique
- 🚨 **Analyse d'impact** des déviations
- 📊 **Rapport détaillé** avec recommandations
- 🛡️ **Mode protection** activation automatique

**Phases supportées :**
- Phase 0: Setup & Architecture
- Phase 1: Firebase & Auth Google
- Phase 2: Contenu & Interface Dynamique
- Phase 3: Exercices & Progression
- Phase 4: PWA & Offline
- Phase 5: Admin & Import
- Phase 6: Polish & Performance

### `VALID_environment.js` - Validation Environnement
**Usage :** `npm run check:env`

Vérifie la configuration de l'environnement de développement :
- 🔧 Variables d'environnement requises
- 📦 Dépendances et versions
- ⚙️ Configuration Firebase
- 🛠️ Outils de développement

### `VALID_structure.js` - Validation Structure
**Usage :** `npm run check:structure`

Valide la structure du projet selon les standards :
- 📁 Arborescence des dossiers
- 📄 Fichiers critiques présents
- 🏗️ Convention de nommage
- 📚 Documentation requise

## 🐛 Scripts de Debug

### `DEBUG_info_collector.js` - Collecteur d'Informations
**Usage :** `npm run debug:info`

Collecte automatiquement les informations de diagnostic :
- 📊 État complet du projet
- 🔍 Métriques de performance
- 📝 Logs et erreurs
- 💾 Export pour analyse

## 📋 Templates et Standards

### `TEMPLATE_*.js` - Templates de Scripts
Modèles standardisés pour créer de nouveaux scripts :

- **`TEMPLATE_validation.js`** - Template validation
- **`TEMPLATE_utility.js`** - Template utilitaire
- **`TEMPLATE_debug.js`** - Template debug
- **`TEMPLATE_test.js`** - Template test

### `TEMPLATE_document.md` - Template Documentation
Modèle pour la documentation des scripts.

## 🚀 Utilisation Rapide

### Workflow Développement Autonome
```bash
# Une commande pour tout orchestrer
npm run dev:ia

# OU workflow manuel étape par étape
npm run validate:cbd          # Validation CBD
npm run validate:roadmap      # Protection roadmap  
npm run check:env            # Vérification environnement
npm run lint                 # Analyse code
npm run test:coverage        # Tests avec couverture
```

### Validation Complète
```bash
# Validation complète du projet
npm run check:all

# Debug et diagnostic
npm run debug:info
```

## 📊 Métriques et Auto-apprentissage

L'orchestrateur génère automatiquement :
- **📈 Métriques de performance** par phase
- **📝 Post-mortem automatique** dans `LOG_POSTMORTEM.md`
- **🔄 Recommandations d'amélioration** basées sur l'historique
- **📊 Tracking progression** qualité/conformité

## 🛡️ Gates de Qualité par Phase

Chaque phase a des seuils configurables dans `CONFIG_quality_gates.json` :
- **Complexité code** (Cyclomatic complexity)
- **Couverture tests** (Line & branch coverage)
- **Sécurité** (Vulnérabilités autorisées)
- **Performance** (Lighthouse scores)
- **Standards** (ESLint, Prettier, TypeScript)

## 🔧 Configuration et Personnalisation

### Variables d'Environnement
```env
# Niveaux de log pour l'orchestrateur
DEV_IA_LOG_LEVEL=info|debug|warning|error

# Configuration gates de qualité
QUALITY_GATES_STRICT=true|false

# Mode apprentissage automatique
AUTO_LEARNING_ENABLED=true
```

### Hooks Git
Les scripts s'intègrent avec les hooks Git :
- **pre-commit** : Validation CBD + Roadmap
- **pre-push** : Gates de qualité complets

## 📚 Best Practices

### Création de Nouveaux Scripts
1. **Utiliser les templates** appropriés dans `TEMPLATE_*.js`
2. **Suivre la convention** de nommage : `CATEGORY_name.js`
3. **Intégrer dans package.json** avec un script npm
4. **Documenter** dans ce README

### Catégories de Scripts
- **`VALID_`** : Scripts de validation et vérification
- **`UTIL_`** : Scripts utilitaires et orchestration
- **`DEBUG_`** : Scripts de debug et diagnostic
- **`TEMPLATE_`** : Modèles et templates

### Integration avec l'Orchestrateur
Pour qu'un script soit orchestré automatiquement :
1. L'ajouter dans `UTIL_dev_ia_orchestrator.js`
2. Configurer les seuils dans `CONFIG_quality_gates.json`
3. Tester avec `npm run dev:ia`

## 🤝 Contribution

Avant d'ajouter un nouveau script :
1. **Vérifier** qu'il n'existe pas déjà
2. **Utiliser** les templates appropriés
3. **Tester** l'intégration avec l'orchestrateur
4. **Mettre à jour** cette documentation

## 🎯 Evolution Future

Le système d'auto-apprentissage permet :
- **📈 Amélioration continue** des seuils qualité
- **🤖 Optimisation automatique** des workflows
- **🧠 Intelligence adaptative** selon le contexte projet
- **🔮 Prédiction** des problèmes potentiels

---

*Documentation générée pour FunLearning V1.0 - Système d'orchestration autonome avec auto-apprentissage*
