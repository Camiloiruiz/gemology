/* ============================================================
   GemLens — App Logic
   Multi-page: theme, drawer, reveal, accordion, tabs, TOC, filter
   ============================================================ */
(function () {
  'use strict';

  // --- Theme ---
  var root = document.documentElement;
  var THEME_KEY = 'gemlens-theme';
  var themeToggle = document.getElementById('themeToggle');

  function setTheme(t) {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem(THEME_KEY, t); } catch (_) {}
  }

  (function initTheme() {
    var s;
    try { s = localStorage.getItem(THEME_KEY); } catch (_) {}
    if (s === 'dark' || s === 'light') setTheme(s);
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');
  })();

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    var s; try { s = localStorage.getItem(THEME_KEY); } catch (_) {}
    if (!s) setTheme(e.matches ? 'dark' : 'light');
  });

  // --- Top Bar Scroll Shadow ---
  var topBar = document.getElementById('topBar');
  var scrollTick = false;
  function onScroll() {
    if (!scrollTick) {
      requestAnimationFrame(function () {
        if (topBar) topBar.classList.toggle('top-bar--scrolled', window.scrollY > 8);
        scrollTick = false;
      });
      scrollTick = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- Active Nav (multi-page) ---
  var currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .drawer__link').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html') ||
        (currentPage === 'index.html' && href === 'index.html')) {
      link.classList.add(link.classList.contains('nav-link') ? 'nav-link--active' : 'drawer__link--active');
    }
  });

  // --- Scroll-spy for single-page sections (home page) ---
  var navLinks = document.querySelectorAll('.top-bar__nav .nav-link[href^="#"]');
  var spySections = [];
  navLinks.forEach(function (link) {
    var el = document.getElementById(link.getAttribute('href').slice(1));
    if (el) spySections.push({ el: el, link: link });
  });
  if (spySections.length > 0) {
    window.addEventListener('scroll', function () {
      requestAnimationFrame(function () {
        var y = window.scrollY + 120;
        var active = null;
        for (var i = spySections.length - 1; i >= 0; i--) {
          if (spySections[i].el.offsetTop <= y) { active = spySections[i]; break; }
        }
        navLinks.forEach(function (l) { l.classList.remove('nav-link--active'); });
        if (active) active.link.classList.add('nav-link--active');
      });
    }, { passive: true });
  }

  // --- Reveal on Scroll ---
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('reveal--visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    reveals.forEach(function (el) { obs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('reveal--visible'); });
  }

  // --- Mobile Drawer ---
  var drawer = document.getElementById('drawer');
  var scrim = document.getElementById('drawerScrim');
  var navToggle = document.getElementById('navToggle');
  var drawerClose = document.getElementById('drawerClose');

  function openDrawer() {
    if (drawer) { drawer.classList.add('drawer--open'); scrim.classList.add('drawer-scrim--open'); document.body.style.overflow = 'hidden'; }
  }
  function closeDrawer() {
    if (drawer) { drawer.classList.remove('drawer--open'); scrim.classList.remove('drawer-scrim--open'); document.body.style.overflow = ''; }
  }
  if (navToggle) navToggle.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (scrim) scrim.addEventListener('click', closeDrawer);
  if (drawer) {
    drawer.querySelectorAll('.drawer__link').forEach(function (l) { l.addEventListener('click', closeDrawer); });
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });

  // --- Accordion ---
  document.querySelectorAll('.accordion__trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var item = this.closest('.accordion__item');
      var wasOpen = item.classList.contains('accordion__item--open');
      // close siblings (optional: remove this block for multi-open)
      item.parentElement.querySelectorAll('.accordion__item--open').forEach(function (open) {
        open.classList.remove('accordion__item--open');
      });
      if (!wasOpen) item.classList.add('accordion__item--open');
    });
  });

  // --- Tabs ---
  document.querySelectorAll('.tabs').forEach(function (tabGroup) {
    var btns = tabGroup.querySelectorAll('.tab-btn');
    var panels = tabGroup.querySelectorAll('.tab-panel');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = this.getAttribute('data-tab');
        btns.forEach(function (b) { b.classList.remove('tab-btn--active'); });
        panels.forEach(function (p) { p.classList.remove('tab-panel--active'); });
        this.classList.add('tab-btn--active');
        var panel = tabGroup.querySelector('[data-tab-panel="' + target + '"]');
        if (panel) panel.classList.add('tab-panel--active');
      });
    });
  });

  // --- Table of Contents scroll spy ---
  var tocLinks = document.querySelectorAll('.toc__list a');
  if (tocLinks.length > 0) {
    var tocSections = [];
    tocLinks.forEach(function (link) {
      var el = document.querySelector(link.getAttribute('href'));
      if (el) tocSections.push({ el: el, link: link });
    });
    window.addEventListener('scroll', function () {
      requestAnimationFrame(function () {
        var y = window.scrollY + 100;
        var active = null;
        for (var i = tocSections.length - 1; i >= 0; i--) {
          if (tocSections[i].el.offsetTop <= y) { active = tocSections[i]; break; }
        }
        tocLinks.forEach(function (l) { l.classList.remove('toc--active'); });
        if (active) active.link.classList.add('toc--active');
      });
    }, { passive: true });
  }

  // --- Catalog Filter ---
  var filterChips = document.querySelectorAll('.filter-chip');
  var gemCards = document.querySelectorAll('.gem-card');
  if (filterChips.length > 0) {
    filterChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var filter = this.getAttribute('data-filter');
        filterChips.forEach(function (c) { c.classList.remove('filter-chip--active'); });
        this.classList.add('filter-chip--active');
        gemCards.forEach(function (card) {
          var cat = card.getAttribute('data-category');
          if (filter === 'all' || cat === filter) {
            card.classList.remove('gem-card--hidden');
          } else {
            card.classList.add('gem-card--hidden');
          }
        });
      });
    });
  }

  // --- Back to Top ---
  var btt = document.getElementById('backToTop');
  if (btt) {
    window.addEventListener('scroll', function () {
      requestAnimationFrame(function () {
        btt.classList.toggle('back-to-top--visible', window.scrollY > 400);
      });
    }, { passive: true });
    btt.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Smooth scroll anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var t = document.querySelector(this.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); history.pushState(null, '', this.getAttribute('href')); }
    });
  });

})();
