#!/usr/bin/env node

/**
 * 🎯 CBD Orchestrator - Point d'entrée principal pour CBD
 * Orchestre toutes les vérifications et validations CBD
 */

const CBDValidator = require('./cbd-validator');
const RoadmapChecker = require('./roadmap-checker');
const fs = require('fs');
const path = require('path');

class CBDOrchestrator {
    constructor() {
        this.validator = new CBDValidator();
        this.roadmapChecker = new RoadmapChecker();
        this.logFile = path.join(__dirname, '../../logs/cbd-sessions.log');
        this.ensureLogDirectory();
    }

    ensureLogDirectory() {
        const logDir = path.dirname(this.logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }

    /**
     * Processus complet de vérification CBD
     * @param {string} prompt - Le prompt utilisateur
     * @param {Object} options - Options de validation
     * @returns {Object} Résultat complet
     */
    async processCBD(prompt, options = {}) {
        const sessionId = this.generateSessionId();
        const startTime = new Date();

        console.log(`\n🤖 CBD SESSION ${sessionId} - DÉMARRAGE`);
        console.log('='.repeat(60));

        const result = {
            sessionId,
            startTime,
            prompt,
            validation: null,
            roadmapCompliance: null,
            deviationAnalysis: null,
            finalDecision: null,
            recommendations: [],
            logs: []
        };

        try {
            // Phase 1: Validation du prompt
            console.log('\n📋 PHASE 1: VALIDATION DU PROMPT');
            result.validation = this.validator.validatePrompt(prompt);
            
            if (!result.validation.isValid) {
                result.finalDecision = 'REJECTED_INVALID_PROMPT';
                this.logResult(result);
                return result;
            }

            console.log('✅ Prompt valide - Passage à la vérification roadmap');

            // Phase 2: Vérification conformité roadmap
            console.log('\n🗺️ PHASE 2: VÉRIFICATION ROADMAP');
            const extractedData = result.validation.extractedData;
            
            if (extractedData.phase) {
                result.roadmapCompliance = this.roadmapChecker.checkCompliance(
                    extractedData.phase,
                    extractedData.context || 'Action non spécifiée',
                    this.extractCategory(extractedData.filePath || '')
                );

                // Phase 3: Gestion des déviations
                if (result.roadmapCompliance.isDeviation) {
                    console.log('\n⚠️ PHASE 3: DÉVIATION DÉTECTÉE');
                    result.deviationAnalysis = await this.handleDeviation(result);
                    
                    if (!result.deviationAnalysis.approved) {
                        result.finalDecision = 'REJECTED_DEVIATION_NOT_APPROVED';
                        this.logResult(result);
                        return result;
                    }
                }
            }

            // Phase 4: Vérifications de sécurité et qualité
            console.log('\n🛡️ PHASE 4: VÉRIFICATIONS SÉCURITÉ & QUALITÉ');
            const securityCheck = this.performSecurityChecks(extractedData);
            
            if (!securityCheck.passed) {
                result.finalDecision = 'REJECTED_SECURITY_ISSUES';
                result.recommendations.push(...securityCheck.issues);
                this.logResult(result);
                return result;
            }

            // Phase 5: Génération des recommandations finales
            console.log('\n💡 PHASE 5: RECOMMANDATIONS FINALES');
            result.recommendations = this.generateFinalRecommendations(result);
            result.finalDecision = 'APPROVED';

            console.log('\n✅ CBD VALIDATION COMPLÈTE - EXÉCUTION AUTORISÉE');

        } catch (error) {
            console.error('\n❌ ERREUR DURANT LE PROCESSUS CBD:', error.message);
            result.finalDecision = 'ERROR';
            result.logs.push(`Erreur: ${error.message}`);
        }

        result.endTime = new Date();
        result.duration = result.endTime - result.startTime;
        
        this.logResult(result);
        return result;
    }

    extractCategory(filePath) {
        if (!filePath) return 'general';
        
        const categoryMap = {
            'auth': ['auth', 'login', 'signup'],
            'ui': ['components', 'ui', '.svelte'],
            'data': ['stores', 'types', 'api'],
            'test': ['test', 'spec'],
            'config': ['config', 'vite', 'svelte.config']
        };

        for (const [category, keywords] of Object.entries(categoryMap)) {
            if (keywords.some(keyword => filePath.toLowerCase().includes(keyword))) {
                return category;
            }
        }

        return 'general';
    }

    async handleDeviation(result) {
        const deviation = result.roadmapCompliance;
        
        console.log('🔍 Analyse de déviation en cours...');
        
        const analysis = {
            detected: true,
            severity: deviation.impactAnalysis?.severity || 'MEDIUM',
            type: deviation.impactAnalysis?.type || 'UNKNOWN',
            autoApprovalEligible: false,
            approved: false,
            justification: null
        };

        // Vérifier l'éligibilité pour auto-approbation
        if (result.validation.extractedData.isDeviation) {
            const hasJustification = result.prompt.includes('[JUSTIFICATION]');
            const hasImpactAnalysis = result.prompt.includes('[IMPACT-ANALYSIS]');
            const hasConfirmationRequest = result.prompt.includes('[CONFIRMATION-REQUIRED]');
            
            if (hasJustification && hasImpactAnalysis && hasConfirmationRequest) {
                analysis.autoApprovalEligible = true;
                
                // Pour cette démo, on simule une approbation automatique pour les déviations mineures
                if (analysis.severity === 'LOW') {
                    analysis.approved = true;
                    analysis.justification = 'Déviation mineure avec documentation complète - Auto-approuvée';
                }
            }
        }

        if (!analysis.approved) {
            console.log('\n⏸️ CONFIRMATION UTILISATEUR REQUISE');
            console.log('Cette déviation nécessite une validation manuelle.');
            console.log('Statut: EN ATTENTE DE CONFIRMATION');
            
            // Dans un vrai environnement, on attendrait la confirmation utilisateur
            // Pour cette démo, on rejette par défaut
            analysis.approved = false;
            analysis.justification = 'Déviation non confirmée par l\'utilisateur';
        }

        return analysis;
    }

    performSecurityChecks(extractedData) {
        const result = {
            passed: true,
            issues: []
        };

        // Vérification des commandes dangereuses
        if (extractedData.command) {
            const dangerousPatterns = [
                /rm\s+-rf/i,
                /del\s+\/[fs]/i,
                /format\s+/i,
                /dd\s+if=/i,
                />\s*\/dev\/null/i
            ];

            dangerousPatterns.forEach(pattern => {
                if (pattern.test(extractedData.command)) {
                    result.passed = false;
                    result.issues.push(`Commande dangereuse détectée: ${extractedData.command}`);
                }
            });
        }

        // Vérification des chemins de fichiers
        if (extractedData.filePath) {
            const suspiciousPaths = [
                /\.\.\/\.\.\//,
                /\/etc\//,
                /\/root\//,
                /\/home\/[^\/]+\/\./,
                /\.ssh\//,
                /\.env/
            ];

            suspiciousPaths.forEach(pattern => {
                if (pattern.test(extractedData.filePath)) {
                    result.passed = false;
                    result.issues.push(`Chemin suspect détecté: ${extractedData.filePath}`);
                }
            });
        }

        return result;
    }

    generateFinalRecommendations(result) {
        const recommendations = [];

        // Recommandations basées sur la validation
        if (result.validation.suggestions) {
            recommendations.push(...result.validation.suggestions);
        }

        // Recommandations basées sur la roadmap
        if (result.roadmapCompliance && result.roadmapCompliance.recommendations) {
            recommendations.push(...result.roadmapCompliance.recommendations);
        }

        // Recommandations spécifiques au contexte
        const extractedData = result.validation.extractedData;
        
        if (extractedData.phase === '0') {
            recommendations.push('💡 Phase 0: Assurez-vous que la structure de base est solide avant Phase 1');
        }

        if (extractedData.filePath && extractedData.filePath.includes('.svelte')) {
            recommendations.push('🎨 Composant Svelte: Pensez à l\'accessibilité et au responsive design');
        }

        if (extractedData.command && extractedData.command.includes('npm test')) {
            recommendations.push('🧪 Tests: Vérifiez la couverture de code après exécution');
        }

        return recommendations;
    }

    generateSessionId() {
        return `CBD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    logResult(result) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            sessionId: result.sessionId,
            decision: result.finalDecision,
            phase: result.validation?.extractedData?.phase,
            duration: result.duration,
            hasDeviation: result.roadmapCompliance?.isDeviation || false
        };

        try {
            fs.appendFileSync(this.logFile, JSON.stringify(logEntry) + '\n');
        } catch (error) {
            console.warn('⚠️ Impossible d\'écrire dans le log:', error.message);
        }
    }

    /**
     * Génère un rapport final complet
     */
    generateFinalReport(result) {
        let report = '\n🎯 CBD ORCHESTRATOR - RAPPORT FINAL\n';
        report += '='.repeat(60) + '\n\n';
        
        report += `📋 Session: ${result.sessionId}\n`;
        report += `⏱️ Durée: ${result.duration}ms\n`;
        report += `🎯 Décision: ${this.getDecisionEmoji(result.finalDecision)} ${result.finalDecision}\n\n`;

        if (result.validation) {
            report += this.validator.generateReport(result.validation);
        }

        if (result.roadmapCompliance) {
            report += this.roadmapChecker.generateComplianceReport(result.roadmapCompliance);
        }

        if (result.deviationAnalysis) {
            report += '\n🔄 ANALYSE DE DÉVIATION:\n';
            report += `   Sévérité: ${result.deviationAnalysis.severity}\n`;
            report += `   Type: ${result.deviationAnalysis.type}\n`;
            report += `   Approuvée: ${result.deviationAnalysis.approved ? '✅' : '❌'}\n`;
            if (result.deviationAnalysis.justification) {
                report += `   Justification: ${result.deviationAnalysis.justification}\n`;
            }
            report += '\n';
        }

        if (result.recommendations.length > 0) {
            report += '🎯 RECOMMANDATIONS FINALES:\n';
            result.recommendations.forEach((rec, i) => {
                report += `   ${i + 1}. ${rec}\n`;
            });
            report += '\n';
        }

        return report;
    }

    getDecisionEmoji(decision) {
        const emojiMap = {
            'APPROVED': '✅',
            'REJECTED_INVALID_PROMPT': '❌',
            'REJECTED_DEVIATION_NOT_APPROVED': '⚠️',
            'REJECTED_SECURITY_ISSUES': '🚨',
            'ERROR': '💥'
        };
        
        return emojiMap[decision] || '❓';
    }
}

// Utilisation CLI
if (require.main === module) {
    const orchestrator = new CBDOrchestrator();
    
    const promptText = process.argv[2];
    if (!promptText) {
        console.log(`
🤖 CBD Orchestrator - Usage:

1. Validation d'un prompt:
   node cbd-orchestrator.js "votre prompt complet ici"

2. Mode interactif:
   node cbd-orchestrator.js --interactive

3. Vérification roadmap seule:
   node cbd-orchestrator.js --check-roadmap

Exemple de prompt valide:
node cbd-orchestrator.js "[CONTEXT] Phase 1 - Auth Firebase [FILE] src/lib/auth.ts [CMD] npm run dev [TEST] npm run test:auth [CHECK] Authentification fonctionne"
        `);
        process.exit(1);
    }

    if (promptText === '--interactive') {
        console.log('🚧 Mode interactif non implémenté dans cette version');
        process.exit(1);
    }

    orchestrator.processCBD(promptText).then(result => {
        console.log(orchestrator.generateFinalReport(result));
        process.exit(result.finalDecision === 'APPROVED' ? 0 : 1);
    }).catch(error => {
        console.error('💥 Erreur fatale:', error);
        process.exit(1);
    });
}

module.exports = CBDOrchestrator;
