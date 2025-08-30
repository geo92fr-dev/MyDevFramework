# 📁 src

> Documentation générée automatiquement - 2025-08-30

## 🎯 Vue d'ensemble

**Chemin** : `src`  
**Fichiers documentés** : 3  
**Criticité** : 🔴 HIGH(1) 🟡 MEDIUM(1) 🟢 LOW(1) 
**Catégories** : `auth`  

---

## 📋 Fichiers

| Fichier | Criticité | Description | Dépendances |
|---------|-----------|-------------|--------------|
| `src\lib\auth\manager.js` | 🔴 HIGH | Gère l'authentification Firebase et le store utili | src/lib/firebase/client.ts, src/stores/user.ts |
| `src\lib\auth\manager.js` | 🟡 MEDIUM | Connexion utilisateur via Google OAuth | firebase/auth |
| `src\lib\auth\manager.js` | 🟢 LOW | Déconnexion utilisateur | firebase/auth |

## 🔗 Graphe de Dépendances

### `src\lib\auth\manager.js`
**Dépend de :**
- `src/lib/firebase/client.ts`
- `src/stores/user.ts`

### `src\lib\auth\manager.js`
**Dépend de :**
- `firebase/auth`

### `src\lib\auth\manager.js`
**Dépend de :**
- `firebase/auth`

## 🗺️ Phases Roadmap

Ce dossier concerne les phases : **1**

---

> 🤖 **Documentation automatique**  
> Générée par `npm run docs:generate`  
> Pour mettre à jour : modifier les commentaires `@` dans le code source
