---
title: "Claude Code uninstall anxiety — why clean restore matters"
slug: "claude-code-uninstall-anxiety-clean-restore"
description: "Patches that don't revert kill trust. How we restore index.js, settings.json, and ~/.aibc artifacts."
publishedAt: "2026-06-13T08:00:00Z"
author: "AIBC"
tags: ["claude-code", "trust", "extension"]
keywords: ["claude code extension uninstall", "aibc restore", "developer trust"]
draft: false
---

The #1 fear with any Claude Code patcher: **what if uninstall leaves garbage?**

Fair. We harden restore constantly:

- `index.js` injection stripped or restored from backup
- `~/.claude/settings.json` status line removed
- `~/.aibc/*` artifacts deleted on deactivate
- `aibc: Restore Claude Code` command if you want manual control

Kickbacks issue #97 is our reminder: trust is the product.

If restore fails, you won't recommend us. Neither will Reddit.

Try it. Uninstall. Check your files. We bet you'll come back.

[Install →](/#install) · [Privacy →](/privacy)
