# Component Patterns - Référence d'implémentation

## 🎯 Objectif

Fournir des patterns et composants UI réutilisables optimisés pour FunLearning, avec design responsif, accessibilité et performance.

### Problèmes résolus :
- Consistance visuelle à travers l'application
- Composants accessibles (WCAG 2.1)
- Performance optimisée avec lazy loading
- Design responsive multi-dispositifs

## 📝 Usage

### Quand l'utiliser :
- Développement d'interfaces utilisateur
- Création de composants réutilisables
- Mise en place d'un design system
- Optimisation de l'expérience utilisateur

### Contexte d'utilisation :
- Applications SvelteKit
- Design responsive
- Progressive Web Apps

### Prérequis :
- SvelteKit configuré
- CSS moderne ou Tailwind CSS
- TypeScript (recommandé)

## 🎨 Design System

### Variables CSS personnalisées

**Fichier : `src/lib/styles/tokens.css`**
```css
:root {
  /* Couleurs principales */
  --color-primary-50: #f0f9ff;
  --color-primary-100: #e0f2fe;
  --color-primary-500: #0ea5e9;
  --color-primary-600: #0284c7;
  --color-primary-700: #0369a1;
  --color-primary-900: #0c4a6e;

  /* Couleurs sémantiques */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  /* Couleurs neutres */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;

  /* Typographie */
  --font-family-sans: ui-sans-serif, system-ui, sans-serif;
  --font-family-mono: ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace;
  
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;

  /* Espacement */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-12: 3rem;
  --spacing-16: 4rem;

  /* Radius */
  --radius-sm: 0.125rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-full: 9999px;

  /* Ombres */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

  /* Z-index */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal: 1040;
  --z-popover: 1050;
  --z-tooltip: 1060;

  /* Transitions */
  --transition-fast: 0.15s ease-out;
  --transition-normal: 0.25s ease-out;
  --transition-slow: 0.35s ease-out;
}

/* Mode sombre */
@media (prefers-color-scheme: dark) {
  :root {
    --color-primary-50: #0c4a6e;
    --color-primary-100: #0369a1;
    --color-primary-500: #0ea5e9;
    --color-primary-600: #38bdf8;
    --color-primary-700: #7dd3fc;
    --color-primary-900: #f0f9ff;
  }
}

[data-theme="dark"] {
  --color-gray-50: #111827;
  --color-gray-100: #1f2937;
  --color-gray-200: #374151;
  --color-gray-300: #4b5563;
  --color-gray-400: #6b7280;
  --color-gray-500: #9ca3af;
  --color-gray-600: #d1d5db;
  --color-gray-700: #e5e7eb;
  --color-gray-800: #f3f4f6;
  --color-gray-900: #f9fafb;
}
```

## 🧩 Composants de base

### 1. Button - Bouton réutilisable

**Fichier : `src/lib/components/ui/Button.svelte`**
```svelte
<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let disabled = false;
  export let loading = false;
  export let fullWidth = false;
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let href: string | undefined = undefined;
  export let target: string | undefined = undefined;
  
  // Accessible props
  export let ariaLabel: string | undefined = undefined;
  export let ariaDescribedBy: string | undefined = undefined;

  $: component = href ? 'a' : 'button';
  $: buttonProps = href 
    ? { href, target }
    : { type, disabled: disabled || loading };

  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-primary-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  $: classes = [
    'inline-flex items-center justify-center font-medium rounded-md',
    'transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    variants[variant],
    sizes[size],
    fullWidth ? 'w-full' : '',
    loading ? 'cursor-wait' : '',
    $$props.class || ''
  ].filter(Boolean).join(' ');
</script>

<svelte:element
  this={component}
  class={classes}
  aria-label={ariaLabel}
  aria-describedby={ariaDescribedBy}
  aria-disabled={disabled || loading}
  {...buttonProps}
  on:click
  on:focus
  on:blur
  on:keydown
>
  {#if loading}
    <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  {/if}
  
  <slot />
</svelte:element>

<style>
  .animate-spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
```

### 2. Card - Conteneur de contenu

