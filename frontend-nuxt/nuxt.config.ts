// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    head: {
      link: [
        {
          rel: "preload",
          href: "/fonts/Gobold_Thin.ttf",
          as: "font",
          type: "font/ttf",
          crossorigin: "anonymous",
        },
        {
          rel: "preload",
          href: "/fonts/Roboto-VariableFont_wdth,wght.ttf",
          as: "font",
          type: "font/ttf",
          crossorigin: "anonymous",
        },
      ]
    }
  },
  css: [
    "@/assets/css/fonts.css",
    "@/assets/css/reset.css",
  ],
  runtimeConfig: {
    public: {
      apiUrl: process.env.APP_API_URL || 'http://localhost:8000'
    }
  },
  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
      ]
    }
  }
})
