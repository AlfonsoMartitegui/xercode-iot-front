<script setup lang="ts">
import { ref, watch } from 'vue'
import AppHeader from '~/components/layout/AppHeader.vue'
import AppSidebar from '~/components/layout/AppSidebar.vue'
import BaseAlert from '~/components/ui/BaseAlert.vue'

const notifications = useNotifications()
const route = useRoute()
const desktopSidebarVisible = ref(true)
const mobileSidebarOpen = ref(false)

function isCompactViewport() {
  return import.meta.client && window.matchMedia('(max-width: 820px)').matches
}

function closeSidebar() {
  mobileSidebarOpen.value = false

  if (!isCompactViewport()) {
    desktopSidebarVisible.value = false
  }
}

function openSidebar() {
  if (isCompactViewport()) {
    mobileSidebarOpen.value = true
    return
  }

  desktopSidebarVisible.value = true
  mobileSidebarOpen.value = false
}

watch(
  () => route.fullPath,
  () => {
    mobileSidebarOpen.value = false
  },
)
</script>

<template>
  <div :class="['authenticated-layout', { 'is-sidebar-hidden': !desktopSidebarVisible }]">
    <AppSidebar
      :desktop-visible="desktopSidebarVisible"
      :mobile-open="mobileSidebarOpen"
      @close="closeSidebar"
    />

    <button
      v-if="mobileSidebarOpen"
      class="authenticated-layout__overlay"
      type="button"
      aria-label="Cerrar navegacion"
      @click="mobileSidebarOpen = false"
    />

    <div class="authenticated-layout__main">
      <AppHeader
        :desktop-sidebar-visible="desktopSidebarVisible"
        :mobile-sidebar-open="mobileSidebarOpen"
        @open-sidebar="openSidebar"
      />

      <div v-if="notifications.notifications.value.length" class="authenticated-layout__notifications">
        <BaseAlert
          v-for="notification in notifications.notifications.value"
          :key="notification.id"
          :type="notification.type"
          closable
          @close="notifications.dismiss(notification.id)"
        >
          {{ notification.message }}
        </BaseAlert>
      </div>

      <main class="authenticated-layout__content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.authenticated-layout {
  display: grid;
  grid-template-columns: 16rem minmax(0, 1fr);
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(14, 165, 233, 0.12), transparent 32rem),
    #f8fafc;
  color: #1f2937;
}

.authenticated-layout.is-sidebar-hidden {
  grid-template-columns: minmax(0, 1fr);
}

.authenticated-layout__overlay {
  display: none;
}

.authenticated-layout__main {
  min-width: 0;
}

.authenticated-layout__notifications {
  display: grid;
  gap: 1rem;
  padding: 1rem 1.5rem 0;
}

.authenticated-layout__content {
  padding: 1rem 1.5rem 2rem;
}

@media (max-width: 820px) {
  .authenticated-layout {
    grid-template-columns: 1fr;
  }

  .authenticated-layout__overlay {
    position: fixed;
    inset: 0;
    z-index: 20;
    display: block;
    border: 0;
    padding: 0;
    background: rgba(15, 23, 42, 0.48);
    cursor: pointer;
  }

  .authenticated-layout__content {
    padding: 0.75rem 1rem 1rem;
  }

  .authenticated-layout__notifications {
    padding: 1rem 1rem 0;
  }
}
</style>
