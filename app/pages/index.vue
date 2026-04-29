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
    description: 'Gestiona tenants, dominios y datos de conexion.',
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
      <h1>Dashboard</h1>
      <p v-if="username">
        Bienvenido, {{ username }}.
      </p>
      <p v-else>
        Bienvenido al area privada.
      </p>
    </div>

    <nav class="dashboard-nav" aria-label="Navegacion del dashboard">
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
        <span class="dashboard-nav__arrow" aria-hidden="true">-></span>
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
  font-size: 2rem;
}

.dashboard-page p {
  margin: 0;
}

.dashboard-nav {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  max-width: 56rem;
}

.dashboard-nav__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 8rem;
  border: 1px solid #dbe4ee;
  border-radius: 0.5rem;
  padding: 1.25rem;
  background: #ffffff;
  color: #1f2937;
  text-decoration: none;
  box-shadow: 0 14px 35px rgba(15, 23, 42, 0.08);
}

.dashboard-nav__item:hover {
  border-color: #38bdf8;
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
  color: #64748b;
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
  background: #0f172a;
  color: #ffffff;
  font-weight: 800;
}

@media (max-width: 720px) {
  .dashboard-nav {
    grid-template-columns: 1fr;
  }
}
</style>
