<script setup lang="ts">
import type { BeaverRole, Tenant, User, UserTenantMembership } from '~/services/types'
import UserCard from '~/components/users/UserCard.vue'

type MembershipForm = {
  tenant_id: string
  role: string
  beaver_role_id: string
  is_active: boolean
}

defineProps<{
  users: User[]
  loggedUserId?: number | null
  modifiedUsers: Record<number, boolean>
  tenants: Tenant[]
  membershipsByUser: Record<number, UserTenantMembership[]>
  membershipForms: Record<number, MembershipForm>
  membershipLoading: Record<number, boolean>
  membershipErrors: Record<number, string>
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

const emptyMembershipForm: MembershipForm = {
  tenant_id: '',
  role: 'user',
  beaver_role_id: '',
  is_active: true,
}
</script>

<template>
  <div v-if="users.length" class="users-grid">
    <UserCard
      v-for="user in users"
      :key="user.id"
      :user="user"
      :logged-user-id="loggedUserId"
      :modified="modifiedUsers[user.id]"
      :tenants="tenants"
      :memberships="membershipsByUser[user.id] || []"
      :membership-form="membershipForms[user.id] || emptyMembershipForm"
      :membership-loading="membershipLoading[user.id]"
      :membership-error="membershipErrors[user.id]"
      :membership-saving-key="membershipSavingKey"
      :roles-by-tenant="rolesByTenant"
      :roles-loading-by-tenant="rolesLoadingByTenant"
      :roles-error-by-tenant="rolesErrorByTenant"
      @active-change="(userId, value) => emit('activeChange', userId, value)"
      @save="emit('save', $event)"
      @reload-memberships="emit('reloadMemberships', $event)"
      @update-membership-field="(userId, tenantId, field, value) => emit('updateMembershipField', userId, tenantId, field, value)"
      @save-membership="(userId, membership) => emit('saveMembership', userId, membership)"
      @delete-membership="(userId, tenantId) => emit('deleteMembership', userId, tenantId)"
      @update-membership-form="(userId, field, value) => emit('updateMembershipForm', userId, field, value)"
      @create-membership="emit('createMembership', $event)"
      @password="(userId, tenantId) => emit('password', userId, tenantId)"
      @provision="(userId, tenantId) => emit('provision', userId, tenantId)"
    />
  </div>

  <div v-else class="users-grid__empty">
    No hay usuarios para mostrar.
  </div>
</template>

<style scoped>
.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 24rem), 1fr));
  gap: 1rem;
}

.users-grid__empty {
  border: 1px dashed #cbd5e1;
  border-radius: 1rem;
  padding: 2rem;
  background: #ffffff;
  color: #64748b;
  text-align: center;
}
</style>
