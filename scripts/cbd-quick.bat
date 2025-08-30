@echo off
REM Script rapide pour validation CBD
echo 🤖 CBD Quick Validation
echo.

if "%1"=="" (
    echo Usage: cbd-quick.bat "votre prompt ici"
    exit /b 1
)

node tools/cbd/cbd-orchestrator.js "%1"
REM pause supprimé pour éviter l'attente d'interaction
