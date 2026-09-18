/* ECOSG Company Ltd — site scripts (vanilla JS, no dependencies) */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Header: solid-on-scroll + inner-page state ---------- */
  var header = document.getElementById('siteHeader');
  if (header) {
    function onScroll() {
      if (window.scrollY > 60) header.classList.add('is-solid');
      else header.classList.remove('is-solid');
      var btt = document.getElementById('backToTop');
      if (btt) {
        if (window.scrollY > 500) btt.classList.add('is-visible');
        else btt.classList.remove('is-visible');
      }
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');
  var navScrim = document.getElementById('navScrim');

  function closeNav() {
    if (!navToggle || !mainNav) return;
    navToggle.setAttribute('aria-expanded', 'false');
    mainNav.classList.remove('is-open');
    if (navScrim) navScrim.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  function openNav() {
    navToggle.setAttribute('aria-expanded', 'true');
    mainNav.classList.add('is-open');
    if (navScrim) navScrim.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var expanded = navToggle.getAttribute('aria-expanded') === 'true';
      if (expanded) closeNav(); else openNav();
    });
    if (navScrim) navScrim.addEventListener('click', closeNav);
    mainNav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1024) closeNav(); });
  }

  /* ---------- Active nav link ---------- */
  var here = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.main-nav a[href]').forEach(function (a) {
    var target = a.getAttribute('href').split('#')[0];
    if (target === here || (here === '' && target === 'index.html')) a.classList.add('is-active');
  });

  /* ---------- Back to top ---------- */
  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Hero slideshow ---------- */
  var heroSlides = document.querySelectorAll('.hero-slide');
  var heroDotsWrap = document.getElementById('heroDots');
  if (heroSlides.length > 1) {
    var current = 0;
    var dots = [];
    if (heroDotsWrap) {
      heroSlides.forEach(function (_, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Show slide ' + (i + 1));
        if (i === 0) b.classList.add('is-active');
        b.addEventListener('click', function () { show(i); restart(); });
        heroDotsWrap.appendChild(b);
        dots.push(b);
      });
    }
    function show(i) {
      heroSlides[current].classList.remove('is-active');
      if (dots[current]) dots[current].classList.remove('is-active');
      current = i;
      heroSlides[current].classList.add('is-active');
      if (dots[current]) dots[current].classList.add('is-active');
    }
    var timer;
    function restart() {
      clearInterval(timer);
      if (!reduceMotion) {
        timer = setInterval(function () { show((current + 1) % heroSlides.length); }, 5500);
      }
    }
    restart();
  }

  /* ---------- Auto-swiping card image carousels (project cards, spotlight) ---------- */
  document.querySelectorAll('.card-carousel').forEach(function (carousel, carouselIndex) {
    var imgs = Array.prototype.slice.call(carousel.querySelectorAll('img'));
    if (imgs.length < 2) return;
    var dotsWrap = carousel.querySelector('.card-carousel-dots');
    var dots = [];
    if (dotsWrap) {
      imgs.forEach(function (_, i) {
        var d = document.createElement('span');
        if (i === 0) d.classList.add('is-active');
        dotsWrap.appendChild(d);
        dots.push(d);
      });
    }
    if (reduceMotion) return;
    var current = 0;
    function advance() {
      imgs[current].classList.remove('is-active');
      if (dots[current]) dots[current].classList.remove('is-active');
      current = (current + 1) % imgs.length;
      imgs[current].classList.add('is-active');
      if (dots[current]) dots[current].classList.add('is-active');
    }
    setTimeout(function () {
      setInterval(advance, 3000);
    }, carouselIndex * 450);
  });

  /* ---------- Circular 3D project gallery (auto-rotate + drag) ---------- */
  var circGallery = document.getElementById('circularGallery');
  var circTrack = document.getElementById('circularGalleryTrack');
  if (circGallery && circTrack) {
    var circItems = Array.prototype.slice.call(circTrack.querySelectorAll('.circular-gallery-item'));
    var circAngles = circItems.map(function (_, i) { return i * (360 / circItems.length); });
    var circRotation = 0;
    var circAutoSpeed = 0.045;
    var circDragging = false;
    var circPaused = false;
    var circStartX = 0;
    var circStartRotation = 0;

    function circApplyOpacity() {
      circItems.forEach(function (item, i) {
        var relative = ((circAngles[i] + circRotation) % 360 + 360) % 360;
        var normalized = relative > 180 ? 360 - relative : relative;
        item.style.opacity = Math.max(0.25, 1 - (normalized / 180) * 0.85);
      });
    }
    function circRender() {
      circTrack.style.transform = 'rotateY(' + circRotation + 'deg)';
      circApplyOpacity();
    }
    circRender();

    (function circFrame() {
      if (!circDragging && !circPaused && !reduceMotion) circRotation += circAutoSpeed;
      circRender();
      requestAnimationFrame(circFrame);
    })();

    circGallery.addEventListener('mouseenter', function () { circPaused = true; });
    circGallery.addEventListener('mouseleave', function () { circPaused = false; });

    circGallery.addEventListener('pointerdown', function (e) {
      circDragging = true;
      circStartX = e.clientX;
      circStartRotation = circRotation;
      circGallery.classList.add('is-dragging');
      circGallery.setPointerCapture(e.pointerId);
    });
    circGallery.addEventListener('pointermove', function (e) {
      if (!circDragging) return;
      circRotation = circStartRotation + (e.clientX - circStartX) * 0.35;
    });
    function circPointerUp() {
      circDragging = false;
      circGallery.classList.remove('is-dragging');
    }
    circGallery.addEventListener('pointerup', circPointerUp);
    circGallery.addEventListener('pointercancel', circPointerUp);
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------- Animated stat counters ---------- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    var countIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        countIo.unobserve(el);
        var target = parseFloat(el.getAttribute('data-count'));
        if (reduceMotion || isNaN(target)) { el.textContent = target; return; }
        var duration = 1400;
        var start = null;
        function step(ts) {
          if (!start) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var val = Math.round(target * eased);
          el.textContent = val;
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target;
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { countIo.observe(el); });
  }

  /* ---------- Project filter grid ---------- */
  var filterBar = document.getElementById('filterBar');
  if (filterBar) {
    var filterBtns = filterBar.querySelectorAll('.filter-btn');
    var cards = document.querySelectorAll('[data-category]');
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('is-active'); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
        var filter = btn.getAttribute('data-filter');
        cards.forEach(function (card) {
          var match = filter === 'all' || card.getAttribute('data-category') === filter || card.getAttribute('data-status') === filter;
          card.classList.toggle('is-hidden', !match);
        });
      });
    });
  }

  /* ---------- Gallery lightbox (supports independent groups via data-group) ---------- */
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
  var lightbox = document.getElementById('lightbox');
  if (galleryItems.length && lightbox) {
    var lbImg = document.getElementById('lightboxImg');
    var lbCap = document.getElementById('lightboxCap');
    var lbCounter = document.getElementById('lightboxCounter');
    var idx = 0;
    var activeSet = galleryItems;
    var lastFocused = null;

    function groupOf(item) { return item.getAttribute('data-group') || 'default'; }

    function openLb(item) {
      var group = groupOf(item);
      activeSet = galleryItems.filter(function (g) { return groupOf(g) === group; });
      idx = activeSet.indexOf(item);
      update();
      lightbox.classList.add('is-open');
      lastFocused = document.activeElement;
      document.body.style.overflow = 'hidden';
      lightbox.querySelector('.lightbox-close').focus();
    }
    function update() {
      var item = activeSet[idx];
      var full = item.getAttribute('data-full') || item.querySelector('img').src;
      var cap = item.getAttribute('data-caption') || '';
      lbImg.src = full;
      lbImg.alt = item.querySelector('img').alt || '';
      lbCap.textContent = cap;
      lbCounter.textContent = (idx + 1) + ' / ' + activeSet.length;
    }
    function closeLb() {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
      lbImg.src = '';
      if (lastFocused) lastFocused.focus();
    }
    function nextLb() { idx = (idx + 1) % activeSet.length; update(); }
    function prevLb() { idx = (idx - 1 + activeSet.length) % activeSet.length; update(); }

    galleryItems.forEach(function (item) {
      item.addEventListener('click', function () { openLb(item); });
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(item); }
      });
    });
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLb);
    lightbox.querySelector('.lightbox-next').addEventListener('click', nextLb);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', prevLb);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLb(); });
    window.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowRight') nextLb();
      if (e.key === 'ArrowLeft') prevLb();
    });
  }

  /* ---------- Contact form (mailto submission, no backend) ---------- */
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = document.getElementById('formStatus');
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }
      var data = new FormData(contactForm);
      var name = (data.get('name') || '').toString().trim();
      var email = (data.get('email') || '').toString().trim();
      var phone = (data.get('phone') || '').toString().trim();
      var service = (data.get('service') || '').toString().trim();
      var message = (data.get('message') || '').toString().trim();

      var subject = 'Website enquiry from ' + name + (service ? ' — ' + service : '');
      var bodyLines = [
        'Name: ' + name,
        'Email: ' + email,
        'Phone: ' + (phone || 'Not provided'),
        'Service of interest: ' + (service || 'Not specified'),
        '',
        message
      ];
      var mailto = 'mailto:ecosgcompanyltd@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(bodyLines.join('\n'));

      if (status) {
        status.textContent = 'Opening your email app with this message pre-filled — hit send there to reach us. Prefer WhatsApp? Use the button below for a faster reply.';
        status.classList.add('is-visible', 'ok');
      }
      window.location.href = mailto;
    });
  }
})();
