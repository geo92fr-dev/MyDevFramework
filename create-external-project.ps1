# ============================================================================
# SCRIPT DE CRÉATION DE PROJET EXTERNE - MyDevFramework (PowerShell)
# Usage: .\create-external-project.ps1 MonNomDeProjet
# ============================================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectName,
    
    [string]$ExternalBase = "C:\MyDevProject\external",
    [string]$FrameworkSource = "C:\MyDevFramework",
    [switch]$OpenVSCode,
    [switch]$StartDev
)

# Configuration des couleurs
$Host.UI.RawUI.ForegroundColor = "White"

function Write-Step {
    param([string]$Message, [string]$Color = "Cyan")
    Write-Host "⚡ $Message" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor "Green"
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor "Red"
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor "Yellow"
}

# Banner
Write-Host ""
Write-Host "🚀 CRÉATION PROJET EXTERNE - MyDevFramework" -ForegroundColor "Cyan"
Write-Host "============================================================================" -ForegroundColor "Cyan"
Write-Host ""

Write-Host "📋 Projet à créer: $ProjectName" -ForegroundColor "White"
Write-Host "📂 Framework source: $FrameworkSource" -ForegroundColor "White"
Write-Host "🎯 Destination externe: $ExternalBase" -ForegroundColor "White"
Write-Host ""

try {
    # Étape 1: Vérifications préliminaires
    Write-Step "Étape 1/7: Vérifications préliminaires..."
    
    if (-not (Test-Path $FrameworkSource)) {
        Write-Error "Framework source introuvable: $FrameworkSource"
        exit 1
    }
    
    if (-not (Test-Path "$FrameworkSource\cli\fw.js")) {
        Write-Error "CLI du framework introuvable dans: $FrameworkSource"
        exit 1
    }
    
    Write-Success "Framework source vérifié"
    Write-Host ""

    # Étape 2: Création des dossiers externes
    Write-Step "Étape 2/7: Création des dossiers externes..."
    
    $directories = @(
        $ExternalBase,
        "$ExternalBase\projects",
        "$ExternalBase\templates", 
        "$ExternalBase\backups"
    )
    
    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Success "Créé: $dir"
        } else {
            Write-Info "Existe déjà: $dir"
        }
    }
    Write-Host ""

    # Étape 3: Copie du framework
    Write-Step "Étape 3/7: Copie du framework..."
    
    $FrameworkDest = "$ExternalBase\framework"
    if (Test-Path $FrameworkDest) {
        Write-Info "Framework déjà présent, mise à jour..."
        Remove-Item -Recurse -Force $FrameworkDest
    }
    
    Write-Host "Copie en cours... (peut prendre quelques secondes)" -ForegroundColor "Yellow"
    robocopy $FrameworkSource $FrameworkDest /E /XD node_modules .git /NFL /NDL /NJH /NJS | Out-Null
    
    if ($LASTEXITCODE -le 7) {  # Robocopy success codes
        Write-Success "Framework copié vers: $FrameworkDest"
    } else {
        Write-Error "Erreur lors de la copie du framework"
        exit 1
    }
    Write-Host ""

    # Étape 4: Configuration du mode EXTERNE
    Write-Step "Étape 4/7: Configuration du mode EXTERNE..."
    
    Push-Location $FrameworkDest
    $result = & node cli/fw.js ini mode EXTERNE 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Mode EXTERNE configuré"
    } else {
        Write-Error "Erreur lors de la configuration: $result"
        Pop-Location
        exit 1
    }
    Write-Host ""

    # Étape 5: Création du projet
    Write-Step "Étape 5/7: Création du projet $ProjectName..."
    
    $result = & node cli/fw.js create $ProjectName 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Projet $ProjectName créé avec succès"
    } else {
        Write-Error "Erreur lors de la création du projet: $result"
        Pop-Location
        exit 1
    }
    Write-Host ""

    # Étape 6: Installation des dépendances
    Write-Step "Étape 6/7: Installation des dépendances npm..."
    
    $ProjectPath = "$FrameworkDest\$ProjectName"
    Push-Location $ProjectPath
    
    Write-Host "Installation npm en cours... (peut prendre 1-2 minutes)" -ForegroundColor "Yellow"
    $npmResult = & npm install --silent 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Dépendances npm installées"
    } else {
        Write-Error "Attention: Erreur lors de l'installation npm"
        Write-Host "Vous pouvez installer manuellement avec: npm install" -ForegroundColor "Yellow"
    }
    Pop-Location
    Pop-Location
    Write-Host ""

    # Étape 7: Finalisation
    Write-Step "Étape 7/7: Finalisation..."
    Write-Host ""
    
    # Résumé final
    Write-Host "🎉 PROJET EXTERNE CRÉÉ AVEC SUCCÈS !" -ForegroundColor "Green"
    Write-Host "============================================================================" -ForegroundColor "Green"
    Write-Host "📁 Emplacement du projet: $ProjectPath" -ForegroundColor "White"
    Write-Host "🛠️  Framework externe: $FrameworkDest" -ForegroundColor "White"
    Write-Host ""
    Write-Host "📝 PROCHAINES ÉTAPES:" -ForegroundColor "Cyan"
    Write-Host "   1. Ouvrir VSCode dans: $ProjectPath" -ForegroundColor "White"
    Write-Host "   2. Lancer le serveur: npm run dev" -ForegroundColor "White"
    Write-Host "   3. Ouvrir: http://localhost:5173" -ForegroundColor "White"
    Write-Host ""
    Write-Host "🚀 COMMANDES RAPIDES:" -ForegroundColor "Cyan"
    Write-Host "   cd `"$ProjectPath`"" -ForegroundColor "White"
    Write-Host "   code ." -ForegroundColor "White"
    Write-Host "   npm run dev" -ForegroundColor "White"
    Write-Host ""

    # Actions automatiques si demandées
    if ($OpenVSCode) {
        Write-Host "🎯 Ouverture de VSCode..." -ForegroundColor "Cyan"
        Push-Location $ProjectPath
        & code .
        Pop-Location
    }
    
    if ($StartDev) {
        Write-Host "🚀 Démarrage du serveur de développement..." -ForegroundColor "Cyan"
        Push-Location $ProjectPath
        Start-Process "npm" -ArgumentList "run", "dev" -NoNewWindow
        Pop-Location
        Write-Host "✅ Serveur démarré sur http://localhost:5173" -ForegroundColor "Green"
    }

    Write-Host "✨ Projet prêt pour le développement !" -ForegroundColor "Green"
    Write-Host "============================================================================" -ForegroundColor "Green"

} catch {
    Write-Error "Erreur inattendue: $($_.Exception.Message)"
    exit 1
}
