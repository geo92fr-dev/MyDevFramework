@echo off
setlocal EnableDelayedExpansion

REM ============================================================================
REM APERÇU PROJET EXTERNE - Montre ce qui sera créé sans le créer
REM ============================================================================

if "%1"=="" (
    echo.
    echo 👁️  APERÇU PROJET EXTERNE
    echo ========================
    echo.
    echo Usage: preview-external-project.bat NomDuProjet
    echo.
    echo Ce script montre exactement ce qui sera créé
    echo sans effectuer la création.
    echo.
    pause
    exit /b 1
)

set PROJECT_NAME=%1

echo.
echo 👁️  APERÇU DE CRÉATION PROJET EXTERNE
echo ====================================
echo 📦 Nom du projet: %PROJECT_NAME%
echo.

REM Lire la configuration depuis project.ini
echo 🔍 Lecture de project.ini...

for /f "tokens=2 delims==" %%a in ('type project.ini ^| findstr "external_projects_path"') do (
    set EXTERNAL_PROJECTS=%%a
    set EXTERNAL_PROJECTS=!EXTERNAL_PROJECTS: =!
)

for /f "tokens=2 delims==" %%a in ('type project.ini ^| findstr "external_templates_path"') do (
    set EXTERNAL_TEMPLATES=%%a
    set EXTERNAL_TEMPLATES=!EXTERNAL_TEMPLATES: =!
)

for /f "tokens=2 delims==" %%a in ('type project.ini ^| findstr "external_backup_path"') do (
    set EXTERNAL_BACKUP=%%a
    set EXTERNAL_BACKUP=!EXTERNAL_BACKUP: =!
)

REM Lire d'autres infos du projet
for /f "tokens=2 delims==" %%a in ('type project.ini ^| findstr "^name"') do (
    set PROJ_NAME=%%a
    set PROJ_NAME=!PROJ_NAME: =!
)

for /f "tokens=2 delims==" %%a in ('type project.ini ^| findstr "^description"') do (
    set PROJ_DESC=%%a
    set PROJ_DESC=!PROJ_DESC: =!
)

for /f "tokens=2 delims==" %%a in ('type project.ini ^| findstr "^author"') do (
    set PROJ_AUTHOR=%%a
    set PROJ_AUTHOR=!PROJ_AUTHOR: =!
)

for %%a in ("!EXTERNAL_PROJECTS!") do set EXTERNAL_BASE=%%~dpa
set EXTERNAL_BASE=!EXTERNAL_BASE:~0,-1!

set FRAMEWORK_PATH=!EXTERNAL_BASE!\framework
set PROJECT_PATH=!FRAMEWORK_PATH!\%PROJECT_NAME%

echo.
echo 📋 CONFIGURATION DÉTECTÉE:
echo ===========================
echo 👤 Auteur: !PROJ_AUTHOR!
echo 📝 Description template: !PROJ_DESC!
echo 🎨 Template: svelte-firebase-instant
echo.

echo 📁 STRUCTURE QUI SERA CRÉÉE:
echo =============================
echo !EXTERNAL_BASE!\
echo ├── framework\                    [Framework complet copié]
echo │   ├── cli\                     [CLI du framework]  
echo │   ├── templates\               [Templates disponibles]
echo │   ├── %PROJECT_NAME%\          [VOTRE PROJET ICI]
echo │   │   ├── src\                [Code source SvelteKit]
echo │   │   ├── package.json        [Config npm du projet]
echo │   │   ├── README.md           [Documentation projet]
echo │   │   └── ...                 [Autres fichiers template]
echo │   └── ...                     [Autres fichiers framework]
echo ├── projects\                    [Dossier pour futurs projets]
echo ├── templates\                   [Templates personnalisés]
echo └── backups\                     [Sauvegardes]
echo.

echo 🎯 CHEMINS EXACTS:
echo ==================
echo 📦 Projet final: !PROJECT_PATH!
echo 🛠️  Framework: !FRAMEWORK_PATH!
echo 📁 Base externe: !EXTERNAL_BASE!
echo.

echo 🔧 COMMANDES POST-CRÉATION:
echo ===========================
echo   Aller au projet:   cd "!PROJECT_PATH!"
echo   Ouvrir VSCode:      code "!PROJECT_PATH!"
echo   Installer deps:     npm install
echo   Lancer serveur:     npm run dev
echo   Ouvrir browser:     start http://localhost:5173
echo.

echo 📋 COMMANDE COMPLÈTE:
echo =====================
echo cd "!PROJECT_PATH!" ^&^& code . ^&^& npm run dev
echo.

echo ⚡ ACTIONS DISPONIBLES:
echo =======================
echo   1. Lancer la création maintenant
echo   2. Modifier project.ini avant création  
echo   3. Quitter sans rien faire
echo.

set /p ACTION=🤔 Que voulez-vous faire ? (1/2/3): 

if "!ACTION!"=="1" (
    echo.
    echo 🚀 Lancement de la création...
    call create-external-project.bat "%PROJECT_NAME%"
) else if "!ACTION!"=="2" (
    echo.
    echo ⚙️  Ouverture de project.ini pour modification...
    notepad project.ini
    echo.
    echo ℹ️  Après modification, relancez ce script pour voir les changements
) else (
    echo.
    echo ✅ Aucune action effectuée
)

echo.
pause
