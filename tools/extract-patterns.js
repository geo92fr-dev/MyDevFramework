#!/usr/bin/env node

/**
 *  EXTRACTEUR DE PATTERNS - Phase 2
 * Analyse un projet terminé pour identifier du code réutilisable
 * Usage: node tools/extract-patterns.js chemin-vers-projet
 */

const fs = require("fs");
const path = require("path");

const projectPath = process.argv[2];

if (!projectPath || !fs.existsSync(projectPath)) {
  console.log(" Usage: node tools/extract-patterns.js chemin-vers-projet");
  process.exit(1);
}

console.log(" ANALYSE PATTERNS RÉUTILISABLES");
console.log("=================================");
console.log("Projet analysé:", projectPath);
console.log("");

// Patterns à rechercher
const patterns = [
  { name: "Composants UI", path: "src/lib/components", ext: ".svelte" },
  { name: "Stores", path: "src/lib/stores", ext: ".js" },
  { name: "Utils", path: "src/lib/utils", ext: ".js" },
  { name: "Auth", path: "src/lib/auth", ext: ".js" },
  { name: "Types", path: "src/lib/types", ext: ".ts" }
];

let suggestions = [];

patterns.forEach(pattern => {
  const fullPath = path.join(projectPath, pattern.path);
  
  if (fs.existsSync(fullPath)) {
    const files = fs.readdirSync(fullPath).filter(f => f.endsWith(pattern.ext));
    
    if (files.length > 0) {
      console.log(  trouvé(s):);
      files.forEach(file => {
        console.log(  - );
        suggestions.push({
          category: pattern.name.toLowerCase(),
          file: file,
          source: path.join(fullPath, file),
          target: snippets//
        });
      });
      console.log("");
    }
  }
});

if (suggestions.length > 0) {
  console.log(" SUGGESTIONS D'EXTRACTION:");
  console.log("============================");
  
  suggestions.forEach((suggestion, index) => {
    console.log(${index + 1}.   );
  });
  
  console.log("");
  console.log(" Pour extraire manuellement:");
  suggestions.forEach(suggestion => {
    console.log(copy "" "C:\\MyDevFramework\\");
  });
} else {
  console.log("ℹ Aucun pattern évident détecté dans ce projet");
}

console.log("");
console.log(" Analyse terminée - Pensez au post-mortem !");
