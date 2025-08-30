#!/usr/bin/env node

/**
 * PROJECT CONFIG MANAGER - MyDevFramework
 * Gestion de la configuration pour la création de projets
 */

const fs = require('fs');
const path = require('path');
const IniConfigManager = require('./ini-manager');

class ProjectConfigManager {
    constructor() {
        this.configPath = path.join(__dirname, '..', 'configs', 'project.config.json');
        this.iniManager = new IniConfigManager();
        this.config = this.loadConfig();
    }

    loadConfig() {
        try {
            if (fs.existsSync(this.configPath)) {
                const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
                // Fusionner avec les valeurs du fichier INI
                return this.mergeWithIniConfig(config);
            }
        } catch (error) {
            console.log('⚠️ Erreur chargement configuration:', error.message);
        }
        
        // Configuration par défaut fusionnée avec INI
        const defaultConfig = {
            projectDefaults: {
                author: 'Developer',
                email: 'developer@example.com',
                description: 'Application créée avec MyDevFramework',
                version: '1.0.0',
                license: 'MIT'
            },
            templates: {
                default: 'svelte-firebase-instant'
            },
            customization: {
                autoGitInit: true,
                autoNpmInstall: false,
                replaceTokens: true
            }
        };
        
        return this.mergeWithIniConfig(defaultConfig);
    }

    /**
     * Fusionne la configuration JSON avec les valeurs du fichier INI
     * @param {object} config - Configuration de base
     * @returns {object} Configuration fusionnée
     */
    mergeWithIniConfig(config) {
        try {
            const iniConfig = this.iniManager.loadConfig();
            
            // Informations personnelles depuis le INI
            if (iniConfig.Personal) {
                config.projectDefaults.author = iniConfig.Personal.author_name || config.projectDefaults.author;
                config.projectDefaults.email = iniConfig.Personal.author_email || config.projectDefaults.email;
            }
            
            // Configuration Git
            if (iniConfig.Git) {
                config.git = {
                    username: iniConfig.Git.git_username || config.git?.username,
                    email: iniConfig.Git.git_email || config.git?.email || config.projectDefaults.email,
                    autoInit: iniConfig.Git.auto_init_git ?? config.customization?.autoGitInit ?? true,
                    autoCommit: iniConfig.Git.auto_first_commit ?? true
                };
            }
            
            // Configuration projet
            if (iniConfig.Project) {
                config.templates.default = iniConfig.Project.default_template || config.templates.default;
                config.projectDefaults.description = iniConfig.Project.default_description || config.projectDefaults.description;
                config.projectDefaults.license = iniConfig.Project.license || config.projectDefaults.license;
            }
            
            // Configuration framework
            if (iniConfig.Framework) {
                config.validation = {
                    level: iniConfig.Framework.validation_level || 'standard',
                    autoOrchestrator: iniConfig.Framework.auto_orchestrator ?? true
                };
                
                config.customization.setupHooks = iniConfig.Framework.setup_hooks ?? true;
                config.customization.createRoadmap = iniConfig.Framework.create_roadmap ?? true;
            }
            
            return config;
        } catch (error) {
            console.log('⚠️ Erreur fusion configuration INI:', error.message);
            return config;
        }
    }

