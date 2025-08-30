#!/usr/bin/env node

/**
 * 🤖 CBD Validator - Check Before Doing
 * Valide qu'un prompt respecte les standards CBD avant exécution
 */

const fs = require('fs');
const path = require('path');

class CBDValidator {
    constructor() {
        this.loadConfig();
        this.validCategories = ['auth', 'data', 'ui', 'test', 'config', 'setup'];
    }

    loadConfig() {
        try {
            const configPath = path.join(process.cwd(), '.cbdrc.json');
            if (fs.existsSync(configPath)) {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                this.requiredTags = config.requiredTags || ['CONTEXT', 'FILE', 'CMD', 'TEST', 'CHECK'];
                this.validPhases = config.validPhases || ['0', '1', '2', '2.5', '3', '4', '5', '6'];
            } else {
                // Valeurs par défaut
                this.requiredTags = ['CONTEXT', 'FILE', 'CMD', 'TEST', 'CHECK'];
                this.validPhases = ['0', '1', '1.1', '1.2', '1.3', '2', '2.1', '2.2', '2.3', '2.4', '2.5', '3', '3.1', '3.2', '4', '4.1', '4.2', '5', '5.1', '5.2', '6'];
            }
        } catch (error) {
            console.error('⚠️ Erreur lors du chargement de la configuration CBD:', error.message);
            // Valeurs par défaut
            this.requiredTags = ['CONTEXT', 'FILE', 'CMD', 'TEST', 'CHECK'];
            this.validPhases = ['0', '1', '1.1', '1.2', '1.3', '2', '2.1', '2.2', '2.3', '2.4', '2.5', '3', '3.1', '3.2', '4', '4.1', '4.2', '5', '5.1', '5.2', '6'];
        }
    }

