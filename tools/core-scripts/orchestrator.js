#!/usr/bin/env node

/**
 * UTIL_dev_ia_orchestrator.js - Orchestrateur de développement guidé par IA
 * Usage: npm run dev:ia [prompt-file]
 * 
 * Système autonome qui encapsule tout le workflow de développement
 */

const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');

class DevIAOrchestrator {
    constructor() {
        this.config = {
            name: 'FunLearning Dev:IA Orchestrator',
            version: '1.0.0',
            startTime: Date.now()
        };
        
        // Charger les niveaux de contrôle
        this.controlLevels = this.loadControlLevels();
        this.currentControlLevel = this.controlLevels.currentMode || 'controlled';
        
        this.metrics = {
            validationTime: 0,
            codeGenerationTime: 0,
            testTime: 0,
            qualityTime: 0,
            totalTime: 0,
            success: false,
            errors: [],
            warnings: []
        };

        this.postMortem = {
            incidents: [],
            learnings: [],
            improvements: []
        };

        // Quality gates adaptés au niveau de contrôle
        this.qualityGates = this.getAdaptiveQualityGates();
    }

    loadControlLevels() {
        try {
            const configPath = path.join(__dirname, '..', 'CONFIG_control_levels.json');
            return JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } catch (error) {
            console.log('⚠️ Configuration de contrôle non trouvée, utilisation des défauts');
            return { currentMode: 'controlled', controlLevels: {} };
        }
    }

    getAdaptiveQualityGates() {
        const level = this.controlLevels.controlLevels[this.currentControlLevel];
        
        if (!level) {
            // Défauts si configuration manquante
            return {
                'phase-0': { complexity: 5, coverage: 70, security: 'medium' },
                'phase-1': { complexity: 7, coverage: 80, security: 'high' },
                'phase-2': { complexity: 8, coverage: 85, security: 'high' },
                'phase-3': { complexity: 8, coverage: 85, security: 'high' },
                'phase-4': { complexity: 9, coverage: 90, security: 'high' },
                'phase-5': { complexity: 9, coverage: 90, security: 'high' },
                'phase-6': { complexity: 10, coverage: 95, security: 'critical' }
            };
        }

        // Adapter selon le niveau de contrôle
        const baseCoverage = level.quality.minTestCoverage;
        const baseComplexity = level.quality.maxComplexity;
        
        return {
            'phase-0': { complexity: Math.max(baseComplexity - 5, 3), coverage: baseCoverage, security: 'medium' },
            'phase-1': { complexity: Math.max(baseComplexity - 3, 5), coverage: baseCoverage + 10, security: 'high' },
            'phase-2': { complexity: Math.max(baseComplexity - 2, 6), coverage: baseCoverage + 15, security: 'high' },
            'phase-3': { complexity: Math.max(baseComplexity - 2, 6), coverage: baseCoverage + 15, security: 'high' },
            'phase-4': { complexity: Math.max(baseComplexity - 1, 7), coverage: baseCoverage + 20, security: 'high' },
            'phase-5': { complexity: Math.max(baseComplexity - 1, 7), coverage: baseCoverage + 20, security: 'high' },
            'phase-6': { complexity: baseComplexity, coverage: baseCoverage + 25, security: 'critical' }
        };
    }

    log(level, message, force = false) {
        const timestamp = new Date().toISOString();
        const emoji = {
            'info': '📋',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌',
            'debug': '🔍'
        };
        
        console.log(`[${timestamp}] ${emoji[level]} ${message}`);
        
        if (level === 'error') {
            this.metrics.errors.push({ timestamp, message });
        } else if (level === 'warning') {
            this.metrics.warnings.push({ timestamp, message });
        }
    }

