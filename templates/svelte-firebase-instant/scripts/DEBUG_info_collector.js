#!/usr/bin/env node

/**
 * Script de collecte d'informations pour le débogage
 * Usage: npm run debug:info
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DebugInfoCollector {
    constructor() {
        this.info = {
            system: {},
            project: {},
            git: {},
            npm: {},
            files: {}
        };
    }

    collectSystemInfo() {
        console.log('🖥️  Collecte des informations système...');
        
        try {
            this.info.system = {
                platform: process.platform,
                arch: process.arch,
                nodeVersion: process.version,
                npmVersion: execSync('npm --version', { encoding: 'utf8' }).trim(),
                workingDirectory: process.cwd(),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            this.info.system.error = error.message;
        }
    }

    collectProjectInfo() {
        console.log('📦 Collecte des informations projet...');
        
        try {
            // Package.json
            if (fs.existsSync('package.json')) {
                const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
                this.info.project = {
                    name: pkg.name,
                    version: pkg.version,
                    scripts: Object.keys(pkg.scripts || {}),
                    dependencies: Object.keys(pkg.dependencies || {}),
                    devDependencies: Object.keys(pkg.devDependencies || {})
                };
            }

            // Structure des dossiers
            this.info.project.structure = this.scanDirectory('src', 2);
            
        } catch (error) {
            this.info.project.error = error.message;
        }
    }

    collectGitInfo() {
        console.log('🔧 Collecte des informations Git...');
        
        try {
            this.info.git = {
                hasGitRepo: fs.existsSync('.git'),
                currentBranch: execSync('git branch --show-current', { encoding: 'utf8' }).trim(),
                status: execSync('git status --porcelain', { encoding: 'utf8' }).trim(),
                lastCommit: execSync('git log -1 --oneline', { encoding: 'utf8' }).trim(),
                remotes: execSync('git remote -v', { encoding: 'utf8' }).trim()
            };
        } catch (error) {
            this.info.git.error = error.message;
        }
    }

    collectNpmInfo() {
        console.log('📋 Collecte des informations NPM...');
        
        try {
            // Vérifier si node_modules existe
            this.info.npm.hasNodeModules = fs.existsSync('node_modules');
            
            // Lister les packages installés (niveau racine seulement)
            const installed = execSync('npm ls --depth=0 --json', { encoding: 'utf8' });
            const npmList = JSON.parse(installed);
            
            this.info.npm.installedPackages = Object.keys(npmList.dependencies || {}).length;
            this.info.npm.problems = npmList.problems || [];
            
        } catch (error) {
            this.info.npm.error = error.message;
        }
    }

    collectFileInfo() {
        console.log('📁 Collecte des informations fichiers...');
        
        const importantFiles = [
            'DOC_CBD.md',
            'ROADMAP_FUNREVIS_V3.md',
            'svelte.config.js',
            'vite.config.js',
            'tsconfig.json',
            '.gitignore',
            'README.md'
        ];

        this.info.files = {};
        
        importantFiles.forEach(file => {
            try {
                if (fs.existsSync(file)) {
                    const stats = fs.statSync(file);
                    this.info.files[file] = {
                        exists: true,
                        size: stats.size,
                        modified: stats.mtime.toISOString()
                    };
                } else {
                    this.info.files[file] = { exists: false };
                }
            } catch (error) {
                this.info.files[file] = { error: error.message };
            }
        });
    }

    scanDirectory(dirPath, maxDepth = 1, currentDepth = 0) {
        if (currentDepth >= maxDepth || !fs.existsSync(dirPath)) {
            return null;
        }

        try {
            const items = fs.readdirSync(dirPath);
            const structure = {};
            
            items.forEach(item => {
                const itemPath = path.join(dirPath, item);
                const stats = fs.statSync(itemPath);
                
                if (stats.isDirectory()) {
                    structure[item + '/'] = this.scanDirectory(itemPath, maxDepth, currentDepth + 1);
                } else {
                    structure[item] = stats.size;
                }
            });
            
            return structure;
        } catch (error) {
            return { error: error.message };
        }
    }

    generateReport() {
        console.log('\n' + '='.repeat(80));
        console.log('🐞 RAPPORT DE DÉBOGAGE - FunLearning V1.0');
        console.log('='.repeat(80));
        
        // Informations système
        console.log('\n🖥️  SYSTÈME:');
        console.log(`   Plateforme: ${this.info.system.platform} (${this.info.system.arch})`);
        console.log(`   Node.js: ${this.info.system.nodeVersion}`);
        console.log(`   NPM: ${this.info.system.npmVersion}`);
        console.log(`   Dossier: ${this.info.system.workingDirectory}`);
        
        // Informations projet
        console.log('\n📦 PROJET:');
        if (this.info.project.name) {
            console.log(`   Nom: ${this.info.project.name} v${this.info.project.version}`);
            console.log(`   Scripts: ${this.info.project.scripts.length} configurés`);
            console.log(`   Dépendances: ${this.info.project.dependencies.length} prod + ${this.info.project.devDependencies.length} dev`);
        } else {
            console.log('   ❌ Pas de package.json valide');
        }
        
        // Informations Git
        console.log('\n🔧 GIT:');
        if (this.info.git.hasGitRepo) {
            console.log(`   Branche: ${this.info.git.currentBranch}`);
            console.log(`   Dernier commit: ${this.info.git.lastCommit}`);
            if (this.info.git.status) {
                console.log(`   Modifications: ${this.info.git.status.split('\n').length} fichiers`);
            } else {
                console.log('   Modifications: Aucune (working directory clean)');
            }
        } else {
            console.log('   ❌ Pas de dépôt Git');
        }
        
        // Informations NPM
        console.log('\n📋 NPM:');
        console.log(`   node_modules: ${this.info.npm.hasNodeModules ? '✅ Présent' : '❌ Manquant'}`);
        if (this.info.npm.installedPackages !== undefined) {
            console.log(`   Packages installés: ${this.info.npm.installedPackages}`);
        }
        if (this.info.npm.problems && this.info.npm.problems.length > 0) {
            console.log(`   ⚠️  Problèmes: ${this.info.npm.problems.length}`);
        }
        
        // Fichiers importants
        console.log('\n📁 FICHIERS IMPORTANTS:');
        Object.entries(this.info.files).forEach(([file, info]) => {
            if (info.exists) {
                console.log(`   ✅ ${file} (${info.size} bytes)`);
            } else {
                console.log(`   ❌ ${file} manquant`);
            }
        });
        
        // Structure du projet
        if (this.info.project.structure) {
            console.log('\n🗂️  STRUCTURE SRC/:');
            this.printStructure(this.info.project.structure, '   ');
        }
        
        console.log('\n' + '='.repeat(80));
    }

    printStructure(structure, indent = '') {
        if (!structure || typeof structure !== 'object') return;
        
        Object.entries(structure).forEach(([name, content]) => {
            if (name.endsWith('/')) {
                console.log(`${indent}📁 ${name}`);
                if (content && typeof content === 'object') {
                    this.printStructure(content, indent + '  ');
                }
            } else {
                const size = typeof content === 'number' ? ` (${content} bytes)` : '';
                console.log(`${indent}📄 ${name}${size}`);
            }
        });
    }

    generateJsonReport() {
        const reportPath = path.join(process.cwd(), 'debug-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.info, null, 2));
        console.log(`\n📄 Rapport JSON sauvegardé: ${reportPath}`);
        return reportPath;
    }

    suggestActions() {
        console.log('\n💡 SUGGESTIONS:');
        
        const suggestions = [];
        
        // Vérifications de base
        if (!this.info.npm.hasNodeModules) {
            suggestions.push('📦 Installer les dépendances: npm install');
        }
        
        if (!this.info.git.hasGitRepo) {
            suggestions.push('🔧 Initialiser Git: git init');
        }
        
        if (!this.info.files['DOC_CBD.md']?.exists) {
            suggestions.push('📚 Créer le document CBD depuis le template');
        }
        
        if (!this.info.project.scripts?.includes('validate:cbd')) {
            suggestions.push('⚙️  Ajouter les scripts CBD dans package.json');
        }
        
        if (this.info.npm.problems && this.info.npm.problems.length > 0) {
            suggestions.push('🔍 Résoudre les problèmes NPM: npm audit fix');
        }
        
        if (suggestions.length === 0) {
            suggestions.push('✅ Environnement semble configuré correctement');
        }
        
        suggestions.forEach(suggestion => console.log(`   ${suggestion}`));
    }

    run() {
        console.log('🐞 Collecte d\'informations de débogage pour FunLearning V1.0');
        console.log(`📅 ${new Date().toLocaleString()}\n`);

        this.collectSystemInfo();
        this.collectProjectInfo();
        this.collectGitInfo();
        this.collectNpmInfo();
        this.collectFileInfo();

        this.generateReport();
        this.suggestActions();
        
        // Sauvegarder le rapport JSON pour analyse approfondie
        const reportPath = this.generateJsonReport();
        
        console.log('\n🎯 Informations collectées avec succès !');
        console.log('📋 Utilisez ces informations pour diagnostiquer les problèmes.');
        
        return this.info;
    }
}

// Exécution
if (require.main === module) {
    const collector = new DebugInfoCollector();
    collector.run();
}

module.exports = DebugInfoCollector;