    /**
     * Valide un prompt selon les standards CBD
     * @param {string} prompt - Le prompt à valider
     * @returns {Object} Résultat de validation
     */
    validatePrompt(prompt) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            suggestions: [],
            extractedData: {}
        };

        // Vérification des balises obligatoires
        this.checkRequiredTags(prompt, result);
        
        // Vérification du contexte et de la phase
        this.checkContext(prompt, result);
        
        // Vérification de la cohérence roadmap
        this.checkRoadmapCoherence(prompt, result);
        
        // Vérification des fichiers mentionnés
        this.checkFilePaths(prompt, result);
        
        // Vérification des commandes
        this.checkCommands(prompt, result);

        result.isValid = result.errors.length === 0;
        return result;
    }

    checkRequiredTags(prompt, result) {
        const foundTags = [];
        
        this.requiredTags.forEach(tag => {
            const regex = new RegExp(`\\[${tag}\\]`, 'i');
            if (regex.test(prompt)) {
                foundTags.push(tag);
                // Extraire la valeur
                const valueRegex = new RegExp(`\\[${tag}\\]\\s*(.+?)(?=\\n|\\[|$)`, 'i');
                const match = prompt.match(valueRegex);
                if (match) {
                    result.extractedData[tag.toLowerCase()] = match[1].trim();
                }
            } else {
                result.errors.push(`Balise obligatoire manquante: [${tag}]`);
            }
        });

        if (foundTags.length < this.requiredTags.length) {
            result.suggestions.push('Utilisez le template CBD complet pour éviter les balises manquantes');
        }
    }

    checkContext(prompt, result) {
        const contextMatch = prompt.match(/\[CONTEXT\]\s*(.+?)(?=\n|\[|$)/i);
        if (contextMatch) {
            const context = contextMatch[1].trim();
            
            // Vérifier si une phase est mentionnée
            const phaseMatch = context.match(/phase\s*(\d+(?:\.\d+)?)/i);
            if (phaseMatch) {
                const phase = phaseMatch[1];
                result.extractedData.phase = phase;
                
                if (!this.validPhases.includes(phase)) {
                    result.errors.push(`Phase invalide: ${phase}. Phases valides: ${this.validPhases.join(', ')}`);
                }
            } else {
                result.warnings.push('Aucune phase détectée dans le contexte. Recommandé pour la traçabilité.');
            }

            // Vérifier si FunLearning est mentionné
            if (!context.toLowerCase().includes('funlearning')) {
                result.warnings.push('Contexte FunLearning non explicite. Recommandé pour la cohérence projet.');
            }
        }
    }

    checkRoadmapCoherence(prompt, result) {
        // Vérifier si c'est une déviation de roadmap
        if (prompt.includes('[DEVIATION]') || prompt.includes('DÉVIATION')) {
            result.extractedData.isDeviation = true;
            
            const requiredDeviationTags = ['ROADMAP-CURRENT', 'DEVIATION', 'JUSTIFICATION', 'IMPACT-ANALYSIS'];
            const missingDeviationTags = requiredDeviationTags.filter(tag => 
                !prompt.includes(`[${tag}]`)
            );
            
            if (missingDeviationTags.length > 0) {
                result.errors.push(`Déviation roadmap incomplète. Balises manquantes: ${missingDeviationTags.join(', ')}`);
            }
            
            if (!prompt.includes('[CONFIRMATION-REQUIRED]')) {
                result.errors.push('Déviation roadmap sans demande de confirmation obligatoire');
            }
        }
    }

    checkFilePaths(prompt, result) {
        const fileMatch = prompt.match(/\[FILE\]\s*(.+?)(?=\n|\[|$)/i);
        if (fileMatch) {
            const filePath = fileMatch[1].trim();
            result.extractedData.filePath = filePath;
            
            // Vérifier l'extension
            const validExtensions = ['.js', '.ts', '.svelte', '.md', '.json', '.css', '.html'];
            const hasValidExtension = validExtensions.some(ext => filePath.endsWith(ext));
            
            if (!hasValidExtension) {
                result.warnings.push(`Extension de fichier non reconnue: ${path.extname(filePath)}`);
            }
            
            // Vérifier la structure du chemin
            if (!filePath.startsWith('src/') && !filePath.startsWith('tests/') && 
                !filePath.startsWith('config/') && !filePath.startsWith('docs/')) {
                result.warnings.push('Chemin de fichier non standard. Vérifiez la structure de dossiers.');
            }
        }
    }

    checkCommands(prompt, result) {
        const cmdMatch = prompt.match(/\[CMD\]\s*(.+?)(?=\n|\[|$)/i);
        if (cmdMatch) {
            const command = cmdMatch[1].trim();
            result.extractedData.command = command;
            
            // Vérifier les commandes dangereuses
            const dangerousCommands = ['rm -rf', 'del /f', 'format', 'dd if='];
            const isDangerous = dangerousCommands.some(dangerous => 
                command.toLowerCase().includes(dangerous)
            );
            
            if (isDangerous) {
                result.errors.push(`Commande potentiellement dangereuse détectée: ${command}`);
            }
            
            // Suggérer l'utilisation de npm scripts
            if (command.startsWith('node ') && !command.includes('npm run')) {
                result.suggestions.push('Considérez utiliser un script npm au lieu d\'exécuter node directement');
            }
        }
    }

    /**
     * Génère un rapport de validation formaté
     */
    generateReport(result) {
        let report = '\n🤖 CBD VALIDATION REPORT\n';
        report += '='.repeat(50) + '\n\n';
        
        // Statut global
        report += `📊 Statut: ${result.isValid ? '✅ VALIDE' : '❌ INVALIDE'}\n\n`;
        
        // Erreurs
        if (result.errors.length > 0) {
            report += '🚨 ERREURS CRITIQUES:\n';
            result.errors.forEach((error, i) => {
                report += `   ${i + 1}. ${error}\n`;
            });
            report += '\n';
        }
        
        // Avertissements
        if (result.warnings.length > 0) {
            report += '⚠️ AVERTISSEMENTS:\n';
            result.warnings.forEach((warning, i) => {
                report += `   ${i + 1}. ${warning}\n`;
            });
            report += '\n';
        }
        
        // Suggestions
        if (result.suggestions.length > 0) {
            report += '💡 SUGGESTIONS:\n';
            result.suggestions.forEach((suggestion, i) => {
                report += `   ${i + 1}. ${suggestion}\n`;
            });
            report += '\n';
        }
        
        // Données extraites
        if (Object.keys(result.extractedData).length > 0) {
            report += '📋 DONNÉES EXTRAITES:\n';
            Object.entries(result.extractedData).forEach(([key, value]) => {
                report += `   ${key}: ${value}\n`;
            });
            report += '\n';
        }
        
        return report;
    }

    /**
     * Génère un template CBD basé sur les données fournies
     */
    generateTemplate(phase = '', category = '', description = '') {
        const template = `
[CONTEXT] Phase ${phase} - ${description}
[FILE] src/lib/${category}/filename.${category === 'ui' ? 'svelte' : 'ts'}
[CMD] npm run dev
[TEST] npm run test:${category}
[CHECK] ${description} fonctionne correctement

// Description détaillée de la tâche
// Critères d'acceptance spécifiques
// Références techniques si nécessaire
        `.trim();
        
        return template;
    }
}

// Utilisation CLI
if (require.main === module) {
    const validator = new CBDValidator();
    
    const promptText = process.argv[2];
    if (!promptText) {
        console.log('Usage: node cbd-validator.js "votre prompt ici"');
        console.log('\nOu pour générer un template:');
        console.log('node cbd-validator.js --template --phase=1 --category=auth --desc="Authentification"');
        process.exit(1);
    }
    
    if (promptText === '--template') {
        const phase = process.argv.find(arg => arg.startsWith('--phase='))?.split('=')[1] || '1';
        const category = process.argv.find(arg => arg.startsWith('--category='))?.split('=')[1] || 'ui';
        const desc = process.argv.find(arg => arg.startsWith('--desc='))?.split('=')[1] || 'Nouvelle fonctionnalité';
        
        console.log('📝 TEMPLATE CBD GÉNÉRÉ:\n');
        console.log(validator.generateTemplate(phase, category, desc));
    } else {
        const result = validator.validatePrompt(promptText);
        console.log(validator.generateReport(result));
        
        process.exit(result.isValid ? 0 : 1);
    }
}

module.exports = CBDValidator;
