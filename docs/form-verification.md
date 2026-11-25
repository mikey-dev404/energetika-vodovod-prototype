# Form endpoint verification — 25 November 2026

## Result

**Automatic server-side delivery is not working from the GitHub Pages preview.**

The forms are wired to `https://formsubmit.co/ajax/info@energetikavodovod.si` through `assets/js/form-config.js`.

## Tests performed

1. **Real AJAX request from the deployed page**
   - A test inquiry was submitted from `https://mikey-dev404.github.io/energetika-vodovod-prototype/`.
   - The browser reported: `Access to fetch … has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present`.
   - The UI showed the error state (`#home-lead-status`, `role="alert"`) and a prefilled `mailto:` fallback. It did **not** show a false success.
2. **Standard FormSubmit POST**
   - A normal HTML form POST to FormSubmit returned HTTP 403 and a Cloudflare "Just a moment…" challenge in the headless browser.
3. **Mocked 200 response**
   - With a mocked `{"success":"true"}` response, the success panel appeared correctly and no fake reference ID was shown.
4. **Consent gate**
   - Submitting without the consent checkbox made zero requests and showed the consent error.

## What is needed

A CORS-enabled endpoint the client controls is required for automatic delivery, for example:

- a same-origin `send.php`/PHP handler on the production hosting, or
- a Formspree form ID / Netlify Forms endpoint.

Update `endpoint` and `fallbackEmail` in `assets/js/form-config.js`, then retest. The current `mailto:` fallback keeps inquiries usable in the meantime, but it depends on the visitor's e-mail client.
