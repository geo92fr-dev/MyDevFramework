# Realtime System - Référence d'implémentation

## 🎯 Objectif

Fournir un système de données réactives temps réel pour FunLearning, permettant la synchronisation automatique entre Firebase Firestore et l'interface utilisateur Svelte.

### Problèmes résolus :
- Synchronisation automatique des données en temps réel
- Gestion intelligente du cache avec invalidation
- Interface utilisateur toujours à jour sans rechargement
- Optimisation des performances avec écoute ciblée

## 📝 Usage

### Quand l'utiliser :
- Affichage de listes de contenu éducatif (compétences, cours)
- Tableaux de bord dynamiques
- Systèmes collaboratifs nécessitant des mises à jour temps réel

### Contexte d'utilisation :
- Applications SvelteKit avec Firebase Firestore
- Interfaces nécessitant une réactivité temps réel
- Systèmes avec gestion de cache intelligent

### Prérequis :
- Firebase Firestore configuré
- Stores Svelte
- Système d'authentification en place

## 🔧 Implémentation

### 1. Types et interfaces

**Fichier : `src/lib/types/realtime.ts`**
```typescript
import { writable, type Writable } from 'svelte/store';
import type { Unsubscribe } from 'firebase/firestore';

export interface RealtimeStore<T> {
  subscribe: Writable<T[]>['subscribe'];
  loading: Writable<boolean>;
  error: Writable<string | null>;
  unsubscribe: () => void;
  refresh: () => void;
}

export interface SearchFilters {
  niveauIds?: string[];
  matiereIds?: string[];
  difficultes?: string[];
  tags?: string[];
  status?: string[];
  dureeMin?: number;
  dureeMax?: number;
  [key: string]: any; // Extensibilité future
}

export interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

export interface InvalidationRule {
  trigger: 'update' | 'delete' | 'time' | 'dependency';
  target: string;
  pattern?: string;
  cascadeRules?: string[];
}
```

### 2. Cache intelligent

**Fichier : `src/lib/realtime/SmartCache.ts`**
```typescript
export class SmartCache {
  private cache = new Map<string, CacheEntry>();
  private listeners = new Map<string, Set<() => void>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, ttl = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    this.notifyListeners(key);
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      this.notifyListeners(key);
      return null;
    }
    
    return cached.data;
  }

  invalidatePattern(pattern: string): void {
    const keysToDelete: string[] = [];
    for (const [key] of this.cache) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.notifyListeners(key);
    });
  }

  onInvalidate(key: string, callback: () => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    
    this.listeners.get(key)!.add(callback);
    
    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  private notifyListeners(key: string): void {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach(callback => callback());
    }
  }

  clear(): void {
    this.cache.clear();
    this.listeners.forEach(listeners => listeners.clear());
    this.listeners.clear();
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}
```

### 3. Gestionnaire de données temps réel

