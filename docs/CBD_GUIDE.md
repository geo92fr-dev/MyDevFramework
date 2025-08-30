# 🤖 CBD System - Check Before Doing

## Installation et Configuration

### 1. Installation initiale
```b### Scripts Utilitaires

#### Windows (non-interactive)
- `scripts/cbd-quick.bat "prompt"` - Validation rapide
- `scripts/daily-cbd-report.bat` - Rapport + nettoyage auto

#### Unix/Linux
- `scripts/cbd-quick.sh "prompt"` - Validation rapidec:\Project_Learning\MyDevFramework
npm run install:cbd
```

### 2. Scripts disponibles

#### Configuration et Tests
- `npm run cbd:setup` - Configuration initiale (non-interactive)
- `npm run cbd:test` - Tests de validation complets (non-interactive)
- `npm run install:cbd` - Installation complète (setup + tests)

#### Validation CBD
- `npm run cbd:validate "prompt"` - Valider un prompt
- `npm run cbd:roadmap phase "action" category` - Vérifier conformité roadmap
- `npm run cbd:orchestrator "prompt complet"` - Validation complète

#### Analytics et Rapports
- `npm run cbd:analytics` - Statistiques des validations
- `npm run cbd:report` - Rapport détaillé
- `npm run cbd:clean` - Nettoyer les anciens logs

#### Développement IA
- `npm run dev:ia` - Mode développement avec validation automatique
- `npm run validate:all` - Validation complète du système

## Format des Prompts CBD

### Structure obligatoire
```
[CONTEXT] Phase X.Y - Description FunLearning
[FILE] chemin/vers/fichier.ext
[CMD] commande à exécuter
[TEST] commande de test
[CHECK] critère de validation

Description détaillée de la demande...
```

### Exemple complet
```
[CONTEXT] Phase 1.1 - Configuration Firebase FunLearning
[FILE] src/lib/firebase.js
[CMD] npm run dev
[TEST] npm run test:firebase
[CHECK] Connexion Firebase établie

Configurer Firebase Authentication pour le projet FunLearning
avec support Google Sign-in et gestion des sessions utilisateur.
```

## Templates Disponibles

Le système génère automatiquement des templates dans `templates/cbd/` :

- **basic-prompt.md** - Template de base
- **deviation-prompt.md** - Pour les déviations de roadmap
- **security-prompt.md** - Pour les modifications sensibles

## Configuration (.cbdrc.json)

```json
{
  "version": "2.0",
  "strictMode": true,
  "enableAnalytics": true,
  "roadmapFile": "../Projet_Learning/roadmap/README.md",
  "validPhases": ["0", "1", "1.1", "1.2", "1.3", "2", "2.1", ...],
  "requiredTags": ["CONTEXT", "FILE", "CMD", "TEST", "CHECK"]
}
```

## Workflow de Développement avec IA

### 1. Validation avant action
```bash
npm run cbd:orchestrator "[CONTEXT] Phase 1.1 - Firebase Setup FunLearning [FILE] src/lib/firebase.js [CMD] npm install firebase [TEST] npm run test:firebase [CHECK] Firebase configuré"
```

### 2. Si validation OK → Procéder
```bash
npm install firebase
# ... autres actions
```

### 3. Analytics et suivi
```bash
npm run cbd:analytics
```

## Gestion des Déviations

Si vous devez dévier de la roadmap :

```
[CONTEXT] DÉVIATION ROADMAP - Description
[ROADMAP-CURRENT] Phase X.Y - Objectif actuel
[DEVIATION] Description de l'écart
[JUSTIFICATION] Raison détaillée
[IMPACT-ANALYSIS] Demande d'analyse
[CONFIRMATION-REQUIRED] OUI
[CHECK] Roadmap validée avant action
```

## Scripts Utilitaires

### Windows
- `scripts/cbd-quick.bat "prompt"` - Validation rapide
- `scripts/daily-cbd-report.bat` - Rapport quotidien

### Unix/Linux
- `scripts/cbd-quick.sh "prompt"` - Validation rapide

## Logs et Rapports

- **logs/** - Logs de validation
- **reports/** - Rapports détaillés
- Auto-nettoyage après 30 jours (configurable)

## Codes de Retour

- **0** - Validation réussie, action autorisée
- **1** - Validation échouée, action bloquée
- **2** - Déviation détectée, confirmation requise

## Intégration VS Code

Le système s'intègre naturellement avec GitHub Copilot et respecte les pratiques définies dans `docs/DOC_CoPilot_Practices.md`.

## Troubleshooting

### Tests échoués
```bash
npm run cbd:test
# Vérifier les erreurs dans le rapport
```

### Configuration corrompue
```bash
npm run cbd:setup
# Réinitialise la configuration
```

### Performance lente
```bash
npm run cbd:clean
# Nettoie les logs anciens
```

---

🎯 **Le système CBD est maintenant prêt !**

Toutes les demandes à l'IA doivent maintenant passer par la validation CBD pour garantir la cohérence du projet FunLearning.
