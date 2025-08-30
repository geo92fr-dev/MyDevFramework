#!/usr/bin/env node

/**
 * @criticality MEDIUM
 * @depends src/, tests/, docs/
 * @description Générateur automatique de documentation README pour dossiers
 * @phase ALL - Maintenance continue
 * @category documentation
 */

const fs = require('fs');
const path = require('path');

class DocumentationGenerator {
    constructor() {
        this.projectRoot = process.cwd();
        this.templates = {
            src: this.generateSrcReadmeTemplate(),
            tests: this.generateTestsReadmeTemplate(),
            scripts: this.generateScriptsReadmeTemplate()
        };
    }

    /**
     * Génération automatique de tous les README
     */
    async generateAll() {
        console.log('📝 Génération automatique de la documentation...');
        
        await this.generateReadmeForDirectory('src');
        await this.generateReadmeForDirectory('tests');
        await this.generateReadmeForDirectory('scripts');
        
        console.log('✅ Documentation générée avec succès');
    }

    /**
     * Génération README pour un dossier spécifique
     */
    async generateReadmeForDirectory(dirName) {
        const dirPath = path.join(this.projectRoot, dirName);
        
        if (!fs.existsSync(dirPath)) {
            console.log(`⚠️ Dossier ${dirName} non trouvé, ignoré`);
            return;
        }

        const files = this.analyzeDirectory(dirPath);
        const template = this.templates[dirName];
        
        if (template) {
            const content = template(files);
            const readmePath = path.join(dirPath, 'README.md');
            
            fs.writeFileSync(readmePath, content, 'utf8');
            console.log(`📋 README généré: ${readmePath}`);
        }
    }

    /**
     * Analyse des fichiers d'un dossier
     */
    analyzeDirectory(dirPath) {
        const files = [];
        
        const scanDirectory = (currentPath, relativePath = '') => {
            const items = fs.readdirSync(currentPath);
            
            for (const item of items) {
                const itemPath = path.join(currentPath, item);
                const relativeItemPath = path.join(relativePath, item);
                const stats = fs.statSync(itemPath);
                
                if (stats.isFile() && !item.startsWith('.') && item !== 'README.md') {
                    const fileInfo = this.analyzeFile(itemPath, relativeItemPath);
                    files.push(fileInfo);
                } else if (stats.isDirectory() && !item.startsWith('.')) {
                    scanDirectory(itemPath, relativeItemPath);
                }
            }
        };
        
        scanDirectory(dirPath);
        return files;
    }

    /**
     * Analyse d'un fichier spécifique
     */
    analyzeFile(filePath, relativePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const ext = path.extname(filePath);
        
        // Extraction des commentaires spéciaux
        const specialComments = this.extractSpecialComments(content);
        
        // Classification de criticité
        const criticality = this.determineCriticality(relativePath, content, specialComments);
        
        // Analyse des dépendances
        const dependencies = this.extractDependencies(content, ext);
        
        return {
            name: path.basename(filePath),
            path: relativePath,
            extension: ext,
            size: fs.statSync(filePath).size,
            criticality: criticality,
            description: specialComments.description || this.generateDescription(relativePath),
            dependencies: dependencies,
            phase: specialComments.phase || 'Unknown',
            category: specialComments.category || this.categorizeFile(relativePath)
        };
    }

    /**
     * Extraction des commentaires spéciaux
     */
    extractSpecialComments(content) {
        const comments = {};
        
        const patterns = {
            criticality: /@criticality\s+(HIGH|MEDIUM|LOW)/,
            description: /@description\s+(.+)/,
            phase: /@phase\s+(\d+(?:\.\d+)?)/,
            category: /@category\s+(\w+)/,
            depends: /@depends\s+(.+)/
        };
        
        for (const [key, pattern] of Object.entries(patterns)) {
            const match = content.match(pattern);
            if (match) {
                comments[key] = match[1];
            }
        }
        
        return comments;
    }

    /**
     * Détermination automatique de la criticité
     */
    determineCriticality(filePath, content, specialComments) {
        // Si explicitement défini
        if (specialComments.criticality) {
            return specialComments.criticality;
        }
        
        // Fichiers critiques par pattern
        const criticalPatterns = [
            /app\.html$/,
            /hooks\.server/,
            /firebase/,
            /auth/,
            /\.config\./
        ];
        
        const importantPatterns = [
            /\+layout/,
            /\+page/,
            /stores\//,
            /components\//
        ];
        
        const temporaryPatterns = [
            /temp/,
            /debug/,
            /test/,
            /\.test\./,
            /\.spec\./
        ];
        
        for (const pattern of criticalPatterns) {
            if (pattern.test(filePath)) return 'HIGH';
        }
        
        for (const pattern of importantPatterns) {
            if (pattern.test(filePath)) return 'MEDIUM';
        }
        
        for (const pattern of temporaryPatterns) {
            if (pattern.test(filePath)) return 'LOW';
        }
        
        return 'MEDIUM'; // Par défaut
    }

