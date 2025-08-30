/**
 * @criticality HIGH
 * @depends src/lib/firebase/client.ts, src/stores/user.ts
 * @description Gère l'authentification Firebase et le store utilisateur
 * @phase 1
 * @category auth
 */

import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { writable } from 'svelte/store';
import { firebaseApp } from './client.ts';
import { userStore } from '../stores/user.ts';

export class AuthManager {
    constructor() {
        this.auth = getAuth(firebaseApp);
        this.provider = new GoogleAuthProvider();
    }

    /**
     * @criticality MEDIUM
     * @depends firebase/auth
     * @description Connexion utilisateur via Google OAuth
     * @phase 1
     * @category auth
     */
    async signInWithGoogle() {
        try {
            const result = await signInWithPopup(this.auth, this.provider);
            userStore.set(result.user);
            return { success: true, user: result.user };
        } catch (error) {
            console.error('Erreur connexion:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * @criticality LOW
     * @depends firebase/auth
     * @description Déconnexion utilisateur
     * @phase 1
     * @category auth
     */
    async signOut() {
        try {
            await this.auth.signOut();
            userStore.set(null);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}
