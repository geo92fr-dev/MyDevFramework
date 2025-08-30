#!/usr/bin/env node

/**
 * 🛠️ Setup CBD - Configuration initiale des outils CBD
 */

const fs = require('fs');
const path = require('path');

class CBDSetup {
    constructor() {
        this.baseDir = process.cwd();
        this.directories = [
            'logs',
            'reports',
            'templates/cbd'
        ];
    }

    async setup() {
        console.log('🛠️ Configuration CBD - Check Before Doing');
        console.log('='.repeat(50));

        try {
            // Créer les dossiers nécessaires
            this.createDirectories();
            
            // Créer les templates CBD
            this.createTemplates();
            
            // Créer les configs par défaut
            this.createDefaultConfigs();
            
            // Vérifier les permissions
            this.checkPermissions();
            
            // Créer les scripts utilitaires
            this.createUtilityScripts();

            console.log('\n✅ Configuration CBD terminée avec succès !');
            console.log('\n🚀 Commandes disponibles :');
            console.log('   npm run cbd:validate "votre prompt"');
            console.log('   npm run cbd:roadmap 1 "action" auth');
            console.log('   npm run cbd:orchestrator "prompt complet"');
            console.log('   npm run cbd:analytics');
            console.log('   npm run dev:ia  # Mode développement avec validation');

        } catch (error) {
            console.error('❌ Erreur durant la configuration:', error.message);
            process.exit(1);
        }
    }

