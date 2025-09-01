# Documentation des Bonnes Pratiques Copilot - MyDevFramework v2.2

## 🎯 Objectif
Ce document recense les meilleures pratiques pour travailler efficacement avec GitHub Copilot dans le contexte de MyDevFramework, incluant les méthodologies TDD, les validations de sécurité, et la **gestion critique des biais et erreurs de l'IA**.

## 📋 Bonnes Pratiques

### 1. Structure de Code
- Utiliser des noms de variables explicites
- Commenter les fonctions complexes
- Organiser le code en modules logiques
- **Séparer les concerns** : stores, utils, components, tests
- **TypeScript strict** obligatoire pour la sécurité

### 2. Prompts Efficaces
- Être spécifique dans les demandes
- Fournir le contexte nécessaire
- Utiliser des exemples concrets
- **Mentionner TDD** dans les prompts de développement
- **Spécifier les validations** requises (URL, email, etc.)
- **Poser des questions clarifiantes** : Si des informations essentielles pour générer une réponse de haute qualité (par exemple, des contraintes techniques, des dépendances, des objectifs de sécurité) sont manquantes, pose-moi une question pour obtenir ces informations au lieu de faire des hypothèses.

#### ⚠️ **Gestion des Biais et Erreurs de l'IA**

**🔍 Principe Fondamental** : L'IA peut générer du code qui semble syntaxiquement correct mais contient des erreurs logiques, de sécurité ou de performance subtiles. **Une vérification critique est TOUJOURS nécessaire**.

#### Biais et Limitations Courants :

**1. Biais de Popularité** :
```typescript
// ❌ L'IA peut suggérer des patterns populaires mais inadaptés
// Exemple : Utilisation systématique d'useEffect même quand inutile
useEffect(() => {
  setCount(count + 1); // ❌ Problème de closure, re-render infini
}, []);

// ✅ Solution appropriée après vérification
const handleIncrement = useCallback(() => {
  setCount(prev => prev + 1);
}, []);
```

**2. Erreurs de Sécurité Subtiles** :
```typescript
// ❌ Code généré par IA qui semble correct mais vulnérable
function sanitizeInput(input: string): string {
  return input.replace(/<script>/g, ''); // ❌ Contournement possible
}

// ✅ Après vérification et correction
import DOMPurify from 'dompurify';
function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}
```

**3. Logique Business Incorrecte** :
```typescript
// ❌ L'IA peut ne pas comprendre le contexte métier
function calculateDiscount(price: number, userType: 'premium' | 'standard'): number {
  if (userType === 'premium') {
    return price * 0.8; // ❌ 20% de réduction peut être incorrecte selon les règles business
  }
  return price;
}

// ✅ Vérification avec les règles métier réelles
function calculateDiscount(price: number, userType: 'premium' | 'standard'): number {
  const discountRules = getBusinessDiscountRules(); // Règles centralisées
  return applyDiscount(price, userType, discountRules);
}
```

#### **🛡️ Stratégies de Vérification Obligatoires** :

**1. Revue Systématique** :
```
✅ Checklist de vérification du code IA :
- [ ] Logique métier conforme aux spécifications
- [ ] Pas de vulnérabilités de sécurité évidentes
- [ ] Gestion d'erreurs appropriée
- [ ] Performance acceptable (pas de boucles infinies, N+1, etc.)
- [ ] Tests unitaires couvrant les edge cases
- [ ] Conformité aux standards du projet
- [ ] Documentation claire des choix d'implémentation
```

**2. Tests Contradictoires** :
```typescript
// Toujours tester les cas que l'IA pourrait manquer
describe('AI Generated Function Verification', () => {
  it('should handle edge cases that AI might miss', () => {
    // Test avec des données limites
    expect(validateEmail('')).toBe(false);
    expect(validateEmail(null)).toBe(false);
    expect(validateEmail(undefined)).toBe(false);
    expect(validateEmail('a'.repeat(1000) + '@test.com')).toBe(false);
  });
  
  it('should prevent security vulnerabilities', () => {
    // Test contre les attaques que l'IA pourrait ignorer
    const maliciousInputs = [
      '<img src=x onerror=alert(1)>',
      'javascript:alert(1)',
      '${7*7}', // Template injection
      '\u0000' // Null byte injection
    ];
    
    maliciousInputs.forEach(input => {
      expect(() => processUserInput(input)).not.toThrow();
      expect(processUserInput(input)).not.toContain('script');
    });
  });
});
```

