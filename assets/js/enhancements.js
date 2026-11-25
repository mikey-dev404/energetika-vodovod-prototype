/* © 2026 mikey-dev404. All rights reserved. Proprietary code; see LICENSE. */
/* =========================================================
   Energetika Vodovod — living details
   Counters, gallery filters/lightbox, scroll progress, parallax.
   Progressive enhancement: content stays usable without JS.
   ========================================================= */
(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const formatNumber = (value) => String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  /* ---------- Animated counters ---------- */
  const counters = $$('[data-count]');
  if (counters.length) {
    const animateCounter = (el) => {
      if (el.dataset.counted) return;
      el.dataset.counted = 'true';
      const target = parseInt(el.dataset.count, 10);
      if (!Number.isFinite(target)) return;
      if (reduceMotion || !('IntersectionObserver' in window)) {
        el.textContent = formatNumber(target);
        return;
      }
      const start = performance.now();
      const duration = 1200;
      const frame = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = formatNumber(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(frame);
        else el.textContent = formatNumber(target);
      };
      requestAnimationFrame(frame);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.55 });

    counters.forEach((counter) => {
      if (!reduceMotion) counter.textContent = '0';
      observer.observe(counter);
    });
  }

  /* ---------- Scroll progress + back to top ---------- */
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  progress.innerHTML = '<span></span>';
  document.body.prepend(progress);
  const progressBar = $('span', progress);

  const toTop = document.createElement('button');
  toTop.className = 'to-top';
  toTop.type = 'button';
  toTop.hidden = true;
  toTop.setAttribute('aria-label', 'Nazaj na vrh strani');
  toTop.innerHTML = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 15 6-6 6 6"/></svg>';
  document.body.append(toTop);

  let scrollFrame = null;
  const updateScrollUi = () => {
    const root = document.documentElement;
    const max = root.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    progressBar.style.transform = 'scaleX(' + ratio + ')';
    toTop.hidden = window.scrollY < 620;
    scrollFrame = null;
  };
  window.addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(updateScrollUi);
  }, { passive: true });
  window.addEventListener('resize', updateScrollUi);
  updateScrollUi();
  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ---------- Hero image parallax ---------- */
  const frame = $('.hero__frame');
  const heroImage = frame ? $('img', frame) : null;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  if (frame && heroImage && finePointer && !reduceMotion) {
    const hero = frame.closest('.hero') || frame;
    hero.addEventListener('pointermove', (event) => {
      const rect = frame.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      heroImage.style.setProperty('--hero-x', (x * 9).toFixed(2) + 'px');
      heroImage.style.setProperty('--hero-y', (y * 7).toFixed(2) + 'px');
    });
    hero.addEventListener('pointerleave', () => {
      heroImage.style.setProperty('--hero-x', '0px');
      heroImage.style.setProperty('--hero-y', '0px');
    });
  }

  /* ---------- Reference filters ---------- */
  const filters = $$('.ref-filter');
  const grid = $('#ref-grid');
  if (filters.length && grid) {
    const cards = $$('.ref-card', grid);
    const count = $('[data-ref-count]');
    const noun = (n) => {
      if (n === 1) return 'projekt';
      if (n === 2) return 'projekta';
      if (n === 3 || n === 4) return 'projekti';
      return 'projektov';
    };

    const applyFilter = (value) => {
      let visible = 0;
      cards.forEach((card) => {
        const show = value === 'all' || card.dataset.category === value;
        card.hidden = !show;
        if (show) visible += 1;
      });
      filters.forEach((button) => {
        const active = button.dataset.filter === value;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      if (count) count.textContent = visible + ' ' + noun(visible);
    };

    filters.forEach((button) => {
      button.addEventListener('click', () => applyFilter(button.dataset.filter));
    });
    applyFilter('all');
  }

  /* ---------- Reference lightbox ---------- */
  const triggers = $$('[data-lightbox]');
  if (triggers.length) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.id = 'lightbox';
    lightbox.hidden = true;
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-labelledby', 'lightbox-title');
    lightbox.innerHTML = `
      <div class="lightbox__backdrop" data-lb-close></div>
      <div class="lightbox__panel">
        <button class="lightbox__close" type="button" aria-label="Zapri fotografijo" data-lb-close>
          <svg class="icon" aria-hidden="true"><use href="#i-close"/></svg>
        </button>
        <img class="lightbox__img" alt="">
        <div class="lightbox__foot">
          <p class="lightbox__title" id="lightbox-title"></p>
          <p class="lightbox__count" aria-live="polite"></p>
        </div>
        <button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Prejšnja fotografija" data-lb-prev>
          <svg class="icon" aria-hidden="true"><use href="#i-arrow-left"/></svg>
        </button>
        <button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Naslednja fotografija" data-lb-next>
          <svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg>
        </button>
      </div>`;
    document.body.append(lightbox);

    const image = $('.lightbox__img', lightbox);
    const title = $('.lightbox__title', lightbox);
    const counter = $('.lightbox__count', lightbox);
    const closeButton = $('.lightbox__close', lightbox);
    const prevButton = $('[data-lb-prev]', lightbox);
    const nextButton = $('[data-lb-next]', lightbox);
    let current = [];
    let index = 0;
    let lastTrigger = null;

    const visibleTriggers = () => triggers.filter((trigger) => {
      const card = trigger.closest('.ref-card');
      return !card || (!card.hidden && trigger.offsetParent !== null);
    });

    const render = () => {
      const trigger = current[index];
      if (!trigger) return;
      image.src = trigger.dataset.src;
      image.alt = trigger.dataset.alt || '';
      title.textContent = trigger.dataset.title || '';
      counter.textContent = (index + 1) + ' / ' + current.length;
      const multi = current.length > 1;
      prevButton.disabled = !multi;
      nextButton.disabled = !multi;
    };

    const open = (trigger) => {
      current = visibleTriggers();
      index = Math.max(0, current.indexOf(trigger));
      if (!current.length) return;
      lastTrigger = trigger;
      render();
      lightbox.hidden = false;
      document.body.classList.add('has-lightbox');
      closeButton.focus();
    };

    const close = () => {
      lightbox.hidden = true;
      document.body.classList.remove('has-lightbox');
      if (lastTrigger) lastTrigger.focus();
    };

    const step = (delta) => {
      if (current.length < 2) return;
      index = (index + delta + current.length) % current.length;
      render();
    };

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', (event) => { event.preventDefault(); open(trigger); });
    });
    closeButton.addEventListener('click', close);
    $('.lightbox__backdrop', lightbox).addEventListener('click', close);
    prevButton.addEventListener('click', () => step(-1));
    nextButton.addEventListener('click', () => step(1));

    document.addEventListener('keydown', (event) => {
      if (lightbox.hidden) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        step(-1);
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        step(1);
        return;
      }
      if (event.key !== 'Tab') return;
      const focusables = [closeButton, prevButton, nextButton].filter((button) => !button.disabled);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }
})();
