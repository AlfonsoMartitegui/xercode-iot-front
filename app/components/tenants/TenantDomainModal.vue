<script setup lang="ts">
import BaseModal from '~/components/ui/BaseModal.vue'
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
  <BaseModal :title="title" width="30rem" :z-index="50" @close="emit('close')">
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
  </BaseModal>
</template>

<style scoped>
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
  border: 1px solid var(--color-gray-300);
  border-radius: 0.65rem;
  padding: 0.75rem 0.85rem;
  color: var(--color-text);
}

.domain-form input:focus {
  outline: 3px solid var(--color-focus);
  border-color: var(--color-secondary);
}

.domain-form small {
  color: var(--color-text-muted);
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
  color: var(--color-error);
}

.domain-form__submit {
  border: 0;
  border-radius: 0.75rem;
  padding: 0.85rem 1rem;
  background: var(--color-primary);
  color: var(--color-white);
  font-weight: 700;
  cursor: pointer;
}

.domain-form__submit:disabled {
  opacity: 0.7;
  cursor: wait;
}
</style>