    /**
     * Extraction des dépendances
     */
    extractDependencies(content, extension) {
        const dependencies = [];
        
        if (['.js', '.ts', '.svelte'].includes(extension)) {
            // Import statements
            const importMatches = content.matchAll(/import\s+.+\s+from\s+['"]([^'"]+)['"]/g);
            for (const match of importMatches) {
                if (match[1].startsWith('.') || match[1].startsWith('$')) {
                    dependencies.push(match[1]);
                }
            }
            
            // Dynamic imports
            const dynamicMatches = content.matchAll(/import\(['"]([^'"]+)['"]\)/g);
            for (const match of dynamicMatches) {
                if (match[1].startsWith('.') || match[1].startsWith('$')) {
                    dependencies.push(match[1]);
                }
            }
        }
        
        return [...new Set(dependencies)]; // Déduplification
    }

    /**
     * Génération description automatique
     */
    generateDescription(filePath) {
        const name = path.basename(filePath, path.extname(filePath));
        const dir = path.dirname(filePath);
        
        if (filePath.includes('test')) {
            return `Tests pour ${name}`;
        } else if (filePath.includes('component')) {
            return `Composant ${name}`;
        } else if (filePath.includes('store')) {
            return `Store Svelte ${name}`;
        } else if (filePath.includes('route')) {
            return `Route ${name}`;
        } else {
            return `Module ${name}`;
        }
    }

    /**
     * Catégorisation automatique
     */
    categorizeFile(filePath) {
        if (filePath.includes('auth')) return 'auth';
        if (filePath.includes('test')) return 'test';
        if (filePath.includes('component')) return 'ui';
        if (filePath.includes('store')) return 'state';
        if (filePath.includes('route')) return 'routing';
        if (filePath.includes('config')) return 'config';
        if (filePath.includes('util')) return 'utility';
        return 'general';
    }

    /**
     * Template pour src/README.md
     */
    generateSrcReadmeTemplate() {
        return (files) => {
            const criticalFiles = files.filter(f => f.criticality === 'HIGH');
            const importantFiles = files.filter(f => f.criticality === 'MEDIUM');
            const standardFiles = files.filter(f => f.criticality === 'LOW');
            
            return `# 📁 Source Code Architecture - FunLearning V1.0

*🤖 Généré automatiquement le ${new Date().toISOString().slice(0, 10)}*

## 🎯 Vue d'Ensemble
Structure du code source organisée par domaines fonctionnels

## 📋 Inventaire par Criticité

### 🚨 FICHIERS CRITIQUES - Modifications avec EXTRÊME PRÉCAUTION
| Fichier | Rôle | Phase | Dépendances |
|---------|------|-------|-------------|
${criticalFiles.map(f => `| \`${f.path}\` | ${f.description} | P${f.phase} | ${f.dependencies.length} deps |`).join('\n')}

### ⚠️ FICHIERS IMPORTANTS - Modifications avec PRÉCAUTION  
| Fichier | Rôle | Phase | Catégorie |
|---------|------|-------|-----------|
${importantFiles.map(f => `| \`${f.path}\` | ${f.description} | P${f.phase} | ${f.category} |`).join('\n')}

### ✅ FICHIERS STANDARD - Modifications Normales
| Fichier | Rôle | Catégorie |
|---------|------|-----------|
${standardFiles.map(f => `| \`${f.path}\` | ${f.description} | ${f.category} |`).join('\n')}

## 🔗 Matrice des Dépendances

### Fichiers avec le Plus de Dépendances
${files
    .sort((a, b) => b.dependencies.length - a.dependencies.length)
    .slice(0, 5)
    .map(f => `- **${f.name}** (${f.dependencies.length} deps): ${f.dependencies.slice(0, 3).join(', ')}${f.dependencies.length > 3 ? '...' : ''}`)
    .join('\n')}

## 📏 Guidelines de Modification

### 🚨 Avant de Modifier un Fichier CRITIQUE :
1. **Lire la documentation** complète du composant
2. **Créer des tests** qui reproduisent le comportement actuel  
3. **Planifier les tests** de non-régression
4. **Prévoir rollback** en cas de problème
5. **Tester dans environnement** isolé d'abord

### ⚠️ Pour les Fichiers IMPORTANTS :
1. **Tests unitaires** avant modification
2. **Validation manuelle** des flows impactés
3. **Review** par second développeur si possible

### ✅ Pour les Fichiers STANDARD :
1. **Tests appropriés** selon la complexité
2. **Validation automatique** suffisante

## 📊 Statistiques du Code
- **Total fichiers**: ${files.length}
- **Fichiers critiques**: ${criticalFiles.length}
- **Fichiers importants**: ${importantFiles.length}
- **Fichiers standard**: ${standardFiles.length}

---
*Mise à jour automatique via \`npm run docs:generate\`*
`;
        };
    }

    /**
     * Template pour tests/README.md
     */
    generateTestsReadmeTemplate() {
        return (files) => {
            const criticalTests = files.filter(f => f.name.includes('critical'));
            const integrationTests = files.filter(f => f.name.includes('integration'));
            const unitTests = files.filter(f => f.name.includes('unit') || (!f.name.includes('critical') && !f.name.includes('integration')));
            
            return `# 🧪 Test Suite Architecture - FunLearning V1.0

*🤖 Généré automatiquement le ${new Date().toISOString().slice(0, 10)}*

## 🎯 Stratégie de Tests par Type

## 📋 Inventaire par Criticité de Couverture

### 🚨 TESTS CRITIQUES - Exécution OBLIGATOIRE
| Test | Cible | Échec = Blocage |
|------|-------|-----------------|
${criticalTests.map(f => `| \`${f.name}\` | ${f.description} | 🔴 OUI |`).join('\n')}

