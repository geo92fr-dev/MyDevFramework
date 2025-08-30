#!/usr/bin/env node

/**
 * TEST FRAMEWORK - Validation Continue
 * Usage: node tests/test-templates.js
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 TESTS FRAMEWORK MYDEVFRAMEWORK");
console.log("==================================");

let allTestsPassed = true;

// Test 1: Vérification des scripts de création
console.log("\n📋 Test des scripts de création:");
const scripts = ['create-simple.bat', 'create-external-only.bat', 'create-auto.bat'];

scripts.forEach(script => {
  const scriptPath = path.join(__dirname, '..', script);
  if (fs.existsSync(scriptPath)) {
    const content = fs.readFileSync(scriptPath, 'utf8');
    if (content.includes('node cli\\fw.js') || content.includes('node cli/fw.js')) {
      console.log(`✅ ${script} OK`);
    } else {
      console.log(`⚠️  ${script} - Structure incorrecte`);
      allTestsPassed = false;
    }
  } else {
    console.log(`❌ ${script} manquant`);
    allTestsPassed = false;
  }
});

// Test 2: Vérification des outils principaux
console.log("\n📋 Test des outils principaux:");
const tools = [
  'tools/create-project.js',
  'tools/ini-manager.js',
  'cli/fw.js',
  'core/orchestrator/UTIL_dev_ia_orchestrator.js'
];

tools.forEach(tool => {
  const toolPath = path.join(__dirname, '..', tool);
  if (fs.existsSync(toolPath)) {
    console.log(`✅ ${tool} OK`);
  } else {
    console.log(`❌ ${tool} manquant`);
    allTestsPassed = false;
  }
});

// Test 3: Vérification des templates propres
console.log("\n📋 Test des templates:");
const templatesDir = path.join(__dirname, "..", "templates");
if (fs.existsSync(templatesDir)) {
  const templates = fs.readdirSync(templatesDir).filter(t => !t.endsWith('.md'));
  
  if (templates.length > 0) {
    templates.forEach(template => {
      const templatePath = path.join(templatesDir, template);
      const packageJsonPath = path.join(templatePath, "package.json");
      
      if (fs.existsSync(packageJsonPath)) {
        console.log(`✅ Template ${template} OK`);
      } else {
        console.log(`⚠️  Template ${template} - package.json manquant`);
        allTestsPassed = false;
      }
    });
  } else {
    console.log("⚠️  Aucun template trouvé");
    allTestsPassed = false;
  }
} else {
  console.log("❌ Dossier templates manquant");
  allTestsPassed = false;
}

// Test 4: Vérification de la configuration
console.log("\n📋 Test de la configuration:");
const configFiles = ['project.ini'];

configFiles.forEach(config => {
  const configPath = path.join(__dirname, '..', config);
  if (fs.existsSync(configPath)) {
    console.log(`✅ ${config} OK`);
  } else {
    console.log(`❌ ${config} manquant`);
    allTestsPassed = false;
  }
});

console.log(`\n🏁 RÉSULTAT: ${allTestsPassed ? "✅ TOUS LES TESTS PASSÉS" : "❌ ÉCHECS DÉTECTÉS"}`);
process.exit(allTestsPassed ? 0 : 1);
