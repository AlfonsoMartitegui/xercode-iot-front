<script setup lang="ts">
import BaseModal from '~/components/ui/BaseModal.vue'
import type { TenantPayload } from '~/services/types'

const props = defineProps<{
  title: string
  submitLabel: string
  modelValue: TenantPayload
  loading?: boolean
  error?: string
  isEdit?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: TenantPayload]
  close: []
  submit: []
}>()

function updateField<Key extends keyof TenantPayload>(field: Key, value: TenantPayload[Key]) {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}
</script>

<template>
  <BaseModal :title="title" width="38rem" :z-index="50" @close="emit('close')">
    <form class="tenant-form" @submit.prevent="emit('submit')">
      <label>
        <span>Nombre</span>
        <input :value="modelValue.name" type="text" required @input="updateField('name', ($event.target as HTMLInputElement).value)">
      </label>

      <label>
        <span>Código</span>
        <input :value="modelValue.code" type="text" required @input="updateField('code', ($event.target as HTMLInputElement).value)">
      </label>

      <label>
        <span>Dirección</span>
        <input :value="modelValue.address" type="text" @input="updateField('address', ($event.target as HTMLInputElement).value)">
      </label>

      <label>
        <span>Redirect URL</span>
        <input :value="modelValue.redirect_url" type="url" placeholder="https://..." @input="updateField('redirect_url', ($event.target as HTMLInputElement).value)">
      </label>

      <label>
        <span>Beaver Base URL</span>
        <input :value="modelValue.beaver_base_url" type="url" placeholder="https://..." @input="updateField('beaver_base_url', ($event.target as HTMLInputElement).value)">
      </label>

      <section class="tenant-form__section">
        <h3>Configuración Beaver</h3>
        <p>Datos técnicos guardados en HUB para preparar la integración. No ejecuta sincronización con Beaver.</p>

        <label>
          <span>MQTT Host Beaver</span>
          <input :value="modelValue.beaver_mqtt_host" type="text" autocomplete="off" @input="updateField('beaver_mqtt_host', ($event.target as HTMLInputElement).value)">
        </label>

        <label>
          <span>MQTT Port Beaver</span>
          <input :value="modelValue.beaver_mqtt_port" type="text" autocomplete="off" @input="updateField('beaver_mqtt_port', ($event.target as HTMLInputElement).value)">
        </label>

        <label>
          <span>Usuario admin Beaver</span>
          <input :value="modelValue.beaver_admin_username" type="text" autocomplete="off" @input="updateField('beaver_admin_username', ($event.target as HTMLInputElement).value)">
        </label>

        <label>
          <span>Password admin Beaver</span>
          <input :value="modelValue.beaver_admin_password" type="password" autocomplete="new-password" @input="updateField('beaver_admin_password', ($event.target as HTMLInputElement).value)">
        </label>

        <small>
          {{ isEdit ? 'Dejar vacío para conservar la password actual.' : 'Se guarda cifrada en backend y no se vuelve a mostrar.' }}
        </small>
      </section>

      <label class="tenant-form__check">
        <input :checked="modelValue.is_active" type="checkbox" @change="updateField('is_active', ($event.target as HTMLInputElement).checked)">
        <span>Activo</span>
      </label>

      <p v-if="error" class="tenant-form__error">
        {{ error }}
      </p>

      <button class="tenant-form__submit" type="submit" :disabled="loading">
        {{ loading ? 'Guardando...' : submitLabel }}
      </button>
    </form>
  </BaseModal>
</template>

<style scoped>
.tenant-form {
  display: grid;
  gap: 1rem;
}

.tenant-form label {
  display: grid;
  gap: 0.35rem;
}

.tenant-form input {
  width: 100%;
  border: 1px solid var(--color-gray-300);
  border-radius: 0.65rem;
  padding: 0.75rem 0.85rem;
  color: var(--color-text);
}

.tenant-form input:focus {
  outline: 3px solid var(--color-focus);
  border-color: var(--color-secondary);
}

.tenant-form__section {
  display: grid;
  gap: 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: 0.9rem;
  padding: 1rem;
  background: var(--color-surface);
}

.tenant-form__section h3,
.tenant-form__section p {
  margin: 0;
}

.tenant-form__section p,
.tenant-form__section small {
  color: var(--color-text-muted);
}

.tenant-form__check {
  display: flex !important;
  align-items: center;
}

.tenant-form__check input {
  width: auto;
}

.tenant-form__error {
  margin: 0;
  color: var(--color-error);
}

.tenant-form__submit {
  border: 0;
  border-radius: 0.75rem;
  padding: 0.85rem 1rem;
  background: var(--color-primary);
  color: var(--color-white);
  font-weight: 700;
  cursor: pointer;
}

.tenant-form__submit:disabled {
  opacity: 0.7;
  cursor: wait;
}
</style>
