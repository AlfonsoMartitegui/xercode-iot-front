<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { Tenant } from '~/services/types'

const props = defineProps<{
  tenants: Tenant[]
  selectedTenantIds: string[]
}>()

const emit = defineEmits<{
  'update:selectedTenantIds': [value: string[]]
  create: []
}>()

const open = ref(false)
const search = ref('')
const filterEl = ref<HTMLElement | null>(null)

const selectedTenants = computed(() =>
  props.selectedTenantIds
    .map((tenantId) => props.tenants.find((tenant) => String(tenant.id) === String(tenantId)))
    .filter((tenant): tenant is Tenant => Boolean(tenant)),
)

const filteredTenants = computed(() => {
  const query = search.value.trim().toLowerCase()

  if (!query) {
    return props.tenants
  }

  return props.tenants.filter((tenant) =>
    [tenant.name, tenant.code, String(tenant.id)]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query)),
  )
})

const filterLabel = computed(() => {
  if (selectedTenants.value.length === 0) {
    return 'Filtrar por tenant'
  }

  if (selectedTenants.value.length === 1) {
    return selectedTenants.value[0].name
  }

  return `${selectedTenants.value.length} tenants seleccionados`
})

function toggleTenant(tenantId: number) {
  const tenantKey = String(tenantId)
  const selected = props.selectedTenantIds.includes(tenantKey)

  emit(
    'update:selectedTenantIds',
    selected
      ? props.selectedTenantIds.filter((selectedTenantId) => selectedTenantId !== tenantKey)
      : [...props.selectedTenantIds, tenantKey],
  )
}

function clearFilters() {
  emit('update:selectedTenantIds', [])
  search.value = ''
}

function handleDocumentClick(event: MouseEvent) {
  if (!filterEl.value?.contains(event.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', handleDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', handleDocumentClick))
</script>

<template>
  <header class="users-toolbar">
    <button class="users-toolbar__create" type="button" @click="emit('create')">
      Crear nuevo usuario
    </button>

    <div ref="filterEl" class="users-toolbar__filter">
      <button
        class="users-toolbar__select"
        type="button"
        :aria-expanded="open"
        aria-haspopup="listbox"
        @click="open = !open"
      >
        <span :class="{ 'is-placeholder': selectedTenantIds.length === 0 }">
          {{ filterLabel }}
        </span>
        <svg
          class="users-toolbar__chevron"
          :class="{ 'is-open': open }"
          aria-hidden="true"
          viewBox="0 0 24 24"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div v-if="open" class="users-toolbar__dropdown">
        <input
          v-model="search"
          aria-label="Buscar tenant"
          placeholder="Buscar tenant..."
          type="search"
        >

        <div class="users-toolbar__options" role="listbox" aria-label="Tenants">
          <button
            v-for="tenant in filteredTenants"
            :key="tenant.id"
            class="users-toolbar__option"
            type="button"
            role="option"
            :aria-selected="selectedTenantIds.includes(String(tenant.id))"
            @click="toggleTenant(tenant.id)"
          >
            <span class="users-toolbar__check" aria-hidden="true">
              {{ selectedTenantIds.includes(String(tenant.id)) ? 'x' : '' }}
            </span>
            <span>{{ tenant.name }}</span>
          </button>

          <p v-if="filteredTenants.length === 0" class="users-toolbar__empty">
            Sin resultados
          </p>
        </div>

        <button
          v-if="selectedTenantIds.length"
          class="users-toolbar__clear"
          type="button"
          @click="clearFilters"
        >
          Limpiar seleccion
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.users-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-width: 0;
}

.users-toolbar__filter {
  position: relative;
  width: min(100%, 22rem);
}

.users-toolbar__select {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  min-height: 3.15rem;
  border: 1px solid var(--color-gray-300);
  border-radius: 0.75rem;
  padding: 0.75rem 0.9rem;
  background: var(--color-white);
  color: var(--color-text);
  font: inherit;
  font-weight: 500;
  outline: none;
  text-align: left;
  transition: border-color 160ms ease, box-shadow 160ms ease;
}

.users-toolbar__select:focus,
.users-toolbar__select[aria-expanded='true'] {
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 3px var(--color-focus);
}

.users-toolbar__select span:first-child {
  justify-self: start;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.users-toolbar__chevron {
  justify-self: end;
  width: 1rem;
  height: 1rem;
  color: var(--color-gray-700);
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.4;
  transition: transform 160ms ease;
}

.users-toolbar__chevron.is-open {
  transform: rotate(180deg);
}

.users-toolbar__select .is-placeholder {
  color: var(--color-text-muted);
}

.users-toolbar button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  min-height: 2.5rem;
  border: 0;
  border-radius: 0.75rem;
  padding: 0.7rem 1rem;
  background: var(--color-primary);
  color: var(--color-white);
  cursor: pointer;
  font-weight: 700;
  white-space: nowrap;
}

.users-toolbar button.users-toolbar__select {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  justify-content: stretch;
  gap: 0.75rem;
  width: 100%;
  min-height: 3.15rem;
  border: 1px solid var(--color-gray-300);
  padding: 0.75rem 0.9rem;
  background: var(--color-white);
  color: var(--color-text);
}

.users-toolbar__dropdown {
  position: absolute;
  top: calc(100% + 0.45rem);
  right: 0;
  z-index: 6;
  display: grid;
  gap: 0.6rem;
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  padding: 0.65rem;
  background: var(--color-surface-strong);
  box-shadow: 0 18px 42px rgba(var(--color-primary-rgb), 0.16);
}

.users-toolbar__dropdown input {
  width: 100%;
  border: 1px solid var(--color-gray-300);
  border-radius: 0.6rem;
  padding: 0.65rem 0.75rem;
  color: var(--color-text);
  font: inherit;
  outline: none;
}

.users-toolbar__dropdown input:focus {
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 3px var(--color-focus);
}

.users-toolbar__options {
  display: grid;
  max-height: 13rem;
  overflow: auto;
}

.users-toolbar button.users-toolbar__option {
  justify-content: flex-start;
  min-height: 2.45rem;
  border-radius: 0.55rem;
  padding: 0.45rem 0.55rem;
  background: var(--color-white);
  color: var(--color-text);
  font-weight: 600;
}

.users-toolbar button.users-toolbar__option:hover,
.users-toolbar button.users-toolbar__option[aria-selected='true'] {
  background: var(--color-primary-lighter);
}

.users-toolbar__check {
  display: inline-grid;
  place-items: center;
  flex: 0 0 1.1rem;
  width: 1.1rem;
  height: 1.1rem;
  border: 1px solid var(--color-info-border);
  border-radius: 0.35rem;
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 900;
}

.users-toolbar__empty {
  margin: 0;
  padding: 0.65rem;
  color: var(--color-text-muted);
}

.users-toolbar button.users-toolbar__clear {
  min-height: 2.25rem;
  border-radius: 0.6rem;
  background: var(--color-gray-100);
  color: var(--color-gray-700);
}

@media (max-width: 720px) {
  .users-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .users-toolbar__filter {
    justify-items: stretch;
    width: 100%;
  }

  .users-toolbar__create {
    width: 100%;
  }
}
</style>
