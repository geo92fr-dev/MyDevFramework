const fs = require("fs");

console.log(" SANT� FRAMEWORK PERSONNEL - PHASE 2");
console.log("=====================================");

// Version et phase
console.log("Version: 1.1.0 - Phase 2 Organique");
console.log("Date: 30/08/2025");
console.log("");

// Templates disponibles
const templates = fs.readdirSync("templates").filter(f => f !== "index.md");
console.log(" Templates disponibles:", templates.length);
templates.forEach(t => console.log("  - " + t));
console.log("");

// Snippets cr��s
const snippetFolders = ["auth", "ui", "utils", "stores", "hooks"];
let snippetCount = 0;

snippetFolders.forEach(folder => {
  const folderPath = `snippets/${folder}`;
  if (fs.existsSync(folderPath)) {
    const files = fs.readdirSync(folderPath).filter(f => !f.endsWith('.md'));
    if (files.length > 0) {
      console.log(`📄 Snippets ${folder}:`, files.length);
      files.forEach(f => console.log("  - " + f));
      snippetCount += files.length;
    }
  }
});

console.log("");
console.log(" M�TRIQUES PHASE 2:");
console.log("=====================");
console.log("Total snippets:", snippetCount);
console.log("Configurations m�tiers: 1 (e-commerce)");
console.log("Projets analys�s: 1 (test-framework-v1)");
console.log("");

console.log(" PROCHAINES ACTIONS PHASE 2:");
console.log("===============================");
console.log("1. Cr�er un vrai projet avec le framework");
console.log("2. Faire post-mortem: npm run post-mortem nom-projet");
console.log("3. Extraire patterns: npm run extract-patterns chemin-projet");
console.log("4. Enrichir snippets selon besoins r�els");
console.log("");

console.log(" Phase 2 op�rationnelle - Framework en �volution !");
