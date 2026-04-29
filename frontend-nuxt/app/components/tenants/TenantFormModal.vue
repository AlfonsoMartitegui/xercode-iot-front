<script setup lang="ts">
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
  <div class="tenant-modal" role="dialog" aria-modal="true">
    <div class="tenant-modal__panel tenant-modal__panel--wide">
      <button class="tenant-modal__close" type="button" aria-label="Cerrar" @click="emit('close')">
        x
      </button>

      <h2>{{ title }}</h2>

      <form class="tenant-form" @submit.prevent="emit('submit')">
        <label>
          <span>Nombre</span>
          <input :value="modelValue.name" type="text" required @input="updateField('name', ($event.target as HTMLInputElement).value)">
        </label>

        <label>
          <span>Codigo</span>
          <input :value="modelValue.code" type="text" required @input="updateField('code', ($event.target as HTMLInputElement).value)">
        </label>

        <label>
          <span>Direccion</span>
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
          <h3>Configuracion Beaver</h3>
          <p>Datos tecnicos guardados en HUB para preparar la integracion. No ejecuta sincronizacion con Beaver.</p>

          <label>
            <span>Usuario admin Beaver</span>
            <input :value="modelValue.beaver_admin_username" type="text" autocomplete="off" @input="updateField('beaver_admin_username', ($event.target as HTMLInputElement).value)">
          </label>

          <label>
            <span>Password admin Beaver</span>
            <input :value="modelValue.beaver_admin_password" type="password" autocomplete="new-password" @input="updateField('beaver_admin_password', ($event.target as HTMLInputElement).value)">
          </label>

          <small>
            {{ isEdit ? 'Dejar vacio para conservar la password actual.' : 'Se guarda cifrada en backend y no se vuelve a mostrar.' }}
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
    </div>
  </div>
</template>

<style scoped>
.tenant-modal {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.52);
}

.tenant-modal__panel {
  position: relative;
  width: min(100%, 32rem);
  max-height: 90vh;
  overflow: auto;
  border-radius: 1rem;
  padding: 1.5rem;
  background: #ffffff;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.25);
}

.tenant-modal__panel--wide {
  width: min(100%, 38rem);
}

.tenant-modal__close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  border: 0;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  font-size: 1.1rem;
}

.tenant-modal h2 {
  margin: 0 2rem 1rem 0;
}

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
  border: 1px solid #cbd5e1;
  border-radius: 0.65rem;
  padding: 0.75rem 0.85rem;
}

.tenant-form__section {
  display: grid;
  gap: 0.9rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.9rem;
  padding: 1rem;
  background: #f8fafc;
}

.tenant-form__section h3,
.tenant-form__section p {
  margin: 0;
}

.tenant-form__section p,
.tenant-form__section small {
  color: #64748b;
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
  color: #b91c1c;
}

.tenant-form__submit {
  border: 0;
  border-radius: 0.75rem;
  padding: 0.85rem 1rem;
  background: #1d4ed8;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
}

.tenant-form__submit:disabled {
  opacity: 0.7;
  cursor: wait;
}
</style>
