# 🎯 GUIDE SÉPARATION FRAMEWORK vs PROJET

## 🔍 Principe de Séparation

### 📋 **Règle d'Or**
- **Framework** = Code **réutilisable** entre projets
- **Projet** = Code **spécifique** au métier + Copie autonome du framework

---

## 📁 ARCHITECTURE DÉTAILLÉE

### 🏗️ **Framework Personnel (Source)**
```
~/MyDevFramework/                          # RÉPERTOIRE MAÎTRE
├── 📂 core/                              # MOTEUR UNIVERSEL
│   ├── orchestrator/
│   │   ├── dev_ia_orchestrator.js        # Version générique avec variables
│   │   └── orchestrator_config.json     # Config par défaut
│   ├── security/
│   │   ├── audit_security.js            # Audit universel
│   │   ├── blocked_packages.json        # Packages dangereux
│   │   └── security_rules.js            # Règles configurables
│   ├── quality/
│   │   ├── validator_cbd.js             # CBD avec templates
│   │   ├── validator_structure.js       # Structure projet
│   │   ├── validator_tests.js           # Tests universels
│   │   └── quality_gates.js             # Gates configurables
│   └── control/
│       ├── control_levels.json          # 3 niveaux base
│       ├── control_manager.js           # CLI universel
│       └── level_templates/             # Templates par niveau
├── 📂 templates/                         # BASES PROJETS
│   ├── svelte-firebase-instant/         # SvelteKit + Firebase
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── components/          # Composants GÉNÉRIQUES
│   │   │   │   │   ├── Auth.svelte      # Auth générique
│   │   │   │   │   └── Layout.svelte    # Layout base
│   │   │   │   └── stores/              # Stores GÉNÉRIQUES
│   │   │   │       ├── auth.js          # Auth store base
│   │   │   │       └── theme.js         # Theme store
│   │   │   └── routes/
│   │   │       ├── +layout.svelte       # Layout avec auth
│   │   │       ├── +page.svelte         # Page d'accueil générique
│   │   │       └── login/+page.svelte   # Login générique
│   │   ├── static/                      # Assets GÉNÉRIQUES
│   │   │   └── placeholder-logo.png     # Logo placeholder
│   │   ├── scripts/                     # Scripts COPIÉS
│   │   │   └── [TOUS LES SCRIPTS CORE]  # Copie autonome
│   │   ├── package.json                 # {{PROJECT_NAME}} + deps
│   │   ├── .env.example                 # Variables template
│   │   └── README.template.md           # Docs template
│   ├── react-supabase-ecommerce/        # React + Supabase
│   └── vue-firebase-blog/               # Vue + Firebase
├── 📂 snippets/                          # CODE RÉUTILISABLE
│   ├── auth/
│   │   ├── svelte-auth-firebase.js      # Pattern auth Svelte
│   │   ├── react-auth-supabase.js       # Pattern auth React
│   │   └── universal-auth-utils.js      # Utils cross-framework
│   ├── ui/
│   │   ├── modals/
│   │   ├── forms/
│   │   └── animations/
│   ├── api/
│   │   ├── client-patterns.js           # Clients API
│   │   ├── error-handling.js            # Gestion erreurs
│   │   └── cache-strategies.js          # Stratégies cache
│   └── utils/
│       ├── date-helpers.js              # Manipulation dates
│       ├── validation-schemas.js        # Schémas validation
│       └── performance-helpers.js       # Optimisations
├── 📂 configs/                           # CONFIGURATIONS TYPES
│   ├── eslint/
│   │   ├── eslint-svelte.js
│   │   ├── eslint-react.js
│   │   └── eslint-base.js
│   ├── vite/
│   │   ├── vite-svelte.js
│   │   └── vite-react.js
│   ├── firebase/
│   │   ├── firebase-dev.js
│   │   └── firebase-prod.js
│   └── deployment/
│       ├── vercel.json
│       └── netlify.toml
├── 📂 tools/                             # OUTILS FRAMEWORK
│   ├── create-project.sh                # Script création
│   ├── update-templates.sh              # Mise à jour templates
│   ├── validate-framework.js            # Tests framework
│   └── maintenance.sh                   # Maintenance automatique
└── 📄 docs/                              # DOCUMENTATION
    ├── usage.md                          # Comment utiliser
    ├── templates.md                      # Guide templates
    ├── snippets.md                       # Guide snippets
    └── maintenance.md                    # Guide maintenance
```

