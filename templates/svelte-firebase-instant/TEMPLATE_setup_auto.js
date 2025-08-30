#!/usr/bin/env node

/**
 * 🚀 SETUP AUTOMATIQUE - TEMPLATE INSTANT
 * 
 * Auto-configure un nouveau projet après copy-paste
 * Usage: npm run setup:auto
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  projectName: path.basename(process.cwd()),
  author: process.env.USER || process.env.USERNAME || 'Developer',
  year: new Date().getFullYear(),
  frameworks: {
    svelte: { port: 5173, testCommand: 'vitest' },
    react: { port: 3000, testCommand: 'jest' },
    vue: { port: 5174, testCommand: 'vitest' }
  }
};

console.log('🚀 Configuration automatique du projet...');
console.log(`📂 Projet: ${CONFIG.projectName}`);
console.log(`👤 Auteur: ${CONFIG.author}`);

// 1. Mise à jour package.json
function updatePackageJson() {
  const packagePath = './package.json';
  if (!fs.existsSync(packagePath)) {
    console.log('❌ package.json non trouvé');
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Mise à jour des champs
  packageJson.name = CONFIG.projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  packageJson.description = `Application ${CONFIG.projectName} - Auto-générée`;
  packageJson.author = CONFIG.author;
  packageJson.version = '0.1.0';
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json mis à jour');
}

// 2. Mise à jour README.md
function updateReadme() {
  const readmePath = './README.md';
  if (!fs.existsSync(readmePath)) {
    // Créer README de base
    const template = `# ${CONFIG.projectName}

Application générée automatiquement avec le framework personnel.

## 🚀 Démarrage

\`\`\`bash
npm install
npm run dev:ia    # Validation complète
npm run dev       # Développement
\`\`\`

## 🛠️ Scripts Disponibles

- \`npm run dev\` - Serveur de développement
- \`npm run build\` - Build production
- \`npm run test\` - Tests unitaires
- \`npm run dev:ia\` - Orchestrateur qualité complet
- \`npm run control:status\` - État des contrôles

## 📋 Configuration

1. Copier \`.env.example\` vers \`.env\`
2. Configurer les variables d'environnement
3. Démarrer avec \`npm run dev:ia\`

---

*Généré le ${new Date().toLocaleDateString()} par setup automatique*
`;
    fs.writeFileSync(readmePath, template);
    console.log('✅ README.md créé');
  } else {
    // Mise à jour README existant
    let readme = fs.readFileSync(readmePath, 'utf8');
    readme = readme.replace(/{{PROJECT_NAME}}/g, CONFIG.projectName);
    readme = readme.replace(/{{AUTHOR}}/g, CONFIG.author);
    readme = readme.replace(/{{YEAR}}/g, CONFIG.year);
    readme = readme.replace(/my-new-project/g, CONFIG.projectName);
    fs.writeFileSync(readmePath, readme);
    console.log('✅ README.md mis à jour');
  }
}

// 3. Configuration environnement
function setupEnvironment() {
  if (!fs.existsSync('.env') && fs.existsSync('.env.example')) {
    fs.copyFileSync('.env.example', '.env');
    console.log('✅ .env créé depuis .env.example');
    console.log('⚠️  RAPPEL: Configurer Firebase/Supabase dans .env');
  }
}

// 4. Initialisation Git
function setupGit() {
  try {
    execSync('git status', { stdio: 'ignore' });
    console.log('📁 Git déjà initialisé');
  } catch {
    try {
      execSync('git init', { stdio: 'ignore' });
      execSync('git add .', { stdio: 'ignore' });
      execSync(`git commit -m "🎉 Initial commit - ${CONFIG.projectName}"`, { stdio: 'ignore' });
      console.log('✅ Git initialisé avec commit initial');
    } catch (error) {
      console.log('⚠️  Git non disponible ou erreur:', error.message);
    }
  }
}

// 5. Validation structure projet
function validateProject() {
  const requiredFiles = [
    'package.json',
    'scripts/UTIL_dev_ia_orchestrator.js',
    'CONFIG_control_levels.json'
  ];

  const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
  
  if (missingFiles.length > 0) {
    console.log('⚠️  Fichiers manquants pour orchestrateur complet:');
    missingFiles.forEach(file => console.log(`   - ${file}`));
    console.log('💡 Copier depuis le framework: ~/MyDevFramework/core/');
  } else {
    console.log('✅ Structure orchestrateur complète');
  }
}

// 6. Test installation
function testInstallation() {
  try {
    console.log('🧪 Test de l\'installation...');
    
    // Vérifier que npm install a été fait
    if (!fs.existsSync('node_modules')) {
      console.log('📦 npm install nécessaire');
      return;
    }
    
    // Test validation simple
    if (fs.existsSync('scripts/UTIL_dev_ia_orchestrator.js')) {
      console.log('🎯 Test orchestrateur disponible');
      console.log('   Utiliser: npm run dev:ia');
    }
    
    console.log('✅ Installation validée');
  } catch (error) {
    console.log('⚠️  Erreur lors du test:', error.message);
  }
}

// 7. Instructions finales
function showNextSteps() {
  console.log('');
  console.log('🎉 Configuration terminée !');
  console.log('');
  console.log('🎯 Prochaines étapes:');
  console.log('');
  
  if (fs.existsSync('.env')) {
    console.log('1. ✏️  Configurer Firebase/Supabase dans .env');
  }
  
  console.log('2. 🧪 npm run dev:ia     # Validation complète');
  console.log('3. 🚀 npm run dev        # Développement');
  console.log('4. 📊 npm run control:status  # État contrôles');
  console.log('');
  console.log('📚 Framework personnel prêt à l\'usage !');
}

// Exécution principale
async function main() {
  try {
    updatePackageJson();
    updateReadme();
    setupEnvironment();
    setupGit();
    validateProject();
    testInstallation();
    showNextSteps();
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error.message);
    process.exit(1);
  }
}

// Exécution si appelé directement
if (require.main === module) {
  main();
}

module.exports = { main, CONFIG };
