<script setup lang="ts">
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
  <div class="password-modal" role="dialog" aria-modal="true">
    <div class="password-modal__panel">
      <button class="password-modal__close" type="button" aria-label="Cerrar" @click="emit('close')">
        x
      </button>

      <h2>{{ isProvision ? 'Provisionar Beaver' : 'Cambiar contrasena Beaver' }}</h2>
      <p>
        {{ isProvision
          ? 'Esta accion crea o asocia la cuenta del usuario en Beaver usando el tenant seleccionado.'
          : 'Esta accion cambia la contrasena del usuario en Beaver usando el tenant seleccionado.' }}
      </p>

      <form class="password-form" @submit.prevent="emit('submit')">
        <label>
          <span>Nueva contrasena</span>
          <input :value="password" type="password" required @input="emit('update:password', ($event.target as HTMLInputElement).value)">
        </label>

        <label>
          <span>Confirmar contrasena</span>
          <input :value="confirmPassword" type="password" required @input="emit('update:confirmPassword', ($event.target as HTMLInputElement).value)">
        </label>

        <p v-if="error" class="password-form__error">
          {{ error }}
        </p>

        <button type="submit" :disabled="loading">
          {{ loading ? (isProvision ? 'Provisionando...' : 'Cambiando...') : (isProvision ? 'Provisionar Beaver' : 'Cambiar contrasena') }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.password-modal {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.52);
}

.password-modal__panel {
  position: relative;
  width: min(100%, 30rem);
  border-radius: 1rem;
  padding: 1.5rem;
  background: #ffffff;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.25);
}

.password-modal__close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  border: 0;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  font-size: 1.1rem;
}

.password-modal h2,
.password-modal p {
  margin: 0 2rem 1rem 0;
}

.password-modal p {
  color: #64748b;
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
  border: 1px solid #cbd5e1;
  border-radius: 0.65rem;
  padding: 0.75rem 0.85rem;
}

.password-form__error {
  margin: 0;
  color: #b91c1c;
}

.password-form button {
  border: 0;
  border-radius: 0.75rem;
  padding: 0.85rem 1rem;
  background: #d97706;
  color: #ffffff;
  cursor: pointer;
  font-weight: 700;
}
</style>
