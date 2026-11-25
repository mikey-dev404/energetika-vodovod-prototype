# Cookie consent and analytics gate

## Current behaviour

- **No analytics request before consent.** `assets/js/consent.js` sets Google Consent Mode v2 defaults to `denied` and does not inject GTM until the visitor opts in.
- The banner appears on the first visit (and again after 365 days or a consent-version change) with:
  - **Sprejmi vse**
  - **Zavrni vse**
  - **Nastavitve**
  - a link to `zasebnost.html#piskotki`
- Rejecting all makes no GTM/GA request. The choice is stored in `localStorage` under `ev-cookie-consent-v1` (necessary technical storage; no personal data).
- **Nastavitve** opens an accessible dialog with Necessary (always on), Analytics, Marketing and External content. The modal has Escape-to-close, focus return and a Tab trap.
- Analytics consent loads `https://www.googletagmanager.com/gtm.js?id=GTM-THRLMGMB`; marketing consent updates Consent Mode (`ad_storage`, `ad_user_data`, `ad_personalization`).
- Withdrawing analytics and marketing after GTM has loaded triggers one reload, because an executed GTM script cannot be reliably unloaded.
- The footer has **Nastavitve piškotkov** links on content pages; the privacy page has a **Odprite nastavitve piškotkov** button.

## Configuration

- GTM container: `GTM-THRLMGMB` (taken from the current live site). Change `GTM_ID` in `assets/js/consent.js` if the container changes.
- Marketing and external-content categories currently have **no loaders** because no Meta Pixel or maps are present. Add loaders only inside `applyConsent()` and only when the matching consent is granted.
- The policy text is in `zasebnost.html#piskotki`. Update it whenever a new processor or cookie is added.

## Testing

```js
// browser console
localStorage.removeItem('ev-cookie-consent-v1');
location.reload();
```

Then verify:

1. Banner is visible and no `googletagmanager.com` request is made.
2. **Zavrni vse** hides the banner, stores all-false, and makes no GTM request.
3. Reload: no banner and no GTM request.
4. **Nastavitve** → Analytics on → **Shrani nastavitve**: one GTM request and `dataLayer` contains `consent` `default` + `update`.
5. The link in the banner and the privacy settings button both work on root and `/storitve/...` pages.
6. Re-open settings and turn analytics off: page reloads, GTM is not requested, banner stays hidden.

## Legal review

Before launch, confirm:

- the GTM container contains only the intended tags and respects Consent Mode;
- Google Analytics retention/IP-anonymisation settings;
- the Google DPA and any transfer mechanism;
- whether Meta Pixel/maps will be added (then add loaders and policy text);
- the banner wording and records of consent with the client's legal adviser.
