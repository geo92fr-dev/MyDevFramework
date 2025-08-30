@echo off
chcp 65001 >nul
echo.
echo =======================================================
echo  MyDevFramework v1.3.0 - Création Simple
echo =======================================================
echo.

echo 🎯 Configuration actuelle:
echo    Chemin de base: C:\MyDevProject2
echo    Format: chemin_base\nom-projet\
echo.

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

echo.
echo 🚀 Création: C:\MyDevProject2\%project_name%\
node cli\fw.js create "%project_name%"
