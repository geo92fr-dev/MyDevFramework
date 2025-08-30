# Firebase Authentication - Référence d'implémentation

## 🎯 Objectif

Fournir un système d'authentification sécurisé et moderne pour FunLearning basé sur Firebase Auth avec Google OAuth.

### Problèmes résolus :
- Authentification utilisateur simple et sécurisée
- Gestion des sessions persistantes
- Intégration seamless avec l'écosystème Firebase
- Support des popup OAuth modernes

## 📝 Usage

### Quand l'utiliser :
- Setup initial du projet (Phase 1)
- Intégration d'un nouveau système d'auth
- Migration vers Firebase Auth

### Contexte d'utilisation :
- Applications SvelteKit avec TypeScript
- Projets nécessitant Google OAuth
- Systèmes éducatifs avec gestion d'utilisateurs

### Prérequis :
- Projet Firebase configuré
- SvelteKit installé
- TypeScript configuré

## 🔧 Implémentation

### 1. Configuration Firebase

**Fichier : `src/lib/firebase/client.ts`**
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Development emulators
if (import.meta.env.DEV) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    console.log('Emulators already connected or not available');
  }
}
```

### 2. Variables d'environnement

**Fichier : `.env.local`**
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 3. Store d'authentification

**Fichier : `src/lib/stores/auth.ts`**
```typescript
import { writable } from 'svelte/store';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  type User 
} from 'firebase/auth';
import { auth } from '$lib/firebase/client';

interface AuthStore {
  user: User | null;
  loading: boolean;
  error: string | null;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthStore>({
    user: null,
    loading: true,
    error: null
  });

  // Initialize auth state listener
  onAuthStateChanged(auth, (user) => {
    update(state => ({
      ...state,
      user,
      loading: false
    }));
  });

  return {
    subscribe,
    
    async signInWithGoogle() {
      try {
        update(state => ({ ...state, loading: true, error: null }));
        
        const provider = new GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        
        const result = await signInWithPopup(auth, provider);
        
        update(state => ({
          ...state,
          user: result.user,
          loading: false,
          error: null
        }));
        
        return result.user;
      } catch (error) {
        console.error('Erreur connexion Google:', error);
        
        update(state => ({
          ...state,
          loading: false,
          error: error.message || 'Erreur de connexion'
        }));
        
        throw error;
      }
    },
    
    async signOut() {
      try {
        update(state => ({ ...state, loading: true, error: null }));
        
        await signOut(auth);
        
        update(state => ({
          ...state,
          user: null,
          loading: false,
          error: null
        }));
      } catch (error) {
        console.error('Erreur déconnexion:', error);
        
        update(state => ({
          ...state,
          loading: false,
          error: error.message || 'Erreur de déconnexion'
        }));
      }
    },
    
    clearError() {
      update(state => ({ ...state, error: null }));
    }
  };
}

export const authStore = createAuthStore();
```

### 4. Composant de connexion

**Fichier : `src/lib/components/LoginButton.svelte`**
```svelte
<script lang="ts">
  import { authStore } from '$lib/stores/auth';
  
  $: ({ user, loading, error } = $authStore);
  
  async function handleGoogleSignIn() {
    try {
      await authStore.signInWithGoogle();
    } catch (error) {
      console.error('Erreur de connexion:', error);
    }
  }
  
  async function handleSignOut() {
    try {
      await authStore.signOut();
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  }
  
  function clearError() {
    authStore.clearError();
  }
</script>

<div class="auth-container">
  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
      <span>Connexion en cours...</span>
    </div>
  {:else if user}
    <div class="user-info">
      <img src={user.photoURL} alt={user.displayName} class="avatar" />
      <span class="welcome">Bonjour, {user.displayName}</span>
      <button on:click={handleSignOut} class="btn btn-secondary">
        Déconnexion
      </button>
    </div>
  {:else}
    <button on:click={handleGoogleSignIn} class="btn btn-google">
      <svg class="google-icon" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Se connecter avec Google
    </button>
  {/if}
  
  {#if error}
    <div class="error">
      <span>{error}</span>
      <button on:click={clearError} class="btn-close">✕</button>
    </div>
  {/if}
</div>

<style>
  .auth-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .loading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #666;
  }
  
  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #4285f4;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
  }
  
  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }
  
  .welcome {
    font-weight: 500;
    color: #333;
  }
  
  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .btn-google {
    background: white;
    color: #333;
    border: 1px solid #dadce0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.9rem;
  }
  
  .btn-google:hover {
    box-shadow: 0 1px 2px 0 rgba(60,64,67,.30), 0 1px 3px 1px rgba(60,64,67,.15);
  }
  
  .btn-secondary {
    background: #6c757d;
    color: white;
  }
  
  .btn-secondary:hover {
    background: #5a6268;
  }
  
  .google-icon {
    width: 18px;
    height: 18px;
  }
  
  .error {
    background: #f8d7da;
    color: #721c24;
    padding: 0.75rem;
    border-radius: 4px;
    border: 1px solid #f5c6cb;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .btn-close {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: #721c24;
  }
