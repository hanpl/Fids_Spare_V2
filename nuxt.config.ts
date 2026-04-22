// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
    //apiBase: 'http://172.17.18.12:8901/api',
    //urlHub: 'http://172.17.18.12:8084/dashboardHub',
    apiBase: 'https://localhost:7079/api',
    urlHub: 'https://localhost:7248/dashboardHub',
  }
  },
  app: {
    head: {
      title: 'AHT Asset Hub',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }]
    }
  }
})
