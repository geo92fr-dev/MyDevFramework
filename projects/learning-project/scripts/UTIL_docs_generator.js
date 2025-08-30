#!/usr/bin/env node

/**
 * @criticality HIGH
 * @depends fs, path, glob
 * @description Générateur automatique de README basé sur commentaires spéciaux
 * @phase ALL - Utilisable dans toutes les phases
 * @category tools
 */

const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

class DocumentationGenerator {
    constructor() {
        this.projectRoot = process.cwd();
        this.excludePatterns = [
            'node_modules/**',
            '.git/**',
            'dist/**',
            'build/**',
            '.svelte-kit/**'
        ];
    }

    /**
     * Extrait les commentaires spéciaux d'un fichier
     */
    extractDocComments(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const commentRegex = /\/\*\*\s*\n([\s\S]*?)\*\//g;
            const comments = [];
            let match;

            while ((match = commentRegex.exec(content)) !== null) {
                const commentBlock = match[1];
                const docComment = this.parseDocComment(commentBlock);
                
                if (docComment.criticality || docComment.depends || docComment.description) {
                    docComment.file = path.relative(this.projectRoot, filePath);
                    comments.push(docComment);
                }
            }

            return comments;
        } catch (error) {
            console.warn(`⚠️ Erreur lecture ${filePath}:`, error.message);
            return [];
        }
    }

    /**
     * Parse un bloc de commentaire pour extraire les annotations
     */
    parseDocComment(commentBlock) {
        const doc = {};
        const lines = commentBlock.split('\n');

        for (const line of lines) {
            const cleanLine = line.replace(/^\s*\*\s?/, '').trim();
            
            if (cleanLine.startsWith('@criticality')) {
                doc.criticality = cleanLine.replace('@criticality', '').trim();
            } else if (cleanLine.startsWith('@depends')) {
                doc.depends = cleanLine.replace('@depends', '').trim().split(',').map(d => d.trim());
            } else if (cleanLine.startsWith('@description')) {
                doc.description = cleanLine.replace('@description', '').trim();
            } else if (cleanLine.startsWith('@phase')) {
                doc.phase = cleanLine.replace('@phase', '').trim();
            } else if (cleanLine.startsWith('@category')) {
                doc.category = cleanLine.replace('@category', '').trim();
            }
        }

        return doc;
    }

    /**
     * Génère le README pour un dossier
     */
    generateFolderReadme(folderPath) {
        const files = globSync(`${folderPath}/**/*.{js,ts,svelte,jsx,tsx}`, {
            ignore: this.excludePatterns
        });

        const allComments = [];
        
        for (const file of files) {
            const comments = this.extractDocComments(file);
            allComments.push(...comments);
        }

        if (allComments.length === 0) {
            return null; // Pas de README à générer
        }

        return this.generateReadmeContent(folderPath, allComments);
    }

    /**
     * Génère le contenu Markdown du README
     */
    generateReadmeContent(folderPath, comments) {
        const folderName = path.basename(folderPath);
        const relativePath = path.relative(this.projectRoot, folderPath);
        
        let content = `# 📁 ${folderName}\n\n`;
        content += `> Documentation générée automatiquement - ${new Date().toISOString().split('T')[0]}\n\n`;
        
        // Résumé du dossier
        content += `## 🎯 Vue d'ensemble\n\n`;
        content += `**Chemin** : \`${relativePath}\`  \n`;
        content += `**Fichiers documentés** : ${comments.length}  \n`;
        
        // Criticité
        const criticalities = comments.filter(c => c.criticality);
        if (criticalities.length > 0) {
            const criticalityCount = criticalities.reduce((acc, c) => {
                acc[c.criticality] = (acc[c.criticality] || 0) + 1;
                return acc;
            }, {});
            
            content += `**Criticité** : `;
            Object.entries(criticalityCount).forEach(([level, count]) => {
                const emoji = level === 'HIGH' ? '🔴' : level === 'MEDIUM' ? '🟡' : '🟢';
                content += `${emoji} ${level}(${count}) `;
            });
            content += `\n`;
        }
        
        // Catégories
        const categories = [...new Set(comments.filter(c => c.category).map(c => c.category))];
        if (categories.length > 0) {
            content += `**Catégories** : ${categories.map(c => `\`${c}\``).join(', ')}  \n`;
        }
        
        content += `\n---\n\n`;

        // Table des fichiers
        content += `## 📋 Fichiers\n\n`;
        content += `| Fichier | Criticité | Description | Dépendances |\n`;
        content += `|---------|-----------|-------------|--------------|\n`;
        
        for (const comment of comments) {
            const criticityEmoji = comment.criticality === 'HIGH' ? '🔴' : 
                                 comment.criticality === 'MEDIUM' ? '🟡' : 
                                 comment.criticality === 'LOW' ? '🟢' : '⚪';
            
            const description = (comment.description || 'Non documenté').substring(0, 50);
            const deps = comment.depends ? comment.depends.slice(0, 2).join(', ') + 
                        (comment.depends.length > 2 ? `, +${comment.depends.length - 2}` : '') : 'Aucune';
            
            content += `| \`${comment.file}\` | ${criticityEmoji} ${comment.criticality || 'N/A'} | ${description} | ${deps} |\n`;
        }

        // Dépendances détaillées
        const withDeps = comments.filter(c => c.depends && c.depends.length > 0);
        if (withDeps.length > 0) {
            content += `\n## 🔗 Graphe de Dépendances\n\n`;
            
            for (const comment of withDeps) {
                content += `### \`${comment.file}\`\n`;
                content += `**Dépend de :**\n`;
                for (const dep of comment.depends) {
                    content += `- \`${dep}\`\n`;
                }
                content += `\n`;
            }
        }

        // Phases roadmap
        const phases = [...new Set(comments.filter(c => c.phase).map(c => c.phase))];
        if (phases.length > 0) {
            content += `## 🗺️ Phases Roadmap\n\n`;
            content += `Ce dossier concerne les phases : ${phases.map(p => `**${p}**`).join(', ')}\n\n`;
        }

        // Footer
        content += `---\n\n`;
        content += `> 🤖 **Documentation automatique**  \n`;
        content += `> Générée par \`npm run docs:generate\`  \n`;
        content += `> Pour mettre à jour : modifier les commentaires \`@\` dans le code source\n`;

        return content;
    }

    /**
     * Scan et génère tous les README nécessaires
     */
    async generateAllReadmes() {
        console.log('🚀 Génération automatique de la documentation...\n');
        
        const folders = globSync('src/**/', { 
            ignore: this.excludePatterns 
        });
        
        let generated = 0;
        let updated = 0;
        
        for (const folder of folders) {
            const readmePath = path.join(folder, 'README.md');
            const newContent = this.generateFolderReadme(folder);
            
            if (newContent) {
                const exists = fs.existsSync(readmePath);
                
                if (!exists || fs.readFileSync(readmePath, 'utf8') !== newContent) {
                    fs.writeFileSync(readmePath, newContent);
                    console.log(`${exists ? '📝' : '✨'} ${readmePath}`);
                    exists ? updated++ : generated++;
                } else {
                    console.log(`✅ ${readmePath} (déjà à jour)`);
                }
            }
        }
        
        console.log(`\n📊 Résumé :`);
        console.log(`  ✨ Nouveaux README : ${generated}`);
        console.log(`  📝 README mis à jour : ${updated}`);
        console.log(`  ✅ README à jour : ${folders.length - generated - updated}`);
        
        // Mise à jour hub central
        await this.updateCentralHub();
    }

    /**
     * Met à jour le hub central avec les nouveaux README
     */
    async updateCentralHub() {
        const readmeFiles = globSync('src/**/README.md');
        
        if (readmeFiles.length === 0) return;
        
        console.log(`\n🏠 Mise à jour hub central...`);
        
        const hubPath = path.join(this.projectRoot, 'DOC_README.md');
        let hubContent = fs.readFileSync(hubPath, 'utf8');
        
        // Section source code
        const sourceSection = `### 💻 **Code Source Documenté**
| Document | Statut | Description |
|----------|--------|-------------|
${readmeFiles.map(file => {
    const relativePath = path.relative(this.projectRoot, file);
    const folderName = path.basename(path.dirname(file));
    return `| **[${relativePath}](${relativePath})** | ✅ Auto-généré | Documentation dossier ${folderName} |`;
}).join('\n')}

`;

        // Remplacer ou ajouter la section
        if (hubContent.includes('💻 **Code Source Documenté**')) {
            hubContent = hubContent.replace(
                /### 💻 \*\*Code Source Documenté\*\*[\s\S]*?(?=###|---|\n\n## )/,
                sourceSection
            );
        } else {
            // Ajouter avant la section Scripts Principaux
            hubContent = hubContent.replace(
                /---\n\n## 🚀 Scripts Principaux/,
                `---\n\n${sourceSection}\n---\n\n## 🚀 Scripts Principaux`
            );
        }
        
        fs.writeFileSync(hubPath, hubContent);
        console.log(`✅ Hub central mis à jour avec ${readmeFiles.length} README`);
    }

    /**
     * Valide la cohérence de la documentation
     */
    async validateDocumentation() {
        console.log('🔍 Validation cohérence documentation...\n');
        
        const files = globSync('src/**/*.{js,ts,svelte,jsx,tsx}', {
            ignore: this.excludePatterns
        });
        
        const issues = [];
        
        for (const file of files) {
            const comments = this.extractDocComments(file);
            
            if (comments.length === 0) {
                issues.push(`⚠️ ${file}: Aucun commentaire de documentation`);
            } else {
                for (const comment of comments) {
                    if (!comment.criticality) {
                        issues.push(`⚠️ ${file}: @criticality manquant`);
                    }
                    if (!comment.description) {
                        issues.push(`⚠️ ${file}: @description manquant`);
                    }
                }
            }
        }
        
        if (issues.length === 0) {
            console.log('✅ Documentation cohérente et complète');
            return true;
        } else {
            console.log(`❌ ${issues.length} problèmes détectés :`);
            issues.forEach(issue => console.log(`  ${issue}`));
            return false;
        }
    }
}

// Exécution
async function main() {
    const generator = new DocumentationGenerator();
    const action = process.argv[2];
    
    switch (action) {
        case 'generate':
            await generator.generateAllReadmes();
            break;
        case 'validate':
            const isValid = await generator.validateDocumentation();
            process.exit(isValid ? 0 : 1);
            break;
        default:
            await generator.generateAllReadmes();
            await generator.validateDocumentation();
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = DocumentationGenerator;
