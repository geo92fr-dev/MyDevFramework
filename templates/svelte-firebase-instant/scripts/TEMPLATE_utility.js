#!/usr/bin/env node

/**
 * UTIL_[FUNCTION] - Utilitaire pour [DESCRIPTION]
 * Usage: node scripts/UTIL_[function].js [arguments]
 * 
 * Convention: UTIL_[fonction_utilitaire].js
 * Exemples: UTIL_file_cleaner.js, UTIL_data_converter.js, UTIL_env_setup.js
 */

const fs = require('fs');
const path = require('path');

class UtilityScript {
    constructor() {
        this.config = {
            name: '[FUNCTION]',
            description: '[DESCRIPTION]',
            version: '1.0.0',
            author: 'FunLearning V1.0 Team'
        };
        
        this.args = process.argv.slice(2);
        this.options = this.parseArguments();
    }

    parseArguments() {
        const options = {
            help: false,
            verbose: false,
            dryRun: false
        };

        for (let i = 0; i < this.args.length; i++) {
            const arg = this.args[i];
            
            switch (arg) {
                case '-h':
                case '--help':
                    options.help = true;
                    break;
                case '-v':
                case '--verbose':
                    options.verbose = true;
                    break;
                case '--dry-run':
                    options.dryRun = true;
                    break;
                // TODO: Ajouter d'autres options spécifiques
            }
        }

        return options;
    }

    log(level, message, force = false) {
        if (!this.options.verbose && !force) return;
        
        const timestamp = new Date().toISOString();
        const prefix = this.options.dryRun ? '[DRY-RUN] ' : '';
        console.log(`[${timestamp}] ${prefix}${level.toUpperCase()}: ${message}`);
    }

    info(message, force = false) {
        this.log('info', message, force);
    }

    warn(message, force = true) {
        this.log('warn', message, force);
    }

    error(message, force = true) {
        this.log('error', message, force);
    }

    success(message, force = true) {
        this.log('success', message, force);
    }

    showHelp() {
        console.log(`
🔧 ${this.config.name} - ${this.config.description}
Version: ${this.config.version}

Usage:
  node scripts/UTIL_${this.config.name.toLowerCase()}.js [options] [arguments]

Options:
  -h, --help      Affiche cette aide
  -v, --verbose   Mode verbeux
  --dry-run       Simulation sans exécution réelle

Exemples:
  node scripts/UTIL_${this.config.name.toLowerCase()}.js --help
  node scripts/UTIL_${this.config.name.toLowerCase()}.js --verbose
  node scripts/UTIL_${this.config.name.toLowerCase()}.js --dry-run

Description:
  ${this.config.description}

Pour plus d'informations, consultez la documentation du projet.
        `);
    }

    // Méthodes utilitaires communes
    fileExists(filePath) {
        try {
            return fs.existsSync(filePath);
        } catch (error) {
            return false;
        }
    }

    readFile(filePath) {
        try {
            return fs.readFileSync(filePath, 'utf8');
        } catch (error) {
            this.error(`Impossible de lire le fichier: ${filePath} - ${error.message}`);
            return null;
        }
    }

    writeFile(filePath, content) {
        if (this.options.dryRun) {
            this.info(`[DRY-RUN] Écriture de ${filePath}`, true);
            return true;
        }

        try {
            // Créer le répertoire si nécessaire
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(filePath, content, 'utf8');
            this.success(`Fichier écrit: ${filePath}`);
            return true;
        } catch (error) {
            this.error(`Impossible d'écrire le fichier: ${filePath} - ${error.message}`);
            return false;
        }
    }

    copyFile(source, destination) {
        if (this.options.dryRun) {
            this.info(`[DRY-RUN] Copie de ${source} vers ${destination}`, true);
            return true;
        }

        try {
            const dir = path.dirname(destination);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.copyFileSync(source, destination);
            this.success(`Fichier copié: ${source} → ${destination}`);
            return true;
        } catch (error) {
            this.error(`Impossible de copier le fichier: ${error.message}`);
            return false;
        }
    }

    deleteFile(filePath) {
        if (this.options.dryRun) {
            this.info(`[DRY-RUN] Suppression de ${filePath}`, true);
            return true;
        }

        try {
            fs.unlinkSync(filePath);
            this.success(`Fichier supprimé: ${filePath}`);
            return true;
        } catch (error) {
            this.error(`Impossible de supprimer le fichier: ${filePath} - ${error.message}`);
            return false;
        }
    }

    listFiles(directory, extension = null) {
        try {
            let files = fs.readdirSync(directory);
            
            if (extension) {
                files = files.filter(file => file.endsWith(extension));
            }
            
            return files.map(file => path.join(directory, file));
        } catch (error) {
            this.error(`Impossible de lister le répertoire: ${directory} - ${error.message}`);
            return [];
        }
    }

    createDirectory(dirPath) {
        if (this.options.dryRun) {
            this.info(`[DRY-RUN] Création du répertoire ${dirPath}`, true);
            return true;
        }

        try {
            fs.mkdirSync(dirPath, { recursive: true });
            this.success(`Répertoire créé: ${dirPath}`);
            return true;
        } catch (error) {
            this.error(`Impossible de créer le répertoire: ${dirPath} - ${error.message}`);
            return false;
        }
    }

    // Méthode principale à surcharger
    async execute() {
        this.info('Début de l\'exécution de l\'utilitaire', true);
        
        try {
            // TODO: Implémenter la logique principale ici
            await this.performUtilityFunction();
            
            this.success('Utilitaire exécuté avec succès', true);
            return true;
        } catch (error) {
            this.error(`Erreur lors de l'exécution: ${error.message}`, true);
            return false;
        }
    }

    async performUtilityFunction() {
        // TODO: Implémenter la fonction utilitaire spécifique
        this.info('Fonction utilitaire en cours d\'exécution...');
        
        // Exemple d'opération
        this.info('Opération 1: Vérification des prérequis');
        this.info('Opération 2: Traitement des données');
        this.info('Opération 3: Finalisation');
    }

    // Point d'entrée principal
    async run() {
        if (this.options.help) {
            this.showHelp();
            return;
        }

        this.info(`Démarrage de l'utilitaire: ${this.config.name}`, true);
        
        if (this.options.dryRun) {
            this.warn('Mode DRY-RUN activé - Aucune modification ne sera effectuée', true);
        }

        const success = await this.execute();
        process.exit(success ? 0 : 1);
    }
}

// Exécution si appelé directement
if (require.main === module) {
    const utility = new UtilityScript();
    utility.run();
}

module.exports = UtilityScript;
