#!/usr/bin/env node

/**
 * 🔍 Roadmap Compliance Checker
 * Vérifie qu'une action est conforme à la roadmap actuelle
 */

const fs = require('fs');
const path = require('path');

class RoadmapComplianceChecker {
    constructor() {
        this.roadmapPath = this.findRoadmapPath();
        this.currentPhase = this.detectCurrentPhase();
        this.phaseObjectives = this.loadPhaseObjectives();
    }

    findRoadmapPath() {
        const possiblePaths = [
            'roadmap/README.md',
            '../Projet_Learning/roadmap/README.md',
            '../../Projet_Learning/roadmap/README.md'
        ];
        
        for (const roadmapPath of possiblePaths) {
            if (fs.existsSync(roadmapPath)) {
                return roadmapPath;
            }
        }
        
        console.warn('⚠️ Roadmap non trouvée. Vérification limitée.');
        return null;
    }

    detectCurrentPhase() {
        if (!this.roadmapPath) return '0';
        
        try {
            const roadmapContent = fs.readFileSync(this.roadmapPath, 'utf8');
            
            // Rechercher les indicateurs de phase actuelle
            const currentPhaseMatch = roadmapContent.match(/📍\s*État\s*Actuel\s*:\s*Phase\s*(\d+(?:\.\d+)?)/i);
            if (currentPhaseMatch) {
                return currentPhaseMatch[1];
            }
            
            // Fallback: rechercher la première phase avec statut "À commencer" ou "En cours"
            const phaseStatusMatch = roadmapContent.match(/Phase\s*(\d+(?:\.\d+)?)[^]*?📋\s*(À commencer|En cours)/i);
            if (phaseStatusMatch) {
                return phaseStatusMatch[1];
            }
            
            return '0'; // Défaut
        } catch (error) {
            console.warn('⚠️ Erreur lecture roadmap:', error.message);
            return '0';
        }
    }

    loadPhaseObjectives() {
        const objectives = {
            '0': {
                title: 'Setup & Architecture',
                duration: '3 jours',
                goals: ['Configuration SvelteKit', 'Structure de dossiers', 'Tests unitaires', 'Configuration développement'],
                blockers: [],
                nextPhase: '1'
            },
            '1': {
                title: 'Firebase & Authentification',
                duration: '1 semaine',
                goals: ['Configuration Firebase', 'Store d\'authentification', 'Composants login/signup', 'Protection des routes'],
                blockers: ['Phase 0 incomplète'],
                nextPhase: '2'
            },
            '2': {
                title: 'Contenu & Markdown',
                duration: '1 semaine',
                goals: ['Types de contenu', 'Conversion Markdown', 'Routes dynamiques', 'Composants UI de base'],
                blockers: ['Phase 1 incomplète'],
                nextPhase: '2.5'
            },
            '2.5': {
                title: 'Pédagogie Avancée',
                duration: '3 jours',
                goals: ['Système de pré-évaluation', 'Module de métacognition', 'Ressources adaptatives'],
                blockers: ['Phase 2 incomplète'],
                nextPhase: '3'
            },
            '3': {
                title: 'Exercices & Progression',
                duration: '1 semaine',
                goals: ['Types d\'exercices', 'Composants d\'exercices', 'Store de progression', 'Tableau de bord'],
                blockers: ['Phase 2.5 incomplète'],
                nextPhase: '4'
            },
            '4': {
                title: 'PWA & Offline',
                duration: '1 semaine',
                goals: ['Configuration PWA', 'Service Worker', 'Stockage offline', 'Interface mobile'],
                blockers: ['Phase 3 incomplète'],
                nextPhase: '5'
            },
            '5': {
                title: 'Admin & Import',
                duration: '1 semaine',
                goals: ['Interface d\'administration', 'Gestion de contenu', 'Import/export', 'Analytics'],
                blockers: ['Phase 4 incomplète'],
                nextPhase: '6'
            },
            '6': {
                title: 'Polish & Performance',
                duration: '1 semaine',
                goals: ['Optimisations performance', 'Monitoring', 'Tests de charge', 'Configuration production'],
                blockers: ['Phase 5 incomplète'],
                nextPhase: null
            }
        };
        
        return objectives;
    }

