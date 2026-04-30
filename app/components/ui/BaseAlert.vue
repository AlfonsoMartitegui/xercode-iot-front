<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: 'success' | 'error' | 'info'
    closable?: boolean
  }>(),
  {
    type: 'info',
    closable: false,
  },
)

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <div :class="['base-alert', `base-alert--${type}`]" role="status">
    <slot />
    <button v-if="closable" type="button" aria-label="Cerrar mensaje" @click="emit('close')">
      x
    </button>
  </div>
</template>

<style scoped>
.base-alert {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin: 0;
  border-radius: 0.85rem;
  padding: 0.85rem 1rem;
  border: 1px solid transparent;
}

.base-alert--error {
  border-color: var(--color-error-border);
  background: var(--color-error-light);
  color: var(--color-error);
}

.base-alert--success {
  border-color: var(--color-success-border);
  background: var(--color-success-light);
  color: var(--color-success);
}

.base-alert--info {
  border-color: var(--color-info-border);
  background: var(--color-info-light);
  color: var(--color-info);
}

.base-alert button {
  border: 0;
  background: transparent;
  color: currentColor;
  cursor: pointer;
  font-weight: 800;
}
</style>
