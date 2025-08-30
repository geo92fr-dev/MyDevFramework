@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
echo.
echo ================================================================
echo  MyDevFramework v1.3.0 - Script Intelligent EXTERNE UNIQUEMENT
echo ================================================================
echo.

echo 🎯 MyDevFramework - Mode EXTERNE UNIQUEMENT
echo    Création de projets externes avec Git indépendant
echo.

if "%1"=="" (
    echo Usage: smart-external-project.bat [NomDuProjet]
    echo.
    set /p "project_name=Nom du projet à créer: "
) else (
    set "project_name=%1"
)

if "%project_name%"=="" (
    echo ❌ Nom de projet requis
    pause
    exit /b 1
)

echo.
echo � Lancement de la création du projet externe: %project_name%
call create-external-only.bat "%project_name%"

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
