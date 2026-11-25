/* © 2026 mikey-dev404. All rights reserved. Proprietary code; see LICENSE. */
/* =========================================================
   Homepage — compact two-step inquiry
   Independent from the full contact form. Submits to the
   endpoint configured in assets/js/form-config.js.
   ========================================================= */
(function () {
  'use strict';

  const form = document.getElementById('home-lead-form');
  if (!form) return;

  const card = document.getElementById('home-lead');
  const success = document.getElementById('home-lead-success');
  const steps = Array.from(form.querySelectorAll('[data-hstep]'));
  const indicators = Array.from(document.querySelectorAll('[data-hstep-indicator]'));
  const bar = card.querySelector('.progress__bar');
  const progress = card.querySelector('.progress');
  const head = card.querySelector('.lead-card__head');
  const serviceGroup = form.querySelector('.option-grid--services');
  const propertyGroup = form.querySelector('.option-grid--property');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $ = (selector, context = document) => context.querySelector(selector);
  const headerHeight = () => (document.querySelector('.site-header')?.offsetHeight || 80);

  let step = 1;
  let submitting = false;
  let focusTimer;

  const errorIds = {
    service: 'herr-service',
    property: 'herr-property',
    location: 'herr-location',
    urgency: 'herr-urgency',
    name: 'herr-name',
    phone: 'herr-phone',
    email: 'herr-email',
    contact: 'herr-contact',
    consent: 'herr-consent'
  };

  function setError(key, message) {
    const el = document.getElementById(errorIds[key]);
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
  }

  function clearError(key) {
    const el = document.getElementById(errorIds[key]);
    if (!el) return;
    el.hidden = true;
    el.textContent = '';
  }

  function markInvalid(el, invalid) {
    if (!el) return;
    if (invalid) el.setAttribute('aria-invalid', 'true');
    else el.removeAttribute('aria-invalid');
  }

  function selected(name) {
    return form.querySelector('input[name="' + name + '"]:checked');
  }

  function focusFirst(el) {
    if (!el) return;
    clearTimeout(focusTimer);
    window.setTimeout(() => el.focus({ preventScroll: true }), 40);
  }

  function setStep(next, options = {}) {
    step = Math.min(2, Math.max(1, next));

    steps.forEach((el) => {
      el.classList.toggle('is-active', Number(el.dataset.hstep) === step);
    });

    indicators.forEach((el) => {
      const index = Number(el.dataset.hstepIndicator);
      el.classList.toggle('is-active', index === step);
      el.classList.toggle('is-done', index < step);
    });

    if (bar) bar.style.width = (step === 1 ? 50 : 100) + '%';
    if (progress) progress.setAttribute('aria-valuenow', String(step));

    if (options.scroll !== false) {
      const top = card.getBoundingClientRect().top + window.scrollY - headerHeight() - 16;
      if (window.scrollY > top + 40) {
        window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    }

    if (options.focus !== false) {
      clearTimeout(focusTimer);
      focusTimer = window.setTimeout(() => {
        const title = form.querySelector('[data-hstep="' + step + '"] .step__title');
        if (title) title.focus({ preventScroll: true });
      }, options.scroll === false ? 0 : 240);
    }
  }

  function validateStep1() {
    let valid = true;
    let firstInvalid = null;

    const service = selected('hservice');
    if (!service) {
      valid = false;
      setError('service', 'Izberite storitev, ki jo potrebujete.');
      markInvalid(serviceGroup, true);
      firstInvalid = firstInvalid || form.querySelector('input[name="hservice"]');
    } else {
      clearError('service');
      markInvalid(serviceGroup, false);
    }

    const property = selected('hproperty');
    if (!property) {
      valid = false;
      setError('property', 'Izberite vrsto objekta.');
      markInvalid(propertyGroup, true);
      firstInvalid = firstInvalid || form.querySelector('input[name="hproperty"]');
    } else {
      clearError('property');
      markInvalid(propertyGroup, false);
    }

    const location = document.getElementById('hlocation');
    if (!location.value.trim() || location.value.trim().length < 2) {
      valid = false;
      setError('location', 'Vnesite kraj ali občino, kjer se objekt nahaja.');
      markInvalid(location, true);
      firstInvalid = firstInvalid || location;
    } else {
      clearError('location');
      markInvalid(location, false);
    }

    const urgency = document.getElementById('hurgency');
    if (!urgency.value) {
      valid = false;
      setError('urgency', 'Izberite, kdaj želite izvedbo.');
      markInvalid(urgency, true);
      firstInvalid = firstInvalid || urgency;
    } else {
      clearError('urgency');
      markInvalid(urgency, false);
    }

    if (firstInvalid) {
      focusFirst(firstInvalid);
      firstInvalid.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    }
    return valid;
  }

  function validateStep2() {
    let valid = true;
    let firstInvalid = null;

    const name = document.getElementById('hname');
    if (name.value.trim().length < 2) {
      valid = false;
      setError('name', 'Vnesite ime in priimek.');
      markInvalid(name, true);
      firstInvalid = firstInvalid || name;
    } else {
      clearError('name');
      markInvalid(name, false);
    }

    const phone = document.getElementById('hphone');
    const email = document.getElementById('hemail');
    const phoneDigits = phone.value.replace(/\D/g, '');
    const emailValue = email.value.trim();

    if (phone.value.trim() && (phoneDigits.length < 6 || phoneDigits.length > 15)) {
      valid = false;
      setError('phone', 'Vnesite veljaven telefon (najmanj 6 števk).');
      markInvalid(phone, true);
      firstInvalid = firstInvalid || phone;
    } else {
      clearError('phone');
      markInvalid(phone, false);
    }

    if (emailValue && !/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(emailValue)) {
      valid = false;
      setError('email', 'Vnesite veljaven e-poštni naslov.');
      markInvalid(email, true);
      firstInvalid = firstInvalid || email;
    } else {
      clearError('email');
      markInvalid(email, false);
    }

    if (!phone.value.trim() && !emailValue) {
      valid = false;
      setError('contact', 'Vnesite telefon ali e-pošto, da vas lahko dosežemo.');
      markInvalid(phone, true);
      firstInvalid = firstInvalid || phone;
    } else {
      clearError('contact');
    }

    const consent = document.getElementById('hconsent');
    if (!consent.checked) {
      valid = false;
      setError('consent', 'Za oddajo povpraševanja potrebujemo vaše soglasje.');
      markInvalid(consent, true);
      firstInvalid = firstInvalid || consent;
    } else {
      clearError('consent');
      markInvalid(consent, false);
    }

    if (firstInvalid) {
      focusFirst(firstInvalid);
      firstInvalid.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    }
    return valid;
  }

  function clearFieldError(target) {
    const name = target.name;
    if (name === 'hservice') {
      clearError('service');
      markInvalid(serviceGroup, false);
    }
    if (name === 'hproperty') {
      clearError('property');
      markInvalid(propertyGroup, false);
    }
    if (target.id === 'hurgency') {
      clearError('urgency');
      markInvalid(target, false);
    }
    if (target.id === 'hlocation') {
      clearError('location');
      markInvalid(target, false);
    }
    if (target.id === 'hname') {
      clearError('name');
      markInvalid(target, false);
    }
    if (target.id === 'hphone' || target.id === 'hemail') {
      clearError(target.id === 'hphone' ? 'phone' : 'email');
      markInvalid(target, false);
      if (document.getElementById('hphone').value.trim() || document.getElementById('hemail').value.trim()) {
        clearError('contact');
        markInvalid(document.getElementById('hphone'), false);
      }
    }
    if (target.id === 'hconsent') {
      clearError('consent');
      markInvalid(target, false);
    }
  }

  const status = document.getElementById('home-lead-status');

  function mailtoFor(data) {
    const config = window.EV_FORM_CONFIG || {};
    const email = config.fallbackEmail || 'info@energetikavodovod.si';
    const subject = 'Povpraševanje – ' + data.service;
    const lines = [
      'Ime in priimek: ' + data.name,
      'Telefon: ' + (data.phone || '—'),
      'E-pošta: ' + (data.email || '—'),
      'Storitev: ' + data.service,
      'Vrsta objekta: ' + data.property,
      'Lokacija: ' + data.location,
      'Kdaj: ' + data.urgency,
      'Opis: ' + (data.message || '—'),
      '',
      'Soglasje za obdelavo osebnih podatkov: da'
    ];
    return 'mailto:' + email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
  }

  function showStatus(message, data) {
    if (!status) return;
    status.textContent = message;
    if (data) {
      const link = document.createElement('a');
      link.href = mailtoFor(data);
      link.textContent = 'pošljite povpraševanje po e-pošti';
      status.append(link, '.');
    }
    status.hidden = false;
    status.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  }

  function clearStatus() {
    if (!status) return;
    status.hidden = true;
    status.textContent = '';
  }

  function collect() {
    const phone = document.getElementById('hphone').value.trim();
    const email = document.getElementById('hemail').value.trim();
    return {
      service: selected('hservice')?.value || '',
      property: selected('hproperty')?.value || '',
      location: document.getElementById('hlocation').value.trim(),
      urgency: document.getElementById('hurgency').value,
      name: document.getElementById('hname').value.trim(),
      phone,
      email,
      message: document.getElementById('hmessage').value.trim(),
      contact: phone || email
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
      name: data.name,
      phone: data.phone || '—',
      email: data.email || '—',
      service: data.service,
      property: data.property,
      location: data.location,
      urgency: data.urgency,
      message: data.message || '—',
      consent: 'da'
    };
    if (data.email) payload._replyto = data.email;

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

  function fillSuccess(data) {
    const summary = $('[data-hsuccess-summary]', success);
    summary.innerHTML = '';
    [
      ['Storitev', data.service],
      ['Objekt', data.property],
      ['Lokacija', data.location],
      ['Kdaj', data.urgency],
      ['Kontakt', data.contact]
    ].forEach(([label, value]) => {
      const row = document.createElement('div');
      const dt = document.createElement('dt');
      dt.textContent = label;
      const dd = document.createElement('dd');
      dd.textContent = value;
      row.append(dt, dd);
      summary.append(row);
    });
  }

  async function submit() {
    if (submitting) return;
    clearStatus();

    const data = collect();
    const button = $('[data-hsubmit]', form);
    const original = button.innerHTML;
    submitting = true;
    button.disabled = true;
    button.innerHTML = '<span class="btn__spinner" aria-hidden="true"></span> Pošiljam …';

    try {
      await sendInquiry(data);
      fillSuccess(data);
      head.hidden = true;
      form.hidden = true;
      success.hidden = false;

      const top = card.getBoundingClientRect().top + window.scrollY - headerHeight() - 16;
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
      window.setTimeout(() => $('.lead-success__title', success)?.focus({ preventScroll: true }), 260);
    } catch (error) {
      showStatus('Neposredno pošiljanje ni uspelo. Poskusite znova, pokličite 080 22 50 ali ', data);
    } finally {
      submitting = false;
      button.disabled = false;
      button.innerHTML = original;
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (submitting) return;
    if (step < 2) {
      if (validateStep1()) setStep(2);
      return;
    }
    if (validateStep2()) submit();
  });

  form.querySelectorAll('[data-hnext]').forEach((button) => {
    button.addEventListener('click', () => {
      if (validateStep1()) setStep(2);
    });
  });

  form.querySelectorAll('[data-hback]').forEach((button) => {
    button.addEventListener('click', () => setStep(1));
  });

  form.addEventListener('change', (event) => {
    clearFieldError(event.target);
  });

  form.addEventListener('input', (event) => {
    clearFieldError(event.target);
  });

  const resetButton = $('[data-hreset]', success);
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      form.reset();
      form.querySelectorAll('.field-error').forEach((el) => {
        el.hidden = true;
        el.textContent = '';
      });
      form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
      success.hidden = true;
      head.hidden = false;
      form.hidden = false;
      clearStatus();
      setStep(1, { scroll: false });
      card.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      const first = form.querySelector('input[name="hservice"]');
      if (first) first.focus({ preventScroll: true });
    });
  }

  setStep(1, { scroll: false, focus: false });
})();
