#!/usr/bin/env node

/**
 * 🧹 Utilitaire de nettoyage pour projets
 * Usage: node tools/project-clean.js
 * 
 * Nettoie les fichiers temporaires et cache du projet
 */

const fs = require('fs');
const path = require('path');

class ProjectCleaner {
    constructor() {
        this.projectRoot = process.cwd();
        this.cleanPaths = [
            '.svelte-kit',
            'dist',
            'build',
            'node_modules/.cache',
            '.DS_Store',
            'Thumbs.db'
        ];
    }

    clean() {
        console.log('🧹 Nettoyage du projet...\n');
        
        let cleaned = 0;
        
        this.cleanPaths.forEach(cleanPath => {
            const fullPath = path.join(this.projectRoot, cleanPath);
            
            if (fs.existsSync(fullPath)) {
                try {
                    if (fs.statSync(fullPath).isDirectory()) {
                        fs.rmSync(fullPath, { recursive: true, force: true });
                        console.log(`✅ Dossier supprimé: ${cleanPath}`);
                    } else {
                        fs.unlinkSync(fullPath);
                        console.log(`✅ Fichier supprimé: ${cleanPath}`);
                    }
                    cleaned++;
                } catch (error) {
                    console.log(`⚠️ Impossible de supprimer: ${cleanPath}`);
                }
            }
        });
        
        console.log(`\n🎯 Nettoyage terminé: ${cleaned} élément(s) supprimé(s)`);
        
        if (cleaned > 0) {
            console.log('\n💡 Pour reconstruire:');
            console.log('   npm install');
            console.log('   npm run dev');
        }
    }
}

if (require.main === module) {
    const cleaner = new ProjectCleaner();
    cleaner.clean();
}

module.exports = ProjectCleaner;
