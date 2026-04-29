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
  border-color: #fecaca;
  background: #fef2f2;
  color: #991b1b;
}

.base-alert--success {
  border-color: #bbf7d0;
  background: #ecfdf5;
  color: #047857;
}

.base-alert--info {
  border-color: #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
}

.base-alert button {
  border: 0;
  background: transparent;
  color: currentColor;
  cursor: pointer;
  font-weight: 800;
}
</style>