**Fichier : `src/lib/realtime/RealtimeDataManager.ts`**
```typescript
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  type QueryConstraint,
  type Unsubscribe 
} from 'firebase/firestore';
import { writable } from 'svelte/store';
import { db } from '$lib/firebase/client';
import type { RealtimeStore, SearchFilters } from '$lib/types/realtime';

export class RealtimeDataManager {
  private activeSubscriptions = new Map<string, Unsubscribe>();
  private stores = new Map<string, any>();

  createCompetencesStore(filters: SearchFilters = {}): RealtimeStore<CompetenceEnriched> {
    const storeKey = `competences-${JSON.stringify(filters)}`;
    
    if (this.stores.has(storeKey)) {
      return this.stores.get(storeKey);
    }

    const dataStore = writable<CompetenceEnriched[]>([]);
    const loadingStore = writable<boolean>(true);
    const errorStore = writable<string | null>(null);

    const setupListener = () => {
      const constraints: QueryConstraint[] = [];
      
      // Appliquer les filtres dynamiquement
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value) && value.length > 0) {
            constraints.push(where(key, 'in', value));
          } else if (!Array.isArray(value)) {
            constraints.push(where(key, '==', value));
          }
        }
      });

      constraints.push(orderBy('ordre'));
      
      const q = query(collection(db, 'competences'), ...constraints);
      
      const unsubscribe = onSnapshot(
        q,
        async (snapshot) => {
          try {
            loadingStore.set(true);
            errorStore.set(null);

            // Traitement des changements en temps réel
            const competences: CompetenceEnriched[] = [];
            const promises = snapshot.docs.map(async (docSnapshot) => {
              let data = docSnapshot.data();
              
              // Migration automatique si nécessaire
              if (!data.version || data.version !== CURRENT_DATA_VERSION) {
                data = await this.migrateData(data, data.version || '1.0.0');
              }

              // Enrichissement des données
              const enriched = await this.enrichCompetenceData({
                id: docSnapshot.id,
                ...data
              } as Competence);

              return enriched;
            });

            const results = await Promise.all(promises);
            dataStore.set(results.filter(Boolean));
            loadingStore.set(false);
            
            // Log pour debugging
            console.log(`🔄 Mise à jour temps réel: ${results.length} compétences chargées`);
            
          } catch (error) {
            console.error('Erreur temps réel compétences:', error);
            errorStore.set(error.message);
            loadingStore.set(false);
          }
        },
        (error) => {
          console.error('Erreur listener compétences:', error);
          errorStore.set(error.message);
          loadingStore.set(false);
        }
      );

      this.activeSubscriptions.set(storeKey, unsubscribe);
      return unsubscribe;
    };

    const store: RealtimeStore<CompetenceEnriched> = {
      subscribe: dataStore.subscribe,
      loading: loadingStore,
      error: errorStore,
      unsubscribe: () => {
        const unsubscribe = this.activeSubscriptions.get(storeKey);
        if (unsubscribe) {
          unsubscribe();
          this.activeSubscriptions.delete(storeKey);
          this.stores.delete(storeKey);
        }
      },
      refresh: () => {
        const unsubscribe = this.activeSubscriptions.get(storeKey);
        if (unsubscribe) {
          unsubscribe();
        }
        setupListener();
      }
    };

    setupListener();
    this.stores.set(storeKey, store);
    return store;
  }

  createCoursesStore(filters: any = {}): RealtimeStore<Course> {
    const storeKey = `courses-${JSON.stringify(filters)}`;
    
    if (this.stores.has(storeKey)) {
      return this.stores.get(storeKey);
    }

    const dataStore = writable<Course[]>([]);
    const loadingStore = writable<boolean>(true);
    const errorStore = writable<string | null>(null);

    const setupListener = () => {
      const constraints: QueryConstraint[] = [];
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value) && value.length > 0) {
            constraints.push(where(key, 'in', value));
          } else if (!Array.isArray(value)) {
            constraints.push(where(key, '==', value));
          }
        }
      });

      constraints.push(orderBy('ordre'));
      
      const q = query(collection(db, 'courses'), ...constraints);
      
      const unsubscribe = onSnapshot(
        q,
        async (snapshot) => {
          try {
            loadingStore.set(true);
            errorStore.set(null);

            const courses = await Promise.all(
              snapshot.docs.map(async (docSnapshot) => {
                let data = docSnapshot.data();
                
                if (!data.version || data.version !== CURRENT_DATA_VERSION) {
                  data = await this.migrateData(data, data.version || '1.0.0');
                }

                return { id: docSnapshot.id, ...data } as Course;
              })
            );

            dataStore.set(courses);
            loadingStore.set(false);
            
            console.log(`🔄 Mise à jour temps réel: ${courses.length} cours chargés`);
            
          } catch (error) {
            console.error('Erreur temps réel cours:', error);
            errorStore.set(error.message);
            loadingStore.set(false);
          }
        },
        (error) => {
          console.error('Erreur listener cours:', error);
          errorStore.set(error.message);
          loadingStore.set(false);
        }
      );

      this.activeSubscriptions.set(storeKey, unsubscribe);
      return unsubscribe;
    };

    const store: RealtimeStore<Course> = {
      subscribe: dataStore.subscribe,
      loading: loadingStore,
      error: errorStore,
      unsubscribe: () => {
        const unsubscribe = this.activeSubscriptions.get(storeKey);
        if (unsubscribe) {
          unsubscribe();
          this.activeSubscriptions.delete(storeKey);
          this.stores.delete(storeKey);
        }
      },
      refresh: setupListener
    };

    setupListener();
    this.stores.set(storeKey, store);
    return store;
  }

  // Nettoyage général
  cleanup(): void {
    this.activeSubscriptions.forEach(unsubscribe => unsubscribe());
    this.activeSubscriptions.clear();
    this.stores.clear();
    console.log('🧹 Nettoyage des écouteurs temps réel terminé');
  }

  // Statistiques pour debugging
  getStats(): { activeSubscriptions: number; stores: number } {
    return {
      activeSubscriptions: this.activeSubscriptions.size,
      stores: this.stores.size
    };
  }

  private async migrateData(data: any, fromVersion: string): Promise<any> {
    // Implémentation de migration (référence séparée)
    return data;
  }

  private async enrichCompetenceData(competence: Competence): Promise<CompetenceEnriched> {
    // Implémentation d'enrichissement (référence séparée)
    return competence as CompetenceEnriched;
  }
}
```

