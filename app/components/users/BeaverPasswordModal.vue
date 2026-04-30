<script setup lang="ts">
import BaseModal from '~/components/ui/BaseModal.vue'

const props = defineProps<{
  mode: 'change' | 'provision'
  password: string
  confirmPassword: string
  loading?: boolean
  error?: string
}>()

const emit = defineEmits<{
  'update:password': [value: string]
  'update:confirmPassword': [value: string]
  close: []
  submit: []
}>()

const isProvision = computed(() => props.mode === 'provision')
</script>

<template>
  <BaseModal
    :title="isProvision ? 'Provisionar Beaver' : 'Cambiar contraseña Beaver'"
    width="30rem"
    :z-index="60"
    @close="emit('close')"
  >
    <p class="password-form__description">
      {{ isProvision
        ? 'Esta acción crea o asocia la cuenta del usuario en Beaver usando el tenant seleccionado.'
        : 'Esta acción cambia la contraseña del usuario en Beaver usando el tenant seleccionado.' }}
    </p>

    <form class="password-form" @submit.prevent="emit('submit')">
      <label>
        <span>Nueva contraseña</span>
        <input :value="password" type="password" required @input="emit('update:password', ($event.target as HTMLInputElement).value)">
      </label>

      <label>
        <span>Confirmar contraseña</span>
        <input :value="confirmPassword" type="password" required @input="emit('update:confirmPassword', ($event.target as HTMLInputElement).value)">
      </label>

      <p v-if="error" class="password-form__error">
        {{ error }}
      </p>

      <button type="submit" :disabled="loading">
        {{ loading ? (isProvision ? 'Provisionando...' : 'Cambiando...') : (isProvision ? 'Provisionar Beaver' : 'Cambiar contraseña') }}
      </button>
    </form>
  </BaseModal>
</template>

<style scoped>
.password-form__description {
  margin: 0 2rem 1rem 0;
  color: var(--color-text-muted);
}

.password-form {
  display: grid;
  gap: 1rem;
}

.password-form label {
  display: grid;
  gap: 0.35rem;
}

.password-form input {
  width: 100%;
  border: 1px solid var(--color-gray-300);
  border-radius: 0.65rem;
  padding: 0.75rem 0.85rem;
}

.password-form__error {
  margin: 0;
  color: var(--color-error);
}

.password-form button {
  border: 0;
  border-radius: 0.75rem;
  padding: 0.85rem 1rem;
  background: var(--color-warning);
  color: var(--color-white);
  cursor: pointer;
  font-weight: 700;
}
</style>
