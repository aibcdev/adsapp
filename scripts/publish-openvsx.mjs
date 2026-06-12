import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const extensionDir = join(root, "packages", "extension");

execSync("node scripts/build.mjs", { cwd: root, stdio: "inherit" });
execSync("npx ovsx publish --no-dependencies", {
  cwd: extensionDir,
  stdio: "inherit",
});

console.log("[aibc] published to OpenVSX");
