/**
 * Gestionnaire de configuration INI pour MyDevFramework
 * Lit les fichiers project.ini et createproject.ini
 */

const fs = require('fs');
const path = require('path');

class IniConfigManager {
    constructor() {
        this.iniPath = path.join(__dirname, '..', 'createproject.ini');
        this.projectIniPath = path.join(__dirname, '..', 'project.ini');
        this.config = null;
    }

    /**
     * Parse un fichier INI simple
     * @param {string} content - Contenu du fichier INI
     * @returns {object} Configuration parsée
     */
    parseIni(content) {
        const config = {};
        let currentSection = null;

        const lines = content.split('\n');
        
        for (let line of lines) {
            line = line.trim();
            
            // Ignorer les commentaires et lignes vides
            if (!line || line.startsWith('#') || line.startsWith(';')) {
                continue;
            }
            
            // Sections [nom]
            if (line.startsWith('[') && line.endsWith(']')) {
                currentSection = line.slice(1, -1);
                config[currentSection] = {};
                continue;
            }
            
            // Paires clé=valeur
            if (line.includes('=') && currentSection) {
                const [key, ...valueParts] = line.split('=');
                const value = valueParts.join('=').trim();
                
                // Conversion des types
                let parsedValue = value;
                if (value.toLowerCase() === 'true') {
                    parsedValue = true;
                } else if (value.toLowerCase() === 'false') {
                    parsedValue = false;
                } else if (!isNaN(value) && !isNaN(parseFloat(value))) {
                    parsedValue = parseFloat(value);
                }
                
                config[currentSection][key.trim()] = parsedValue;
            }
        }
        
        return config;
    }

    /**
     * Charge la configuration depuis les fichiers INI
     * Priorité : project.ini > createproject.ini
     * @returns {object} Configuration chargée
     */
    loadConfig() {
        try {
            let config = {};
            
            // 1. Charger d'abord createproject.ini (base)
            if (fs.existsSync(this.iniPath)) {
                const baseContent = fs.readFileSync(this.iniPath, 'utf8');
                config = this.parseIni(baseContent);
            }
            
            // 2. Fusionner avec project.ini (prioritaire)
            if (fs.existsSync(this.projectIniPath)) {
                const projectContent = fs.readFileSync(this.projectIniPath, 'utf8');
                const projectConfig = this.parseIni(projectContent);
                config = this.mergeConfigs(config, projectConfig);
            }
            
            this.config = config;
            return config;
        } catch (error) {
            console.error('Erreur lors du chargement de la configuration:', error.message);
            return {};
        }
    }

    /**
     * Fusionne deux configurations
     * @param {object} baseConfig - Configuration de base
     * @param {object} overrideConfig - Configuration prioritaire
     * @returns {object} Configuration fusionnée
     */
    mergeConfigs(baseConfig, overrideConfig) {
        const merged = JSON.parse(JSON.stringify(baseConfig)); // Deep copy
        
        for (const [section, values] of Object.entries(overrideConfig)) {
            if (!merged[section]) {
                merged[section] = {};
            }
            merged[section] = { ...merged[section], ...values };
        }
        
        return merged;
    }

    /**
     * Affiche la configuration actuelle
     */
    displayConfig() {
        const config = this.loadConfig();
        
        console.log('\n📋 Configuration unifiée (project.ini + createproject.ini):');
        console.log('='.repeat(60));
        
        for (const [section, values] of Object.entries(config)) {
            console.log(`\n[${section}]`);
            for (const [key, value] of Object.entries(values)) {
                console.log(`  ${key} = ${value}`);
            }
        }
    }

    /**
     * Met à jour le fichier project.config.json
     */
    updateProjectConfig(projectConfigPath) {
        try {
            const iniConfig = this.loadConfig();
            
            if (!fs.existsSync(projectConfigPath)) {
                console.warn(`Fichier project.config.json non trouvé: ${projectConfigPath}`);
                return;
            }

            const projectConfig = JSON.parse(fs.readFileSync(projectConfigPath, 'utf8'));

            // Mise à jour avec les valeurs des INI
            if (iniConfig.Personal) {
                projectConfig.author = {
                    name: iniConfig.Personal.author_name || 'Auteur',
                    email: iniConfig.Personal.author_email || 'email@example.com'
                };
            }

            if (iniConfig.Project) {
                projectConfig.projectDefaults = {
                    ...projectConfig.projectDefaults,
                    author: iniConfig.Personal?.author_name || projectConfig.projectDefaults?.author,
                    email: iniConfig.Personal?.author_email || projectConfig.projectDefaults?.email,
                    description: iniConfig.Project.description || iniConfig.Project.default_description || projectConfig.projectDefaults?.description,
                    license: iniConfig.Project.license || projectConfig.projectDefaults?.license
                };
            }

            // Sauvegarde
            fs.writeFileSync(projectConfigPath, JSON.stringify(projectConfig, null, 2));
            console.log('✅ Configuration mise à jour avec les valeurs des fichiers INI');

        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error.message);
        }
    }
}

module.exports = IniConfigManager;
