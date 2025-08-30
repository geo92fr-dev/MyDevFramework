#!/usr/bin/env node

/**
 * 🎛️ UTIL_control_level_manager.js - Gestionnaire des niveaux de contrôle
 * 
 * Permet de changer facilement le niveau de contrôle du système
 * et de voir l'impact sur les quality gates.
 * 
 * Usage: 
 *   node scripts/UTIL_control_level_manager.js status
 *   node scripts/UTIL_control_level_manager.js set controlled
 *   node scripts/UTIL_control_level_manager.js set strict
 *   node scripts/UTIL_control_level_manager.js set permissive
 * 
 * @version 1.0.0
 * @author Assistant IA
 * @date 2025-08-30
 */

const fs = require('fs');
const path = require('path');

class ControlLevelManager {
    constructor() {
        this.configPath = path.join(__dirname, '..', 'CONFIG_control_levels.json');
        this.config = this.loadConfig();
    }

    loadConfig() {
        try {
            return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
        } catch (error) {
            console.error('❌ Impossible de charger la configuration:', error.message);
            process.exit(1);
        }
    }

    saveConfig() {
        try {
            fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
            console.log('✅ Configuration sauvegardée');
        } catch (error) {
            console.error('❌ Impossible de sauvegarder:', error.message);
            process.exit(1);
        }
    }

    /**
     * 📊 Afficher le statut actuel
     */
    showStatus() {
        const currentLevel = this.config.currentMode;
        const levelConfig = this.config.controlLevels[currentLevel];

        console.log('\n🎛️ STATUT DES CONTRÔLES FUNLEARNING');
        console.log('═'.repeat(50));
        console.log(`📍 Niveau actuel: ${currentLevel.toUpperCase()}`);
        console.log(`📝 Description: ${levelConfig.description}`);
        
        console.log('\n🛡️ PARAMÈTRES DE SÉCURITÉ:');
        console.log(`   Vulnérabilités dev: ${levelConfig.security.allowDevVulnerabilities ? '✅ Autorisées' : '❌ Bloquées'}`);
        console.log(`   Critical max: ${levelConfig.security.maxCriticalVulnerabilities}`);
        console.log(`   High max: ${levelConfig.security.maxHighVulnerabilities}`);
        console.log(`   Moderate max: ${levelConfig.security.maxModerateVulnerabilities}`);
        
        if (levelConfig.security.blockedPackages) {
            console.log(`   Packages bloqués: ${levelConfig.security.blockedPackages.join(', ')}`);
        }

        console.log('\n📋 PARAMÈTRES QUALITÉ:');
        console.log(`   Couverture min: ${levelConfig.quality.minTestCoverage}%`);
        console.log(`   Complexité max: ${levelConfig.quality.maxComplexity}`);
        console.log(`   Warnings max: ${levelConfig.quality.allowWarnings || 0}`);

        console.log('\n🗺️ PARAMÈTRES ROADMAP:');
        console.log(`   Déviations: ${levelConfig.roadmap.allowDeviations ? '✅ Autorisées' : '❌ Bloquées'}`);
        console.log(`   Fichiers critiques requis: ${levelConfig.roadmap.requireCriticalFiles ? '✅ Oui' : '❌ Non'}`);

        console.log('═'.repeat(50));
    }

    /**
     * 🔄 Changer le niveau de contrôle
     */
    setLevel(newLevel) {
        const availableLevels = Object.keys(this.config.controlLevels);
        
        if (!availableLevels.includes(newLevel)) {
            console.error(`❌ Niveau invalide: ${newLevel}`);
            console.log(`   Niveaux disponibles: ${availableLevels.join(', ')}`);
            process.exit(1);
        }

        const oldLevel = this.config.currentMode;
        this.config.currentMode = newLevel;

        console.log(`\n🔄 CHANGEMENT DE NIVEAU DE CONTRÔLE`);
        console.log('═'.repeat(50));
        console.log(`📍 Ancien niveau: ${oldLevel.toUpperCase()}`);
        console.log(`📍 Nouveau niveau: ${newLevel.toUpperCase()}`);
        
        const newLevelConfig = this.config.controlLevels[newLevel];
        console.log(`📝 Description: ${newLevelConfig.description}`);

        // Montrer les changements principaux
        this.showLevelComparison(oldLevel, newLevel);

        this.saveConfig();
        
        console.log('\n💡 PROCHAINES ÉTAPES:');
        console.log('   1. Exécuter: npm run dev:ia');
        console.log('   2. Observer les nouveaux seuils en action');
        console.log('   3. Ajuster selon les résultats');
        console.log('═'.repeat(50));
    }

