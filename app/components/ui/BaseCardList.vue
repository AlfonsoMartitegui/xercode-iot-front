<script setup lang="ts">
withDefaults(
  defineProps<{
    mobileOnly?: boolean
  }>(),
  {
    mobileOnly: false,
  },
)
</script>

<template>
  <div :class="['base-card-list', { 'is-mobile-only': mobileOnly }]">
    <slot />
  </div>
</template>

<style scoped>
.base-card-list {
  display: grid;
  gap: 1rem;
}

.base-card-list.is-mobile-only {
  display: none;
}

@media (max-width: 640px) {
  .base-card-list.is-mobile-only {
    display: grid;
  }
}
</style>
