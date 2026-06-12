import type { HostToWebviewMessage, WebviewToHostMessage } from "@aibc/shared";

declare global {
  interface Window {
    acquireVsCodeApi?: () => {
      postMessage: (message: WebviewToHostMessage) => void;
      getState: () => unknown;
      setState: (state: unknown) => void;
    };
  }
}

const vscode =
  typeof window.acquireVsCodeApi === "function"
    ? window.acquireVsCodeApi()
    : null;

export function postToHost(message: WebviewToHostMessage): void {
  if (vscode) {
    vscode.postMessage(message);
    return;
  }

  if (import.meta.env?.DEV) {
    console.debug("[aibc-host]", message);
  }
}

export function subscribeFromHost(
  handler: (message: HostToWebviewMessage) => void,
): () => void {
  const listener = (event: MessageEvent<HostToWebviewMessage>) => {
    handler(event.data);
  };

  window.addEventListener("message", listener);
  return () => window.removeEventListener("message", listener);
}

export function isVsCodeWebview(): boolean {
  return Boolean(vscode);
}