### 4. API publique

**Fichier : `src/lib/realtime/index.ts`**
```typescript
import { SmartCache } from './SmartCache';
import { RealtimeDataManager } from './RealtimeDataManager';
import type { SearchFilters } from '$lib/types/realtime';

// Instances globales
const smartCache = new SmartCache();
const realtimeManager = new RealtimeDataManager();

// API publique pour les composants
export const createCompetencesStore = (filters: SearchFilters = {}) => {
  return realtimeManager.createCompetencesStore(filters);
};

export const createCoursesStore = (filters: any = {}) => {
  return realtimeManager.createCoursesStore(filters);
};

// Hook de nettoyage pour les composants
export const useRealtimeCleanup = () => {
  return {
    cleanup: () => {
      realtimeManager.cleanup();
      smartCache.clear();
    }
  };
};

// Utilitaires de cache
export const invalidateCache = (pattern?: string): void => {
  if (pattern) {
    smartCache.invalidatePattern(pattern);
  } else {
    smartCache.clear();
  }
};

// Statistiques pour debugging
export const getRealtimeStats = () => {
  return {
    cache: smartCache.getStats(),
    manager: realtimeManager.getStats()
  };
};

// Export des classes pour usage avancé
export { SmartCache, RealtimeDataManager };
export type { RealtimeStore, SearchFilters };
```

### 5. Composant exemple d'utilisation

**Fichier : `src/lib/components/RealtimeList.svelte`**
```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { createCompetencesStore, useRealtimeCleanup, type SearchFilters } from '$lib/realtime';
  import type { CompetenceEnriched } from '$lib/types/content';
  
  // Props
  export let filters: SearchFilters = {};
  export let autoRefresh = true;

  // Stores réactifs
  $: competencesStore = createCompetencesStore(filters);
  $: competences = [] as CompetenceEnriched[];
  $: loading = true;
  $: error = '';

  // Cleanup hook
  const { cleanup } = useRealtimeCleanup();

  // Variables de subscription
  let unsubscribeCompetences: (() => void) | null = null;

  onMount(() => {
    // Souscrire aux compétences
    unsubscribeCompetences = competencesStore.subscribe(value => {
      competences = value;
    });
    
    competencesStore.loading.subscribe(value => {
      loading = value;
    });
    
    competencesStore.error.subscribe(value => {
      error = value || '';
    });

    console.log('✅ Composant RealtimeList : Écouteurs temps réel activés');
  });

  onDestroy(() => {
    // Nettoyage des subscriptions
    if (unsubscribeCompetences) unsubscribeCompetences();
    competencesStore.unsubscribe();
    
    console.log('🧹 Composant RealtimeList : Nettoyage terminé');
  });

  // Actions
  const handleRefresh = () => {
    competencesStore.refresh();
    console.log('🔄 Actualisation manuelle des compétences');
  };
</script>

<!-- Interface utilisateur -->
<div class="realtime-container">
  <!-- Indicateur temps réel -->
  <div class="realtime-status" class:active={autoRefresh}>
    <span class="indicator"></span>
    <span class="text">
      {autoRefresh ? 'Temps réel activé' : 'Temps réel désactivé'}
    </span>
    <button on:click={handleRefresh} class="refresh-btn">🔄</button>
  </div>

  <!-- Contenu -->
  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Chargement en temps réel...</p>
    </div>
  {:else if error}
    <div class="error">
      <p>❌ Erreur : {error}</p>
      <button on:click={handleRefresh}>Réessayer</button>
    </div>
  {:else}
    <div class="items-grid">
      {#each competences as competence (competence.id)}
        <div class="item-card" class:new={competence._isNew}>
          <h4>{competence.titre}</h4>
          <p>{competence.description}</p>
          {#if competence._isNew}
            <span class="new-badge">✨ Nouveau</span>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .realtime-container {
    width: 100%;
  }

  .realtime-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: #f8f9fa;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .realtime-status.active {
    background: #d4edda;
    color: #155724;
  }

  .indicator {
    width: 8px;
    height: 8px;
    background: #dc3545;
    border-radius: 50%;
  }

  .realtime-status.active .indicator {
    background: #28a745;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7);
    }
    
    70% {
      transform: scale(1);
      box-shadow: 0 0 0 10px rgba(40, 167, 69, 0);
    }
    
    100% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(40, 167, 69, 0);
    }
  }

  .refresh-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
  }

  .refresh-btn:hover {
    background: rgba(0,0,0,0.1);
  }

  .loading {
    text-align: center;
    padding: 2rem;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .error {
    text-align: center;
    padding: 2rem;
    color: #dc3545;
  }

  .items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }

  .item-card {
    background: white;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 1rem;
    transition: all 0.3s ease;
    position: relative;
  }

  .item-card:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .item-card.new {
    border-color: #28a745;
    box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.2);
    animation: highlight 2s ease-out;
  }

  @keyframes highlight {
    0% {
      background: rgba(40, 167, 69, 0.1);
    }
    100% {
      background: white;
    }
  }

  .new-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #28a745;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
  }
</style>
```

