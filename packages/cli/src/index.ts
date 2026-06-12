#!/usr/bin/env node
import { login, refreshAds } from "./api";
import { installClaudeTerminal, restoreClaudeTerminal, status } from "./install";

const [,, cmd, arg] = process.argv;

async function main() {
  switch (cmd) {
    case "login":
      console.log("Signed in as", await login());
      break;
    case "install":
      if (arg === "claude" || !arg) {
        installClaudeTerminal();
        await refreshAds();
      } else {
        console.error("Usage: aibc install claude");
        process.exit(1);
      }
      break;
    case "restore":
      restoreClaudeTerminal();
      break;
    case "refresh":
      await refreshAds();
      break;
    case "status":
      status();
      break;
    default:
      console.log(`aibc CLI — terminal ads without an IDE

Commands:
  aibc login          Sign in to earn
  aibc install claude Hook Claude Code terminal status line
  aibc refresh        Fetch latest ad
  aibc restore        Undo Claude settings changes
  aibc status         Check install state

Set AIBC_API_BASE for custom API (default http://127.0.0.1:8787)
`);
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
