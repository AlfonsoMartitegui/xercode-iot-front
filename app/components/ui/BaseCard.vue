<template>
  <article class="base-card">
    <slot />
  </article>
</template>

<style scoped>
.base-card {
  display: grid;
  gap: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.8rem;
  padding: 1rem;
  background: var(--color-surface-strong);
  box-shadow: 0 14px 34px rgba(var(--color-primary-rgb), 0.07);
}
</style>
