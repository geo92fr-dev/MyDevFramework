# Reactive Stores - Référence d'implémentation

## 🎯 Objectif

Fournir des patterns et implémentations de stores Svelte réactifs optimisés pour FunLearning, avec gestion d'état, persistence et synchronisation.

### Problèmes résolus :
- Gestion d'état cohérente à travers l'application
- Synchronisation entre composants
- Persistence des données utilisateur
- Performance optimisée avec memoization

## 📝 Usage

### Quand l'utiliser :
- Partage d'état entre composants
- Gestion des préférences utilisateur
- Cache de données applicatives
- État global de l'application

### Contexte d'utilisation :
- Applications SvelteKit
- Gestion d'état complexe
- Synchronisation multi-composants

### Prérequis :
- Svelte/SvelteKit configuré
- TypeScript (recommandé)
- localStorage disponible (pour persistence)

## 🔧 Implémentation

### 1. Store de base avec persistence

**Fichier : `src/lib/stores/createPersistentStore.ts`**
```typescript
import { writable, get, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

interface PersistentStoreOptions<T> {
  key: string;
  defaultValue: T;
  storage?: 'localStorage' | 'sessionStorage';
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
}

export function createPersistentStore<T>(
  options: PersistentStoreOptions<T>
): Writable<T> {
  const {
    key,
    defaultValue,
    storage = 'localStorage',
    serialize = JSON.stringify,
    deserialize = JSON.parse
  } = options;

  // Récupérer la valeur initiale
  let initialValue = defaultValue;
  
  if (browser) {
    try {
      const stored = window[storage].getItem(key);
      if (stored !== null) {
        initialValue = deserialize(stored);
      }
    } catch (error) {
      console.warn(`Erreur lecture ${storage} pour la clé ${key}:`, error);
    }
  }

  // Créer le store
  const store = writable<T>(initialValue);

  // Sauvegarder automatiquement les changements
  if (browser) {
    store.subscribe((value) => {
      try {
        if (value === undefined || value === null) {
          window[storage].removeItem(key);
        } else {
          window[storage].setItem(key, serialize(value));
        }
      } catch (error) {
        console.warn(`Erreur sauvegarde ${storage} pour la clé ${key}:`, error);
      }
    });
  }

  return store;
}
```

### 2. Store de préférences utilisateur

**Fichier : `src/lib/stores/userPreferences.ts`**
```typescript
import { createPersistentStore } from './createPersistentStore';

export interface UserPreferences {
  theme: 'auto' | 'light' | 'dark';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sound: boolean;
  };
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
  learning: {
    showHints: boolean;
    autoSave: boolean;
    difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  };
}

const defaultPreferences: UserPreferences = {
  theme: 'auto',
  language: 'fr',
  notifications: {
    email: true,
    push: false,
    sound: true
  },
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium'
  },
  learning: {
    showHints: true,
    autoSave: true,
    difficulty: 'adaptive'
  }
};

export const userPreferences = createPersistentStore({
  key: 'funlearning-preferences',
  defaultValue: defaultPreferences
});

// Helpers pour mettre à jour des sections spécifiques
export const updateTheme = (theme: UserPreferences['theme']) => {
  userPreferences.update(prefs => ({
    ...prefs,
    theme
  }));
};

export const updateNotifications = (notifications: Partial<UserPreferences['notifications']>) => {
  userPreferences.update(prefs => ({
    ...prefs,
    notifications: {
      ...prefs.notifications,
      ...notifications
    }
  }));
};

export const updateAccessibility = (accessibility: Partial<UserPreferences['accessibility']>) => {
  userPreferences.update(prefs => ({
    ...prefs,
    accessibility: {
      ...prefs.accessibility,
      ...accessibility
    }
  }));
};

export const updateLearning = (learning: Partial<UserPreferences['learning']>) => {
  userPreferences.update(prefs => ({
    ...prefs,
    learning: {
      ...prefs.learning,
      ...learning
    }
  }));
};
```

### 3. Store de progression d'apprentissage

