@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
echo.
echo ================================================================
echo  MyDevFramework v1.3.0 - Script Intelligent Architecture F/P
echo ================================================================
echo.

REM Lecture automatique de la configuration project.ini
set "config_file=project.ini"

if not exist "%config_file%" (
    echo ❌ Fichier project.ini non trouvé
    pause
    exit /b 1
)

echo 📋 Lecture de la configuration project.ini...

REM Extraction des chemins depuis project.ini
for /f "tokens=2 delims== " %%a in ('findstr "external_framework_path" %config_file%') do set "framework_path=%%a"
for /f "tokens=2 delims== " %%a in ('findstr "external_projects_path" %config_file%') do set "projects_path=%%a"

REM Nettoyage des espaces
set "framework_path=%framework_path: =%"
set "projects_path=%projects_path: =%"

echo.
echo 🎯 Configuration détectée:
echo    Framework cible: %framework_path%
echo    Projets cible:   %projects_path%
echo.

REM Vérification si l'architecture existe déjà
set "architecture_exists=false"
if exist "%framework_path%" if exist "%projects_path%" set "architecture_exists=true"

if "%architecture_exists%"=="true" (
    echo ✅ Architecture Framework/Projects détectée
    echo.
    echo Que souhaitez-vous faire ?
    echo 1. Créer un nouveau projet dans la zone projets
    echo 2. Ouvrir le framework dans VSCode  
    echo 3. Ouvrir la zone projets dans VSCode
    echo 4. Recréer l'architecture complète
    echo.
    set /p "choice=Votre choix (1-4): "
    
    if "!choice!"=="1" (
        cd /d "%projects_path%"
        if exist "create-project.bat" (
            call create-project.bat
        ) else (
            echo ❌ Script create-project.bat non trouvé
            pause
        )
    ) else if "!choice!"=="2" (
        code "%framework_path%"
    ) else if "!choice!"=="3" (
        code "%projects_path%"
    ) else if "!choice!"=="4" (
        call create-framework-projects-separation.bat
    ) else (
        echo ❌ Choix invalide
        pause
    )
) else (
    echo ❌ Architecture Framework/Projects non détectée
    echo.
    set /p "create_confirm=Voulez-vous créer l'architecture Framework/Projects ? (o/N): "
    if /i "!create_confirm!"=="o" (
        call create-framework-projects-separation.bat
    ) else (
        echo ❌ Opération annulée
        pause
    )
)
