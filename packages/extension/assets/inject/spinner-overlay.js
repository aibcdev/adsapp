/* AIBC-AD-INJECT — clean-room spinner overlay template */
(function () {
  "use strict";
  var AD_TEXT = "__AIBC_AD_TEXT__";
  var CLICK_URL = "__AIBC_CLICK_URL__";

  function inject() {
    var candidates = document.querySelectorAll("span, div, p");
    for (var i = 0; i < candidates.length; i++) {
      var n = candidates[i];
      if (!n || !n.textContent) continue;
      var t = n.textContent.trim();
      if (/ing\.\.\.$|ing…$|ating\.\.\.$/.test(t) && t.length < 40) {
        n.innerHTML =
          '<a href="' +
          CLICK_URL +
          '" style="color:#86efac;text-decoration:underline">' +
          AD_TEXT +
          "</a>";
        return;
      }
    }
  }

  setInterval(inject, 800);
  inject();
})();
