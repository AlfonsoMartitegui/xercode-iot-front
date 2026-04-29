<script setup lang="ts">
defineProps<{
  desktopVisible?: boolean
  mobileOpen?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const route = useRoute()
const auth = useAuth()

const links = [
  { label: 'Tenants', to: '/tenants' },
  { label: 'Users', to: '/users' },
]
</script>

<template>
  <aside
    id="app-sidebar"
    :class="[
      'app-sidebar',
      {
        'is-desktop-hidden': !desktopVisible,
        'is-mobile-open': mobileOpen,
      },
    ]"
  >
    <div class="app-sidebar__brand">
      <NuxtLink class="app-sidebar__brand-link" to="/">
        <strong>Xercode IoT</strong>
        <span>Admin Hub</span>
      </NuxtLink>

      <button type="button" aria-label="Cerrar navegacion" @click="emit('close')">
        x
      </button>
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

    <div class="app-sidebar__account">
      <div>
        <span>Area privada</span>
        <strong v-if="auth.user.value?.username">{{ auth.user.value.username }}</strong>
        <strong v-else>Xercode IoT</strong>
      </div>

      <button type="button" @click="auth.signOut()">
        Cerrar sesion
      </button>
    </div>
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
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.app-sidebar__brand-link {
  display: grid;
  gap: 0.2rem;
  min-width: 0;
  color: inherit;
  text-decoration: none;
}

.app-sidebar__brand-link:hover {
  color: inherit;
}

.app-sidebar__brand-link strong {
  font-size: 1.05rem;
}

.app-sidebar__brand-link span {
  color: #94a3b8;
  font-size: 0.85rem;
}

.app-sidebar__brand button {
  display: inline-grid;
  place-items: center;
  flex: 0 0 2rem;
  width: 2rem;
  height: 2rem;
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 0.55rem;
  padding: 0;
  background: transparent;
  color: #ffffff;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1;
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

.app-sidebar__account {
  display: grid;
  gap: 0.85rem;
  margin-top: auto;
  border-top: 1px solid rgba(148, 163, 184, 0.22);
  padding-top: 1rem;
}

.app-sidebar__account div {
  display: grid;
  gap: 0.2rem;
  min-width: 0;
}

.app-sidebar__account span {
  color: #94a3b8;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.app-sidebar__account strong {
  overflow: hidden;
  font-size: 0.95rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-sidebar__account button {
  border: 0;
  border-radius: 0.7rem;
  padding: 0.7rem 0.85rem;
  background: #ffffff;
  color: #0f172a;
  cursor: pointer;
  font-weight: 700;
}

@media (min-width: 821px) {
  .app-sidebar.is-desktop-hidden {
    display: none;
  }
}

@media (max-width: 820px) {
  .app-sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 30;
    width: min(20rem, calc(100vw - 3rem));
    min-height: 100vh;
    transform: translateX(-100%);
    box-shadow: 18px 0 40px rgba(15, 23, 42, 0.28);
    transition: transform 180ms ease;
  }

  .app-sidebar.is-mobile-open {
    transform: translateX(0);
  }
}
</style>
