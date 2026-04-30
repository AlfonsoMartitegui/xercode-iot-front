<script setup lang="ts">
import type { BeaverRole, Tenant } from '~/services/types'
import BaseModal from '~/components/ui/BaseModal.vue'

type MembershipForm = {
  tenant_id: string
  role: string
  beaver_role_id: string
  is_active: boolean
}

const props = defineProps<{
  modelValue: MembershipForm
  tenants: Tenant[]
  beaverRoles: BeaverRole[]
  rolesLoading?: boolean
  rolesError?: string
  loading?: boolean
  error?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: MembershipForm]
  close: []
  submit: []
  tenantChange: [tenantId: string]
}>()

function updateField(field: keyof MembershipForm, value: string | boolean) {
  const form = {
    ...props.modelValue,
    [field]: value,
    ...(field === 'tenant_id' ? { beaver_role_id: '' } : {}),
  }

  emit('update:modelValue', form)

  if (field === 'tenant_id' && typeof value === 'string') {
    emit('tenantChange', value)
  }
}

function getRoleValue(role: BeaverRole) {
  return String(role.role_id ?? role.id ?? '')
}
</script>

<template>
  <BaseModal title="Anadir membresia" width="34rem" @close="emit('close')">
    <form class="membership-form" @submit.prevent="emit('submit')">
      <label>
        <span>Tenant</span>
        <select :value="modelValue.tenant_id" required @change="updateField('tenant_id', ($event.target as HTMLSelectElement).value)">
          <option value="">Selecciona tenant...</option>
          <option v-for="tenant in tenants" :key="tenant.id" :value="String(tenant.id)">
            {{ tenant.name }}
          </option>
        </select>
      </label>

      <p v-if="tenants.length === 0">
        No hay tenants disponibles para anadir una nueva membresia.
      </p>

      <label>
        <span>Rol HUB</span>
        <select :value="modelValue.role" required @change="updateField('role', ($event.target as HTMLSelectElement).value)">
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
      </label>

      <label>
        <span>Rol Beaver</span>
        <select
          :value="modelValue.beaver_role_id"
          :disabled="!modelValue.tenant_id || rolesLoading || Boolean(rolesError)"
          required
          @change="updateField('beaver_role_id', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">
            {{ modelValue.tenant_id ? 'Selecciona rol Beaver...' : 'Selecciona tenant primero...' }}
          </option>
          <option v-for="role in beaverRoles" :key="getRoleValue(role)" :value="getRoleValue(role)">
            {{ role.name || role.display_name || getRoleValue(role) }}
          </option>
        </select>
      </label>

      <p v-if="rolesLoading">Cargando roles Beaver...</p>
      <p v-else-if="rolesError" class="membership-form__error">{{ rolesError }}</p>
      <p v-else-if="modelValue.tenant_id && beaverRoles.length === 0">No hay roles Beaver disponibles para este tenant.</p>

      <label class="membership-form__check">
        <input :checked="modelValue.is_active" type="checkbox" @change="updateField('is_active', ($event.target as HTMLInputElement).checked)">
        <span>Membresia activa</span>
      </label>

      <p v-if="error" class="membership-form__error">
        {{ error }}
      </p>

      <button class="membership-form__submit" type="submit" :disabled="loading || tenants.length === 0">
        {{ loading ? 'Anadiendo...' : 'Anadir membresia' }}
      </button>
    </form>
  </BaseModal>
</template>

<style scoped>
.membership-form {
  display: grid;
  gap: 1rem;
}

.membership-form label {
  display: grid;
  gap: 0.35rem;
}

.membership-form select {
  width: 100%;
  border: 1px solid var(--color-gray-300);
  border-radius: 0.65rem;
  padding: 0.75rem 0.85rem;
  background: var(--color-white);
  color: var(--color-text);
}

.membership-form p {
  margin: 0;
  color: var(--color-text-muted);
}

.membership-form__check {
  display: flex !important;
  align-items: center;
  gap: 0.5rem !important;
}

.membership-form__check input {
  width: auto;
}

.membership-form__error {
  color: var(--color-error) !important;
}

.membership-form__submit {
  border: 0;
  border-radius: 0.75rem;
  padding: 0.85rem 1rem;
  background: var(--color-primary);
  color: var(--color-white);
  cursor: pointer;
  font-weight: 700;
}

.membership-form__submit:disabled {
  opacity: 0.7;
  cursor: wait;
}
</style>
