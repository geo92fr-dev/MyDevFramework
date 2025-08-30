#!/usr/bin/env node

/**
 * 📊 CBD Analytics - Collecte et analyse des métriques CBD
 */

const fs = require('fs');
const path = require('path');

class CBDAnalytics {
    constructor() {
        this.logFile = path.join(__dirname, '../../logs/cbd-sessions.log');
        this.reportFile = path.join(__dirname, '../../reports/cbd-analytics.json');
        this.ensureDirectories();
    }

    ensureDirectories() {
        const dirs = [
            path.dirname(this.logFile),
            path.dirname(this.reportFile)
        ];
        
        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    /**
     * Analyse les logs CBD et génère des métriques
     */
    generateAnalytics() {
        const logs = this.loadLogs();
        const analytics = {
            timestamp: new Date().toISOString(),
            totalSessions: logs.length,
            successRate: this.calculateSuccessRate(logs),
            phaseDistribution: this.analyzePhaseDistribution(logs),
            averageDuration: this.calculateAverageDuration(logs),
            deviationRate: this.calculateDeviationRate(logs),
            topIssues: this.identifyTopIssues(logs),
            trends: this.analyzeTrends(logs),
            recommendations: this.generateRecommendations(logs)
        };

        this.saveReport(analytics);
        return analytics;
    }

    loadLogs() {
        if (!fs.existsSync(this.logFile)) {
            return [];
        }

        try {
            const content = fs.readFileSync(this.logFile, 'utf8');
            return content.split('\n')
                .filter(line => line.trim())
                .map(line => JSON.parse(line))
                .filter(entry => entry.sessionId); // Valider la structure
        } catch (error) {
            console.warn('⚠️ Erreur lecture logs:', error.message);
            return [];
        }
    }

    calculateSuccessRate(logs) {
        if (logs.length === 0) return 0;
        
        const approvedSessions = logs.filter(log => log.decision === 'APPROVED').length;
        return Math.round((approvedSessions / logs.length) * 100);
    }

    analyzePhaseDistribution(logs) {
        const distribution = {};
        
        logs.forEach(log => {
            const phase = log.phase || 'unknown';
            distribution[phase] = (distribution[phase] || 0) + 1;
        });

        return Object.entries(distribution)
            .sort(([,a], [,b]) => b - a)
            .reduce((acc, [phase, count]) => {
                acc[phase] = {
                    count,
                    percentage: Math.round((count / logs.length) * 100)
                };
                return acc;
            }, {});
    }

    calculateAverageDuration(logs) {
        const validDurations = logs
            .map(log => log.duration)
            .filter(duration => duration && duration > 0);

        if (validDurations.length === 0) return 0;

        const average = validDurations.reduce((sum, duration) => sum + duration, 0) / validDurations.length;
        return Math.round(average);
    }

    calculateDeviationRate(logs) {
        if (logs.length === 0) return 0;
        
        const deviationSessions = logs.filter(log => log.hasDeviation).length;
        return Math.round((deviationSessions / logs.length) * 100);
    }

    identifyTopIssues(logs) {
        const issues = {};
        
        logs.forEach(log => {
            if (log.decision !== 'APPROVED') {
                const issue = log.decision;
                issues[issue] = (issues[issue] || 0) + 1;
            }
        });

        return Object.entries(issues)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([issue, count]) => ({
                issue,
                count,
                percentage: Math.round((count / logs.length) * 100)
            }));
    }

