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
 FRAMEWORK PERSONNEL CLI v${this.version}
========================================

COMMANDES DISPONIBLES:
  create <nom>     - Créer nouveau projet depuis template
  config <action>  - Gérer configuration (show|set)
  snippet <action> - Gérer snippets (add|list|use)
  sync            - Synchroniser tous projets framework
  status          - Afficher statut framework + projets
  backup          - Sauvegarder framework complet
  migrate         - Migrer projet vers framework
  hooks           - Gérer Git hooks (install|config|report)
  ini             - Gérer configuration personnelle (show|edit|sync)

EXEMPLES:
  fw create mon-app-svelte
  fw config show
  fw config set author "Votre Nom"
  fw ini show
  fw ini sync
  fw snippet list
  fw sync
  fw status
  fw hooks install
  
OPTIONS:
  --help, -h      - Afficher cette aide
  --version, -v   - Afficher version
`);
  }

  showVersion() {
    console.log(`Framework CLI v${this.version}`);
    console.log('Phase 3 - Automation Complete');
  }

  async executeCommand(command, args) {
    switch (command) {
      case 'create':
        await this.createProject(args[0]);
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

  async createProject(name) {
    if (!name) {
      console.log(' Nom de projet requis');
      console.log('Usage: fw create <nom-projet>');
      return;
    }

    console.log(` CRÉATION PROJET: ${name}`);
    console.log('=========================');
    
    try {
      const createScript = path.join(this.frameworkPath, 'tools', 'create-project.js');
      execSync(`node "${createScript}" "${name}"`, { stdio: 'inherit' });
      console.log(` Projet ${name} créé avec succès`);
    } catch (error) {
      console.error(' Erreur création projet:', error.message);
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