**Fichier : `src/lib/stores/learningProgress.ts`**
```typescript
import { writable, derived, get } from 'svelte/store';
import { createPersistentStore } from './createPersistentStore';

export interface CompetenceProgress {
  competenceId: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'mastered';
  progression: number; // 0-100
  timeSpent: number; // en minutes
  lastAccessed: string;
  exercisesCompleted: number;
  exercisesTotal: number;
  score?: number;
  attempts: number;
}

export interface LearningProgress {
  userId: string;
  competences: Record<string, CompetenceProgress>;
  globalStats: {
    totalTimeSpent: number;
    competencesStarted: number;
    competencesCompleted: number;
    competencesMastered: number;
    averageScore: number;
  };
  achievements: string[];
  streaks: {
    current: number;
    longest: number;
    lastActivity: string;
  };
}

const defaultProgress: LearningProgress = {
  userId: '',
  competences: {},
  globalStats: {
    totalTimeSpent: 0,
    competencesStarted: 0,
    competencesCompleted: 0,
    competencesMastered: 0,
    averageScore: 0
  },
  achievements: [],
  streaks: {
    current: 0,
    longest: 0,
    lastActivity: new Date().toISOString()
  }
};

export const learningProgress = createPersistentStore({
  key: 'funlearning-progress',
  defaultValue: defaultProgress
});

// Store dérivé pour les statistiques calculées
export const progressStats = derived(
  learningProgress,
  ($progress) => {
    const competences = Object.values($progress.competences);
    
    return {
      totalCompetences: competences.length,
      completionRate: competences.length > 0 
        ? (competences.filter(c => c.status === 'completed' || c.status === 'mastered').length / competences.length) * 100
        : 0,
      averageProgression: competences.length > 0
        ? competences.reduce((sum, c) => sum + c.progression, 0) / competences.length
        : 0,
      recentActivity: competences
        .sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
        .slice(0, 5)
    };
  }
);

// Actions pour mettre à jour la progression
export const updateCompetenceProgress = (
  competenceId: string, 
  updates: Partial<CompetenceProgress>
) => {
  learningProgress.update(progress => {
    const currentProgress = progress.competences[competenceId] || {
      competenceId,
      status: 'not-started',
      progression: 0,
      timeSpent: 0,
      lastAccessed: new Date().toISOString(),
      exercisesCompleted: 0,
      exercisesTotal: 0,
      attempts: 0
    };

    const updatedCompetence = {
      ...currentProgress,
      ...updates,
      lastAccessed: new Date().toISOString()
    };

    // Calculer les statistiques globales
    const allCompetences = {
      ...progress.competences,
      [competenceId]: updatedCompetence
    };
    
    const competencesList = Object.values(allCompetences);
    const globalStats = {
      totalTimeSpent: competencesList.reduce((sum, c) => sum + c.timeSpent, 0),
      competencesStarted: competencesList.filter(c => c.status !== 'not-started').length,
      competencesCompleted: competencesList.filter(c => c.status === 'completed').length,
      competencesMastered: competencesList.filter(c => c.status === 'mastered').length,
      averageScore: competencesList.length > 0
        ? competencesList.reduce((sum, c) => sum + (c.score || 0), 0) / competencesList.length
        : 0
    };

    return {
      ...progress,
      competences: allCompetences,
      globalStats
    };
  });
};

export const addAchievement = (achievementId: string) => {
  learningProgress.update(progress => {
    if (!progress.achievements.includes(achievementId)) {
      return {
        ...progress,
        achievements: [...progress.achievements, achievementId]
      };
    }
    return progress;
  });
};

export const updateStreak = () => {
  learningProgress.update(progress => {
    const today = new Date().toDateString();
    const lastActivity = new Date(progress.streaks.lastActivity).toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    let newStreak = progress.streaks.current;

    if (lastActivity === today) {
      // Déjà actif aujourd'hui, pas de changement
      return progress;
    } else if (lastActivity === yesterday) {
      // Continuité de la série
      newStreak += 1;
    } else {
      // Série brisée
      newStreak = 1;
    }

    return {
      ...progress,
      streaks: {
        current: newStreak,
        longest: Math.max(newStreak, progress.streaks.longest),
        lastActivity: new Date().toISOString()
      }
    };
  });
};
```

