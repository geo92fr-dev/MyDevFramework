#!/usr/bin/env node

/**
 * Script de validation CBD - Vérifie la conformité des prompts
 * Usage: npm run validate:cbd
 */

const fs = require('fs');
const path = require('path');

class CBDValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.requiredTags = ['[CONTEXT]', '[FILE]', '[CMD]', '[TEST]', '[CHECK]'];
    }

    log(type, message) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
        
        if (type === 'error') this.errors.push(message);
        if (type === 'warning') this.warnings.push(message);
    }

    validateProjectStructure() {
        this.log('info', 'Validation de la structure du projet...');
        
        const requiredFiles = [
            'package.json',
            'DOC_CBD.md',
            'src',
            'tests'
        ];

        const recommendedDocs = [
            'DOC_README.md',
            'DOC_ROADMAP_LEARNING.md',
            'DOC_GIT_REMOTE_CONFIG.md'
        ];

        const requiredDirs = [
            'src/lib',
            'src/routes',
            'tests/unit'
        ];

        requiredFiles.forEach(file => {
            if (!fs.existsSync(file)) {
                this.log('error', `Fichier requis manquant: ${file}`);
            }
        });

        requiredDirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                this.log('warning', `Dossier recommandé manquant: ${dir}`);
            }
        });

        // Vérifier la convention de nommage des documents
        recommendedDocs.forEach(doc => {
            if (fs.existsSync(doc)) {
                this.log('info', `Document conforme à la convention DOC_: ${doc}`);
            } else {
                this.log('warning', `Document recommandé manquant: ${doc}`);
            }
        });

        // Vérifier qu'aucun document ne viole la convention DOC_
        const files = fs.readdirSync('.');
        const docFiles = files.filter(file => 
            file.endsWith('.md') && 
            !file.startsWith('DOC_') && 
            !['package.json', '.gitignore'].includes(file)
        );
        
        if (docFiles.length > 0) {
            docFiles.forEach(file => {
                this.log('warning', `Document devrait utiliser le préfixe DOC_: ${file}`);
            });
        }
    }

    validateCBDDocument() {
        this.log('info', 'Validation du document CBD...');
        
        if (!fs.existsSync('DOC_CBD.md')) {
            this.log('error', 'Document CBD manquant (DOC_CBD.md)');
            return;
        }

        const content = fs.readFileSync('DOC_CBD.md', 'utf8');
        
        // Vérifier la présence des sections essentielles
        const requiredSections = [
            '## 🎯 Objectif',
            '## 🚀 Quick Start',
            '## 📝 Templates',
            '## 🔍 Processus de Vérification'
        ];

        requiredSections.forEach(section => {
            if (!content.includes(section)) {
                this.log('warning', `Section recommandée manquante: ${section}`);
            }
        });

        // Vérifier les exemples de templates
        const templateCount = (content.match(/```markdown/g) || []).length;
        if (templateCount < 3) {
            this.log('warning', `Pas assez de templates d'exemple (${templateCount} trouvé(s), 3 minimum recommandé)`);
        }
    }

    validatePackageJson() {
        this.log('info', 'Validation package.json...');
        
        if (!fs.existsSync('package.json')) {
            this.log('error', 'package.json manquant');
            return;
        }

        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        // Scripts recommandés
        const recommendedScripts = [
            'validate:cbd',
            'check:env',
            'test',
            'lint'
        ];

        const scripts = pkg.scripts || {};
        recommendedScripts.forEach(script => {
            if (!scripts[script]) {
                this.log('warning', `Script NPM recommandé manquant: ${script}`);
            }
        });

        // Dépendances de développement recommandées
        const recommendedDevDeps = [
            'eslint',
            'prettier',
            'vitest'
        ];

        const devDeps = pkg.devDependencies || {};
        recommendedDevDeps.forEach(dep => {
            if (!devDeps[dep]) {
                this.log('warning', `Dépendance de dev recommandée manquante: ${dep}`);
            }
        });
    }

    validateEnvironment() {
        this.log('info', 'Validation de l\'environnement...');
        
        // Vérifier Node.js version
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
        
        if (majorVersion < 16) {
            this.log('error', `Version Node.js trop ancienne: ${nodeVersion} (>= 16 requis)`);
        } else {
            this.log('info', `Version Node.js OK: ${nodeVersion}`);
        }

        // Vérifier npm
        try {
            const { execSync } = require('child_process');
            const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
            this.log('info', `Version NPM: ${npmVersion}`);
        } catch (error) {
            this.log('error', 'NPM non disponible');
        }
    }

    validateGitSetup() {
        this.log('info', 'Validation de la configuration Git...');
        
        if (!fs.existsSync('.git')) {
            this.log('warning', 'Projet non initialisé avec Git');
            return;
        }

        // Vérifier .gitignore
        if (!fs.existsSync('.gitignore')) {
            this.log('warning', 'Fichier .gitignore manquant');
        } else {
            const gitignore = fs.readFileSync('.gitignore', 'utf8');
            const requiredIgnores = ['node_modules', '.env', 'dist', '.DS_Store'];
            
            requiredIgnores.forEach(ignore => {
                if (!gitignore.includes(ignore)) {
                    this.log('warning', `Entrée .gitignore manquante: ${ignore}`);
                }
            });
        }

        // Vérifier si Husky est configuré
        if (fs.existsSync('.husky')) {
            this.log('info', 'Git Hooks (Husky) configuré ✓');
        } else {
            this.log('info', 'Git Hooks non configuré (recommandé pour automatisation)');
        }
    }

    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 RAPPORT DE VALIDATION CBD');
        console.log('='.repeat(60));
        
        console.log(`\n✅ Validations réussies`);
        console.log(`⚠️  Avertissements: ${this.warnings.length}`);
        console.log(`❌ Erreurs: ${this.errors.length}`);

        if (this.warnings.length > 0) {
            console.log('\n⚠️  AVERTISSEMENTS:');
            this.warnings.forEach(warning => console.log(`   • ${warning}`));
        }

        if (this.errors.length > 0) {
            console.log('\n❌ ERREURS:');
            this.errors.forEach(error => console.log(`   • ${error}`));
            console.log('\n🔧 Actions requises pour corriger les erreurs ci-dessus.');
        }

        if (this.errors.length === 0 && this.warnings.length === 0) {
            console.log('\n🎉 Projet conforme au CBD ! Aucun problème détecté.');
        }

        console.log('\n' + '='.repeat(60));
        
        return this.errors.length === 0;
    }

    run() {
        console.log('🤖 Validation CBD - Check Before Doing');
        console.log(`📅 ${new Date().toLocaleString()}\n`);

        this.validateEnvironment();
        this.validateProjectStructure();
        this.validatePackageJson();
        this.validateCBDDocument();
        this.validateGitSetup();

        const success = this.generateReport();
        process.exit(success ? 0 : 1);
    }
}

// Exécution du script
if (require.main === module) {
    const validator = new CBDValidator();
    validator.run();
}

module.exports = CBDValidator;
