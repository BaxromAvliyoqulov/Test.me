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
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Test.me - Innovatsion Ta\'lim',
        short_name: 'Test.me',
        description: 'Testlarni yechish va bilimni oshirish uchun zamonaviy platforma',
        theme_color: '#3b82f6',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Firebase - eng katta kutubxona, alohida chunk
          "vendor-firebase": ["firebase/app", "firebase/auth", "firebase/firestore", "firebase/storage"],
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
