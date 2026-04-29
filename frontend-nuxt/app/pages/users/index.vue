<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { changeBeaverPassword, getTenantBeaverRoles, provisionBeaverUser } from '~/services/beaver.service'
import { getTenants } from '~/services/tenants.service'
import type { BeaverRole, Tenant, User, UserTenantMembership } from '~/services/types'
import {
  createUser,
  createUserTenant,
  deleteUserTenant,
  editUser,
  getUserTenants,
  getUsers,
  updateUserTenant,
} from '~/services/users.service'
import type { UserCreateForm } from '~/components/users/UserFormModal.vue'
import BaseAlert from '~/components/ui/BaseAlert.vue'
import BaseSpinner from '~/components/ui/BaseSpinner.vue'
import BeaverPasswordModal from '~/components/users/BeaverPasswordModal.vue'
import UserFormModal from '~/components/users/UserFormModal.vue'
import UsersTable from '~/components/users/UsersTable.vue'
import UsersToolbar from '~/components/users/UsersToolbar.vue'

definePageMeta({
  layout: 'authenticated',
  middleware: ['auth', 'superadmin'],
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

const initialUserForm = (): UserCreateForm => ({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  is_active: true,
  is_superadmin: false,
  membership: emptyMembershipForm(),
})

const auth = useAuth()
const notifications = useNotifications()
const users = ref<User[]>([])
const tenants = ref<Tenant[]>([])
const selectedTenantIds = ref<string[]>([])
const error = ref('')
const loading = ref(false)
const modifiedUsers = ref<Record<number, boolean>>({})
const showModal = ref(false)
const form = ref<UserCreateForm>(initialUserForm())
const modalLoading = ref(false)
const modalError = ref('')
const membershipsByUser = ref<Record<number, UserTenantMembership[]>>({})
const membershipForms = ref<Record<number, MembershipForm>>({})
const membershipErrors = ref<Record<number, string>>({})
const membershipLoading = ref<Record<number, boolean>>({})
const membershipSavingKey = ref('')
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

const loggedUserId = computed(() => auth.user.value?.id ?? null)
const filteredUsers = computed(() => {
  if (selectedTenantIds.value.length === 0) {
    return users.value
  }

  return users.value.filter((user) => {
    const userTenantIds = (user.tenants || []).map((tenant) => String(tenant.id))
    return selectedTenantIds.value.some((tenantId) => userTenantIds.includes(tenantId))
  })
})
const activeUsers = computed(() => users.value.filter((user) => user.is_active).length)
const superadminUsers = computed(() => users.value.filter((user) => user.is_superadmin).length)
const totalMemberships = computed(() =>
  Object.values(membershipsByUser.value).reduce((total, memberships) => total + memberships.length, 0),
)

const modalMembershipRolesState = computed(() => getBeaverRolesState(form.value.membership.tenant_id))

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

async function loadMembershipsForUsers(userList: User[]) {
  membershipLoading.value = Object.fromEntries(userList.map((user) => [user.id, true]))

  const entries = await Promise.all(
    userList.map(async (user) => {
      try {
        const memberships = await getUserTenants(user.id)
        await Promise.all(memberships.map((membership) => ensureBeaverRolesLoaded(membership.tenant_id)))
        return [user.id, memberships] as const
      } catch (err) {
        membershipErrors.value = {
          ...membershipErrors.value,
          [user.id]: toMessage(err),
        }
        return [user.id, []] as const
      }
    }),
  )

  membershipsByUser.value = Object.fromEntries(entries)
  membershipLoading.value = Object.fromEntries(userList.map((user) => [user.id, false]))
}

async function loadUserMemberships(userId: number) {
  membershipLoading.value = {
    ...membershipLoading.value,
    [userId]: true,
  }
  membershipErrors.value = {
    ...membershipErrors.value,
    [userId]: '',
  }

  try {
    const memberships = await getUserTenants(userId)
    await Promise.all(memberships.map((membership) => ensureBeaverRolesLoaded(membership.tenant_id)))
    membershipsByUser.value = {
      ...membershipsByUser.value,
      [userId]: memberships,
    }
  } catch (err) {
    membershipErrors.value = {
      ...membershipErrors.value,
      [userId]: toMessage(err),
    }
  } finally {
    membershipLoading.value = {
      ...membershipLoading.value,
      [userId]: false,
    }
  }
}

async function loadUsers() {
  const data = await getUsers()
  users.value = data
  await loadMembershipsForUsers(data)
  return data
}

async function loadInitialData() {
  loading.value = true
  error.value = ''

  try {
    const [userData, tenantData] = await Promise.all([getUsers(), getTenants()])
    users.value = userData
    tenants.value = tenantData
    await loadMembershipsForUsers(userData)
  } catch (err) {
    error.value = toMessage(err)
  } finally {
    loading.value = false
  }
}

function handleActiveChange(id: number, value: boolean) {
  users.value = users.value.map((user) => (user.id === id ? { ...user, is_active: value } : user))
  modifiedUsers.value = {
    ...modifiedUsers.value,
    [id]: true,
  }
}

async function handleSave(user: User) {
  const email = user.email?.trim()

  if (!email) {
    error.value = 'El email es obligatorio.'
    return
  }

  try {
    await editUser(user.id, {
      email,
      is_active: user.is_active,
      is_superadmin: user.is_superadmin,
    })
    modifiedUsers.value = {
      ...modifiedUsers.value,
      [user.id]: false,
    }
    notifications.success('Usuario actualizado correctamente.')
  } catch (err) {
    error.value = toMessage(err)
  }
}

function resetCreateModal() {
  showModal.value = false
  form.value = initialUserForm()
  modalError.value = ''
  modalLoading.value = false
}

async function handleModalSubmit() {
  modalError.value = ''
  const username = form.value.username.trim()
  const email = form.value.email.trim()
  const isSuperadmin = Boolean(form.value.is_superadmin)
  const membership = form.value.membership

  if (!username || !email || !form.value.password || !form.value.confirmPassword) {
    modalError.value = 'Todos los campos son obligatorios.'
    return
  }

  if (form.value.password !== form.value.confirmPassword) {
    modalError.value = 'Las contrasenas no coinciden.'
    return
  }

  if (!isSuperadmin) {
    if (!membership.tenant_id || !membership.role.trim() || !membership.beaver_role_id) {
      modalError.value = 'Tenant, rol HUB y rol Beaver son obligatorios para usuarios normales.'
      return
    }

    const rolesState = getBeaverRolesState(membership.tenant_id)
    if (rolesState.loading) {
      modalError.value = 'Espera a que terminen de cargar los roles Beaver.'
      return
    }
    if (rolesState.error || rolesState.roles.length === 0) {
      modalError.value = 'No se pudieron validar roles Beaver para el tenant seleccionado.'
      return
    }
  }

  modalLoading.value = true

  try {
    const createdUser = await createUser({
      username,
      email,
      password: form.value.password,
      tenant_ids: [],
      is_active: form.value.is_active,
      is_superadmin: isSuperadmin,
    })

    const createdUserId = Number(createdUser.id || (createdUser.user as User | undefined)?.id || createdUser.user_id)

    if (!createdUserId) {
      throw new Error('Usuario creado, pero no se pudo obtener su ID para crear la membresia.')
    }

    if (!isSuperadmin) {
      await createUserTenant(createdUserId, {
        tenant_id: Number(membership.tenant_id),
        role: membership.role.trim(),
        beaver_role_id: membership.beaver_role_id,
        is_active: membership.is_active,
      })

      if (membership.is_active) {
        try {
          await provisionBeaverUser(createdUserId, Number(membership.tenant_id), form.value.password)
        } catch {
          resetCreateModal()
          await loadUsers()
          notifications.error('Usuario creado en HUB y membresia guardada, pero no se pudo provisionar en Beaver. Puedes reintentar.')
          return
        }
      }
    }

    resetCreateModal()
    await loadUsers()
    notifications.success('Usuario creado correctamente.')
  } catch (err) {
    modalError.value = toMessage(err)
  } finally {
    modalLoading.value = false
  }
}

function handleModalTenantChange(tenantId: string) {
  if (tenantId) {
    ensureBeaverRolesLoaded(tenantId)
  }
}

function getMembershipForm(userId: number) {
  return membershipForms.value[userId] || emptyMembershipForm()
}

function handleMembershipFormChange(userId: number, field: keyof MembershipForm, value: string | boolean) {
  if (field === 'tenant_id' && value) {
    ensureBeaverRolesLoaded(String(value))
  }

  membershipForms.value = {
    ...membershipForms.value,
    [userId]: {
      ...getMembershipForm(userId),
      [field]: value,
      ...(field === 'tenant_id' ? { beaver_role_id: '' } : {}),
    },
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
  const membershipForm = getMembershipForm(userId)

  if (!membershipForm.tenant_id || !membershipForm.role.trim()) {
    membershipErrors.value = {
      ...membershipErrors.value,
      [userId]: 'Tenant y rol son obligatorios.',
    }
    return
  }

  membershipSavingKey.value = `${userId}-new`
  membershipErrors.value = {
    ...membershipErrors.value,
    [userId]: '',
  }

  try {
    await createUserTenant(userId, {
      tenant_id: Number(membershipForm.tenant_id),
      ...getMembershipPayload(membershipForm),
    })
    membershipForms.value = {
      ...membershipForms.value,
      [userId]: emptyMembershipForm(),
    }
    await loadUserMemberships(userId)
    await loadUsers()
    notifications.success('Membresia creada correctamente.')
  } catch (err) {
    membershipErrors.value = {
      ...membershipErrors.value,
      [userId]: toMessage(err),
    }
  } finally {
    membershipSavingKey.value = ''
  }
}

function handleMembershipFieldChange(userId: number, tenantId: number, field: keyof UserTenantMembership, value: string | boolean) {
  membershipsByUser.value = {
    ...membershipsByUser.value,
    [userId]: (membershipsByUser.value[userId] || []).map((membership) =>
      String(membership.tenant_id) === String(tenantId) ? { ...membership, [field]: value } : membership,
    ),
  }
}

async function handleUpdateMembership(userId: number, membership: UserTenantMembership) {
  if (!String(membership.role || '').trim()) {
    membershipErrors.value = {
      ...membershipErrors.value,
      [userId]: 'El rol HUB es obligatorio.',
    }
    return
  }

  const key = `${userId}-${membership.tenant_id}`
  membershipSavingKey.value = key
  membershipErrors.value = {
    ...membershipErrors.value,
    [userId]: '',
  }

  try {
    await updateUserTenant(userId, membership.tenant_id, getMembershipPayload(membership))
    await loadUserMemberships(userId)
    notifications.success('Membresia actualizada correctamente.')
  } catch (err) {
    membershipErrors.value = {
      ...membershipErrors.value,
      [userId]: toMessage(err),
    }
  } finally {
    membershipSavingKey.value = ''
  }
}

async function handleDeleteMembership(userId: number, tenantId: number) {
  const key = `${userId}-${tenantId}-delete`
  membershipSavingKey.value = key
  membershipErrors.value = {
    ...membershipErrors.value,
    [userId]: '',
  }

  try {
    await deleteUserTenant(userId, tenantId)
    await loadUserMemberships(userId)
    await loadUsers()
    notifications.success('Membresia eliminada correctamente.')
  } catch (err) {
    membershipErrors.value = {
      ...membershipErrors.value,
      [userId]: toMessage(err),
    }
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
    passwordModalError.value = 'Debes rellenar ambos campos de contrasena.'
    return
  }

  if (passwordForm.value.password !== passwordForm.value.confirmPassword) {
    passwordModalError.value = 'Las contrasenas no coinciden.'
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
      notifications.success('Beaver password updated successfully.')
    }
    closePasswordModal()
  } catch (err) {
    passwordModalError.value = toMessage(err)
  } finally {
    passwordModalLoading.value = false
  }
}

onMounted(loadInitialData)
</script>

<template>
  <section class="users-page">
    <UsersToolbar
      v-model:selected-tenant-ids="selectedTenantIds"
      :tenants="tenants"
      @create="showModal = true"
    />

    <section class="users-summary" aria-label="Resumen usuarios">
      <article>
        <span>Total usuarios</span>
        <strong>{{ users.length }}</strong>
      </article>
      <article>
        <span>Activos</span>
        <strong>{{ activeUsers }}</strong>
      </article>
      <article>
        <span>Superadmins</span>
        <strong>{{ superadminUsers }}</strong>
      </article>
      <article>
        <span>Membresias</span>
        <strong>{{ totalMemberships }}</strong>
      </article>
    </section>

    <BaseAlert v-if="error" type="error">
      {{ error }}
    </BaseAlert>

    <BaseAlert v-if="loading" type="info">
      <BaseSpinner label="Cargando usuarios..." />
    </BaseAlert>

    <UsersTable
      v-else
      :users="filteredUsers"
      :logged-user-id="loggedUserId"
      :modified-users="modifiedUsers"
      :tenants="tenants"
      :memberships-by-user="membershipsByUser"
      :membership-forms="membershipForms"
      :membership-loading="membershipLoading"
      :membership-errors="membershipErrors"
      :membership-saving-key="membershipSavingKey"
      :roles-by-tenant="beaverRolesByTenant"
      :roles-loading-by-tenant="beaverRolesLoadingByTenant"
      :roles-error-by-tenant="beaverRolesErrorByTenant"
      @active-change="handleActiveChange"
      @save="handleSave"
      @reload-memberships="loadUserMemberships"
      @update-membership-field="handleMembershipFieldChange"
      @save-membership="handleUpdateMembership"
      @delete-membership="handleDeleteMembership"
      @update-membership-form="handleMembershipFormChange"
      @create-membership="handleCreateMembership"
      @password="(userId, tenantId) => openPasswordModal(userId, tenantId, 'change')"
      @provision="(userId, tenantId) => openPasswordModal(userId, tenantId, 'provision')"
    />

    <UserFormModal
      v-if="showModal"
      v-model="form"
      :tenants="tenants"
      :beaver-roles="modalMembershipRolesState.roles"
      :roles-loading="modalMembershipRolesState.loading"
      :roles-error="modalMembershipRolesState.error"
      :loading="modalLoading"
      :error="modalError"
      @close="resetCreateModal"
      @submit="handleModalSubmit"
      @tenant-change="handleModalTenantChange"
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
  </section>
</template>

<style scoped>
.users-page {
  display: grid;
  gap: 1rem;
}

.users-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.users-summary article {
  display: grid;
  gap: 0.35rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1rem;
  background: #ffffff;
}

.users-summary span {
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 800;
  text-transform: uppercase;
}

.users-summary strong {
  color: #0f172a;
  font-size: 1.65rem;
}
</style>
