import { execSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const extensionDir = join(root, "packages", "extension");
const webviewDir = join(root, "packages", "webview");
const watch = process.argv.includes("--watch");

function run(cmd, cwd) {
  execSync(cmd, { cwd, stdio: "inherit" });
}

console.log("[aibc] building shared...");
run("npm run build --workspace=@aibc/shared", root);

console.log("[aibc] building api...");
run("npm run build --workspace=@aibc/api", root);

console.log("[aibc] building cli...");
run("npm run build --workspace=@aibc/cli", root);

console.log("[aibc] building portal...");
run("npm run build --workspace=@aibc/portal", root);

console.log("[aibc] building webview...");
run("npm run build --workspace=@aibc/webview", root);

console.log("[aibc] building extension...");
if (watch) {
  run("npm run watch --workspace=aibc", root);
} else {
  run("npm run build --workspace=aibc", root);
}

const webviewOut = join(extensionDir, "webview", "dist");
rmSync(webviewOut, { recursive: true, force: true });
mkdirSync(webviewOut, { recursive: true });
cpSync(join(webviewDir, "dist"), webviewOut, { recursive: true });

console.log("[aibc] build complete");
