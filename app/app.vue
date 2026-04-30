<script setup lang="ts">
const route = useRoute();

const pageTitle = computed(() => String(route.meta.title || "Xercode IoT"));
const pageDescription = computed(() => String(route.meta.description || ""));

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
