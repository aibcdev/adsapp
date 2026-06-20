import { writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

const outDir = process.argv[2] || join(process.cwd(), "packages/portal/dist");
let gitSha = "unknown";
try {
  gitSha = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
} catch {
  /* outside git */
}

writeFileSync(
  join(outDir, "build-id.json"),
  JSON.stringify({ builtAt: new Date().toISOString(), gitSha }, null, 2),
);