**3. Pair Programming avec l'IA** :
```
🤝 Approche recommandée :
1. Demander à l'IA de générer le code
2. Demander à l'IA d'identifier les problèmes potentiels de ce même code
3. Comparer les deux réponses
4. Faire une revue manuelle final
5. Implémenter des tests de sécurité spécifiques
```

#### **📚 Prompts de Vérification** :

```
🔍 Prompt d'auto-critique :
"Analyse ce code que tu viens de générer et identifie tous les problèmes potentiels :
- Vulnérabilités de sécurité
- Erreurs logiques subtiles  
- Problèmes de performance
- Edge cases non gérés
- Violations des bonnes pratiques

[Code à analyser]"

🛡️ Prompt de test de sécurité :
"Génère des tests unitaires pour identifier les failles de sécurité 
de cette fonction, en particulier : injection, XSS, overflow, 
validation insuffisante, et contournement d'autorisation.

[Code à tester]"

⚡ Prompt d'optimisation :
"Révise ce code pour les problèmes de performance cachés :
- Complexité algorithmique
- Memory leaks potentiels
- Opérations bloquantes
- Requêtes inefficaces

[Code à optimiser]"
```

#### Exemples de prompts de qualité :
```
❌ Mauvais prompt : "Créer une fonction de validation"

✅ Bon prompt : "Créer une fonction de validation d'email avec TDD, 
   incluant la sanitisation DOMPurify et les tests de sécurité 
   contre les attaques XSS. Quelles sont les contraintes spécifiques 
   pour le domaine email ?"

✅ Prompt avec clarification : "Implémenter l'authentification Firebase. 
   Dois-je utiliser Google OAuth uniquement ou inclure email/password ? 
   Y a-t-il des contraintes RGPD à respecter ?"
```

### 3. Méthodologie TDD (Test-Driven Development)
#### 🔴 Phase Rouge - Écrire les tests en premier
```typescript
// Exemple : Tests avant implémentation
describe('Firebase Stores', () => {
  it('should validate user profile creation', async () => {
    const profileData = { email: 'test@example.com', displayName: 'Test' };
    const result = await createUserProfile(profileData);
    expect(result).toBeDefined();
    expect(result.email).toBe('test@example.com');
  });
});
```

#### 🟢 Phase Verte - Implémentation minimale
```typescript
// Implémentation qui fait passer les tests
export async function createUserProfile(data: ProfileData): Promise<UserProfile> {
  // Validation des données
  const validation = validateFirestoreData('user', data);
  if (!validation.success) throw new Error(validation.error);
  
  // Opération Firebase
  return await handleFirestoreOperation(async () => {
    // Implementation...
  });
}
```

#### 🔄 Phase Refactoring - Amélioration du code
- Optimiser la performance
- Améliorer la lisibilité
- Ajouter la documentation
- Renforcer les validations

### 4. Validation et Sécurité

#### 🔒 Validation des URLs
```typescript
// Fonction de validation URL robuste
export function validateURL(url: string, options: {
  allowedProtocols?: string[];
  allowedDomains?: string[];
  maxLength?: number;
} = {}): { isValid: boolean; error?: string } {
  const {
    allowedProtocols = ['http:', 'https:'],
    allowedDomains = [],
    maxLength = 2048
  } = options;

  // Vérification longueur
  if (url.length > maxLength) {
    return { isValid: false, error: `URL trop longue (max: ${maxLength})` };
  }

  try {
    const urlObj = new URL(url);
    
    // Vérification protocole
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return { isValid: false, error: `Protocole non autorisé: ${urlObj.protocol}` };
    }
    
    // Vérification domaine si spécifié
    if (allowedDomains.length > 0 && !allowedDomains.includes(urlObj.hostname)) {
      return { isValid: false, error: `Domaine non autorisé: ${urlObj.hostname}` };
    }
    
    // Vérifications sécurité supplémentaires
    if (urlObj.hostname === 'localhost' && urlObj.protocol === 'https:') {
      return { isValid: false, error: 'HTTPS localhost non autorisé' };
    }
    
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'URL malformée' };
  }
}

// Usage dans Zod schemas
const urlValidation = z.string().refine(
  (url) => validateURL(url, { allowedProtocols: ['https:'] }).isValid,
  { message: 'URL invalide ou non sécurisée' }
);
```

