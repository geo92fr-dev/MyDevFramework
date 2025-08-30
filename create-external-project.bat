@echo off
setlocal EnableDelayedExpansion

REM ============================================================================
REM SCRIPT DE CRÉATION DE PROJET EXTERNE - MyDevFramework
REM ============================================================================
echo.
echo 🚀 CRÉATION PROJET EXTERNE - MyDevFramework
echo ============================================================================

REM Vérifier si un nom de projet est fourni
if "%1"=="" (
    echo ❌ Erreur: Nom du projet requis
    echo Usage: create-external-project.bat MonNomDeProjet
    echo.
    pause
    exit /b 1
)

set PROJECT_NAME=%1
set FRAMEWORK_SOURCE=C:\MyDevFramework
set EXTERNAL_BASE=C:\MyDevProject\external

echo 📋 Projet à créer: %PROJECT_NAME%
echo 📂 Framework source: %FRAMEWORK_SOURCE%
echo 🎯 Destination externe: %EXTERNAL_BASE%
echo.

REM Étape 1: Créer les dossiers externes
echo ⚡ Étape 1/6: Création des dossiers externes...
if not exist "%EXTERNAL_BASE%" (
    mkdir "%EXTERNAL_BASE%"
    echo ✅ Dossier créé: %EXTERNAL_BASE%
) else (
    echo ℹ️  Dossier existe déjà: %EXTERNAL_BASE%
)

if not exist "%EXTERNAL_BASE%\projects" mkdir "%EXTERNAL_BASE%\projects"
if not exist "%EXTERNAL_BASE%\templates" mkdir "%EXTERNAL_BASE%\templates"
if not exist "%EXTERNAL_BASE%\backups" mkdir "%EXTERNAL_BASE%\backups"
echo ✅ Structure des dossiers externes créée
echo.

REM Étape 2: Copier le framework vers le dossier externe
echo ⚡ Étape 2/6: Copie du framework...
set FRAMEWORK_DEST=%EXTERNAL_BASE%\framework
if exist "%FRAMEWORK_DEST%" (
    echo ℹ️  Framework déjà présent, mise à jour...
    rmdir /s /q "%FRAMEWORK_DEST%"
)

xcopy "%FRAMEWORK_SOURCE%" "%FRAMEWORK_DEST%" /e /i /q /y
if errorlevel 1 (
    echo ❌ Erreur lors de la copie du framework
    pause
    exit /b 1
)
echo ✅ Framework copié vers: %FRAMEWORK_DEST%
echo.

REM Étape 3: Configurer le mode EXTERNE dans le framework copié
echo ⚡ Étape 3/6: Configuration du mode EXTERNE...
cd /d "%FRAMEWORK_DEST%"
node cli/fw.js ini mode EXTERNE
if errorlevel 1 (
    echo ❌ Erreur lors de la configuration du mode EXTERNE
    pause
    exit /b 1
)
echo ✅ Mode EXTERNE configuré
echo.

REM Étape 4: Créer le projet
echo ⚡ Étape 4/6: Création du projet %PROJECT_NAME%...
node cli/fw.js create "%PROJECT_NAME%"
if errorlevel 1 (
    echo ❌ Erreur lors de la création du projet
    pause
    exit /b 1
)
echo ✅ Projet %PROJECT_NAME% créé avec succès
echo.

REM Étape 5: Installer les dépendances
echo ⚡ Étape 5/6: Installation des dépendances npm...
cd /d "%FRAMEWORK_DEST%\%PROJECT_NAME%"
call npm install --silent
if errorlevel 1 (
    echo ⚠️  Attention: Erreur lors de l'installation npm
    echo Vous pouvez installer manuellement avec: npm install
) else (
    echo ✅ Dépendances npm installées
)
echo.

REM Étape 6: Informations finales
echo ⚡ Étape 6/6: Finalisation...
echo.
echo 🎉 PROJET EXTERNE CRÉÉ AVEC SUCCÈS !
echo ============================================================================
echo 📁 Emplacement du projet: %FRAMEWORK_DEST%\%PROJECT_NAME%
echo 🛠️  Framework externe: %FRAMEWORK_DEST%
echo.
echo 📝 PROCHAINES ÉTAPES:
echo    1. Ouvrir VSCode dans: %FRAMEWORK_DEST%\%PROJECT_NAME%
echo    2. Lancer le serveur: npm run dev
echo    3. Ouvrir: http://localhost:5173
echo.
echo 🚀 COMMANDES RAPIDES:
echo    cd /d "%FRAMEWORK_DEST%\%PROJECT_NAME%"
echo    code .
echo    npm run dev
echo.
echo ✨ Projet prêt pour le développement !
echo ============================================================================

REM Proposer d'ouvrir VSCode automatiquement
echo.
set /p OPEN_VSCODE=🤔 Voulez-vous ouvrir le projet dans VSCode maintenant ? (O/n): 
if /i "!OPEN_VSCODE!"=="O" (
    echo 🎯 Ouverture de VSCode...
    cd /d "%FRAMEWORK_DEST%\%PROJECT_NAME%"
    code .
) else if /i "!OPEN_VSCODE!"=="" (
    echo 🎯 Ouverture de VSCode...
    cd /d "%FRAMEWORK_DEST%\%PROJECT_NAME%"
    code .
)

echo.
echo ✅ Script terminé avec succès !
pause
