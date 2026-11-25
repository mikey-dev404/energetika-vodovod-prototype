/* © 2026 mikey-dev404. All rights reserved. Proprietary code; see LICENSE. */
/* =========================================================
   Energetika Vodovod — site interactions
   Navigation, reveals, contact inquiry and shared UI.
   No external dependencies.
   ========================================================= */
(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = $('.site-header');
  const headerHeight = () => (header ? header.offsetHeight : 80);

  /* ---------- Leto v nogi ---------- */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ---------- Header: senca ob drsenju ---------- */
  let lastScroll = -1;
  function onScrollHeader() {
    const y = window.scrollY;
    if (y === lastScroll) return;
    lastScroll = y;
    header.classList.toggle('is-scrolled', y > 8);
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Mobilna navigacija ---------- */
  const nav = $('#primary-nav');
  const navToggle = $('.nav-toggle');
  const navLinks = $$('.nav__link');

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Odpri meni');
    document.body.classList.remove('nav-open');
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Zapri meni' : 'Odpri meni');
      document.body.classList.toggle('nav-open', isOpen);
    });

    navLinks.forEach((link) => link.addEventListener('click', closeNav));

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        closeNav();
        navToggle.focus();
      }
    });

    document.addEventListener('click', (event) => {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(event.target) || navToggle.contains(event.target)) return;
      closeNav();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1200 && nav.classList.contains('is-open')) closeNav();
    });
  }

  /* ---------- Razkrivanje ob drsenju ---------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry, index) => {
        if (!entry.isIntersecting) return;
        entry.target.style.transitionDelay = Math.min(index * 60, 240) + 'ms';
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Povpraševanje: stanje ---------- */
  const wizard = $('#wizard');
  const form = $('#inquiry-form');
  if (!wizard || !form) return;

  const wizardTop = $('.wizard__top', wizard);
  const success = $('#inquiry-success');
  const steps = $$('.wizard__step', form);
  const indicators = $$('[data-step-indicator]');
  const progressBar = $('.progress__bar', wizard);
  const progressEl = $('.progress', wizard);
  const currentStepEl = $('[data-current-step]', wizard);
  let currentStep = 1;
  let submitting = false;
  let stepFocusTimer;

  const stepTitles = {};
  steps.forEach((step) => {
    const title = $('.step__title', step);
    if (title) stepTitles[step.dataset.step] = title;
  });

  /* ---------- Povzetek v živo ---------- */
  const summaryFields = {
    service: $('[data-summary="service"]'),
    property: $('[data-summary="property"]'),
    location: $('[data-summary="location"]'),
    urgency: $('[data-summary="urgency"]')
  };

  function updateSummary() {
    const values = {
      service: form.querySelector('input[name="service"]:checked')?.value || '',
      property: form.querySelector('input[name="property"]:checked')?.value || '',
      location: $('#location')?.value.trim() || '',
      urgency: form.querySelector('input[name="urgency"]:checked')?.value || ''
    };

    Object.entries(summaryFields).forEach(([key, el]) => {
      if (!el) return;
      const value = values[key];
      el.textContent = value || 'Še ni izbrano';
      el.classList.toggle('is-filled', Boolean(value));
    });
  }

  const errorMap = {
    service: '#err-service',
    property: '#err-property',
    urgency: '#err-urgency',
    location: '#err-location',
    name: '#err-name',
    phone: '#err-phone',
    email: '#err-email',
    consent: '#err-consent'
  };

  function clearFieldError(field) {
    const key = field.name || field.id;
    const errorEl = errorMap[key] ? $(errorMap[key], form) : null;
    if (!errorEl || errorEl.hidden) return;
    if (field.type === 'radio' && !field.checked) return;
    if (field.type === 'checkbox' && !field.checked) return;
    if (field.type === 'text' || field.type === 'tel' || field.type === 'email') {
      if (!field.value.trim()) return;
    }
    errorEl.hidden = true;
    errorEl.textContent = '';
    field.removeAttribute('aria-invalid');
  }

  form.addEventListener('change', (event) => {
    updateSummary();
    clearFieldError(event.target);
  });

  form.addEventListener('input', (event) => {
    if (event.target.id === 'location') updateSummary();
    if (['text', 'tel', 'email'].includes(event.target.type)) clearFieldError(event.target);
  });

  /* ---------- Napake ---------- */
  function setError(field, errorEl, message) {
    if (field) field.setAttribute('aria-invalid', 'true');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = false;
    }
  }

  function clearError(field, errorEl) {
    if (field) field.removeAttribute('aria-invalid');
    if (errorEl) {
      errorEl.hidden = true;
      errorEl.textContent = '';
    }
  }

  function focusInvalid(field, options = {}) {
    clearTimeout(stepFocusTimer);
    window.setTimeout(() => {
      field.focus({ preventScroll: true });
      if (options.scroll) {
        field.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
      }
    }, 40);
  }

  function radioValue(name) {
    return form.querySelector('input[name="' + name + '"]:checked');
  }

  const serviceGrid = $('.option-grid--services');
  if (serviceGrid && serviceGrid.hasAttribute('role') === false) {
    serviceGrid.setAttribute('role', 'radiogroup');
    serviceGrid.setAttribute('aria-label', 'Storitev');
  }
  if (serviceGrid) serviceGrid.setAttribute('aria-describedby', 'err-service');
  const propertyGrid = $('.option-grid--property');
  if (propertyGrid) propertyGrid.setAttribute('aria-describedby', 'err-property');
  const urgencyGrid = $('.option-grid--urgency');
  if (urgencyGrid) urgencyGrid.setAttribute('aria-describedby', 'err-urgency');

  /* ---------- Validacija ---------- */
  const validators = {
    1() {
      let valid = true;
      let firstInvalid = null;

      const service = radioValue('service');
      const serviceError = $('#err-service');
      if (!service) {
        valid = false;
        setError(null, serviceError, 'Izberite storitev, ki jo potrebujete.');
        firstInvalid = firstInvalid || $('input[name="service"]', form);
      } else {
        clearError(null, serviceError);
      }

      const property = radioValue('property');
      const propertyError = $('#err-property');
      if (!property) {
        valid = false;
        setError(null, propertyError, 'Izberite vrsto objekta.');
        firstInvalid = firstInvalid || $('input[name="property"]', form);
      } else {
        clearError(null, propertyError);
      }

      if (firstInvalid) focusInvalid(firstInvalid);
      return valid;
    },

    2() {
      let valid = true;
      let firstInvalid = null;

      const location = $('#location');
      const locationError = $('#err-location');
      if (!location.value.trim() || location.value.trim().length < 2) {
        valid = false;
        setError(location, locationError, 'Vnesite kraj ali občino, kjer se objekt nahaja.');
        firstInvalid = location;
      } else {
        clearError(location, locationError);
      }

      const urgency = radioValue('urgency');
      const urgencyError = $('#err-urgency');
      if (!urgency) {
        valid = false;
        setError(null, urgencyError, 'Izberite, kako hitro potrebujete izvedbo.');
        firstInvalid = firstInvalid || $('input[name="urgency"]', form);
      } else {
        clearError(null, urgencyError);
      }

      if (firstInvalid) focusInvalid(firstInvalid);
      return valid;
    },

    3() {
      let valid = true;
      let firstInvalid = null;

      const name = $('#name');
      const nameError = $('#err-name');
      if (name.value.trim().length < 2) {
        valid = false;
        setError(name, nameError, 'Vnesite ime in priimek.');
        firstInvalid = name;
      } else {
        clearError(name, nameError);
      }

      const phone = $('#phone');
      const phoneError = $('#err-phone');
      const digits = phone.value.replace(/\D/g, '');
      if (digits.length < 6 || digits.length > 15) {
        valid = false;
        setError(phone, phoneError, 'Vnesite veljaven telefonski kontakt (najmanj 6 števk).');
        firstInvalid = firstInvalid || phone;
      } else {
        clearError(phone, phoneError);
      }

      const email = $('#email');
      const emailError = $('#err-email');
      const emailOk = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(email.value.trim());
      if (!emailOk) {
        valid = false;
        setError(email, emailError, 'Vnesite veljaven e-poštni naslov (npr. ime@primer.si).');
        firstInvalid = firstInvalid || email;
      } else {
        clearError(email, emailError);
      }

      const consent = $('#consent');
      const consentError = $('#err-consent');
      if (!consent.checked) {
        valid = false;
        setError(consent, consentError, 'Za oddajo povpraševanja potrebujemo vaše soglasje.');
        firstInvalid = firstInvalid || consent;
      } else {
        clearError(consent, consentError);
      }

      if (firstInvalid) {
        focusInvalid(firstInvalid, { scroll: true });
      }
      return valid;
    }
  };

  /* ---------- Koraki ---------- */
  function setStep(step, options = {}) {
    currentStep = Math.min(3, Math.max(1, step));

    steps.forEach((el) => {
      el.classList.toggle('is-active', Number(el.dataset.step) === currentStep);
    });

    indicators.forEach((el) => {
      const index = Number(el.dataset.stepIndicator);
      el.classList.toggle('is-active', index === currentStep);
      el.classList.toggle('is-done', index < currentStep);
    });

    if (progressBar) progressBar.style.width = (currentStep / 3) * 100 + '%';
    if (progressEl) progressEl.setAttribute('aria-valuenow', String(currentStep));
    if (currentStepEl) currentStepEl.textContent = String(currentStep);

    if (options.scroll !== false) {
      const top = wizard.getBoundingClientRect().top + window.scrollY - headerHeight() - 16;
      if (window.scrollY > top + 40) {
        window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    }

    if (options.focus !== false) {
      clearTimeout(stepFocusTimer);
      stepFocusTimer = window.setTimeout(() => {
        const title = stepTitles[String(currentStep)];
        if (title) title.focus({ preventScroll: true });
      }, options.scroll === false ? 0 : 240);
    }
  }

  $$('[data-next]', form).forEach((button) => {
    button.addEventListener('click', () => {
      if (validators[currentStep]()) setStep(currentStep + 1);
    });
  });

  $$('[data-back]', form).forEach((button) => {
    button.addEventListener('click', () => setStep(currentStep - 1));
  });

  /* ---------- Oddaja ---------- */
  const formStatus = document.getElementById('inquiry-status');

  function mailtoFor(data) {
    const config = window.EV_FORM_CONFIG || {};
    const email = config.fallbackEmail || 'info@energetikavodovod.si';
    const subject = 'Povpraševanje – ' + data.service;
    const lines = [
      'Ime in priimek: ' + data.name,
      'Telefon: ' + data.phone,
      'E-pošta: ' + data.email,
      'Storitev: ' + data.service,
      'Vrsta objekta: ' + data.property,
      'Lokacija: ' + data.location,
      'Naslov: ' + (data.address || '—'),
      'Nujnost: ' + data.urgency,
      'Opis: ' + (data.message || '—'),
      '',
      'Soglasje za obdelavo osebnih podatkov: da'
    ];
    return 'mailto:' + email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
  }

  function showFormStatus(message, data) {
    if (!formStatus) return;
    formStatus.textContent = message;
    if (data) {
      const link = document.createElement('a');
      link.href = mailtoFor(data);
      link.textContent = 'pošljite povpraševanje po e-pošti';
      formStatus.append(link, '.');
    }
    formStatus.hidden = false;
    formStatus.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
  }

  function clearFormStatus() {
    if (!formStatus) return;
    formStatus.hidden = true;
    formStatus.textContent = '';
  }

  function collectData() {
    return {
      service: radioValue('service')?.value || '',
      property: radioValue('property')?.value || '',
      location: $('#location').value.trim(),
      address: $('#address').value.trim(),
      urgency: radioValue('urgency')?.value || '',
      name: $('#name').value.trim(),
      phone: $('#phone').value.trim(),
      email: $('#email').value.trim(),
      message: $('#message').value.trim(),
      consent: $('#consent').checked
    };
  }

  async function sendInquiry(data) {
    const config = window.EV_FORM_CONFIG || {};
    if (!config.endpoint) throw new Error('Manjka konfiguracija obrazca.');

    const payload = {
      _subject: 'Novo povpraševanje: ' + data.service,
      _template: 'table',
      _captcha: 'false',
      _honey: '',
      _replyto: data.email,
      name: data.name,
      phone: data.phone,
      email: data.email,
      service: data.service,
      property: data.property,
      location: data.location + (data.address ? ', ' + data.address : ''),
      urgency: data.urgency,
      message: data.message || '—',
      consent: 'da'
    };

    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });

    let result = {};
    try { result = await response.json(); } catch (error) { /* non-JSON response */ }
    if (!response.ok || result.success === false || result.success === 'false') {
      throw new Error(result.message || 'Pošiljanje ni uspelo.');
    }
  }

  function paintSuccess(data) {
    const urgent = /nujno/i.test(data.urgency);
    $('[data-success-email]').textContent = data.email;

    const urgentEl = $('[data-success-urgent]');
    if (urgentEl) urgentEl.hidden = !urgent;

    const summary = $('[data-success-summary]');
    summary.innerHTML = '';

    const rows = [
      ['Storitev', data.service],
      ['Objekt', data.property],
      ['Lokacija', data.location + (data.address ? ', ' + data.address : '')],
      ['Urgentnost', data.urgency],
      ['Kontakt', data.name + ' · ' + data.phone],
      ['E-pošta', data.email]
    ];

    rows.forEach(([label, value]) => {
      if (!value) return;
      const wrap = document.createElement('div');
      const dt = document.createElement('dt');
      dt.textContent = label;
      const dd = document.createElement('dd');
      dd.textContent = value;
      wrap.append(dt, dd);
      summary.append(wrap);
    });
  }

  async function submitInquiry(data) {
    if (submitting) return;
    const submitButton = $('[data-submit]', form);
    const originalHTML = submitButton.innerHTML;
    submitting = true;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="btn__spinner" aria-hidden="true"></span> Pošiljam …';
    clearFormStatus();

    try {
      await sendInquiry(data);
      paintSuccess(data);

      if (wizardTop) wizardTop.hidden = true;
      form.hidden = true;
      if (success) {
        clearTimeout(stepFocusTimer);
        success.hidden = false;
        const top = wizard.getBoundingClientRect().top + window.scrollY - headerHeight() - 16;
        window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        window.setTimeout(() => $('.success__title', success)?.focus({ preventScroll: true }), 300);
      }
    } catch (error) {
      showFormStatus('Neposredno pošiljanje ni uspelo. Poskusite znova, pokličite 080 22 50 ali ', data);
    } finally {
      submitting = false;
      submitButton.disabled = false;
      submitButton.innerHTML = originalHTML;
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (submitting) return;

    if (currentStep < 3) {
      if (validators[currentStep]()) setStep(currentStep + 1);
      return;
    }

    if (!validators[3]()) return;
    submitInquiry(collectData());
  });

  /* ---------- Ponastavitev ---------- */
  const resetButton = $('[data-reset]');
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      form.reset();
      $$('.field-error', form).forEach((el) => {
        el.hidden = true;
        el.textContent = '';
      });
      $$('[aria-invalid]', form).forEach((el) => el.removeAttribute('aria-invalid'));

      if (wizardTop) wizardTop.hidden = false;
      form.hidden = false;
      if (success) success.hidden = true;
      clearFormStatus();

      updateSummary();
      setStep(1);
      const firstInput = $('input[name="service"]', form);
      if (firstInput) firstInput.focus({ preventScroll: true });
      wizard.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
  }

  updateSummary();
  setStep(1, { scroll: false, focus: false });
})();