#### 🛡️ Sanitisation des entrées utilisateur
```typescript
import DOMPurify from 'dompurify';

// Sanitisation obligatoire
export function sanitizeUserInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
    ALLOWED_ATTR: []
  });
}

// Validation email avec regex sécurisée
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
}
```

#### 🔍 Validation des données Firebase
```typescript
// Validation avec Zod avant toute opération Firestore
export function validateFirestoreData(
  collection: string, 
  data: unknown
): { success: boolean; error?: string } {
  try {
    switch (collection) {
      case 'users':
        UserProfileSchema.parse(data);
        break;
      case 'courses':
        CourseSchema.parse(data);
        break;
      default:
        return { success: false, error: `Collection inconnue: ${collection}` };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### 5. Tests et Couverture
- **TDD obligatoire** pour les fonctions critiques
- **Mocks Firebase** pour l'isolation des tests
- **Couverture minimum** : 85% (objectif: 90%)
- **Tests de sécurité** pour les validations
- **Tests d'intégration** pour les stores réactifs

#### Exemple de test complet :
```typescript
describe('URL Validation Security', () => {
  it('should reject malicious URLs', () => {
    const maliciousUrls = [
      'javascript:alert("xss")',
      'data:text/html,<script>alert("xss")</script>',
      'ftp://malicious.com/file',
      'http://' + 'a'.repeat(3000) // URL trop longue
    ];
    
    maliciousUrls.forEach(url => {
      const result = validateURL(url);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
  
  it('should accept valid secure URLs', () => {
    const validUrls = [
      'https://example.com',
      'https://subdomain.example.com/path?query=value'
    ];
    
    validUrls.forEach(url => {
      const result = validateURL(url, { allowedProtocols: ['https:'] });
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
});
```

### 6. Architecture Firebase

#### 🔥 Stores Réactifs Svelte
```typescript
// Pattern recommandé pour les stores Firebase
import { writable, derived } from 'svelte/store';
import { handleFirestoreOperation } from './utils';

export const userProfileStore = writable<UserProfile | null>(null);

export const isAuthenticatedStore = derived(
  authUserStore,
  ($authUser) => $authUser !== null
);

// Fonctions async pour les opérations CRUD
export async function createUserProfile(data: ProfileData): Promise<UserProfile> {
  const result = await handleFirestoreOperation(async () => {
    // Validation obligatoire
    const validation = validateFirestoreData('user', data);
    if (!validation.success) throw new Error(validation.error);
    
    // Opération sécurisée
    const sanitizedData = sanitizeUserInput(data);
    return await setDoc(doc(getDb(), 'users', userId), sanitizedData);
  });
  
  if (!result.success) throw new Error(result.error);
  return result.data;
}
```

#### 🛡️ Security Rules Firebase
```javascript
// Règles de sécurité obligatoires
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Validation côté serveur
    function isValidEmail(email) {
      return email.matches('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$');
    }
    
    function isValidURL(url) {
      return url.matches('^https://[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}.*$');
    }
    
    match /users/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId
        && isValidEmail(resource.data.email)
        && (resource.data.photoURL == null || isValidURL(resource.data.photoURL));
    }
  }
}
```

### 7. Maintenance et Documentation
- **Documenter les modifications** avec des commentaires explicites
- **Maintenir la cohérence** du style de code
- **Refactoriser régulièrement** selon le cycle TDD
- **Versioning** des schemas et APIs
- **Changelog** détaillé pour chaque phase

### 8. Gestion d'Erreurs Robuste
```typescript
// Pattern de gestion d'erreur recommandé
export async function handleFirestoreOperation<T>(
  operation: () => Promise<T>
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    console.error('Erreur Firestore:', error);
    
    // Gestion spécifique des erreurs Firebase
    if (error.code === 'permission-denied') {
      return { success: false, error: 'Permissions insuffisantes' };
    }
    if (error.code === 'network-request-failed') {
      return { success: false, error: 'Erreur de connexion' };
    }
    
    return { success: false, error: 'Une erreur inattendue s\'est produite' };
  }
}
```

#### 📚 Ressources pour éviter les erreurs courantes :
- **Logs détaillés** : Utiliser des niveaux de log appropriés (error, warn, info, debug)
- **Monitoring** : Implémenter des alertes pour les erreurs critiques
- **Fallbacks** : Prévoir des valeurs par défaut et des états de dégradation gracieuse
- **Testing** : Tester explicitement les cas d'erreur avec des mocks appropriés

### 9. Anti-Patterns à Éviter

#### ❌ Problèmes Courants et Leurs Solutions

Cette section présente les erreurs les plus fréquentes rencontrées dans le développement et leurs corrections appropriées.

#### **1. Validation des entrées en frontend uniquement**

❌ **Mauvais** :
```typescript
// Seule validation côté client (facilement contournable)
function handleEmailSubmit(email: string) {
  if (!email.includes('@')) {
    alert('Email invalide');
    return;
  }
  // Envoi direct sans validation serveur
  await updateUserEmail(email);
}
```

✅ **Bon** :
```typescript
// Validation côté client ET serveur
import { z } from 'zod';

const EmailSchema = z.string().email().max(254);

function validateEmail(email: string): { isValid: boolean; error?: string } {
  const result = EmailSchema.safeParse(email);
  return result.success 
    ? { isValid: true }
    : { isValid: false, error: result.error.issues[0].message };
}

async function handleEmailSubmit(email: string) {
  // Validation côté client
  const validation = validateEmail(email);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  
  // + Firebase Security Rules pour validation serveur
  await updateUserEmail(email);
}
```

#### **2. Gestion d'erreurs silencieuse**

❌ **Mauvais** :
```typescript
try {
  await updateDoc(userRef, { email: newEmail });
} catch (error) {
  console.log(error); // ❌ Erreur ignorée, utilisateur non informé
}
```

✅ **Bon** :
```typescript
try {
  await updateDoc(userRef, { email: newEmail });
} catch (error) {
  console.error('Erreur mise à jour utilisateur:', error);
  
  // Gestion spécifique par type d'erreur
  if (error.code === 'permission-denied') {
    throw new Error('Permissions insuffisantes pour modifier cet utilisateur');
  }
  if (error.code === 'network-request-failed') {
    throw new Error('Erreur de connexion. Vérifiez votre réseau');
  }
  
  // Erreur générique pour les cas non prévus
  throw new Error('Échec de la mise à jour du profil utilisateur');
}
```

#### **3. Stockage de données sensibles en clair**

❌ **Mauvais** :
```typescript
// Stockage non sécurisé dans localStorage
localStorage.setItem('userToken', token);
localStorage.setItem('userPassword', password); // ❌ Extremely dangerous
```

✅ **Bon** :
```typescript
// Utiliser des solutions sécurisées
import { writable } from 'svelte/store';

// Store en mémoire pour les données sensibles
export const authTokenStore = writable<string | null>(null);

// Pour la persistance : utiliser httpOnly cookies côté serveur
export async function storeTokenSecurely(token: string) {
  // Option 1: Cookie httpOnly via API
  await fetch('/api/auth/token', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  
  // Option 2: Store chiffré si nécessaire côté client
  const encryptedToken = await encryptData(token);
  sessionStorage.setItem('enc_token', encryptedToken);
}
```

#### **4. Requêtes Firestore non optimisées**

❌ **Mauvais** :
```typescript
// Récupère TOUS les utilisateurs (coûteux et lent)
async function getUsers() {
  const allUsers = await getDocs(collection(db, 'users'));
  return allUsers.docs.map(doc => doc.data());
}

// Filtre côté client après récupération complète
const activeUsers = users.filter(user => user.status === 'active');
```

✅ **Bon** :
```typescript
// Filtre côté serveur + pagination
async function getActiveUsers(lastDoc?: DocumentSnapshot, pageSize = 20) {
  let baseQuery = query(
    collection(db, 'users'),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  
  // Pagination
  if (lastDoc) {
    baseQuery = query(baseQuery, startAfter(lastDoc));
  }
  
  const snapshot = await getDocs(baseQuery);
  return {
    users: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    lastDoc: snapshot.docs[snapshot.docs.length - 1],
    hasMore: snapshot.docs.length === pageSize
  };
}
```

#### **5. Tests non déterministes et vagues**

❌ **Mauvais** :
```typescript
it('should create a user', async () => {
  const user = await createUser({ email: 'test@example.com' });
  expect(user.email).toBeTruthy(); // ❌ Trop vague
  expect(user.id).toBeDefined(); // ❌ Ne teste pas la valeur
});

// Test avec données aléatoires (non reproductible)
it('should validate random email', () => {
  const randomEmail = Math.random() + '@test.com';
  expect(validateEmail(randomEmail)).toBe(true); // ❌ Imprévisible
});
```

✅ **Bon** :
```typescript
describe('User Creation', () => {
  it('should create user with valid email and return complete profile', async () => {
    // Données de test précises et reproductibles
    const testEmail = 'john.doe@example.com';
    const expectedData = {
      email: testEmail,
      displayName: 'John Doe',
      role: 'student'
    };
    
    const user = await createUser(expectedData);
    
    // Assertions précises
    expect(user.email).toBe(testEmail);
    expect(user.displayName).toBe('John Doe');
    expect(user.role).toBe('student');
    expect(user.id).toMatch(/^[a-zA-Z0-9]{20,}$/); // Format ID Firebase
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(validateEmail(user.email)).toBe(true);
  });
  
  it('should reject invalid email formats', async () => {
    const invalidEmails = [
      'invalid-email',
      '@missing-local.com',
      'missing-domain@',
      'spaces in@email.com',
      'toolong' + 'a'.repeat(250) + '@example.com'
    ];
    
    for (const email of invalidEmails) {
      await expect(createUser({ email }))
        .rejects
        .toThrow('Email invalide');
    }
  });
});
```

#### **6. Stores Svelte mal conçus**

❌ **Mauvais** :
```typescript
// Store global muable sans protection
export let globalUser = null;

// Fonction qui modifie directement l'état
export function updateUser(newData) {
  globalUser = { ...globalUser, ...newData }; // ❌ Mutation directe
}

// Pas de validation ni de gestion d'erreurs
export async function loadUser(id) {
  const doc = await getDoc(userRef);
  globalUser = doc.data(); // ❌ Peut être undefined
}
```

✅ **Bon** :
```typescript
import { writable, derived } from 'svelte/store';
import type { UserProfile } from '../types';

// Store typé et encapsulé
export const userProfileStore = writable<UserProfile | null>(null);

// Store dérivé pour l'état d'authentification
export const isAuthenticatedStore = derived(
  userProfileStore,
  ($userProfile) => $userProfile !== null
);

// Fonction pure avec validation et gestion d'erreurs
export async function updateUserProfile(
  userId: string, 
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  // Validation des données
  const validation = validateFirestoreData('users', updates);
  if (!validation.success) {
    throw new Error(`Données invalides: ${validation.error}`);
  }
  
  // Opération sécurisée
  const result = await handleFirestoreOperation(async () => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);
    
    const updatedDoc = await getDoc(userRef);
    if (!updatedDoc.exists()) {
      throw new Error('Utilisateur introuvable après mise à jour');
    }
    
    return updatedDoc.data() as UserProfile;
  });
  
  if (result.success && result.data) {
    userProfileStore.set(result.data);
    return result.data;
  } else {
    throw new Error(result.error || 'Échec de la mise à jour');
  }
}
```

#### **7. Firebase Security Rules permissives**

❌ **Mauvais** :
```javascript
// Règles trop permissives - DANGEREUX
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // ❌ Accès total à tous
    }
  }
}
```

✅ **Bon** :
```javascript
// Règles strictes avec validation
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Fonctions de validation
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isValidEmail(email) {
      return email.matches('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
        && email.size() <= 254;
    }
    
    function isValidUserData(data) {
      return data.keys().hasAll(['email', 'displayName', 'role'])
        && isValidEmail(data.email)
        && data.displayName is string
        && data.displayName.size() >= 2
        && data.displayName.size() <= 50
        && data.role in ['student', 'instructor', 'admin'];
    }
    
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId) 
        && isValidUserData(resource.data);
      allow update: if isOwner(userId) 
        && isValidUserData(resource.data)
        && resource.data.role == request.auth.token.role; // Pas de changement de rôle
    }
    
    match /courses/{courseId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthenticated() 
        && request.auth.token.role in ['instructor', 'admin'];
    }
  }
}
```

### 10. Code Review Assisté par IA

#### 🔍 Utilisation de Copilot pour les Code Reviews
Intégrer GitHub Copilot dans le processus de révision de code pour améliorer la qualité et détecter les problèmes automatiquement.

#### Prompts de Code Review Recommandés :

```
🔒 Analyse de Sécurité :
"Révise ce pull request pour identifier les vulnérabilités de sécurité, 
en particulier : injection SQL, XSS, CSRF, validation des entrées manquante, 
et exposition de données sensibles."