    saveConfig() {
        try {
            const configDir = path.dirname(this.configPath);
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
            }
            fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
            console.log('✅ Configuration sauvegardée');
            return true;
        } catch (error) {
            console.log('❌ Erreur sauvegarde:', error.message);
            return false;
        }
    }

    // Getters pour les valeurs de configuration
    getAuthor() {
        return this.config.projectDefaults?.author || 'Developer';
    }

    getEmail() {
        return this.config.projectDefaults?.email || 'developer@example.com';
    }

    getDefaultTemplate() {
        return this.config.templates?.default || 'svelte-firebase-instant';
    }

    getProjectDefaults() {
        return this.config.projectDefaults || {};
    }

    getCustomizationSettings() {
        return this.config.customization || {};
    }

    getHooks() {
        return this.config.hooks || { beforeCreate: [], afterCreate: [], afterInstall: [] };
    }

    getValidationRules() {
        return this.config.validation || {};
    }

    // Setters pour modifier la configuration
    setAuthor(author) {
        if (!this.config.projectDefaults) this.config.projectDefaults = {};
        this.config.projectDefaults.author = author;
    }

    setEmail(email) {
        if (!this.config.projectDefaults) this.config.projectDefaults = {};
        this.config.projectDefaults.email = email;
    }

    setDefaultTemplate(template) {
        if (!this.config.templates) this.config.templates = {};
        this.config.templates.default = template;
    }

    // Méthodes utilitaires
    replaceTokens(content, projectName) {
        const tokens = this.config.customization?.tokens || {};
        const currentYear = new Date().getFullYear();
        
        let result = content;
        
        // Remplacements standards
        result = result.replace(/{{PROJECT_NAME}}/g, projectName);
        result = result.replace(/{{AUTHOR}}/g, this.getAuthor());
        result = result.replace(/{{EMAIL}}/g, this.getEmail());
        result = result.replace(/{{DESCRIPTION}}/g, this.config.projectDefaults?.description || '');
        result = result.replace(/{{YEAR}}/g, currentYear);
        result = result.replace(/{{VERSION}}/g, this.config.projectDefaults?.version || '1.0.0');
        result = result.replace(/{{LICENSE}}/g, this.config.projectDefaults?.license || 'MIT');
        
        return result;
    }

    validateProjectName(projectName) {
        const rules = this.getValidationRules();
        
        if (rules.minLength && projectName.length < rules.minLength) {
            return { valid: false, error: `Nom trop court (min: ${rules.minLength})` };
        }
        
        if (rules.maxLength && projectName.length > rules.maxLength) {
            return { valid: false, error: `Nom trop long (max: ${rules.maxLength})` };
        }
        
        if (rules.allowedChars) {
            const regex = new RegExp(`^[${rules.allowedChars}]+$`);
            if (!regex.test(projectName)) {
                return { valid: false, error: `Caractères autorisés: ${rules.allowedChars}` };
            }
        }
        
        return { valid: true };
    }

    displayConfig() {
        console.log('📋 CONFIGURATION PROJET ACTUELLE');
        console.log('==================================');
        console.log(`👤 Auteur: ${this.getAuthor()}`);
        console.log(`📧 Email: ${this.getEmail()}`);
        console.log(`📦 Template par défaut: ${this.getDefaultTemplate()}`);
        console.log(`🔧 Auto Git Init: ${this.config.customization?.autoGitInit ? '✅' : '❌'}`);
        console.log(`📥 Auto NPM Install: ${this.config.customization?.autoNpmInstall ? '✅' : '❌'}`);
        console.log('');
    }
}

// CLI Interface
if (require.main === module) {
    const config = new ProjectConfigManager();
    const command = process.argv[2];
    const value = process.argv[3];
    const newValue = process.argv[4];

    switch (command) {
        case 'show':
            config.displayConfig();
            break;
        
        case 'set':
            if (value === 'author' && newValue) {
                config.setAuthor(newValue);
                config.saveConfig();
            } else if (value === 'email' && newValue) {
                config.setEmail(newValue);
                config.saveConfig();
            } else if (value === 'template' && newValue) {
                config.setDefaultTemplate(newValue);
                config.saveConfig();
            } else {
                console.log('❌ Usage: node config-manager.js set [author|email|template] <value>');
            }
            break;
        
        case 'validate':
            if (value) {
                const result = config.validateProjectName(value);
                if (result.valid) {
                    console.log(`✅ Nom de projet "${value}" valide`);
                } else {
                    console.log(`❌ ${result.error}`);
                }
            }
            break;
        
        default:
            console.log('🔧 PROJECT CONFIG MANAGER');
            console.log('========================');
            console.log('Commands:');
            console.log('  show                     - Afficher configuration');
            console.log('  set author <nom>         - Définir auteur');
            console.log('  set email <email>        - Définir email');
            console.log('  set template <template>  - Définir template par défaut');
            console.log('  validate <nom-projet>    - Valider nom de projet');
    }
}

module.exports = ProjectConfigManager;
