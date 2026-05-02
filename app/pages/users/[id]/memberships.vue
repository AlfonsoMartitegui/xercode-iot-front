<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from 'vue'
import { changeBeaverPassword, getTenantBeaverRoles, provisionBeaverUser } from '~/services/beaver.service'
import { getTenants } from '~/services/tenants.service'
import type { BeaverRole, Tenant, User, UserTenantMembership } from '~/services/types'
import {
  createUserTenant,
  deleteUserTenant,
  getUserTenants,
  getUsers,
  updateUserTenant,
} from '~/services/users.service'
import BaseAlert from '~/components/ui/BaseAlert.vue'
import BaseSpinner from '~/components/ui/BaseSpinner.vue'
import BeaverPasswordModal from '~/components/users/BeaverPasswordModal.vue'
import UserMembershipModal from '~/components/users/UserMembershipModal.vue'
import UserMembershipsPanel from '~/components/users/UserMembershipsPanel.vue'
import ContentLayout from '~/components/layout/ContentLayout.vue'

definePageMeta({
  middleware: ['auth', 'superadmin'],
  title: 'Tenant memberships',
  description: 'Cargando usuario...',
})

type MembershipForm = {
  tenant_id: string
  role: string
  beaver_role_id: string
  is_active: boolean
}

const emptyMembershipForm = (): MembershipForm => ({
  tenant_id: '',
  role: 'user',
  beaver_role_id: '',
  is_active: true,
})

const route = useRoute()
const notifications = useNotifications()
const user = ref<User | null>(null)
const tenants = ref<Tenant[]>([])
const memberships = ref<UserTenantMembership[]>([])
const membershipForm = ref<MembershipForm>(emptyMembershipForm())
const loading = ref(false)
const error = ref('')
const membershipLoading = ref(false)
const membershipError = ref('')
const membershipSavingKey = ref('')
const showMembershipModal = ref(false)
const beaverRolesByTenant = ref<Record<string, BeaverRole[]>>({})
const beaverRolesLoadingByTenant = ref<Record<string, boolean>>({})
const beaverRolesErrorByTenant = ref<Record<string, string>>({})
const passwordModal = ref({
  open: false,
  userId: null as number | null,
  tenantId: null as number | null,
  mode: 'change' as 'change' | 'provision',
})
const passwordForm = ref({
  password: '',
  confirmPassword: '',
})
const passwordModalError = ref('')
const passwordModalLoading = ref(false)

const userId = computed(() => {
  const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  return Number(id)
})

const appHeaderDescription = computed(() => {
  if (user.value) {
    return `Usuario: ${user.value.username} | Email: ${user.value.email}`
  }

  if (error.value) {
    return error.value
  }

  return 'Cargando usuario...'
})

const assignedTenantIds = computed(() => new Set(memberships.value.map((membership) => String(membership.tenant_id))))
const availableTenants = computed(() => tenants.value.filter((tenant) => !assignedTenantIds.value.has(String(tenant.id))))
const modalMembershipRolesState = computed(() => getBeaverRolesState(membershipForm.value.tenant_id))

function toMessage(err: unknown) {
  return err instanceof Error ? err.message : String(err)
}

async function ensureBeaverRolesLoaded(tenantId?: number | string) {
  if (!tenantId) {
    return []
  }

  const tenantKey = String(tenantId)

  if (beaverRolesByTenant.value[tenantKey]) {
    return beaverRolesByTenant.value[tenantKey]
  }

  beaverRolesLoadingByTenant.value = {
    ...beaverRolesLoadingByTenant.value,
    [tenantKey]: true,
  }
  beaverRolesErrorByTenant.value = {
    ...beaverRolesErrorByTenant.value,
    [tenantKey]: '',
  }

  try {
    const roles = await getTenantBeaverRoles(Number(tenantId))
    beaverRolesByTenant.value = {
      ...beaverRolesByTenant.value,
      [tenantKey]: roles,
    }
    return roles
  } catch (err) {
    beaverRolesErrorByTenant.value = {
      ...beaverRolesErrorByTenant.value,
      [tenantKey]: toMessage(err),
    }
    return []
  } finally {
    beaverRolesLoadingByTenant.value = {
      ...beaverRolesLoadingByTenant.value,
      [tenantKey]: false,
    }
  }
}

function getBeaverRolesState(tenantId?: number | string) {
  const tenantKey = String(tenantId || '')

  return {
    roles: beaverRolesByTenant.value[tenantKey] || [],
    loading: Boolean(beaverRolesLoadingByTenant.value[tenantKey]),
    error: beaverRolesErrorByTenant.value[tenantKey] || '',
  }
}

