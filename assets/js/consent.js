/* © 2026 mikey-dev404. All rights reserved. Proprietary code; see LICENSE. */
/* =========================================================
   Energetika Vodovod — cookie consent + GTM gate
   No analytics request is made until the visitor consents.
   ========================================================= */
(function () {
  'use strict';

  const GTM_ID = 'GTM-THRLMGMB';
  const STORAGE_KEY = 'ev-cookie-consent-v1';
  const CONSENT_VERSION = 1;
  const MAX_AGE_DAYS = 365;

  const root = document.documentElement;
  const privacyHref = (location.pathname.includes('/storitve/') ? '../' : '') + 'zasebnost.html#piskotki';

  let gtmLoaded = false;
  let lastFocus = null;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted'
  });

  function readConsent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== CONSENT_VERSION) return null;
      if (!parsed.savedAt || Date.now() - parsed.savedAt > MAX_AGE_DAYS * 86400000) return null;
      return parsed;
    } catch (error) {
      return null;
    }
  }

  function writeConsent(consent) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: CONSENT_VERSION,
        savedAt: Date.now(),
        necessary: true,
        analytics: !!consent.analytics,
        marketing: !!consent.marketing,
        external: !!consent.external
      }));
    } catch (error) {
      /* storage can be blocked; the choice still applies for this page view */
    }
  }

  function applyConsent(consent) {
    gtag('consent', 'update', {
      analytics_storage: consent.analytics ? 'granted' : 'denied',
      ad_storage: consent.marketing ? 'granted' : 'denied',
      ad_user_data: consent.marketing ? 'granted' : 'denied',
      ad_personalization: consent.marketing ? 'granted' : 'denied'
    });
    if (consent.analytics || consent.marketing) loadGtm();
  }

  function loadGtm() {
    if (!GTM_ID || gtmLoaded) return;
    gtmLoaded = true;
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(GTM_ID);
    document.head.appendChild(script);
  }

  function buildBanner() {
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.id = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'false');
    banner.setAttribute('aria-labelledby', 'cookie-banner-title');
    banner.setAttribute('aria-describedby', 'cookie-banner-text');
    banner.innerHTML = `
      <div class="cookie-banner__inner">
        <div class="cookie-banner__copy">
          <p class="cookie-banner__title" id="cookie-banner-title">Piškotki in zasebnost</p>
          <p id="cookie-banner-text">Nujne tehnične zapise uporabljamo za delovanje strani. Analitiko naložimo le, če se z njo strinjate. <a href="${privacyHref}">Politika piškotkov</a>.</p>
        </div>
        <div class="cookie-banner__actions">
          <button class="btn btn--primary btn--sm" type="button" data-cookie-accept>Sprejmi vse</button>
          <button class="btn btn--ghost btn--sm" type="button" data-cookie-reject>Zavrni vse</button>
          <button class="cookie-banner__settings" type="button" data-cookie-settings>Nastavitve</button>
        </div>
      </div>`;
    document.body.appendChild(banner);
    return banner;
  }

  function buildModal() {
    const modal = document.createElement('div');
    modal.className = 'cookie-modal';
    modal.id = 'cookie-modal';
    modal.hidden = true;
    modal.innerHTML = `
      <div class="cookie-modal__backdrop" data-cookie-close></div>
      <div class="cookie-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title">
        <div class="cookie-modal__head">
          <h2 id="cookie-modal-title">Nastavitve piškotkov</h2>
          <button class="cookie-modal__close" type="button" aria-label="Zapri nastavitve" data-cookie-close>
            <svg class="icon" aria-hidden="true"><use href="#i-close"/></svg>
          </button>
        </div>
        <p class="cookie-modal__intro">Izberite, katere neobvezne piškotke dovolite. Nujni so vedno aktivni, ker omogočajo delovanje strani.</p>
        <div class="cookie-option">
          <div><strong>Nujni</strong><span>Shramba vaše izbire in varnost strani.</span></div>
          <span class="cookie-option__always">Vedno aktivno</span>
        </div>
        <label class="cookie-option">
          <div><strong>Analitika</strong><span>Google Analytics prek Google Tag Managerja — anonimna statistika obiska.</span></div>
          <input type="checkbox" data-cookie-cat="analytics">
        </label>
        <label class="cookie-option">
          <div><strong>Marketing</strong><span>Oglaševanje in merjenje kampanj (npr. Meta Pixel), če bo uvedeno.</span></div>
          <input type="checkbox" data-cookie-cat="marketing">
        </label>
        <label class="cookie-option">
          <div><strong>Zunanja vsebina</strong><span>Vgrajeni zemljevidi ali video, če bo uvedeno.</span></div>
          <input type="checkbox" data-cookie-cat="external">
        </label>
        <div class="cookie-modal__actions">
          <button class="btn btn--primary" type="button" data-cookie-save>Shrani nastavitve</button>
          <a class="cookie-modal__link" href="${privacyHref}">Več o piškotkih</a>
        </div>
      </div>`;
    document.body.appendChild(modal);
    return modal;
  }

  const banner = buildBanner();
  const modal = buildModal();
  banner.hidden = true;

  function currentChoices() {
    return {
      analytics: !!modal.querySelector('[data-cookie-cat="analytics"]').checked,
      marketing: !!modal.querySelector('[data-cookie-cat="marketing"]').checked,
      external: !!modal.querySelector('[data-cookie-cat="external"]').checked
    };
  }

  function setChoices(consent) {
    modal.querySelector('[data-cookie-cat="analytics"]').checked = !!consent.analytics;
    modal.querySelector('[data-cookie-cat="marketing"]').checked = !!consent.marketing;
    modal.querySelector('[data-cookie-cat="external"]').checked = !!consent.external;
  }

  function hideBanner() {
    banner.hidden = true;
    root.classList.remove('has-cookie-banner');
  }

  function showBanner() {
    banner.hidden = false;
    root.classList.add('has-cookie-banner');
  }

  function openSettings() {
    lastFocus = document.activeElement;
    setChoices(readConsent() || { analytics: false, marketing: false, external: false });
    modal.hidden = false;
    document.body.classList.add('has-cookie-modal');
    const close = modal.querySelector('.cookie-modal__close');
    if (close) close.focus();
  }

  function closeSettings() {
    modal.hidden = true;
    document.body.classList.remove('has-cookie-modal');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  function saveChoices(consent) {
    const wasGtmLoaded = gtmLoaded;
    writeConsent(consent);
    applyConsent(consent);
    hideBanner();
    if (!modal.hidden) closeSettings();
    // GTM/GA cannot be reliably unloaded from an already-executed page.
    // Reload once both analytics and marketing are withdrawn.
    if (wasGtmLoaded && !consent.analytics && !consent.marketing) {
      window.location.reload();
    }
  }

  banner.addEventListener('click', (event) => {
    const button = event.target.closest('[data-cookie-accept], [data-cookie-reject], [data-cookie-settings]');
    if (!button) return;
    if (button.hasAttribute('data-cookie-accept')) saveChoices({ analytics: true, marketing: true, external: true });
    if (button.hasAttribute('data-cookie-reject')) saveChoices({ analytics: false, marketing: false, external: false });
    if (button.hasAttribute('data-cookie-settings')) openSettings();
  });

  modal.addEventListener('click', (event) => {
    if (event.target.closest('[data-cookie-close]')) closeSettings();
    if (event.target.closest('[data-cookie-save]')) saveChoices(currentChoices());
  });

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-cookie-settings]');
    if (!trigger || banner.contains(trigger) || modal.contains(trigger)) return;
    event.preventDefault();
    openSettings();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || modal.hidden) return;
    closeSettings();
  });

  modal.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab' || modal.hidden) return;
    const focusables = Array.from(modal.querySelectorAll('button, a[href], input:not([disabled])')).filter((el) => el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  });

  const stored = readConsent();
  if (stored) {
    setChoices(stored);
    applyConsent(stored);
  } else {
    showBanner();
  }

  window.EVConsent = {
    open: showBanner,
    settings: openSettings,
    get: () => readConsent(),
    reset: () => {
      try { localStorage.removeItem(STORAGE_KEY); } catch (error) { /* noop */ }
      setChoices({ analytics: false, marketing: false, external: false });
      showBanner();
      if (gtmLoaded) window.location.reload();
    }
  };
})();
