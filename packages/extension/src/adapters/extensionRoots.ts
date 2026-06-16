import * as os from "node:os";
import * as path from "node:path";

/** VS Code / Cursor / Insiders extension install roots (incl. Windows). */
export function extensionRoots(): string[] {
  const home = os.homedir();
  const roots = [
    path.join(home, ".cursor", "extensions"),
    path.join(home, ".vscode", "extensions"),
    path.join(home, ".vscode-insiders", "extensions"),
  ];

  if (process.platform === "win32") {
    const appData = process.env.APPDATA;
    const userProfile = process.env.USERPROFILE || home;
    if (appData) {
      roots.push(
        path.join(appData, "Code", "extensions"),
        path.join(appData, "Code - Insiders", "extensions"),
        path.join(appData, "Cursor", "extensions"),
      );
    }
    roots.push(
      path.join(userProfile, ".vscode", "extensions"),
      path.join(userProfile, ".vscode-insiders", "extensions"),
      path.join(userProfile, ".cursor", "extensions"),
    );
  }

  return roots;
}
