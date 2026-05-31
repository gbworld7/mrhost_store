import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// Mini App served at MINIAPP_BASE_URL; same origin proxies /miniapi to the gateway.
export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/miniapi": { target: process.env.GATEWAY || "http://127.0.0.1:8090", changeOrigin: true } } },
  build: { outDir: "dist" },
});
