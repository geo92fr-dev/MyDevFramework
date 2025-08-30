# Testing Strategy - Référence d'implémentation

## 🎯 Objectif

Fournir une stratégie de tests complète et des patterns de test optimisés pour FunLearning, couvrant les tests unitaires, d'intégration et end-to-end.

### Problèmes résolus :
- Couverture de test exhaustive
- Tests performants et maintenables
- CI/CD avec tests automatisés
- Détection précoce des régressions

## 📝 Usage

### Quand l'utiliser :
- Développement avec TDD/BDD
- Validation des fonctionnalités
- Tests de régression
- Assurance qualité continue

### Contexte d'utilisation :
- Applications SvelteKit/TypeScript
- Tests de composants Svelte
- Tests Firebase/Firestore
- Tests d'intégration API

### Prérequis :
- Node.js 18+
- Vitest configuré
- Testing Library
- Playwright (pour E2E)

## 🏗️ Configuration

### 1. Configuration Vitest

**Fichier : `vite.config.ts`**
```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/lib/test/setup.ts'],
    coverage: {
      reporter: ['text', 'html', 'json-summary'],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
      exclude: [
        'node_modules/',
        'src/lib/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'src/app.html'
      ]
    },
    testTimeout: 10000,
    deps: {
      inline: ['@firebase/testing']
    }
  }
});
```

### 2. Setup des tests

**Fichier : `src/lib/test/setup.ts`**
```typescript
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Firebase
vi.mock('$app/environment', () => ({
  browser: false,
  dev: true,
  building: false,
  version: '1.0.0'
}));

vi.mock('$app/stores', () => {
  const page = vi.fn(() => ({
    subscribe: vi.fn()
  }));
  
  const navigating = vi.fn(() => ({
    subscribe: vi.fn()
  }));

  return { page, navigating };
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock
});

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'mock-uuid-' + Math.random().toString(36).substring(2))
  }
});

// Mock fetch
global.fetch = vi.fn();

// Mock console pour réduire le bruit dans les tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
  log: vi.fn()
};
```

### 3. Utilitaires de test

**Fichier : `src/lib/test/utils.ts`**
```typescript
import { render, type RenderOptions } from '@testing-library/svelte';
import { vi, type MockedFunction } from 'vitest';
import type { ComponentType } from 'svelte';

// Helper pour render avec props par défaut
export function renderWithDefaults<T extends Record<string, any>>(
  Component: ComponentType,
  options: RenderOptions<T> = {} as RenderOptions<T>
) {
  const defaultProps = {
    // Props communes par défaut
  };

  return render(Component, {
    ...options,
    props: { ...defaultProps, ...options.props }
  });
}

// Mock pour les stores Svelte
export function createMockStore<T>(initialValue: T) {
  let value = initialValue;
  const subscribers = new Set<(value: T) => void>();

  return {
    subscribe: vi.fn((callback: (value: T) => void) => {
      subscribers.add(callback);
      callback(value);
      return () => subscribers.delete(callback);
    }),
    set: vi.fn((newValue: T) => {
      value = newValue;
      subscribers.forEach(callback => callback(value));
    }),
    update: vi.fn((updater: (value: T) => T) => {
      value = updater(value);
      subscribers.forEach(callback => callback(value));
    }),
    get: () => value
  };
}

// Helper pour les tests Firebase
export function createFirestoreMock() {
  const docMock = {
    get: vi.fn(),
    set: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    onSnapshot: vi.fn()
  };

  const collectionMock = {
    doc: vi.fn(() => docMock),
    add: vi.fn(),
    where: vi.fn(() => collectionMock),
    orderBy: vi.fn(() => collectionMock),
    limit: vi.fn(() => collectionMock),
    get: vi.fn(),
    onSnapshot: vi.fn()
  };

  return {
    collection: vi.fn(() => collectionMock),
    doc: vi.fn(() => docMock),
    batch: vi.fn(() => ({
      set: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      commit: vi.fn()
    }))
  };
}

// Helper pour les tests d'événements
export function createEventMock<T = any>(detail?: T) {
  return new CustomEvent('test', { detail });
}

// Helper pour attendre les promesses async
export function waitForPromises() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

// Mock pour les composants avec slots
export function createSlotMock(content: string = 'Slot content') {
  return {
    $$slots: {
      default: [() => content]
    }
  };
}
```

