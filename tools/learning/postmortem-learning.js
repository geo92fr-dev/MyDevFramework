#!/usr/bin/env node

/**
 * @criticality HIGH
 * @depends LOG_POSTMORTEM.md, fs, path
 * @description Système d'apprentissage automatique basé sur l'analyse des post-mortem
 * @phase ALL - Amélioration continue
 * @category learning
 */

const fs = require('fs');
const path = require('path');

class PostMortemLearningSystem {
    constructor() {
        this.projectRoot = process.cwd();
        this.postMortemFile = path.join(this.projectRoot, 'LOG_POSTMORTEM.md');
        this.patternsFile = path.join(this.projectRoot, 'PATTERNS_LEARNED.json');
        this.improvementsFile = path.join(this.projectRoot, 'IMPROVEMENTS_SUGGESTED.md');
        this.patterns = this.loadExistingPatterns();
        this.learningData = {
            errorFrequency: {},
            solutionEffectiveness: {},
            timeToResolution: {},
            recurrencePatterns: []
        };
    }

    /**
     * Chargement des patterns existants
     */
    loadExistingPatterns() {
        if (fs.existsSync(this.patternsFile)) {
            try {
                return JSON.parse(fs.readFileSync(this.patternsFile, 'utf8'));
            } catch (error) {
                console.warn('⚠️ Erreur lecture patterns existants, initialisation vide');
                return this.getDefaultPatterns();
            }
        }
        return this.getDefaultPatterns();
    }

    /**
     * Patterns par défaut
     */
    getDefaultPatterns() {
        return {
            version: "1.0",
            lastAnalysis: null,
            errorPatterns: {},
            solutionPatterns: {},
            preventionRules: [],
            qualityImprovements: [],
            learningMetrics: {
                totalIncidents: 0,
                resolvedIncidents: 0,
                averageResolutionTime: 0,
                recurrenceRate: 0,
                improvementsSuggested: 0,
                improvementsImplemented: 0
            }
        };
    }

    /**
     * Analyse complète du post-mortem
     */
    async analyzePostMortem() {
        console.log('🧠 Démarrage analyse Post-Mortem Auto-Apprenante...');
        
        if (!fs.existsSync(this.postMortemFile)) {
            console.log('📋 Aucun post-mortem trouvé, initialisation du système');
            await this.initializePostMortem();
            return;
        }

        const postMortemContent = fs.readFileSync(this.postMortemFile, 'utf8');
        
        // Étape 1: Extraction des incidents
        const incidents = this.extractIncidents(postMortemContent);
        console.log(`📊 ${incidents.length} incidents détectés pour analyse`);

        // Étape 2: Analyse des patterns
        await this.analyzeErrorPatterns(incidents);
        
        // Étape 3: Évaluation de l'efficacité des solutions
        await this.analyzeSolutionEffectiveness(incidents);
        
        // Étape 4: Détection de récurrence
        await this.detectRecurrencePatterns(incidents);
        
        // Étape 5: Génération des améliorations
        const improvements = await this.generateImprovements();
        
        // Étape 6: Mise à jour des patterns
        await this.updatePatterns(improvements);
        
        // Étape 7: Génération du rapport d'apprentissage
        await this.generateLearningReport(improvements);
        
        console.log('✅ Analyse Post-Mortem terminée avec succès');
    }

    /**
     * Extraction des incidents depuis le post-mortem
     */
    extractIncidents(content) {
        const incidents = [];
        
        // Pattern pour détecter les incidents
        const incidentRegex = /## \[([^\]]+)\] - (.+?)\n\n### 🎯 Contexte\n- \*\*Phase\*\* : (.+?)\n- \*\*Composant\*\* : (.+?)\n- \*\*Déclencheur\*\* : (.+?)\n\n### 🔍 Analyse Racine\n- \*\*Symptôme\*\* : (.+?)\n- \*\*Cause Première\*\* : (.+?)\n- \*\*Point de Défaillance\*\* : (.+?)\n\n### 💡 Solution Appliquée\n- \*\*Fix Immédiat\*\* : (.+?)\n- \*\*Fix Structurel\*\* : (.+?)\n- \*\*Prévention\*\* : (.+?)\n/gs;
        
        let match;
        while ((match = incidentRegex.exec(content)) !== null) {
            incidents.push({
                timestamp: match[1],
                title: match[2],
                phase: match[3],
                component: match[4],
                trigger: match[5],
                symptom: match[6],
                rootCause: match[7],
                failurePoint: match[8],
                immediateFix: match[9],
                structuralFix: match[10],
                prevention: match[11],
                date: new Date(match[1])
            });
        }
        
        return incidents;
    }

