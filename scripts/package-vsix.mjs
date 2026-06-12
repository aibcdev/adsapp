import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const extensionDir = join(root, "packages", "extension");

execSync("node scripts/build.mjs", { cwd: root, stdio: "inherit" });

const pkg = JSON.parse(
  readFileSync(join(extensionDir, "package.json"), "utf8"),
);

const vsixName = `aibc-${pkg.version}.vsix`;
execSync(`npx vsce package --no-dependencies --out ${vsixName}`, {
  cwd: extensionDir,
  stdio: "inherit",
});

console.log(`[aibc] packaged ${vsixName}`);