</style>
```

### 5. Protection des routes

**Fichier : `src/lib/auth/requireAuth.ts`**
```typescript
import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/firebase/client';

export async function requireAuth() {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      
      if (user) {
        resolve(user);
      } else {
        reject(redirect(307, '/login'));
      }
    });
    
    // Timeout après 5 secondes
    setTimeout(() => {
      unsubscribe();
      reject(redirect(307, '/login'));
    }, 5000);
  });
}
```

## 🧪 Tests

### Test unitaire du store

**Fichier : `src/lib/stores/auth.test.ts`**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { authStore } from './auth';

// Mock Firebase
vi.mock('$lib/firebase/client', () => ({
  auth: {
    onAuthStateChanged: vi.fn(),
    signInWithPopup: vi.fn(),
    signOut: vi.fn()
  }
}));

describe('AuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait initialiser avec loading=true', () => {
    const state = get(authStore);
    expect(state.loading).toBe(true);
    expect(state.user).toBe(null);
    expect(state.error).toBe(null);
  });

  it('devrait gérer la connexion Google', async () => {
    const mockUser = { uid: '123', displayName: 'Test User' };
    
    // Mock signInWithPopup
    vi.mocked(auth.signInWithPopup).mockResolvedValue({
      user: mockUser
    });

    await authStore.signInWithGoogle();
    
    const state = get(authStore);
    expect(state.user).toEqual(mockUser);
    expect(state.loading).toBe(false);
    expect(state.error).toBe(null);
  });

  it('devrait gérer les erreurs de connexion', async () => {
    const mockError = new Error('Connection failed');
    
    vi.mocked(auth.signInWithPopup).mockRejectedValue(mockError);

    try {
      await authStore.signInWithGoogle();
    } catch (error) {
      // Expected
    }
    
    const state = get(authStore);
    expect(state.user).toBe(null);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Connection failed');
  });
});
```

### Test d'intégration

**Fichier : `src/routes/login/+page.test.ts`**
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import LoginPage from './+page.svelte';

describe('Page de connexion', () => {
  it('devrait afficher le bouton de connexion Google', () => {
    render(LoginPage);
    
    const googleButton = screen.getByText('Se connecter avec Google');
    expect(googleButton).toBeInTheDocument();
  });

  it('devrait déclencher la connexion au clic', async () => {
    render(LoginPage);
    
    const googleButton = screen.getByText('Se connecter avec Google');
    await fireEvent.click(googleButton);
    
    // Vérifier que l'état de chargement est activé
    expect(screen.getByText('Connexion en cours...')).toBeInTheDocument();
  });
});
```

## 📚 Liens

- **Roadmap principale** : [DOC_ROADMAP_LEARNING.md](../../DOC_ROADMAP_LEARNING.md#phase-1)
- **Référence Google OAuth** : [google-oauth.md](./google-oauth.md)
- **Référence Session Management** : [session-management.md](./session-management.md)
- **Documentation Firebase Auth** : https://firebase.google.com/docs/auth
- **SvelteKit Auth Guide** : https://kit.svelte.dev/docs/authentication

## 🔄 Historique des versions

- **v1.0.0** - Implémentation initiale Firebase Auth + Google OAuth
- **v1.0.1** - Ajout gestion d'erreurs améliorée
- **v1.0.2** - Support des émulateurs de développement
- **v1.1.0** - Intégration protection des routes

## 🤝 Contribution

Pour modifier cette référence :
1. Valider les tests existants
2. Ajouter des tests pour les nouvelles fonctionnalités
3. Mettre à jour la documentation
4. Tester l'intégration avec les autres phases
