import * as vscode from "vscode";
import { DEFAULT_API_BASE } from "@aibc/shared";

export class ApiClient {
  constructor(private readonly getToken: () => string | undefined) {}

  get baseUrl(): string {
    const config = vscode.workspace.getConfiguration("aibc");
    return (
      config.get<string>("apiBase") ||
      process.env.AIBC_API_BASE ||
      DEFAULT_API_BASE
    );
  }

  async fetch(path: string, init: RequestInit = {}): Promise<Response> {
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");
    const token = this.getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(`${this.baseUrl}${path}`, { ...init, headers });
  }

  async json<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await this.fetch(path, init);
    if (!res.ok) throw new Error(`API ${path} failed (${res.status})`);
    return res.json() as Promise<T>;
  }
}