    /**
     * Analyse des patterns d'erreurs
     */
    async analyzeErrorPatterns(incidents) {
        console.log('🔍 Analyse des patterns d\'erreurs...');
        
        for (const incident of incidents) {
            // Categorisation automatique
            const category = this.categorizeError(incident);
            const phase = incident.phase;
            const component = incident.component;
            
            // Comptage des fréquences
            if (!this.learningData.errorFrequency[category]) {
                this.learningData.errorFrequency[category] = 0;
            }
            this.learningData.errorFrequency[category]++;
            
            // Patterns par phase
            if (!this.patterns.errorPatterns[phase]) {
                this.patterns.errorPatterns[phase] = {};
            }
            if (!this.patterns.errorPatterns[phase][category]) {
                this.patterns.errorPatterns[phase][category] = {
                    count: 0,
                    symptoms: [],
                    causes: [],
                    components: []
                };
            }
            
            this.patterns.errorPatterns[phase][category].count++;
            this.patterns.errorPatterns[phase][category].symptoms.push(incident.symptom);
            this.patterns.errorPatterns[phase][category].causes.push(incident.rootCause);
            this.patterns.errorPatterns[phase][category].components.push(component);
        }
        
        console.log(`📊 Patterns identifiés: ${Object.keys(this.learningData.errorFrequency).length} catégories`);
    }

    /**
     * Catégorisation automatique des erreurs
     */
    categorizeError(incident) {
        const trigger = incident.trigger.toLowerCase();
        const symptom = incident.symptom.toLowerCase();
        const cause = incident.rootCause.toLowerCase();
        
        // Tests et validation
        if (trigger.includes('test') || symptom.includes('test') || cause.includes('test')) {
            return 'testing';
        }
        
        // Build et compilation
        if (trigger.includes('build') || symptom.includes('compilation') || cause.includes('typescript')) {
            return 'build';
        }
        
        // Qualité de code
        if (trigger.includes('lint') || symptom.includes('style') || cause.includes('format')) {
            return 'code-quality';
        }
        
        // Configuration
        if (trigger.includes('config') || symptom.includes('configuration') || cause.includes('environment')) {
            return 'configuration';
        }
        
        // Sécurité
        if (trigger.includes('audit') || symptom.includes('vulnerability') || cause.includes('security')) {
            return 'security';
        }
        
        // Dépendances
        if (trigger.includes('dependency') || symptom.includes('module') || cause.includes('package')) {
            return 'dependencies';
        }
        
        // Authentication
        if (trigger.includes('auth') || symptom.includes('login') || cause.includes('firebase')) {
            return 'authentication';
        }
        
        return 'general';
    }

    /**
     * Analyse de l'efficacité des solutions
     */
    async analyzeSolutionEffectiveness(incidents) {
        console.log('💡 Analyse efficacité des solutions...');
        
        for (const incident of incidents) {
            const solutionType = this.categorizeSolution(incident);
            
            if (!this.learningData.solutionEffectiveness[solutionType]) {
                this.learningData.solutionEffectiveness[solutionType] = {
                    used: 0,
                    successful: 0,
                    averageTime: 0
                };
            }
            
            this.learningData.solutionEffectiveness[solutionType].used++;
            
            // Heuristique simple pour déterminer le succès
            // (dans un vrai système, on trackrait les récurrences)
            if (!this.isRecurrentError(incident)) {
                this.learningData.solutionEffectiveness[solutionType].successful++;
            }
        }
    }

