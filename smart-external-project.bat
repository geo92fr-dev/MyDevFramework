@echo off
setlocal EnableDelayedExpansion

REM ============================================================================
REM LANCEMENT RAPIDE INTELLIGENT - Lit project.ini pour les chemins
REM ============================================================================

if "%1"=="" (
    echo.
    echo 🚀 CRÉATION PROJET EXTERNE RAPIDE (INTELLIGENT)
    echo ===============================================
    echo.
    echo Usage: smart-external-project.bat NomDuProjet
    echo.
    echo Ce script:
    echo   ✅ Lit automatiquement project.ini
    echo   ✅ Utilise les chemins [PathsExterne] configurés
    echo   ✅ Affiche la destination avant création
    echo   ✅ Donne les commandes exactes après création
    echo.
    pause
    exit /b 1
)

set PROJECT_NAME=%1

echo.
echo 🔍 Lecture de la configuration project.ini...
echo =============================================

REM Lire les chemins depuis project.ini
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

REM Déduire le chemin de base
for %%a in ("!EXTERNAL_PROJECTS!") do set EXTERNAL_BASE=%%~dpa
set EXTERNAL_BASE=!EXTERNAL_BASE:~0,-1!

echo ✅ Configuration lue depuis project.ini:
echo    📁 Projets: !EXTERNAL_PROJECTS!
echo    🎨 Templates: !EXTERNAL_TEMPLATES!
echo    💾 Backups: !EXTERNAL_BACKUP!
echo    🏠 Base: !EXTERNAL_BASE!
echo.

set FRAMEWORK_PATH=!EXTERNAL_BASE!\framework
set PROJECT_PATH=!FRAMEWORK_PATH!\%PROJECT_NAME%

echo 🎯 INFORMATIONS DE CRÉATION:
echo ============================
echo 📦 Nom du projet: %PROJECT_NAME%
echo 📁 Sera créé dans: !PROJECT_PATH!
echo 🛠️  Framework sera dans: !FRAMEWORK_PATH!
echo.

set /p CONFIRM=🤔 Continuer avec ces paramètres ? (O/n): 
if /i "!CONFIRM!"=="n" (
    echo ❌ Création annulée par l'utilisateur
    pause
    exit /b 0
)

echo.
echo 🚀 Lancement de la création...
echo ==============================

REM Appeler le script principal
call create-external-project.bat "%PROJECT_NAME%"

echo.
echo 🎉 CRÉATION TERMINÉE !
echo =====================
echo 📁 Projet créé: !PROJECT_PATH!
echo.
echo 🔧 COMMANDES UTILES:
echo   Ouvrir VSCode:     code "!PROJECT_PATH!"
echo   Aller au projet:   cd "!PROJECT_PATH!"
echo   Lancer le serveur: npm run dev
echo   Ouvrir browser:    start http://localhost:5173
echo.
echo 📋 COMMANDE COMPLÈTE COPY/PASTE:
echo cd "!PROJECT_PATH!" && code . && npm run dev
echo.

set /p OPEN_NOW=🚀 Voulez-vous ouvrir le projet maintenant ? (O/n): 
if /i "!OPEN_NOW!"=="O" (
    echo 🎯 Ouverture du projet...
    cd "!PROJECT_PATH!"
    start code .
) else if /i "!OPEN_NOW!"=="" (
    echo 🎯 Ouverture du projet...
    cd "!PROJECT_PATH!"
    start code .
)

echo ✅ Script terminé !
pause
