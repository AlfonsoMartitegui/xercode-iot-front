<script setup lang="ts">
const route = useRoute()

const links = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Tenants', to: '/tenants' },
  { label: 'Users', to: '/users' },
]
</script>

<template>
  <aside class="app-sidebar">
    <div class="app-sidebar__brand">
      <strong>Xercode IoT</strong>
      <span>Admin Hub</span>
    </div>

    <nav aria-label="Navegacion privada">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        :class="{ 'is-active': route.path === link.to }"
      >
        {{ link.label }}
      </NuxtLink>
    </nav>
  </aside>
</template>

<style scoped>
.app-sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  min-height: 100vh;
  padding: 1.25rem;
  background: #0f172a;
  color: #ffffff;
}

.app-sidebar__brand {
  display: grid;
  gap: 0.2rem;
}

.app-sidebar__brand strong {
  font-size: 1.05rem;
}

.app-sidebar__brand span {
  color: #94a3b8;
  font-size: 0.85rem;
}

.app-sidebar nav {
  display: grid;
  gap: 0.45rem;
}

.app-sidebar a {
  border-radius: 0.8rem;
  padding: 0.75rem 0.85rem;
  color: #cbd5e1;
  text-decoration: none;
}

.app-sidebar a:hover,
.app-sidebar a.is-active {
  background: #1e293b;
  color: #ffffff;
}

@media (max-width: 820px) {
  .app-sidebar {
    min-height: auto;
  }

  .app-sidebar nav {
    grid-auto-flow: column;
    grid-auto-columns: max-content;
    overflow-x: auto;
  }
}
</style>
