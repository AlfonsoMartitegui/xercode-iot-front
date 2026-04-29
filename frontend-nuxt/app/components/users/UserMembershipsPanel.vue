<script setup lang="ts">
import type { BeaverRole, Tenant, User, UserTenantMembership } from '~/services/types'

type MembershipForm = {
  tenant_id: string
  role: string
  beaver_role_id: string
  is_active: boolean
}

const props = defineProps<{
  user: User
  tenants: Tenant[]
  memberships: UserTenantMembership[]
  membershipForm: MembershipForm
  loading?: boolean
  error?: string
  savingKey?: string
  rolesByTenant: Record<string, BeaverRole[]>
  rolesLoadingByTenant: Record<string, boolean>
  rolesErrorByTenant: Record<string, string>
}>()

const emit = defineEmits<{
  reload: [userId: number]
  updateMembershipField: [userId: number, tenantId: number, field: keyof UserTenantMembership, value: string | boolean]
  saveMembership: [userId: number, membership: UserTenantMembership]
  deleteMembership: [userId: number, tenantId: number]
  updateForm: [userId: number, field: keyof MembershipForm, value: string | boolean]
  createMembership: [userId: number]
  password: [userId: number, tenantId: number]
  provision: [userId: number, tenantId: number]
}>()

const assignedTenantIds = computed(() => new Set(props.memberships.map((membership) => String(membership.tenant_id))))
const availableTenants = computed(() => props.tenants.filter((tenant) => !assignedTenantIds.value.has(String(tenant.id))))

function getTenantName(tenantId: number) {
  const tenant =
    props.tenants.find((item) => String(item.id) === String(tenantId)) ||
    props.user.tenants?.find((item) => String(item.id) === String(tenantId))

  return tenant?.name || `Tenant ${tenantId}`
}

function getRoleValue(role: BeaverRole) {
  return String(role.role_id ?? role.id ?? '')
}

function getRoles(tenantId?: number | string) {
  return props.rolesByTenant[String(tenantId || '')] || []
}

function isRolesLoading(tenantId?: number | string) {
  return Boolean(props.rolesLoadingByTenant[String(tenantId || '')])
}

function getRolesError(tenantId?: number | string) {
  return props.rolesErrorByTenant[String(tenantId || '')] || ''
}
</script>

