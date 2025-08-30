@echo off
chcp 65001 >nul
echo.
echo ================================================================
echo  MyDevFramework v1.3.0 - Aperçu Architecture Framework/Projects
echo ================================================================
echo.

REM Lecture de la configuration
set "config_file=project.ini"
if not exist "%config_file%" (
    echo ❌ Fichier project.ini non trouvé
    pause
    exit /b 1
)

echo 📋 Configuration actuelle dans project.ini:
echo ============================================

REM Extraction des chemins
for /f "tokens=2 delims== " %%a in ('findstr "external_framework_path" %config_file%') do set "framework_path=%%a"
for /f "tokens=2 delims== " %%a in ('findstr "external_projects_path" %config_file%') do set "projects_path=%%a"
for /f "tokens=2 delims== " %%a in ('findstr "external_templates_path" %config_file%') do set "templates_path=%%a"
for /f "tokens=2 delims== " %%a in ('findstr "external_backup_path" %config_file%') do set "backup_path=%%a"

REM Nettoyage des espaces
set "framework_path=%framework_path: =%"
set "projects_path=%projects_path: =%"
set "templates_path=%templates_path: =%"
set "backup_path=%backup_path: =%"

echo    Framework: %framework_path%
echo    Projets:   %projects_path%
echo    Templates: %templates_path%
echo    Backups:   %backup_path%

echo.
echo 📁 Structure qui sera créée:
echo ============================
echo %projects_path%\..\
echo ├── framework\                    # MyDevFramework complet
echo │   ├── cli\                      # Outils CLI
echo │   ├── core\                     # Core du framework  
echo │   ├── templates\                # Templates du framework
echo │   ├── .git\                     # Git lié à MyDevFramework
echo │   └── ...                       # Tous les fichiers du framework
echo └── projects\                     # Zone de travail
echo     ├── templates\                # Templates personnalisés
echo     ├── backups\                  # Sauvegardes
echo     ├── .git\                     # Git indépendant
echo     ├── create-project.bat        # Script création projet
echo     ├── open-framework.bat        # Ouvrir framework VSCode
echo     ├── open-projects.bat         # Ouvrir projets VSCode
echo     ├── README.md                 # Documentation
echo     └── [vos-projets]\            # Projets avec leur propre Git
echo.

REM Vérification de l'état actuel
set "architecture_exists=false"
if exist "%framework_path%" if exist "%projects_path%" set "architecture_exists=true"

if "%architecture_exists%"=="true" (
    echo ✅ Architecture Framework/Projects EXISTE DÉJÀ
    echo.
    echo Actions disponibles:
    echo    A. smart-framework-projects.bat    # Menu intelligent
    echo    B. create-framework-projects-separation.bat    # Recréer
    echo.
) else (
    echo ❌ Architecture Framework/Projects N'EXISTE PAS ENCORE
    echo.
    echo 🎯 Avantages de cette architecture:
    echo    ✅ Framework isolé avec son Git MyDevFramework
    echo    ✅ Zone projets avec Git indépendant
    echo    ✅ Chaque projet créé aura son propre Git
    echo    ✅ Séparation claire framework/workspace
    echo    ✅ Évolution indépendante du framework
    echo.
)

echo Actions possibles:
echo 1. Créer l'architecture Framework/Projects
echo 2. Utiliser le menu intelligent  
echo 3. Quitter
echo.
set /p "choice=Votre choix (1-3): "

if "%choice%"=="1" (
    call create-framework-projects-separation.bat
) else if "%choice%"=="2" (
    call smart-framework-projects.bat
) else (
    echo ❌ Au revoir !
    pause
)
