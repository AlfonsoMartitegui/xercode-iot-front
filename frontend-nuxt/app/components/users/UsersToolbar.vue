<script setup lang="ts">
import type { Tenant } from '~/services/types'

defineProps<{
  tenants: Tenant[]
  selectedTenantIds: string[]
}>()

const emit = defineEmits<{
  'update:selectedTenantIds': [value: string[]]
  create: []
}>()

function handleFilterChange(event: Event) {
  const select = event.target as HTMLSelectElement
  emit(
    'update:selectedTenantIds',
    Array.from(select.selectedOptions).map((option) => option.value),
  )
}
</script>

<template>
  <header class="users-toolbar">
    <div class="users-toolbar__filters">
      <div>
        <p>Filtros</p>
        <strong>Usuarios</strong>
      </div>

      <label>
        <span>Filtrar por tenants</span>
        <select multiple :value="selectedTenantIds" @change="handleFilterChange">
          <option v-for="tenant in tenants" :key="tenant.id" :value="String(tenant.id)">
            {{ tenant.name }}
          </option>
        </select>
      </label>
    </div>

    <button type="button" @click="emit('create')">
      Crear nuevo usuario
    </button>
  </header>
</template>

<style scoped>
.users-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-radius: 1rem;
  padding: 1rem;
  background: #ffffff;
  box-shadow: 0 12px 36px rgba(15, 23, 42, 0.07);
}

.users-toolbar__filters {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.users-toolbar p,
.users-toolbar strong {
  margin: 0;
}

.users-toolbar p {
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.users-toolbar label {
  display: grid;
  gap: 0.35rem;
}

.users-toolbar label span {
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 700;
}

.users-toolbar select {
  min-width: 16rem;
  min-height: 4.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.7rem;
  padding: 0.45rem;
  background: #ffffff;
}

.users-toolbar button {
  border: 0;
  border-radius: 0.75rem;
  padding: 0.8rem 1rem;
  background: #1d4ed8;
  color: #ffffff;
  cursor: pointer;
  font-weight: 700;
}

@media (max-width: 720px) {
  .users-toolbar,
  .users-toolbar__filters {
    align-items: stretch;
    flex-direction: column;
  }

  .users-toolbar select {
    min-width: 100%;
  }
}
</style>
