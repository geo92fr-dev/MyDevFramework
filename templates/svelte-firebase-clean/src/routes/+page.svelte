<script>
  import { auth } from '$lib/firebase.js';
  import { onAuthStateChanged } from 'firebase/auth';
  import { onMount } from 'svelte';

  let user = null;

  onMount(() => {
    onAuthStateChanged(auth, (currentUser) => {
      user = currentUser;
    });
  });
</script>

<svelte:head>
  <title>Nouveau Projet</title>
  <meta name="description" content="Application Svelte + Firebase" />
</svelte:head>

<main>
  <h1>🚀 Nouveau Projet Svelte + Firebase</h1>
  
  {#if user}
    <p>Connecté en tant que : {user.email}</p>
  {:else}
    <p>Non connecté</p>
  {/if}

  <div class="info">
    <p>Créé avec <strong>MyDevFramework</strong></p>
    <p>Prêt pour le développement !</p>
  </div>
</main>

<style>
  main {
    text-align: center;
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 2.5rem;
    font-weight: 100;
    margin-bottom: 2rem;
  }

  .info {
    background: #f9f9f9;
    padding: 1.5rem;
    border-radius: 8px;
    margin-top: 2rem;
  }

  .info p {
    margin: 0.5rem 0;
  }
</style>
