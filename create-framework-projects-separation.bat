@echo off
chcp 65001 >nul
echo.
echo ====================================================================
echo  MyDevFramework v1.3.0 - Création Architecture Framework/Projects
echo ====================================================================
echo.

REM Configuration des chemins
set "FRAMEWORK_SOURCE=C:\MyDevFramework"
set "TARGET_BASE=C:\MyDevProject"
set "FRAMEWORK_TARGET=%TARGET_BASE%\framework"
set "PROJECTS_TARGET=%TARGET_BASE%\projects"

REM Vérification que nous sommes dans le bon dossier source
if not exist "%FRAMEWORK_SOURCE%\package.json" (
    echo ❌ Erreur: Ce script doit être exécuté depuis le dossier MyDevFramework
    echo    Dossier actuel: %CD%
    echo    Dossier attendu: %FRAMEWORK_SOURCE%
    pause
    exit /b 1
)

echo 📋 Configuration détectée:
echo    Framework source: %FRAMEWORK_SOURCE%
echo    Framework target: %FRAMEWORK_TARGET%
echo    Projects target:  %PROJECTS_TARGET%
echo.

REM Confirmation utilisateur
set /p "confirm=Voulez-vous créer cette architecture séparée ? (o/N): "
if /i not "%confirm%"=="o" if /i not "%confirm%"=="oui" (
    echo ❌ Opération annulée par l'utilisateur
    pause
    exit /b 0
)

echo.
echo 🚀 Début de la création de l'architecture...

REM ==========================================
REM ÉTAPE 1: Création des dossiers principaux
REM ==========================================
echo.
echo [1/7] 📁 Création de la structure de dossiers...

if not exist "%TARGET_BASE%" mkdir "%TARGET_BASE%"
if not exist "%FRAMEWORK_TARGET%" mkdir "%FRAMEWORK_TARGET%"
if not exist "%PROJECTS_TARGET%" mkdir "%PROJECTS_TARGET%"
if not exist "%PROJECTS_TARGET%\templates" mkdir "%PROJECTS_TARGET%\templates"
if not exist "%PROJECTS_TARGET%\backups" mkdir "%PROJECTS_TARGET%\backups"

echo ✅ Structure de dossiers créée

REM ==========================================
REM ÉTAPE 2: Copie complète du framework
REM ==========================================
echo.
echo [2/7] 📦 Copie du framework complet vers %FRAMEWORK_TARGET%...

robocopy "%FRAMEWORK_SOURCE%" "%FRAMEWORK_TARGET%" /E /XD .git node_modules /XF .gitignore *.log /NFL /NDL /NJH /NJS /nc /ns /np
if %errorlevel% geq 8 (
    echo ❌ Erreur lors de la copie du framework
    pause
    exit /b 1
)

echo ✅ Framework copié avec succès

REM ==========================================
REM ÉTAPE 3: Configuration du framework copié
REM ==========================================
echo.
echo [3/7] ⚙️ Configuration du framework copié...

REM Modification du project.ini dans le framework copié pour mode LOCAL
powershell -Command "(Get-Content '%FRAMEWORK_TARGET%\project.ini') -replace 'creation_mode = EXTERNE', 'creation_mode = LOCAL' | Set-Content '%FRAMEWORK_TARGET%\project.ini' -Encoding UTF8"

echo ✅ Framework configuré en mode LOCAL

REM ==========================================
REM ÉTAPE 4: Initialisation Git du framework
REM ==========================================
echo.
echo [4/7] 🔗 Configuration Git du framework...

cd /d "%FRAMEWORK_TARGET%"
git init
git remote add origin https://github.com/geo92fr-dev/MyDevFramework.git
git add .
git config user.name "geo92fr-dev"
git config user.email "geo92fr@gmail.com"
git commit -m "Framework copié depuis MyDevFramework v1.3.0"

echo ✅ Git configuré pour le framework

REM ==========================================
REM ÉTAPE 5: Installation des dépendances
REM ==========================================
echo.
echo [5/7] 📦 Installation des dépendances npm dans le framework...

if exist "%FRAMEWORK_TARGET%\package.json" (
    npm install
    echo ✅ Dépendances installées
) else (
    echo ⚠️ Pas de package.json trouvé
)

REM ==========================================
REM ÉTAPE 6: Création de la zone projets
REM ==========================================
echo.
echo [6/7] 🎯 Configuration de la zone projets...

cd /d "%PROJECTS_TARGET%"

REM Création d'un README pour la zone projets
echo # Zone de Projets> README.md
echo.>> README.md
echo Cette zone contient vos projets créés avec MyDevFramework.>> README.md
echo.>> README.md
echo ## Structure>> README.md
echo - `templates/` : Templates personnalisés>> README.md
echo - `backups/` : Sauvegardes de projets>> README.md
echo - `nom-projet/` : Vos projets individuels avec leur propre Git>> README.md
echo.>> README.md
echo ## Framework>> README.md
echo Le framework MyDevFramework est disponible dans `../framework/`>> README.md

REM Initialisation Git pour la zone projets
git init
git config user.name "Raphaël GEOFFROY"
git config user.email "geo92fr@gmail.com"
git add README.md
git commit -m "Initialisation de la zone projets"

echo ✅ Zone projets initialisée avec son propre Git

REM ==========================================
REM ÉTAPE 7: Scripts d'aide
REM ==========================================
echo.
echo [7/7] 🛠️ Création des scripts d'aide...

REM Script pour créer un nouveau projet
echo @echo off> create-project.bat
echo cd /d "%FRAMEWORK_TARGET%">> create-project.bat
echo node cli\fw.js create-project>> create-project.bat

REM Script pour ouvrir VSCode sur le framework
echo @echo off> open-framework.bat
echo code "%FRAMEWORK_TARGET%">> open-framework.bat

REM Script pour ouvrir VSCode sur les projets
echo @echo off> open-projects.bat
echo code "%PROJECTS_TARGET%">> open-projects.bat

echo ✅ Scripts d'aide créés

REM ==========================================
REM RÉCAPITULATIF FINAL
REM ==========================================
echo.
echo ====================================================================
echo ✅ ARCHITECTURE FRAMEWORK/PROJECTS CRÉÉE AVEC SUCCÈS !
echo ====================================================================
echo.
echo 📁 Structure créée:
echo    %TARGET_BASE%\
echo    ├── framework\          # MyDevFramework (Git: MyDevFramework)
echo    │   ├── cli\
echo    │   ├── core\
echo    │   ├── templates\
echo    │   └── ... (framework complet)
echo    └── projects\           # Zone projets (Git indépendant)
echo        ├── templates\      # Templates personnalisés
echo        ├── backups\        # Sauvegardes
echo        ├── create-project.bat
echo        ├── open-framework.bat
echo        ├── open-projects.bat
echo        └── README.md
echo.
echo 🎯 Utilisation:
echo    1. cd %PROJECTS_TARGET%
echo    2. create-project.bat    # Créer un nouveau projet
echo    3. open-framework.bat    # Ouvrir le framework dans VSCode
echo    4. open-projects.bat     # Ouvrir la zone projets dans VSCode
echo.
echo 🔗 Contrôle de version:
echo    - Framework: Lié à https://github.com/geo92fr-dev/MyDevFramework
echo    - Projets: Git indépendant pour chaque projet créé
echo.

cd /d "%PROJECTS_TARGET%"
echo 💡 Vous êtes maintenant dans la zone projets: %PROJECTS_TARGET%
echo    Utilisez 'create-project.bat' pour créer votre premier projet !
echo.
pause
