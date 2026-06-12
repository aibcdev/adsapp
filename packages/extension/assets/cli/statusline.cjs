#!/usr/bin/env node
"use strict";
const { readFileSync, writeSync } = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const CACHE = path.join(os.homedir(), ".aibc", "ad-cache.json");
const FRESH_MS = 300_000;

let wrote = false;
const put = (s) => {
  try { writeSync(1, s); wrote = true; } catch {}
};

try {
  const o = JSON.parse(readFileSync(CACHE, "utf8"));
  const fresh =
    o &&
    typeof o.ts === "number" &&
    Date.now() - o.ts <= FRESH_MS &&
    typeof o.adText === "string" &&
    o.adText.length > 0;

  if (fresh) {
    const strip = (s) => String(s).replace(/[\u0000-\u001f\u007f-\u009f]/g, "");
    const text = "ad· " + strip(o.adText);
    const url = typeof o.clickUrl === "string" ? strip(o.clickUrl) : "";
    const ESC = "\u001b";
    put(
      url
        ? ESC + "]8;;" + url + ESC + "\\" + text + ESC + "]8;;" + ESC + "\\"
        : text,
    );
  }
} catch {}

process.exit(0);