async function loadMemberships() {
  if (!userId.value) {
    return
  }

  membershipLoading.value = true
  membershipError.value = ''

  try {
    const data = await getUserTenants(userId.value)
    await Promise.all(data.map((membership) => ensureBeaverRolesLoaded(membership.tenant_id)))
    memberships.value = data
  } catch (err) {
    membershipError.value = toMessage(err)
  } finally {
    membershipLoading.value = false
  }
}

async function loadInitialData() {
  if (!userId.value) {
    error.value = 'Usuario no válido.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const [usersData, tenantsData, membershipsData] = await Promise.all([
      getUsers(),
      getTenants(),
      getUserTenants(userId.value),
    ])

    user.value = usersData.find((item) => Number(item.id) === userId.value) || null
    tenants.value = tenantsData
    memberships.value = membershipsData

    if (!user.value) {
      error.value = 'Usuario no encontrado.'
      return
    }

    await Promise.all(membershipsData.map((membership) => ensureBeaverRolesLoaded(membership.tenant_id)))
  } catch (err) {
    error.value = toMessage(err)
  } finally {
    loading.value = false
  }
}

function handleMembershipFormChange(userId: number, field: keyof MembershipForm, value: string | boolean) {
  if (field === 'tenant_id' && value) {
    ensureBeaverRolesLoaded(String(value))
  }

  membershipForm.value = {
    ...membershipForm.value,
    [field]: value,
    ...(field === 'tenant_id' ? { beaver_role_id: '' } : {}),
  }
}

function getMembershipPayload(membership: UserTenantMembership | MembershipForm) {
  return {
    role: String(membership.role || '').trim(),
    beaver_role_id: membership.beaver_role_id || null,
    is_active: Boolean(membership.is_active),
  }
}

async function handleCreateMembership(userId: number) {
  if (!membershipForm.value.tenant_id || !membershipForm.value.role.trim()) {
    membershipError.value = 'Tenant y rol son obligatorios.'
    return
  }

  membershipSavingKey.value = `${userId}-new`
  membershipError.value = ''

  try {
    await createUserTenant(userId, {
      tenant_id: Number(membershipForm.value.tenant_id),
      ...getMembershipPayload(membershipForm.value),
    })
    membershipForm.value = emptyMembershipForm()
    await loadMemberships()
    showMembershipModal.value = false
    notifications.success('Membresía creada correctamente.')
  } catch (err) {
    membershipError.value = toMessage(err)
  } finally {
    membershipSavingKey.value = ''
  }
}

function openMembershipModal() {
  membershipForm.value = emptyMembershipForm()
  membershipError.value = ''
  showMembershipModal.value = true
}

function closeMembershipModal() {
  showMembershipModal.value = false
  membershipForm.value = emptyMembershipForm()
}

function handleMembershipFieldChange(userId: number, tenantId: number, field: keyof UserTenantMembership, value: string | boolean) {
  memberships.value = memberships.value.map((membership) =>
    String(membership.tenant_id) === String(tenantId) ? { ...membership, [field]: value } : membership,
  )
}

async function handleUpdateMembership(userId: number, membership: UserTenantMembership) {
  if (!String(membership.role || '').trim()) {
    membershipError.value = 'El rol HUB es obligatorio.'
    return
  }

  const key = `${userId}-${membership.tenant_id}`
  membershipSavingKey.value = key
  membershipError.value = ''

  try {
    await updateUserTenant(userId, membership.tenant_id, getMembershipPayload(membership))
    await loadMemberships()
    notifications.success('Membresía actualizada correctamente.')
  } catch (err) {
    membershipError.value = toMessage(err)
  } finally {
    membershipSavingKey.value = ''
  }
}

async function handleDeleteMembership(userId: number, tenantId: number) {
  const key = `${userId}-${tenantId}-delete`
  membershipSavingKey.value = key
  membershipError.value = ''

  try {
    await deleteUserTenant(userId, tenantId)
    await loadMemberships()
    notifications.success('Membresía eliminada correctamente.')
  } catch (err) {
    membershipError.value = toMessage(err)
  } finally {
    membershipSavingKey.value = ''
  }
}

function openPasswordModal(userId: number, tenantId: number, mode: 'change' | 'provision') {
  passwordModal.value = { open: true, userId, tenantId, mode }
  passwordForm.value = { password: '', confirmPassword: '' }
  passwordModalError.value = ''
  passwordModalLoading.value = false
}

function closePasswordModal() {
  passwordModal.value = { open: false, userId: null, tenantId: null, mode: 'change' }
  passwordForm.value = { password: '', confirmPassword: '' }
  passwordModalError.value = ''
  passwordModalLoading.value = false
}

