# 📁 Source Code Architecture - FunLearning V1.0

## 🎯 Vue d'Ensemble
Structure du code source organisée par domaines fonctionnels pour l'application d'apprentissage gamifiée.

## 📋 Inventaire par Criticité

### 🚨 FICHIERS CRITIQUES - Modifications avec EXTRÊME PRÉCAUTION
| Fichier | Rôle | Impact | Précautions Obligatoires |
|---------|------|--------|--------------------------|
| `app.html` | Template HTML racine | 🔴 GLOBAL | Tests complets + backup avant modif |
| `hooks.server.ts` | Middleware serveur global | 🔴 GLOBAL | Vérifier auth, routing et sécurité |
| `lib/firebase/client.ts` | Client Firebase principal | 🔴 AUTH/DATA | Tests auth complets + connexion |
| `lib/stores/user.ts` | Store état utilisateur | 🔴 STATE | Vérifier réactivité globale |
| `service-worker.ts` | Service Worker PWA | 🔴 OFFLINE | Tests offline complets |
| `routes/+layout.svelte` | Layout racine application | 🔴 UI GLOBALE | Tests visuels + navigation |

### ⚠️ FICHIERS IMPORTANTS - Modifications avec PRÉCAUTION
| Fichier | Rôle | Impact | Validation Requise |
|---------|------|-----------|-------------------|
| `lib/firebase/admin.ts` | Admin Firebase | 🟡 BACKEND | Tests permissions + sécurité |
| `lib/components/Header.svelte` | Navigation principale | 🟡 UX | Tests navigation + responsive |
| `lib/stores/courses.ts` | Store contenus cours | 🟡 DATA | Tests données + réactivité |
| `lib/stores/progress.ts` | Store progression utilisateur | 🟡 TRACKING | Tests persistance + sync |
| `lib/auth/` | Modules authentification | 🟡 SECURITY | Tests auth flows complets |
| `routes/+layout.server.ts` | Layout serveur | 🟡 SSR | Tests SSR + hydratation |

### ✅ FICHIERS STANDARD - Modifications Normales
| Fichier | Rôle | Guidelines |
|---------|------|-----------|
| `routes/cours/+page.svelte` | Page cours individuel | Tests unitaires composant |
| `lib/components/quiz/` | Composants quiz | Tests isolés + interactions |
| `lib/components/markdown/` | Rendu Markdown | Tests contenu + sanitization |
| `lib/utils/` | Utilitaires génériques | Tests unitaires fonctions |
| `routes/exercices/` | Pages exercices | Tests fonctionnels + UX |
| `lib/types/` | Définitions TypeScript | Validation types + build |

### 🔄 FICHIERS TEMPORAIRES - Modifications Libres
| Fichier | Rôle | Notes |
|---------|------|-------|
| `routes/dev/` | Pages développement | Supprimables en production |
| `lib/temp/` | Utilitaires temporaires | À nettoyer régulièrement |
| `lib/experiments/` | Features expérimentales | Tests optionnels |

## 🔗 Matrice des Dépendances

### 🚨 Impact Global (Modification = Tout Tester)
- **app.html** → Template racine → Impacte TOUT
- **hooks.server.ts** → Middleware → Impacte auth, routing, sécurité
- **service-worker.ts** → PWA → Impacte offline, cache, performance

### ⚠️ Impact Domaine (Modification = Tester Domaine)
- **Firebase client** → Auth + données → Impacte login, CRUD, sync
- **Stores principaux** → État global → Impacte réactivité, persistence
- **Layout racine** → UI globale → Impacte navigation, responsive

### ✅ Impact Localisé (Modification = Tester Composant)
- **Composants isolés** → UI spécifique → Impacte fonctionnalité précise
- **Pages individuelles** → Route spécifique → Impacte parcours utilisateur
- **Utilitaires** → Fonctions → Impacte logique métier

## 📏 Guidelines de Modification par Criticité

