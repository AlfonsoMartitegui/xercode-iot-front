<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  createTenant,
  createTenantDomain,
  deleteTenant,
  deleteTenantDomain,
  getTenant,
  getTenantDomain,
  getTenants,
  updateTenant,
  updateTenantDomain,
} from '~/services/tenants.service'
import type { Tenant, TenantDomainPayload, TenantPayload } from '~/services/types'
import BaseAlert from '~/components/ui/BaseAlert.vue'
import BaseSpinner from '~/components/ui/BaseSpinner.vue'
import TenantDomainModal from '~/components/tenants/TenantDomainModal.vue'
import TenantFormModal from '~/components/tenants/TenantFormModal.vue'
import TenantList from '~/components/tenants/TenantList.vue'

definePageMeta({
  layout: 'authenticated',
  middleware: ['auth', 'superadmin'],
})

const emptyForm = (): TenantPayload => ({
  name: '',
  code: '',
  address: '',
  redirect_url: '',
  beaver_base_url: '',
  beaver_admin_username: '',
  beaver_admin_password: '',
  is_active: true,
})

const emptyDomainForm = (): TenantDomainPayload => ({
  domain: '',
  is_primary: false,
})

const tenants = ref<Tenant[]>([])
const notifications = useNotifications()
const loading = ref(false)
const error = ref('')
const showCreateModal = ref(false)
const editModal = reactive({
  open: false,
  tenantId: null as number | null,
})
const modalLoading = ref(false)
const modalError = ref('')
const form = ref<TenantPayload>(emptyForm())
const domainForm = ref<TenantDomainPayload>(emptyDomainForm())
const domainModal = reactive({
  open: false,
  tenantId: null as number | null,
  domainId: null as number | null,
})
const domainModalLoading = ref(false)
const domainModalError = ref('')
const deletingTenantId = ref<number | null>(null)
const deletingDomainKey = ref('')
const totalDomains = computed(() => tenants.value.reduce((total, tenant) => total + (tenant.domains?.length || 0), 0))
const activeTenants = computed(() => tenants.value.filter((tenant) => tenant.is_active).length)

