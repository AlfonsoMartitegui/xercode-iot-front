<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getTenantBeaverRoles, provisionBeaverUser } from '~/services/beaver.service'
import { getTenants } from '~/services/tenants.service'
import type { BeaverRole, Tenant, User } from '~/services/types'
import { createUser, createUserTenant, editUser, getUsers } from '~/services/users.service'
import type { UserCreateForm } from '~/components/users/UserFormModal.vue'
import BaseAlert from '~/components/ui/BaseAlert.vue'
import BaseSpinner from '~/components/ui/BaseSpinner.vue'
import UserFormModal from '~/components/users/UserFormModal.vue'
import UsersTable from '~/components/users/UsersTable.vue'
import UsersToolbar from '~/components/users/UsersToolbar.vue'
import ContentLayout from '~/components/layout/ContentLayout.vue'

definePageMeta({
  middleware: ['auth', 'superadmin'],
  title: 'Usuarios',
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
const beaverRolesByTenant = ref<Record<string, BeaverRole[]>>({})
const beaverRolesLoadingByTenant = ref<Record<string, boolean>>({})
const beaverRolesErrorByTenant = ref<Record<string, string>>({})

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

async function loadUsers() {
  const data = await getUsers()
  users.value = data
  return data
}

async function loadInitialData() {
  loading.value = true
  error.value = ''

  try {
    const [userData, tenantData] = await Promise.all([getUsers(), getTenants()])
    users.value = userData
    tenants.value = tenantData
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

onMounted(loadInitialData)
</script>

<template>
  <ContentLayout>
    <template #toolbar>
      <UsersToolbar
        v-model:selected-tenant-ids="selectedTenantIds"
        :tenants="tenants"
        @create="showModal = true"
      />
    </template>

    <!-- <section class="users-summary" aria-label="Resumen usuarios">
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
    </section> -->

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
      @active-change="handleActiveChange"
      @save="handleSave"
    />
  </ContentLayout>

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
</template>