    /**
     * Catégorisation des solutions
     */
    categorizeSolution(incident) {
        const fix = incident.immediateFix.toLowerCase() + ' ' + incident.structuralFix.toLowerCase();
        
        if (fix.includes('test') || fix.includes('coverage')) return 'testing-improvement';
        if (fix.includes('format') || fix.includes('lint')) return 'code-formatting';
        if (fix.includes('config') || fix.includes('setup')) return 'configuration-fix';
        if (fix.includes('dependency') || fix.includes('install')) return 'dependency-management';
        if (fix.includes('refactor') || fix.includes('restructure')) return 'code-refactoring';
        if (fix.includes('documentation') || fix.includes('comment')) return 'documentation-update';
        
        return 'general-fix';
    }

    /**
     * Détection des patterns de récurrence
     */
    async detectRecurrencePatterns(incidents) {
        console.log('🔄 Détection patterns de récurrence...');
        
        const errorGroups = {};
        
        for (const incident of incidents) {
            const key = this.generateErrorSignature(incident);
            
            if (!errorGroups[key]) {
                errorGroups[key] = [];
            }
            errorGroups[key].push(incident);
        }
        
        // Identifier les erreurs récurrentes
        for (const [signature, occurrences] of Object.entries(errorGroups)) {
            if (occurrences.length > 1) {
                this.learningData.recurrencePatterns.push({
                    signature,
                    count: occurrences.length,
                    incidents: occurrences,
                    avgTimeBetween: this.calculateAverageTimeBetween(occurrences),
                    category: this.categorizeError(occurrences[0])
                });
            }
        }
        
        console.log(`🔄 ${this.learningData.recurrencePatterns.length} patterns récurrents détectés`);
    }

    /**
     * Génération signature d'erreur pour détection récurrence
     */
    generateErrorSignature(incident) {
        // Signature basée sur composant + cause + type d'erreur
        const category = this.categorizeError(incident);
        const component = incident.component;
        const simplifiedCause = incident.rootCause.toLowerCase()
            .replace(/[0-9]+/g, 'X') // Remplacer nombres par X
            .replace(/\s+/g, '_')    // Espaces en underscores
            .substring(0, 50);       // Limiter la longueur
        
        return `${category}_${component}_${simplifiedCause}`;
    }

    /**
     * Calcul temps moyen entre occurrences
     */
    calculateAverageTimeBetween(incidents) {
        if (incidents.length < 2) return 0;
        
        const sortedIncidents = incidents.sort((a, b) => a.date - b.date);
        let totalTime = 0;
        
        for (let i = 1; i < sortedIncidents.length; i++) {
            totalTime += sortedIncidents[i].date - sortedIncidents[i-1].date;
        }
        
        return totalTime / (sortedIncidents.length - 1);
    }

    /**
     * Vérification si une erreur est récurrente
     */
    isRecurrentError(incident) {
        const signature = this.generateErrorSignature(incident);
        return this.learningData.recurrencePatterns.some(pattern => 
            pattern.signature === signature && pattern.count > 1
        );
    }

    /**
     * Génération des améliorations suggérées
     */
    async generateImprovements() {
        console.log('🚀 Génération améliorations suggérées...');
        
        const improvements = [];
        
        // Améliorations basées sur fréquence d'erreurs
        for (const [category, frequency] of Object.entries(this.learningData.errorFrequency)) {
            if (frequency >= 3) { // Seuil de fréquence
                improvements.push({
                    type: 'prevention',
                    priority: frequency >= 5 ? 'HIGH' : 'MEDIUM',
                    category: category,
                    description: this.generatePreventionRule(category, frequency),
                    implementation: this.generateImplementationPlan(category),
                    impact: `Réduction estimée de ${Math.round(frequency * 0.7)} incidents futurs`
                });
            }
        }
        
        // Améliorations basées sur récurrence
        for (const pattern of this.learningData.recurrencePatterns) {
            if (pattern.count >= 2) {
                improvements.push({
                    type: 'automation',
                    priority: pattern.count >= 3 ? 'HIGH' : 'MEDIUM',
                    category: pattern.category,
                    description: `Automatiser la prévention des erreurs récurrentes: ${pattern.signature}`,
                    implementation: this.generateAutomationPlan(pattern),
                    impact: `Élimination de ${pattern.count} occurrences similaires`
                });
            }
        }
        
        // Améliorations des quality gates
        improvements.push(...this.generateQualityGateImprovements());
        
        // Améliorations de documentation
        improvements.push(...this.generateDocumentationImprovements());
        
        console.log(`💡 ${improvements.length} améliorations générées`);
        return improvements;
    }

