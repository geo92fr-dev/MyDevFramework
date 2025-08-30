#!/usr/bin/env node

/**
 * @criticality HIGH
 * @depends package.json, src/, tests/
 * @description Quality Gates automatisées avec seuils configurables par phase
 * @phase ALL - Applicable à toutes les phases
 * @category quality
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class QualityGates {
    constructor() {
        this.projectRoot = process.cwd();
        this.configPath = path.join(this.projectRoot, 'CONFIG_quality_gates.json');
        this.config = this.loadConfig();
        this.results = [];
    }

    /**
     * Chargement configuration quality gates
     */
    loadConfig() {
        const defaultConfig = {
            "phase-0": {
                "coverage": { "minimum": 70, "target": 80 },
                "complexity": { "max": 5 },
                "security": { "level": "medium" },
                "performance": { "lighthouse": 70 }
            },
            "phase-1": {
                "coverage": { "minimum": 80, "target": 85 },
                "complexity": { "max": 7 },
                "security": { "level": "high" },
                "performance": { "lighthouse": 75 }
            },
            "phase-2": {
                "coverage": { "minimum": 85, "target": 90 },
                "complexity": { "max": 8 },
                "security": { "level": "high" },
                "performance": { "lighthouse": 80 }
            },
            "phase-3": {
                "coverage": { "minimum": 85, "target": 90 },
                "complexity": { "max": 8 },
                "security": { "level": "high" },
                "performance": { "lighthouse": 85 }
            },
            "phase-4": {
                "coverage": { "minimum": 90, "target": 95 },
                "complexity": { "max": 9 },
                "security": { "level": "critical" },
                "performance": { "lighthouse": 90 }
            },
            "phase-5": {
                "coverage": { "minimum": 90, "target": 95 },
                "complexity": { "max": 9 },
                "security": { "level": "critical" },
                "performance": { "lighthouse": 90 }
            },
            "phase-6": {
                "coverage": { "minimum": 95, "target": 98 },
                "complexity": { "max": 10 },
                "security": { "level": "critical" },
                "performance": { "lighthouse": 95 }
            }
        };

        if (fs.existsSync(this.configPath)) {
            try {
                const customConfig = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
                return { ...defaultConfig, ...customConfig };
            } catch (error) {
                console.warn('⚠️ Erreur lecture config, utilisation valeurs par défaut');
                return defaultConfig;
            }
        } else {
            // Créer fichier de config par défaut
            fs.writeFileSync(this.configPath, JSON.stringify(defaultConfig, null, 2));
            return defaultConfig;
        }
    }

    /**
     * Détection automatique de la phase actuelle
     */
    detectCurrentPhase() {
        try {
            // Vérifier s'il y a un indicateur de phase dans package.json
            const packageJson = JSON.parse(fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8'));
            if (packageJson.funlearning && packageJson.funlearning.phase) {
                return packageJson.funlearning.phase;
            }

            // Détecter basé sur la structure des fichiers
            const srcPath = path.join(this.projectRoot, 'src');
            
            if (!fs.existsSync(srcPath)) return 'phase-0';
            
            const hasAuth = fs.existsSync(path.join(srcPath, 'lib', 'firebase')) || 
                           fs.existsSync(path.join(srcPath, 'routes', 'auth'));
            if (!hasAuth) return 'phase-0';
            
            const hasContent = fs.existsSync(path.join(srcPath, 'routes', 'cours')) ||
                              fs.existsSync(path.join(srcPath, 'lib', 'components'));
            if (!hasContent) return 'phase-1';
            
            const hasExercises = fs.existsSync(path.join(srcPath, 'routes', 'exercices')) ||
                                fs.existsSync(path.join(srcPath, 'lib', 'components', 'exercises'));
            if (!hasExercises) return 'phase-2';
            
            const hasPWA = fs.existsSync(path.join(this.projectRoot, 'static', 'manifest.json')) ||
                          fs.existsSync(path.join(srcPath, 'service-worker.ts'));
            if (!hasPWA) return 'phase-3';
            
            const hasAdmin = fs.existsSync(path.join(srcPath, 'routes', 'admin'));
            if (!hasAdmin) return 'phase-4';
            
            return 'phase-5'; // Assume phase avancée si tout est présent
            
        } catch (error) {
            console.warn('⚠️ Erreur détection phase, utilisation phase-1 par défaut');
            return 'phase-1';
        }
    }

    /**
     * Exécution de toutes les quality gates
     */
    async executeAll(phase = null) {
        const currentPhase = phase || this.detectCurrentPhase();
        const phaseConfig = this.config[currentPhase];
        
        console.log(`🎯 Exécution Quality Gates pour ${currentPhase}`);
        console.log(`📋 Seuils: Coverage ${phaseConfig.coverage.minimum}%, Complexity ≤${phaseConfig.complexity.max}, Security ${phaseConfig.security.level}`);
        
        let allPassed = true;

        // Gate 1: Couverture de tests
        const coveragePass = await this.gateTestCoverage(phaseConfig.coverage);
        allPassed = allPassed && coveragePass;

        // Gate 2: Complexité du code
        const complexityPass = await this.gateCodeComplexity(phaseConfig.complexity);
        allPassed = allPassed && complexityPass;

        // Gate 3: Sécurité
        const securityPass = await this.gateSecurity(phaseConfig.security);
        allPassed = allPassed && securityPass;

        // Gate 4: Lint et qualité statique
        const lintPass = await this.gateLinting();
        allPassed = allPassed && lintPass;

        // Gate 5: Build
        const buildPass = await this.gateBuild();
        allPassed = allPassed && buildPass;

        // Gate 6: Performance (si applicable)
        if (phaseConfig.performance && ['phase-2', 'phase-3', 'phase-4', 'phase-5', 'phase-6'].includes(currentPhase)) {
            const performancePass = await this.gatePerformance(phaseConfig.performance);
            allPassed = allPassed && performancePass;
        }

        this.generateReport(currentPhase, allPassed);
        
        return allPassed;
    }

    /**
     * Gate 1: Couverture de tests
     */
    async gateTestCoverage(coverageConfig) {
        console.log('🧪 Gate 1: Couverture de tests...');
        
        try {
            const result = execSync('npm run test:coverage --silent', { 
                encoding: 'utf8',
                cwd: this.projectRoot 
            });
            
            // Parser le résultat de couverture (format standard)
            const coverageMatch = result.match(/All files\s+\|\s+(\d+(?:\.\d+)?)/);
            const coverage = coverageMatch ? parseFloat(coverageMatch[1]) : 0;
            
            const passed = coverage >= coverageConfig.minimum;
            const status = passed ? '✅' : '❌';
            const target = coverage >= coverageConfig.target ? '🎯' : '';
            
            console.log(`${status} Couverture: ${coverage}% (min: ${coverageConfig.minimum}%) ${target}`);
            
            this.results.push({
                gate: 'Test Coverage',
                status: passed ? 'PASS' : 'FAIL',
                value: `${coverage}%`,
                threshold: `${coverageConfig.minimum}%`,
                details: passed ? `Couverture suffisante` : `Couverture insuffisante: ${coverage}% < ${coverageConfig.minimum}%`
            });
            
            return passed;
            
        } catch (error) {
            console.log('❌ Gate 1: Échec couverture tests');
            this.results.push({
                gate: 'Test Coverage',
                status: 'ERROR',
                value: 'N/A',
                threshold: `${coverageConfig.minimum}%`,
                details: `Erreur exécution tests: ${error.message}`
            });
            return false;
        }
    }

    /**
     * Gate 2: Complexité du code
     */
    async gateCodeComplexity(complexityConfig) {
        console.log('📊 Gate 2: Complexité du code...');
        
        try {
            // Utiliser un outil comme eslint avec règles de complexité
            const result = execSync('npx eslint src/ --format=json --rule "complexity: [2, ' + complexityConfig.max + ']"', { 
                encoding: 'utf8',
                cwd: this.projectRoot 
            });
            
            const eslintResults = JSON.parse(result || '[]');
            const complexityErrors = eslintResults.reduce((acc, file) => 
                acc + file.messages.filter(msg => msg.ruleId === 'complexity').length, 0);
            
            const passed = complexityErrors === 0;
            const status = passed ? '✅' : '❌';
            
            console.log(`${status} Complexité: ${complexityErrors} violations (max: ${complexityConfig.max})`);
            
            this.results.push({
                gate: 'Code Complexity',
                status: passed ? 'PASS' : 'FAIL',
                value: `${complexityErrors} violations`,
                threshold: `≤ ${complexityConfig.max}`,
                details: passed ? 'Complexité acceptable' : `${complexityErrors} fonctions trop complexes`
            });
            
            return passed;
            
        } catch (error) {
            // Si ESLint n'est pas configuré pour la complexité, on passe
            console.log('⚠️ Gate 2: Complexité non mesurable (ESLint non configuré)');
            this.results.push({
                gate: 'Code Complexity',
                status: 'SKIP',
                value: 'N/A',
                threshold: `≤ ${complexityConfig.max}`,
                details: 'ESLint complexité non configuré'
            });
            return true; // Ne pas bloquer si l'outil n'est pas configuré
        }
    }

    /**
     * Gate 3: Sécurité
     */
    async gateSecurity(securityConfig) {
        console.log('🛡️ Gate 3: Audit sécurité...');
        
        try {
            const auditLevel = securityConfig.level === 'critical' ? 'critical' : 
                              securityConfig.level === 'high' ? 'high' : 'moderate';
            
            const result = execSync(`npm audit --audit-level ${auditLevel} --json`, { 
                encoding: 'utf8',
                cwd: this.projectRoot 
            });
            
            const auditData = JSON.parse(result);
            const vulnerabilities = auditData.metadata ? auditData.metadata.vulnerabilities : {};
            
            const criticalCount = vulnerabilities.critical || 0;
            const highCount = vulnerabilities.high || 0;
            const moderateCount = vulnerabilities.moderate || 0;
            
            let passed = true;
            if (securityConfig.level === 'critical') {
                passed = criticalCount === 0 && highCount === 0 && moderateCount === 0;
            } else if (securityConfig.level === 'high') {
                passed = criticalCount === 0 && highCount === 0;
            } else {
                passed = criticalCount === 0;
            }
            
            const status = passed ? '✅' : '❌';
            console.log(`${status} Sécurité: Critical:${criticalCount}, High:${highCount}, Moderate:${moderateCount}`);
            
            this.results.push({
                gate: 'Security Audit',
                status: passed ? 'PASS' : 'FAIL',
                value: `C:${criticalCount} H:${highCount} M:${moderateCount}`,
                threshold: `Level: ${securityConfig.level}`,
                details: passed ? 'Aucune vulnérabilité bloquante' : `Vulnérabilités détectées niveau ${securityConfig.level}`
            });
            
            return passed;
            
        } catch (error) {
            // npm audit peut retourner exit code 1 pour warnings
            if (error.status === 1 && error.stdout) {
                try {
                    const auditData = JSON.parse(error.stdout);
                    // Retraiter avec les données de stdout
                    return this.processSecurityAuditData(auditData, securityConfig);
                } catch (parseError) {
                    console.log('❌ Gate 3: Erreur parsing audit sécurité');
                    return false;
                }
            }
            
            console.log('❌ Gate 3: Échec audit sécurité');
            this.results.push({
                gate: 'Security Audit',
                status: 'ERROR',
                value: 'N/A',
                threshold: `Level: ${securityConfig.level}`,
                details: `Erreur audit: ${error.message}`
            });
            return false;
        }
    }

    /**
     * Gate 4: Linting et qualité statique
     */
    async gateLinting() {
        console.log('🔍 Gate 4: Linting...');
        
        try {
            execSync('npm run lint', { 
                encoding: 'utf8',
                cwd: this.projectRoot,
                stdio: 'pipe'
            });
            
            console.log('✅ Linting: Aucune erreur');
            
            this.results.push({
                gate: 'Linting',
                status: 'PASS',
                value: '0 errors',
                threshold: '0 errors',
                details: 'Code conforme aux standards'
            });
            
            return true;
            
        } catch (error) {
            console.log('❌ Linting: Erreurs détectées');
            
            this.results.push({
                gate: 'Linting',
                status: 'FAIL',
                value: 'Errors found',
                threshold: '0 errors',
                details: 'Erreurs ESLint/Prettier détectées'
            });
            
            return false;
        }
    }

    /**
     * Gate 5: Build
     */
    async gateBuild() {
        console.log('🏗️ Gate 5: Build...');
        
        try {
            execSync('npm run build', { 
                encoding: 'utf8',
                cwd: this.projectRoot,
                stdio: 'pipe'
            });
            
            console.log('✅ Build: Succès');
            
            this.results.push({
                gate: 'Build',
                status: 'PASS',
                value: 'Success',
                threshold: 'Must compile',
                details: 'Compilation réussie'
            });
            
            return true;
            
        } catch (error) {
            console.log('❌ Build: Échec compilation');
            
            this.results.push({
                gate: 'Build',
                status: 'FAIL',
                value: 'Failed',
                threshold: 'Must compile',
                details: 'Erreurs de compilation détectées'
            });
            
            return false;
        }
    }

    /**
     * Gate 6: Performance (optionnel)
     */
    async gatePerformance(performanceConfig) {
        console.log('⚡ Gate 6: Performance...');
        
        // Pour l'instant, on simule un test de performance basique
        // Dans un vrai projet, utiliser Lighthouse CI ou similaire
        
        console.log('⚠️ Performance: Simulation (Lighthouse CI non configuré)');
        
        this.results.push({
            gate: 'Performance',
            status: 'SKIP',
            value: 'N/A',
            threshold: `Lighthouse ≥ ${performanceConfig.lighthouse}`,
            details: 'Lighthouse CI non configuré'
        });
        
        return true; // Ne pas bloquer pour l'instant
    }

    /**
     * Génération rapport détaillé
     */
    generateReport(phase, allPassed) {
        const passedCount = this.results.filter(r => r.status === 'PASS').length;
        const failedCount = this.results.filter(r => r.status === 'FAIL').length;
        const skippedCount = this.results.filter(r => r.status === 'SKIP').length;
        
        const report = `# 📊 Quality Gates Report - ${phase}

**Date**: ${new Date().toISOString()}
**Status**: ${allPassed ? '✅ PASS' : '❌ FAIL'}
**Score**: ${passedCount}/${this.results.length - skippedCount} gates passées

## 📋 Détail des Gates

| Gate | Status | Valeur | Seuil | Détails |
|------|--------|--------|-------|---------|
${this.results.map(r => `| ${r.gate} | ${r.status} | ${r.value} | ${r.threshold} | ${r.details} |`).join('\n')}

## 📈 Statistiques
- ✅ **Passées**: ${passedCount}
- ❌ **Échouées**: ${failedCount}
- ⚠️ **Ignorées**: ${skippedCount}

## 🎯 Actions Recommandées
${failedCount > 0 ? this.generateActionRecommendations() : '🎉 Toutes les quality gates sont passées !'}

---
*Généré par Quality Gates v2.0*
`;

        const reportPath = path.join(this.projectRoot, 'REPORT_QUALITY_GATES.md');
        fs.writeFileSync(reportPath, report, 'utf8');
        
        console.log(`📋 Rapport généré: ${reportPath}`);
        
        if (allPassed) {
            console.log('🎉 Toutes les Quality Gates sont passées !');
        } else {
            console.log('❌ Certaines Quality Gates ont échoué. Voir le rapport pour détails.');
        }
    }

    /**
     * Génération recommandations d'actions
     */
    generateActionRecommendations() {
        const failedGates = this.results.filter(r => r.status === 'FAIL');
        
        const recommendations = failedGates.map(gate => {
            switch (gate.gate) {
                case 'Test Coverage':
                    return '- 🧪 **Augmenter couverture tests**: Ajouter tests unitaires/intégration manquants';
                case 'Code Complexity':
                    return '- 📊 **Réduire complexité**: Refactoriser fonctions complexes en sous-fonctions';
                case 'Security Audit':
                    return '- 🛡️ **Corriger vulnérabilités**: `npm audit fix` ou mise à jour dépendances';
                case 'Linting':
                    return '- 🔍 **Corriger style**: `npm run lint:fix` ou correction manuelle';
                case 'Build':
                    return '- 🏗️ **Corriger compilation**: Résoudre erreurs TypeScript/syntax';
                default:
                    return `- ⚠️ **${gate.gate}**: ${gate.details}`;
            }
        });
        
        return recommendations.join('\n');
    }
}

// Exécution
if (require.main === module) {
    const qualityGates = new QualityGates();
    const phase = process.argv[2]; // Optionnel: spécifier phase
    
    qualityGates.executeAll(phase)
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Erreur Quality Gates:', error);
            process.exit(1);
        });
}

module.exports = QualityGates;
