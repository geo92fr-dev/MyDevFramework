@echo off
REM Script d'installation CLI Framework Personnel
REM Place le CLI dans le PATH pour utilisation globale

echo  Installation CLI Framework Personnel
echo =====================================

REM Créer dossier bin utilisateur si inexistant
if not exist "%USERPROFILE%\bin" mkdir "%USERPROFILE%\bin"

REM Copier le CLI
copy "C:\MyDevFramework\cli\fw.js" "%USERPROFILE%\bin\fw.js"

REM Créer script batch pour execution
echo @echo off > "%USERPROFILE%\bin\fw.bat"
echo node "%%USERPROFILE%%\bin\fw.js" %%* >> "%USERPROFILE%\bin\fw.bat"

echo  CLI installé dans %USERPROFILE%\bin\
echo.
echo  Pour utiliser globalement, ajouter à votre PATH:
echo    %USERPROFILE%\bin
echo.
echo  Usage: fw help
