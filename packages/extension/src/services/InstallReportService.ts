import * as vscode from "vscode";
import type { ApiClient } from "./ApiClient";
import type { AuthService } from "./AuthService";

export type InstallChannel = "vscode" | "cursor" | "windsurf" | "openvsx" | "direct";

function detectInstallChannel(): InstallChannel {
  const name = vscode.env.appName.toLowerCase();
  if (name.includes("cursor")) return "cursor";
  if (name.includes("windsurf")) return "windsurf";
  if (name.includes("vscodium")) return "openvsx";

  const ext = vscode.extensions.getExtension("AIBCMedia.aibc");
  const path = ext?.extensionUri.fsPath.toLowerCase() ?? "";
  if (path.includes(".vsix") || path.includes("/tmp/") || path.includes("downloads/")) {
    return "direct";
  }
  return "vscode";
}

export async function reportExtensionInstall(
  api: ApiClient,
  auth: AuthService,
): Promise<void> {
  try {
    const deviceId = await auth.getDeviceId();
    const channel = detectInstallChannel();
    await api.fetch("/v1/installs/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, deviceId, source: "extension" }),
    });
  } catch {
    /* non-blocking */
  }
}