**Fichier : `src/lib/components/ui/Card.svelte`**
```svelte
<script lang="ts">
  export let variant: 'default' | 'bordered' | 'elevated' | 'interactive' = 'default';
  export let padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  export let hoverable = false;
  export let clickable = false;
  
  const variants = {
    default: 'bg-white border border-gray-200',
    bordered: 'bg-white border-2 border-gray-300',
    elevated: 'bg-white shadow-lg border border-gray-200',
    interactive: 'bg-white border border-gray-200 hover:shadow-md transition-shadow'
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  $: classes = [
    'rounded-lg',
    variants[variant],
    paddings[padding],
    hoverable ? 'hover:shadow-md transition-shadow' : '',
    clickable ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500' : '',
    $$props.class || ''
  ].filter(Boolean).join(' ');
</script>

<div
  class={classes}
  role={clickable ? 'button' : undefined}
  tabindex={clickable ? 0 : undefined}
  on:click
  on:keydown={(e) => {
    if (clickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      // Dispatch click event
      const event = new MouseEvent('click', { bubbles: true });
      e.currentTarget.dispatchEvent(event);
    }
  }}
>
  <slot />
</div>
```

### 3. Input - Champ de saisie

**Fichier : `src/lib/components/ui/Input.svelte`**
```svelte
<script lang="ts">
  export let type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' = 'text';
  export let value = '';
  export let placeholder = '';
  export let disabled = false;
  export let readonly = false;
  export let required = false;
  export let invalid = false;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  
  // Accessible props
  export let label = '';
  export let description = '';
  export let errorMessage = '';
  export let id = '';
  
  // Icons
  export let leftIcon: string | undefined = undefined;
  export let rightIcon: string | undefined = undefined;

  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher<{
    input: { value: string };
    change: { value: string };
    focus: void;
    blur: void;
  }>();

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  $: inputClasses = [
    'block w-full border rounded-md',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
    'transition-colors duration-200',
    invalid 
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300 placeholder-gray-400',
    disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white',
    leftIcon ? 'pl-10' : '',
    rightIcon ? 'pr-10' : '',
    sizes[size]
  ].filter(Boolean).join(' ');

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    value = target.value;
    dispatch('input', { value });
  }

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    dispatch('change', { value: target.value });
  }
</script>

<div class="space-y-1">
  {#if label}
    <label for={id} class="block text-sm font-medium text-gray-700">
      {label}
      {#if required}
        <span class="text-red-500" aria-label="required">*</span>
      {/if}
    </label>
  {/if}

  <div class="relative">
    {#if leftIcon}
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <iconify-icon icon={leftIcon} class="h-5 w-5 text-gray-400"></iconify-icon>
      </div>
    {/if}

    <input
      {id}
      {type}
      {placeholder}
      {disabled}
      {readonly}
      {required}
      class={inputClasses}
      bind:value
      on:input={handleInput}
      on:change={handleChange}
      on:focus={() => dispatch('focus')}
      on:blur={() => dispatch('blur')}
      aria-invalid={invalid}
      aria-describedby={description || errorMessage ? `${id}-description` : undefined}
    />

    {#if rightIcon}
      <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <iconify-icon icon={rightIcon} class="h-5 w-5 text-gray-400"></iconify-icon>
      </div>
    {/if}
  </div>

  {#if description && !invalid}
    <p id="{id}-description" class="text-sm text-gray-500">
      {description}
    </p>
  {/if}

  {#if invalid && errorMessage}
    <p id="{id}-description" class="text-sm text-red-600">
      {errorMessage}
    </p>
  {/if}
</div>
```

### 4. Modal - Fenêtre modale