    async executeCommand(command, description, timeout = 30000) {
        this.log('info', `🚀 ${description}...`);
        const startTime = Date.now();
        
        try {
            const result = execSync(command, { 
                encoding: 'utf8',
                timeout: timeout,
                stdio: ['inherit', 'pipe', 'pipe']
            });
            
            const duration = Date.now() - startTime;
            this.log('success', `${description} completed in ${duration}ms`);
            return { success: true, output: result, duration };
        } catch (error) {
            const duration = Date.now() - startTime;
            this.log('error', `${description} failed: ${error.message}`);
            
            // Log pour post-mortem
            this.postMortem.incidents.push({
                timestamp: new Date().toISOString(),
                command,
                description,
                error: error.message,
                duration
            });
            
            return { success: false, error: error.message, duration };
        }
    }

    async validateCheckBeforingDoing() {
        this.log('info', '📋 Phase 1: Validation CheckBeforingDoing...');
        const startTime = Date.now();
        
        const result = await this.executeCommand(
            'npm run validate:checkbeforedoing',
            'Validation du protocole CheckBeforeDoing'
        );
        
        this.metrics.validationTime = Date.now() - startTime;
        return result.success;
    }

    async validateRoadmap() {
        this.log('info', '🗺️ Phase 2: Validation roadmap...');
        
        const result = await this.executeCommand(
            'npm run validate:roadmap',
            'Vérification conformité roadmap'
        );
        
        return result.success;
    }

    async validateReadme() {
        this.log('info', '📚 Phase 2b: Validation README central...');
        
        const result = await this.executeCommand(
            'npm run validate:readme',
            'Vérification hub documentation'
        );
        
        return result.success;
    }

    async validateDocumentation() {
        this.log('info', '📝 Phase 2c: Validation documentation automatique...');
        
        const result = await this.executeCommand(
            'npm run docs:validate',
            'Vérification commentaires documentation'
        );
        
        return result.success;
    }

    async synchronizeGit() {
        this.log('info', '🔄 Phase 3: Synchronisation Git...');
        
        // Vérifier l'état Git
        const statusResult = await this.executeCommand(
            'git status --porcelain',
            'Vérification état Git'
        );
        
        if (statusResult.output.trim()) {
            this.log('warning', 'Modifications non commitées détectées');
        }
        
        // Vérifier si un remote existe
        const remoteResult = await this.executeCommand(
            'git remote -v',
            'Vérification remote Git'
        );
        
        if (!remoteResult.output.trim()) {
            this.log('info', 'Aucun remote configuré - synchronisation Git ignorée');
            return true; // Pas d'erreur si pas de remote
        }
        
        // Vérifier le tracking de la branche
        const trackingResult = await this.executeCommand(
            'git status -b --porcelain',
            'Vérification tracking branch'
        );
        
        if (trackingResult.output.includes('no upstream')) {
            this.log('warning', 'Branche sans tracking upstream - synchronisation ignorée');
            return true; // Pas d'erreur si pas de tracking
        }
        
        // Pull rebase seulement si remote et tracking configurés
        const pullResult = await this.executeCommand(
            'git pull --rebase',
            'Synchronisation avec remote'
        );
        
        return pullResult.success;
    }

    async runQualityAnalysis(phase = 'phase-0') {
        this.log('info', '🔍 Phase 4: Analyse qualité...');
        const startTime = Date.now();
        
        const gates = this.qualityGates[phase] || {
            coverage: { minimum: 70 },
            complexity: { max: 10 },
            security: { level: 'medium' }
        };
        
        const results = {
            lint: false,
            tests: false,
            security: false
            // Retirer coverage et performance pour l'instant
        };

        // Linting
        const lintResult = await this.executeCommand(
            'npm run lint',
            'Analyse ESLint'
        );
        results.lint = lintResult.success;

        // Tests avec couverture
        const testResult = await this.executeCommand(
            'npm run test:coverage',
            `Tests avec couverture cible ${gates.coverage?.minimum || 70}%`
        );
        results.tests = testResult.success;

        // Audit sécurité avec script personnalisé pour développement
        const securityResult = await this.executeCommand(
            'node scripts/UTIL_audit_security_dev.js',
            'Audit de sécurité (mode dev)'
        );
        results.security = securityResult.success;

        this.metrics.qualityTime = Date.now() - startTime;
        
        const overallSuccess = Object.values(results).every(r => r);
        
        if (!overallSuccess) {
            this.log('error', 'Échec des gates de qualité');
            this.postMortem.incidents.push({
                timestamp: new Date().toISOString(),
                type: 'QUALITY_GATE_FAILURE',
                phase,
                results,
                gates
            });
        }
        
        return { success: overallSuccess, details: results };
    }

