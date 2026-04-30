<template>
  <div class="login-layout">
    <slot />
  </div>
</template>

<style scoped>
.login-layout {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(var(--color-secondary-rgb), 0.26), transparent 26rem),
    linear-gradient(135deg, var(--color-primary-lighter) 0%, var(--color-background) 52%, var(--color-secondary-lighter) 100%);
  color: var(--color-text);
}
</style>
