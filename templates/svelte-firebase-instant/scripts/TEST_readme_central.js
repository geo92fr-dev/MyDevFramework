#!/usr/bin/env node

/**
 * Test de validation du// Vérification des sections importantes
const requiredSections = [
  'Documentation Système',
  'Références Techniques', 
  'Workflow de Validation',
  'Validation Obligatoire',
  'Scripts Principaux'
];central
 * Vérifie que DOC_README.md contient bien tous les documents du projet
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const PROJECT_ROOT = process.cwd();
const README_PATH = path.join(PROJECT_ROOT, 'DOC_README.md');

console.log(chalk.blue('🧪 Test de validation du README central'));
console.log(chalk.gray('Vérification que DOC_README.md liste tous les documents'));

// Lire le contenu du README
const readmeContent = fs.readFileSync(README_PATH, 'utf8');

// Liste des documents essentiels qui doivent être référencés
const essentialDocs = [
  'DOC_CBD.md',
  'DOC_ROADMAP_LEARNING.md', 
  'DOC_GIT_REMOTE_CONFIG.md',
  'roadmap/README.md',
  'roadmap/references/auth/firebase-auth.md',
  'roadmap/references/data/content-types.md',
  'roadmap/references/data/realtime-system.md',
  'roadmap/references/ui/component-patterns.md',
  'roadmap/references/ui/reactive-stores.md',
  'roadmap/references/testing/testing-strategy.md',
  'scripts/README.md',
  'tests/README.md',
  'src/README.md'
];

let missingDocs = [];
let foundDocs = [];

console.log(chalk.yellow('\n📋 Vérification des références dans README central:'));

essentialDocs.forEach(doc => {
  if (readmeContent.includes(doc)) {
    foundDocs.push(doc);
    console.log(chalk.green('  ✅'), doc);
  } else {
    missingDocs.push(doc);
    console.log(chalk.red('  ❌'), doc);
  }
});

// Vérification des sections importantes
const requiredSections = [
  '� Documentation Système',
  '🗂️ Références Techniques Modulaires', 
  '🎯 Workflow de Validation CBD',
  '✅ **Validation Obligatoire**',
  '🚀 Scripts Principaux'
];

// Vérification des sections importantes (simplifiée)
const requiredKeywords = [
  'Documentation Système',
  'Références Techniques', 
  'Workflow de Validation',
  'Scripts Principaux',
  'Hub de documentation'
];

console.log(chalk.yellow('\n📝 Vérification des sections requises:'));
let missingKeywords = [];

requiredKeywords.forEach(keyword => {
  if (readmeContent.includes(keyword)) {
    console.log(chalk.green('  ✅'), keyword);
  } else {
    missingKeywords.push(keyword);
    console.log(chalk.red('  ❌'), keyword);
  }
});

// Rapport final
console.log(chalk.blue('\n📊 RAPPORT DE VALIDATION README CENTRAL'));
console.log('='.repeat(60));

if (missingDocs.length === 0 && missingKeywords.length === 0) {
  console.log(chalk.green('✅ SUCCÈS: README central complet et à jour'));
  console.log(chalk.green(`   ${foundDocs.length}/${essentialDocs.length} documents référencés`));
  console.log(chalk.green(`   ${requiredKeywords.length}/${requiredKeywords.length} sections présentes`));
  process.exit(0);
} else {
  console.log(chalk.red('❌ ÉCHEC: README central incomplet'));
  
  if (missingDocs.length > 0) {
    console.log(chalk.red(`   ${missingDocs.length} documents manquants:`));
    missingDocs.forEach(doc => console.log(chalk.red(`     • ${doc}`)));
  }
  
  if (missingKeywords.length > 0) {
    console.log(chalk.red(`   ${missingKeywords.length} sections manquantes:`));
    missingKeywords.forEach(keyword => console.log(chalk.red(`     • ${keyword}`)));
  }
  
  console.log(chalk.yellow('\n💡 Action requise: Mettre à jour DOC_README.md'));
  process.exit(1);
}
