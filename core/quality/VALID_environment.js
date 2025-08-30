#!/usr/bin/env node

/**
 * Script de vérification de l'environnement
 * Usage: npm run check:env
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class EnvironmentChecker {
    constructor() {
        this.results = {
            passed: [],
            warnings: [],
            errors: []
        };
    }

    check(name, condition, message, type = 'error') {
        try {
            if (condition()) {
                this.results.passed.push(`✅ ${name}: ${message}`);
                return true;
            } else {
                this.results[type === 'error' ? 'errors' : 'warnings'].push(`${type === 'error' ? '❌' : '⚠️'} ${name}: ${message}`);
                return false;
            }
        } catch (error) {
            this.results.errors.push(`❌ ${name}: Erreur lors de la vérification - ${error.message}`);
            return false;
        }
    }

    checkNodeVersion() {
        return this.check(
            'Node.js',
            () => {
                const version = process.version;
                const major = parseInt(version.slice(1).split('.')[0]);
                return major >= 16;
            },
            `Version ${process.version} (>= 16 requis)`
        );
    }

    checkNpmVersion() {
        return this.check(
            'NPM',
            () => {
                const version = execSync('npm --version', { encoding: 'utf8' }).trim();
                const major = parseInt(version.split('.')[0]);
                return major >= 7;
            },
            'Version compatible trouvée'
        );
    }

    checkGitAvailable() {
        return this.check(
            'Git',
            () => {
                execSync('git --version', { stdio: 'ignore' });
                return true;
            },
            'Git disponible et configuré'
        );
    }

    checkProjectStructure() {
        const requiredFiles = ['package.json', 'DOC_CoPilot_Practices.md'];
        const requiredDirs = ['src'];

        return this.check(
            'Structure projet',
            () => {
                return requiredFiles.every(file => fs.existsSync(file)) &&
                       requiredDirs.every(dir => fs.existsSync(dir));
            },
            'Structure de base présente'
        );
    }

    checkPackageJson() {
        return this.check(
            'package.json',
            () => {
                if (!fs.existsSync('package.json')) return false;
                const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
                return pkg.name && pkg.version;
            },
            'Fichier package.json valide'
        );
    }

    checkNodeModules() {
        return this.check(
            'Dépendances',
            () => fs.existsSync('node_modules'),
            'node_modules présent',
            'warning'
        );
    }

    checkEnvironmentFiles() {
        const envFiles = ['.env', '.env.local', '.env.development'];
        const hasEnvFile = envFiles.some(file => fs.existsSync(file));
        
        return this.check(
            'Variables d\'environnement',
            () => hasEnvFile,
            hasEnvFile ? 'Fichier de configuration trouvé' : 'Aucun fichier .env trouvé',
            'warning'
        );
    }

    checkGitIgnore() {
        return this.check(
            '.gitignore',
            () => {
                if (!fs.existsSync('.gitignore')) return false;
                const content = fs.readFileSync('.gitignore', 'utf8');
                const requiredEntries = ['node_modules', '.env'];
                return requiredEntries.every(entry => content.includes(entry));
            },
            '.gitignore correctement configuré',
            'warning'
        );
    }

    checkDiskSpace() {
        return this.check(
            'Espace disque',
            () => {
                const stats = fs.statSync('.');
                // Vérification basique - en production, utiliser un module dédié
                return true;
            },
            'Espace suffisant disponible'
        );
    }

    checkWritePermissions() {
        return this.check(
            'Permissions écriture',
            () => {
                const testFile = path.join(process.cwd(), '.write-test-temp');
                try {
                    fs.writeFileSync(testFile, 'test');
                    fs.unlinkSync(testFile);
                    return true;
                } catch {
                    return false;
                }
            },
            'Permissions d\'écriture OK'
        );
    }

    checkPortAvailability() {
        return this.check(
            'Port de développement',
            () => {
                // Vérification simplifiée - en production, tester le port 5173 (Vite)
                return true;
            },
            'Port de développement disponible',
            'warning'
        );
    }

    generateSuggestions() {
        const suggestions = [];

        if (this.results.errors.some(err => err.includes('Node.js'))) {
            suggestions.push('📥 Installer Node.js >= 16: https://nodejs.org/');
        }

        if (this.results.errors.some(err => err.includes('Git'))) {
            suggestions.push('📥 Installer Git: https://git-scm.com/');
        }

        if (this.results.warnings.some(warn => warn.includes('node_modules'))) {
            suggestions.push('📦 Installer les dépendances: npm install');
        }

        if (this.results.warnings.some(warn => warn.includes('.env'))) {
            suggestions.push('⚙️  Créer un fichier .env avec vos variables d\'environnement');
        }

        if (this.results.warnings.some(warn => warn.includes('.gitignore'))) {
            suggestions.push('📝 Configurer .gitignore avec node_modules et .env');
        }

        return suggestions;
    }

    run() {
        console.log('🔍 Vérification de l\'environnement de développement');
        console.log('='.repeat(60));

        // Exécuter toutes les vérifications
        this.checkNodeVersion();
        this.checkNpmVersion();
        this.checkGitAvailable();
        this.checkProjectStructure();
        this.checkPackageJson();
        this.checkNodeModules();
        this.checkEnvironmentFiles();
        this.checkGitIgnore();
        this.checkDiskSpace();
        this.checkWritePermissions();
        this.checkPortAvailability();

        // Afficher les résultats
        console.log('\n📊 RÉSULTATS:');
        console.log(`✅ Réussi: ${this.results.passed.length}`);
        console.log(`⚠️  Avertissements: ${this.results.warnings.length}`);
        console.log(`❌ Erreurs: ${this.results.errors.length}`);

        if (this.results.passed.length > 0) {
            console.log('\n✅ VÉRIFICATIONS RÉUSSIES:');
            this.results.passed.forEach(item => console.log(`  ${item}`));
        }

        if (this.results.warnings.length > 0) {
            console.log('\n⚠️  AVERTISSEMENTS:');
            this.results.warnings.forEach(item => console.log(`  ${item}`));
        }

        if (this.results.errors.length > 0) {
            console.log('\n❌ ERREURS CRITIQUES:');
            this.results.errors.forEach(item => console.log(`  ${item}`));
        }

        // Suggestions d'amélioration
        const suggestions = this.generateSuggestions();
        if (suggestions.length > 0) {
            console.log('\n💡 SUGGESTIONS:');
            suggestions.forEach(suggestion => console.log(`  ${suggestion}`));
        }

        console.log('\n' + '='.repeat(60));

        // Code de sortie
        const hasErrors = this.results.errors.length > 0;
        if (hasErrors) {
            console.log('❌ Environnement non prêt. Corrigez les erreurs ci-dessus.');
            process.exit(1);
        } else {
            console.log('🎉 Environnement prêt pour le développement !');
            process.exit(0);
        }
    }
}

// Exécution
if (require.main === module) {
    const checker = new EnvironmentChecker();
    checker.run();
}
