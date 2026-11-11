/* ==========================================================================
   NISHIT KUMAR — Engineering Portfolio
   Vanilla JS, no dependencies. GitHub Pages compatible.
   0. Light/dark theme toggle (persisted, respects prefers-color-scheme)
   1. Mobile navigation toggle
   2. Scroll-spy active state for primary nav
   3. IntersectionObserver section reveals
   4. Accessibility: Escape closes the mobile menu
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- 0. Theme toggle ---------- */
  var root = document.documentElement;
  var themeToggles = document.querySelectorAll(".theme-toggle");
  var metaTheme = document.querySelector('meta[name="theme-color"]');

  function getTheme() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function renderTheme(theme) {
    themeToggles.forEach(function (btn) {
      var icon = btn.querySelector(".theme-toggle-icon");
      var toLight = theme === "dark";
      btn.setAttribute("aria-label", toLight ? "Switch to light mode" : "Switch to dark mode");
      btn.setAttribute("aria-pressed", String(theme === "light"));
      btn.title = toLight ? "Switch to light mode" : "Switch to dark mode";
      if (icon) icon.textContent = toLight ? "\u2600" : "\u263E"; // ☀ / ☾
    });
    if (metaTheme) metaTheme.setAttribute("content", theme === "dark" ? "#0c1017" : "#f7f9fc");
  }

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem("nk-theme", theme); } catch (e) { /* private mode */ }
    renderTheme(theme);
  }

  if (!root.getAttribute("data-theme")) {
    var initial = "light";
    try {
      initial = localStorage.getItem("nk-theme") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    } catch (e) { /* ignore */ }
    root.setAttribute("data-theme", initial);
  }
  renderTheme(getTheme());

  themeToggles.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setTheme(getTheme() === "dark" ? "light" : "dark");
    });
  });

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Mobile navigation ---------- */
  var toggleBtn = document.querySelector(".nav-toggle");
  var mobileMenu = document.getElementById("mobile-menu");

  function closeMenu() {
    if (!mobileMenu || !toggleBtn) return;
    mobileMenu.hidden = true;
    toggleBtn.setAttribute("aria-expanded", "false");
  }

  if (toggleBtn && mobileMenu) {
    toggleBtn.addEventListener("click", function () {
      var open = mobileMenu.hidden;
      mobileMenu.hidden = !open;
      toggleBtn.setAttribute("aria-expanded", String(open));
    });

    mobileMenu.addEventListener("click", function (e) {
      if (e.target && e.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !mobileMenu.hidden) {
        closeMenu();
        toggleBtn.focus();
      }
    });
  }

  /* ---------- 2. Scroll-spy ---------- */
  var navLinks = document.querySelectorAll(".nav-list a[href^='#']");

  if (navLinks.length && "IntersectionObserver" in window) {
    var sections = [];
    navLinks.forEach(function (link) {
      var target = document.querySelector(link.getAttribute("href"));
      if (target) sections.push(target);
    });

    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) {
              l.classList.toggle("is-active", l.getAttribute("href") === "#" + entry.target.id);
            });
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- 3. Section reveals ---------- */
  var revealSections = document.querySelectorAll(".section");

  if (revealSections.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealSections.forEach(function (s) { s.classList.add("is-visible"); });
    } else {
      var reveal = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );
      revealSections.forEach(function (s) { reveal.observe(s); });
    }
  }

  /* ---------- 4. Set current-year copies ---------- */
  var yearEls = document.querySelectorAll("[data-year]");
  if (yearEls.length) {
    var year = new Date().getFullYear();
    yearEls.forEach(function (el) { el.textContent = year; });
  }

  /* ---------- 6. Scroll UI: progress bar, header state, back-to-top ----------
     One passive scroll listener, throttled with requestAnimationFrame. */
  var progressBar = document.querySelector(".scroll-progress-bar");
  var siteHeader = document.querySelector(".site-header");
  var toTop = document.querySelector(".to-top");

  if (progressBar || siteHeader || toTop) {
    if (toTop) {
      toTop.hidden = false;
      toTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      });
    }

    var ticking = false;

    function onScroll() {
      var y = window.scrollY || document.documentElement.scrollTop;

      if (progressBar) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var pct = max > 0 ? Math.min(100, (y / max) * 100) : 0;
        progressBar.style.width = pct + "%";
      }

      if (siteHeader) siteHeader.classList.toggle("is-scrolled", y > 8);
      if (toTop) toTop.classList.toggle("is-visible", y > 600);

      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(onScroll);
      }
    }, { passive: true });

    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 5. Project detail dialogs ----------
     "View Details" buttons carry data-dialog="<dialog id>".
     Uses the native <dialog> element: Escape and focus return are built in.
     Without JavaScript the dialogs render as plain panels (css §21), so no
     project information is ever unreachable. */
  var detailTriggers = document.querySelectorAll("[data-dialog]");

  if (detailTriggers.length) {
    var scrollLockValue = "";
    var openCount = 0;

    function lockScroll() {
      if (openCount === 0) {
        scrollLockValue = document.body.style.overflow;
        document.body.style.overflow = "hidden";
      }
      openCount += 1;
    }

    function unlockScroll() {
      openCount = Math.max(0, openCount - 1);
      if (openCount === 0) document.body.style.overflow = scrollLockValue;
    }

    function openDialog(dialog) {
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", ""); // very old browsers: inline panel
      }
      lockScroll();
      var body = dialog.querySelector(".dlg-body");
      if (body) body.scrollTop = 0;
    }

    function closeDialog(dialog) {
      if (typeof dialog.close === "function") {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
        unlockScroll();
      }
    }

    detailTriggers.forEach(function (btn) {
      var dialog = document.getElementById(btn.getAttribute("data-dialog"));
      if (!dialog) return;

      btn.addEventListener("click", function () { openDialog(dialog); });

      dialog.addEventListener("close", unlockScroll);

      // Close on a click outside the dialog's content panel.
      dialog.addEventListener("click", function (e) {
        if (e.target === dialog) closeDialog(dialog);
      });

      dialog.querySelectorAll("[data-dialog-close]").forEach(function (closeBtn) {
        closeBtn.addEventListener("click", function () { closeDialog(dialog); });
      });
    });
  }
})();