**Fichier : `src/lib/components/ui/Modal.svelte`**
```svelte
<script lang="ts">
  export let open = false;
  export let size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
  export let closeOnEscape = true;
  export let closeOnBackdrop = true;
  export let persistent = false;
  
  import { createEventDispatcher, onMount } from 'svelte';
  import { trapFocus } from '$lib/utils/trapFocus';
  
  const dispatch = createEventDispatcher<{
    close: void;
    open: void;
  }>();

  let dialog: HTMLDialogElement;
  let previousActiveElement: HTMLElement | null = null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  function handleClose() {
    if (!persistent) {
      open = false;
      dispatch('close');
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && closeOnEscape) {
      handleClose();
    }
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === dialog && closeOnBackdrop) {
      handleClose();
    }
  }

  $: if (open) {
    previousActiveElement = document.activeElement as HTMLElement;
    document.body.style.overflow = 'hidden';
    dispatch('open');
  } else {
    document.body.style.overflow = '';
    if (previousActiveElement) {
      previousActiveElement.focus();
    }
  }

  onMount(() => {
    return () => {
      document.body.style.overflow = '';
    };
  });
</script>

{#if open}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40"
    aria-hidden="true"
  ></div>

  <!-- Modal -->
  <dialog
    bind:this={dialog}
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    open={true}
    on:click={handleBackdropClick}
    on:keydown={handleKeydown}
    use:trapFocus
  >
    <div
      class={`bg-white rounded-lg shadow-xl w-full ${sizes[size]} max-h-full overflow-hidden flex flex-col`}
      role="document"
    >
      <slot />
    </div>
  </dialog>
{/if}

<!-- Modal Header Slot -->
<slot name="header" slot="header" />

<!-- Modal Footer Slot -->
<slot name="footer" slot="footer" />
```

### 5. Tooltip - Info-bulle

**Fichier : `src/lib/components/ui/Tooltip.svelte`**
```svelte
<script lang="ts">
  export let text: string;
  export let position: 'top' | 'bottom' | 'left' | 'right' = 'top';
  export let delay = 500;
  export let disabled = false;
  
  let showTooltip = false;
  let timeoutId: NodeJS.Timeout;
  let tooltipElement: HTMLElement;
  let triggerElement: HTMLElement;

  const positions = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const arrows = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-900',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-900',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-900',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-900'
  };

  function handleMouseEnter() {
    if (disabled) return;
    
    timeoutId = setTimeout(() => {
      showTooltip = true;
    }, delay);
  }

  function handleMouseLeave() {
    clearTimeout(timeoutId);
    showTooltip = false;
  }

  function handleFocus() {
    if (disabled) return;
    showTooltip = true;
  }

  function handleBlur() {
    showTooltip = false;
  }
</script>

<div
  class="relative inline-block"
  bind:this={triggerElement}
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
  on:focus={handleFocus}
  on:blur={handleBlur}
>
  <slot />
  
  {#if showTooltip && text}
    <div
      bind:this={tooltipElement}
      class={`absolute z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded whitespace-nowrap ${positions[position]}`}
      role="tooltip"
    >
      {text}
      
      <!-- Arrow -->
      <div class={`absolute w-0 h-0 border-4 border-transparent ${arrows[position]}`}></div>
    </div>
  {/if}
</div>
```

## 🎯 Composants spécialisés

### 1. CompetenceCard - Carte de compétence

