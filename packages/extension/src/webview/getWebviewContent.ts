import * as vscode from "vscode";
import type { FeedStatePayload } from "@aibc/shared";

const DEV_PORT = Number(process.env.AIBC_WEBVIEW_DEV_PORT || 5174);

export function getWebviewContent(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
): string {
  const isDev = extensionUri.fsPath.includes(".vscode-test") === false &&
    process.env.VSCODE_DEBUG_MODE === "true";

  if (isDev && process.env.AIBC_WEBVIEW_DEV === "1") {
    const devServer = `http://localhost:${DEV_PORT}`;
    const csp = [
      "default-src 'none'",
      `script-src ${devServer} 'unsafe-inline' 'unsafe-eval'`,
      `style-src ${devServer} 'unsafe-inline'`,
      `font-src ${devServer}`,
      `img-src ${devServer} https: data:`,
      `connect-src ${devServer} ws://localhost:${DEV_PORT}`,
    ].join("; ");

    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="${csp}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>aibc</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="${devServer}/src/main.tsx"></script>
  </body>
</html>`;
  }

  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "webview", "dist", "assets", "index.js"),
  );
  const styleUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "webview", "dist", "assets", "index.css"),
  );

  const csp = [
    "default-src 'none'",
    `style-src ${webview.cspSource} 'unsafe-inline'`,
    `script-src ${webview.cspSource}`,
    `img-src ${webview.cspSource} https: data:`,
    `font-src ${webview.cspSource}`,
    `connect-src ${webview.cspSource} https:`,
  ].join("; ");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="${csp}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="${styleUri}">
    <title>aibc</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="${scriptUri}"></script>
  </body>
</html>`;
}

export function getWebviewOptions(
  extensionUri: vscode.Uri,
): vscode.WebviewOptions {
  return {
    enableScripts: true,
    localResourceRoots: [
      vscode.Uri.joinPath(extensionUri, "webview", "dist"),
      vscode.Uri.joinPath(extensionUri, "media"),
    ],
  };
}

export type WebviewMessenger = {
  postFeedState: (payload: FeedStatePayload) => void;
  postFeedLoading: () => void;
  postFeedError: (message: string) => void;
  postEarnings: (payload: import("@aibc/shared").EarningsSnapshot | null, signedIn: boolean) => void;
};

export function createMessenger(
  webview: vscode.Webview,
): WebviewMessenger {
  return {
    postFeedState: (payload) =>
      webview.postMessage({ type: "feed_state", payload }),
    postFeedLoading: () => webview.postMessage({ type: "feed_loading" }),
    postFeedError: (message) =>
      webview.postMessage({ type: "feed_error", message }),
    postEarnings: (payload, signedIn) =>
      webview.postMessage({ type: "earnings_state", payload, signedIn }),
  };
}