    /**
     * Génération règle de prévention
     */
    generatePreventionRule(category, frequency) {
        const rules = {
            'testing': `Ajouter gate de couverture obligatoire > 85% (${frequency} échecs détectés)`,
            'build': `Validation TypeScript stricte en pre-commit (${frequency} erreurs compilation)`,
            'code-quality': `Auto-formatage forcé avant commit (${frequency} problèmes style)`,
            'configuration': `Validation environnement au démarrage (${frequency} erreurs config)`,
            'security': `Audit sécurité automatique hebdomadaire (${frequency} vulnérabilités)`,
            'dependencies': `Monitoring dépendances avec alerts (${frequency} problèmes deps)`,
            'authentication': `Tests auth automatiques en CI/CD (${frequency} échecs auth)`
        };
        
        return rules[category] || `Améliorer validation pour ${category} (${frequency} incidents)`;
    }

    /**
     * Génération plan d'implémentation
     */
    generateImplementationPlan(category) {
        const plans = {
            'testing': [
                'Ajouter script npm run test:coverage:enforce',
                'Modifier quality-gates.js pour bloquer si < 85%',
                'Ajouter hook pre-commit pour validation couverture'
            ],
            'build': [
                'Configurer TypeScript strict mode',
                'Ajouter tsc --noEmit en pre-commit',
                'Créer script de validation build en CI'
            ],
            'code-quality': [
                'Configurer prettier en pre-commit hook',
                'Ajouter eslint --fix automatique',
                'Bloquer commit si style non conforme'
            ],
            'configuration': [
                'Créer script check-env.js',
                'Valider variables environnement au startup',
                'Documenter configuration requise'
            ],
            'security': [
                'Scheduler npm audit automatique',
                'Configurer Snyk ou équivalent',
                'Alertes automatiques vulnérabilités'
            ],
            'dependencies': [
                'Monitoring avec renovate ou dependabot',
                'Tests automatiques mise à jour deps',
                'Audit régulier licences'
            ],
            'authentication': [
                'Tests E2E auth en CI/CD',
                'Monitoring connexions Firebase',
                'Validation tokens régulière'
            ]
        };
        
        return plans[category] || ['Analyser cause racine', 'Implémenter solution', 'Tester prévention'];
    }

    /**
     * Génération plan d'automatisation
     */
    generateAutomationPlan(pattern) {
        return [
            `Créer détecteur automatique pour pattern: ${pattern.signature}`,
            'Ajouter validation préventive dans orchestrateur',
            'Configurer alerte proactive si pattern détecté',
            'Documenter pattern dans base de connaissances'
        ];
    }

    /**
     * Améliorations quality gates suggérées
     */
    generateQualityGateImprovements() {
        const improvements = [];
        
        // Basé sur les patterns observés
        if (this.learningData.errorFrequency.testing >= 2) {
            improvements.push({
                type: 'quality-gate',
                priority: 'HIGH',
                category: 'testing',
                description: 'Renforcer gate de couverture de tests',
                implementation: [
                    'Augmenter seuil couverture minimum de 5%',
                    'Ajouter validation branch coverage',
                    'Bloquer merge si régression couverture'
                ],
                impact: 'Réduction des bugs en production'
            });
        }
        
        if (this.learningData.errorFrequency['code-quality'] >= 2) {
            improvements.push({
                type: 'quality-gate',
                priority: 'MEDIUM',
                category: 'code-quality',
                description: 'Automatiser complètement le formatage',
                implementation: [
                    'Pre-commit hook formatage obligatoire',
                    'IDE configuration automatique',
                    'CI/CD check formatage strict'
                ],
                impact: 'Élimination des problèmes de style'
            });
        }
        
        return improvements;
    }

    /**
     * Améliorations documentation suggérées
     */
    generateDocumentationImprovements() {
        return [
            {
                type: 'documentation',
                priority: 'MEDIUM',
                category: 'automation',
                description: 'Auto-génération documentation patterns appris',
                implementation: [
                    'Créer DOC_PATTERNS_LEARNED.md automatique',
                    'Synchroniser avec post-mortem',
                    'Alertes documentation obsolète'
                ],
                impact: 'Documentation toujours à jour'
            }
        ];
    }

