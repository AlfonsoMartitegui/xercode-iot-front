<script setup lang="ts">
import type { BeaverRole, Tenant, User, UserTenantMembership } from '~/services/types'
import UserMembershipsPanel from '~/components/users/UserMembershipsPanel.vue'

type MembershipForm = {
  tenant_id: string
  role: string
  beaver_role_id: string
  is_active: boolean
}

defineProps<{
  user: User
  loggedUserId?: number | null
  modified?: boolean
  tenants: Tenant[]
  memberships: UserTenantMembership[]
  membershipForm: MembershipForm
  membershipLoading?: boolean
  membershipError?: string
  membershipSavingKey?: string
  rolesByTenant: Record<string, BeaverRole[]>
  rolesLoadingByTenant: Record<string, boolean>
  rolesErrorByTenant: Record<string, string>
}>()

const emit = defineEmits<{
  activeChange: [userId: number, value: boolean]
  save: [user: User]
  reloadMemberships: [userId: number]
  updateMembershipField: [userId: number, tenantId: number, field: keyof UserTenantMembership, value: string | boolean]
  saveMembership: [userId: number, membership: UserTenantMembership]
  deleteMembership: [userId: number, tenantId: number]
  updateMembershipForm: [userId: number, field: keyof MembershipForm, value: string | boolean]
  createMembership: [userId: number]
  password: [userId: number, tenantId: number]
  provision: [userId: number, tenantId: number]
}>()
</script>

<template>
  <article class="user-card">
    <button v-if="modified" class="user-card__save" type="button" title="Grabar cambios" @click="emit('save', user)">
      Guardar
    </button>

    <div class="user-card__title">
      <h2>{{ user.username }}</h2>
      <span v-if="user.is_superadmin">Superadmin</span>
    </div>

    <p class="user-card__email">{{ user.email }}</p>

    <label class="user-card__active">
      <span>Activo:</span>
      <input
        :checked="user.is_active"
        type="checkbox"
        :disabled="user.id === loggedUserId"
        @change="emit('activeChange', user.id, ($event.target as HTMLInputElement).checked)"
      >
      <small v-if="user.id === loggedUserId">No puedes desactivarte</small>
    </label>

    <p v-if="user.created_at" class="user-card__meta">
      Creado: {{ user.created_at }}
    </p>

    <section class="user-card__tenants">
      <strong>Tenants:</strong>
      <ul v-if="user.tenants?.length">
        <li v-for="tenant in user.tenants" :key="tenant.id">
          {{ tenant.name }}
        </li>
      </ul>
      <p v-else>Sin tenants</p>
    </section>

    <UserMembershipsPanel
      :user="user"
      :tenants="tenants"
      :memberships="memberships"
      :membership-form="membershipForm"
      :loading="membershipLoading"
      :error="membershipError"
      :saving-key="membershipSavingKey"
      :roles-by-tenant="rolesByTenant"
      :roles-loading-by-tenant="rolesLoadingByTenant"
      :roles-error-by-tenant="rolesErrorByTenant"
      @reload="emit('reloadMemberships', $event)"
      @update-membership-field="(userId, tenantId, field, value) => emit('updateMembershipField', userId, tenantId, field, value)"
      @save-membership="(userId, membership) => emit('saveMembership', userId, membership)"
      @delete-membership="(userId, tenantId) => emit('deleteMembership', userId, tenantId)"
      @update-form="(userId, field, value) => emit('updateMembershipForm', userId, field, value)"
      @create-membership="emit('createMembership', $event)"
      @password="(userId, tenantId) => emit('password', userId, tenantId)"
      @provision="(userId, tenantId) => emit('provision', userId, tenantId)"
    />
  </article>
</template>

<style scoped>
.user-card {
  position: relative;
  display: grid;
  gap: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1rem;
  background: #ffffff;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}

.user-card__save {
  position: absolute;
  top: 1rem;
  right: 1rem;
  border: 0;
  border-radius: 999px;
  padding: 0.45rem 0.75rem;
  background: #16a34a;
  color: #ffffff;
  cursor: pointer;
  font-weight: 700;
}

.user-card__title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-right: 5rem;
}

.user-card h2,
.user-card p {
  margin: 0;
}

.user-card h2 {
  color: #1d4ed8;
  font-size: 1.2rem;
}

.user-card__title span {
  border-radius: 999px;
  padding: 0.25rem 0.55rem;
  background: #fde68a;
  color: #713f12;
  font-size: 0.75rem;
  font-weight: 800;
}

.user-card__email {
  color: #334155;
}

.user-card__active {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-card__active small {
  color: #dc2626;
}

.user-card__meta,
.user-card__tenants {
  color: #64748b;
  font-size: 0.9rem;
}

.user-card__tenants ul {
  margin: 0.3rem 0 0;
  padding-left: 1.1rem;
}
</style>
