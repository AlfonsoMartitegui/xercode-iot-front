<script setup lang="ts">
import type { TenantDomainPayload } from '~/services/types'

const props = defineProps<{
  title: string
  submitLabel: string
  modelValue: TenantDomainPayload
  loading?: boolean
  error?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: TenantDomainPayload]
  close: []
  submit: []
}>()

function updateField<Key extends keyof TenantDomainPayload>(field: Key, value: TenantDomainPayload[Key]) {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}
</script>

<template>
  <div class="domain-modal" role="dialog" aria-modal="true">
    <div class="domain-modal__panel">
      <button class="domain-modal__close" type="button" aria-label="Cerrar" @click="emit('close')">
        x
      </button>

      <h2>{{ title }}</h2>

      <form class="domain-form" @submit.prevent="emit('submit')">
        <label>
          <span>Dominio</span>
          <input :value="modelValue.domain" type="text" placeholder="cliente.midominio.com" required @input="updateField('domain', ($event.target as HTMLInputElement).value)">
        </label>

        <small>El backend normaliza el dominio sin protocolo ni path.</small>

        <label class="domain-form__check">
          <input :checked="modelValue.is_primary" type="checkbox" @change="updateField('is_primary', ($event.target as HTMLInputElement).checked)">
          <span>Dominio principal</span>
        </label>

        <p v-if="error" class="domain-form__error">
          {{ error }}
        </p>

        <button class="domain-form__submit" type="submit" :disabled="loading">
          {{ loading ? 'Guardando...' : submitLabel }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.domain-modal {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.52);
}

.domain-modal__panel {
  position: relative;
  width: min(100%, 30rem);
  border-radius: 1rem;
  padding: 1.5rem;
  background: #ffffff;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.25);
}

.domain-modal__close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  border: 0;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  font-size: 1.1rem;
}

.domain-modal h2 {
  margin: 0 2rem 1rem 0;
}

.domain-form {
  display: grid;
  gap: 1rem;
}

.domain-form label {
  display: grid;
  gap: 0.35rem;
}

.domain-form input {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 0.65rem;
  padding: 0.75rem 0.85rem;
}

.domain-form small {
  color: #64748b;
}

.domain-form__check {
  display: flex !important;
  align-items: center;
}

.domain-form__check input {
  width: auto;
}

.domain-form__error {
  margin: 0;
  color: #b91c1c;
}

.domain-form__submit {
  border: 0;
  border-radius: 0.75rem;
  padding: 0.85rem 1rem;
  background: #1d4ed8;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
}

.domain-form__submit:disabled {
  opacity: 0.7;
  cursor: wait;
}
</style>
