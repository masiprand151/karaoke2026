import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // biar bisa diakses dari LAN
    port: 5174, // default 5173, bisa diganti
  },
});
