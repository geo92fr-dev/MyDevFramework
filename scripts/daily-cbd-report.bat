@echo off
REM Rapport quotidien CBD
echo 📊 Rapport CBD Quotidien
echo.

node tools/cbd/cbd-analytics.js report
echo.

REM Nettoyage automatique des logs anciens (plus de 30 jours)
node tools/cbd/cbd-analytics.js clean --auto
echo ✅ Nettoyage automatique terminé

REM pause supprimé pour éviter l'attente d'interaction