    /**
     * Vérifie la conformité d'une action avec la roadmap
     * @param {string} requestedPhase - Phase demandée
     * @param {string} action - Description de l'action
     * @param {string} category - Catégorie de l'action
     * @returns {Object} Résultat de conformité
     */
    checkCompliance(requestedPhase, action, category) {
        const result = {
            isCompliant: true,
            isDeviation: false,
            currentPhase: this.currentPhase,
            requestedPhase: requestedPhase,
            issues: [],
            recommendations: [],
            impactAnalysis: null
        };

        // Vérifier si la phase demandée existe
        if (!this.phaseObjectives[requestedPhase]) {
            result.isCompliant = false;
            result.issues.push(`Phase ${requestedPhase} n'existe pas dans la roadmap`);
            return result;
        }

        // Vérifier si c'est une déviation
        if (requestedPhase !== this.currentPhase) {
            result.isDeviation = true;
            result.impactAnalysis = this.analyzeDeviation(this.currentPhase, requestedPhase, action, category);
            
            // Vérifier si on peut passer à la phase suivante
            if (this.isNextPhaseValid(requestedPhase)) {
                result.recommendations.push(`Transition vers Phase ${requestedPhase} autorisée si Phase ${this.currentPhase} est validée`);
            } else if (this.isPreviousPhaseAccess(requestedPhase)) {
                result.recommendations.push(`Retour vers Phase ${requestedPhase} autorisé pour corrections`);
            } else {
                result.isCompliant = false;
                result.issues.push(`Saut de phase non autorisé: ${this.currentPhase} → ${requestedPhase}`);
            }
        }

        // Vérifier la cohérence avec les objectifs de la phase
        this.checkPhaseCoherence(requestedPhase, action, category, result);

        return result;
    }

    isNextPhaseValid(requestedPhase) {
        const currentPhaseObj = this.phaseObjectives[this.currentPhase];
        return currentPhaseObj && currentPhaseObj.nextPhase === requestedPhase;
    }

    isPreviousPhaseAccess(requestedPhase) {
        const requestedPhaseNum = parseFloat(requestedPhase);
        const currentPhaseNum = parseFloat(this.currentPhase);
        return requestedPhaseNum < currentPhaseNum;
    }

    checkPhaseCoherence(phase, action, category, result) {
        const phaseObj = this.phaseObjectives[phase];
        if (!phaseObj) return;

        // Vérifier si l'action correspond aux objectifs de la phase
        const actionLower = action.toLowerCase();
        const isRelevant = phaseObj.goals.some(goal => 
            actionLower.includes(goal.toLowerCase()) || 
            goal.toLowerCase().includes(actionLower)
        );

        if (!isRelevant) {
            result.recommendations.push(`Action "${action}" ne correspond pas aux objectifs de Phase ${phase}: ${phaseObj.goals.join(', ')}`);
        }

        // Vérifier les blockers
        if (phaseObj.blockers.length > 0) {
            phaseObj.blockers.forEach(blocker => {
                result.recommendations.push(`⚠️ Pré-requis: ${blocker}`);
            });
        }
    }

    analyzeDeviation(currentPhase, requestedPhase, action, category) {
        const currentPhaseObj = this.phaseObjectives[currentPhase];
        const requestedPhaseObj = this.phaseObjectives[requestedPhase];
        
        const currentPhaseNum = parseFloat(currentPhase);
        const requestedPhaseNum = parseFloat(requestedPhase);
        const phaseDelta = Math.abs(requestedPhaseNum - currentPhaseNum);

        return {
            type: requestedPhaseNum > currentPhaseNum ? 'AVANCE' : 'RETOUR',
            severity: phaseDelta > 1 ? 'HIGH' : phaseDelta > 0.5 ? 'MEDIUM' : 'LOW',
            impactedPhases: this.getImpactedPhases(currentPhase, requestedPhase),
            estimatedDelay: this.estimateDelay(phaseDelta),
            risks: this.identifyRisks(currentPhase, requestedPhase, action),
            recommendations: this.generateRecommendations(currentPhase, requestedPhase, action)
        };
    }

    getImpactedPhases(currentPhase, requestedPhase) {
        const currentNum = parseFloat(currentPhase);
        const requestedNum = parseFloat(requestedPhase);
        const start = Math.min(currentNum, requestedNum);
        const end = Math.max(currentNum, requestedNum);
        
        return Object.keys(this.phaseObjectives)
            .map(p => parseFloat(p))
            .filter(p => p >= start && p <= end)
            .map(p => p.toString());
    }

