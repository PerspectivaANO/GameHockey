(function () {
  "use strict";

  // меню на телефоне
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  function closeMenu() {
    nav.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  }
  burger.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") closeMenu();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  function reducedMotion() { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }

  // плавное появление блоков (без IntersectionObserver всё остаётся видимым)
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var group = el.parentElement.classList.contains("reveal-group") ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
        el.style.transitionDelay = group * 80 + "ms";
        el.classList.add("in");
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  // «Как начать»: выбор способа (Telegram или установка на телефон) и системы (Android или iPhone)
  function tabs(buttons, panels, attr, onPick) {
    function pick(value, focus) {
      buttons.forEach(function (b) {
        var on = b.getAttribute(attr) === value;
        b.classList.toggle("on", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
        b.tabIndex = on ? 0 : -1;
        if (on && focus) b.focus();
      });
      Object.keys(panels).forEach(function (k) { panels[k].hidden = k !== value; });
      if (onPick) onPick(value);
    }
    buttons.forEach(function (b, i) {
      b.addEventListener("click", function () { pick(b.getAttribute(attr)); });
      b.addEventListener("keydown", function (e) {
        var step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        pick(buttons[(i + step + buttons.length) % buttons.length].getAttribute(attr), true);
      });
    });
    return pick;
  }
  var pickWay = tabs(document.querySelectorAll("[data-way]"), { tg: document.getElementById("way-tg"), phone: document.getElementById("way-phone") }, "data-way");
  var pickOs = tabs(document.querySelectorAll("[data-os]"), { android: document.getElementById("os-android"), ios: document.getElementById("os-ios") }, "data-os");
  var onIphone = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  pickOs(onIphone ? "ios" : "android");
  function showStart(way) {
    pickWay(way);
    document.getElementById("start-options").scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
  }
  function showSafariHelp() {
    pickWay("phone");
    pickOs("ios");
    var help = document.getElementById("start-safari");
    help.open = true;
    help.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "center" });
  }
  function showCodeFlow() {
    pickWay("phone");
    document.getElementById("start-code").scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "center" });
  }
  document.querySelectorAll('a[href="#start-phone"], a[href="#start-tg"], a[href="#start-safari"], a[href="#start-code"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var target = a.getAttribute("href");
      if (target === "#start-safari") showSafariHelp();
      else if (target === "#start-code") showCodeFlow();
      else showStart(target === "#start-phone" ? "phone" : "tg");
    });
  });
  if (location.hash === "#start-phone") showStart("phone");
  if (location.hash === "#start-safari") showSafariHelp();
  if (location.hash === "#start-code") showCodeFlow();

  // адрес приложения берётся из адреса самой страницы (при смене домена ничего править не надо)
  // если лендинг лежит на другом адресе (например, GitHub Pages), приложение и цифры живут на сервере: его адрес задаёт <meta name="app-origin">
  var appOrigin = (document.querySelector('meta[name="app-origin"]') || {}).content || location.origin;
  var appUrl = appOrigin + "/app/";
  document.querySelectorAll("[data-app-url]").forEach(function (el) { el.value = appUrl; });
  document.querySelectorAll("[data-app-host]").forEach(function (el) { el.textContent = appUrl.replace(/^https?:\/\//, ""); });
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var box = document.createElement("textarea");
      box.value = text;
      box.setAttribute("readonly", "");
      box.style.cssText = "position:fixed;opacity:0;top:0;left:0";
      document.body.appendChild(box);
      box.select();
      try { document.execCommand("copy") ? resolve() : reject(); } catch (e) { reject(e); }
      document.body.removeChild(box);
    });
  }
  document.querySelectorAll("[data-copy-app]").forEach(function (btn) {
    var label = btn.textContent;
    btn.addEventListener("click", function () {
      var field = btn.parentElement.querySelector("input");
      copyText(appUrl).then(function () { btn.textContent = "Скопировано ✓"; }, function () {
        if (field) { field.focus(); field.select(); }
        btn.textContent = "Выделено: скопируйте";
      }).then(function () { setTimeout(function () { btn.textContent = label; }, 2500); });
    });
  });

  // галерея скриншотов
  var carousel = document.getElementById("carousel");
  function slide(dir) {
    var first = carousel.querySelector(".slide");
    var step = first ? first.getBoundingClientRect().width + 24 : 280;
    carousel.scrollBy({ left: dir * step, behavior: "smooth" });
  }
  document.getElementById("prev").addEventListener("click", function () { slide(-1); });
  document.getElementById("next").addEventListener("click", function () { slide(1); });
  carousel.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { slide(1); e.preventDefault(); }
    if (e.key === "ArrowLeft") { slide(-1); e.preventDefault(); }
  });

  // живые цифры из приложения: показываем только то, что вернул сервер; при ошибке или числе ниже порога (data-min) плитку прячем
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function count(el, to) {
    el.textContent = to; // итоговое число сразу: в фоновой вкладке анимация не идёт, а цифра должна быть
    if (reduce || to < 5 || document.visibilityState !== "visible") return;
    var start = null;
    function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / 900, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  function plural(n, forms) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return forms[0];
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return forms[1];
    return forms[2];
  }
  var tiles = document.querySelectorAll("[data-live]");
  function hideTiles() { tiles.forEach(function (t) { t.hidden = true; }); }
  fetch(appOrigin + "/api/public/stats", { headers: { Accept: "application/json" } })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(function (s) {
      tiles.forEach(function (t) {
        var el = t.querySelector("[data-stat]");
        var n = Number(s[el.getAttribute("data-stat")]);
        var min = Number(t.getAttribute("data-min")) || 1;
        if (!(n >= min)) { t.hidden = true; return; } // совсем малые числа не выпячиваем: покажутся сами, когда вырастут
        var label = t.querySelector("[data-forms]");
        if (label) label.textContent = plural(n, label.getAttribute("data-forms").split("|")) + (label.getAttribute("data-suffix") || "");
        count(el, n);
      });
    })
    .catch(hideTiles);
})();
