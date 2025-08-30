#!/usr/bin/env node

/**
 *  POST-MORTEM AUTOMATIQUE - Phase 2
 * Usage: node tools/post-mortem.js "nom-projet"
 */

const fs = require("fs");
const path = require("path");

const projectName = process.argv[2] || "Projet-Sans-Nom";
const date = new Date().toISOString().split('T')[0];

console.log(" POST-MORTEM FRAMEWORK - 15 MINUTES MAX");
console.log("=========================================");
console.log("Projet:", projectName);
console.log("Date:", date);
console.log("");

const template = 
## Projet:  - 

###  Difficultés/Répétitions identifiées
- Quoi: [À REMPLIR - Qu'est-ce qui a pris du temps inutilement ?]
- Impact: [À REMPLIR - Combien de temps perdu ?]
- Solution potentielle: [À REMPLIR - Script/snippet/template qui aiderait ?]

###  Succès framework
- Quoi: [À REMPLIR - Qu'est-ce qui a bien fonctionné ?]
- Temps gagné: [À REMPLIR - Estimation du temps économisé]
- À conserver: [À REMPLIR - Pattern/outil validé à garder]

###  Top 3 Apprentissages
1. [À REMPLIR - Apprentissage technique]
2. [À REMPLIR - Apprentissage process]
3. [À REMPLIR - Apprentissage framework]

###  Actions Next Framework
- [ ] [À REMPLIR - Action concrète 1]
- [ ] [À REMPLIR - Action concrète 2]

---

;

// Ajouter au log existant
const logPath = "LOG_POSTMORTEM.md";
fs.appendFileSync(logPath, template);

console.log(" Template post-mortem ajouté à LOG_POSTMORTEM.md");
console.log(" TIMER: 15 minutes pour compléter !");
console.log("");
console.log(" Actions à faire maintenant:");
console.log("1. Ouvrir LOG_POSTMORTEM.md");
console.log("2. Compléter la section du projet " + projectName);
console.log("3. Identifier 1-2 améliorations concrètes pour le framework");
