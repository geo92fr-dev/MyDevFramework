# 🧪 Test Suite Architecture - FunLearning V1.0

## 🎯 Stratégie de Tests par Niveau de Criticité

Suite de tests organisée pour garantir la qualité selon l'importance des composants testés.

## 📋 Inventaire par Criticité de Couverture

### 🚨 TESTS CRITIQUES - Exécution OBLIGATOIRE (Échec = Blocage)
| Test | Cible | Fréquence | Impact Échec | Couverture Min |
|------|-------|-----------|--------------|----------------|
| `auth.critical.test.js` | Authentification complète | Chaque commit | 🔴 BLOCAGE | 100% |
| `firebase.integration.test.js` | Connexion Firebase | Chaque commit | 🔴 BLOCAGE | 100% |
| `security.test.js` | Failles sécurité | Chaque commit | 🔴 BLOCAGE | 100% |
| `data-integrity.test.js` | Intégrité données | Chaque commit | 🔴 BLOCAGE | 100% |
| `routing.critical.test.js` | Navigation principale | Chaque commit | 🔴 BLOCAGE | 95% |
| `pwa.offline.test.js` | Fonctionnement offline | Avant release | 🔴 BLOCAGE | 90% |

### ⚠️ TESTS IMPORTANTS - Exécution RECOMMANDÉE (Échec = Warning)
| Test | Cible | Fréquence | Impact Échec | Couverture Min |
|------|-------|-----------|--------------|----------------|
| `ui.components.test.js` | Composants UI principaux | Chaque PR | 🟡 WARNING | 85% |
| `navigation.e2e.test.js` | Parcours utilisateur | Avant release | 🟡 WARNING | 80% |
| `performance.test.js` | Métriques performance | Hebdomadaire | 🟡 WARNING | N/A |
| `accessibility.test.js` | Conformité a11y | Avant release | 🟡 WARNING | 90% |
| `responsive.test.js` | Design responsive | Avant release | 🟡 WARNING | 80% |

### ✅ TESTS STANDARD - Exécution NORMALE (Développement continu)
| Test | Cible | Fréquence | Couverture Min |
|------|-------|-----------|----------------|
| `unit.*.test.js` | Fonctions isolées | Continue | 80% |
| `component.*.test.js` | Composants individuels | Continue | 85% |
| `integration.*.test.js` | Intégrations simples | PR/Release | 75% |
| `utils.test.js` | Fonctions utilitaires | Continue | 95% |

### 🔄 TESTS TEMPORAIRES - Développement (Durée de vie limitée)
| Test | Usage | Durée de vie | Notes |
|------|-------|-------------|-------|
| `debug.*.test.js` | Debugging spécifique | Phase de debug | Supprimables |
| `experiment.*.test.js` | Features expérimentales | Phase R&D | Temporaires |
| `spike.*.test.js` | Proof of concept | Validation technique | À migrer ou supprimer |

## 🎯 Matrice de Couverture par Phase de Développement

| Phase | Couverture Min | Tests Critiques | Tests E2E | Tests Performance |
|-------|---------------|-----------------|-----------|-------------------|
| **P0** | 70% | Config + Setup | Smoke tests | N/A |
| **P1** | 80% | Auth + Firebase | Login flow | N/A |
| **P2** | 85% | UI + Navigation | User journey | Basic |
| **P3** | 85% | Interactions + Quiz | Complete flows | Interactions |
| **P4** | 90% | PWA + Offline | Full app offline | PWA metrics |
| **P5** | 90% | Admin + Security | Admin workflows | Security load |
| **P6** | 95% | Performance + Prod | Production scenarios | Full Lighthouse |

## 📏 Guidelines par Type de Test

### 🚨 Tests CRITIQUES - Protocole Strict
```markdown
EXIGENCES:
- ✅ Échec = Commit automatiquement bloqué
- ✅ Exécution dans pipeline CI/CD obligatoire  
- ✅ Notification immédiate équipe si échec
- ✅ Rollback automatique si possible
- ✅ Coverage 100% des chemins critiques
- ✅ Tests isolés (pas de dépendances externes)

COMMANDES:
npm run test:critical           # Tous les tests critiques
npm run test:critical:auth      # Auth seulement
npm run test:critical:firebase  # Firebase seulement  
npm run test:critical:security  # Sécurité seulement

REPORTING:
- Logs détaillés en cas d'échec
- Métriques de performance incluses
- Analyse de couverture obligatoire
```

### ⚠️ Tests IMPORTANTS - Protocole Renforcé  
```markdown
EXIGENCES:
- ⚠️ Échec = Warning mais pas blocage commit
- ⚠️ Review manuelle requise si échec
- ⚠️ Fix obligatoire avant merge en main
- ⚠️ Coverage minimum respectée
- ⚠️ Tests peuvent dépendre d'APIs externes

COMMANDES:
npm run test:important           # Tous les tests importants
npm run test:important:ui        # UI seulement
npm run test:important:e2e       # E2E seulement
npm run test:important:perf      # Performance seulement

REPORTING:  
- Rapport de régression automatique
- Comparaison avec baseline performance
- Screenshots en cas d'échec UI
```

### ✅ Tests STANDARD - Protocole Normal
```markdown
EXIGENCES:
- ✅ Feedback développeur immédiat
- ✅ Intégration continue standard
- ✅ Fix selon priorité équipe
- ✅ Coverage selon objectif composant

COMMANDES:
npm run test                    # Tests standard en watch mode
npm run test:unit              # Tests unitaires seulement
npm run test:component         # Tests composants seulement

REPORTING:
- Rapport de coverage simple
- Feedback rapide en développement
```