### 🚨 Protocole FICHIERS CRITIQUES :
```markdown
[PRE-MODIFICATION]
1. 📖 Lire documentation complète du composant
2. 🧪 Créer tests reproduisant comportement actuel  
3. 💾 Backup automatique du fichier
4. 🔍 Planifier tests de non-régression complets
5. 🚀 Tester en environnement isolé d'abord

[POST-MODIFICATION]  
1. ✅ Exécuter TOUS les tests critiques
2. 🔄 Valider sur environnements multiples
3. 📊 Vérifier métriques de performance
4. 👥 Review humaine recommandée
5. 📝 Documenter changements impactants
```

### ⚠️ Protocole FICHIERS IMPORTANTS :
```markdown
[VALIDATION REQUISE]
1. 🧪 Tests unitaires avant modification
2. 🔍 Validation manuelle flows impactés
3. 📈 Monitoring post-modification
4. 👥 Review si changement architectural
```

### ✅ Protocole FICHIERS STANDARD :
```markdown
[VALIDATION NORMALE]
1. 🧪 Tests appropriés selon complexité
2. 🤖 Validation automatique suffisante
3. 📊 Métriques de base
```

### 🔄 Protocole FICHIERS TEMPORAIRES :
```markdown
[VALIDATION MINIMALE]
1. 🧪 Tests optionnels selon besoin
2. 🚀 Modification libre
3. 🧹 Nettoyage périodique
```

## 🎯 Classification par Phase de Développement

### Phase 0 (Setup) - Fichiers Critiques à Établir
- `app.html`, `package.json`, config de base
- `hooks.server.ts` structure de base
- Tests et linting foundation

### Phase 1 (Firebase & Auth) - Fichiers Critiques Auth
- `lib/firebase/` complet
- `lib/auth/` et stores utilisateur
- `hooks.server.ts` avec auth

### Phase 2 (Contenu & UI) - Fichiers Critiques Interface  
- `routes/+layout.svelte` navigation
- Stores de contenu et composants UI
- Système de routing

### Phase 3 (Exercices) - Fichiers Critiques Interactions
- Composants quiz et exercices
- Stores de progression
- Logique de gamification

### Phase 4 (PWA) - Fichiers Critiques Offline
- `service-worker.ts` complet
- `static/manifest.json`
- Stratégies de cache

### Phase 5 (Admin) - Fichiers Critiques Gestion
- Routes admin avec sécurité
- Import/export de contenu
- Interface de gestion

### Phase 6 (Polish) - Fichiers Critiques Performance
- Optimisations bundle
- Lazy loading
- Monitoring production

## 🔧 Commandes de Vérification

```bash
# Audit criticité des modifications en cours
npm run audit:criticality

# Tests ciblés par niveau de criticité
npm run test:critical    # Fichiers critiques seulement
npm run test:important   # Fichiers importants
npm run test:all         # Couverture complète

# Validation avant modification fichier critique
npm run validate:before-critical-change [fichier]

# Rapport d'impact d'un fichier
npm run analyze:impact [fichier]
```

## 🚨 Alertes de Sécurité

### Fichiers Sensibles à la Sécurité
- `lib/firebase/admin.ts` → Clés API serveur
- `hooks.server.ts` → Sessions et cookies
- `lib/auth/` → Tokens et validation
- Tout fichier avec `secret`, `key`, `token`

### Règles de Sécurité
1. **Jamais de secrets** en dur dans le code
2. **Variables d'environnement** pour toute config sensible
3. **Validation inputs** dans tous les composants publics
4. **Audit automatique** avant chaque commit

## 📊 Métriques de Maintenance

| Métrique | Objectif | Mesure |
|----------|----------|---------|
| Fichiers critiques documentés | 100% | Audit automatique |
| Couverture tests fichiers critiques | >95% | Coverage report |
| Temps résolution bug critique | <2h | Post-mortem tracking |
| Régressions après modif critique | 0 | Monitoring continu |

---

*Ce README est un document vivant qui évolue avec l'architecture. Toute modification de structure doit être reflétée ici.*