## 🧪 Tests

### Test unitaire du cache

**Fichier : `src/lib/realtime/SmartCache.test.ts`**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SmartCache } from './SmartCache';

describe('SmartCache', () => {
  let cache: SmartCache;

  beforeEach(() => {
    cache = new SmartCache();
  });

  it('devrait stocker et récupérer des données', () => {
    const data = { id: '1', name: 'Test' };
    cache.set('test-key', data);
    
    const retrieved = cache.get('test-key');
    expect(retrieved).toEqual(data);
  });

  it('devrait respecter le TTL', async () => {
    const data = { id: '1', name: 'Test' };
    cache.set('test-key', data, 100); // 100ms TTL
    
    expect(cache.get('test-key')).toEqual(data);
    
    // Attendre l'expiration
    await new Promise(resolve => setTimeout(resolve, 150));
    
    expect(cache.get('test-key')).toBeNull();
  });

  it('devrait invalider par pattern', () => {
    cache.set('user-1', { name: 'User 1' });
    cache.set('user-2', { name: 'User 2' });
    cache.set('post-1', { title: 'Post 1' });
    
    cache.invalidatePattern('user');
    
    expect(cache.get('user-1')).toBeNull();
    expect(cache.get('user-2')).toBeNull();
    expect(cache.get('post-1')).not.toBeNull();
  });

  it('devrait notifier les listeners lors de l\'invalidation', () => {
    const callback = vi.fn();
    cache.onInvalidate('test-key', callback);
    
    cache.set('test-key', { data: 'test' });
    expect(callback).toHaveBeenCalled();
  });
});
```

### Test d'intégration du système temps réel

**Fichier : `src/lib/realtime/RealtimeDataManager.test.ts`**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RealtimeDataManager } from './RealtimeDataManager';

// Mock Firebase
vi.mock('$lib/firebase/client', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn()
}));

describe('RealtimeDataManager', () => {
  let manager: RealtimeDataManager;

  beforeEach(() => {
    manager = new RealtimeDataManager();
    vi.clearAllMocks();
  });

  it('devrait créer un store de compétences', () => {
    const store = manager.createCompetencesStore();
    
    expect(store).toHaveProperty('subscribe');
    expect(store).toHaveProperty('loading');
    expect(store).toHaveProperty('error');
    expect(store).toHaveProperty('unsubscribe');
    expect(store).toHaveProperty('refresh');
  });

  it('devrait réutiliser les stores existants', () => {
    const filters = { niveauIds: ['niveau-1'] };
    
    const store1 = manager.createCompetencesStore(filters);
    const store2 = manager.createCompetencesStore(filters);
    
    expect(store1).toBe(store2);
  });

  it('devrait nettoyer les subscriptions', () => {
    const store = manager.createCompetencesStore();
    const stats = manager.getStats();
    
    expect(stats.stores).toBe(1);
    
    manager.cleanup();
    const statsAfter = manager.getStats();
    
    expect(statsAfter.stores).toBe(0);
  });
});
```

## 📚 Liens

- **Roadmap principale** : [DOC_ROADMAP_LEARNING.md](../../DOC_ROADMAP_LEARNING.md)
- **Référence Cache Management** : [cache-management.md](../data/cache-management.md)
- **Référence Content Types** : [content-types.md](../data/content-types.md)
- **Documentation Firestore** : https://firebase.google.com/docs/firestore
- **Svelte Stores** : https://svelte.dev/docs#component-format-script-4-prefix-stores-with-$-to-access-their-values

## 🔄 Historique des versions

- **v1.0.0** - Implémentation initiale système temps réel
- **v1.1.0** - Ajout cache intelligent avec invalidation
- **v1.2.0** - Support des filtres dynamiques
- **v1.3.0** - Optimisations de performance et statistiques

## 🤝 Contribution

Pour modifier cette référence :
1. Valider les tests de performance temps réel
2. Tester l'invalidation du cache
3. Vérifier la compatibilité avec les autres stores
4. Documenter les nouveaux filtres ou fonctionnalités