⚡ Analyse de Performance :
"Analyse ce code pour les problèmes de performance : 
boucles inefficaces, requêtes N+1, memory leaks, 
opérations synchrones bloquantes, et optimisations possibles."

🧪 Qualité des Tests :
"Évalue la couverture de tests de ce PR : 
tests manquants, edge cases non couverts, 
mocks inappropriés, et assertions insuffisantes."

🏗️ Architecture et Design :
"Révise l'architecture de ce code : 
violations SOLID, couplage fort, responsabilités mal définies, 
et opportunités de refactoring."
```

#### Checklist de Code Review Assisté :

**🔒 Sécurité** :
```
Prompt : "Analyse de sécurité complète pour ce PR"
- [ ] Validation des entrées utilisateur
- [ ] Sanitisation des données (DOMPurify)
- [ ] Gestion sécurisée des tokens/API keys
- [ ] Protection contre XSS/CSRF
- [ ] Validation des URLs et emails
- [ ] Respect des Firebase Security Rules
```

**⚡ Performance** :
```
Prompt : "Analyse de performance et optimisation"
- [ ] Pas de boucles N+1 dans les requêtes
- [ ] Utilisation appropriée des indexes
- [ ] Lazy loading implémenté
- [ ] Bundle size optimisé
- [ ] Memory leaks évités
- [ ] Caching approprié
```

**🧪 Tests et Qualité** :
```
Prompt : "Évaluation de la couverture de tests TDD"
- [ ] Tests unitaires pour les nouvelles fonctions
- [ ] Tests d'intégration pour les stores
- [ ] Tests de sécurité pour les validations
- [ ] Mocks appropriés pour Firebase
- [ ] Edge cases couverts
- [ ] Couverture > 85%
```

**📚 Documentation et Maintenabilité** :
```
Prompt : "Révision de la documentation et maintenabilité"
- [ ] Fonctions complexes documentées
- [ ] Types TypeScript stricts
- [ ] Nommage explicite des variables
- [ ] Architecture respectée (stores/utils/components)
- [ ] Changelog mis à jour
- [ ] Breaking changes documentés
```

#### Exemple d'utilisation pratique :

**Avant le merge** :
```typescript
// Prompt pour Copilot :
"Révise ce code Firebase store pour sécurité et performance :

