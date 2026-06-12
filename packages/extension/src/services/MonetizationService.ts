import * as vscode from "vscode";
import type { AibcTab } from "@aibc/shared";

export class MonetizationService {
  openExternal(url: string): Thenable<boolean> {
    return vscode.env.openExternal(vscode.Uri.parse(url));
  }

  trackClickMetadata(tab: AibcTab, sponsored?: boolean, affiliate?: boolean) {
    return {
      tab,
      sponsored: Boolean(sponsored),
      affiliate: Boolean(affiliate),
      monetized: Boolean(sponsored || affiliate),
    };
  }
}
