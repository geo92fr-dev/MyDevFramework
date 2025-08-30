# SCRIPTS DE CRÉATION DE PROJET EXTERNE - MyDevFramework

## 📁 Scripts disponibles

### 1. `create-external-project.bat` (Recommandé)
Script batch complet avec interface utilisateur riche.

**Usage:**
```batch
.\create-external-project.bat MonNomDeProjet
```

**Fonctionnalités:**
- ✅ Création automatique de la structure externe
- ✅ Copie du framework vers l'emplacement externe  
- ✅ Configuration automatique du mode EXTERNE
- ✅ Création du projet avec la config de project.ini
- ✅ Installation automatique des dépendances npm
- ✅ Proposition d'ouverture dans VSCode
- ✅ Interface utilisateur colorée et informative

---

### 2. `create-external-project.ps1` (PowerShell)
Version PowerShell avec plus d'options avancées.

**Usage basique:**
```powershell
.\create-external-project.ps1 -ProjectName "MonNomDeProjet"
```

**Usage avancé:**
```powershell
# Avec ouverture automatique de VSCode
.\create-external-project.ps1 -ProjectName "MonProjet" -OpenVSCode

# Avec démarrage automatique du serveur de dev
.\create-external-project.ps1 -ProjectName "MonProjet" -OpenVSCode -StartDev

# Avec dossier externe personnalisé
.\create-external-project.ps1 -ProjectName "MonProjet" -ExternalBase "D:\MesProjets\external"
```

---

### 3. `quick-external-project.bat` (Lancement rapide)
Version simplifiée qui appelle le script principal.

**Usage:**
```batch
.\quick-external-project.bat MonProjet
```

---

## 🎯 Workflow recommandé

### Étape 1: Configuration initiale
1. Éditer `project.ini` section `[PathsExterne]` pour définir vos chemins
2. Configurer `[Project]` avec vos informations par défaut

### Étape 2: Création de projet
```batch
# Méthode simple
.\create-external-project.bat MonSuperProjet

# Ou méthode rapide
.\quick-external-project.bat MonSuperProjet
```

### Étape 3: Développement
1. Ouvrir le projet dans VSCode
2. Lancer `npm run dev`
3. Ouvrir http://localhost:5173

---

## 📋 Structure créée

```
C:\MyDevProject\external\
├── framework\                    # Copie complète du framework
│   ├── cli\                     # CLI du framework
│   ├── templates\               # Templates disponibles
│   ├── MonSuperProjet\          # Votre projet créé
│   └── ...                      # Autres fichiers du framework
├── projects\                    # Dossier pour projets futurs
├── templates\                   # Templates personnalisés
└── backups\                     # Sauvegardes
```

---

## ✨ Avantages de cette approche

- 🎯 **Isolation complète** : Chaque projet a sa propre copie du framework
- 🔧 **VSCode friendly** : Reconnaissance automatique comme projet
- 📦 **Portable** : Tout le nécessaire dans un dossier
- ⚙️ **Configurable** : Utilise votre configuration personnelle
- 🚀 **Automatisé** : Un seul script fait tout le travail

---

## 🔧 Personnalisation

### Modifier les chemins par défaut
Éditez `project.ini` section `[PathsExterne]`:
```ini
[PathsExterne]
external_projects_path = D:\MesProjets\external\projects
external_templates_path = D:\MesProjets\external\templates  
external_backup_path = D:\MesProjets\external\backups
```

### Modifier la configuration du projet
Éditez `project.ini` section `[Project]`:
```ini
[Project]
name = MonProjetPersonnalise
description = Description personnalisée
version = 1.0.0
```

---

## 🆘 Dépannage

**Problème:** "Framework source introuvable"
- **Solution:** Vérifiez que vous êtes dans le dossier MyDevFramework

**Problème:** "Erreur npm install"  
- **Solution:** Lancez manuellement `npm install` dans le dossier du projet

**Problème:** "Port 5173 déjà utilisé"
- **Solution:** Arrêtez les autres serveurs Vite ou utilisez un autre port

---

## 📞 Support

En cas de problème, vérifiez:
1. Que Node.js est installé (`node --version`)
2. Que npm fonctionne (`npm --version`)
3. Que vous êtes dans le bon dossier
4. Que le fichier `project.ini` existe et est configuré
