/* Alexey Dubov — personal site. Vanilla JS, no dependencies.
   Theme toggle, mobile nav, scroll progress, scroll reveals,
   portfolio/articles filters, active nav state, back-to-top. */
(function () {
  'use strict';

  var docEl = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- theme toggle ---------- */
  var themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = docEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      docEl.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  /* ---------- mobile nav ---------- */
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- scroll progress + nav shadow + back-to-top ---------- */
  var progress = document.querySelector('.scroll-progress');
  var nav = document.querySelector('nav');
  var backToTop = document.querySelector('.back-to-top');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || docEl.scrollTop;
    var max = docEl.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    if (nav) nav.classList.toggle('scrolled', y > 10);
    if (backToTop) backToTop.classList.toggle('visible', y > 700);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- scroll reveals ---------- */
  var revealTargets = document.querySelectorAll(
    '.narrative-block, .principle-card, .venture-card, .portfolio-card, ' +
    '.standard-card, .writing-item, .media-item, .video-card, .focus-card, ' +
    '.proof-subsection h3, .section-label + .section-title'
  );
  if ('IntersectionObserver' in window && !reduceMotion) {
    docEl.classList.add('js');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

    // stagger cards within their grid
    var groups = {};
    revealTargets.forEach(function (el) {
      var parent = el.parentElement;
      var key = parent && parent.className ? parent.className : 'other';
      groups[key] = (groups[key] || 0);
      var i = groups[key]++;
      if (i > 0 && i < 8) el.style.setProperty('--reveal-delay', (i * 0.06) + 's');
      el.setAttribute('data-reveal', '');
      io.observe(el);
    });
  }

  /* ---------- filters (portfolio by status, articles by source) ---------- */
  function setupFilter(barSelector, itemSelector, attr) {
    var bar = document.querySelector(barSelector);
    if (!bar) return;
    var items = document.querySelectorAll(itemSelector);
    bar.addEventListener('click', function (e) {
      var chip = e.target.closest('.filter-chip');
      if (!chip) return;
      bar.querySelectorAll('.filter-chip').forEach(function (c) {
        c.classList.toggle('active', c === chip);
      });
      var value = chip.getAttribute('data-value');
      items.forEach(function (item) {
        var match = value === 'all' || item.getAttribute(attr) === value;
        item.classList.toggle('is-hidden', !match);
      });
    });
  }
  setupFilter('[data-filter-bar="status"]', '.portfolio-card, .portfolio-subhead', 'data-status');
  setupFilter('[data-filter-bar="source"]', '.writing-item', 'data-source');
  setupFilter('[data-filter-bar="type"]', '.video-card', 'data-type');

  /* ---------- active nav link ---------- */
  var sections = document.querySelectorAll('main section[id]');
  var navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
  if ('IntersectionObserver' in window && sections.length && navAnchors.length) {
    var activeMap = {};
    var navIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        activeMap[entry.target.id] = entry.isIntersecting;
      });
      var current = null;
      sections.forEach(function (s) {
        if (activeMap[s.id] && !current) current = s.id;
      });
      navAnchors.forEach(function (a) {
        a.classList.toggle('active', !!current && a.getAttribute('href') === '#' + current);
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { navIo.observe(s); });
  }
})();