export async function updateUserProfile(userId: string, data: Partial<UserProfile>) {
  const userDoc = doc(db, 'users', userId);
  await updateDoc(userDoc, data);
  userProfileStore.set(data);
}

Identifie les problèmes de sécurité, performance et suggestions d'amélioration."
```

**Réponse attendue de Copilot** :
- ❌ Pas de validation des données d'entrée
- ❌ Pas de gestion d'erreurs  
- ❌ Pas de sanitisation
- ❌ Store mis à jour avec données partielles
- ✅ Suggestions d'amélioration avec code corrigé

#### Intégration dans le Workflow :

**1. Pre-commit hooks** :
```bash
# Script .git/hooks/pre-commit
npx copilot-cli review --security --performance ./src
```

**2. GitHub Actions** :
```yaml
- name: AI Code Review
  run: |
    gh copilot review pull-request ${{ github.event.number }} \
      --focus security,performance,tests
```

**3. Template de PR** :
```markdown
## Code Review AI Checklist
- [ ] Analyse sécurité Copilot exécutée
- [ ] Analyse performance Copilot exécutée  
- [ ] Tests TDD validés par Copilot
- [ ] Documentation vérifiée par Copilot

### Prompts utilisés :
- Security: `[prompt sécurité utilisé]`
- Performance: `[prompt performance utilisé]`
- Tests: `[prompt tests utilisé]`
```

## 🔧 Outils Recommandés

### Développement
- **TypeScript 5.0+** avec mode strict obligatoire
- **SvelteKit 1.20+** pour le framework frontend
- **Vite 4.0+** pour le build et développement
- **ESLint** avec règles de sécurité
- **Prettier** pour le formatage automatique

### Testing
- **Vitest** pour les tests unitaires et d'intégration
- **Playwright** pour les tests E2E
- **Firebase Emulator** pour les tests locaux
- **Coverage minimum** : 85% (objectif: 90%)

### Code Review et Qualité
- **GitHub Copilot CLI** pour les code reviews automatisés
- **Pre-commit hooks** avec analyse Copilot
- **Templates PR** avec checklist Copilot
- **GitHub Actions** intégrées pour analyse continue

### Sécurité
- **DOMPurify** pour la sanitisation HTML
- **Zod** pour la validation des données
- **Firebase Security Rules** côté serveur
- **HTTPS obligatoire** en production

### Firebase
- **Firebase v9+** avec SDK modulaire
- **Firestore** avec converters TypeScript
- **Firebase Auth** avec validation email
- **Firebase Hosting** pour le déploiement

## 📚 Ressources et Documentation

### Documentation Officielle
- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Guides de Bonnes Pratiques
- [TDD Best Practices](https://kentcdodds.com/blog/how-to-know-what-to-test)
- [Firebase Security Guidelines](https://firebase.google.com/docs/rules/security)
- [Svelte Store Patterns](https://svelte.dev/docs#run-time-svelte-store)

### Outils de Qualité
- [ESLint Security Plugin](https://github.com/eslint-community/eslint-plugin-security)
- [Zod Schema Validation](https://zod.dev/)
- [DOMPurify Sanitization](https://github.com/cure53/DOMPurify)

## 🎯 Checklist de Qualité

### Avant chaque commit :
- [ ] Tests TDD passent (minimum 85% couverture)
- [ ] TypeScript compile sans erreurs
- [ ] ESLint ne remonte aucune erreur critique
- [ ] Validations de sécurité implémentées
- [ ] Documentation mise à jour
- [ ] Performance vérifiée (build < 5s)
- [ ] **Code review Copilot exécuté** (sécurité + performance)
- [ ] **Anti-patterns vérifiés** : pas de validation frontend seule, gestion d'erreurs appropriée
- [ ] **🔍 Vérification critique du code IA** : logique métier, sécurité, edge cases testés

### Avant chaque Pull Request :
- [ ] **Analyse sécurité Copilot** : vulnérabilités identifiées et corrigées
- [ ] **Analyse performance Copilot** : optimisations appliquées
- [ ] **Analyse tests Copilot** : couverture et edge cases validés
- [ ] **Analyse architecture Copilot** : design patterns respectés
- [ ] **Vérification anti-patterns** : stores sécurisés, requêtes optimisées, tests déterministes
- [ ] **⚠️ Auto-critique IA** : code généré re-analysé pour biais et erreurs subtiles
- [ ] **🛡️ Tests contradictoires** : edge cases et tentatives d'attaque implémentés
- [ ] Template PR complété avec prompts utilisés
- [ ] Breaking changes documentés

### Avant chaque déploiement :
- [ ] Tests E2E passent
- [ ] Firebase Security Rules validées et restrictives
- [ ] URLs et entrées utilisateur sanitisées
- [ ] Gestion d'erreurs robuste avec fallbacks
- [ ] Backup des données critiques
- [ ] Monitoring et logging activés
- [ ] **Code review final Copilot** sur la branche de production
- [ ] **Audit sécurité final** : pas de données sensibles en localStorage, Security Rules strictes
- [ ] **🔍 Vérification finale anti-biais** : logique business validée par des humains

---

**Version** : 2.2 (Septembre 2025)
**Dernière mise à jour** : Intégration TDD + Validations de sécurité + Anti-Patterns + **Gestion des Biais IA**
**Prochaine révision** : Phase 6 - Optimisations avancées
