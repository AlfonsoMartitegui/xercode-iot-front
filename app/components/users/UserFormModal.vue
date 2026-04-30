<script setup lang="ts">
import BaseModal from '~/components/ui/BaseModal.vue'
import type { BeaverRole, Tenant } from '~/services/types'

export interface UserCreateForm {
  username: string
  email: string
  password: string
  confirmPassword: string
  is_active: boolean
  is_superadmin: boolean
  membership: {
    tenant_id: string
    role: string
    beaver_role_id: string
    is_active: boolean
  }
}

const props = defineProps<{
  modelValue: UserCreateForm
  tenants: Tenant[]
  beaverRoles: BeaverRole[]
  rolesLoading?: boolean
  rolesError?: string
  loading?: boolean
  error?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: UserCreateForm]
  close: []
  submit: []
  tenantChange: [tenantId: string]
}>()

function updateField<Key extends keyof UserCreateForm>(field: Key, value: UserCreateForm[Key]) {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}

function updateMembership(field: keyof UserCreateForm['membership'], value: string | boolean) {
  const membership = {
    ...props.modelValue.membership,
    [field]: value,
    ...(field === 'tenant_id' ? { beaver_role_id: '' } : {}),
  }

  emit('update:modelValue', {
    ...props.modelValue,
    membership,
  })

  if (field === 'tenant_id' && typeof value === 'string') {
    emit('tenantChange', value)
  }
}

function getRoleValue(role: BeaverRole) {
  return String(role.role_id ?? role.id ?? '')
}
</script>

<template>
  <BaseModal title="Crear nuevo usuario" width="38rem" :z-index="50" @close="emit('close')">
    <form class="user-form" @submit.prevent="emit('submit')">
      <label>
        <span>Usuario</span>
        <input :value="modelValue.username" type="text" required @input="updateField('username', ($event.target as HTMLInputElement).value)">
      </label>

      <label>
        <span>Email</span>
        <input :value="modelValue.email" type="email" required @input="updateField('email', ($event.target as HTMLInputElement).value)">
      </label>

      <label>
        <span>Contrasena</span>
        <input :value="modelValue.password" type="password" required @input="updateField('password', ($event.target as HTMLInputElement).value)">
      </label>

      <label>
        <span>Confirmar contrasena</span>
        <input :value="modelValue.confirmPassword" type="password" required @input="updateField('confirmPassword', ($event.target as HTMLInputElement).value)">
      </label>

      <label class="user-form__check">
        <input :checked="modelValue.is_active" type="checkbox" @change="updateField('is_active', ($event.target as HTMLInputElement).checked)">
        <span>Activo</span>
      </label>

      <label class="user-form__check">
        <input :checked="modelValue.is_superadmin" type="checkbox" @change="updateField('is_superadmin', ($event.target as HTMLInputElement).checked)">
        <span>Superadmin</span>
      </label>

      <section v-if="!modelValue.is_superadmin" class="user-form__membership">
        <h3>Membresia inicial</h3>

        <label>
          <span>Tenant</span>
          <select :value="modelValue.membership.tenant_id" required @change="updateMembership('tenant_id', ($event.target as HTMLSelectElement).value)">
            <option value="">Selecciona tenant...</option>
            <option v-for="tenant in tenants" :key="tenant.id" :value="String(tenant.id)">
              {{ tenant.name }}
            </option>
          </select>
        </label>

        <label>
          <span>Rol HUB</span>
          <select :value="modelValue.membership.role" @change="updateMembership('role', ($event.target as HTMLSelectElement).value)">
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </label>

        <label>
          <span>Rol Beaver</span>
          <select
            :value="modelValue.membership.beaver_role_id"
            :disabled="!modelValue.membership.tenant_id || rolesLoading || Boolean(rolesError)"
            required
            @change="updateMembership('beaver_role_id', ($event.target as HTMLSelectElement).value)"
          >
            <option value="">
              {{ modelValue.membership.tenant_id ? 'Selecciona rol Beaver...' : 'Selecciona tenant primero...' }}
            </option>
            <option v-for="role in beaverRoles" :key="getRoleValue(role)" :value="getRoleValue(role)">
              {{ role.name || role.display_name || getRoleValue(role) }}
            </option>
          </select>
        </label>

        <p v-if="rolesLoading">Cargando roles Beaver...</p>
        <p v-else-if="rolesError" class="user-form__error">{{ rolesError }}</p>
        <p v-else-if="modelValue.membership.tenant_id && beaverRoles.length === 0">No hay roles Beaver disponibles para este tenant.</p>

        <label class="user-form__check">
          <input :checked="modelValue.membership.is_active" type="checkbox" @change="updateMembership('is_active', ($event.target as HTMLInputElement).checked)">
          <span>Membresia activa</span>
        </label>
      </section>

      <p v-if="error" class="user-form__error">
        {{ error }}
      </p>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Creando...' : 'Crear usuario' }}
      </button>
    </form>
  </BaseModal>
</template>

<style scoped>
.user-form,
.user-form__membership {
  display: grid;
  gap: 1rem;
}

.user-form label {
  display: grid;
  gap: 0.35rem;
}

.user-form input,
.user-form select {
  width: 100%;
  border: 1px solid var(--color-gray-300);
  border-radius: 0.65rem;
  padding: 0.75rem 0.85rem;
  color: var(--color-text);
}

.user-form input:focus,
.user-form select:focus {
  outline: 3px solid var(--color-focus);
  border-color: var(--color-secondary);
}

.user-form__check {
  display: flex !important;
  align-items: center;
}

.user-form__check input {
  width: auto;
}

.user-form__membership {
  border: 1px solid var(--color-border);
  border-radius: 0.9rem;
  padding: 1rem;
  background: var(--color-surface);
}

.user-form__membership h3,
.user-form__membership p {
  margin: 0;
}

.user-form__error {
  margin: 0;
  color: var(--color-error);
}

.user-form button {
  border: 0;
  border-radius: 0.75rem;
  padding: 0.85rem 1rem;
  background: var(--color-primary);
  color: var(--color-white);
  cursor: pointer;
  font-weight: 700;
}
</style>