    /**
     * 🔍 Comparer deux niveaux
     */
    showLevelComparison(oldLevel, newLevel) {
        const oldConfig = this.config.controlLevels[oldLevel];
        const newConfig = this.config.controlLevels[newLevel];

        console.log('\n📊 COMPARAISON DES CHANGEMENTS:');
        
        // Sécurité
        const oldMaxCritical = oldConfig.security.maxCriticalVulnerabilities;
        const newMaxCritical = newConfig.security.maxCriticalVulnerabilities;
        if (oldMaxCritical !== newMaxCritical) {
            const trend = newMaxCritical > oldMaxCritical ? '📈 Plus permissif' : '📉 Plus strict';
            console.log(`   Vulns Critical: ${oldMaxCritical} → ${newMaxCritical} ${trend}`);
        }

        // Qualité
        const oldCoverage = oldConfig.quality.minTestCoverage;
        const newCoverage = newConfig.quality.minTestCoverage;
        if (oldCoverage !== newCoverage) {
            const trend = newCoverage > oldCoverage ? '📈 Plus exigeant' : '📉 Plus souple';
            console.log(`   Couverture: ${oldCoverage}% → ${newCoverage}% ${trend}`);
        }

        const oldComplexity = oldConfig.quality.maxComplexity;
        const newComplexity = newConfig.quality.maxComplexity;
        if (oldComplexity !== newComplexity) {
            const trend = newComplexity > oldComplexity ? '📈 Plus permissif' : '📉 Plus strict';
            console.log(`   Complexité: ${oldComplexity} → ${newComplexity} ${trend}`);
        }
    }

    /**
     * 📋 Lister tous les niveaux disponibles
     */
    listLevels() {
        console.log('\n🎛️ NIVEAUX DE CONTRÔLE DISPONIBLES');
        console.log('═'.repeat(50));

        Object.entries(this.config.controlLevels).forEach(([level, config]) => {
            const isCurrent = level === this.config.currentMode;
            const marker = isCurrent ? '👉' : '  ';
            
            console.log(`${marker} ${level.toUpperCase()}`);
            console.log(`   📝 ${config.description}`);
            console.log(`   🛡️ Sécurité: ${config.security.maxCriticalVulnerabilities}C/${config.security.maxHighVulnerabilities}H/${config.security.maxModerateVulnerabilities}M`);
            console.log(`   📊 Qualité: ${config.quality.minTestCoverage}% couverture, complexité ${config.quality.maxComplexity}`);
            
            if (config.security.blockedPackages && config.security.blockedPackages.length > 0) {
                console.log(`   🚫 ${config.security.blockedPackages.length} packages bloqués`);
            }
            console.log('');
        });

        console.log('💡 Usage: node scripts/UTIL_control_level_manager.js set <niveau>');
        console.log('═'.repeat(50));
    }

    /**
     * 🧪 Tester l'impact d'un niveau
     */
    async testLevel(level) {
        if (!this.config.controlLevels[level]) {
            console.error(`❌ Niveau invalide: ${level}`);
            return;
        }

        console.log(`\n🧪 SIMULATION DU NIVEAU: ${level.toUpperCase()}`);
        console.log('═'.repeat(50));

        const levelConfig = this.config.controlLevels[level];
        
        console.log('📊 Avec ce niveau, les quality gates seraient:');
        console.log(`   ✅ Tests requis avec ${levelConfig.quality.minTestCoverage}% couverture`);
        console.log(`   ✅ Complexité max: ${levelConfig.quality.maxComplexity}`);
        console.log(`   ✅ Vulnérabilités: ${levelConfig.security.maxCriticalVulnerabilities}C/${levelConfig.security.maxHighVulnerabilities}H/${levelConfig.security.maxModerateVulnerabilities}M`);
        
        if (levelConfig.security.blockedPackages && levelConfig.security.blockedPackages.length > 0) {
            console.log(`   🚫 Packages bloqués: ${levelConfig.security.blockedPackages.join(', ')}`);
        }

        console.log('\n💡 Pour appliquer ce niveau:');
        console.log(`   node scripts/UTIL_control_level_manager.js set ${level}`);
        console.log('═'.repeat(50));
    }
}

// CLI Interface
async function main() {
    const manager = new ControlLevelManager();
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
        case 'status':
        case undefined:
            manager.showStatus();
            break;

        case 'set':
            const level = args[1];
            if (!level) {
                console.error('❌ Usage: set <niveau>');
                manager.listLevels();
                process.exit(1);
            }
            manager.setLevel(level);
            break;

        case 'list':
            manager.listLevels();
            break;

        case 'test':
            const testLevel = args[1];
            if (!testLevel) {
                console.error('❌ Usage: test <niveau>');
                process.exit(1);
            }
            await manager.testLevel(testLevel);
            break;

        case 'help':
            console.log('\n🎛️ GESTIONNAIRE DE CONTRÔLES FUNLEARNING');
            console.log('═'.repeat(50));
            console.log('Commands:');
            console.log('  status          Afficher le statut actuel');
            console.log('  set <niveau>    Changer le niveau de contrôle');
            console.log('  list            Lister tous les niveaux');
            console.log('  test <niveau>   Simuler un niveau');
            console.log('  help            Afficher cette aide');
            console.log('\nNiveaux: strict, controlled, permissive');
            console.log('═'.repeat(50));
            break;

        default:
            console.error(`❌ Commande inconnue: ${command}`);
            console.log('💡 Utilisez "help" pour voir les commandes disponibles');
            process.exit(1);
    }
}

if (require.main === module) {
    main().catch(error => {
        console.error('💥 Erreur:', error.message);
        process.exit(1);
    });
}

module.exports = ControlLevelManager;
