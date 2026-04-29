<script setup lang="ts">
defineProps<{
  desktopSidebarVisible?: boolean
  mobileSidebarOpen?: boolean
}>()

const emit = defineEmits<{
  openSidebar: []
}>()

const route = useRoute()
const pageTitle = computed(() => String(route.meta.title || 'Xercode IoT'))
</script>

<template>
  <header class="app-header">
    <div class="app-header__start">
      <button
        :class="[
          'app-header__menu',
          {
            'is-desktop-sidebar-visible': desktopSidebarVisible,
            'is-mobile-sidebar-open': mobileSidebarOpen,
          },
        ]"
        type="button"
        :aria-expanded="mobileSidebarOpen || desktopSidebarVisible"
        aria-controls="app-sidebar"
        aria-label="Abrir navegacion"
        @click="emit('openSidebar')"
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>

      <h1>{{ pageTitle }}</h1>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.92);
  border-bottom: 1px solid #e2e8f0;
  backdrop-filter: blur(12px);
}

.app-header__start {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-width: 0;
}

.app-header h1 {
  margin: 0;
  overflow: hidden;
  color: #0f172a;
  font-size: 1.25rem;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-header__menu {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 0.22rem;
  flex: 0 0 2.5rem;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.7rem;
  padding: 0;
  background: #ffffff;
  cursor: pointer;
}

.app-header__menu span {
  width: 1rem;
  height: 0.12rem;
  border-radius: 999px;
  background: #0f172a;
}

@media (min-width: 821px) {
  .app-header__menu.is-desktop-sidebar-visible {
    display: none;
  }
}

@media (max-width: 820px) {
  .app-header {
    padding: 0.85rem 1rem;
  }

  .app-header__menu.is-mobile-sidebar-open {
    display: none;
  }
}

@media (max-width: 520px) {
  .app-header {
    gap: 0.75rem;
  }

  .app-header h1 {
    font-size: 1.1rem;
  }
}
</style>
