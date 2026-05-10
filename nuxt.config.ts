// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@nuxtjs/supabase'],

  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      include: undefined,
      exclude: ['/login', '/register'],
      cookieRedirect: false,
    }
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Server-side only (private)
    geminiApiKey: process.env.GEMINI_API_KEY,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,

    // Public (exposed to client)
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    }
  },

  nitro: {
    // Server-side API routes
  }
})
