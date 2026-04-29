<template>
  <section class="content-layout">
    <div class="content-layout__toolbar">
      <slot name="toolbar" />
    </div>

    <div class="content-layout__main">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.content-layout {
  display: grid;
  gap: 1rem;
  min-width: 0;
}

.content-layout__toolbar,
.content-layout__main {
  min-width: 0;
}

.content-layout__main {
  display: grid;
  gap: 1rem;
}
</style>
