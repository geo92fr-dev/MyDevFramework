/**
 *  GIT HOOKS MANAGER - Phase 3 Automation
 * Gestionnaire intelligent hooks Git avec adaptation niveau contrôle
 * Usage: node tools/git-hooks/hooks-manager.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class GitHooksManager {
  constructor() {
    this.frameworkPath = path.dirname(path.dirname(__dirname));
    this.globalConfigPath = path.join(this.frameworkPath, 'configs', 'global-framework-config.json');
  }

  async scanAndInstallHooks() {
    console.log(' SCAN & INSTALLATION GIT HOOKS GLOBALE');
    console.log('=========================================');
    
    const globalConfig = this.loadGlobalConfig();
    const trackedProjects = globalConfig.trackedProjects || [];
    
    console.log(` ${trackedProjects.length} projets trackés détectés`);
    
    for (const project of trackedProjects) {
      if (fs.existsSync(project.path)) {
        await this.installHooksForProject(project);
      } else {
        console.log(` Projet non trouvé: ${project.path}`);
      }
    }
    
    console.log(' Installation hooks globale terminée');
  }

  async installHooksForProject(project) {
    console.log(`\n Installation hooks: ${project.name}`);
    
    try {
      const installScript = path.join(this.frameworkPath, 'tools', 'git-hooks', 'install-hooks.js');
      execSync(`node "${installScript}" install "${project.path}"`, { 
        stdio: 'inherit',
        timeout: 30000
      });
      
      console.log(`   ${project.name} - Hooks installés`);
    } catch (error) {
      console.log(`   ${project.name} - Erreur installation:`, error.message);
    }
  }

  async autoConfigureHooksLevel() {
    console.log(' AUTO-CONFIGURATION NIVEAUX HOOKS');
    console.log('===================================');
    
    const globalConfig = this.loadGlobalConfig();
    const trackedProjects = globalConfig.trackedProjects || [];
    
    for (const project of trackedProjects) {
      if (!fs.existsSync(project.path)) continue;
      
      const controlConfigPath = path.join(project.path, 'CONFIG_control_levels.json');
      
      if (fs.existsSync(controlConfigPath)) {
        const controlConfig = JSON.parse(fs.readFileSync(controlConfigPath, 'utf8'));
        const projectType = this.detectProjectType(project.path);
        
        // Auto-configuration selon type projet
        const recommendedLevel = this.getRecommendedControlLevel(projectType);
        
        if (controlConfig.currentMode !== recommendedLevel) {
          console.log(` ${project.name}: ${controlConfig.currentMode}  ${recommendedLevel}`);
          
          controlConfig.currentMode = recommendedLevel;
          controlConfig.autoConfigured = true;
          controlConfig.autoConfigDate = new Date().toISOString();
          
          fs.writeFileSync(controlConfigPath, JSON.stringify(controlConfig, null, 2));
          
          // Réinstaller hooks avec nouveau niveau
          await this.installHooksForProject(project);
        } else {
          console.log(` ${project.name}: Niveau optimal (${recommendedLevel})`);
        }
      }
    }
  }

  detectProjectType(projectPath) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) return 'unknown';
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // Détection basée sur dépendances
    if (deps.svelte || deps['@sveltejs/kit']) return 'svelte';
    if (deps.react || deps['next']) return 'react';
    if (deps.vue || deps.nuxt) return 'vue';
    if (deps.express || deps.fastify) return 'backend';
    if (deps.electron) return 'desktop';
    
    return 'generic';
  }

  getRecommendedControlLevel(projectType) {
    const recommendations = {
      'svelte': 'controlled',
      'react': 'controlled', 
      'vue': 'controlled',
      'backend': 'strict',
      'desktop': 'strict',
      'generic': 'permissive',
      'unknown': 'permissive'
    };
    
    return recommendations[projectType] || 'permissive';
  }

  async generateHooksReport() {
    console.log(' RAPPORT GIT HOOKS');
    console.log('====================');
    
    const globalConfig = this.loadGlobalConfig();
    const trackedProjects = globalConfig.trackedProjects || [];
    
    const report = {
      timestamp: new Date().toISOString(),
      totalProjects: trackedProjects.length,
      projectsWithHooks: 0,
      hooksByLevel: {
        strict: 0,
        controlled: 0,
        permissive: 0
      },
      projects: []
    };
    
    for (const project of trackedProjects) {
      if (!fs.existsSync(project.path)) continue;
      
      const projectReport = await this.analyzeProjectHooks(project);
      report.projects.push(projectReport);
      
      if (projectReport.hasHooks) {
        report.projectsWithHooks++;
        report.hooksByLevel[projectReport.controlLevel]++;
      }
    }
    
    // Afficher rapport
    console.log(` Projets total: ${report.totalProjects}`);
    console.log(` Avec hooks: ${report.projectsWithHooks}`);
    console.log(`\n Répartition niveaux:`);
    Object.entries(report.hooksByLevel).forEach(([level, count]) => {
      console.log(`  ${level}: ${count} projets`);
    });
    
    // Sauvegarder rapport
    const reportPath = path.join(this.frameworkPath, 'logs', 'git-hooks-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n Rapport sauvé: ${reportPath}`);
    
    return report;
  }

  async analyzeProjectHooks(project) {
    const gitHooksPath = path.join(project.path, '.git', 'hooks');
    const controlConfigPath = path.join(project.path, 'CONFIG_control_levels.json');
    
    const hooks = ['pre-commit', 'pre-push', 'commit-msg'];
    const installedHooks = hooks.filter(hook => 
      fs.existsSync(path.join(gitHooksPath, hook))
    );
    
    let controlLevel = 'unknown';
    if (fs.existsSync(controlConfigPath)) {
      const config = JSON.parse(fs.readFileSync(controlConfigPath, 'utf8'));
      controlLevel = config.currentMode || 'unknown';
    }
    
    return {
      name: project.name,
      path: project.path,
      hasHooks: installedHooks.length > 0,
      installedHooks,
      controlLevel,
      lastModified: fs.existsSync(gitHooksPath) ? 
        fs.statSync(gitHooksPath).mtime.toISOString() : null
    };
  }

  loadGlobalConfig() {
    if (!fs.existsSync(this.globalConfigPath)) {
      throw new Error('Configuration globale non trouvée');
    }
    return JSON.parse(fs.readFileSync(this.globalConfigPath, 'utf8'));
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2] || 'scan';
  
  try {
    const manager = new GitHooksManager();
    
    switch (command) {
      case 'scan':
        await manager.scanAndInstallHooks();
        break;
      case 'auto-config':
        await manager.autoConfigureHooksLevel();
        break;
      case 'report':
        await manager.generateHooksReport();
        break;
      case 'all':
        console.log(' EXÉCUTION COMPLÈTE GIT HOOKS MANAGER');
        await manager.scanAndInstallHooks();
        await manager.autoConfigureHooksLevel();
        await manager.generateHooksReport();
        break;
      default:
        console.log('Usage: node hooks-manager.js [scan|auto-config|report|all]');
    }
  } catch (error) {
    console.error(' Erreur:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = GitHooksManager;
