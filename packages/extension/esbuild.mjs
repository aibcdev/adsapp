import * as esbuild from "esbuild";
import { cpSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = __dirname;
const watch = process.argv.includes("--watch");

const ctx = await esbuild.context({
  entryPoints: [join(root, "src/extension.ts")],
  bundle: true,
  outfile: join(root, "dist/extension.js"),
  platform: "node",
  format: "cjs",
  external: ["vscode"],
  sourcemap: true,
  target: "node18",
  logLevel: "info",
});

if (watch) {
  await ctx.watch();
  console.log("[extension] watching...");
} else {
  await ctx.rebuild();
  await ctx.dispose();
}

mkdirSync(join(root, "dist/mock"), { recursive: true });
cpSync(join(root, "..", "..", "mock", "feed.json"), join(root, "dist", "mock", "feed.json"));
mkdirSync(join(root, "dist", "assets", "cli"), { recursive: true });
cpSync(join(root, "assets", "cli", "statusline.cjs"), join(root, "dist", "assets", "cli", "statusline.cjs"));

console.log("[extension] build complete");
