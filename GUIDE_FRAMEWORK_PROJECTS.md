# Guide des Scripts Framework/Projects

## Architecture Séparée Framework/Projects

### Structure Créée
```
C:\MyDevProject\
├── framework\          # MyDevFramework complet (Git: MyDevFramework)
│   ├── cli\
│   ├── core\
│   ├── templates\
│   └── ...
└── projects\           # Zone de travail (Git indépendant)
    ├── templates\      # Templates personnalisés
    ├── backups\        # Sauvegardes
    └── [nom-projet]\   # Projets avec leur propre Git
```

## Scripts Disponibles

### 1. `preview-framework-projects.bat` 
**Aperçu de la configuration**
- Affiche la structure qui sera créée
- Vérifie l'état actuel
- Propose les actions disponibles

### 2. `create-framework-projects-separation.bat`
**Création complète de l'architecture**
- Copie le framework vers `framework/`
- Crée la zone projets dans `projects/`
- Configure Git séparément pour chaque zone
- Installe les dépendances npm
- Crée les scripts d'aide

### 3. `smart-framework-projects.bat`
**Menu intelligent**
- Détecte automatiquement si l'architecture existe
- Propose les actions appropriées :
  - Créer un nouveau projet
  - Ouvrir framework dans VSCode
  - Ouvrir projets dans VSCode  
  - Recréer l'architecture

## Contrôle de Version

### Framework (framework/)
- **Git Repository**: https://github.com/geo92fr-dev/MyDevFramework
- **Usage**: Lecture seule, évolution du framework
- **Commits**: Synchronisation avec le repo principal

### Zone Projets (projects/)
- **Git Repository**: Indépendant, initialisé localement
- **Usage**: Vos projets personnels
- **Commits**: Vos propres commits de travail

### Projets Individuels (projects/nom-projet/)
- **Git Repository**: Indépendant pour chaque projet
- **Usage**: Code source du projet spécifique
- **Commits**: Historique du projet

## Workflow Recommandé

1. **Première fois** : `preview-framework-projects.bat`
2. **Création** : `create-framework-projects-separation.bat` 
3. **Usage quotidien** : `smart-framework-projects.bat`

## Scripts dans projects/

Après création, vous disposerez de :

- `create-project.bat` : Créer un nouveau projet
- `open-framework.bat` : Ouvrir le framework dans VSCode
- `open-projects.bat` : Ouvrir la zone projets dans VSCode

## Avantages

✅ **Séparation claire** entre framework et projets  
✅ **Évolution indépendante** du framework  
✅ **Git séparé** pour chaque composant  
✅ **Isolation complète** des environnements  
✅ **Portabilité** de la zone projets  
✅ **Flexibilité** pour personnaliser les chemins
