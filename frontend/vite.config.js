import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      ignored: [
        "**/server/data/gifts.json",
        "**/server/data/videos.json",
        "**/server/data/gift_logs.json",
        // nếu còn file server khác cũng gây reload thì thêm ở đây
        // "**/server/**/*.json",
  
      ]
    },
    proxy: {
      "/api": {
        target: "http://localhost:8888",
        changeOrigin: true,
      },
    },
  },
});
