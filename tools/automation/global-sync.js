#!/usr/bin/env node

/**
 *  SYNCHRONISATION GLOBALE FRAMEWORK - Phase 3
 * Validation et mise à jour automatique de tous les projets
 * Usage: node tools/automation/global-sync.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class FrameworkSyncManager {
  constructor() {
    this.frameworkPath = 'C:\\MyDevFramework';
    this.projectsFound = [];
    this.syncResults = {
      success: 0,
      failed: 0,
      skipped: 0,
      details: []
    };
  }

  async scanForProjects() {
    console.log(' SCAN PROJETS FRAMEWORK');
    console.log('========================');
    
    // Scanner dossiers communs de projets
    const searchPaths = [
      'C:\\Project',
      'C:\\Projects', 
      'C:\\Dev',
      'C:\\Development',
      process.env.USERPROFILE + '\\Projects'
    ];
    
    for (const searchPath of searchPaths) {
      if (fs.existsSync(searchPath)) {
        console.log( Scan: );
        this.scanDirectory(searchPath);
      }
    }
    
    console.log(\n  projets framework détectés);
    return this.projectsFound;
  }

  scanDirectory(dirPath, depth = 0) {
    if (depth > 2) return; // Limiter profondeur
    
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          // Vérifier si c'est un projet framework
          if (this.isFrameworkProject(itemPath)) {
            this.projectsFound.push(itemPath);
            console.log(   );
          } else {
            // Scanner récursivement
            this.scanDirectory(itemPath, depth + 1);
          }
        }
      }
    } catch (error) {
      // Ignorer erreurs d'accès
    }
  }

  isFrameworkProject(projectPath) {
    // Vérifier marqueurs projet framework
    const packageJsonPath = path.join(projectPath, 'package.json');
    const controlConfigPath = path.join(projectPath, 'CONFIG_control_levels.json');
    const orchestratorPath = path.join(projectPath, 'scripts', 'UTIL_dev_ia_orchestrator.js');
    
    return fs.existsSync(packageJsonPath) && 
           fs.existsSync(controlConfigPath) && 
           fs.existsSync(orchestratorPath);
  }

  async syncAllProjects() {
    console.log('\n SYNCHRONISATION GLOBALE');
    console.log('==========================');
    
    for (const projectPath of this.projectsFound) {
      const projectName = path.basename(projectPath);
      console.log(\n Sync: );
      
      try {
        await this.syncProject(projectPath);
        this.syncResults.success++;
        console.log('   Synchronisé');
      } catch (error) {
        this.syncResults.failed++;
        this.syncResults.details.push({
          project: projectName,
          error: error.message
        });
        console.log(   Échec: );
      }
    }
  }

  async syncProject(projectPath) {
    // 1. Backup control_levels.json actuel
    const currentConfigPath = path.join(projectPath, 'CONFIG_control_levels.json');
    const backupPath = currentConfigPath + '.backup-' + Date.now();
    
    if (fs.existsSync(currentConfigPath)) {
      fs.copyFileSync(currentConfigPath, backupPath);
    }
    
    // 2. Copier nouvelle version depuis framework
    const frameworkConfigPath = path.join(this.frameworkPath, 'core', 'control', 'control_levels.json');
    fs.copyFileSync(frameworkConfigPath, currentConfigPath);
    
    // 3. Vérifier cohérence package.json (lien magique)
    await this.validateMagicLink(projectPath);
    
    // 4. Mettre à jour scripts si nécessaire
    await this.updateProjectScripts(projectPath);
  }

  async validateMagicLink(projectPath) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Vérifier lien magique obligatoire
    if (!packageJson.scripts || packageJson.scripts.dev !== 'npm run dev:ia') {
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts.dev = 'npm run dev:ia';
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('   Lien magique restauré');
    }
  }

  async updateProjectScripts(projectPath) {
    // Mettre à jour orchestrateur si version framework plus récente
    const projectOrchestratorPath = path.join(projectPath, 'scripts', 'UTIL_dev_ia_orchestrator.js');
    const frameworkOrchestratorPath = path.join(this.frameworkPath, 'core', 'orchestrator', 'UTIL_dev_ia_orchestrator.js');
    
    if (fs.existsSync(frameworkOrchestratorPath)) {
      const frameworkStat = fs.statSync(frameworkOrchestratorPath);
      const projectStat = fs.statSync(projectOrchestratorPath);
      
      if (frameworkStat.mtime > projectStat.mtime) {
        fs.copyFileSync(frameworkOrchestratorPath, projectOrchestratorPath);
        console.log('   Orchestrateur mis à jour');
      }
    }
  }

  printReport() {
    console.log('\n RAPPORT SYNCHRONISATION');
    console.log('===========================');
    console.log( Succès: );
    console.log( Échecs: );
    console.log( Ignorés: );
    
    if (this.syncResults.details.length > 0) {
      console.log('\n DÉTAILS ÉCHECS:');
      this.syncResults.details.forEach(detail => {
        console.log(  - : );
      });
    }
    
    console.log('\n RECOMMANDATIONS:');
    if (this.syncResults.failed > 0) {
      console.log('- Vérifier permissions dossiers projets en échec');
      console.log('- Exécuter sync manuel: fw sync <projet>');
    }
    if (this.syncResults.success > 0) {
      console.log('- Tester projets synchronisés: npm run dev');
      console.log('- Vérifier niveau contrôle: npm run control:status');
    }
  }
}

// Exécution principale
async function main() {
  console.log(' SYNCHRONISATION GLOBALE FRAMEWORK - Phase 3');
  console.log('================================================');
  
  const syncManager = new FrameworkSyncManager();
  
  try {
    await syncManager.scanForProjects();
    
    if (syncManager.projectsFound.length === 0) {
      console.log('ℹ Aucun projet framework détecté');
      return;
    }
    
    await syncManager.syncAllProjects();
    syncManager.printReport();
    
  } catch (error) {
    console.error(' Erreur critique:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = FrameworkSyncManager;