    createDirectories() {
        console.log('\n📁 Création des dossiers...');
        
        this.directories.forEach(dir => {
            const fullPath = path.join(this.baseDir, dir);
            
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
                console.log(`   ✅ ${dir}`);
            } else {
                console.log(`   ⏭️ ${dir} (existe déjà)`);
            }
        });
    }

    createTemplates() {
        console.log('\n📝 Création des templates...');

        const templates = {
            'templates/cbd/basic-prompt.md': `# Template CBD - Prompt de Base

[CONTEXT] Phase X.Y - Description de la fonctionnalité
[FILE] chemin/vers/fichier.ext
[CMD] commande à exécuter
[TEST] npm run test:specific
[CHECK] Critère de validation spécifique

## Description détaillée
Expliquez clairement ce que vous voulez accomplir.

## Critères d'acceptation
- [ ] Critère 1
- [ ] Critère 2
- [ ] Critère 3

## Références
- Lien vers documentation
- Référence technique
`,

            'templates/cbd/deviation-prompt.md': `# Template CBD - Déviation Roadmap

[CONTEXT] DÉVIATION ROADMAP - Description de la demande
[ROADMAP-CURRENT] Phase X.Y - Objectif actuel
[DEVIATION] Description précise de l'écart
[JUSTIFICATION] Raison détaillée de la déviation
[IMPACT-ANALYSIS] Demande d'analyse d'impact complète
[CONFIRMATION-REQUIRED] OUI - Attendre validation avant exécution
[CHECK] Roadmap mise à jour et validée avant action

## Justification détaillée
Pourquoi cette déviation est-elle nécessaire ?

## Impact attendu
Quelles sont les conséquences prévues ?

## Alternatives considérées
Quelles autres options ont été évaluées ?
`,

            'templates/cbd/security-prompt.md': `# Template CBD - Validation Sécurité

[CONTEXT] Phase X.Y - Modification sensible
[FILE] chemin/vers/fichier.ext
[CMD] commande à exécuter (vérifiée)
[SECURITY] Analyse de sécurité requise
[TEST] npm run test:security
[CHECK] Validation sécurité passée

## Éléments de sécurité
- [ ] Pas de données sensibles exposées
- [ ] Validation des entrées utilisateur
- [ ] Permissions appropriées
- [ ] Audit trail disponible

## Review requis
Cette modification nécessite une review sécurité.
`
        };

        Object.entries(templates).forEach(([filename, content]) => {
            const filePath = path.join(this.baseDir, filename);
            
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, content);
                console.log(`   ✅ ${filename}`);
            } else {
                console.log(`   ⏭️ ${filename} (existe déjà)`);
            }
        });
    }

    createDefaultConfigs() {
        console.log('\n⚙️ Création des configurations...');

        const configs = {
            '.cbdrc.json': {
                "version": "2.0",
                "strictMode": true,
                "enableAnalytics": true,
                "logLevel": "info",
                "autoCleanLogs": true,
                "maxLogAge": 30,
                "roadmapFile": "../Projet_Learning/roadmap/README.md",
                "validPhases": ["0", "1", "2", "2.5", "3", "4", "5", "6"],
                "requiredTags": ["CONTEXT", "FILE", "CMD", "TEST", "CHECK"],
                "dangerousCommands": [
                    "rm -rf",
                    "del /f",
                    "format",
                    "dd if=",
                    "> /dev/null"
                ],
                "notifications": {
                    "onError": true,
                    "onDeviation": true,
                    "onSuccess": false
                }
            },

            'logs/.gitkeep': '',
            'reports/.gitkeep': ''
        };

        Object.entries(configs).forEach(([filename, content]) => {
            const filePath = path.join(this.baseDir, filename);
            
            if (!fs.existsSync(filePath)) {
                const data = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
                fs.writeFileSync(filePath, data);
                console.log(`   ✅ ${filename}`);
            } else {
                console.log(`   ⏭️ ${filename} (existe déjà)`);
            }
        });
    }

    checkPermissions() {
        console.log('\n🔐 Vérification des permissions...');

        const criticalPaths = [
            'tools/cbd',
            'logs',
            'reports'
        ];

        criticalPaths.forEach(dir => {
            const fullPath = path.join(this.baseDir, dir);
            
            try {
                fs.accessSync(fullPath, fs.constants.R_OK | fs.constants.W_OK);
                console.log(`   ✅ ${dir} - Lecture/écriture OK`);
            } catch (error) {
                console.log(`   ❌ ${dir} - Problème de permissions: ${error.message}`);
            }
        });
    }

    createUtilityScripts() {
        console.log('\n🔧 Création des scripts utilitaires...');

        const scripts = {
            'scripts/cbd-quick.bat': `@echo off
REM Script rapide pour validation CBD
echo 🤖 CBD Quick Validation
echo.

if "%1"=="" (
    echo Usage: cbd-quick.bat "votre prompt ici"
    exit /b 1
)

node tools/cbd/cbd-orchestrator.js "%1"
pause
`,

            'scripts/cbd-quick.sh': `#!/bin/bash
# Script rapide pour validation CBD
echo "🤖 CBD Quick Validation"
echo

if [ "$#" -eq 0 ]; then
    echo "Usage: ./cbd-quick.sh \"votre prompt ici\""
    exit 1
fi

node tools/cbd/cbd-orchestrator.js "$1"
`,

            'scripts/daily-cbd-report.bat': `@echo off
REM Rapport quotidien CBD
echo 📊 Rapport CBD Quotidien
echo.

node tools/cbd/cbd-analytics.js report
echo.

echo Voulez-vous nettoyer les anciens logs? (y/N)
set /p cleanup=
if /i "%cleanup%"=="y" (
    node tools/cbd/cbd-analytics.js clean
)

pause
`
        };

        Object.entries(scripts).forEach(([filename, content]) => {
            const filePath = path.join(this.baseDir, filename);
            
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, content);
                
                // Rendre exécutable sur Unix
                if (filename.endsWith('.sh')) {
                    try {
                        fs.chmodSync(filePath, '755');
                    } catch (error) {
                        // Ignorer sur Windows
                    }
                }
                
                console.log(`   ✅ ${filename}`);
            } else {
                console.log(`   ⏭️ ${filename} (existe déjà)`);
            }
        });
    }
}

// Exécution directe
if (require.main === module) {
    const setup = new CBDSetup();
    setup.setup().then(() => {
        // Terminer explicitement le processus
        process.exit(0);
    }).catch((error) => {
        console.error('❌ Erreur fatale:', error.message);
        process.exit(1);
    });
}

module.exports = CBDSetup;
