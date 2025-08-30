@echo off
chcp 65001 >nul
echo.
echo ================================================================
echo  MyDevFramework v1.3.0 - Initialisation Structure Framework/Projects
echo ================================================================
echo.

REM Configuration des chemins depuis project.ini
set "TARGET_BASE=C:\MyDevProject2"
set "FRAMEWORK_TARGET=%TARGET_BASE%\framework"
set "PROJECTS_TARGET=%TARGET_BASE%\projects"

echo 🎯 Initialisation de la structure Framework/Projects
echo    Base: %TARGET_BASE%
echo    Framework: %FRAMEWORK_TARGET%
echo    Projets: %PROJECTS_TARGET%
echo.

REM Vérification si déjà initialisé
if exist "%FRAMEWORK_TARGET%" if exist "%PROJECTS_TARGET%" (
    echo ✅ Structure Framework/Projects déjà initialisée !
    echo.
    echo Actions disponibles:
    echo    1. Créer un nouveau projet
    echo    2. Ouvrir framework dans VSCode
    echo    3. Ouvrir zone projets dans VSCode
    echo    4. Réinitialiser la structure
    echo.
    set /p "choice=Votre choix (1-4): "
    
    if "!choice!"=="1" (
        cd /d "%PROJECTS_TARGET%"
        echo 🚀 Création d'un nouveau projet...
        set /p "project_name=Nom du projet: "
        if not "!project_name!"=="" (
            cd /d "%FRAMEWORK_TARGET%"
            node cli\fw.js create "!project_name!"
        )
    ) else if "!choice!"=="2" (
        code "%FRAMEWORK_TARGET%"
    ) else if "!choice!"=="3" (
        code "%PROJECTS_TARGET%"
    ) else if "!choice!"=="4" (
        goto :INIT_STRUCTURE
    )
    goto :END
)

:INIT_STRUCTURE
echo.
echo 🚀 Création de la structure Framework/Projects...

REM ==========================================
REM ÉTAPE 1: Création des dossiers principaux
REM ==========================================
echo.
echo [1/5] 📁 Création de la structure de dossiers...

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
echo [2/5] 📦 Copie du framework vers %FRAMEWORK_TARGET%...

robocopy "C:\MyDevFramework" "%FRAMEWORK_TARGET%" /E /XD .git node_modules /XF .gitignore *.log /NFL /NDL /NJH /NJS /nc /ns /np
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
echo [3/5] ⚙️ Configuration du framework copié pour mode LOCAL...

REM Modifier le project.ini dans le framework copié pour mode LOCAL
powershell -Command "(Get-Content '%FRAMEWORK_TARGET%\project.ini') -replace 'creation_mode = EXTERNE', 'creation_mode = LOCAL' | Set-Content '%FRAMEWORK_TARGET%\project.ini' -Encoding UTF8"

echo ✅ Framework configuré en mode LOCAL

REM ==========================================
REM ÉTAPE 4: Initialisation Git du framework
REM ==========================================
echo.
echo [4/5] 🔗 Configuration Git du framework...

cd /d "%FRAMEWORK_TARGET%"
git init
git remote add origin https://github.com/geo92fr-dev/MyDevFramework.git
git add .
git config user.name "geo92fr-dev"
git config user.email "geo92fr@gmail.com"
git commit -m "Framework copié depuis MyDevFramework v1.3.0"

echo ✅ Git configuré pour le framework

REM ==========================================
REM ÉTAPE 5: Création de la zone projets
REM ==========================================
echo.
echo [5/5] 🎯 Configuration de la zone projets...

cd /d "%PROJECTS_TARGET%"

REM Création d'un README pour la zone projets
echo # Zone de Projets MyDevFramework> README.md
echo.>> README.md
echo Cette zone contient vos projets créés avec MyDevFramework.>> README.md
echo.>> README.md
echo ## Structure>> README.md
echo - `templates/` : Templates personnalisés>> README.md
echo - `backups/` : Sauvegardes de projets>> README.md
echo - `nom-projet/` : Vos projets avec leur propre Git>> README.md
echo.>> README.md
echo ## Framework>> README.md
echo Le framework MyDevFramework est dans `../framework/`>> README.md
echo.>> README.md
echo ## Utilisation>> README.md
echo ```bash>> README.md
echo # Créer un nouveau projet>> README.md
echo cd ../framework>> README.md
echo node cli\fw.js create mon-nouveau-projet>> README.md
echo ```>> README.md

REM Scripts d'aide
echo @echo off> create-project.bat
echo cd /d "%FRAMEWORK_TARGET%">> create-project.bat
echo if "%%1"=="" (>> create-project.bat
echo   set /p "project_name=Nom du projet: ">> create-project.bat
echo ^) else (>> create-project.bat
echo   set "project_name=%%1">> create-project.bat
echo ^)>> create-project.bat
echo node cli\fw.js create "%%project_name%%">> create-project.bat

echo @echo off> open-framework.bat
echo code "%FRAMEWORK_TARGET%">> open-framework.bat

echo @echo off> open-projects.bat
echo code "%PROJECTS_TARGET%">> open-projects.bat

REM Initialisation Git pour la zone projets
git init
git config user.name "Raphaël GEOFFROY"
git config user.email "geo92fr@gmail.com"
git add .
git commit -m "Initialisation zone projets MyDevFramework"

echo ✅ Zone projets initialisée avec son propre Git

REM ==========================================
REM RÉCAPITULATIF FINAL
REM ==========================================
:END
echo.
echo ====================================================================
echo ✅ STRUCTURE FRAMEWORK/PROJECTS INITIALISÉE !
echo ====================================================================
echo.
echo 📁 Structure créée:
echo    %TARGET_BASE%\
echo    ├── framework\          # MyDevFramework (Git: MyDevFramework)
echo    │   ├── cli\            # Interface CLI
echo    │   ├── core\           # Cœur framework
echo    │   ├── templates\      # Templates du framework
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
echo    2. create-project.bat mon-projet    # Créer projet
echo    3. open-framework.bat              # Framework VSCode
echo    4. open-projects.bat               # Projets VSCode
echo.
echo 🔗 Contrôle de version:
echo    - Framework: Lié à MyDevFramework GitHub
echo    - Projets: Git indépendant pour chaque projet
echo.

cd /d "%PROJECTS_TARGET%"
echo 💡 Vous êtes dans la zone projets: %PROJECTS_TARGET%
echo    Utilisez 'create-project.bat nom-projet' pour créer !
echo.
pause
