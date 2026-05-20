import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { localDevServerOptions } from "../../config/vite-local-hosts.js";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    ...localDevServerOptions(5175),
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true
      }
    }
  }
});