### 🎯 **Projet Spécifique (Instance)**
```
~/Projets/MonAppEcommerce/                 # PROJET AUTONOME
├── 📂 src/                               # CODE MÉTIER UNIQUE
│   ├── lib/
│   │   ├── components/                   # Composants SPÉCIFIQUES
│   │   │   ├── ProductCard.svelte        # Composant produit
│   │   │   ├── ShoppingCart.svelte       # Panier
│   │   │   ├── PaymentForm.svelte        # Paiement
│   │   │   └── AdminDashboard.svelte     # Dashboard admin
│   │   ├── stores/                       # État MÉTIER
│   │   │   ├── products.js               # Gestion produits
│   │   │   ├── cart.js                   # État panier
│   │   │   ├── orders.js                 # Commandes
│   │   │   └── inventory.js              # Inventaire
│   │   ├── utils/                        # Utilitaires MÉTIER
│   │   │   ├── price-calculator.js       # Calculs prix
│   │   │   ├── shipping-calculator.js    # Calculs livraison
│   │   │   └── tax-calculator.js         # Calculs taxes
│   │   └── types/                        # Types MÉTIER
│   │       ├── product.js                # Type produit
│   │       ├── order.js                  # Type commande
│   │       └── customer.js               # Type client
│   ├── routes/                           # Pages MÉTIER
│   │   ├── products/
│   │   │   ├── +page.svelte              # Liste produits
│   │   │   └── [id]/+page.svelte         # Détail produit
│   │   ├── cart/+page.svelte             # Page panier
│   │   ├── checkout/
│   │   │   ├── +page.svelte              # Checkout
│   │   │   └── success/+page.svelte      # Confirmation
│   │   └── admin/
│   │       ├── +layout.svelte            # Layout admin
│   │       ├── products/+page.svelte     # Gestion produits
│   │       └── orders/+page.svelte       # Gestion commandes
│   └── app.html                          # Template spécifique
├── 📂 static/                            # Assets SPÉCIFIQUES
│   ├── logo-entreprise.png               # Logo de l'entreprise
│   ├── images/products/                  # Images produits
│   ├── icons/                            # Icônes spécifiques
│   └── favicon.ico                       # Favicon entreprise
├── 📂 scripts/                           # Scripts FRAMEWORK COPIÉS
│   ├── UTIL_dev_ia_orchestrator.js      # COPIE AUTONOME
│   ├── UTIL_audit_security_dev.js       # COPIE AUTONOME
│   ├── UTIL_control_level_manager.js    # COPIE AUTONOME
│   ├── VALID_cbd.js                     # COPIE AUTONOME
│   ├── VALID_roadmap_compliance_temp.js # COPIE AUTONOME
│   └── setup-auto.js                    # Script d'installation
├── 📄 CONFIG_control_levels.json        # Config ADAPTÉE au projet
├── 📄 package.json                      # Deps SPÉCIFIQUES + scripts
├── 📄 .env                              # Config PROJET (Git ignored)
├── 📄 .env.example                      # Template config
├── 📄 README.md                         # Documentation PROJET
├── 📄 svelte.config.js                  # Config Svelte ADAPTÉE
├── 📄 vite.config.js                    # Config Vite ADAPTÉE
└── 📄 .gitignore                        # Gitignore COMPLET
```

---

## 🔄 FLUX DE CRÉATION PROJET

### 📋 **Processus Standard**

#### **Étape 1 : Copie Template**
```bash
# Copier template vers nouveau projet
cp -r ~/MyDevFramework/templates/svelte-firebase-instant ~/Projets/MonNouveauProjet
cd ~/Projets/MonNouveauProjet
```

