chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "open_side_panel" && _sender.tab?.windowId) {
    chrome.sidePanel.open({ windowId: _sender.tab.windowId }).then(() => sendResponse({ ok: true }));
    return true;
  }
  return false;
});