## 🧪 Tests unitaires

### 1. Test de composant simple

**Fichier : `src/lib/components/ui/Button.test.ts`**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/svelte';
import Button from './Button.svelte';

describe('Button Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait rendre avec le texte correct', () => {
    render(Button, { props: { children: 'Click me' } });
    
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('devrait appliquer les bonnes classes selon le variant', () => {
    render(Button, { 
      props: { 
        variant: 'primary',
        children: 'Primary Button' 
      } 
    });
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary-600');
  });

  it('devrait être désactivé quand disabled=true', () => {
    render(Button, { 
      props: { 
        disabled: true,
        children: 'Disabled Button' 
      } 
    });
    
    const button = screen.getByRole('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('devrait déclencher l\'événement click', async () => {
    const handleClick = vi.fn();
    const { component } = render(Button, { 
      props: { children: 'Click me' }
    });
    
    component.$on('click', handleClick);
    
    const button = screen.getByRole('button');
    await fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('devrait afficher le loading spinner quand loading=true', () => {
    render(Button, { 
      props: { 
        loading: true,
        children: 'Loading...' 
      } 
    });
    
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('devrait supporter fullWidth', () => {
    render(Button, { 
      props: { 
        fullWidth: true,
        children: 'Full Width' 
      } 
    });
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('w-full');
  });

  it('devrait rendre comme lien quand href est fourni', () => {
    render(Button, { 
      props: { 
        href: '/test',
        children: 'Link Button' 
      } 
    });
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/test');
  });
});
```

### 2. Test de store avec état

**Fichier : `src/lib/stores/userPreferences.test.ts`**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { userPreferences, updateTheme, updateNotifications } from './userPreferences';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('userPreferences store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('devrait initialiser avec les valeurs par défaut', () => {
    const prefs = get(userPreferences);
    
    expect(prefs.theme).toBe('auto');
    expect(prefs.language).toBe('fr');
    expect(prefs.notifications.email).toBe(true);
  });

  it('devrait charger depuis localStorage si disponible', () => {
    const savedPrefs = {
      theme: 'dark',
      language: 'en',
      notifications: { email: false, push: true, sound: false }
    };
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedPrefs));
    
    // Recreate store to trigger loading
    const { userPreferences: newStore } = await import('./userPreferences');
    const prefs = get(newStore);
    
    expect(prefs.theme).toBe('dark');
    expect(prefs.language).toBe('en');
  });

  it('devrait mettre à jour le thème', () => {
    updateTheme('dark');
    
    const prefs = get(userPreferences);
    expect(prefs.theme).toBe('dark');
  });

  it('devrait mettre à jour les notifications partiellement', () => {
    updateNotifications({ email: false });
    
    const prefs = get(userPreferences);
    expect(prefs.notifications.email).toBe(false);
    expect(prefs.notifications.push).toBe(false); // reste inchangé
    expect(prefs.notifications.sound).toBe(true); // reste inchangé
  });

  it('devrait sauvegarder automatiquement dans localStorage', () => {
    updateTheme('light');
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'funlearning-preferences',
      expect.stringContaining('"theme":"light"')
    );
  });
});
```

### 3. Test de service avec Firebase

**Fichier : `src/lib/services/courseService.test.ts`**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { courseService } from './courseService';
import { createFirestoreMock } from '$lib/test/utils';

// Mock Firebase
const firestoreMock = createFirestoreMock();
vi.mock('$lib/firebase', () => ({
  db: firestoreMock
}));

describe('courseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait récupérer tous les cours', async () => {
    const mockCourses = [
      { id: '1', title: 'Course 1', competences: [] },
      { id: '2', title: 'Course 2', competences: [] }
    ];

    firestoreMock.collection().get.mockResolvedValue({
      docs: mockCourses.map(course => ({
        id: course.id,
        data: () => course
      }))
    });

    const courses = await courseService.getAllCourses();

    expect(firestoreMock.collection).toHaveBeenCalledWith('courses');
    expect(courses).toHaveLength(2);
    expect(courses[0].title).toBe('Course 1');
  });

  it('devrait récupérer un cours par ID', async () => {
    const mockCourse = { id: '1', title: 'Course 1', competences: [] };

    firestoreMock.collection().doc().get.mockResolvedValue({
      exists: true,
      id: '1',
      data: () => mockCourse
    });

    const course = await courseService.getCourseById('1');

    expect(firestoreMock.collection().doc).toHaveBeenCalledWith('1');
    expect(course?.title).toBe('Course 1');
  });

  it('devrait retourner null pour un cours inexistant', async () => {
    firestoreMock.collection().doc().get.mockResolvedValue({
      exists: false
    });

    const course = await courseService.getCourseById('nonexistent');

    expect(course).toBeNull();
  });

  it('devrait créer un nouveau cours', async () => {
    const newCourse = {
      title: 'New Course',
      description: 'Course description',
      competences: []
    };

    firestoreMock.collection().add.mockResolvedValue({
      id: 'new-id'
    });

    const courseId = await courseService.createCourse(newCourse);

    expect(firestoreMock.collection().add).toHaveBeenCalledWith(newCourse);
    expect(courseId).toBe('new-id');
  });

  it('devrait gérer les erreurs lors de la récupération', async () => {
    firestoreMock.collection().get.mockRejectedValue(new Error('Network error'));

    await expect(courseService.getAllCourses()).rejects.toThrow('Network error');
  });
});
```

## 🔗 Tests d'intégration

### 1. Test de composant avec store

**Fichier : `src/lib/components/learning/CompetenceCard.test.ts`**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/svelte';
import CompetenceCard from './CompetenceCard.svelte';
import { createMockStore } from '$lib/test/utils';

describe('CompetenceCard Integration', () => {
  const mockCompetence = {
    id: 'comp-1',
    title: 'Test Competence',
    description: 'Test description',
    level: 'beginner' as const,
    progression: 50,
    status: 'in-progress' as const,
    estimatedTime: 30,
    prerequisites: ['Basic knowledge']
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait afficher les informations de la compétence', () => {
    render(CompetenceCard, { 
      props: { competence: mockCompetence } 
    });

    expect(screen.getByText('Test Competence')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('beginner')).toBeInTheDocument();
    expect(screen.getByText('En cours')).toBeInTheDocument();
    expect(screen.getByText('30min')).toBeInTheDocument();
  });

  it('devrait afficher la barre de progression pour une compétence en cours', () => {
    render(CompetenceCard, { 
      props: { competence: mockCompetence } 
    });

    expect(screen.getByText('Progression')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('devrait déclencher l\'événement select lors du clic', async () => {
    const handleSelect = vi.fn();
    const { component } = render(CompetenceCard, { 
      props: { competence: mockCompetence } 
    });

    component.$on('select', handleSelect);

    const card = screen.getByRole('button');
    await fireEvent.click(card);

    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { competenceId: 'comp-1' }
      })
    );
  });

  it('devrait afficher le bouton approprié selon le statut', () => {
    const notStartedCompetence = { 
      ...mockCompetence, 
      status: 'not-started' as const 
    };

    const { rerender } = render(CompetenceCard, { 
      props: { competence: notStartedCompetence } 
    });

    expect(screen.getByText('Commencer')).toBeInTheDocument();

    rerender({ competence: mockCompetence });
    expect(screen.getByText('Continuer')).toBeInTheDocument();

    const completedCompetence = { 
      ...mockCompetence, 
      status: 'completed' as const 
    };
    rerender({ competence: completedCompetence });
    expect(screen.getByText('Réviser')).toBeInTheDocument();
  });
});
```

### 2. Test de page complète

**Fichier : `src/routes/courses/[id]/+page.test.ts`**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import CoursePage from './+page.svelte';
import { createFirestoreMock, createMockStore } from '$lib/test/utils';

// Mock des stores
const mockAuthStore = createMockStore({
  user: { uid: 'user-1', email: 'test@example.com' },
  loading: false
});

const mockProgressStore = createMockStore({
  competences: {
    'comp-1': {
      competenceId: 'comp-1',
      status: 'in-progress',
      progression: 50
    }
  }
});

vi.mock('$lib/stores/auth', () => ({
  authStore: mockAuthStore
}));

vi.mock('$lib/stores/learningProgress', () => ({
  learningProgress: mockProgressStore
}));

// Mock du service
const mockCourseService = {
  getCourseById: vi.fn(),
  getCompetences: vi.fn()
};

vi.mock('$lib/services/courseService', () => ({
  courseService: mockCourseService
}));

describe('Course Page Integration', () => {
  const mockPageData = {
    course: {
      id: 'course-1',
      title: 'Test Course',
      description: 'Course description',
      competences: ['comp-1', 'comp-2']
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockCourseService.getCourseById.mockResolvedValue(mockPageData.course);
    mockCourseService.getCompetences.mockResolvedValue([
      {
        id: 'comp-1',
        title: 'Competence 1',
        description: 'Description 1',
        level: 'beginner'
      },
      {
        id: 'comp-2',
        title: 'Competence 2',
        description: 'Description 2',
        level: 'intermediate'
      }
    ]);
  });

  it('devrait afficher les informations du cours', async () => {
    render(CoursePage, { props: { data: mockPageData } });

    expect(screen.getByText('Test Course')).toBeInTheDocument();
    expect(screen.getByText('Course description')).toBeInTheDocument();
  });

  it('devrait charger et afficher les compétences', async () => {
    render(CoursePage, { props: { data: mockPageData } });

    await waitFor(() => {
      expect(screen.getByText('Competence 1')).toBeInTheDocument();
      expect(screen.getByText('Competence 2')).toBeInTheDocument();
    });
  });

  it('devrait afficher la progression de l\'utilisateur', async () => {
    render(CoursePage, { props: { data: mockPageData } });

    await waitFor(() => {
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });

  it('devrait rediriger vers la connexion si non authentifié', async () => {
    mockAuthStore.set({ user: null, loading: false });

    const { container } = render(CoursePage, { 
      props: { data: mockPageData } 
    });

    await waitFor(() => {
      expect(container.querySelector('[data-testid="login-prompt"]'))
        .toBeInTheDocument();
    });
  });
});
```

## 🌐 Tests End-to-End

### 1. Configuration Playwright

**Fichier : `playwright.config.ts`**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run build && npm run preview',
    port: 4173,
    reuseExistingServer: !process.env.CI
  },
});
```

### 2. Tests E2E de base

**Fichier : `e2e/auth.spec.ts`**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('devrait permettre la connexion', async ({ page }) => {
    // Cliquer sur le bouton de connexion
    await page.click('[data-testid="login-button"]');

    // Attendre la redirection vers la page de connexion
    await expect(page).toHaveURL('/auth/login');

    // Remplir le formulaire
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');

    // Soumettre
    await page.click('[data-testid="submit-button"]');

    // Vérifier la redirection après connexion
    await expect(page).toHaveURL('/dashboard');
    
    // Vérifier que l'utilisateur est connecté
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('devrait afficher une erreur pour des identifiants incorrects', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('[data-testid="email-input"]', 'wrong@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="submit-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]'))
      .toContainText('Identifiants incorrects');
  });

  test('devrait permettre la déconnexion', async ({ page }) => {
    // Se connecter d'abord
    await page.goto('/auth/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="submit-button"]');

    // Attendre d'être connecté
    await expect(page).toHaveURL('/dashboard');

    // Se déconnecter
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    // Vérifier la redirection
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
  });
});
```

### 3. Tests E2E complets

**Fichier : `e2e/learning-flow.spec.ts`**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Learning Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Connexion automatique pour les tests
    await page.goto('/auth/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="submit-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('devrait permettre de parcourir et commencer un cours', async ({ page }) => {
    // Aller aux cours
    await page.click('[data-testid="courses-link"]');
    await expect(page).toHaveURL('/courses');

    // Sélectionner un cours
    await page.click('[data-testid="course-card"]:first-child');
    
    // Vérifier la page du cours
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="competences-list"]')).toBeVisible();

    // Commencer une compétence
    await page.click('[data-testid="competence-start-button"]:first-child');
    
    // Vérifier la redirection vers l'exercice
    await expect(page.url()).toContain('/competence/');
    await expect(page.locator('[data-testid="exercise-content"]')).toBeVisible();
  });

  test('devrait sauvegarder la progression', async ({ page }) => {
    // Naviguer vers un exercice
    await page.goto('/courses/test-course/competence/test-competence');

    // Compléter un exercice
    await page.fill('[data-testid="exercise-input"]', 'réponse correcte');
    await page.click('[data-testid="submit-answer"]');

    // Vérifier le feedback
    await expect(page.locator('[data-testid="success-feedback"]')).toBeVisible();

    // Aller à l'exercice suivant
    await page.click('[data-testid="next-exercise"]');

    // Vérifier que la progression est mise à jour
    await expect(page.locator('[data-testid="progress-bar"]')).toHaveAttribute('aria-valuenow', '50');

    // Retourner au tableau de bord et vérifier la persistence
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="recent-activity"]')).toContainText('test-competence');
  });

  test('devrait fonctionner en mode hors ligne', async ({ page, context }) => {
    // Aller sur une page avec du contenu
    await page.goto('/courses/test-course');
    await expect(page.locator('h1')).toBeVisible();

    // Simuler la perte de connexion
    await context.setOffline(true);

    // Naviguer dans l'app
    await page.click('[data-testid="competence-card"]:first-child');
    
    // Vérifier que le contenu en cache est disponible
    await expect(page.locator('[data-testid="exercise-content"]')).toBeVisible();

    // Vérifier l'indicateur hors ligne
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();

    // Rétablir la connexion
    await context.setOffline(false);
    
    // Vérifier la synchronisation
    await expect(page.locator('[data-testid="offline-indicator"]')).not.toBeVisible();
  });
});
```

## 📊 Tests de performance

### 1. Test de bundle size

**Fichier : `src/lib/test/bundle-size.test.ts`**
```typescript
import { describe, it, expect } from 'vitest';
import { readFileSync, statSync } from 'fs';
import { glob } from 'glob';

describe('Bundle Size', () => {
  it('devrait avoir une taille de bundle raisonnable', async () => {
    const buildFiles = glob.sync('build/**/*.js');
    const totalSize = buildFiles.reduce((total, file) => {
      return total + statSync(file).size;
    }, 0);

    // Limite à 500KB pour le JavaScript total
    expect(totalSize).toBeLessThan(500 * 1024);
  });

  it('devrait avoir des chunks optimisés', async () => {
    const chunkFiles = glob.sync('build/_app/immutable/chunks/*.js');
    
    chunkFiles.forEach(file => {
      const size = statSync(file).size;
      // Aucun chunk ne devrait dépasser 100KB
      expect(size).toBeLessThan(100 * 1024);
    });
  });
});
```

### 2. Test de performance Lighthouse

**Fichier : `e2e/performance.spec.ts`**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('devrait avoir de bonnes métriques Lighthouse', async ({ page }) => {
    await page.goto('/');

    // Mesurer les Core Web Vitals
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            resolve(entry.startTime);
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });

    // LCP devrait être < 2.5s
    expect(lcp).toBeLessThan(2500);

    // Vérifier le temps de chargement
    const navigationTiming = await page.evaluate(() => {
      return {
        loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
        domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
      };
    });

    expect(navigationTiming.loadTime).toBeLessThan(3000);
    expect(navigationTiming.domReady).toBeLessThan(1500);
  });
});
```

## 🚀 CI/CD Integration

### 1. GitHub Actions

**Fichier : `.github/workflows/test.yml`**
```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npx playwright install
      - run: npm run build
      - run: npm run test:e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: test-results/

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      - run: npm run preview &
      
      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v9
        with:
          configPath: './lighthouserc.json'
          uploadArtifacts: true