    /**
     * Mise à jour des patterns
     */
    async updatePatterns(improvements) {
        this.patterns.lastAnalysis = new Date().toISOString();
        this.patterns.qualityImprovements = improvements;
        
        // Mise à jour métriques
        this.patterns.learningMetrics.totalIncidents = Object.values(this.learningData.errorFrequency)
            .reduce((sum, freq) => sum + freq, 0);
        this.patterns.learningMetrics.recurrenceRate = 
            (this.learningData.recurrencePatterns.length / this.patterns.learningMetrics.totalIncidents * 100).toFixed(1);
        this.patterns.learningMetrics.improvementsSuggested = improvements.length;
        
        // Sauvegarde
        fs.writeFileSync(this.patternsFile, JSON.stringify(this.patterns, null, 2));
        console.log(`💾 Patterns sauvegardés: ${this.patternsFile}`);
    }

    /**
     * Génération rapport d'apprentissage
     */
    async generateLearningReport(improvements) {
        const report = `# 🧠 Rapport d'Apprentissage Post-Mortem

**Date d'analyse**: ${new Date().toISOString()}  
**Version**: ${this.patterns.version}

## 📊 Métriques d'Apprentissage

### 🔢 Statistiques Globales
- **Total incidents analysés**: ${this.patterns.learningMetrics.totalIncidents}
- **Patterns récurrents**: ${this.learningData.recurrencePatterns.length}
- **Taux de récurrence**: ${this.patterns.learningMetrics.recurrenceRate}%
- **Améliorations suggérées**: ${improvements.length}

### 📈 Fréquence d'Erreurs par Catégorie
| Catégorie | Fréquence | Criticité |
|-----------|-----------|-----------|
${Object.entries(this.learningData.errorFrequency)
    .sort(([,a], [,b]) => b - a)
    .map(([cat, freq]) => `| ${cat} | ${freq} | ${freq >= 5 ? '🔴 HIGH' : freq >= 3 ? '🟡 MEDIUM' : '🟢 LOW'} |`)
    .join('\n')}

## 🔄 Patterns Récurrents Critiques

${this.learningData.recurrencePatterns
    .filter(p => p.count >= 2)
    .map(pattern => `### ${pattern.category} (${pattern.count} occurrences)
- **Signature**: \`${pattern.signature}\`
- **Fréquence moyenne**: ${Math.round(pattern.avgTimeBetween / (1000 * 60 * 60 * 24))} jours
- **Impact**: ${pattern.count} incidents similaires`)
    .join('\n\n')}

## 💡 Améliorations Prioritaires

### 🔴 Priorité HAUTE
${improvements
    .filter(imp => imp.priority === 'HIGH')
    .map(imp => `#### ${imp.category} - ${imp.description}
**Type**: ${imp.type}  
**Impact**: ${imp.impact}

**Plan d'implémentation**:
${imp.implementation.map(step => `- ${step}`).join('\n')}`)
    .join('\n\n')}

### 🟡 Priorité MOYENNE  
${improvements
    .filter(imp => imp.priority === 'MEDIUM')
    .map(imp => `#### ${imp.category} - ${imp.description}
**Impact**: ${imp.impact}`)
    .join('\n\n')}

## 🎯 Recommandations d'Action

### 🚨 Actions Immédiates (À implémenter cette semaine)
${improvements
    .filter(imp => imp.priority === 'HIGH')
    .map(imp => `- [ ] **${imp.category}**: ${imp.description}`)
    .join('\n')}

### 📅 Actions Planifiées (À implémenter ce mois)
${improvements
    .filter(imp => imp.priority === 'MEDIUM')
    .map(imp => `- [ ] **${imp.category}**: ${imp.description}`)
    .join('\n')}

## 📈 Prédictions et Tendances

### 🔮 Risques Probables
- **Récurrence ${this.getMostRecurrentCategory()}**: Probabilité ${this.calculateRecurrenceProbability()}%
- **Nouvelle vulnérabilité sécurité**: Basé sur pattern historique
- **Problème dependencies**: ${this.learningData.errorFrequency.dependencies || 0} incidents récents

