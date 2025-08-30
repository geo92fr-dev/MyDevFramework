#  INDEX SNIPPETS - Framework Personnel v1.1

##  Snippets Disponibles (Phase 2)

###  Auth
- svelte-auth-firebase.js - Authentification Firebase complète pour Svelte
  - Store réactif user/loading
  - Actions signIn/signUp/signOut
  - Gestion erreurs intégrée
  - **Usage:** import { user, authActions } from '/auth/svelte-auth-firebase.js'

###  UI Components  
- Modal.svelte - Modal réutilisable avec animations
  - Tailles configurables (sm/md/lg/xl)  
  - Fermeture ESC + backdrop
  - Slots header/content/footer
  - **Usage:** <Modal bind:show={showModal} title="Titre">Contenu</Modal>

###  Utils
- generic-utils.js - Utilitaires JavaScript universels
  - formatDateFR() - Dates français
  - debounce() - Optimisation recherche  
  - isValidEmail() - Validation email
  - generateId() - ID uniques
  - handleError() - Gestion erreurs standardisée

###  Stores (À venir Phase 2)
- Notifications toast
- État loading global
- Cache API intelligent

###  Hooks (À venir Phase 2)  
- useLocalStorage
- useDebounce
- useApi

##  Comment Utiliser

`ash
# Copier un snippet dans votre projet
copy C:\MyDevFramework\snippets\auth\svelte-auth-firebase.js src\lib\auth\
copy C:\MyDevFramework\snippets\ui\Modal.svelte src\lib\components\
`

##  Évolution Phase 2

 **Extraction automatique** : 
pm run extract-patterns chemin-projet  
 **Post-mortem systématique** : 
pm run post-mortem "nom-projet"  
 **Enrichissement continu** au fil des projets

##  Métriques Phase 2

- **Snippets créés** : 3/10 (objectif mensuel)
- **Projets analysés** : 1  
- **Patterns identifiés** : Auth, Modal, Utils de base
- **Temps d'extraction** : 30min/snippet

---

**Phase 2 activée** : Framework en évolution organique !  
**Dernière mise à jour** : 30/08/2025
