// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  css: [
    '~/assets/css/bootstrap/bootstrap.min.css',
    '~/assets/css/fontawesome/all.min.css',
    '~/assets/css/main.css',
  ],
  runtimeConfig: {
    public: {
      apiBase: import.meta.env.NUXT_PUBLIC_API_BASE || '',
      urlHub: import.meta.env.NUXT_PUBLIC_URL_HUB || '',
      headerTheme: {
        logoUrl: import.meta.env.NUXT_PUBLIC_HEADER_THEME_LOGO_URL || '',
        ahtLogoUrl: import.meta.env.NUXT_PUBLIC_HEADER_THEME_AHT_LOGO_URL || '',
        iconDepUrl: import.meta.env.NUXT_PUBLIC_HEADER_THEME_ICON_DEP_URL || '',
        iconArrUrl: import.meta.env.NUXT_PUBLIC_HEADER_THEME_ICON_ARR_URL || '',
        logoCheckinUrl: import.meta.env.NUXT_PUBLIC_HEADER_THEME_LOGO_CHECKIN_URL || '',
        bgColor: import.meta.env.NUXT_PUBLIC_HEADER_THEME_BG_COLOR || '',
        textColor: import.meta.env.NUXT_PUBLIC_HEADER_THEME_TEXT_COLOR || '',
      },
    },
  },
  app: {
    head: {
      title: 'AHT Fids Spare',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }]
    }
  }
})
