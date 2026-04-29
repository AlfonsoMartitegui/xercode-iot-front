<script setup lang="ts">
import type { Tenant } from '~/services/types'
import TenantCard from '~/components/tenants/TenantCard.vue'

defineProps<{
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
</script>

<template>
  <div v-if="tenants.length" class="tenant-list">
    <TenantCard
      v-for="tenant in tenants"
      :key="tenant.id"
      :tenant="tenant"
      :deleting-tenant-id="deletingTenantId"
      :deleting-domain-key="deletingDomainKey"
      @edit="emit('edit', $event)"
      @delete="emit('delete', $event)"
      @add-domain="emit('addDomain', $event)"
      @edit-domain="(tenantId, domainId) => emit('editDomain', tenantId, domainId)"
      @delete-domain="(tenantId, domainId) => emit('deleteDomain', tenantId, domainId)"
    />
  </div>

  <div v-else class="tenant-list__empty">
    No hay tenants todavia.
  </div>
</template>

<style scoped>
.tenant-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
  gap: 1rem;
}

.tenant-list__empty {
  border: 1px dashed #cbd5e1;
  border-radius: 1rem;
  padding: 2rem;
  background: #ffffff;
  color: #64748b;
  text-align: center;
}
</style>
