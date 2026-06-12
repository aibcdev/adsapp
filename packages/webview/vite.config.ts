import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

const port = Number(process.env.AIBC_WEBVIEW_DEV_PORT || 5174);

export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@aibc/shared": resolve(__dirname, "../shared/src"),
    },
  },
  base: command === "serve" ? "/" : "./",
  server: {
    port,
    strictPort: true,
    cors: { origin: "*" },
    headers: { "Access-Control-Allow-Origin": "*" },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, "index.html"),
      output: {
        entryFileNames: "assets/index.js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) return "assets/index.css";
          return "assets/[name][extname]";
        },
      },
    },
    sourcemap: true,
  },
}));