### 🎯 Objectifs d'Amélioration
- **Réduction incidents**: -${Math.round(improvements.length * 0.3)} incidents/mois estimés
- **Temps résolution**: -20% avec automatisation
- **Qualité globale**: +15% score quality gates

## 🔧 Intégration Orchestrateur

### Scripts Recommandés à Ajouter
\`\`\`bash
# Analysis automatique post-mortem
npm run analyze:postmortem

# Application améliorations suggérées
npm run apply:improvements --category=testing

# Monitoring patterns récurrents
npm run monitor:patterns --alert=high
\`\`\`

### Configuration Quality Gates Suggérée
\`\`\`json
{
  "learningMode": true,
  "adaptiveThresholds": true,
  "patternDetection": true,
  "autoImprovement": true
}
\`\`\`

---
*Généré automatiquement par Post-Mortem Learning System v1.0*
*Prochaine analyse: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)}*
`;

        fs.writeFileSync(this.improvementsFile, report);
        console.log(`📋 Rapport d'apprentissage généré: ${this.improvementsFile}`);
    }

    /**
     * Catégorie la plus récurrente
     */
    getMostRecurrentCategory() {
        if (this.learningData.recurrencePatterns.length === 0) return 'aucune';
        
        const categoryCounts = {};
        for (const pattern of this.learningData.recurrencePatterns) {
            categoryCounts[pattern.category] = (categoryCounts[pattern.category] || 0) + pattern.count;
        }
        
        return Object.entries(categoryCounts)
            .sort(([,a], [,b]) => b - a)[0][0];
    }

    /**
     * Calcul probabilité de récurrence
     */
    calculateRecurrenceProbability() {
        const totalIncidents = this.patterns.learningMetrics.totalIncidents;
        const recurrentIncidents = this.learningData.recurrencePatterns
            .reduce((sum, pattern) => sum + pattern.count, 0);
        
        if (totalIncidents === 0) return 0;
        return Math.round((recurrentIncidents / totalIncidents) * 100);
    }

    /**
     * Initialisation du système
     */
    async initializePostMortem() {
        const initialContent = `# 📝 Post-Mortem Log - Apprentissage Continu

*Système d'apprentissage automatique initialisé le ${new Date().toISOString()}*

## Instructions

Ce fichier est analysé automatiquement par le système d'apprentissage.  
Chaque incident doit suivre ce format:

\`\`\`markdown
## [YYYY-MM-DDTHH:mm:ss] - Titre de l'incident

### 🎯 Contexte
- **Phase** : [X.Y]
- **Composant** : [nom du composant]
- **Déclencheur** : [action qui a causé le problème]

### 🔍 Analyse Racine
- **Symptôme** : [ce qui a été observé]
- **Cause Première** : [pourquoi c'est arrivé]
- **Point de Défaillance** : [où le processus a échoué]

### 💡 Solution Appliquée
- **Fix Immédiat** : [correction rapide]
- **Fix Structurel** : [amélioration du processus]
- **Prévention** : [comment éviter la récurrence]

### 📈 Amélioration du CBD Suggérée
- [ ] Nouvelle vérification à ajouter
- [ ] Template à modifier
- [ ] Script à créer/améliorer
- [ ] Documentation à enrichir

### 🎯 Impact et Métriques
- **Temps de résolution** : [durée]
- **Complexité** : [1-5]
- **Récurrence** : [première fois / récurrent]
\`\`\`

---

*Analyse automatique: \`npm run analyze:postmortem\`*
`;

        fs.writeFileSync(this.postMortemFile, initialContent);
        console.log(`📋 Post-mortem initialisé: ${this.postMortemFile}`);
    }
}

// Exécution
if (require.main === module) {
    const learningSystem = new PostMortemLearningSystem();
    
    learningSystem.analyzePostMortem()
        .then(() => {
            console.log('🎓 Analyse d\'apprentissage terminée avec succès');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 Erreur système d\'apprentissage:', error);
            process.exit(1);
        });
}

module.exports = PostMortemLearningSystem;
