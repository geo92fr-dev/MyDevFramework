@echo off
chcp 65001 >nul
echo.
echo ============================================================
echo  MyDevFramework v1.3.0 - Création Projet Auto-Config
echo ============================================================
echo.

echo 🎯 Utilise automatiquement la configuration de project.ini
echo    Nom du projet: Récupéré depuis [Project] name
echo    Chemin: Récupéré depuis [PathsExterne] external_projects_path
echo.

REM Créer le projet avec le nom configuré dans project.ini
node cli\fw.js create-auto

echo.
pause
