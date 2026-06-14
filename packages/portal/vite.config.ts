import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const dir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@aibc/shared": path.resolve(dir, "../shared/src/index.ts"),
    },
  },
  server: { port: 5175, host: "127.0.0.1", strictPort: false },
});
