<script setup lang="ts">
import type { Tenant } from '~/services/types'

defineProps<{
  tenant: Tenant
  deletingTenantId?: number | null
  deletingDomainKey?: string
}>()

const emit = defineEmits<{
  edit: [tenantId: number]
  delete: [tenantId: number]
  addDomain: [tenantId: number]
  editDomain: [tenantId: number, domainId: number]
  deleteDomain: [tenantId: number, domainId: number]
}>()
</script>

<template>
  <article class="tenant-card">
    <div class="tenant-card__title">
      <h2>{{ tenant.name }}</h2>
      <span :class="['tenant-card__status', tenant.is_active ? 'is-active' : 'is-inactive']">
        {{ tenant.is_active ? 'Activo' : 'Inactivo' }}
      </span>
    </div>

    <div class="tenant-card__actions">
      <button type="button" @click="emit('edit', tenant.id)">
        Editar
      </button>
      <button class="danger" type="button" :disabled="deletingTenantId === tenant.id" @click="emit('delete', tenant.id)">
        {{ deletingTenantId === tenant.id ? 'Borrando...' : 'Baja' }}
      </button>
    </div>

    <dl>
      <div>
        <dt>Codigo</dt>
        <dd>{{ tenant.code }}</dd>
      </div>
      <div>
        <dt>ID</dt>
        <dd>{{ tenant.id }}</dd>
      </div>
      <div>
        <dt>Direccion</dt>
        <dd>{{ tenant.address || 'No definida' }}</dd>
      </div>
      <div>
        <dt>Redirect URL</dt>
        <dd>{{ tenant.redirect_url || 'No definida' }}</dd>
      </div>
      <div>
        <dt>Beaver Base URL</dt>
        <dd>{{ tenant.beaver_base_url || 'No definida' }}</dd>
      </div>
      <div>
        <dt>Usuario admin Beaver</dt>
        <dd>{{ tenant.beaver_admin_username || 'No definido' }}</dd>
      </div>
    </dl>

    <section class="tenant-card__domains">
      <div class="tenant-card__domains-head">
        <h3>Dominios</h3>
        <button type="button" @click="emit('addDomain', tenant.id)">
          Anadir dominio
        </button>
      </div>

      <ul v-if="tenant.domains?.length">
        <li v-for="(domainObj, index) in tenant.domains" :key="domainObj.id || index">
          <div>
            <span>{{ domainObj.domain || String(domainObj) }}</span>
            <strong v-if="domainObj.is_primary">Primario</strong>
          </div>
          <div class="tenant-card__domain-actions">
            <button type="button" @click="emit('editDomain', tenant.id, domainObj.id)">
              Editar
            </button>
            <button
              class="danger-soft"
              type="button"
              :disabled="deletingDomainKey === `${tenant.id}-${domainObj.id}`"
              @click="emit('deleteDomain', tenant.id, domainObj.id)"
            >
              {{ deletingDomainKey === `${tenant.id}-${domainObj.id}` ? 'Borrando...' : 'Borrar' }}
            </button>
          </div>
        </li>
      </ul>

      <p v-else>Sin dominios</p>
    </section>
  </article>
</template>

<style scoped>
.tenant-card {
  position: relative;
  display: grid;
  gap: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1rem;
  background: #ffffff;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}

.tenant-card__title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-right: 8rem;
}

.tenant-card h2,
.tenant-card h3 {
  margin: 0;
}

.tenant-card h2 {
  color: #1d4ed8;
  font-size: 1.2rem;
}

.tenant-card__status {
  border-radius: 999px;
  padding: 0.25rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 700;
}

.tenant-card__status.is-active {
  background: #dcfce7;
  color: #166534;
}

.tenant-card__status.is-inactive {
  background: #fee2e2;
  color: #991b1b;
}

.tenant-card__actions {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
}

.tenant-card button {
  border: 0;
  border-radius: 0.55rem;
  padding: 0.45rem 0.7rem;
  background: #1d4ed8;
  color: #ffffff;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 700;
}

.tenant-card button:disabled {
  opacity: 0.65;
  cursor: wait;
}

.tenant-card button.danger {
  background: #dc2626;
}

.tenant-card button.danger-soft {
  background: #fee2e2;
  color: #991b1b;
}

.tenant-card dl {
  display: grid;
  gap: 0.5rem;
  margin: 0;
}

.tenant-card dl div {
  display: grid;
  gap: 0.1rem;
}

.tenant-card dt {
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 700;
}

.tenant-card dd {
  margin: 0;
  overflow-wrap: anywhere;
}

.tenant-card__domains {
  display: grid;
  gap: 0.75rem;
}

.tenant-card__domains-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.tenant-card__domains ul {
  display: grid;
  gap: 0.65rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tenant-card__domains li {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  border-radius: 0.75rem;
  padding: 0.7rem;
  background: #f8fafc;
}

.tenant-card__domains strong {
  margin-left: 0.5rem;
  border-radius: 999px;
  padding: 0.2rem 0.5rem;
  background: #fef3c7;
  color: #92400e;
  font-size: 0.72rem;
}

.tenant-card__domain-actions {
  display: flex;
  flex-shrink: 0;
  gap: 0.4rem;
}

.tenant-card__domains p {
  margin: 0;
  color: #94a3b8;
}
</style>
