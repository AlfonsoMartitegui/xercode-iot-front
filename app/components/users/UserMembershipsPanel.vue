<script setup lang="ts">
import type { BeaverRole, Tenant, User, UserTenantMembership } from '~/services/types'
import BaseCard from '~/components/ui/BaseCard.vue'
import BaseCardList from '~/components/ui/BaseCardList.vue'
import BaseDataTable from '~/components/ui/BaseDataTable.vue'

const props = defineProps<{
  user: User
  tenants: Tenant[]
  memberships: UserTenantMembership[]
  loading?: boolean
  error?: string
  savingKey?: string
  rolesByTenant: Record<string, BeaverRole[]>
  rolesLoadingByTenant: Record<string, boolean>
  rolesErrorByTenant: Record<string, string>
}>()

const emit = defineEmits<{
  updateMembershipField: [userId: number, tenantId: number, field: keyof UserTenantMembership, value: string | boolean]
  saveMembership: [userId: number, membership: UserTenantMembership]
  deleteMembership: [userId: number, tenantId: number]
  password: [userId: number, tenantId: number]
  provision: [userId: number, tenantId: number]
}>()

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
    <p v-if="error" class="memberships__error">
      {{ error }}
    </p>

    <p v-if="loading && memberships.length === 0" class="memberships__info">
      Cargando memberships y roles Beaver...
    </p>

    <template v-else-if="memberships.length">
      <BaseDataTable class="memberships__table" min-width="66rem">
        <thead>
          <tr>
            <th scope="col">Tenant</th>
            <th scope="col">Rol HUB</th>
            <th scope="col">Rol Beaver</th>
            <th scope="col">Activo</th>
            <th class="is-actions-cell" scope="col">Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="membership in memberships" :key="`${user.id}-${membership.tenant_id}`">
            <th scope="row">
              <strong>{{ getTenantName(membership.tenant_id) }}</strong>
            </th>
            <td>
              <select
                class="memberships__select"
                :value="membership.role"
                @change="emit('updateMembershipField', user.id, membership.tenant_id, 'role', ($event.target as HTMLSelectElement).value)"
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </td>
            <td>
              <select
                v-if="!isRolesLoading(membership.tenant_id) && !getRolesError(membership.tenant_id)"
                class="memberships__select memberships__select--wide"
                :value="String(membership.beaver_role_id || '')"
                @change="emit('updateMembershipField', user.id, membership.tenant_id, 'beaver_role_id', ($event.target as HTMLSelectElement).value)"
              >
                <option value="">Selecciona rol Beaver...</option>
                <option v-for="role in getRoles(membership.tenant_id)" :key="getRoleValue(role)" :value="getRoleValue(role)">
                  {{ role.name || role.display_name || getRoleValue(role) }}
                </option>
              </select>
              <span v-else-if="isRolesLoading(membership.tenant_id)" class="memberships__muted">Cargando roles...</span>
              <span v-else class="memberships__error">{{ getRolesError(membership.tenant_id) }}</span>
            </td>
            <td>
              <label class="memberships__active">
                <input
                  :checked="membership.is_active"
                  type="checkbox"
                  @change="emit('updateMembershipField', user.id, membership.tenant_id, 'is_active', ($event.target as HTMLInputElement).checked)"
                >
                <span>{{ membership.is_active ? 'Activo' : 'Inactivo' }}</span>
              </label>
            </td>
            <td class="is-actions-cell">
              <div class="memberships__actions">
                <button type="button" :disabled="savingKey === `${user.id}-${membership.tenant_id}`" @click="emit('saveMembership', user.id, membership)">
                  {{ savingKey === `${user.id}-${membership.tenant_id}` ? 'Guardando...' : 'Guardar' }}
                </button>
                <button class="amber" type="button" @click="emit('password', user.id, membership.tenant_id)">
                  Cambiar pass
                </button>
                <button class="green" type="button" :disabled="!membership.is_active || !membership.beaver_role_id" @click="emit('provision', user.id, membership.tenant_id)">
                  Provisionar
                </button>
                <button class="danger" type="button" :disabled="savingKey === `${user.id}-${membership.tenant_id}-delete`" @click="emit('deleteMembership', user.id, membership.tenant_id)">
                  {{ savingKey === `${user.id}-${membership.tenant_id}-delete` ? 'Borrando...' : 'Borrar' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </BaseDataTable>

      <BaseCardList class="memberships__cards" mobile-only>
        <BaseCard
          v-for="membership in memberships"
          :key="`${user.id}-${membership.tenant_id}`"
          class="membership-card"
        >
          <div class="membership-card__head">
            <h2>{{ getTenantName(membership.tenant_id) }}</h2>
            <label class="memberships__active">
              <input
                :checked="membership.is_active"
                type="checkbox"
                @change="emit('updateMembershipField', user.id, membership.tenant_id, 'is_active', ($event.target as HTMLInputElement).checked)"
              >
              <span>{{ membership.is_active ? 'Activo' : 'Inactivo' }}</span>
            </label>
          </div>

          <dl>
            <div>
              <dt>Rol HUB</dt>
              <dd>
                <select
                  class="memberships__select"
                  :value="membership.role"
                  @change="emit('updateMembershipField', user.id, membership.tenant_id, 'role', ($event.target as HTMLSelectElement).value)"
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </dd>
            </div>
            <div>
              <dt>Rol Beaver</dt>
              <dd>
                <select
                  v-if="!isRolesLoading(membership.tenant_id) && !getRolesError(membership.tenant_id)"
                  class="memberships__select memberships__select--wide"
                  :value="String(membership.beaver_role_id || '')"
                  @change="emit('updateMembershipField', user.id, membership.tenant_id, 'beaver_role_id', ($event.target as HTMLSelectElement).value)"
                >
                  <option value="">Selecciona rol Beaver...</option>
                  <option v-for="role in getRoles(membership.tenant_id)" :key="getRoleValue(role)" :value="getRoleValue(role)">
                    {{ role.name || role.display_name || getRoleValue(role) }}
                  </option>
                </select>
                <span v-else-if="isRolesLoading(membership.tenant_id)" class="memberships__muted">Cargando roles...</span>
                <span v-else class="memberships__error">{{ getRolesError(membership.tenant_id) }}</span>
              </dd>
            </div>
          </dl>

          <div class="memberships__actions">
            <button type="button" :disabled="savingKey === `${user.id}-${membership.tenant_id}`" @click="emit('saveMembership', user.id, membership)">
              {{ savingKey === `${user.id}-${membership.tenant_id}` ? 'Guardando...' : 'Guardar' }}
            </button>
            <button class="amber" type="button" @click="emit('password', user.id, membership.tenant_id)">
              Cambiar pass
            </button>
            <button class="green" type="button" :disabled="!membership.is_active || !membership.beaver_role_id" @click="emit('provision', user.id, membership.tenant_id)">
              Provisionar
            </button>
            <button class="danger" type="button" :disabled="savingKey === `${user.id}-${membership.tenant_id}-delete`" @click="emit('deleteMembership', user.id, membership.tenant_id)">
              {{ savingKey === `${user.id}-${membership.tenant_id}-delete` ? 'Borrando...' : 'Borrar' }}
            </button>
          </div>
        </BaseCard>
      </BaseCardList>
    </template>

    <p v-else class="memberships__empty">
      Sin membresias explicitas
    </p>
  </section>
</template>

<style scoped>
.memberships {
  display: grid;
  gap: 1rem;
}

.memberships p {
  margin: 0;
  color: #64748b;
}

.memberships__table {
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.07);
}

.memberships__table :deep(.is-actions-cell) {
  width: 17rem;
}

.memberships button {
  border: 0;
  border-radius: 0.65rem;
  padding: 0.55rem 0.7rem;
  background: #1d4ed8;
  color: #ffffff;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 700;
}

.memberships button:disabled {
  background: #cbd5e1;
  color: #475569;
  cursor: not-allowed;
}

.memberships__active {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.memberships__select {
  width: 8rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.65rem;
  padding: 0.55rem 0.65rem;
  background: #ffffff;
  color: #0f172a;
  font: inherit;
}

.memberships__select--wide {
  width: 16rem;
}

.memberships__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: center;
  gap: 0.5rem;
}

.memberships__actions button {
  width: 100%;
  min-height: 2.35rem;
}

.memberships__actions .amber {
  background: #d97706;
}

.memberships__actions .green {
  background: #059669;
}

.memberships__actions .danger {
  background: #dc2626;
}

.memberships__info {
  border: 1px solid #e2e8f0;
  border-radius: 0.8rem;
  padding: 0.8rem;
  background: #f8fafc;
}

.memberships__error {
  color: #b91c1c !important;
}

.memberships__muted,
.memberships__empty {
  color: #94a3b8;
}

.membership-card {
  gap: 0.85rem;
  padding: 1rem;
}

.membership-card__head {
  display: grid;
  gap: 0.6rem;
}

.membership-card h2 {
  margin: 0;
  color: #1d4ed8;
  font-size: 1.08rem;
  overflow-wrap: anywhere;
}

.membership-card dl {
  display: grid;
  gap: 0.7rem;
  margin: 0;
}

.membership-card dl div {
  display: grid;
  gap: 0.25rem;
}

.membership-card dt {
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
}

.membership-card dd {
  margin: 0;
  min-width: 0;
}

@media (max-width: 640px) {
  .memberships__table {
    display: none;
  }

  .memberships__select,
  .memberships__select--wide {
    width: 100%;
  }
}

@media (max-width: 420px) {
  .memberships__actions {
    grid-template-columns: 1fr;
  }
}
</style>
