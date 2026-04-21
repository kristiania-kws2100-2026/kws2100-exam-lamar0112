import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/kws2100-exam-lamar0112/",
  server: {
    // Videresender /api-kall til Hono-serveren lokalt (forelesning 7)
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