#### **Étape 2 : Auto-Configuration**
```bash
# Configuration automatique
npm install
npm run setup:auto  # Remplace {{PROJECT_NAME}}, configure git, etc.
```

#### **Étape 3 : Personnalisation Métier**
- Modifier `src/lib/components/` avec composants spécifiques
- Adapter `src/lib/stores/` pour logique métier
- Créer routes spécifiques dans `src/routes/`
- Configurer `.env` avec vraies credentials

#### **Étape 4 : Validation Autonomie**
```bash
npm run dev:ia  # Validation complète avec scripts copiés
```

---

## 🎯 AVANTAGES SÉPARATION

### ✅ **Pour le Framework**
- **Évolution propre** : Améliorations sans casser projets existants
- **Réutilisabilité maximale** : Code vraiment générique
- **Maintenance centralisée** : Une source de vérité
- **Tests isolés** : Framework testé indépendamment

### ✅ **Pour les Projets**
- **Autonomie complète** : Scripts copiés, pas de dépendance externe
- **Customisation libre** : Modification sans impact framework
- **Déploiement simple** : Tout inclus dans le projet
- **Version figée** : Framework ne change pas sous les pieds

### ✅ **Pour la Maintenance**
- **Isolation des changements** : Projet n'affecte pas framework
- **Migration contrôlée** : Choix d'adopter nouvelles versions
- **Backup naturel** : Chaque projet = snapshot framework
- **Debug facilité** : Problème localisé facilement

---

## 🔧 MISE À JOUR FRAMEWORK → PROJETS

### 📋 **Stratégie de Migration**

#### **Option 1 : Migration Manuelle (Recommandée)**
```bash
# Comparer changements
diff ~/MyDevFramework/core/orchestrator/dev_ia_orchestrator.js scripts/UTIL_dev_ia_orchestrator.js

# Copier améliorations manuellement
cp ~/MyDevFramework/core/orchestrator/dev_ia_orchestrator.js scripts/UTIL_dev_ia_orchestrator.js

# Tester
npm run dev:ia
```

#### **Option 2 : Script de Migration**
```bash
# Script à créer dans framework
~/MyDevFramework/tools/migrate-project.sh ~/Projets/MonProjet
```

#### **Option 3 : Migration Sélective**
```bash
# Mise à jour seulement certains scripts
cp ~/MyDevFramework/core/security/audit_security.js scripts/UTIL_audit_security_dev.js
```

---

## 🎪 EXEMPLES CONCRETS

### 📝 **Fichier Framework (Générique)**
```javascript
// ~/MyDevFramework/core/orchestrator/dev_ia_orchestrator.js
const CONFIG = {
    projectName: process.env.PROJECT_NAME || 'unknown-project',
    controlLevel: process.env.CONTROL_LEVEL || 'controlled',
    // Configuration générique avec variables
};
```

### 📝 **Fichier Projet (Spécifique)**
```javascript
// ~/Projets/MonEcommerce/scripts/UTIL_dev_ia_orchestrator.js
const CONFIG = {
    projectName: 'MonEcommerce',
    controlLevel: 'controlled',
    customBusinessRules: true,
    ecommerceSpecific: {
        validateProductSchema: true,
        checkInventoryConsistency: true
    }
    // Configuration adaptée au projet e-commerce
};
```

---

## 🎯 RÉSUMÉ PRATIQUE

### 📋 **Checklist Séparation**
- [ ] Framework dans `~/MyDevFramework/` (source)
- [ ] Projets dans `~/Projets/` (instances)
- [ ] Scripts copiés dans chaque projet (autonomie)
- [ ] Code métier séparé du code framework
- [ ] Variables template remplacées lors création
- [ ] Configuration adaptée par projet
- [ ] Migration framework → projet contrôlée

**🎯 Principe : Framework = Cuisine, Projet = Restaurant spécialisé**

Le framework fournit les outils et recettes de base, chaque projet les adapte à sa spécialité métier tout en gardant son autonomie complète !
