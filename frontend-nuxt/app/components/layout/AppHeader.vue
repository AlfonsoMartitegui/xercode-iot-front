<script setup lang="ts">
const auth = useAuth()
</script>

<template>
  <header class="app-header">
    <div>
      <span>Area privada</span>
      <strong v-if="auth.user.value?.username">{{ auth.user.value.username }}</strong>
      <strong v-else>Xercode IoT</strong>
    </div>

    <button type="button" @click="auth.signOut()">
      Cerrar sesion
    </button>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.92);
  border-bottom: 1px solid #e2e8f0;
  backdrop-filter: blur(12px);
}

.app-header div {
  display: grid;
  gap: 0.15rem;
}

.app-header span {
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.app-header button {
  border: 0;
  border-radius: 0.7rem;
  padding: 0.65rem 1rem;
  background: #0f172a;
  color: #ffffff;
  cursor: pointer;
  font-weight: 700;
}
</style>
