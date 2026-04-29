<script setup lang="ts">
import AppHeader from '~/components/layout/AppHeader.vue'
import AppSidebar from '~/components/layout/AppSidebar.vue'
import BaseAlert from '~/components/ui/BaseAlert.vue'

const notifications = useNotifications()
</script>

<template>
  <div class="authenticated-layout">
    <AppSidebar />

    <div class="authenticated-layout__main">
      <AppHeader />

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

.authenticated-layout__main {
  min-width: 0;
}

.authenticated-layout__notifications {
  display: grid;
  gap: 1rem;
  padding: 1rem 1.5rem 0;
}

.authenticated-layout__content {
  padding: 2rem 1.5rem;
}

@media (max-width: 820px) {
  .authenticated-layout {
    grid-template-columns: 1fr;
  }
}
</style>
