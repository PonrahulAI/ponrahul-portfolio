/* =====================================================
   Supriya M P — Portfolio  |  interactions
   ===================================================== */
(function () {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Preloader ---------- */
  window.addEventListener('load', () => {
    const pre = $('#preloader');
    if (pre) setTimeout(() => pre.classList.add('done'), 350);
  });

  /* ---------- Theme (remembers your choice) ---------- */
  const root = document.documentElement;
  const saved = localStorage.getItem('smp-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.setAttribute('data-theme', saved || (prefersDark ? 'dark' : 'light'));

  $('#themeToggle').addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('smp-theme', next);
  });

  /* ---------- Mobile menu ---------- */
  const burger = $('#hamburger');
  const menu   = $('#navMenu');

  const closeMenu = () => {
    burger.classList.remove('open');
    menu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  };

  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  });

  $$('.nav__link').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Navbar state, scroll progress, back-to-top, active link ---------- */
  const nav      = $('#nav');
  const progress = $('#scrollProgress');
  const toTop    = $('#toTop');
  const sections = $$('main section[id]');
  const navLinks = $$('.nav__link');

  function onScroll() {
    const y = window.scrollY;

    nav.classList.toggle('scrolled', y > 20);
    toTop.classList.toggle('show', y > 500);

    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';

    // highlight the section currently in view
    let current = sections.length ? sections[0].id : '';
    sections.forEach(sec => {
      if (y >= sec.offsetTop - 140) current = sec.id;
    });
    navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Reveal on scroll ---------- */
  const revealables = $$('.reveal');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        setTimeout(() => entry.target.classList.add('in'), i * 90);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealables.forEach(el => io.observe(el));
  } else {
    revealables.forEach(el => el.classList.add('in'));
  }

  /* ---------- Typing effect in the hero ---------- */
  const typedEl = $('#typed');
  const phrases = [
    'Computer Science Student',
    'Java & C Programmer',
    'Robotics Enthusiast',
    'UI/UX Design Record Holder',
    'Creative Problem Solver'
  ];
  let pi = 0, ci = 0, deleting = false;

  function type() {
    const word = phrases[pi];
    typedEl.textContent = word.slice(0, ci);

    if (!deleting && ci < word.length)      { ci++; setTimeout(type, 75); }
    else if (!deleting && ci === word.length) { deleting = true; setTimeout(type, 1600); }
    else if (deleting && ci > 0)            { ci--; setTimeout(type, 35); }
    else { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(type, 350); }
  }
  type();

  /* ---------- Animated counters ---------- */
  const counters = $$('[data-count]');
  const runCounter = el => {
    const target   = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const duration = 1400;
    const start    = performance.now();

    (function step(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(step);
    })(start);
  };

  /* ---------- Skill bars ---------- */
  const bars = $$('.bar');
  const runBar = bar => {
    const fill = $('i', bar);
    if (fill) fill.style.width = bar.dataset.level + '%';
  };

  if ('IntersectionObserver' in window) {
    const io2 = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (entry.target.matches('[data-count]')) runCounter(entry.target);
        else runBar(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.4 });

    counters.forEach(el => io2.observe(el));
    bars.forEach(el => io2.observe(el));
  } else {
    counters.forEach(runCounter);
    bars.forEach(runBar);
  }

  /* ---------- Profile image fallback ----------
     If images/profile.jpg does not exist yet, keep the placeholder visible.
     As soon as the file is added, the photo shows automatically.          */
  const img = $('#profileImg');
  const ph  = $('#photoPlaceholder');

  img.addEventListener('load', () => { ph.style.display = 'none'; });
  img.addEventListener('error', () => { img.classList.add('hidden'); });
  if (img.complete && img.naturalWidth === 0) img.classList.add('hidden');

  /* ---------- Contact form (front-end validation) ---------- */
  const form = $('#contactForm');
  const note = $('#formNote');

  const setError = (field, msg) => {
    field.classList.toggle('invalid', Boolean(msg));
    $('.error', field).textContent = msg || '';
  };

  form.addEventListener('submit', e => {
    e.preventDefault();
    note.textContent = '';
    note.className = 'form-note';

    const name    = $('#name');
    const email   = $('#email');
    const message = $('#message');
    let ok = true;

    if (!name.value.trim())        { setError(name.parentElement, 'Please enter your name.'); ok = false; }
    else                             setError(name.parentElement, '');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
      setError(email.parentElement, 'Please enter a valid email address.'); ok = false;
    } else setError(email.parentElement, '');

    if (message.value.trim().length < 10) {
      setError(message.parentElement, 'Message should be at least 10 characters.'); ok = false;
    } else setError(message.parentElement, '');

    if (!ok) return;

    // The email address is not set yet — see the EDIT: EMAIL notes in index.html.
    // Once it is filled in, this opens the visitor's mail app addressed to you.
    const target = ($('.contact__info a[data-contact="email"]') || {}).textContent || '';
    const isReal = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(target.trim());

    if (isReal) {
      const subject = encodeURIComponent('Portfolio enquiry from ' + name.value.trim());
      const body    = encodeURIComponent(message.value.trim() + '\n\n— ' + name.value.trim() + ' (' + email.value.trim() + ')');
      window.location.href = 'mailto:' + target.trim() + '?subject=' + subject + '&body=' + body;
      note.textContent = 'Opening your mail app…';
      note.className = 'form-note ok';
      form.reset();
    } else {
      note.textContent = 'Thanks! The contact email is being set up — please check back soon.';
      note.className = 'form-note warn';
    }
  });

  $$('.field input, .field textarea').forEach(el => {
    el.addEventListener('input', () => setError(el.parentElement, ''));
  });

  /* ---------- Footer year ---------- */
  $('#year').textContent = new Date().getFullYear();
})();
