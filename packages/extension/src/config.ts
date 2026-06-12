import * as vscode from "vscode";
import {
  DEFAULT_API_BASE,
  DEFAULT_PORTAL_BASE,
  portalDashboardUrl,
} from "@aibc/shared";

export function getApiBase(): string {
  const config = vscode.workspace.getConfiguration("aibc");
  return (
    config.get<string>("apiBase") ||
    process.env.AIBC_API_BASE ||
    DEFAULT_API_BASE
  );
}

export function getPortalBase(): string {
  const config = vscode.workspace.getConfiguration("aibc");
  return (
    config.get<string>("portalBase") ||
    process.env.AIBC_PORTAL_URL ||
    DEFAULT_PORTAL_BASE
  );
}

export function getDashboardUrl(): string {
  return portalDashboardUrl(getPortalBase());
}
