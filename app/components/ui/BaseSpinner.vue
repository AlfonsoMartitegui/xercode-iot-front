<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
  }>(),
  {
    label: 'Cargando...',
  },
)
</script>

<template>
  <div class="base-spinner" role="status" aria-live="polite">
    <span aria-hidden="true" />
    <span>{{ label }}</span>
  </div>
</template>

<style scoped>
.base-spinner {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  color: var(--color-primary);
  font-weight: 700;
}

.base-spinner span:first-child {
  width: 1rem;
  height: 1rem;
  border: 2px solid var(--color-primary-lighter);
  border-top-color: var(--color-primary);
  border-radius: 999px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
