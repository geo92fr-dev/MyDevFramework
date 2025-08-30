/**
 *  CLI PERSONNEL FRAMEWORK - Phase 3 Complete
 * Interface en ligne de commande pour automatisation avancée
 * Usage: fw [command] [options]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class FrameworkCLI {
  constructor() {
    this.version = '1.3.0';
    this.frameworkPath = path.dirname(__dirname);
    this.configPath = path.join(this.frameworkPath, 'configs', 'global-framework-config.json');
  }

  showHelp() {
    console.log(`
 FRAMEWORK PERSONNEL CLI v${this.version} - EXTERNE UNIQUEMENT
===============================================================

COMMANDES DISPONIBLES:
  create <nom>     - Créer nouveau projet EXTERNE avec Git indépendant
  create-auto      - Créer projet avec nom/chemin depuis project.ini
  config <action>  - Gérer configuration (show|set)
  snippet <action> - Gérer snippets (add|list|use)
  sync            - Synchroniser tous projets framework
  status          - Afficher statut framework + projets
  backup          - Sauvegarder framework complet
  migrate         - Migrer projet vers framework
  hooks           - Gérer Git hooks (install|config|report)
  ini             - Gérer configuration personnelle (show|edit|sync)

EXEMPLES:
  fw create mon-app-svelte                    # Nom spécifique
  fw create-auto                              # Utilise project.ini [Project] name
  fw create mon-app --external-path C:\\MesProjets  # Chemin spécifique
  fw config show
  fw ini show
  fw snippet list
  
OPTIONS:
  --external-path <path>  - Chemin spécifique pour le projet externe
  --help, -h             - Afficher cette aide
  --version, -v          - Afficher version

🎯 IMPORTANT: MyDevFramework ne crée QUE des projets externes
   Chaque projet a son propre Git indépendant du framework
`);
  }

  showVersion() {
    console.log(`Framework CLI v${this.version}`);
    console.log('Phase 3 - Automation Complete');
  }

  async executeCommand(command, args) {
    switch (command) {
      case 'create':
        const projectName = args[0];
        const options = {};
        
        // Parser les options pour projets externes uniquement
        for (let i = 1; i < args.length; i++) {
          if (args[i] === '--external-path' && args[i + 1]) {
            options.externalPath = args[i + 1];
            i++; // Skip next argument
          }
          // Maintenir compatibilité avec --config (sera ignoré)
          if (args[i] === '--config' && args[i + 1]) {
            console.log('⚠️  --config ignoré: MyDevFramework utilise project.ini uniquement');
            i++; // Skip next argument
          }
        }
        
        await this.createProject(projectName, options);
        break;
      case 'create-auto':
        // Utilise automatiquement le nom configuré dans project.ini
        await this.createProjectAuto();
        break;
      case 'config':
        await this.manageConfig(args);
        break;
      case 'ini':
        await this.manageIni(args);
        break;
      case 'snippet':
        await this.manageSnippets(args);
        break;
      case 'sync':
        await this.globalSync();
        break;
      case 'status':
        await this.showStatus();
        break;
      case 'backup':
        await this.backupFramework();
        break;
      case 'migrate':
        await this.migrateProject(args[0]);
        break;
      case 'hooks':
        await this.manageHooks(args);
        break;
      default:
        console.log(` Commande inconnue: ${command}`);
        this.showHelp();
    }
  }

  async createProject(name, options = {}) {
    if (!name) {
      console.log('❌ Nom de projet requis');
      console.log('Usage: fw create <nom-projet> [--external-path <path>]');
      return;
    }

    console.log(`🚀 CRÉATION PROJET EXTERNE: ${name}`);
    console.log('============================');
    console.log('🎯 MyDevFramework - Mode EXTERNE UNIQUEMENT');
    console.log('   Projet créé avec Git indépendant\n');
    
    try {
      const createScript = path.join(this.frameworkPath, 'tools', 'create-project.js');
      
      // Toujours utiliser project.ini pour les chemins externes
      const projectIniPath = path.join(this.frameworkPath, 'project.ini');
      console.log(`📋 Utilisation de la configuration: ${projectIniPath}`);
      
      // Passer le chemin externe si spécifié
      if (options.externalPath) {
        console.log(`📁 Chemin externe spécifique: ${options.externalPath}`);
        execSync(`node "${createScript}" "${name}" "" "${projectIniPath}" --external-path "${options.externalPath}"`, { stdio: 'inherit' });
      } else {
        console.log(`📁 Utilisation des chemins configurés dans project.ini`);
        execSync(`node "${createScript}" "${name}" "" "${projectIniPath}"`, { stdio: 'inherit' });
      }
      
      console.log(`✅ Projet externe ${name} créé avec succès`);
    } catch (error) {
      console.error('❌ Erreur création projet externe:', error.message);
    }
  }

  async createProjectAuto() {
    console.log(`🚀 CRÉATION PROJET AUTO-CONFIG`);
    console.log('===============================');
    console.log('🎯 MyDevFramework - Configuration automatique depuis project.ini');
    console.log('   Nom et chemin récupérés automatiquement\n');
    
    try {
      // Charger la configuration INI pour récupérer le nom du projet
      const path = require('path');
      const IniConfigManager = require(path.join(this.frameworkPath, 'tools', 'ini-manager.js'));
      const iniManager = new IniConfigManager();
      
      const projectName = iniManager.getProjectName();
      const projectsPath = iniManager.getExternalProjectsPath();
      
      console.log(`📋 Nom du projet: ${projectName}`);
      console.log(`📁 Chemin de base: ${projectsPath}`);
      console.log(`🎯 Destination: ${path.join(projectsPath, projectName)}`);
      console.log('');
      
      // Créer le projet avec le nom configuré
      await this.createProject(projectName, {});
      
    } catch (error) {
      console.error('❌ Erreur création projet auto:', error.message);
    }
  }

  async manageConfig(args) {
    const action = args[0] || 'show';
    
    console.log(`🔧 GESTION CONFIGURATION: ${action}`);
    console.log('================================');
    
    try {
      const configScript = path.join(this.frameworkPath, 'tools', 'config-manager.js');
      
      if (args.length === 0) {
        // Afficher l'aide
        execSync(`node "${configScript}"`, { stdio: 'inherit' });
      } else {
        // Exécuter la commande avec les arguments
        const command = args.join(' ');
        execSync(`node "${configScript}" ${command}`, { stdio: 'inherit' });
      }
    } catch (error) {
      console.error('❌ Erreur configuration:', error.message);
    }
  }

  async manageIni(args) {
    const action = args[0] || 'show';
    
    console.log(`⚙️ GESTION CONFIGURATION INI: ${action}`);
    console.log('===================================');
    
    const IniConfigManager = require('../tools/ini-manager');
    const iniManager = new IniConfigManager();
    
    try {
      switch (action) {
        case 'show':
          iniManager.displayConfig();
          break;
          
        case 'sync':
          const projectConfigPath = path.join(this.frameworkPath, 'configs', 'project.config.json');
          iniManager.updateProjectConfig(projectConfigPath);
          console.log('✅ Synchronisation terminée');
          break;
          
        case 'init':
          const projectName = args[1] || 'nouveau-projet';
          const projectDescription = args[2] || 'Description du projet';
          this.createProjectIni(projectName, projectDescription);
          break;
          
        case 'mode':
          const newMode = args[1];
          if (newMode === 'LOCAL' || newMode === 'EXTERNE') {
            this.setCreationMode(newMode);
          } else {
            console.log('Modes disponibles: LOCAL, EXTERNE');
            console.log('Usage: fw ini mode <LOCAL|EXTERNE>');
          }
          break;
          
        case 'edit':
          const iniPath = path.join(this.frameworkPath, 'createproject.ini');
          console.log(`📝 Éditez le fichier: ${iniPath}`);
          console.log('Puis utilisez "fw ini sync" pour appliquer les changements');
          break;
          
        default:
          console.log('Actions disponibles:');
          console.log('  show - Afficher la configuration actuelle');
          console.log('  sync - Synchroniser avec project.config.json');
          console.log('  init <nom> <description> - Créer project.ini local');
          console.log('  mode <LOCAL|EXTERNE> - Changer le mode de création');
          console.log('  edit - Informations pour éditer le fichier');
      }
    } catch (error) {
      console.error('❌ Erreur gestion INI:', error.message);
    }
  }

  createProjectIni(projectName, projectDescription) {
    const projectIniPath = path.join(process.cwd(), 'project.ini');
    
    if (fs.existsSync(projectIniPath)) {
      console.log('⚠️ project.ini existe déjà dans ce répertoire');
      return;
    }
    
    const content = `[Project]
name = ${projectName}
description = ${projectDescription}
author = Raphaël GEOFFROY
email = geo92fr@gmail.com
version = 1.0.0
license = MIT

[Git]
repository_url = https://github.com/geo92fr/${projectName}
private = false

[Template]
template = svelte-firebase-instant
customize = true
`;

    try {
      fs.writeFileSync(projectIniPath, content);
      console.log(`✅ Fichier project.ini créé: ${projectIniPath}`);
      console.log('📝 Éditez ce fichier pour personnaliser votre projet');
      console.log('🚀 Puis utilisez "fw create" pour créer le projet');
    } catch (error) {
      console.error('❌ Erreur création project.ini:', error.message);
    }
  }

  setCreationMode(mode) {
    const projectIniPath = path.join(this.frameworkPath, 'project.ini');
    
    try {
      if (!fs.existsSync(projectIniPath)) {
        console.log('❌ Fichier project.ini non trouvé');
        return;
      }
      
      let content = fs.readFileSync(projectIniPath, 'utf8');
      
      // Remplacer le mode dans le fichier
      const modeRegex = /creation_mode\s*=\s*(LOCAL|EXTERNE)/;
      if (modeRegex.test(content)) {
        content = content.replace(modeRegex, `creation_mode = ${mode}`);
      } else {
        // Ajouter la section Mode si elle n'existe pas
        content = `[Mode]\ncreation_mode = ${mode}\n\n${content}`;
      }
      
      fs.writeFileSync(projectIniPath, content);
      console.log(`✅ Mode de création changé vers: ${mode}`);
      
      // Afficher la différence
      if (mode === 'LOCAL') {
        console.log('📋 Mode LOCAL: Utilise les paramètres par défaut du framework');
      } else {
        console.log('📋 Mode EXTERNE: Utilise la configuration projet spécifique');
      }
      
    } catch (error) {
      console.error('❌ Erreur changement de mode:', error.message);
    }
  }

  async manageSnippets(args) {
    const action = args[0] || 'list';
    
    console.log(` GESTION SNIPPETS: ${action}`);
    console.log('========================');
    
    const snippetsPath = path.join(this.frameworkPath, 'snippets');
    
    switch (action) {
      case 'list':
        this.listSnippets(snippetsPath);
        break;
      case 'add':
        console.log(' Pour ajouter snippet: Copier fichier dans snippets/');
        break;
      case 'use':
        console.log(' Pour utiliser snippet: fw snippet list puis copier');
        break;
      default:
        console.log('Actions: list, add, use');
    }
  }

  listSnippets(snippetsPath) {
    if (!fs.existsSync(snippetsPath)) {
      console.log(' Répertoire snippets non trouvé');
      return;
    }

    const files = fs.readdirSync(snippetsPath).filter(f => f.endsWith('.js') || f.endsWith('.svelte'));
    
    if (files.length === 0) {
      console.log(' Aucun snippet disponible');
      return;
    }

    console.log(` ${files.length} snippets disponibles:`);
    files.forEach(file => {
      console.log(`   ${file}`);
    });
  }

  async globalSync() {
    console.log(' SYNCHRONISATION GLOBALE');
    console.log('==========================');
    
    try {
      const syncScript = path.join(this.frameworkPath, 'tools', 'global-sync.js');
      execSync(`node "${syncScript}"`, { stdio: 'inherit' });
    } catch (error) {
      console.error(' Erreur synchronisation:', error.message);
    }
  }

  async showStatus() {
    console.log(' STATUS FRAMEWORK');
    console.log('===================');
    
    // Framework info
    console.log(`Framework: v${this.version}`);
    console.log(`Path: ${this.frameworkPath}`);
    
    // Projets trackés
    if (fs.existsSync(this.configPath)) {
      const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      console.log(` Projets trackés: ${(config.trackedProjects || []).length}`);
      
      (config.trackedProjects || []).forEach(project => {
        const exists = fs.existsSync(project.path);
        console.log(`  ${exists ? '' : ''} ${project.name} (${project.path})`);
      });
    } else {
      console.log(' Configuration globale non trouvée');
    }
    
    // Snippets
    const snippetsPath = path.join(this.frameworkPath, 'snippets');
    const snippetCount = fs.existsSync(snippetsPath) ? 
      fs.readdirSync(snippetsPath).filter(f => f.endsWith('.js') || f.endsWith('.svelte')).length : 0;
    console.log(` Snippets: ${snippetCount}`);
    
    // Templates
    const templatesPath = path.join(this.frameworkPath, 'templates');
    const templateCount = fs.existsSync(templatesPath) ? 
      fs.readdirSync(templatesPath).filter(d => fs.statSync(path.join(templatesPath, d)).isDirectory()).length : 0;
    console.log(` Templates: ${templateCount}`);
  }

  async backupFramework() {
    console.log(' SAUVEGARDE FRAMEWORK');
    console.log('=======================');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `framework-backup-${timestamp}`;
    
    console.log(` Création: ${backupName}`);
    console.log(' Utiliser outils système pour sauvegarde complète');
  }

  async migrateProject(projectPath) {
    if (!projectPath) {
      console.log(' Chemin de projet requis');
      console.log('Usage: fw migrate <chemin-projet>');
      return;
    }

    console.log(` MIGRATION PROJET: ${projectPath}`);
    console.log('============================');
    console.log(' Migration manuelle recommandée pour projets existants');
  }

  async manageHooks(args) {
    const action = args[0] || 'install';
    
    console.log(` GESTION GIT HOOKS: ${action}`);
    console.log('==========================');
    
    try {
      const hooksScript = path.join(this.frameworkPath, 'tools', 'git-hooks', 'hooks-manager.js');
      execSync(`node "${hooksScript}" ${action}`, { stdio: 'inherit' });
    } catch (error) {
      console.error(' Erreur gestion hooks:', error.message);
    }
  }
}

// Main CLI execution
async function main() {
  const args = process.argv.slice(2);
  const cli = new FrameworkCLI();
  
  if (args.length === 0) {
    cli.showHelp();
    return;
  }
  
  const command = args[0];
  const commandArgs = args.slice(1);
  
  // Handle global options
  if (command === '--help' || command === '-h') {
    cli.showHelp();
    return;
  }
  
  if (command === '--version' || command === '-v') {
    cli.showVersion();
    return;
  }
  
  await cli.executeCommand(command, commandArgs);
}

if (require.main === module) {
  main().catch(error => {
    console.error(' Erreur CLI:', error.message);
    process.exit(1);
  });
}

module.exports = FrameworkCLI;
