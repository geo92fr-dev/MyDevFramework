#  INDEX SNIPPETS - Framework Personnel v1.1

##  Snippets Disponibles (Phase 2)

###  Auth
- svelte-auth-firebase.js - Authentification Firebase compl�te pour Svelte
  - Store r�actif user/loading
  - Actions signIn/signUp/signOut
  - Gestion erreurs int�gr�e
  - **Usage:** import { user, authActions } from '/auth/svelte-auth-firebase.js'

###  UI Components  
- Modal.svelte - Modal r�utilisable avec animations
  - Tailles configurables (sm/md/lg/xl)  
  - Fermeture ESC + backdrop
  - Slots header/content/footer
  - **Usage:** <Modal bind:show={showModal} title="Titre">Contenu</Modal>

###  Utils
- generic-utils.js - Utilitaires JavaScript universels
  - formatDateFR() - Dates fran�ais
  - debounce() - Optimisation recherche  
  - isValidEmail() - Validation email
  - generateId() - ID uniques
  - handleError() - Gestion erreurs standardis�e

###  Stores (� venir Phase 2)
- Notifications toast
- �tat loading global
- Cache API intelligent

###  Hooks (� venir Phase 2)  
- useLocalStorage
- useDebounce
- useApi

##  Comment Utiliser

`ash
# Copier un snippet dans votre projet
copy C:\MyDevFramework\snippets\auth\svelte-auth-firebase.js src\lib\auth\
copy C:\MyDevFramework\snippets\ui\Modal.svelte src\lib\components\
`

##  �volution Phase 2

 **Extraction automatique** : 
pm run extract-patterns chemin-projet  
 **Post-mortem syst�matique** : 
pm run post-mortem "nom-projet"  
 **Enrichissement continu** au fil des projets

##  M�triques Phase 2

- **Snippets cr��s** : 3/10 (objectif mensuel)
- **Projets analys�s** : 1  
- **Patterns identifi�s** : Auth, Modal, Utils de base
- **Temps d'extraction** : 30min/snippet

---

**Phase 2 activ�e** : Framework en �volution organique !  
**Derni�re mise � jour** : 30/08/2025
