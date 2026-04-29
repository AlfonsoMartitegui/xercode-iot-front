<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    width?: string
  }>(),
  {
    width: '36rem',
  },
)

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <div class="base-modal" role="dialog" aria-modal="true">
    <div class="base-modal__panel" :style="{ '--base-modal-width': width }">
      <button class="base-modal__close" type="button" aria-label="Cerrar" @click="emit('close')">
        x
      </button>

      <h2>{{ title }}</h2>

      <slot />
    </div>
  </div>
</template>

<style scoped>
.base-modal {
  position: fixed;
  inset: 0;
  z-index: 45;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.52);
}

.base-modal__panel {
  position: relative;
  width: min(100%, var(--base-modal-width));
  max-height: calc(100vh - 2rem);
  overflow: auto;
  border-radius: 1rem;
  padding: 1.5rem;
  background: #ffffff;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.25);
}

.base-modal__close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  min-height: auto;
  border: 0;
  padding: 0.2rem;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  font-size: 1.1rem;
}

.base-modal h2 {
  margin: 0 2rem 1rem 0;
}

@media (max-width: 640px) {
  .base-modal__panel {
    padding: 1rem;
  }
}
</style>
