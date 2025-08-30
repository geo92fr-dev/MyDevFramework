/**
 *  UTILS GÉNÉRIQUES JAVASCRIPT
 * Collection d'utilitaires réutilisables
 */

// Formatage date français
export function formatDateFR(date) {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
}

// Debounce pour optimiser les recherches
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Validation email simple
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Génération d'ID unique
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Gestion erreurs standardisée
export function handleError(error, context = '') {
  console.error([] Erreur:, error);
  
  // Pour développement
  if (import.meta.env.DEV) {
    console.trace();
  }
  
  return {
    message: error.message || 'Une erreur est survenue',
    code: error.code || 'UNKNOWN_ERROR',
    context
  };
}

// Usage: import { formatDateFR, debounce } from '/utils/generic-utils.js';