<template>
  <section class="memberships">
    <header>
      <div>
        <h3>
          Tenant memberships
          <span v-if="loading" class="memberships__dots">...</span>
        </h3>
        <p>Roles y mapeos guardados en HUB. Puedes provisionar Beaver desde cada membresia activa.</p>
      </div>

      <button type="button" :disabled="loading" @click="emit('reload', user.id)">
        {{ loading ? 'Cargando...' : 'Recargar' }}
      </button>
    </header>

    <p v-if="error" class="memberships__error">
      {{ error }}
    </p>

    <div class="memberships__items">
      <p v-if="loading && memberships.length === 0" class="memberships__info">
        Cargando memberships y roles Beaver...
      </p>

      <article v-for="membership in memberships" :key="`${user.id}-${membership.tenant_id}`" class="membership-card">
        <h4>{{ getTenantName(membership.tenant_id) }}</h4>

        <label>
          <span>Rol HUB</span>
          <select :value="membership.role" @change="emit('updateMembershipField', user.id, membership.tenant_id, 'role', ($event.target as HTMLSelectElement).value)">
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </label>

        <label>
          <span>Rol Beaver</span>
          <select
            v-if="!isRolesLoading(membership.tenant_id) && !getRolesError(membership.tenant_id)"
            :value="String(membership.beaver_role_id || '')"
            @change="emit('updateMembershipField', user.id, membership.tenant_id, 'beaver_role_id', ($event.target as HTMLSelectElement).value)"
          >
            <option value="">Selecciona rol Beaver...</option>
            <option v-for="role in getRoles(membership.tenant_id)" :key="getRoleValue(role)" :value="getRoleValue(role)">
              {{ role.name || role.display_name || getRoleValue(role) }}
            </option>
          </select>
          <small v-else-if="isRolesLoading(membership.tenant_id)">Loading Beaver roles...</small>
          <small v-else class="memberships__error">{{ getRolesError(membership.tenant_id) }}</small>
        </label>

        <label class="membership-card__check">
          <input
            :checked="membership.is_active"
            type="checkbox"
            @change="emit('updateMembershipField', user.id, membership.tenant_id, 'is_active', ($event.target as HTMLInputElement).checked)"
          >
          <span>Membresia activa</span>
        </label>

        <div class="membership-card__actions">
          <button type="button" :disabled="savingKey === `${user.id}-${membership.tenant_id}`" @click="emit('saveMembership', user.id, membership)">
            {{ savingKey === `${user.id}-${membership.tenant_id}` ? 'Guardando...' : 'Guardar' }}
          </button>
          <button class="amber" type="button" @click="emit('password', user.id, membership.tenant_id)">
            Cambiar contrasena
          </button>
          <button class="green" type="button" :disabled="!membership.is_active || !membership.beaver_role_id" @click="emit('provision', user.id, membership.tenant_id)">
            Provisionar Beaver
          </button>
          <button class="danger" type="button" :disabled="savingKey === `${user.id}-${membership.tenant_id}-delete`" @click="emit('deleteMembership', user.id, membership.tenant_id)">
            {{ savingKey === `${user.id}-${membership.tenant_id}-delete` ? 'Borrando...' : 'Borrar' }}
          </button>
        </div>
      </article>

      <p v-if="!loading && memberships.length === 0" class="memberships__empty">
        Sin membresias explicitas
      </p>
    </div>

    <section class="memberships__new">
      <h4>Anadir membresia</h4>

      <select :value="membershipForm.tenant_id" @change="emit('updateForm', user.id, 'tenant_id', ($event.target as HTMLSelectElement).value)">
        <option value="">Selecciona tenant...</option>
        <option v-for="tenant in availableTenants" :key="tenant.id" :value="String(tenant.id)">
          {{ tenant.name }}
        </option>
      </select>

      <select :value="membershipForm.role" @change="emit('updateForm', user.id, 'role', ($event.target as HTMLSelectElement).value)">
        <option value="user">user</option>
        <option value="admin">admin</option>
      </select>

      <select
        :value="membershipForm.beaver_role_id"
        :disabled="!membershipForm.tenant_id || isRolesLoading(membershipForm.tenant_id) || Boolean(getRolesError(membershipForm.tenant_id))"
        @change="emit('updateForm', user.id, 'beaver_role_id', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">
          {{ membershipForm.tenant_id ? 'Selecciona rol Beaver...' : 'Selecciona tenant primero...' }}
        </option>
        <option v-for="role in getRoles(membershipForm.tenant_id)" :key="getRoleValue(role)" :value="getRoleValue(role)">
          {{ role.name || role.display_name || getRoleValue(role) }}
        </option>
      </select>

      <small v-if="isRolesLoading(membershipForm.tenant_id)">Loading Beaver roles...</small>
      <small v-else-if="getRolesError(membershipForm.tenant_id)" class="memberships__error">{{ getRolesError(membershipForm.tenant_id) }}</small>

      <label class="membership-card__check">
        <input :checked="membershipForm.is_active" type="checkbox" @change="emit('updateForm', user.id, 'is_active', ($event.target as HTMLInputElement).checked)">
        <span>Activa</span>
      </label>

      <button type="button" :disabled="savingKey === `${user.id}-new` || availableTenants.length === 0" @click="emit('createMembership', user.id)">
        {{ savingKey === `${user.id}-new` ? 'Anadiendo...' : 'Anadir membresia' }}
      </button>
    </section>
  </section>
</template>

<style scoped>
.memberships {
  display: grid;
  gap: 1rem;
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
}

.memberships header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.memberships h3,
.memberships h4,
.memberships p {
  margin: 0;
}

.memberships p,
.memberships small {
  color: #64748b;
}

.memberships button {
  border: 0;
  border-radius: 0.55rem;
  padding: 0.5rem 0.7rem;
  background: #1d4ed8;
  color: #ffffff;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 700;
}

.memberships button:disabled {
  opacity: 0.65;
  cursor: wait;
}

.memberships__items,
.memberships__new,
.membership-card {
  display: grid;
  gap: 0.7rem;
}

.membership-card,
.memberships__new,
.memberships__info {
  border: 1px solid #e2e8f0;
  border-radius: 0.8rem;
  padding: 0.8rem;
  background: #f8fafc;
}

.membership-card label {
  display: grid;
  gap: 0.3rem;
}

.membership-card select,
.memberships__new select {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 0.55rem;
  padding: 0.55rem;
  background: #ffffff;
}

.membership-card__check {
  display: flex !important;
  align-items: center;
  gap: 0.5rem !important;
}

.membership-card__check input {
  width: auto;
}

.membership-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.membership-card__actions .amber {
  background: #d97706;
}

.membership-card__actions .green {
  background: #059669;
}

.membership-card__actions .danger {
  background: #dc2626;
}

.memberships__error {
  color: #b91c1c !important;
}

.memberships__empty {
  color: #94a3b8;
}
</style>
