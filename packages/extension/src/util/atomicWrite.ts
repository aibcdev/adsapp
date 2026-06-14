import * as fs from "node:fs";
import * as path from "node:path";
import { randomBytes } from "node:crypto";

/** Crash-safe write: temp file → fsync → rename. */
export function atomicWriteFile(filePath: string, content: string | Buffer): void {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  const tmp = path.join(dir, `.${path.basename(filePath)}.${randomBytes(4).toString("hex")}.tmp`);
  const fd = fs.openSync(tmp, "w");
  try {
    const buf = typeof content === "string" ? Buffer.from(content, "utf8") : content;
    fs.writeSync(fd, buf);
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  fs.renameSync(tmp, filePath);
}
