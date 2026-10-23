import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(), 
    vueDevTools(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'Test.me - Innovatsion Ta\'lim',
        short_name: 'Test.me',
        description: 'Testlarni yechish va bilimni oshirish uchun zamonaviy mobil platforma',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
        start_url: '/',
        orientation: 'portrait-primary',
        categories: ['education', 'productivity'],
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "firebase/app": fileURLToPath(new URL("./src/compat/firebaseCompat.js", import.meta.url)),
      "firebase/auth": fileURLToPath(new URL("./src/compat/firebaseCompat.js", import.meta.url)),
      "firebase/firestore": fileURLToPath(new URL("./src/compat/firebaseCompat.js", import.meta.url)),
      "firebase/storage": fileURLToPath(new URL("./src/compat/firebaseCompat.js", import.meta.url)),
      "firebase/functions": fileURLToPath(new URL("./src/compat/firebaseCompat.js", import.meta.url)),
      "firebase/messaging": fileURLToPath(new URL("./src/compat/firebaseCompat.js", import.meta.url)),
      "firebase/analytics": fileURLToPath(new URL("./src/compat/firebaseCompat.js", import.meta.url)),
      "firebase": fileURLToPath(new URL("./src/compat/firebaseCompat.js", import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Google AI
          "vendor-ai": ["@google/generative-ai"],
          // Excel export
          "vendor-xlsx": ["xlsx"],
          // Charts
          "vendor-charts": ["chart.js", "vue-chartjs"],
          // Vue ecosystem
          "vendor-vue": ["vue", "vue-router", "vuex"],
          // UI libraries
          "vendor-ui": ["sweetalert2", "vue-toastification"],
        },
      },
    },
  },
});
