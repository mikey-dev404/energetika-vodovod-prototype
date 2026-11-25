/* © 2026 mikey-dev404. All rights reserved. Proprietary code; see LICENSE. */
/* Central form endpoint configuration.
   The forms first attempt this endpoint; if it is unreachable (CORS,
   activation or network), they offer a prefilled e-mail fallback.
   For reliable delivery, point this at a same-origin handler (e.g. /send.php)
   or another form service with a CORS-enabled endpoint. */
window.EV_FORM_CONFIG = {
  endpoint: 'https://formsubmit.co/ajax/info@energetikavodovod.si',
  fallbackEmail: 'info@energetikavodovod.si'
};
