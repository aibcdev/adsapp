import type { AibcFeatureFlags } from "./types";
import { DEFAULT_FEATURE_FLAGS } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCard(value: unknown): value is import("./types").AibcCard {
  if (!isRecord(value)) return false;
  const cta = value.cta;
  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    typeof value.category === "string" &&
    isRecord(cta) &&
    typeof cta.label === "string" &&
    typeof cta.url === "string"
  );
}

function isUpdate(value: unknown): value is import("./types").AibcUpdate {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.summary === "string" &&
    typeof value.date === "string"
  );
}

function isCardArray(value: unknown) {
  return Array.isArray(value) && value.every(isCard);
}

function isUpdateArray(value: unknown) {
  return Array.isArray(value) && value.every(isUpdate);
}

export function validateFeed(data: unknown): import("./types").AibcFeed | null {
  if (!isRecord(data)) return null;

  const flagsRaw = isRecord(data.flags) ? data.flags : {};
  const tabsRaw = isRecord(flagsRaw.tabs) ? flagsRaw.tabs : {};

  return {
    version: typeof data.version === "string" ? data.version : "1",
    flags: {
      tabs: {
        discover: tabsRaw.discover !== false,
        featured: tabsRaw.featured !== false,
        resources: tabsRaw.resources !== false,
        updates: tabsRaw.updates !== false,
        earn: tabsRaw.earn !== false,
      },
      layout: flagsRaw.layout === "list" ? "list" : "grid",
      refreshIntervalMinutes:
        typeof flagsRaw.refreshIntervalMinutes === "number" &&
        flagsRaw.refreshIntervalMinutes > 0
          ? flagsRaw.refreshIntervalMinutes
          : DEFAULT_FEATURE_FLAGS.refreshIntervalMinutes,
    },
    discover: isCardArray(data.discover) ? data.discover : [],
    featured: isCardArray(data.featured) ? data.featured : [],
    resources: isCardArray(data.resources) ? data.resources : [],
    updates: isUpdateArray(data.updates) ? data.updates : [],
  };
}