### 4. Store de notifications

**Fichier : `src/lib/stores/notifications.ts`**
```typescript
import { writable, get } from 'svelte/store';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number; // en ms, 0 = permanent
  actions?: NotificationAction[];
  timestamp: number;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary';
}

function createNotificationStore() {
  const { subscribe, set, update } = writable<Notification[]>([]);

  return {
    subscribe,

    add(notification: Omit<Notification, 'id' | 'timestamp'>) {
      const id = crypto.randomUUID();
      const newNotification: Notification = {
        ...notification,
        id,
        timestamp: Date.now(),
        duration: notification.duration ?? 5000
      };

      update(notifications => [...notifications, newNotification]);

      // Auto-suppression après la durée spécifiée
      if (newNotification.duration > 0) {
        setTimeout(() => {
          this.remove(id);
        }, newNotification.duration);
      }

      return id;
    },

    remove(id: string) {
      update(notifications => notifications.filter(n => n.id !== id));
    },

    clear() {
      set([]);
    },

    // Helpers pour les types courants
    success(title: string, message: string, duration?: number) {
      return this.add({ type: 'success', title, message, duration });
    },

    error(title: string, message: string, duration = 0) {
      return this.add({ type: 'error', title, message, duration });
    },

    warning(title: string, message: string, duration?: number) {
      return this.add({ type: 'warning', title, message, duration });
    },

    info(title: string, message: string, duration?: number) {
      return this.add({ type: 'info', title, message, duration });
    }
  };
}

export const notifications = createNotificationStore();
```

### 5. Store composé pour l'état de l'application

**Fichier : `src/lib/stores/appState.ts`**
```typescript
import { writable, derived, get } from 'svelte/store';
import { userPreferences } from './userPreferences';
import { learningProgress } from './learningProgress';
import { authStore } from './auth';

export interface AppState {
  isOnline: boolean;
  currentPage: string;
  loading: boolean;
  sidebarOpen: boolean;
  modalOpen: string | null;
}

const defaultAppState: AppState = {
  isOnline: true,
  currentPage: '/',
  loading: false,
  sidebarOpen: false,
  modalOpen: null
};

function createAppStateStore() {
  const { subscribe, set, update } = writable<AppState>(defaultAppState);

  return {
    subscribe,

    setOnlineStatus(online: boolean) {
      update(state => ({ ...state, isOnline: online }));
    },

    setCurrentPage(page: string) {
      update(state => ({ ...state, currentPage: page }));
    },

    setLoading(loading: boolean) {
      update(state => ({ ...state, loading }));
    },

    toggleSidebar() {
      update(state => ({ ...state, sidebarOpen: !state.sidebarOpen }));
    },

    openModal(modalId: string) {
      update(state => ({ ...state, modalOpen: modalId }));
    },

    closeModal() {
      update(state => ({ ...state, modalOpen: null }));
    },

    reset() {
      set(defaultAppState);
    }
  };
}

export const appState = createAppStateStore();

// Store composé combinant tous les états
export const globalState = derived(
  [appState, userPreferences, learningProgress, authStore],
  ([$appState, $userPreferences, $learningProgress, $authStore]) => ({
    app: $appState,
    preferences: $userPreferences,
    progress: $learningProgress,
    auth: $authStore,
    
    // États calculés
    isAuthenticated: !!$authStore.user,
    isDarkMode: $userPreferences.theme === 'dark' || 
                ($userPreferences.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches),
    hasProgress: Object.keys($learningProgress.competences).length > 0
  })
);

// Détection du statut en ligne
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => appState.setOnlineStatus(true));
  window.addEventListener('offline', () => appState.setOnlineStatus(false));
}
```

### 6. Hook personnalisé pour l'utilisation dans les composants

