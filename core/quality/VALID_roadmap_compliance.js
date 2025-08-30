#!/usr/bin/env node

/**
 * VALID_roadmap_compliance.js - Validation de conformité à la roadmap
 * Usage: node scripts/VALID_roadmap_compliance.js [phase]
 * 
 * Vérifie qu'une demande ou action est conforme à la roadmap définie
 */

const fs = require('fs');
const path = require('path');

class RoadmapComplianceValidator {
    constructor() {
        this.roadmapPath = path.join(process.cwd(), 'DOC_ROADMAP_LEARNING.md');
        this.currentPhase = null;
        this.roadmapContent = null;
        this.phases = new Map();
        this.deviations = [];
    }

    async loadRoadmap() {
        try {
            this.roadmapContent = fs.readFileSync(this.roadmapPath, 'utf8');
            this.parsePhases();
            console.log('✅ Roadmap chargée avec succès');
        } catch (error) {
            console.error('❌ Erreur lors du chargement de la roadmap:', error.message);
            process.exit(1);
        }
    }

    parsePhases() {
        // Extraction des phases de la roadmap
        const phaseRegex = /## 🚀 Phase (\d+(?:\.\d+)?)\s*:\s*([^(]+)\(([^)]+)\)[^#]*/g;
        let match;

        while ((match = phaseRegex.exec(this.roadmapContent)) !== null) {
            const [, phaseNumber, title, duration] = match;
            const content = match[0];
            
            this.phases.set(phaseNumber, {
                number: phaseNumber,
                title: title.trim(),
                duration: duration.trim(),
                content: content,
                objectives: this.extractObjectives(content),
                deliverables: this.extractDeliverables(content)
            });
        }

        console.log(`📋 ${this.phases.size} phases détectées dans la roadmap`);
    }

