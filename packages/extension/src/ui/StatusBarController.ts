import * as vscode from "vscode";
import type { EarningsSnapshot } from "@aibc/shared";

export type StatusKind =
  | "sign_in"
  | "earning"
  | "off"
  | "incompatible"
  | "offline"
  | "killed"
  | "reload";

export class StatusBarController {
  private item: vscode.StatusBarItem;
  private capItem: vscode.StatusBarItem;
  private kind: StatusKind = "sign_in";
  private earnings: EarningsSnapshot | null = null;

  constructor() {
    this.item = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100,
    );
    this.capItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      99,
    );
    this.item.command = "aibc.menu";
    this.render();
    this.item.show();
  }

  dispose(): void {
    this.item.dispose();
    this.capItem.dispose();
  }

  setKind(kind: StatusKind): void {
    this.kind = kind;
    this.render();
  }

  setEarnings(snapshot: EarningsSnapshot | null): void {
    this.earnings = snapshot;
    if (snapshot && this.kind === "sign_in") this.kind = "earning";
    this.render();
  }

  private render(): void {
    switch (this.kind) {
      case "sign_in":
        this.item.text = "$(sparkle) aibc: Sign in";
        this.item.tooltip = "Click to sign in and start earning";
        break;
      case "earning":
        this.item.text = this.earnings
          ? `$(credit-card) aibc ($${this.earnings.today.toFixed(2)} today · $${this.earnings.lifetime.toFixed(2)})`
          : "$(credit-card) aibc: Earning";
        this.item.tooltip = "aibc earnings — click for menu";
        break;
      case "off":
        this.item.text = "$(circle-slash) aibc: Off";
        break;
      case "incompatible":
        this.item.text = "$(warning) aibc incompatible";
        break;
      case "offline":
        this.item.text = "$(cloud-offline) aibc offline";
        break;
      case "killed":
        this.item.text = "$(stop-circle) aibc paused";
        break;
      case "reload":
        this.item.text = "$(refresh) aibc: RELOAD to earn";
        this.item.command = "workbench.action.reloadWindow";
        break;
    }

    if (this.earnings?.hourlyCapHit || this.earnings?.dailyCapHit) {
      this.capItem.text = this.earnings.hourlyCapHit
        ? "$(clock) Hourly cap"
        : "$(warning) Daily cap";
      this.capItem.show();
    } else {
      this.capItem.hide();
    }
  }
}
