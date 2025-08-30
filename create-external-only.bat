@echo off
chcp 65001 >nul
echo.
echo ================================================================
echo  MyDevFramework v1.3.0 - Création Projet Externe UNIQUEMENT
echo ================================================================
echo.

REM MyDevFramework ne crée QUE des projets externes
echo 🎯 MyDevFramework - Mode EXTERNE UNIQUEMENT
echo    Tous les projets sont créés en dehors du framework
echo    Chaque projet a son propre Git indépendant
echo.

REM Lecture de la configuration project.ini
set "config_file=project.ini"
if not exist "%config_file%" (
    echo ❌ Fichier project.ini non trouvé
    pause
    exit /b 1
)

echo 📋 Lecture de la configuration...

REM Extraction des chemins depuis project.ini
for /f "tokens=2 delims== " %%a in ('findstr "external_projects_path" %config_file%') do set "projects_path=%%a"
for /f "tokens=2 delims== " %%a in ('findstr "external_templates_path" %config_file%') do set "templates_path=%%a"
for /f "tokens=2 delims== " %%a in ('findstr "external_backup_path" %config_file%') do set "backup_path=%%a"

REM Nettoyage des espaces
set "projects_path=%projects_path: =%"
set "templates_path=%templates_path: =%"
set "backup_path=%backup_path: =%"

echo.
echo 🎯 Configuration des projets externes:
echo    Base: %projects_path%
echo    Templates: %templates_path%
echo    Backups: %backup_path%
echo.

REM Demander le nom du projet
if "%1"=="" (
    set /p "project_name=Nom du projet à créer: "
) else (
    set "project_name=%1"
)

if "%project_name%"=="" (
    echo ❌ Nom de projet requis
    pause
    exit /b 1
)

set "project_full_path=%projects_path%\%project_name%"

echo.
echo 🚀 Création du projet externe: %project_name%
echo    Destination: %project_full_path%
echo.

REM Vérifier si le projet existe déjà
if exist "%project_full_path%" (
    echo ❌ Le projet %project_name% existe déjà dans %project_full_path%
    pause
    exit /b 1
)

REM Créer les dossiers de base
if not exist "%projects_path%" mkdir "%projects_path%"
if not exist "%templates_path%" mkdir "%templates_path%"
if not exist "%backup_path%" mkdir "%backup_path%"

echo ✅ Dossiers de base créés

REM Utiliser le CLI pour créer le projet
echo.
echo 📦 Création du projet avec le CLI MyDevFramework...
node cli\fw.js create-project "%project_name%" --external-path "%projects_path%"

if %errorlevel% neq 0 (
    echo ❌ Erreur lors de la création du projet
    pause
    exit /b 1
)

echo.
echo ✅ Projet externe créé avec succès !
echo.
echo 🎯 Prochaines étapes:
echo    1. cd "%project_full_path%"
echo    2. code .                    # Ouvrir dans VSCode
echo    3. npm install               # Installer les dépendances
echo    4. git remote add origin [URL]  # Ajouter votre repository
echo.
echo 💡 Le projet a son propre Git indépendant de MyDevFramework
echo.
pause
