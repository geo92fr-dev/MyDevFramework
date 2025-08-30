@echo off
chcp 65001 >nul
echo.
echo ============================================================
echo  MyDevFramework v1.3.0 - Création Projet Externe
echo ============================================================
echo.

echo 🎯 Mode EXTERNE UNIQUEMENT - Projets avec Git indépendant
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
echo 🚀 Création du projet externe: %project_name%
call create-external-only.bat "%project_name%"
