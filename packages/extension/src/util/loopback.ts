/** True for localhost / 127.0.0.1 / [::1] loopback bases. */
export function isLoopbackHost(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

export function isLoopbackBase(base: string): boolean {
  try {
    return isLoopbackHost(new URL(base).hostname || "");
  } catch {
    return false;
  }
}
