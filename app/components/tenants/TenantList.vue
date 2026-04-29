<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Tenant } from '~/services/types'
import ContentLayout from '~/components/layout/ContentLayout.vue'
import BaseCard from '~/components/ui/BaseCard.vue'
import BaseCardList from '~/components/ui/BaseCardList.vue'
import BaseDataTable from '~/components/ui/BaseDataTable.vue'
import BaseModal from '~/components/ui/BaseModal.vue'

const props = defineProps<{
  tenants: Tenant[]
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

const domainsTenantId = ref<number | null>(null)
const selectedTenant = computed(() => props.tenants.find((tenant) => tenant.id === domainsTenantId.value) || null)

function openDomainsModal(tenantId: number) {
  domainsTenantId.value = tenantId
}

function closeDomainsModal() {
  domainsTenantId.value = null
}
</script>

<template>
  <div v-if="tenants.length" class="tenant-list">
    <BaseDataTable class="tenant-list__desktop-table" min-width="74rem">
        <thead>
          <tr>
            <th scope="col">Tenant</th>
            <th scope="col">Codigo</th>
            <th scope="col">ID</th>
            <th scope="col">Direccion</th>
            <th scope="col">Redirect URL</th>
            <th scope="col">Beaver Base URL</th>
            <th scope="col">Admin Beaver</th>
            <th scope="col">Dominios</th>
            <th class="is-actions-cell" scope="col">Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="tenant in tenants" :key="tenant.id">
            <th scope="row">
              <div class="tenant-table__tenant">
                <strong>{{ tenant.name }}</strong>
                <span :class="['tenant-list__status', tenant.is_active ? 'is-active' : 'is-inactive']">
                  {{ tenant.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
            </th>
            <td>{{ tenant.code }}</td>
            <td>{{ tenant.id }}</td>
            <td>{{ tenant.address || 'No definida' }}</td>
            <td>{{ tenant.redirect_url || 'No definida' }}</td>
            <td>{{ tenant.beaver_base_url || 'No definida' }}</td>
            <td>{{ tenant.beaver_admin_username || 'No definido' }}</td>
            <td>
              <button class="tenant-list__secondary-button" type="button" @click="openDomainsModal(tenant.id)">
                {{ tenant.domains?.length || 0 }} dominios
              </button>
            </td>
            <td class="is-actions-cell">
              <div class="tenant-list__actions">
                <button type="button" @click="emit('edit', tenant.id)">
                  Editar
                </button>
                <button
                  class="danger"
                  type="button"
                  :disabled="deletingTenantId === tenant.id"
                  @click="emit('delete', tenant.id)"
                >
                  {{ deletingTenantId === tenant.id ? 'Borrando...' : 'Baja' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
    </BaseDataTable>

    <BaseCardList mobile-only>
      <BaseCard v-for="tenant in tenants" :key="tenant.id" class="tenant-card">
        <div class="tenant-card__head">
          <div>
            <h2>{{ tenant.name }}</h2>
            <span :class="['tenant-list__status', tenant.is_active ? 'is-active' : 'is-inactive']">
              {{ tenant.is_active ? 'Activo' : 'Inactivo' }}
            </span>
          </div>

          <div class="tenant-list__actions">
            <button type="button" @click="emit('edit', tenant.id)">
              Editar
            </button>
            <button
              class="danger"
              type="button"
              :disabled="deletingTenantId === tenant.id"
              @click="emit('delete', tenant.id)"
            >
              {{ deletingTenantId === tenant.id ? 'Borrando...' : 'Baja' }}
            </button>
          </div>
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
            <dt>Admin Beaver</dt>
            <dd>{{ tenant.beaver_admin_username || 'No definido' }}</dd>
          </div>
          <div>
            <dt>Dominios</dt>
            <dd>
              <button class="tenant-list__secondary-button" type="button" @click="openDomainsModal(tenant.id)">
                {{ tenant.domains?.length || 0 }} dominios
              </button>
            </dd>
          </div>
        </dl>
      </BaseCard>
    </BaseCardList>

    <BaseModal
      v-if="selectedTenant"
      :title="`Dominios de ${selectedTenant.name}`"
      width="58rem"
      @close="closeDomainsModal"
    >
        <ContentLayout class="tenant-domains-layout">
          <template #toolbar>
            <div class="tenant-domains-layout__toolbar">
              <button type="button" @click="emit('addDomain', selectedTenant.id)">
                Anadir dominio
              </button>
            </div>
          </template>

          <BaseDataTable v-if="selectedTenant.domains?.length" class="tenant-domains-table-wrap" min-width="34rem">
              <thead>
                <tr>
                  <th scope="col">Dominio</th>
                  <th scope="col">Tipo</th>
                  <th class="is-actions-cell tenant-domains-table__actions-cell" scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(domainObj, index) in selectedTenant.domains" :key="domainObj.id || index">
                  <td>{{ domainObj.domain || String(domainObj) }}</td>
                  <td>
                    <span v-if="domainObj.is_primary" class="tenant-list__primary">Primario</span>
                    <span v-else>Secundario</span>
                  </td>
                  <td class="is-actions-cell tenant-domains-table__actions-cell">
                    <div class="tenant-list__actions">
                      <button type="button" @click="emit('editDomain', selectedTenant.id, domainObj.id)">
                        Editar
                      </button>
                      <button
                        class="danger-soft"
                        type="button"
                        :disabled="deletingDomainKey === `${selectedTenant.id}-${domainObj.id}`"
                        @click="emit('deleteDomain', selectedTenant.id, domainObj.id)"
                      >
                        {{ deletingDomainKey === `${selectedTenant.id}-${domainObj.id}` ? 'Borrando...' : 'Borrar' }}
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
          </BaseDataTable>

          <BaseCardList v-if="selectedTenant.domains?.length" mobile-only>
            <BaseCard
              v-for="(domainObj, index) in selectedTenant.domains"
              :key="domainObj.id || index"
              class="tenant-domain-card"
            >
              <div>
                <h3>{{ domainObj.domain || String(domainObj) }}</h3>
                <span v-if="domainObj.is_primary" class="tenant-list__primary">Primario</span>
                <span v-else>Secundario</span>
              </div>

              <div class="tenant-list__actions">
                <button type="button" @click="emit('editDomain', selectedTenant.id, domainObj.id)">
                  Editar
                </button>
                <button
                  class="danger-soft"
                  type="button"
                  :disabled="deletingDomainKey === `${selectedTenant.id}-${domainObj.id}`"
                  @click="emit('deleteDomain', selectedTenant.id, domainObj.id)"
                >
                  {{ deletingDomainKey === `${selectedTenant.id}-${domainObj.id}` ? 'Borrando...' : 'Borrar' }}
                </button>
              </div>
            </BaseCard>
          </BaseCardList>

          <p v-else class="tenant-list__empty-domains">
            Sin dominios
          </p>
        </ContentLayout>
    </BaseModal>
  </div>

  <div v-else class="tenant-list__empty">
    No hay tenants todavia.
  </div>
</template>

<style scoped>
.tenant-list {
  min-width: 0;
}

.tenant-list__desktop-table {
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.07);
}

.tenant-table__tenant {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 12rem;
}

.tenant-domains-table__actions-cell {
  width: 11rem;
}

.tenant-domain-card {
  gap: 0.8rem;
  padding: 0.85rem;
}

.tenant-domain-card h3 {
  margin: 0 0 0.45rem;
  color: #0f172a;
  font-size: 0.98rem;
  overflow-wrap: anywhere;
}

.tenant-card {
  padding: 1rem;
}

.tenant-card__head {
  display: grid;
  gap: 0.85rem;
}

.tenant-card h2 {
  margin: 0 0 0.45rem;
  color: #1d4ed8;
  font-size: 1.15rem;
}

.tenant-card dl {
  display: grid;
  gap: 0.7rem;
  margin: 0;
}

.tenant-card dl div {
  display: grid;
  gap: 0.18rem;
}

.tenant-card dt {
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
}

.tenant-card dd {
  margin: 0;
  overflow-wrap: anywhere;
}

.tenant-list__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}

.tenant-list button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  min-height: 2.25rem;
  border: 0;
  border-radius: 0.55rem;
  padding: 0.45rem 0.7rem;
  background: #1d4ed8;
  color: #ffffff;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 700;
  white-space: nowrap;
}

.tenant-list button:disabled {
  opacity: 0.65;
  cursor: wait;
}

.tenant-list button.danger {
  background: #dc2626;
}

.tenant-list button.danger-soft {
  background: #fee2e2;
  color: #991b1b;
}

.tenant-list button.tenant-list__secondary-button {
  background: #eff6ff;
  color: #1d4ed8;
}

.tenant-list__status,
.tenant-list__primary {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  border-radius: 999px;
  padding: 0.24rem 0.55rem;
  font-size: 0.72rem;
  font-weight: 800;
  white-space: nowrap;
}

.tenant-list__status.is-active {
  background: #dcfce7;
  color: #166534;
}

.tenant-list__status.is-inactive {
  background: #fee2e2;
  color: #991b1b;
}

.tenant-list__primary {
  background: #fef3c7;
  color: #92400e;
}

.tenant-domains-layout {
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1rem;
  background: #ffffff;
}

.tenant-domains-layout__toolbar {
  display: flex;
  justify-content: flex-start;
}

.tenant-list__empty-domains {
  margin: 0;
  border: 1px dashed #cbd5e1;
  border-radius: 0.65rem;
  padding: 1rem;
  color: #64748b;
  text-align: center;
}

.tenant-list__empty {
  border: 1px dashed #cbd5e1;
  border-radius: 1rem;
  padding: 2rem;
  background: #ffffff;
  color: #64748b;
  text-align: center;
}

@media (max-width: 640px) {
  .tenant-list__desktop-table {
    display: none;
  }

  .tenant-list__actions {
    justify-content: flex-start;
  }

  .tenant-domains-table-wrap {
    display: none;
  }
}

@media (max-width: 460px) {
  .tenant-list__actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .tenant-list__actions button {
    width: 100%;
  }
}
</style>
