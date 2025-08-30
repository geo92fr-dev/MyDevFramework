#  SCRIPTS CORE FRAMEWORK - Outils d'Orchestration

##  Scripts Core Migrés depuis Learning Project

###  Orchestration
- `orchestrator.js` - Cerveau central autonome (ex: UTIL_dev_ia_orchestrator.js)
  - Auto-apprentissage et workflow automatique
  - Gates de qualité par phase
  - Post-mortem automatique

###  Validation
- `validator-cbd.js` - Validation protocole CBD (ex: VALID_cbd.js)
- `validator-roadmap.js` - Protection roadmap (ex: VALID_roadmap_compliance.js)

###  Gestion  
- `control-manager.js` - Gestionnaire niveaux contrôle (ex: UTIL_control_level_manager.js)
- `security-audit.js` - Audit sécurité développement (ex: UTIL_audit_security_dev.js)

##  Utilisation dans Projets Framework

### Intégration Orchestrateur
```bash
# Depuis un projet créé avec le framework
npm run dev:ia  # Active l'orchestrateur autonome
```

### Scripts de Validation
```bash
# Validation CBD
node "../C:\MyDevFramework\tools\core-scripts\validator-cbd.js"

# Validation roadmap  
node "../C:\MyDevFramework\tools\core-scripts\validator-roadmap.js"
```

##  Évolution Framework

Ces scripts core permettent:
-  Réutilisation orchestrateur dans tous projets framework
-  Validation CBD standardisée  
-  Gestion niveaux contrôle unifiée
-  Audit sécurité automatique

##  Relation avec CLI

Le CLI framework (`fw`) peut utiliser ces scripts:
```bash
fw validate cbd     #  validator-cbd.js
fw validate roadmap #  validator-roadmap.js  
fw orchestrate      #  orchestrator.js
```

**Ces scripts sont le CŒUR de l'intelligence du framework !**
