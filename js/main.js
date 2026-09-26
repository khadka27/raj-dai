/* ============================================================
   Raj Gupta — interactions (vanilla JS, ES Modules)
   ============================================================ */
import { projects } from './data.js';

(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Theme (light / dark) ---------- */
  const root = document.documentElement;
  const themeToggle = $('#themeToggle');
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (stored === 'dark' || (!stored && prefersDark)) root.dataset.theme = 'dark';

  themeToggle?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem('theme', next);
  });

  /* ---------- Header: scrolled state + progress bar ---------- */
  const header = $('.site-header');
  const progress = $('.progress-bar');

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 24);
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Navigation Drawer ---------- */
  const menuToggle = $('#menuToggle');
  const menuDrawer = $('#menuDrawer');
  const drawerBackdrop = $('#drawerBackdrop');
  const drawerClose = $('#drawerClose');
  const drawerLinks = $$('.drawer-link');

  const openDrawer = () => {
    menuDrawer?.classList.add('is-open');
    drawerBackdrop?.classList.add('is-open');
    menuToggle?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    menuDrawer?.classList.remove('is-open');
    drawerBackdrop?.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  menuToggle?.addEventListener('click', openDrawer);
  drawerClose?.addEventListener('click', closeDrawer);
  drawerBackdrop?.addEventListener('click', closeDrawer);
  drawerLinks.forEach(link => link.addEventListener('click', closeDrawer));

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuDrawer?.classList.contains('is-open')) {
      closeDrawer();
    }
  });

  /* ---------- Interactive Hero Ripple Waves Parallax ---------- */
  const heroSection = $('.hero-branding');
  const rippleGroup = $('.ripple-group');

  if (heroSection && rippleGroup) {
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let rafId = null;

    heroSection.addEventListener('mousemove', e => {
      const rect = heroSection.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = relX * 35;
      targetY = relY * 35;
      if (!rafId) requestTick();
    });

    heroSection.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
    });

    const updateParallax = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      rippleGroup.style.transform = `translate(${currentX}px, ${currentY}px)`;

      if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
        rafId = requestAnimationFrame(updateParallax);
      } else {
        rafId = null;
      }
    };

    const requestTick = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(updateParallax);
      }
    };
  }

  /* ---------- Advanced Text & Scroll Animations ---------- */
  function splitTextIntoWords(element, baseDelay = 0, stepDelay = 0.04) {
    if (!element || element.dataset.splitDone) return;
    element.dataset.splitDone = 'true';

    let wordIndex = 0;
    function processNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        const words = text.split(/(\s+)/);
        const fragment = document.createDocumentFragment();
        words.forEach(part => {
          if (/^\s+$/.test(part)) {
            fragment.appendChild(document.createTextNode(' '));
          } else if (part.length > 0) {
            const mask = document.createElement('span');
            mask.className = 'word-mask';
            const inner = document.createElement('span');
            inner.className = 'word-inner';
            inner.style.setProperty('--delay', `${(baseDelay + wordIndex * stepDelay).toFixed(3)}s`);
            inner.textContent = part;
            mask.appendChild(inner);
            fragment.appendChild(mask);
            wordIndex++;
          }
        });
        return fragment;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName.toLowerCase() === 'br') {
          return document.createElement('br');
        }
        const clone = node.cloneNode(false);
        node.childNodes.forEach(child => {
          const res = processNode(child);
          if (res) clone.appendChild(res);
        });
        return clone;
      }
      return node.cloneNode(true);
    }

    const newFrag = document.createDocumentFragment();
    element.childNodes.forEach(child => {
      const res = processNode(child);
      if (res) newFrag.appendChild(res);
    });
    element.innerHTML = '';
    element.appendChild(newFrag);
  }

  // Split key headlines and paragraphs for word-stagger reveal
  const splitTargets = [
    { selector: '.hero-brand-title', base: 0.1, step: 0.08 },
    { selector: '.hero-brand-subtitle', base: 0.3, step: 0.05 },
    { selector: '.about-main-title', base: 0.05, step: 0.06 },
    { selector: '.about-lead-text', base: 0.1, step: 0.022 },
    { selector: '.education-title', base: 0.05, step: 0.06 },
    { selector: '.edu-card-heading', base: 0.08, step: 0.035 },
    { selector: '.experience-title', base: 0.05, step: 0.06 },
    { selector: '.experience-subtitle', base: 0.15, step: 0.04 },
    { selector: '.exp-role', base: 0.06, step: 0.035 },
    { selector: '.section-head h2', base: 0.05, step: 0.045 }
  ];

  splitTargets.forEach(t => {
    $$(t.selector).forEach(el => splitTextIntoWords(el, t.base, t.step));
  });

  // Stagger grid cards
  $$('.education-items-grid .edu-card').forEach((el, i) => {
    el.style.setProperty('--card-delay', `${(i * 0.12).toFixed(2)}s`);
  });
  $$('.experience-grid .exp-card').forEach((el, i) => {
    el.style.setProperty('--card-delay', `${(i * 0.09).toFixed(2)}s`);
  });
  $$('.work-grid .work-card').forEach((el, i) => {
    el.style.setProperty('--card-delay', `${((i % 3) * 0.12).toFixed(2)}s`);
  });
  $$('.services .service').forEach((el, i) => {
    el.style.setProperty('--card-delay', `${(i * 0.12).toFixed(2)}s`);
  });

  // Reveal observer for elements & cards
  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        revealIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal, .edu-card, .exp-card, .work-card, .service, .about-content-wrap, .education-wrap, .experience-wrap, .skill-card').forEach(el => {
    revealIO.observe(el);
  });

  // Hero section immediate entrance trigger
  setTimeout(() => {
    const hero = $('.hero-branding');
    if (hero) hero.classList.add('is-ready');
  }, 80);

  // Subtle kinetic parallax shift for titles on scroll
  const kineticHeadings = $$('.hero-brand-title, .about-main-title, .education-title, .experience-title');
  let scrollTicking = false;

  const onScrollKinetic = () => {
    const winH = window.innerHeight;
    kineticHeadings.forEach(heading => {
      const rect = heading.getBoundingClientRect();
      if (rect.top < winH && rect.bottom > 0) {
        const centerOffset = (rect.top + rect.height / 2) - winH / 2;
        const shiftY = (centerOffset * -0.04).toFixed(2);
        heading.style.transform = `translateY(${shiftY}px)`;
      }
    });
    scrollTicking = false;
  };

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(onScrollKinetic);
      scrollTicking = true;
    }
  }, { passive: true });

  /* ---------- Animated counters ---------- */
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const runCounter = el => {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix !== undefined ? el.dataset.suffix : '+';
    const dur = 1400;
    const start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(easeOut(p) * target) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        runCounter(e.target);
        countIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(el => countIO.observe(el));

  /* ---------- Work filters ---------- */
  const filters = $$('.filter');
  const cards = $$('.work-card');

  filters.forEach(btn => btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    const cat = btn.dataset.filter.toLowerCase();

    cards.forEach(card => {
      const cardCats = (card.dataset.cat || '').toLowerCase().split(/\s+/);
      const show = cat === 'all' || cardCats.includes(cat);
      card.classList.toggle('hidden', !show);
      if (show) { // small re-entrance animation
        card.style.animation = 'none';
        void card.offsetWidth;
        card.style.animation = 'fadeUp .5s var(--ease) both';
      }
    });
  }));

  // Inject keyframes used above (keeps CSS file cleaner for one-off use)
  const style = document.createElement('style');
  style.textContent = '@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}';
  document.head.appendChild(style);

  /* ---------- Project Detail Modal ---------- */
  const modalBackdrop = $('#projectModal');
  const modalClose = $('#modalClose');
  const modalTitle = $('#modalTitle');
  const modalClient = $('#modalClient');
  const modalDate = $('#modalDate');
  const modalTags = $('#modalTags');
  const modalHeroImg = $('#modalHeroImg');
  const modalChallenge = $('#modalChallenge');
  const modalSolution = $('#modalSolution');
  const modalResults = $('#modalResults');
  const modalTools = $('#modalTools');
  const modalGallery = $('#modalGallery');

  function openProjectModal(projectId) {
    const projectList = (typeof projects !== 'undefined' && projects.length) ? projects : (window.PORTFOLIO_DATA?.projects || []);
    const data = projectList.find(p => p.id === projectId);
    if (!data || !modalBackdrop) return;

    if (modalTitle) modalTitle.textContent = data.title;
    if (modalClient) modalClient.textContent = data.client;
    if (modalDate) modalDate.textContent = data.date;
    if (modalHeroImg) {
      modalHeroImg.src = data.heroImage || data.thumbnail;
      modalHeroImg.alt = data.title;
    }
    if (modalChallenge) modalChallenge.textContent = data.challenge;
    if (modalSolution) modalSolution.textContent = data.solution;

    if (modalTags) {
      modalTags.innerHTML = (data.category || []).map(cat =>
        `<span class="skill-chip">${cat}</span>`
      ).join('');
    }

    if (modalResults) {
      modalResults.innerHTML = (data.results || []).map(res =>
        `<li>${res}</li>`
      ).join('');
    }

    if (modalTools) {
      modalTools.innerHTML = (data.tools || []).map(t =>
        `<span class="skill-chip">${t}</span>`
      ).join('');
    }

    if (modalGallery) {
      modalGallery.innerHTML = (data.images || []).map(img =>
        `<img src="${img}" alt="${data.title}" loading="lazy">`
      ).join('');
    }

    modalBackdrop.classList.add('is-open');
    modalBackdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeProjectModal() {
    modalBackdrop?.classList.remove('is-open');
    modalBackdrop?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.projectId;
      if (id) openProjectModal(id);
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const id = card.dataset.projectId;
        if (id) openProjectModal(id);
      }
    });
  });

  modalClose?.addEventListener('click', closeProjectModal);
  modalBackdrop?.addEventListener('click', e => {
    if (e.target === modalBackdrop) closeProjectModal();
  });

  /* ---------- FAQ: close others when one opens ---------- */
  const faqs = $$('.faq details');
  faqs.forEach(d => d.addEventListener('toggle', () => {
    if (d.open) faqs.forEach(o => { if (o !== d) o.open = false; });
  }));

  /* ---------- Testimonial slider ---------- */
  const slides = $$('#slides .slide');
  const dotsWrap = $('#dots');
  let current = 0;
  let timer;

  if (slides.length && dotsWrap) {
    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      b.addEventListener('click', () => goTo(i, true));
      dotsWrap.appendChild(b);
    });

    const dots = $$('button', dotsWrap);

    function goTo(i, manual = false) {
      current = (i + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('is-active', k === current));
      dots.forEach((d, k) => d.classList.toggle('is-active', k === current));
      if (manual) restart();
    }

    const restart = () => {
      clearInterval(timer);
      timer = setInterval(() => goTo(current + 1), 6000);
    };

    $('#prevSlide')?.addEventListener('click', () => goTo(current - 1, true));
    $('#nextSlide')?.addEventListener('click', () => goTo(current + 1, true));

    // Touch swipe
    let startX = 0;
    const slider = $('#slider');
    slider?.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    slider?.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 48) goTo(current + (dx < 0 ? 1 : -1), true);
    }, { passive: true });

    goTo(0);
    restart();
  }

  /* ---------- Contact form (front-end validation only) ---------- */
  const form = $('#contactForm');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#name').value.trim();
    const email = $('#email').value.trim();
    const message = $('#message').value.trim();
    const note = $('.form-note');

    if (!name || !email.includes('@') || !message) {
      note.textContent = 'Please fill in all fields with a valid email.';
      note.classList.remove('ok');
      return;
    }

    // Demo message handling
    note.textContent = `Thanks ${name.split(' ')[0]}! Your message has been received — Raj will reply soon.`;
    note.classList.add('ok');
    form.reset();
  });

  /* ---------- Footer clock (London Time) ---------- */
  const clock = $('#clock');
  if (clock) {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London'
    });
    const tick = () => { clock.textContent = fmt.format(new Date()); };
    tick();
    setInterval(tick, 30_000);
  }

  /* ---------- Animated Download CV Button ---------- */
  const cvBtn = $('#downloadCvBtn');
  if (cvBtn) {
    let isDownloading = false;
    cvBtn.addEventListener('click', () => {
      if (isDownloading) return;
      isDownloading = true;
      cvBtn.classList.add('is-running');
      const label = cvBtn.querySelector('.btn-cv-label');
      if (label) label.textContent = 'Downloading...';

      setTimeout(() => {
        cvBtn.classList.remove('is-running');
        cvBtn.classList.add('is-success');
        if (label) label.textContent = 'Downloaded! ✓';

        setTimeout(() => {
          cvBtn.classList.remove('is-success');
          if (label) label.textContent = 'Download CV';
          isDownloading = false;
        }, 2200);
      }, 1200);
    });
  }

  /* ---------- Escape closes navigation & modals ---------- */
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (menuDrawer?.classList.contains('is-open')) closeDrawer();
      if (modalBackdrop?.classList.contains('is-open')) closeProjectModal();
    }
  });
})();
