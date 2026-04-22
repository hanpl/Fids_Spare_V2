// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  ssr: false,
  devtools: { enabled: true },
  css: [
    '~/assets/css/bootstrap/bootstrap.min.css',
    '~/assets/css/fontawesome/fontawesome-all.min.css',
    '~/assets/css/fontawesome/all.min.css',
    '~/assets/css/flaticon/flaticon.css',
    '~/assets/css/default.css',
    '~/assets/css/style.css',
    '~/assets/css/responsive.css',
  ],
  runtimeConfig: {
    public: {
      // Override at runtime via NUXT_PUBLIC_API_BASE and NUXT_PUBLIC_HUB_BASE env vars
      apiBase: 'http://172.17.18.12:8085',
      hubBase: 'http://172.17.18.12:8084',
    },
  },
})
