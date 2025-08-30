@echo off
REM ============================================================================
REM LANCEMENT RAPIDE - Crée un projet externe avec la config de project.ini
REM ============================================================================

set EXTERNAL_BASE=C:\MyDevProject\external

if "%1"=="" (
    echo.
    echo 🚀 CRÉATION PROJET EXTERNE RAPIDE
    echo =================================
    echo.
    echo Usage: quick-external-project.bat NomDuProjet
    echo.
    echo Ce script utilise automatiquement:
    echo   - La configuration de project.ini
    echo   - Les chemins PathsExterne définis
    echo   - Le nom et la description du projet configurés
    echo.
    echo 📁 Le projet sera créé dans: %EXTERNAL_BASE%\framework\[NomDuProjet]
    echo 🛠️  Framework copié dans: %EXTERNAL_BASE%\framework\
    echo.
    pause
    exit /b 1
)

echo.
echo 🚀 Création rapide du projet externe: %1
echo ========================================
echo 📁 Destination: %EXTERNAL_BASE%\framework\%1
echo 🛠️  Framework: %EXTERNAL_BASE%\framework\
echo ⚙️  Config: project.ini [PathsExterne]
echo.

REM Lire la configuration depuis project.ini et créer automatiquement
call create-external-project.bat "%1"

echo.
echo 🎯 Projet créé dans: %EXTERNAL_BASE%\framework\%1
echo 📝 Pour ouvrir: code "%EXTERNAL_BASE%\framework\%1"
echo 🚀 Pour lancer: cd "%EXTERNAL_BASE%\framework\%1" && npm run dev
echo ✅ Création terminée !
pause
