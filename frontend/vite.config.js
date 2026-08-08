import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    host: "0.0.0.0",
    port: 5175,
    open: true,
    proxy: {
      "/api": {
        target: "http://192.168.0.145:5000",
        changeOrigin: true,
      },
    },
    hmr: {
      protocol: "ws",
      host: "192.168.0.145",
      port: 5176,
    },
  },
});
