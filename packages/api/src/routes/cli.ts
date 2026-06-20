import { Hono } from "hono";
import type { Database as DbType } from "better-sqlite3";
import { recordCliHeartbeat } from "../cli/activity.js";
import { resolveClient } from "../db/schema.js";

export function cliRoutes(db: DbType) {
  const app = new Hono();

  app.post("/v1/cli/heartbeat", async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as {
      deviceId?: string;
    };
    const deviceId = body.deviceId?.trim();
    if (!deviceId || deviceId.length < 8) {
      return c.json({ error: "deviceId required" }, 400);
    }

    const client = resolveClient(db, c.req.header("authorization"));
    recordCliHeartbeat(db, deviceId, client?.clientId ?? null);
    return c.json({ ok: true });
  });

  return app;
}
