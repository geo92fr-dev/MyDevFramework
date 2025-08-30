#!/usr/bin/env node

/**
 *  INSTALLATION GIT HOOKS INTELLIGENTS - Phase 3
 * Installation automatique hooks selon niveau de contrôle
 * Usage: node tools/git-hooks/install-hooks.js [projet-path]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class GitHooksInstaller {
  constructor(projectPath) {
    this.projectPath = projectPath || process.cwd();
    this.gitHooksPath = path.join(this.projectPath, '.git', 'hooks');
    this.controlConfig = this.loadControlConfig();
  }

  loadControlConfig() {
    const configPath = path.join(this.projectPath, 'CONFIG_control_levels.json');
    if (!fs.existsSync(configPath)) {
      throw new Error('CONFIG_control_levels.json non trouvé');
    }
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }

  async installHooks() {
    console.log(' INSTALLATION GIT HOOKS INTELLIGENTS');
    console.log('======================================');
    console.log('Projet:', path.basename(this.projectPath));
    console.log('Niveau:', this.controlConfig.currentMode || 'controlled');
    
    if (!fs.existsSync(this.gitHooksPath)) {
      console.log(' Pas de dépôt Git détecté');
      return;
    }

    const currentLevel = this.controlConfig.currentMode || 'controlled';
    const levelConfig = this.controlConfig.controlLevels[currentLevel];
    
    if (!levelConfig) {
      console.log(' Configuration niveau invalide');
      return;
    }

    // Installer hooks selon niveau
    await this.installPreCommitHook(levelConfig);
    await this.installPrePushHook(levelConfig);
    await this.installCommitMsgHook(levelConfig);
    
    console.log(' Git hooks installés avec succès');
  }

  async installPreCommitHook(levelConfig) {
    const hookPath = path.join(this.gitHooksPath, 'pre-commit');
    
    const hookContent = `#!/bin/bash
#  PRE-COMMIT HOOK - Framework Personnel
# Niveau: ${this.controlConfig.currentMode}
# Auto-généré le ${new Date().toISOString()}

echo " Pre-commit validation (${this.controlConfig.currentMode})..."

# Exécuter orchestrateur en mode pre-commit
npm run dev:ia --mode=pre-commit --no-start

# Vérifier code de sortie
if [ $? -ne 0 ]; then
  echo " Pre-commit validation échouée"
  echo " Conseil: Corriger erreurs ou utiliser --no-verify pour bypass"
  exit 1
fi

echo " Pre-commit validation réussie"
exit 0
`;

    fs.writeFileSync(hookPath, hookContent);
    
    // Rendre exécutable (Windows: pas nécessaire, mais on simule)
    try {
      execSync(`chmod +x "${hookPath}"`);
    } catch (e) {
      // Ignorer sur Windows
    }
    
    console.log('   Pre-commit hook installé');
  }

  async installPrePushHook(levelConfig) {
    const hookPath = path.join(this.gitHooksPath, 'pre-push');
    
    // Hook pre-push seulement pour strict/controlled
    if (this.controlConfig.currentMode === 'permissive') {
      console.log('   Pre-push hook ignoré (mode permissive)');
      return;
    }
    
    const hookContent = `#!/bin/bash
#  PRE-PUSH HOOK - Framework Personnel  
# Niveau: ${this.controlConfig.currentMode}

echo " Pre-push validation (${this.controlConfig.currentMode})..."

# Tests complets + audit sécurité
npm run dev:ia --mode=pre-push --no-start

if [ $? -ne 0 ]; then
  echo " Pre-push validation échouée"
  echo " Tests/sécurité obligatoires avant push"
  exit 1
fi

echo " Pre-push validation réussie"
exit 0
`;

    fs.writeFileSync(hookPath, hookContent);
    
    try {
      execSync(`chmod +x "${hookPath}"`);
    } catch (e) {
      // Ignorer sur Windows
    }
    
    console.log('   Pre-push hook installé');
  }

  async installCommitMsgHook(levelConfig) {
    const hookPath = path.join(this.gitHooksPath, 'commit-msg');
    
    const hookContent = `#!/bin/bash
#  COMMIT-MSG HOOK - Framework Personnel
# Validation format commit messages

commit_msg_file=$1
commit_msg=$(cat $commit_msg_file)

# Vérifier format basique (optionnel)
if [[ ${#commit_msg} -lt 10 ]]; then
  echo " Message commit très court (${#commit_msg} caractères)"
  echo " Conseil: Détailler davantage les changements"
  # Ne pas bloquer, juste avertir
fi

# Log pour framework (tracking)
echo "[$(date)] $commit_msg" >> framework-commits.log

exit 0
`;

    fs.writeFileSync(hookPath, hookContent);
    
    try {
      execSync(`chmod +x "${hookPath}"`);
    } catch (e) {
      // Ignorer sur Windows  
    }
    
    console.log('   Commit-msg hook installé');
  }

  async uninstallHooks() {
    console.log(' Désinstallation Git hooks...');
    
    const hooks = ['pre-commit', 'pre-push', 'commit-msg'];
    
    hooks.forEach(hook => {
      const hookPath = path.join(this.gitHooksPath, hook);
      if (fs.existsSync(hookPath)) {
        fs.unlinkSync(hookPath);
        console.log(`   ${hook} supprimé`);
      }
    });
  }

  checkHooksStatus() {
    console.log(' STATUS GIT HOOKS');
    console.log('==================');
    
    const hooks = ['pre-commit', 'pre-push', 'commit-msg'];
    
    hooks.forEach(hook => {
      const hookPath = path.join(this.gitHooksPath, hook);
      const exists = fs.existsSync(hookPath);
      console.log(`${hook}: ${exists ? ' Installé' : ' Absent'}`);
    });
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2] || 'install';
  const projectPath = process.argv[3];
  
  try {
    const installer = new GitHooksInstaller(projectPath);
    
    switch (command) {
      case 'install':
        await installer.installHooks();
        break;
      case 'uninstall':
        await installer.uninstallHooks();
        break;
      case 'status':
        installer.checkHooksStatus();
        break;
      default:
        console.log('Usage: node install-hooks.js [install|uninstall|status] [projet-path]');
    }
  } catch (error) {
    console.error(' Erreur:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = GitHooksInstaller;