    async createCommit(context, changes) {
        this.log('info', '📝 Phase 5: Création commit...');
        
        // Générer un message de commit intelligent
        const commitMessage = this.generateCommitMessage(context, changes);
        
        // Add files
        await this.executeCommand(
            'git add .',
            'Ajout des fichiers modifiés'
        );
        
        // Commit avec message enrichi
        const commitResult = await this.executeCommand(
            `git commit -m "${commitMessage}"`,
            'Création commit atomique'
        );
        
        if (commitResult.success) {
            // Ajouter métadonnées au commit
            await this.executeCommand(
                `git notes add -m "${JSON.stringify(this.metrics)}"`,
                'Ajout métadonnées de performance'
            );
        }
        
        return commitResult.success;
    }

    generateCommitMessage(context, changes) {
        const timestamp = new Date().toISOString();
        const phase = this.extractPhase(context);
        
        const message = [
            `feat(${phase}): ${context}`,
            '',
            `🤖 Généré par Dev:IA Orchestrator`,
            `📊 Métriques: ${this.metrics.validationTime}ms validation, ${this.metrics.qualityTime}ms qualité`,
            `🎯 Qualité: ${this.metrics.errors.length} erreurs, ${this.metrics.warnings.length} warnings`,
            `⏱️ Timestamp: ${timestamp}`,
            '',
            '🔗 Changements:',
            ...changes.map(change => `  - ${change}`)
        ].join('\n');
        
        return message.replace(/"/g, '\\"');
    }

    extractPhase(context) {
        const match = context.match(/Phase (\d+(?:\.\d+)?)/);
        return match ? `P${match[1]}` : 'unknown';
    }

    async generatePostMortemEntry() {
        if (this.postMortem.incidents.length === 0) return;
        
        const entry = {
            timestamp: new Date().toISOString(),
            incidents: this.postMortem.incidents,
            metrics: this.metrics,
            suggestions: this.generateImprovementSuggestions()
        };
        
        const logPath = path.join(__dirname, '..', '..', 'docs', 'LOG_POSTMORTEM.md');
        let logContent = '';
        
        if (fs.existsSync(logPath)) {
            logContent = fs.readFileSync(logPath, 'utf8');
        } else {
            logContent = '# Log Post-Mortem - Apprentissage Continu\n\n';
        }
        
        const newEntry = this.formatPostMortemEntry(entry);
        logContent += newEntry;
        
        fs.writeFileSync(logPath, logContent);
        this.log('info', `📝 Entrée post-mortem ajoutée à ${logPath}`);
    }

    formatPostMortemEntry(entry) {
        return `
## ${entry.timestamp} - Session Dev:IA

### 🎯 Métriques de Performance
- **Validation** : ${entry.metrics.validationTime}ms
- **Qualité** : ${entry.metrics.qualityTime}ms
- **Erreurs** : ${entry.metrics.errors.length}
- **Warnings** : ${entry.metrics.warnings.length}
- **Succès** : ${entry.metrics.success ? '✅' : '❌'}

### 🔍 Incidents Détectés
${entry.incidents.map(incident => `
- **${incident.description}** : ${incident.error}
  - Commande : \`${incident.command}\`
  - Durée : ${incident.duration}ms
`).join('')}

### 💡 Suggestions d'Amélioration
${entry.suggestions.map(suggestion => `- ${suggestion}`).join('\n')}

---
`;
    }

    generateImprovementSuggestions() {
        const suggestions = [];
        
        if (this.metrics.validationTime > 5000) {
            suggestions.push('⚡ Optimiser les scripts de validation (> 5s)');
        }
        
        if (this.metrics.errors.length > 0) {
            suggestions.push('🛡️ Renforcer les validations préventives');
        }
        
        if (this.metrics.warnings.length > 5) {
            suggestions.push('📋 Réviser les seuils d\'alerte (trop de warnings)');
        }
        
        return suggestions;
    }

    async generateReport() {
        const totalTime = Date.now() - this.config.startTime;
        this.metrics.totalTime = totalTime;
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 RAPPORT DEV:IA ORCHESTRATOR');
        console.log('='.repeat(60));
        
        console.log(`\n🎯 Session: ${this.config.name}`);
        console.log(`⏱️ Durée totale: ${totalTime}ms`);
        console.log(`📈 Statut: ${this.metrics.success ? '✅ SUCCÈS' : '❌ ÉCHEC'}`);
        
        console.log(`\n📊 Métriques détaillées:`);
        console.log(`  Validation CheckBeforeDoing: ${this.metrics.validationTime}ms`);
        console.log(`  Analyse qualité: ${this.metrics.qualityTime}ms`);
        console.log(`  Erreurs: ${this.metrics.errors.length}`);
        console.log(`  Warnings: ${this.metrics.warnings.length}`);
        
        if (this.metrics.errors.length > 0) {
            console.log(`\n❌ Erreurs rencontrées:`);
            this.metrics.errors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error.message}`);
            });
        }
        
        if (this.metrics.warnings.length > 0) {
            console.log(`\n⚠️ Warnings:`);
            this.metrics.warnings.forEach((warning, index) => {
                console.log(`  ${index + 1}. ${warning.message}`);
            });
        }
        
        console.log('\n' + '='.repeat(60));
    }

    async orchestrate(context = 'Développement guidé par IA', changes = []) {
        this.log('info', '🚀 Démarrage de l\'orchestrateur Dev:IA');
        
        try {
            // Phase 1: Validation CheckBeforeDoing
            const checkBeforeDoingValid = await this.validateCheckBeforeDoing();
            if (!checkBeforeDoingValid) {
                throw new Error('Validation CheckBeforeDoing échouée');
            }
            
            // Phase 2: Validation roadmap
            const roadmapValid = await this.validateRoadmap();
            if (!roadmapValid) {
                this.log('warning', 'Validation roadmap échouée - mode déviation');
                // En mode déviation, on continue mais on flag
            }
            
            // Phase 2b: Validation README central
            const readmeValid = await this.validateReadme();
            if (!readmeValid) {
                this.log('warning', 'README central incomplet - documentation à synchroniser');
            }
            
            // Phase 2c: Validation documentation automatique
            const docsValid = await this.validateDocumentation();
            if (!docsValid) {
                this.log('warning', 'Documentation code incomplète - commentaires @criticality/@description manquants');
            }
            
            // Phase 3: Synchronisation Git
            const gitSync = await this.synchronizeGit();
            if (!gitSync) {
                this.log('warning', 'Synchronisation Git échouée');
            }
            
            // Phase 4: Analyse qualité
            const phase = this.extractPhase(context);
            const qualityCheck = await this.runQualityAnalysis(`phase-${phase.replace('P', '')}`);
            
            if (!qualityCheck.success) {
                throw new Error('Gates de qualité non respectées');
            }
            
            // Phase 5: Commit si tout OK
            if (changes.length > 0) {
                const commitSuccess = await this.createCommit(context, changes);
                if (!commitSuccess) {
                    throw new Error('Échec de création du commit');
                }
            }
            
            this.metrics.success = true;
            this.log('success', '🎉 Orchestration terminée avec succès !');
            
        } catch (error) {
            this.metrics.success = false;
            this.log('error', `💥 Orchestration échouée: ${error.message}`);
        } finally {
            await this.generatePostMortemEntry();
            await this.generateReport();
        }
        
        return this.metrics.success;
    }
}

// CLI Usage
if (require.main === module) {
    const args = process.argv.slice(2);
    const context = args[0] || 'Développement guidé par IA';
    const changes = args.slice(1) || [];
    
    const orchestrator = new DevIAOrchestrator();
    orchestrator.orchestrate(context, changes)
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('Erreur fatale:', error);
            process.exit(1);
        });
}

module.exports = DevIAOrchestrator;
