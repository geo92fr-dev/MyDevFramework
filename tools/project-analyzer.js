#!/usr/bin/env node

/**
 * 📊 Analyseur de projet
 * Usage: node tools/project-analyzer.js
 * 
 * Analyse la structure et les métriques du projet
 */

const fs = require('fs');
const path = require('path');

class ProjectAnalyzer {
    constructor() {
        this.projectRoot = process.cwd();
        this.stats = {
            files: 0,
            svelteFiles: 0,
            jsFiles: 0,
            totalLines: 0,
            size: 0
        };
    }

    analyze() {
        console.log('📊 Analyse du projet...\n');
        
        this.analyzeDirectory(this.projectRoot);
        this.generateReport();
    }

    analyzeDirectory(dir) {
        if (this.shouldSkip(dir)) return;
        
        try {
            const items = fs.readdirSync(dir);
            
            items.forEach(item => {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    this.analyzeDirectory(fullPath);
                } else {
                    this.analyzeFile(fullPath, stat);
                }
            });
        } catch (error) {
            // Ignorer les erreurs d'accès
        }
    }

    analyzeFile(filePath, stat) {
        this.stats.files++;
        this.stats.size += stat.size;
        
        const ext = path.extname(filePath);
        
        if (ext === '.svelte') {
            this.stats.svelteFiles++;
        } else if (ext === '.js' || ext === '.ts') {
            this.stats.jsFiles++;
        }
        
        // Compter les lignes pour les fichiers source
        if (['.svelte', '.js', '.ts', '.css'].includes(ext)) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                this.stats.totalLines += content.split('\n').length;
            } catch (error) {
                // Ignorer les erreurs de lecture
            }
        }
    }

    shouldSkip(dir) {
        const skipDirs = ['node_modules', '.git', '.svelte-kit', 'dist', 'build'];
        return skipDirs.some(skip => dir.includes(skip));
    }

    generateReport() {
        console.log('📈 RAPPORT D\'ANALYSE');
        console.log('='.repeat(40));
        console.log(`📁 Projet: ${path.basename(this.projectRoot)}`);
        console.log(`📄 Total fichiers: ${this.stats.files}`);
        console.log(`🎨 Fichiers Svelte: ${this.stats.svelteFiles}`);
        console.log(`⚙️ Fichiers JS/TS: ${this.stats.jsFiles}`);
        console.log(`📏 Total lignes: ${this.stats.totalLines.toLocaleString()}`);
        console.log(`💾 Taille totale: ${this.formatSize(this.stats.size)}`);
        
        // Recommandations basiques
        console.log('\n💡 RECOMMANDATIONS:');
        
        if (this.stats.svelteFiles === 0) {
            console.log('   ⚠️ Aucun fichier Svelte détecté');
        }
        
        if (this.stats.totalLines > 10000) {
            console.log('   📊 Projet de grande taille - considérer la modularisation');
        }
        
        if (this.stats.size > 50 * 1024 * 1024) {
            console.log('   🧹 Taille importante - envisager le nettoyage');
        }
        
        console.log('='.repeat(40));
    }

    formatSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    }
}

if (require.main === module) {
    const analyzer = new ProjectAnalyzer();
    analyzer.analyze();
}

module.exports = ProjectAnalyzer;
