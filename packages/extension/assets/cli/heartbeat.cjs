#!/usr/bin/env node
"use strict";
/** Fire-and-forget CLI active ping — spawned by statusline.cjs */
const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const https = require("node:https");
const os = require("node:os");
const path = require("node:path");

const dir = path.join(os.homedir(), ".aibc");
const deviceFile = path.join(dir, "device-id.json");
const authFile = path.join(dir, "auth.json");

function readDeviceId() {
  try {
    const parsed = JSON.parse(fs.readFileSync(deviceFile, "utf8"));
    if (parsed && typeof parsed.deviceId === "string" && parsed.deviceId.length >= 8) {
      return parsed.deviceId;
    }
  } catch {
    /* create below */
  }
  const deviceId = crypto.randomUUID();
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(deviceFile, JSON.stringify({ deviceId }, null, 2));
  } catch {
    /* ignore */
  }
  return deviceId;
}

function readToken() {
  try {
    const auth = JSON.parse(fs.readFileSync(authFile, "utf8"));
    return typeof auth.accessToken === "string" ? auth.accessToken : "";
  } catch {
    return "";
  }
}

const deviceId = readDeviceId();
const token = readToken();
const apiBase = (process.env.AIBC_API_BASE || "https://api.aibcmedia.com").replace(/\/$/, "");
const url = new URL(`${apiBase}/v1/cli/heartbeat`);
const body = JSON.stringify({ deviceId });
const headers = {
  "Content-Type": "application/json",
  "Content-Length": Buffer.byteLength(body),
};
if (token) headers.Authorization = `Bearer ${token}`;

const lib = url.protocol === "https:" ? https : http;
const req = lib.request(
  url,
  { method: "POST", headers, timeout: 2000 },
  (res) => {
    res.resume();
  },
);
req.on("error", () => {});
req.on("timeout", () => req.destroy());
req.write(body);
req.end();
