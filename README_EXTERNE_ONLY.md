# MyDevFramework v1.3.0 - Mode EXTERNE UNIQUEMENT

## 🎯 Philosophie

**MyDevFramework ne crée QUE des projets externes** avec leur propre Git indépendant.

- ❌ **Pas de projets locaux** dans le framework
- ✅ **Projets externes uniquement** avec Git séparé
- ✅ **Framework propre** dédié aux outils et templates
- ✅ **Isolation complète** des projets

## 🚀 Utilisation Simplifiée

### Commande Principale
```bash
# Création de projet externe
fw create mon-projet

# Avec chemin spécifique
fw create mon-projet --external-path C:\MesProjets
```

### Scripts Disponibles
```bash
# Script intelligent (recommandé)
smart-external-project.bat [nom-projet]

# Script complet avec configuration
create-external-only.bat [nom-projet]
```

## ⚙️ Configuration

### project.ini - Configuration unique
```ini
[Mode]
# EXTERNE UNIQUEMENT - Pas de mode LOCAL
creation_mode = EXTERNE

[PathsExterne]
# Tous les projets sont créés ici
external_projects_path = C:\MyDevProject
external_templates_path = C:\MyDevProject\templates
external_backup_path = C:\MyDevProject\backups
```

### Structure des Projets
```
C:\MyDevProject\
├── templates\          # Templates personnalisés
├── backups\            # Sauvegardes
├── mon-projet-1\       # Projet avec son Git
├── mon-projet-2\       # Projet avec son Git
└── ...
```

## 🔗 Contrôle de Version

### Framework (MyDevFramework)
- **Repository**: https://github.com/geo92fr-dev/MyDevFramework
- **Usage**: Outils, templates, CLI
- **Évolution**: Indépendante des projets

### Projets Externes
- **Repository**: Indépendant pour chaque projet
- **Usage**: Code source du projet
- **Évolution**: Totalement autonome

## 🎯 Avantages

✅ **Simplicité** - Un seul mode, une seule façon de faire  
✅ **Isolation** - Framework et projets complètement séparés  
✅ **Flexibilité** - Projets indépendants avec leur propre Git  
✅ **Propreté** - Framework dédié uniquement aux outils  
✅ **Évolutivité** - Chaque projet évolue indépendamment  

## 📝 Workflow Quotidien

1. **Créer un projet** : `smart-external-project.bat mon-projet`
2. **Ouvrir le projet** : `cd C:\MyDevProject\mon-projet && code .`
3. **Développer** : Travail normal avec Git indépendant
4. **Framework** : Reste propre et dédié aux outils

---

**MyDevFramework v1.3.0** - Framework personnel optimisé pour la création de projets externes uniquement.
