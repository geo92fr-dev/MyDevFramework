#!/usr/bin/env node

/**
 * Script de vérification de la structure du projet
 * Usage: npm run check:structure
 */

const fs = require('fs');
const path = require('path');

class StructureChecker {
    constructor() {
        this.projectRoot = process.cwd();
        this.results = {
            passed: [],
            missing: [],
            recommendations: []
        };
    }

    checkFileOrDir(relativePath, type = 'file', required = true) {
        const fullPath = path.join(this.projectRoot, relativePath);
        const exists = fs.existsSync(fullPath);
        
        if (exists) {
            const stats = fs.statSync(fullPath);
            const isCorrectType = type === 'file' ? stats.isFile() : stats.isDirectory();
            
            if (isCorrectType) {
                this.results.passed.push(`✅ ${relativePath} (${type})`);
                return true;
            } else {
                this.results.missing.push(`❌ ${relativePath} existe mais n'est pas un ${type}`);
                return false;
            }
        } else {
            const level = required ? 'missing' : 'recommendations';
            const icon = required ? '❌' : '💡';
            this.results[level].push(`${icon} ${relativePath} (${type}${required ? ' requis' : ' recommandé'})`);
            return false;
        }
    }

    checkSvelteKitStructure() {
        console.log('🔍 Vérification de la structure SvelteKit...');
        
        // Structure de base SvelteKit
        const structure = {
            // Fichiers racine requis
            'package.json': { type: 'file', required: true },
            'svelte.config.js': { type: 'file', required: false },
            'vite.config.js': { type: 'file', required: false },
            'tsconfig.json': { type: 'file', required: false },
            
            // Dossiers principaux
            'src': { type: 'dir', required: true },
            'src/app.html': { type: 'file', required: false },
            'src/routes': { type: 'dir', required: true },
            'src/lib': { type: 'dir', required: false },
            'src/lib/components': { type: 'dir', required: false },
            'src/lib/types': { type: 'dir', required: false },
            'src/lib/stores': { type: 'dir', required: false },
            'src/lib/utils': { type: 'dir', required: false },
            
            // Tests
            'tests': { type: 'dir', required: false },
            'tests/unit': { type: 'dir', required: false },
            'tests/e2e': { type: 'dir', required: false },
            
            // Configuration
            '.gitignore': { type: 'file', required: false },
            'README.md': { type: 'file', required: false },
            
            // Build
            'static': { type: 'dir', required: false }
        };

        Object.entries(structure).forEach(([path, config]) => {
            this.checkFileOrDir(path, config.type, config.required);
        });
    }

    checkCBDCompliance() {
        console.log('🤖 Vérification de la conformité CBD...');
        
        const cbdStructure = {
            'DOC_CBD.md': { type: 'file', required: true },
            'scripts': { type: 'dir', required: false },
            'scripts/validate-cbd.js': { type: 'file', required: false },
            'scripts/check-environment.js': { type: 'file', required: false },
            '.husky': { type: 'dir', required: false }
        };

        Object.entries(cbdStructure).forEach(([path, config]) => {
            this.checkFileOrDir(path, config.type, config.required);
        });
    }

    checkPackageJsonContent() {
        console.log('📦 Vérification du contenu package.json...');
        
        if (!fs.existsSync('package.json')) {
            this.results.missing.push('❌ package.json manquant');
            return;
        }

        try {
            const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            
            // Scripts recommandés
            const recommendedScripts = {
                'dev': 'Démarrage serveur de développement',
                'build': 'Build de production',
                'test': 'Tests unitaires',
                'lint': 'Linting du code',
                'validate:cbd': 'Validation CBD',
                'check:env': 'Vérification environnement'
            };

            Object.entries(recommendedScripts).forEach(([script, description]) => {
                if (pkg.scripts && pkg.scripts[script]) {
                    this.results.passed.push(`✅ Script "${script}" configuré`);
                } else {
                    this.results.recommendations.push(`💡 Script "${script}" recommandé (${description})`);
                }
            });

            // Dépendances SvelteKit
            const svelteKitDeps = [
                '@sveltejs/kit',
                'svelte',
                'vite'
            ];

            svelteKitDeps.forEach(dep => {
                if ((pkg.dependencies && pkg.dependencies[dep]) || 
                    (pkg.devDependencies && pkg.devDependencies[dep])) {
                    this.results.passed.push(`✅ Dépendance "${dep}" installée`);
                } else {
                    this.results.missing.push(`❌ Dépendance "${dep}" manquante`);
                }
            });

        } catch (error) {
            this.results.missing.push(`❌ package.json invalide: ${error.message}`);
        }
    }

