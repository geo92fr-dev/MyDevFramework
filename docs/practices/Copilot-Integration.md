# Pratiques de Développement avec Copilot

## Intégration Copilot dans MyDevFramework

### Contexte Framework
Fournir à Copilot le contexte approprié pour des suggestions cohérentes avec MyDevFramework.

### Variables de Contexte
```
Framework: MyDevFramework v1.3.0
Mode: EXTERNE UNIQUEMENT
Structure: CLI + Core + Templates + Tools
Projets: Git indépendant
```

### Prompts Types

#### Création de Projet
```
Contexte: MyDevFramework crée des projets externes avec Git indépendant
Template: [nom-template]
Destination: Configurée dans project.ini
```

#### Modification Framework
```
Contexte: MyDevFramework mode externe uniquement
Fichier: [nom-fichier]
Objectif: [description]
Contraintes: Maintenir simplicité et isolation
```

### Validation des Suggestions

#### CheckBeforeDoing pour Copilot
1. **Check** : La suggestion respecte-t-elle l'architecture ?
2. **Before** : Impact sur l'écosystème framework ?
3. **Doing** : Test et validation avant intégration

#### Critères de Validation
- ✅ Cohérence avec le mode EXTERNE UNIQUEMENT
- ✅ Simplicité maintenue
- ✅ Pas de régression
- ✅ Documentation à jour

### Bonnes Pratiques

#### Communication avec Copilot
- Contexte clair du framework
- Objectifs précis
- Contraintes explicites
- Exemples de patterns existants

#### Intégration des Suggestions
- Test systématique
- Validation par les scripts CBD
- Documentation des changements
- Commit avec message explicite