    analyzeTrends(logs) {
        // Analyser les tendances sur les 7 derniers jours
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const recentLogs = logs.filter(log => 
            new Date(log.timestamp) > sevenDaysAgo
        );

        const dailyStats = {};
        
        recentLogs.forEach(log => {
            const date = log.timestamp.split('T')[0];
            if (!dailyStats[date]) {
                dailyStats[date] = {
                    total: 0,
                    approved: 0,
                    deviations: 0
                };
            }
            
            dailyStats[date].total++;
            if (log.decision === 'APPROVED') {
                dailyStats[date].approved++;
            }
            if (log.hasDeviation) {
                dailyStats[date].deviations++;
            }
        });

        return Object.entries(dailyStats)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, stats]) => ({
                date,
                ...stats,
                successRate: stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0
            }));
    }

    generateRecommendations(logs) {
        const recommendations = [];
        const successRate = this.calculateSuccessRate(logs);
        const deviationRate = this.calculateDeviationRate(logs);

        if (successRate < 70) {
            recommendations.push({
                priority: 'HIGH',
                message: `Taux de succès faible (${successRate}%). Réviser les templates CBD et la formation.`
            });
        }

        if (deviationRate > 30) {
            recommendations.push({
                priority: 'MEDIUM',
                message: `Taux de déviation élevé (${deviationRate}%). Revoir la planification de la roadmap.`
            });
        }

        const avgDuration = this.calculateAverageDuration(logs);
        if (avgDuration > 5000) { // Plus de 5 secondes
            recommendations.push({
                priority: 'LOW',
                message: `Temps de validation long (${avgDuration}ms). Optimiser les vérifications.`
            });
        }

        if (logs.length < 10) {
            recommendations.push({
                priority: 'INFO',
                message: 'Données insuffisantes pour analyse complète. Continuer à collecter.'
            });
        }

        return recommendations;
    }

    saveReport(analytics) {
        try {
            fs.writeFileSync(this.reportFile, JSON.stringify(analytics, null, 2));
        } catch (error) {
            console.warn('⚠️ Impossible de sauvegarder le rapport:', error.message);
        }
    }

    /**
     * Génère un rapport lisible
     */
    generateHumanReport(analytics) {
        let report = '\n📊 CBD ANALYTICS REPORT\n';
        report += '='.repeat(50) + '\n\n';
        
        report += `📈 MÉTRIQUES GLOBALES:\n`;
        report += `   Sessions totales: ${analytics.totalSessions}\n`;
        report += `   Taux de succès: ${analytics.successRate}%\n`;
        report += `   Taux de déviation: ${analytics.deviationRate}%\n`;
        report += `   Durée moyenne: ${analytics.averageDuration}ms\n\n`;

        if (Object.keys(analytics.phaseDistribution).length > 0) {
            report += `📊 DISTRIBUTION PAR PHASE:\n`;
            Object.entries(analytics.phaseDistribution).forEach(([phase, data]) => {
                report += `   Phase ${phase}: ${data.count} (${data.percentage}%)\n`;
            });
            report += '\n';
        }

        if (analytics.topIssues.length > 0) {
            report += `🚨 PROBLÈMES PRINCIPAUX:\n`;
            analytics.topIssues.forEach((issue, i) => {
                report += `   ${i + 1}. ${issue.issue}: ${issue.count} (${issue.percentage}%)\n`;
            });
            report += '\n';
        }

        if (analytics.trends.length > 0) {
            report += `📈 TENDANCES (7 derniers jours):\n`;
            analytics.trends.forEach(day => {
                report += `   ${day.date}: ${day.total} sessions, ${day.successRate}% succès\n`;
            });
            report += '\n';
        }

        if (analytics.recommendations.length > 0) {
            report += `💡 RECOMMANDATIONS:\n`;
            analytics.recommendations.forEach((rec, i) => {
                const priority = rec.priority === 'HIGH' ? '🔴' : 
                               rec.priority === 'MEDIUM' ? '🟡' : 
                               rec.priority === 'LOW' ? '🟢' : 'ℹ️';
                report += `   ${i + 1}. ${priority} ${rec.message}\n`;
            });
            report += '\n';
        }

        report += `📅 Rapport généré: ${new Date(analytics.timestamp).toLocaleString()}\n`;
        
        return report;
    }

    /**
     * Nettoie les anciens logs (garde les 30 derniers jours)
     */
    cleanOldLogs() {
        const logs = this.loadLogs();
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        const recentLogs = logs.filter(log => 
            new Date(log.timestamp) > thirtyDaysAgo
        );

        if (recentLogs.length < logs.length) {
            try {
                const content = recentLogs.map(log => JSON.stringify(log)).join('\n');
                fs.writeFileSync(this.logFile, content + '\n');
                console.log(`🧹 ${logs.length - recentLogs.length} anciens logs supprimés`);
            } catch (error) {
                console.warn('⚠️ Erreur nettoyage logs:', error.message);
            }
        }
    }
}

// Utilisation CLI
if (require.main === module) {
    const analytics = new CBDAnalytics();
    
    const command = process.argv[2] || 'report';
    
    switch (command) {
        case 'report':
            const data = analytics.generateAnalytics();
            console.log(analytics.generateHumanReport(data));
            break;
            
        case 'clean':
            analytics.cleanOldLogs();
            break;
            
        case 'json':
            const jsonData = analytics.generateAnalytics();
            console.log(JSON.stringify(jsonData, null, 2));
            break;
            
        default:
            console.log(`
📊 CBD Analytics - Usage:

node cbd-analytics.js [command]

Commands:
  report (default) - Génère un rapport lisible
  json            - Génère un rapport JSON
  clean           - Nettoie les anciens logs (>30 jours)

Exemples:
  node cbd-analytics.js
  node cbd-analytics.js json
  node cbd-analytics.js clean
            `);
    }
}

module.exports = CBDAnalytics;