async function loadTenants() {
  loading.value = true
  error.value = ''

  try {
    tenants.value = await getTenants()
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}

function resetModalState() {
  form.value = emptyForm()
  modalError.value = ''
  modalLoading.value = false
  showCreateModal.value = false
  editModal.open = false
  editModal.tenantId = null
}

function resetDomainModalState() {
  domainForm.value = emptyDomainForm()
  domainModalError.value = ''
  domainModalLoading.value = false
  domainModal.open = false
  domainModal.tenantId = null
  domainModal.domainId = null
}

function buildTenantPayload() {
  const payload = { ...form.value }

  if (!payload.beaver_admin_password) {
    delete payload.beaver_admin_password
  }

  return payload
}

function openCreateModal() {
  form.value = emptyForm()
  modalError.value = ''
  showCreateModal.value = true
}

async function handleModalSubmit() {
  modalError.value = ''

  if (!form.value.name || !form.value.code) {
    modalError.value = 'Nombre y codigo son obligatorios.'
    return
  }

  modalLoading.value = true

  try {
    const payload = buildTenantPayload()
    const wasEditing = Boolean(editModal.open && editModal.tenantId)

    if (wasEditing && editModal.tenantId) {
      await updateTenant(editModal.tenantId, payload)
    } else {
      await createTenant(payload)
    }

    resetModalState()
    await loadTenants()
    notifications.success(wasEditing ? 'Tenant actualizado correctamente.' : 'Tenant creado correctamente.')
  } catch (err) {
    modalError.value = err instanceof Error ? err.message : String(err)
  } finally {
    modalLoading.value = false
  }
}

async function handleEditClick(tenantId: number) {
  modalError.value = ''
  modalLoading.value = true
  editModal.open = true
  editModal.tenantId = tenantId

  try {
    const tenant = await getTenant(tenantId)
    form.value = {
      name: tenant.name || '',
      code: tenant.code || '',
      address: tenant.address || '',
      redirect_url: tenant.redirect_url || '',
      beaver_base_url: tenant.beaver_base_url || '',
      beaver_admin_username: tenant.beaver_admin_username || '',
      beaver_admin_password: '',
      is_active: tenant.is_active ?? true,
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
    editModal.open = false
    editModal.tenantId = null
  } finally {
    modalLoading.value = false
  }
}

async function handleDeleteClick(tenantId: number) {
  deletingTenantId.value = tenantId
  error.value = ''

  try {
    await deleteTenant(tenantId)
    await loadTenants()
    notifications.success('Tenant eliminado correctamente.')
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    deletingTenantId.value = null
  }
}

function handleAddDomainClick(tenantId: number) {
  domainForm.value = emptyDomainForm()
  domainModalError.value = ''
  domainModal.open = true
  domainModal.tenantId = tenantId
  domainModal.domainId = null
}

async function handleEditDomainClick(tenantId: number, domainId: number) {
  domainModalError.value = ''
  domainModalLoading.value = true
  domainModal.open = true
  domainModal.tenantId = tenantId
  domainModal.domainId = domainId

  try {
    const domain = await getTenantDomain(tenantId, domainId)
    domainForm.value = {
      domain: domain.domain || '',
      is_primary: domain.is_primary ?? false,
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
    resetDomainModalState()
  } finally {
    domainModalLoading.value = false
  }
}

async function handleDomainSubmit() {
  domainModalError.value = ''

  if (!domainForm.value.domain) {
    domainModalError.value = 'El dominio es obligatorio.'
    return
  }

  if (!domainModal.tenantId) {
    domainModalError.value = 'Tenant no seleccionado.'
    return
  }

  domainModalLoading.value = true

  try {
    if (domainModal.domainId) {
      await updateTenantDomain(domainModal.tenantId, domainModal.domainId, domainForm.value)
    } else {
      await createTenantDomain(domainModal.tenantId, domainForm.value)
    }

    resetDomainModalState()
    await loadTenants()
    notifications.success(domainModal.domainId ? 'Dominio actualizado correctamente.' : 'Dominio creado correctamente.')
  } catch (err) {
    domainModalError.value = err instanceof Error ? err.message : String(err)
  } finally {
    domainModalLoading.value = false
  }
}

async function handleDeleteDomainClick(tenantId: number, domainId: number) {
  deletingDomainKey.value = `${tenantId}-${domainId}`
  error.value = ''

  try {
    await deleteTenantDomain(tenantId, domainId)
    await loadTenants()
    notifications.success('Dominio eliminado correctamente.')
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    deletingDomainKey.value = ''
  }
}

onMounted(loadTenants)
</script>

<template>
  <section class="tenants-page">
    <header class="tenants-page__header">
      <div>
        <p>Administracion</p>
        <h1>Tenants</h1>
      </div>

      <button type="button" @click="openCreateModal">
        Anadir tenant
      </button>
    </header>

    <section class="tenants-summary" aria-label="Resumen tenants">
      <article>
        <span>Total tenants</span>
        <strong>{{ tenants.length }}</strong>
      </article>
      <article>
        <span>Activos</span>
        <strong>{{ activeTenants }}</strong>
      </article>
      <article>
        <span>Dominios</span>
        <strong>{{ totalDomains }}</strong>
      </article>
    </section>

    <BaseAlert v-if="error" type="error">
      {{ error }}
    </BaseAlert>

    <BaseAlert v-if="loading" type="info">
      <BaseSpinner label="Cargando tenants..." />
    </BaseAlert>

    <TenantList
      v-else
      :tenants="tenants"
      :deleting-tenant-id="deletingTenantId"
      :deleting-domain-key="deletingDomainKey"
      @edit="handleEditClick"
      @delete="handleDeleteClick"
      @add-domain="handleAddDomainClick"
      @edit-domain="handleEditDomainClick"
      @delete-domain="handleDeleteDomainClick"
    />

    <TenantFormModal
      v-if="showCreateModal"
      v-model="form"
      title="Anadir tenant"
      submit-label="Crear tenant"
      :loading="modalLoading"
      :error="modalError"
      @close="resetModalState"
      @submit="handleModalSubmit"
    />

    <TenantFormModal
      v-if="editModal.open"
      v-model="form"
      title="Editar tenant"
      submit-label="Guardar cambios"
      :loading="modalLoading"
      :error="modalError"
      is-edit
      @close="resetModalState"
      @submit="handleModalSubmit"
    />

    <TenantDomainModal
      v-if="domainModal.open"
      v-model="domainForm"
      :title="domainModal.domainId ? 'Editar dominio' : 'Anadir dominio'"
      :submit-label="domainModal.domainId ? 'Guardar dominio' : 'Crear dominio'"
      :loading="domainModalLoading"
      :error="domainModalError"
      @close="resetDomainModalState"
      @submit="handleDomainSubmit"
    />
  </section>
</template>

<style scoped>
.tenants-page {
  display: grid;
  gap: 1rem;
}

.tenants-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-radius: 1rem;
  padding: 1rem;
  background: #ffffff;
  box-shadow: 0 12px 36px rgba(15, 23, 42, 0.07);
}

.tenants-page__header p,
.tenants-page__header h1 {
  margin: 0;
}

.tenants-page__header p {
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.tenants-page__header h1 {
  font-size: 1.8rem;
}

.tenants-page__header button {
  border: 0;
  border-radius: 0.75rem;
  padding: 0.8rem 1rem;
  background: #1d4ed8;
  color: #ffffff;
  cursor: pointer;
  font-weight: 700;
}

.tenants-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.tenants-summary article {
  display: grid;
  gap: 0.35rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1rem;
  background: #ffffff;
}

.tenants-summary span {
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 800;
  text-transform: uppercase;
}

.tenants-summary strong {
  color: #0f172a;
  font-size: 1.65rem;
}

@media (max-width: 640px) {
  .tenants-page__header {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