**Fichier : `src/lib/components/learning/CompetenceCard.svelte`**
```svelte
<script lang="ts">
  export let competence: {
    id: string;
    title: string;
    description: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    progression: number;
    status: 'not-started' | 'in-progress' | 'completed' | 'mastered';
    estimatedTime: number;
    prerequisites?: string[];
  };
  
  export let interactive = true;
  export let showProgress = true;
  
  import { createEventDispatcher } from 'svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import ProgressBar from './ProgressBar.svelte';
  
  const dispatch = createEventDispatcher<{
    select: { competenceId: string };
    start: { competenceId: string };
  }>();

  const levelColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  };

  const statusColors = {
    'not-started': 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'mastered': 'bg-purple-100 text-purple-800'
  };

  const statusLabels = {
    'not-started': 'Non démarré',
    'in-progress': 'En cours',
    'completed': 'Terminé',
    'mastered': 'Maîtrisé'
  };

  function handleCardClick() {
    if (interactive) {
      dispatch('select', { competenceId: competence.id });
    }
  }

  function handleStartClick(event: Event) {
    event.stopPropagation();
    dispatch('start', { competenceId: competence.id });
  }
</script>

<Card
  variant="interactive"
  clickable={interactive}
  class="h-full flex flex-col"
  on:click={handleCardClick}
>
  <!-- Header -->
  <div class="flex items-start justify-between mb-3">
    <div class="flex-1">
      <h3 class="font-semibold text-lg text-gray-900 mb-1">
        {competence.title}
      </h3>
      
      <div class="flex items-center gap-2 mb-2">
        <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${levelColors[competence.level]}`}>
          {competence.level}
        </span>
        
        <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[competence.status]}`}>
          {statusLabels[competence.status]}
        </span>
      </div>
    </div>

    {#if competence.estimatedTime}
      <div class="text-sm text-gray-500 flex items-center">
        <iconify-icon icon="mdi:clock-outline" class="w-4 h-4 mr-1"></iconify-icon>
        {competence.estimatedTime}min
      </div>
    {/if}
  </div>

  <!-- Description -->
  <p class="text-gray-600 text-sm mb-4 flex-1">
    {competence.description}
  </p>

  <!-- Progress -->
  {#if showProgress && competence.status !== 'not-started'}
    <div class="mb-4">
      <div class="flex items-center justify-between text-sm mb-1">
        <span class="text-gray-600">Progression</span>
        <span class="text-gray-900 font-medium">{competence.progression}%</span>
      </div>
      <ProgressBar value={competence.progression} />
    </div>
  {/if}

  <!-- Prerequisites -->
  {#if competence.prerequisites && competence.prerequisites.length > 0}
    <div class="mb-4">
      <span class="text-sm text-gray-600">Prérequis:</span>
      <div class="flex flex-wrap gap-1 mt-1">
        {#each competence.prerequisites as prereq}
          <span class="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
            {prereq}
          </span>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Actions -->
  <div class="mt-auto pt-4 border-t border-gray-200">
    {#if competence.status === 'not-started'}
      <Button
        variant="primary"
        size="sm"
        fullWidth
        on:click={handleStartClick}
      >
        Commencer
      </Button>
    {:else if competence.status === 'in-progress'}
      <Button
        variant="outline"
        size="sm"
        fullWidth
        on:click={handleStartClick}
      >
        Continuer
      </Button>
    {:else}
      <Button
        variant="ghost"
        size="sm"
        fullWidth
        on:click={handleStartClick}
      >
        Réviser
      </Button>
    {/if}
  </div>
</Card>
```

### 2. ProgressBar - Barre de progression

**Fichier : `src/lib/components/ui/ProgressBar.svelte`**
```svelte
<script lang="ts">
  export let value: number = 0;
  export let max: number = 100;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let variant: 'default' | 'success' | 'warning' | 'danger' = 'default';
  export let animated = false;
  export let showLabel = false;
  export let label = '';

  $: percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const variants = {
    default: 'bg-primary-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    danger: 'bg-red-600'
  };
</script>

<div class="w-full">
  {#if showLabel || label}
    <div class="flex justify-between text-sm mb-1">
      <span class="text-gray-700">{label}</span>
      <span class="text-gray-900 font-medium">{Math.round(percentage)}%</span>
    </div>
  {/if}
  
  <div class={`w-full bg-gray-200 rounded-full overflow-hidden ${sizes[size]}`}>
    <div
      class={`${variants[variant]} ${sizes[size]} rounded-full transition-all duration-300 ${animated ? 'animate-pulse' : ''}`}
      style="width: {percentage}%"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin="0"
      aria-valuemax={max}
      aria-label={label || `Progress ${Math.round(percentage)}%`}
    ></div>
  </div>
</div>
```

## 🔧 Utilitaires

### 1. Trap Focus pour modales

**Fichier : `src/lib/utils/trapFocus.ts`**
```typescript
export function trapFocus(node: HTMLElement) {
  const focusableElements = node.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          event.preventDefault();
        }
      }
    }
  }

  node.addEventListener('keydown', handleKeydown);

  // Focus le premier élément
  if (firstElement) {
    firstElement.focus();
  }

  return {
    destroy() {
      node.removeEventListener('keydown', handleKeydown);
    }
  };
}
```

