import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
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
