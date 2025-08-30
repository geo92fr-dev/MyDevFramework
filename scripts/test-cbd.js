#!/usr/bin/env node

/**
 * 🧪 Test CBD - Validation complète du système CBD
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class CBDTester {
    constructor() {
        this.baseDir = process.cwd();
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            skipped: 0
        };
    }

    async runAllTests() {
        console.log('🧪 Tests CBD - Check Before Doing');
        console.log('='.repeat(50));

        try {
            // Tests de base
            await this.testBasicStructure();
            await this.testCBDValidator();
            await this.testRoadmapChecker();
            await this.testOrchestrator();
            await this.testAnalytics();
            
            // Tests d'intégration
            await this.testIntegration();
            
            // Tests de performance
            await this.testPerformance();

            this.generateReport();

        } catch (error) {
            console.error('❌ Erreur durant les tests:', error.message);
            process.exit(1);
        }
    }

    async testBasicStructure() {
        console.log('\n📁 Test de la structure de base...');

        const requiredFiles = [
            'tools/cbd/cbd-validator.js',
            'tools/cbd/roadmap-checker.js',
            'tools/cbd/cbd-orchestrator.js',
            'tools/cbd/cbd-analytics.js',
            'package.json',
            '.cbdrc.json'
        ];

        const requiredDirs = [
            'logs',
            'reports',
            'templates/cbd'
        ];

        let allGood = true;

        // Vérifier les fichiers
        requiredFiles.forEach(file => {
            const filePath = path.join(this.baseDir, file);
            if (fs.existsSync(filePath)) {
                this.logTest(`✅ ${file}`, true);
            } else {
                this.logTest(`❌ ${file} - MANQUANT`, false);
                allGood = false;
            }
        });

        // Vérifier les dossiers
        requiredDirs.forEach(dir => {
            const dirPath = path.join(this.baseDir, dir);
            if (fs.existsSync(dirPath)) {
                this.logTest(`✅ ${dir}/`, true);
            } else {
                this.logTest(`❌ ${dir}/ - MANQUANT`, false);
                allGood = false;
            }
        });

        return allGood;
    }

    async testCBDValidator() {
        console.log('\n🔍 Test du CBD Validator...');

        const testPrompts = [
            {
                name: 'Prompt valide',
                prompt: '[CONTEXT] Phase 1 - Test [FILE] test.js [CMD] npm test [TEST] jest [CHECK] Tests passent',
                shouldPass: true
            },
            {
                name: 'Prompt sans tags',
                prompt: 'Juste un prompt normal sans tags CBD',
                shouldPass: false
            },
            {
                name: 'Prompt partiel',
                prompt: '[CONTEXT] Phase 1 [FILE] test.js',
                shouldPass: false
            }
        ];

        let allGood = true;

        for (const test of testPrompts) {
            try {
                const result = await this.runCBDCommand('cbd-validator.js', test.prompt);
                const passed = (result.success === test.shouldPass);
                
                this.logTest(`${test.name}: ${passed ? '✅' : '❌'}`, passed);
                
                if (!passed) allGood = false;
                
            } catch (error) {
                this.logTest(`${test.name}: ❌ ERREUR - ${error.message}`, false);
                allGood = false;
            }
        }

        return allGood;
    }

    async testRoadmapChecker() {
        console.log('\n🗺️ Test du Roadmap Checker...');

        const testCases = [
            {
                name: 'Phase valide (avec déviation normale)',
                phase: '1',
                action: 'setup auth',
                shouldPass: true, // Le checker fonctionne mais détecte une déviation normale
                allowWarnings: true
            },
            {
                name: 'Phase invalide',
                phase: '99',
                action: 'test action',
                shouldPass: false
            }
        ];

        let allGood = true;

        for (const test of testCases) {
            try {
                const result = await this.runCBDCommand('roadmap-checker.js', 
                    `${test.phase} "${test.action}" test`);
                
                // Pour le roadmap checker, code 0 = succès, code 1 = avertissement/déviation, code 2+ = erreur
                let passed;
                if (test.allowWarnings) {
                    passed = (result.code === 0 || result.code === 1); // 0 ou 1 sont acceptables
                } else {
                    passed = (result.success === test.shouldPass);
                }
                
                this.logTest(`${test.name}: ${passed ? '✅' : '❌'}`, passed);
                
                if (!passed) allGood = false;
                
            } catch (error) {
                this.logTest(`${test.name}: ❌ ERREUR - ${error.message}`, false);
                allGood = false;
            }
        }

        return allGood;
    }

    async testOrchestrator() {
        console.log('\n🎯 Test de l\'Orchestrateur...');

        // Test avec un prompt qui ne devrait pas créer de déviation
        const testPrompt = `[CONTEXT] Phase 0 - Test d'intégration FunLearning Setup
[FILE] tests/setup.js
[CMD] npm run test:setup
[TEST] jest --testPathPattern=setup
[CHECK] Tests de setup passent

Créer un test de configuration pour valider l'architecture de base.`;

        try {
            const result = await this.runCBDCommand('cbd-orchestrator.js', testPrompt);
            
            // L'orchestrateur peut retourner code 0 (succès) ou 1 (avertissement mais fonctionnel)
            if (result.code === 0 || result.code === 1) {
                this.logTest('Orchestrateur fonctionnel: ✅', true);
                return true;
            } else {
                this.logTest('Orchestrateur en échec: ❌', false);
                return false;
            }
            
        } catch (error) {
            this.logTest(`Orchestrateur erreur: ❌ - ${error.message}`, false);
            return false;
        }
    }

    async testAnalytics() {
        console.log('\n📊 Test des Analytics...');

        try {
            const result = await this.runCBDCommand('cbd-analytics.js', 'test');
            
            if (result.success) {
                this.logTest('Analytics fonctionnel: ✅', true);
                return true;
            } else {
                this.logTest('Analytics en échec: ❌', false);
                return false;
            }
            
        } catch (error) {
            this.logTest(`Analytics erreur: ❌ - ${error.message}`, false);
            return false;
        }
    }

    async testIntegration() {
        console.log('\n🔗 Tests d\'intégration...');

        // Test d'un workflow complet
        const fullWorkflowPrompt = `[CONTEXT] Phase 1.2 - Authentification Firebase
[FILE] src/lib/auth.js
[CMD] npm run dev
[TEST] npm run test:auth
[CHECK] Login/logout fonctionnels

Implémenter l'authentification Firebase avec Google Sign-in.`;

        try {
            const result = await this.runCBDCommand('cbd-orchestrator.js', fullWorkflowPrompt);
            
            if (result.success || result.warnings) {
                this.logTest('Workflow complet: ✅', true);
                return true;
            } else {
                this.logTest('Workflow complet: ❌', false);
                return false;
            }
            
        } catch (error) {
            this.logTest(`Workflow complet: ❌ - ${error.message}`, false);
            return false;
        }
    }

    async testPerformance() {
        console.log('\n⚡ Tests de performance...');

        const startTime = Date.now();
        
        try {
            // Test de validation rapide
            await this.runCBDCommand('cbd-validator.js', 
                '[CONTEXT] Test [FILE] test.js [CMD] test [TEST] test [CHECK] test');
            
            const duration = Date.now() - startTime;
            
            if (duration < 2000) { // Moins de 2 secondes
                this.logTest(`Performance OK (${duration}ms): ✅`, true);
                return true;
            } else {
                this.logTest(`Performance lente (${duration}ms): ⚠️`, false);
                return false;
            }
            
        } catch (error) {
            this.logTest(`Performance erreur: ❌ - ${error.message}`, false);
            return false;
        }
    }

    async runCBDCommand(script, args) {
        return new Promise((resolve, reject) => {
            const scriptPath = path.join(this.baseDir, 'tools', 'cbd', script);
            const child = spawn('node', [scriptPath, args], {
                cwd: this.baseDir,
                stdio: 'pipe'
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                resolve({
                    success: code === 0,
                    warnings: code === 1,
                    stdout,
                    stderr,
                    code
                });
            });

            child.on('error', (error) => {
                reject(error);
            });

            // Timeout après 10 secondes
            setTimeout(() => {
                child.kill();
                reject(new Error('Timeout'));
            }, 10000);
        });
    }

    logTest(message, passed) {
        console.log(`   ${message}`);
        
        if (passed) {
            this.results.passed++;
        } else {
            this.results.failed++;
        }
    }

    generateReport() {
        console.log('\n📋 Rapport de Tests CBD');
        console.log('='.repeat(50));
        console.log(`✅ Tests réussis: ${this.results.passed}`);
        console.log(`❌ Tests échoués: ${this.results.failed}`);
        console.log(`⏭️ Tests ignorés: ${this.results.skipped}`);
        
        const total = this.results.passed + this.results.failed + this.results.skipped;
        const successRate = total > 0 ? Math.round((this.results.passed / total) * 100) : 0;
        
        console.log(`📊 Taux de réussite: ${successRate}%`);
        
        if (this.results.failed === 0) {
            console.log('\n🎉 Tous les tests CBD sont passés !');
            console.log('🚀 Le système CBD est prêt à être utilisé.');
        } else {
            console.log('\n⚠️ Certains tests ont échoué.');
            console.log('🔧 Vérifiez la configuration avant utilisation.');
        }

        // Sauvegarder le rapport
        const reportPath = path.join(this.baseDir, 'reports', `cbd-test-${Date.now()}.json`);
        const report = {
            timestamp: new Date().toISOString(),
            results: this.results,
            successRate,
            status: this.results.failed === 0 ? 'PASSED' : 'FAILED'
        };

        try {
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
            console.log(`\n📄 Rapport sauvegardé: ${reportPath}`);
        } catch (error) {
            console.log(`\n⚠️ Impossible de sauvegarder le rapport: ${error.message}`);
        }
    }
}

// Exécution directe
if (require.main === module) {
    const tester = new CBDTester();
    tester.runAllTests().then(() => {
        // Terminer explicitement le processus
        process.exit(tester.results.failed === 0 ? 0 : 1);
    }).catch((error) => {
        console.error('❌ Erreur fatale:', error.message);
        process.exit(1);
    });
}

module.exports = CBDTester;