    estimateDelay(phaseDelta) {
        const delayMap = {
            0.5: '1-2 jours',
            1: '3-5 jours',
            1.5: '1 semaine',
            2: '1-2 semaines',
            3: '2-3 semaines'
        };
        
        return delayMap[phaseDelta] || `${Math.ceil(phaseDelta)} semaines`;
    }

    identifyRisks(currentPhase, requestedPhase, action) {
        const risks = [];
        const currentNum = parseFloat(currentPhase);
        const requestedNum = parseFloat(requestedPhase);
        
        if (requestedNum > currentNum + 1) {
            risks.push('SAUT_PHASE: Risque d\'oublier des étapes critiques');
        }
        
        if (requestedNum < currentNum) {
            risks.push('REGRESSION: Risque de perdre des avancées');
        }
        
        if (action.toLowerCase().includes('firebase') && currentNum < 1) {
            risks.push('DEPENDANCE: Firebase nécessite Phase 1 complète');
        }
        
        if (action.toLowerCase().includes('test') && currentNum < 0.5) {
            risks.push('INFRASTRUCTURE: Tests nécessitent configuration Phase 0');
        }
        
        return risks;
    }

    generateRecommendations(currentPhase, requestedPhase, action) {
        const recommendations = [];
        const currentNum = parseFloat(currentPhase);
        const requestedNum = parseFloat(requestedPhase);
        
        if (requestedNum > currentNum) {
            recommendations.push(`Valider complètement Phase ${currentPhase} avant transition`);
            recommendations.push(`Exécuter: npm run validate -- ${currentPhase}`);
        }
        
        if (Math.abs(requestedNum - currentNum) > 1) {
            recommendations.push('Considérer une approche progressive phase par phase');
        }
        
        recommendations.push(`Mettre à jour roadmap/README.md avec nouveau statut`);
        recommendations.push(`Documenter la justification de la déviation`);
        
        return recommendations;
    }

    /**
     * Génère un rapport de conformité
     */
    generateComplianceReport(result) {
        let report = '\n🗺️ ROADMAP COMPLIANCE REPORT\n';
        report += '='.repeat(50) + '\n\n';
        
        report += `📍 Phase Actuelle: ${result.currentPhase} (${this.phaseObjectives[result.currentPhase]?.title})\n`;
        report += `🎯 Phase Demandée: ${result.requestedPhase} (${this.phaseObjectives[result.requestedPhase]?.title})\n`;
        report += `📊 Conformité: ${result.isCompliant ? '✅ CONFORME' : '❌ NON CONFORME'}\n`;
        report += `🔀 Déviation: ${result.isDeviation ? '⚠️ OUI' : '✅ NON'}\n\n`;
        
        if (result.issues.length > 0) {
            report += '🚨 PROBLÈMES DÉTECTÉS:\n';
            result.issues.forEach((issue, i) => {
                report += `   ${i + 1}. ${issue}\n`;
            });
            report += '\n';
        }
        
        if (result.recommendations.length > 0) {
            report += '💡 RECOMMANDATIONS:\n';
            result.recommendations.forEach((rec, i) => {
                report += `   ${i + 1}. ${rec}\n`;
            });
            report += '\n';
        }
        
        if (result.impactAnalysis) {
            const impact = result.impactAnalysis;
            report += '📊 ANALYSE D\'IMPACT:\n';
            report += `   Type: ${impact.type}\n`;
            report += `   Sévérité: ${impact.severity}\n`;
            report += `   Retard estimé: ${impact.estimatedDelay}\n`;
            report += `   Phases impactées: ${impact.impactedPhases.join(', ')}\n`;
            
            if (impact.risks.length > 0) {
                report += '   Risques:\n';
                impact.risks.forEach(risk => {
                    report += `     - ${risk}\n`;
                });
            }
            report += '\n';
        }
        
        return report;
    }
}

// Utilisation CLI
if (require.main === module) {
    const checker = new RoadmapComplianceChecker();
    
    const requestedPhase = process.argv[2];
    const action = process.argv[3] || 'Action non spécifiée';
    const category = process.argv[4] || 'general';
    
    if (!requestedPhase) {
        console.log('Usage: node roadmap-checker.js <phase> <action> [category]');
        console.log('\nExemple:');
        console.log('node roadmap-checker.js 1 "Configuration Firebase" auth');
        process.exit(1);
    }
    
    const result = checker.checkCompliance(requestedPhase, action, category);
    console.log(checker.generateComplianceReport(result));
    
    process.exit(result.isCompliant ? 0 : 1);
}

module.exports = RoadmapComplianceChecker;