async function handlePasswordModalSubmit() {
  passwordModalError.value = ''

  if (!passwordForm.value.password || !passwordForm.value.confirmPassword) {
    passwordModalError.value = 'Debes rellenar ambos campos de contraseña.'
    return
  }

  if (passwordForm.value.password !== passwordForm.value.confirmPassword) {
    passwordModalError.value = 'Las contraseñas no coinciden.'
    return
  }

  if (!passwordModal.value.userId || !passwordModal.value.tenantId) {
    passwordModalError.value = 'Usuario o tenant no seleccionado.'
    return
  }

  passwordModalLoading.value = true

  try {
    if (passwordModal.value.mode === 'provision') {
      await provisionBeaverUser(passwordModal.value.userId, passwordModal.value.tenantId, passwordForm.value.password)
      notifications.success('Usuario provisionado en Beaver correctamente.')
    } else {
      await changeBeaverPassword(passwordModal.value.userId, passwordModal.value.tenantId, passwordForm.value.password)
      notifications.success('Contraseña Beaver actualizada correctamente.')
    }
    closePasswordModal()
  } catch (err) {
    passwordModalError.value = toMessage(err)
  } finally {
    passwordModalLoading.value = false
  }
}

onMounted(loadInitialData)

watchEffect(() => {
  route.meta.description = appHeaderDescription.value
})
</script>

<template>
  <ContentLayout>
    <template #toolbar>
      <header class="user-memberships-page__toolbar">
        <div class="user-memberships-page__actions">
          <NuxtLink class="user-memberships-page__back" to="/users">
            Volver a usuarios
          </NuxtLink>

          <button type="button" :disabled="loading" @click="openMembershipModal">
            Añadir membresía
          </button>
        </div>

        <button type="button" :disabled="membershipLoading || loading" @click="loadMemberships">
          {{ membershipLoading ? 'Cargando...' : 'Recargar' }}
        </button>
      </header>
    </template>

    <BaseAlert v-if="error" type="error">
      {{ error }}
    </BaseAlert>

    <BaseAlert v-if="loading" type="info">
      <BaseSpinner label="Cargando usuario..." />
    </BaseAlert>

    <UserMembershipsPanel
      v-else-if="user"
      :user="user"
      :tenants="tenants"
      :memberships="memberships"
      :loading="membershipLoading"
      :error="membershipError"
      :saving-key="membershipSavingKey"
      :roles-by-tenant="beaverRolesByTenant"
      :roles-loading-by-tenant="beaverRolesLoadingByTenant"
      :roles-error-by-tenant="beaverRolesErrorByTenant"
      @update-membership-field="handleMembershipFieldChange"
      @save-membership="handleUpdateMembership"
      @delete-membership="handleDeleteMembership"
      @password="(userId, tenantId) => openPasswordModal(userId, tenantId, 'change')"
      @provision="(userId, tenantId) => openPasswordModal(userId, tenantId, 'provision')"
    />
  </ContentLayout>

  <UserMembershipModal
    v-if="showMembershipModal && user"
    v-model="membershipForm"
    :tenants="availableTenants"
    :beaver-roles="modalMembershipRolesState.roles"
    :roles-loading="modalMembershipRolesState.loading"
    :roles-error="modalMembershipRolesState.error"
    :loading="membershipSavingKey === `${userId}-new`"
    :error="membershipError"
    @close="closeMembershipModal"
    @submit="handleCreateMembership(userId)"
    @tenant-change="(tenantId) => handleMembershipFormChange(userId, 'tenant_id', tenantId)"
  />

  <BeaverPasswordModal
    v-if="passwordModal.open"
    v-model:password="passwordForm.password"
    v-model:confirm-password="passwordForm.confirmPassword"
    :mode="passwordModal.mode"
    :loading="passwordModalLoading"
    :error="passwordModalError"
    @close="closePasswordModal"
    @submit="handlePasswordModalSubmit"
  />
</template>

<style scoped>
.user-memberships-page__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-width: 0;
}

.user-memberships-page__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.user-memberships-page__back {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.5rem;
  border-radius: 0.75rem;
  padding: 0.7rem 1rem;
  background: var(--color-primary-lighter);
  color: var(--color-primary-darker);
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;
}

.user-memberships-page__toolbar button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
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

.user-memberships-page__toolbar button:disabled {
  opacity: 0.65;
  cursor: wait;
}

@media (max-width: 720px) {
  .user-memberships-page__toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .user-memberships-page__actions {
    align-items: stretch;
    flex-direction: column;
    gap: 1rem;
  }

  .user-memberships-page__back,
  .user-memberships-page__actions button,
  .user-memberships-page__toolbar button {
    width: 100%;
    text-align: center;
  }
}
</style>
