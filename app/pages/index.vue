<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'superadmin'],
  title: 'Dashboard',
})

const auth = useAuth()
const username = computed(() => auth.user.value?.username || '')

const dashboardLinks = [
  {
    label: 'Tenants',
    description: 'Gestiona tenants, dominios y datos de conexión.',
    to: '/tenants',
  },
  {
    label: 'Users',
    description: 'Administra usuarios, accesos y pertenencias por tenant.',
    to: '/users',
  },
]
</script>

<template>
  <section class="dashboard-page">
    <div class="dashboard-page__intro">
      <h1 v-if="username">
        Bienvenido, {{ username }}.
      </h1>
      <h1 v-else>
        Bienvenido al área privada.
      </h1>
    </div>

    <nav class="dashboard-nav" aria-label="Navegación del dashboard">
      <NuxtLink
        v-for="link in dashboardLinks"
        :key="link.to"
        class="dashboard-nav__item"
        :to="link.to"
      >
        <span>
          <strong>{{ link.label }}</strong>
          <small>{{ link.description }}</small>
        </span>
        <span class="dashboard-nav__arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
          </svg>
        </span>
      </NuxtLink>
    </nav>
  </section>
</template>

<style scoped>
.dashboard-page {
  display: grid;
  gap: 1.5rem;
}

.dashboard-page__intro {
  display: grid;
  gap: 0.75rem;
}

.dashboard-page h1 {
  margin: 0;
  color: var(--color-heading);
  font-size: 2rem;
}

.dashboard-page p {
  margin: 0;
}

.dashboard-nav {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  width: 100%;
}

.dashboard-nav__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 8rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 1.25rem;
  background: var(--color-surface-strong);
  color: var(--color-text);
  text-decoration: none;
  box-shadow: 0 14px 35px rgba(var(--color-primary-rgb), 0.08);
}

.dashboard-nav__item:hover {
  border-color: var(--color-secondary);
  transform: translateY(-1px);
}

.dashboard-nav__item span:first-child {
  display: grid;
  gap: 0.4rem;
}

.dashboard-nav__item strong {
  font-size: 1.15rem;
}

.dashboard-nav__item small {
  color: var(--color-text-muted);
  font-size: 0.92rem;
  line-height: 1.45;
}

.dashboard-nav__arrow {
  display: inline-grid;
  flex: 0 0 2.25rem;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 999px;
  background: var(--color-primary);
  color: var(--color-white);
}

.dashboard-nav__arrow svg {
  width: 1.15rem;
  height: 1.15rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.4;
}

@media (max-width: 720px) {
  .dashboard-nav {
    grid-template-columns: 1fr;
  }
}
</style>