### 2. Click Outside directive

**Fichier : `src/lib/utils/clickOutside.ts`**
```typescript
export function clickOutside(node: HTMLElement, handler: () => void) {
  function handleClick(event: MouseEvent) {
    if (!node.contains(event.target as Node)) {
      handler();
    }
  }

  document.addEventListener('click', handleClick, true);

  return {
    destroy() {
      document.removeEventListener('click', handleClick, true);
    }
  };
}
```

## 🧪 Tests

### Test des composants

**Fichier : `src/lib/components/ui/Button.test.ts`**
```typescript
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Button from './Button.svelte';

describe('Button', () => {
  it('devrait rendre avec le texte correct', () => {
    const { getByRole } = render(Button, { props: { children: 'Click me' } });
    
    const button = getByRole('button');
    expect(button).toHaveTextContent('Click me');
  });

  it('devrait être désactivé quand disabled=true', () => {
    const { getByRole } = render(Button, { 
      props: { disabled: true, children: 'Click me' } 
    });
    
    const button = getByRole('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('devrait déclencher l\'événement click', async () => {
    let clicked = false;
    const { getByRole } = render(Button, { 
      props: { children: 'Click me' } 
    });
    
    const button = getByRole('button');
    button.addEventListener('click', () => { clicked = true; });
    
    await fireEvent.click(button);
    expect(clicked).toBe(true);
  });

  it('devrait appliquer les bonnes classes selon le variant', () => {
    const { getByRole } = render(Button, { 
      props: { variant: 'danger', children: 'Delete' } 
    });
    
    const button = getByRole('button');
    expect(button.className).toContain('bg-red-600');
  });
});
```

## 📱 Design Responsive

### Breakpoints et utilités

**Fichier : `src/lib/styles/responsive.css`**
```css
/* Breakpoints personnalisés */
@custom-media --sm (min-width: 640px);
@custom-media --md (min-width: 768px);
@custom-media --lg (min-width: 1024px);
@custom-media --xl (min-width: 1280px);
@custom-media --2xl (min-width: 1536px);

/* Utilitaires de layout responsif */
.container-responsive {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}

@media (--sm) {
  .container-responsive {
    max-width: 640px;
  }
}

@media (--md) {
  .container-responsive {
    max-width: 768px;
  }
}

@media (--lg) {
  .container-responsive {
    max-width: 1024px;
    padding-left: 2rem;
    padding-right: 2rem;
  }
}

@media (--xl) {
  .container-responsive {
    max-width: 1280px;
  }
}

@media (--2xl) {
  .container-responsive {
    max-width: 1536px;
  }
}

/* Grid responsive */
.grid-responsive {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

@media (--sm) {
  .grid-responsive {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (--lg) {
  .grid-responsive {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
}

@media (--xl) {
  .grid-responsive {
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
  }
}
```

## 📚 Liens

- **Roadmap principale** : [DOC_ROADMAP_LEARNING.md](../../DOC_ROADMAP_LEARNING.md)
- **Référence Reactive Stores** : [reactive-stores.md](./reactive-stores.md)
- **Svelte Component API** : https://svelte.dev/docs#component-format
- **Accessibility Guidelines** : https://www.w3.org/WAI/WCAG21/quickref/
- **Design System Examples** : https://designsystemsrepo.com/

## 🔄 Historique des versions

- **v1.0.0** - Composants de base (Button, Card, Input)
- **v1.1.0** - Composants modaux et tooltips
- **v1.2.0** - Composants spécialisés pour l'apprentissage
- **v1.3.0** - Design system et tokens CSS
- **v1.4.0** - Utilitaires et accessibilité
- **v1.5.0** - Tests et responsive design

## 🤝 Contribution

Pour modifier cette référence :
1. Maintenir la compatibilité avec l'API existante
2. Suivre les guidelines d'accessibilité WCAG 2.1
3. Ajouter des tests pour les nouveaux composants
4. Documenter les props et événements
5. Optimiser les performances
