(function () {
  "use strict";

  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    if (!event.data || event.data.type !== "aibc_chrome_ready") return;
    document.documentElement.dataset.aibcChrome = "1";
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === "ping") {
      document.documentElement.dataset.aibcChrome = "1";
    }
  });
})();