**Fichier : `src/lib/stores/useStore.ts`**
```typescript
import { onDestroy } from 'svelte';
import { get, type Readable } from 'svelte/store';

// Hook pour gérer automatiquement les subscriptions
export function useStore<T>(store: Readable<T>, callback?: (value: T) => void) {
  let value = get(store);
  
  const unsubscribe = store.subscribe((newValue) => {
    value = newValue;
    callback?.(newValue);
  });

  onDestroy(unsubscribe);

  return {
    get value() {
      return value;
    },
    unsubscribe
  };
}

// Hook pour les actions asynchrones avec loading state
export function useAsyncAction<T extends any[], R>(
  action: (...args: T) => Promise<R>,
  onSuccess?: (result: R) => void,
  onError?: (error: Error) => void
) {
  const loading = writable(false);
  const error = writable<Error | null>(null);

  const execute = async (...args: T): Promise<R | null> => {
    try {
      loading.set(true);
      error.set(null);
      
      const result = await action(...args);
      
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      error.set(error);
      onError?.(error);
      return null;
    } finally {
      loading.set(false);
    }
  };

  return {
    execute,
    loading: { subscribe: loading.subscribe },
    error: { subscribe: error.subscribe }
  };
}
```

## 🧪 Tests

### Test des stores persistants

**Fichier : `src/lib/stores/createPersistentStore.test.ts`**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { createPersistentStore } from './createPersistentStore';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('createPersistentStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait utiliser la valeur par défaut si rien en storage', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const store = createPersistentStore({
      key: 'test',
      defaultValue: { count: 0 }
    });
    
    expect(get(store)).toEqual({ count: 0 });
  });

  it('devrait charger la valeur depuis localStorage', () => {
    localStorageMock.getItem.mockReturnValue('{"count":42}');
    
    const store = createPersistentStore({
      key: 'test',
      defaultValue: { count: 0 }
    });
    
    expect(get(store)).toEqual({ count: 42 });
  });

  it('devrait sauvegarder lors des mises à jour', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const store = createPersistentStore({
      key: 'test',
      defaultValue: { count: 0 }
    });
    
    store.set({ count: 10 });
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'test',
      '{"count":10}'
    );
  });
});
```

### Test des notifications

**Fichier : `src/lib/stores/notifications.test.ts`**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { notifications } from './notifications';

describe('notifications store', () => {
  beforeEach(() => {
    notifications.clear();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  it('devrait ajouter une notification', () => {
    notifications.success('Test', 'Message de test');
    
    const notifs = get(notifications);
    expect(notifs).toHaveLength(1);
    expect(notifs[0].type).toBe('success');
    expect(notifs[0].title).toBe('Test');
  });

  it('devrait supprimer automatiquement après la durée', () => {
    notifications.success('Test', 'Message', 1000);
    
    expect(get(notifications)).toHaveLength(1);
    
    vi.advanceTimersByTime(1000);
    
    expect(get(notifications)).toHaveLength(0);
  });

  it('devrait permettre la suppression manuelle', () => {
    const id = notifications.success('Test', 'Message');
    
    expect(get(notifications)).toHaveLength(1);
    
    notifications.remove(id);
    
    expect(get(notifications)).toHaveLength(0);
  });
});
```

## 📚 Liens

- **Roadmap principale** : [DOC_ROADMAP_LEARNING.md](../../DOC_ROADMAP_LEARNING.md)
- **Référence Component Patterns** : [component-patterns.md](./component-patterns.md)
- **Documentation Svelte Stores** : https://svelte.dev/docs#component-format-script-4-prefix-stores-with-$-to-access-their-values
- **SvelteKit State Management** : https://kit.svelte.dev/docs/state-management

## 🔄 Historique des versions

- **v1.0.0** - Stores de base avec persistence
- **v1.1.0** - Store de préférences utilisateur
- **v1.2.0** - Progression d'apprentissage
- **v1.3.0** - Système de notifications
- **v1.4.0** - Store composé et hooks personnalisés

## 🤝 Contribution

Pour modifier cette référence :
1. Maintenir la compatibilité avec l'API existante
2. Ajouter des tests pour les nouveaux stores
3. Documenter les nouveaux patterns
4. Valider la persistence des données
