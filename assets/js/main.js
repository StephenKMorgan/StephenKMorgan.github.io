/* Stephen K. Morgan — site behavior.
   Vanilla, no dependencies. Every enhancement degrades to a working page:
   without JS the theme follows the OS, all sections render, and the nav is
   plain anchor links. */

(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------------------------------------------------------------------
     Theme toggle
     The initial theme is applied by an inline script in <head> (before first
     paint) so the page never flashes the wrong colors. This only handles the
     button and persistence.
     --------------------------------------------------------------------- */

  var themeBtn = document.querySelector("[data-theme-toggle]");

  function currentTheme() {
    return root.getAttribute("data-theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeBtn) {
      themeBtn.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      );
    }
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {
      /* Private mode or blocked storage: the toggle still works for this
         visit, it just will not be remembered. */
    }
  }

  if (themeBtn) {
    applyTheme(currentTheme());
    themeBtn.addEventListener("click", function () {
      applyTheme(currentTheme() === "dark" ? "light" : "dark");
    });
  }

  /* ---------------------------------------------------------------------
     Mobile navigation disclosure
     --------------------------------------------------------------------- */

  var navToggle = document.querySelector("[data-nav-toggle]");
  var navList = document.getElementById("nav-list");

  function setNav(open) {
    if (!navToggle || !navList) return;
    navToggle.setAttribute("aria-expanded", String(open));
    navList.setAttribute("data-open", String(open));
  }

  if (navToggle && navList) {
    setNav(false);

    navToggle.addEventListener("click", function () {
      setNav(navToggle.getAttribute("aria-expanded") !== "true");
    });

    // Picking a destination should close the menu.
    navList.addEventListener("click", function (event) {
      if (event.target.closest("a")) setNav(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
        setNav(false);
        navToggle.focus();
      }
    });

    // The panel is a small-screen affordance only; if the viewport grows past
    // the breakpoint the list becomes a normal row again and must not stay
    // stuck in the collapsed state.
    var wide = window.matchMedia("(min-width: 721px)");
    var onWide = function (event) { if (event.matches) setNav(false); };
    if (wide.addEventListener) wide.addEventListener("change", onWide);
    else if (wide.addListener) wide.addListener(onWide);
  }

  /* ---------------------------------------------------------------------
     Header shadow once the page has scrolled
     --------------------------------------------------------------------- */

  var header = document.querySelector(".site-header");
  var ticking = false;

  function onScroll() {
    if (header) header.classList.toggle("is-stuck", window.scrollY > 8);
    updateSpyAtEdges();
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(onScroll);
  }, { passive: true });

  /* ---------------------------------------------------------------------
     Scroll-spy: mark the section currently being read
     --------------------------------------------------------------------- */

  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll(".nav__link[href^='#']")
  );
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute("href")); })
    .filter(Boolean);

  function setActive(id) {
    navLinks.forEach(function (link) {
      if (link.getAttribute("href") === "#" + id) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  // Guards the last section: a short final section may never cross the
  // observer's middle band, so at the bottom of the page we assert it.
  function updateSpyAtEdges() {
    if (!sections.length) return;
    var atBottom =
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 2;
    if (atBottom) setActive(sections[sections.length - 1].id);
  }

  if (sections.length && "IntersectionObserver" in window) {
    var visible = new Set();

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      });

      // Several sections can straddle the band at once; the first in document
      // order is the one the reader has reached.
      for (var i = 0; i < sections.length; i++) {
        if (visible.has(sections[i].id)) {
          setActive(sections[i].id);
          break;
        }
      }
      updateSpyAtEdges();
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (section) { spy.observe(section); });
  }

  /* ---------------------------------------------------------------------
     Reveal on scroll
     --------------------------------------------------------------------- */

  var revealables = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  if (!revealables.length) {
    /* nothing to do */
  } else if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    // No animation available or wanted: show everything immediately. Content
    // must never depend on the effect running.
    revealables.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var reveal = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);   // one-shot
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });

    revealables.forEach(function (el) { reveal.observe(el); });
  }

  /* ---------------------------------------------------------------------
     Footer year
     --------------------------------------------------------------------- */

  var year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  onScroll();
})();