### ⚠️ TESTS INTÉGRATION - Exécution RECOMMANDÉE
| Test | Cible | Échec = Warning |
|------|-------|-----------------|
${integrationTests.map(f => `| \`${f.name}\` | ${f.description} | 🟡 WARNING |`).join('\n')}

### ✅ TESTS UNITAIRES - Exécution NORMALE
| Test | Cible |
|------|-------|
${unitTests.map(f => `| \`${f.name}\` | ${f.description} |`).join('\n')}

## 📊 Statistiques des Tests
- **Total tests**: ${files.length}
- **Tests critiques**: ${criticalTests.length}
- **Tests intégration**: ${integrationTests.length}
- **Tests unitaires**: ${unitTests.length}

## 🎯 Commandes Critiques

\`\`\`bash
# Tests critiques only (blocage si échec)
npm run test:critical

# Tests complets avec rapport
npm run test:full-report

# Tests par phase
npm run test:phase:X

# Tests de sécurité
npm run test:security
\`\`\`

---
*Mise à jour automatique via \`npm run docs:generate\`*
`;
        };
    }

    /**
     * Template pour scripts/README.md
     */
    generateScriptsReadmeTemplate() {
        return (files) => {
            const validationScripts = files.filter(f => f.name.startsWith('VALID_'));
            const utilityScripts = files.filter(f => f.name.startsWith('UTIL_'));
            const debugScripts = files.filter(f => f.name.startsWith('DEBUG_'));
            const templateScripts = files.filter(f => f.name.startsWith('TEMPLATE_'));
            
            return `# 🛠️ Scripts Architecture - FunLearning V1.0

*🤖 Généré automatiquement le ${new Date().toISOString().slice(0, 10)}*

## 🎯 Orchestration et Automatisation

## 📋 Inventaire par Catégorie

### ✅ SCRIPTS DE VALIDATION
| Script | Description | Usage |
|--------|-------------|-------|
${validationScripts.map(f => `| \`${f.name}\` | ${f.description} | Validation automatique |`).join('\n')}

### 🔧 SCRIPTS UTILITAIRES
| Script | Description | Usage |
|--------|-------------|-------|
${utilityScripts.map(f => `| \`${f.name}\` | ${f.description} | Automatisation |`).join('\n')}

### 🐛 SCRIPTS DE DEBUG
| Script | Description | Usage |
|--------|-------------|-------|
${debugScripts.map(f => `| \`${f.name}\` | ${f.description} | Diagnostic |`).join('\n')}

### 📄 TEMPLATES
| Template | Description | Usage |
|----------|-------------|-------|
${templateScripts.map(f => `| \`${f.name}\` | ${f.description} | Modèle création |`).join('\n')}

## 📊 Statistiques des Scripts
- **Total scripts**: ${files.length}
- **Scripts validation**: ${validationScripts.length}
- **Scripts utilitaires**: ${utilityScripts.length}
- **Scripts debug**: ${debugScripts.length}
- **Templates**: ${templateScripts.length}

---
*Mise à jour automatique via \`npm run docs:generate\`*
`;
        };
    }
}

// Exécution
if (require.main === module) {
    const generator = new DocumentationGenerator();
    generator.generateAll()
        .then(() => {
            console.log('📝 Génération documentation terminée');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Erreur génération documentation:', error);
            process.exit(1);
        });
}

module.exports = DocumentationGenerator;
