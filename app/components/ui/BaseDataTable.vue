<script setup lang="ts">
withDefaults(
  defineProps<{
    minWidth?: string
  }>(),
  {
    minWidth: '64rem',
  },
)
</script>

<template>
  <div class="base-data-table" :style="{ '--base-data-table-min-width': minWidth }">
    <table>
      <slot />
    </table>
  </div>
</template>

<style scoped>
.base-data-table {
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: 0.8rem;
  background: var(--color-surface-strong);
}

.base-data-table table {
  width: 100%;
  min-width: var(--base-data-table-min-width);
  border-collapse: collapse;
}

.base-data-table :deep(th),
.base-data-table :deep(td) {
  border-bottom: 1px solid var(--color-border);
  padding: 0.85rem 1rem;
  color: var(--color-text);
  font-size: 0.9rem;
  text-align: left;
  vertical-align: top;
  white-space: nowrap;
}

.base-data-table :deep(thead th) {
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.base-data-table :deep(tbody tr:last-child td),
.base-data-table :deep(tbody tr:last-child th) {
  border-bottom: 0;
}

.base-data-table :deep(.is-actions-cell) {
  position: sticky;
  right: 0;
  z-index: 1;
  width: 10.5rem;
  background: var(--color-surface-strong);
  box-shadow: -12px 0 18px rgba(255, 255, 255, 0.9);
}

.base-data-table :deep(thead .is-actions-cell) {
  z-index: 2;
  background: var(--color-surface);
}
</style>
