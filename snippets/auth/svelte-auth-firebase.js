/**
 *  SVELTE AUTH FIREBASE
 * Snippet réutilisable pour authentification Firebase dans Svelte
 */

import { writable } from 'svelte/store';
import { auth } from '../firebase/config.js';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';

// Store réactif pour l'utilisateur
export const user = writable(null);
export const loading = writable(true);

// Initialisation de l'écoute auth
onAuthStateChanged(auth, (firebaseUser) => {
  user.set(firebaseUser);
  loading.set(false);
});

// Actions auth
export const authActions = {
  async signIn(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async signUp(email, password) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async signOut() {
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Usage dans composant:
// import { user, authActions } from '/auth/svelte-auth-firebase.js';