    extractObjectives(content) {
        const objectives = [];
        const lines = content.split('\n');
        
        for (const line of lines) {
            if (line.includes('**Objectif**') || line.includes('### **🎯')) {
                objectives.push(line.replace(/[*#]/g, '').trim());
            }
        }
        
        return objectives;
    }

    extractDeliverables(content) {
        const deliverables = [];
        const deliverableRegex = /\[FILE\]\s*([^\n]+)/g;
        let match;

        while ((match = deliverableRegex.exec(content)) !== null) {
            deliverables.push(match[1].trim());
        }

        return deliverables;
    }

    detectCurrentPhase() {
        // Détection de la phase courante basée sur les fichiers existants
        const existingFiles = this.scanProjectFiles();
        let maxPhaseProgress = 0;

        for (const [phaseNumber, phaseData] of this.phases) {
            const phaseFiles = phaseData.deliverables;
            const existingPhaseFiles = phaseFiles.filter(file => 
                existingFiles.some(existing => existing.includes(file.replace(/\[|\]/g, '')))
            );
            
            const progress = phaseFiles.length > 0 ? (existingPhaseFiles.length / phaseFiles.length) : 0;
            
            if (progress > 0.5 && parseFloat(phaseNumber) > maxPhaseProgress) {
                maxPhaseProgress = parseFloat(phaseNumber);
                this.currentPhase = phaseNumber;
            }
        }

        console.log(`🎯 Phase courante détectée: ${this.currentPhase || 'Phase 0 (Setup)'}`);
        return this.currentPhase;
    }

    scanProjectFiles() {
        const files = [];
        const scanDir = (dir) => {
            try {
                const items = fs.readdirSync(dir);
                for (const item of items) {
                    const fullPath = path.join(dir, item);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                        scanDir(fullPath);
                    } else if (stat.isFile()) {
                        files.push(fullPath);
                    }
                }
            } catch (error) {
                // Ignorer les erreurs d'accès
            }
        };

        scanDir(process.cwd());
        return files;
    }

    analyzeRequest(context, files = [], features = []) {
        const analysis = {
            isCompliant: true,
            deviations: [],
            impacts: [],
            recommendations: []
        };

        if (!this.currentPhase) {
            this.detectCurrentPhase();
        }

        const currentPhaseData = this.phases.get(this.currentPhase);
        if (!currentPhaseData) {
            analysis.deviations.push({
                type: 'PHASE_UNKNOWN',
                severity: 'HIGH',
                description: 'Phase courante non identifiable'
            });
            analysis.isCompliant = false;
        }

        // Analyser si les fichiers demandés correspondent à la phase
        for (const file of files) {
            if (!this.isFileInPhase(file, this.currentPhase)) {
                analysis.deviations.push({
                    type: 'FILE_OUT_OF_PHASE',
                    severity: 'MEDIUM',
                    description: `Fichier ${file} ne correspond pas à la phase ${this.currentPhase}`,
                    suggestedPhase: this.findAppropriatePhase(file)
                });
                analysis.isCompliant = false;
            }
        }

        // Analyser si les fonctionnalités sont prévues
        for (const feature of features) {
            if (!this.isFeatureInRoadmap(feature)) {
                analysis.deviations.push({
                    type: 'FEATURE_NOT_PLANNED',
                    severity: 'HIGH',
                    description: `Fonctionnalité '${feature}' non prévue dans la roadmap`,
                    impact: 'Peut affecter les phases suivantes'
                });
                analysis.isCompliant = false;
            }
        }

        return analysis;
    }

    isFileInPhase(file, phase) {
        const phaseData = this.phases.get(phase);
        if (!phaseData) return false;

        // Vérification basique - améliorer selon besoins
        const phaseKeywords = {
            '0': ['config', 'setup', 'package.json', 'tsconfig', 'vite', 'eslint'],
            '1': ['auth', 'firebase', 'login', 'user'],
            '2': ['content', 'markdown', 'cours', 'interface'],
            '2.5': ['pedagogy', 'evaluation', 'metacognition'],
            '3': ['exercises', 'quiz', 'progress'],
            '4': ['pwa', 'offline', 'manifest', 'service-worker'],
            '5': ['admin', 'import', 'dashboard'],
            '6': ['performance', 'lighthouse', 'optimization']
        };

        const keywords = phaseKeywords[phase] || [];
        return keywords.some(keyword => file.toLowerCase().includes(keyword));
    }

    findAppropriatePhase(file) {
        for (const [phaseNumber, phaseData] of this.phases) {
            if (this.isFileInPhase(file, phaseNumber)) {
                return phaseNumber;
            }
        }
        return 'UNKNOWN';
    }

    isFeatureInRoadmap(feature) {
        return this.roadmapContent.toLowerCase().includes(feature.toLowerCase());
    }

    generateImpactAnalysis(deviations) {
        const analysis = {
            timeImpact: 0,
            complexityImpact: 1,
            dependencyImpact: [],
            risksIdentified: [],
            recommendations: []
        };

        for (const deviation of deviations) {
            switch (deviation.type) {
                case 'FEATURE_NOT_PLANNED':
                    analysis.timeImpact += 3; // +3 jours
                    analysis.complexityImpact += 2;
                    analysis.risksIdentified.push('Risque de dérive du scope');
                    analysis.recommendations.push('Évaluer l\'ajout dans une phase ultérieure');
                    break;
                
                case 'FILE_OUT_OF_PHASE':
                    analysis.timeImpact += 1;
                    analysis.complexityImpact += 1;
                    analysis.dependencyImpact.push(deviation.suggestedPhase);
                    analysis.recommendations.push(`Reporter à la phase ${deviation.suggestedPhase}`);
                    break;
            }
        }

        return analysis;
    }

    async validateCompliance(context, files = [], features = []) {
        console.log('🔍 Validation de conformité à la roadmap');
        console.log('='.repeat(50));

        await this.loadRoadmap();
        const analysis = this.analyzeRequest(context, files, features);

        if (analysis.isCompliant) {
            console.log('✅ CONFORME - La demande respecte la roadmap');
            return true;
        } else {
            console.log('🚨 DÉVIATION DÉTECTÉE');
            console.log('\n📊 ANALYSE D\'IMPACT :');
            
            const impact = this.generateImpactAnalysis(analysis.deviations);
            
            console.log(`⏱️ Impact temps : +${impact.timeImpact} jours`);
            console.log(`🔧 Complexité : x${impact.complexityImpact}`);
            
            if (impact.dependencyImpact.length > 0) {
                console.log(`🔗 Phases impactées : ${impact.dependencyImpact.join(', ')}`);
            }

            console.log('\n⚠️ DÉVIATIONS IDENTIFIÉES :');
            analysis.deviations.forEach((dev, index) => {
                console.log(`  ${index + 1}. [${dev.severity}] ${dev.description}`);
                if (dev.suggestedPhase) {
                    console.log(`     → Suggestion : Phase ${dev.suggestedPhase}`);
                }
            });

            console.log('\n💡 RECOMMANDATIONS :');
            impact.recommendations.forEach((rec, index) => {
                console.log(`  ${index + 1}. ${rec}`);
            });

            console.log('\n🔄 ACTIONS REQUISES :');
            console.log('  1. Réviser la roadmap pour intégrer ces changements');
            console.log('  2. Obtenir validation explicite des modifications');
            console.log('  3. Mettre à jour DOC_ROADMAP_LEARNING.md');
            console.log('  4. Relancer cette validation après mise à jour');

            return false;
        }
    }
}

// CLI Usage
if (require.main === module) {
    const args = process.argv.slice(2);
    const validator = new RoadmapComplianceValidator();
    
    // Exemple d'usage basique
    const context = args[0] || 'Phase courante';
    const files = args.slice(1) || [];
    
    validator.validateCompliance(context, files)
        .then(isCompliant => {
            process.exit(isCompliant ? 0 : 1);
        })
        .catch(error => {
            console.error('Erreur lors de la validation:', error);
            process.exit(1);
        });
}

module.exports = RoadmapComplianceValidator;