```

### 2. Scripts package.json

**Fichier : `package.json` (extrait)**
```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:debug": "vitest --inspect-brk --no-coverage",
    "lint:test": "eslint src/**/*.test.ts e2e/**/*.spec.ts"
  }
}
```

## 📚 Liens

- **Roadmap principale** : [DOC_ROADMAP_LEARNING.md](../../DOC_ROADMAP_LEARNING.md)
- **Vitest Documentation** : https://vitest.dev/
- **Testing Library** : https://testing-library.com/docs/svelte-testing-library/intro
- **Playwright** : https://playwright.dev/
- **Firebase Testing** : https://firebase.google.com/docs/rules/unit-tests

## 🔄 Historique des versions

- **v1.0.0** - Configuration de base Vitest + Testing Library
- **v1.1.0** - Tests d'intégration avec stores
- **v1.2.0** - Tests E2E avec Playwright
- **v1.3.0** - Tests de performance et bundle size
- **v1.4.0** - CI/CD avec GitHub Actions
- **v1.5.0** - Tests Firebase et mocks avancés

## 🤝 Contribution

Pour modifier cette référence :
1. Maintenir une couverture de test > 80%
2. Ajouter des tests pour les nouvelles fonctionnalités
3. Utiliser les mocks fournis pour la consistance
4. Documenter les cas de test complexes
5. Optimiser les performances des tests