### 🔄 Tests TEMPORAIRES - Protocole Flexible
```markdown
EXIGENCES:
- 🔄 Exécution optionnelle
- 🔄 Documentation du but et durée de vie
- 🔄 Nettoyage automatique après phase

COMMANDES:
npm run test:debug             # Tests de debug actifs
npm run test:experiments       # Tests expérimentaux
npm run clean:temp-tests       # Nettoyage automatique
```

## 🔗 Matrice Tests vs Fichiers Source

### 🚨 Fichiers Critiques → Tests Critiques Obligatoires
| Fichier Source | Test Critique Associé | Couverture |
|----------------|----------------------|------------|
| `app.html` | `app.critical.test.js` | 100% |
| `hooks.server.ts` | `hooks.critical.test.js` | 100% |
| `lib/firebase/client.ts` | `firebase.critical.test.js` | 100% |
| `lib/stores/user.ts` | `stores.critical.test.js` | 100% |
| `service-worker.ts` | `pwa.critical.test.js` | 100% |

### ⚠️ Fichiers Importants → Tests Importants Requis
| Fichier Source | Test Important Associé | Couverture |
|----------------|----------------------|------------|
| `lib/components/Header.svelte` | `header.important.test.js` | 90% |
| `lib/stores/courses.ts` | `courses.important.test.js` | 85% |
| `routes/+layout.svelte` | `layout.important.test.js` | 85% |

## 🚀 Commandes par Situation

### 🔴 Avant Modification Fichier Critique
```bash
# Tests complets avant modification
npm run test:critical

# Tests spécifiques au fichier
npm run test:target [fichier]

# Baseline de performance
npm run test:perf:baseline
```

### 🟡 Avant Merge/Release
```bash  
# Suite complète avec rapport
npm run test:full-report

# Tests E2E complets
npm run test:e2e:full

# Validation performance
npm run test:perf:validate
```

### ✅ Développement Quotidien
```bash
# Tests en mode watch
npm run test:watch

# Tests ciblés sur changements
npm run test:changed

# Tests rapides (smoke tests)
npm run test:quick
```

### 🧹 Maintenance
```bash
# Audit couverture par criticité
npm run test:audit:coverage

# Nettoyage tests obsolètes
npm run test:clean:obsolete

# Mise à jour baselines
npm run test:update:baselines
```

## 📊 Métriques et Reporting

### 🎯 Objectifs de Qualité par Phase
```javascript
// CONFIG_test_thresholds.js
const TEST_THRESHOLDS = {
  'phase-0': { critical: 100, important: 80, standard: 70 },
  'phase-1': { critical: 100, important: 85, standard: 75 },
  'phase-2': { critical: 100, important: 85, standard: 80 },
  'phase-3': { critical: 100, important: 90, standard: 85 },
  'phase-4': { critical: 100, important: 90, standard: 85 },
  'phase-5': { critical: 100, important: 95, standard: 90 },
  'phase-6': { critical: 100, important: 95, standard: 95 }
};
```

### 📈 Dashboard de Métriques
- **Temps d'exécution** par type de test
- **Tendance de couverture** sur 30 jours  
- **Taux d'échec** par criticité
- **Performance** des tests eux-mêmes

### 🚨 Alertes Automatiques
- **Tests critiques échouent** → Notification immédiate
- **Couverture baisse** sous seuil → Warning quotidien
- **Tests lents** détectés → Optimisation suggérée

## 🔧 Configuration et Setup

### 📋 Structure des Fichiers de Test
```
tests/
├── critical/                 # Tests critiques
│   ├── auth.critical.test.js
│   ├── firebase.critical.test.js
│   └── security.critical.test.js
├── important/                # Tests importants  
│   ├── ui.important.test.js
│   ├── e2e.important.test.js
│   └── performance.important.test.js
├── standard/                 # Tests standard
│   ├── unit/
│   ├── component/
│   └── integration/
├── temp/                     # Tests temporaires
│   ├── debug/
│   └── experiments/
└── config/                   # Configuration tests
    ├── jest.config.js
    ├── playwright.config.ts
    └── vitest.config.ts
```

### ⚙️ Variables d'Environnement Tests
```env
# Niveau de test par défaut
TEST_LEVEL=standard

# Timeout pour tests critiques
CRITICAL_TEST_TIMEOUT=30000

# Mode strict (échec = arrêt)
TEST_STRICT_MODE=true

# Reporting détaillé
TEST_DETAILED_REPORT=true
```

## 🎯 Evolution et Maintenance

### 📅 Cycle de Vie des Tests
1. **Création** : Selon template et criticité
2. **Validation** : Review et intégration CI/CD
3. **Maintenance** : Mise à jour avec évolution code
4. **Optimisation** : Performance et fiabilité
5. **Archivage** : Suppression tests obsolètes

### 🔄 Amélioration Continue
- **Post-mortem** après chaque bug en production
- **Analyse** des tests qui n'ont pas détecté le problème
- **Renforcement** de la couverture des zones sensibles
- **Optimisation** des temps d'exécution

---

*Ce README évolue avec la stratégie de tests. Toute modification de criticité ou ajout de test doit être documentée ici.*