    checkNamingConventions() {
        console.log('📝 Vérification des conventions de nommage...');
        
        if (!fs.existsSync('src/routes')) {
            return;
        }

        const checkDir = (dirPath, level = 0) => {
            if (level > 3) return; // Éviter récursion infinie
            
            try {
                const items = fs.readdirSync(dirPath);
                
                items.forEach(item => {
                    const itemPath = path.join(dirPath, item);
                    const stats = fs.statSync(itemPath);
                    
                    if (stats.isDirectory()) {
                        checkDir(itemPath, level + 1);
                    } else if (stats.isFile()) {
                        // Vérifier conventions SvelteKit
                        if (item.startsWith('+')) {
                            if (['+page.svelte', '+layout.svelte', '+page.ts', '+layout.ts', '+page.server.ts'].includes(item)) {
                                this.results.passed.push(`✅ Convention SvelteKit: ${path.relative(this.projectRoot, itemPath)}`);
                            } else {
                                this.results.recommendations.push(`💡 Fichier SvelteKit non standard: ${path.relative(this.projectRoot, itemPath)}`);
                            }
                        }
                        
                        // Vérifier extension des composants
                        if (item.endsWith('.svelte') && !item.startsWith('+')) {
                            if (item[0] === item[0].toUpperCase()) {
                                this.results.passed.push(`✅ Composant avec majuscule: ${item}`);
                            } else {
                                this.results.recommendations.push(`💡 Composant devrait commencer par majuscule: ${item}`);
                            }
                        }
                    }
                });
            } catch (error) {
                // Ignorer les erreurs de lecture de dossier
            }
        };

        checkDir(path.join(this.projectRoot, 'src'));
    }

    generateStructureReport() {
        console.log('\n📊 RAPPORT DE STRUCTURE');
        console.log('='.repeat(60));
        
        console.log(`✅ Éléments conformes: ${this.results.passed.length}`);
        console.log(`❌ Éléments manquants: ${this.results.missing.length}`);
        console.log(`💡 Recommandations: ${this.results.recommendations.length}`);

        if (this.results.passed.length > 0) {
            console.log('\n✅ STRUCTURE CORRECTE:');
            this.results.passed.slice(0, 10).forEach(item => console.log(`  ${item}`));
            if (this.results.passed.length > 10) {
                console.log(`  ... et ${this.results.passed.length - 10} autres éléments`);
            }
        }

        if (this.results.missing.length > 0) {
            console.log('\n❌ ÉLÉMENTS MANQUANTS:');
            this.results.missing.forEach(item => console.log(`  ${item}`));
        }

        if (this.results.recommendations.length > 0) {
            console.log('\n💡 RECOMMANDATIONS:');
            this.results.recommendations.slice(0, 10).forEach(item => console.log(`  ${item}`));
            if (this.results.recommendations.length > 10) {
                console.log(`  ... et ${this.results.recommendations.length - 10} autres recommandations`);
            }
        }

        return this.results.missing.length === 0;
    }

    generateInitCommands() {
        if (this.results.missing.length === 0) return;

        console.log('\n🚀 COMMANDES POUR INITIALISER LA STRUCTURE:');
        
        // Créer les dossiers manquants
        const missingDirs = this.results.missing
            .filter(item => item.includes('(dir'))
            .map(item => item.split(' ')[1]);

        if (missingDirs.length > 0) {
            console.log('\n📁 Créer les dossiers:');
            missingDirs.forEach(dir => {
                console.log(`  mkdir -p ${dir}`);
            });
        }

        // Créer les fichiers de base
        const missingFiles = this.results.missing
            .filter(item => item.includes('(file'))
            .map(item => item.split(' ')[1]);

        if (missingFiles.length > 0) {
            console.log('\n📄 Créer les fichiers:');
            missingFiles.forEach(file => {
                if (file.endsWith('.md')) {
                    console.log(`  echo "# ${path.basename(file, '.md')}" > ${file}`);
                } else if (file.endsWith('.json')) {
                    console.log(`  echo "{}" > ${file}`);
                } else {
                    console.log(`  touch ${file}`);
                }
            });
        }
    }

    run() {
        console.log('🏗️  Vérification de la structure du projet');
        console.log(`📍 Dossier: ${this.projectRoot}`);
        console.log('='.repeat(60));

        this.checkSvelteKitStructure();
        this.checkCBDCompliance();
        this.checkPackageJsonContent();
        this.checkNamingConventions();

        const isValid = this.generateStructureReport();
        
        if (!isValid) {
            this.generateInitCommands();
        }

        console.log('\n' + '='.repeat(60));
        
        if (isValid) {
            console.log('🎉 Structure du projet conforme !');
            process.exit(0);
        } else {
            console.log('⚠️  Structure incomplète. Voir les recommandations ci-dessus.');
            process.exit(1);
        }
    }
}

// Exécution
if (require.main === module) {
    const checker = new StructureChecker();
    checker.run();
}

module.exports = StructureChecker;
