<template>
  <article class="base-card">
    <slot />
  </article>
</template>

<style scoped>
.base-card {
  display: grid;
  gap: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.8rem;
  padding: 1rem;
  background: #ffffff;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.07);
}
</style>
