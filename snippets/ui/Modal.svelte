<!-- 
 MODAL COMPONENT SVELTE RÉUTILISABLE
Composant modal générique avec animations
-->

<script>
  import { createEventDispatcher } from 'svelte';
  
  export let show = false;
  export let title = '';
  export let closable = true;
  export let size = 'md'; // sm, md, lg, xl
  
  const dispatch = createEventDispatcher();
  
  function closeModal() {
    if (closable) {
      show = false;
      dispatch('close');
    }
  }
  
  function handleKeydown(event) {
    if (event.key === 'Escape' && closable) {
      closeModal();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
  <div class="modal-backdrop" on:click={closeModal} on:keydown={handleKeydown}>
    <div class="modal modal-{size}" on:click|stopPropagation on:keydown|stopPropagation>
      {#if title || closable}
        <header class="modal-header">
          {#if title}
            <h2 class="modal-title">{title}</h2>
          {/if}
          {#if closable}
            <button class="modal-close" on:click={closeModal}></button>
          {/if}
        </header>
      {/if}
      
      <main class="modal-content">
        <slot />
      </main>
      
      {#if UTF8slots.footer}
        <footer class="modal-footer">
          <slot name="footer" />
        </footer>
      {/if}
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal {
    background: white;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .modal-sm { width: 90%; max-width: 400px; }
  .modal-md { width: 90%; max-width: 600px; }
  .modal-lg { width: 90%; max-width: 800px; }
  .modal-xl { width: 90%; max-width: 1200px; }
  
  .modal-header {
    padding: 1rem;
    border-bottom: 1px solid #e5e5e5;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .modal-title {
    margin: 0;
    font-size: 1.25rem;
  }
  
  .modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 2rem;
    height: 2rem;
  }
  
  .modal-content {
    padding: 1rem;
  }
  
  .modal-footer {
    padding: 1rem;
    border-top: 1px solid #e5e5e5;
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
  }
</style>

<!-- 
USAGE:
<script>
  import Modal from '/ui/Modal.svelte';
  let showModal = false;
</script>

<Modal bind:show={showModal} title="Mon Modal" on:close={() => console.log('Fermé')}>
  <p>Contenu du modal</p>
  
  <div slot="footer">
    <button on:click={() => showModal = false}>Annuler</button>
    <button on:click={handleConfirm}>Confirmer</button>
  </div>
</Modal>
-->
