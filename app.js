/* ============================================================
   GemLens — App Logic
   Theme toggle, reveal animations, drawer, catalog filter
   ============================================================ */

(function () {
  'use strict';

  // --- Theme Toggle ---
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;
  const THEME_KEY = 'gemlens-theme';

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
  }

  // Restore saved preference or respect system
  (function initTheme() {
    let saved;
    try { saved = localStorage.getItem(THEME_KEY); } catch (_) {}
    if (saved === 'dark' || saved === 'light') {
      setTheme(saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  })();

  themeToggle.addEventListener('click', function () {
    const current = root.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });

  // Listen for system changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    let saved;
    try { saved = localStorage.getItem(THEME_KEY); } catch (_) {}
    if (!saved) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  // --- Top Bar Scroll Shadow ---
  var topBar = document.getElementById('topBar');
  var scrollTicking = false;

  function onScroll() {
    if (!scrollTicking) {
      requestAnimationFrame(function () {
        topBar.classList.toggle('top-bar--scrolled', window.scrollY > 8);
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- Active Nav Link ---
  var navLinks = document.querySelectorAll('.nav-link');
  var sections = [];

  navLinks.forEach(function (link) {
    var id = link.getAttribute('href').slice(1);
    var el = document.getElementById(id);
    if (el) sections.push({ id: id, el: el, link: link });
  });

  function updateActiveNav() {
    var scrollY = window.scrollY + 120;
    var active = null;
    for (var i = sections.length - 1; i >= 0; i--) {
      if (sections[i].el.offsetTop <= scrollY) {
        active = sections[i];
        break;
      }
    }
    navLinks.forEach(function (l) { l.classList.remove('nav-link--active'); });
    if (active) active.link.classList.add('nav-link--active');
  }

  window.addEventListener('scroll', function () {
    requestAnimationFrame(updateActiveNav);
  }, { passive: true });
  updateActiveNav();

  // --- Reveal on Scroll (Intersection Observer) ---
  var reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach(function (el) { observer.observe(el); });
  } else {
    // Fallback: show everything
    reveals.forEach(function (el) { el.classList.add('reveal--visible'); });
  }

  // --- Mobile Drawer ---
  var drawer = document.getElementById('drawer');
  var drawerScrim = document.getElementById('drawerScrim');
  var navToggleBtn = document.getElementById('navToggle');
  var drawerCloseBtn = document.getElementById('drawerClose');
  var drawerLinks = drawer.querySelectorAll('.drawer__link');

  function openDrawer() {
    drawer.classList.add('drawer--open');
    drawerScrim.classList.add('drawer-scrim--open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('drawer--open');
    drawerScrim.classList.remove('drawer-scrim--open');
    document.body.style.overflow = '';
  }

  navToggleBtn.addEventListener('click', openDrawer);
  drawerCloseBtn.addEventListener('click', closeDrawer);
  drawerScrim.addEventListener('click', closeDrawer);

  drawerLinks.forEach(function (link) {
    link.addEventListener('click', closeDrawer);
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrawer();
  });

  // --- Catalog Filter ---
  var filterChips = document.querySelectorAll('.filter-chip');
  var gemCards = document.querySelectorAll('.gem-card');

  filterChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var filter = this.getAttribute('data-filter');

      // Update active chip
      filterChips.forEach(function (c) { c.classList.remove('filter-chip--active'); });
      this.classList.add('filter-chip--active');

      // Filter cards
      gemCards.forEach(function (card) {
        var category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.classList.remove('gem-card--hidden');
          card.style.animation = 'none';
          card.offsetHeight; // trigger reflow
          card.style.animation = '';
        } else {
          card.classList.add('gem-card--hidden');
        }
      });
    });
  });

  // --- Smooth Scroll for anchor links (fallback) ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Update URL without scrolling
        history.pushState(null, '', this.getAttribute('href'));
      }
    });
  });

})();
