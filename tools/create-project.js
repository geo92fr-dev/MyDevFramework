#!/usr/bin/env node

/**
 * CREATE PROJECT - Framework Personnel
 * Usage: node tools/create-project.js mon-nouveau-projet [template]
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const ProjectConfigManager = require("./config-manager.js");
const IniConfigManager = require("./ini-manager.js");

const PROJECT_NAME = process.argv[2];
const TEMPLATE = process.argv[3] || null;
const EXTERNAL_CONFIG = process.argv[4] || null;

// Charger la configuration avec le mode
const iniManager = new IniConfigManager();
const projectConfig = iniManager.getProjectConfig(PROJECT_NAME);
const config = new ProjectConfigManager();

// Override avec la config spécifique du projet
if (projectConfig) {
    console.log(`📋 Mode: ${iniManager.getCreationMode()}`);
    console.log(`👤 Auteur: ${projectConfig.author}`);
    console.log(`📧 Email: ${projectConfig.email}`);
    
    // Mettre à jour les informations de configuration
    config.config.projectDefaults = {
        ...config.config.projectDefaults,
        author: projectConfig.author,
        email: projectConfig.email,
        description: projectConfig.description,
        version: projectConfig.version,
        license: projectConfig.license
    };
}

const FINAL_TEMPLATE = TEMPLATE || projectConfig?.template || config.getDefaultTemplate();

if (!PROJECT_NAME) {
  console.log("❌ Usage: node tools/create-project.js <nom-projet> [template] [config-file]");
  console.log("📋 Templates disponibles:", config.config.templates?.available?.join(', ') || 'svelte-firebase-instant');
  process.exit(1);
}

// Validation du nom de projet
const validation = config.validateProjectName(PROJECT_NAME);
if (!validation.valid) {
  console.log(`❌ Nom de projet invalide: ${validation.error}`);
  process.exit(1);
}

console.log(`🚀 Création projet ${PROJECT_NAME} avec template ${FINAL_TEMPLATE}`);
console.log(`👤 Auteur: ${config.getAuthor()}`);
console.log(`📧 Email: ${config.getEmail()}`);

// Vérifier si le projet existe déjà
const projectPath = path.join(process.cwd(), PROJECT_NAME);
if (fs.existsSync(projectPath) && config.getValidationRules().checkProjectNameExists) {
  console.log(`❌ Le projet ${PROJECT_NAME} existe déjà !`);
  process.exit(1);
}

// 1. Copier template
const templatePath = path.join(__dirname, "..", "templates", FINAL_TEMPLATE);

if (!fs.existsSync(templatePath)) {
  console.log(`❌ Template ${FINAL_TEMPLATE} non trouvé`);
  process.exit(1);
}

try {
  // Robocopy peut retourner des codes d'erreur même en cas de succès
  try {
    execSync(`robocopy "${templatePath}" "${projectPath}" /E /XD node_modules .git`, { stdio: "inherit" });
  } catch (error) {
    // Ignorer les codes d'erreur de robocopy si le dossier existe
    if (!fs.existsSync(projectPath)) {
      throw error;
    }
  }
  
  // 2. Personnaliser package.json
  const packageJsonPath = path.join(projectPath, "package.json");
  if (fs.existsSync(packageJsonPath)) {
    let packageJson = fs.readFileSync(packageJsonPath, "utf8");
    packageJson = config.replaceTokens(packageJson, PROJECT_NAME);
    packageJson = packageJson.replace(/"name": ".*?"/, `"name": "${PROJECT_NAME.toLowerCase()}"`);
    
    // Ajouter les informations de l'auteur depuis la config
    const parsed = JSON.parse(packageJson);
    parsed.author = config.getAuthor();
    if (config.getEmail()) {
      parsed.author = `${config.getAuthor()} <${config.getEmail()}>`;
    }
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(parsed, null, 2));
  }
  
  // 3. Personnaliser README
  const readmePath = path.join(projectPath, "README.md");
  if (fs.existsSync(readmePath)) {
    let readme = fs.readFileSync(readmePath, "utf8");
    readme = config.replaceTokens(readme, PROJECT_NAME);
    fs.writeFileSync(readmePath, readme);
  }
  
  console.log(`✅ Projet ${PROJECT_NAME} créé avec succès !`);
  
  // 4. Exécuter les hooks de post-création
  const hooks = config.getHooks();
  if (hooks.afterCreate && hooks.afterCreate.length > 0) {
    console.log(`🔧 Exécution des hooks de post-création...`);
    process.chdir(projectPath); // Changer vers le répertoire du projet
    
    for (const hook of hooks.afterCreate) {
      try {
        console.log(`   ▶ ${hook}`);
        execSync(hook, { stdio: 'inherit' });
      } catch (error) {
        console.log(`   ⚠️ Hook échoué: ${hook}`);
      }
    }
    
    process.chdir('..'); // Retourner au répertoire parent
  }
  
  console.log(`📝 Prochaines étapes:`);
  console.log(`   cd ${PROJECT_NAME}`);
  if (!config.getCustomizationSettings().autoNpmInstall) {
    console.log(`   npm install`);
  }
  console.log(`   npm run dev`);
  
} catch (error) {
  console.log(`❌ Erreur lors de la création: ${error.message}`);
}
