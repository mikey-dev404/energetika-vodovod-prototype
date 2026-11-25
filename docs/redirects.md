# Migration URLs and 301 redirects

The static site uses `.html` files. This is the **301 option** from the migration brief: legacy WordPress URLs are redirected to the new files, and existing clean URLs are redirected once to the same files. Clean URLs without `.html` are a later phase (see the end of this document).

## 301 mapping

| Legacy / existing URL | New URL | Status |
| --- | --- | --- |
| `/vzdrzevanje/` | `/storitve/vzdrzevanje.html` | 301 |
| `/svetovanje/` | `/storitve/svetovanje.html` | 301 |
| `/elektroinstalacije/` | `/storitve/elektroinstalacije.html` | 301 |
| `/vodovod/` | `/storitve/vodovod.html` | 301 |
| `/prezracevanje/` | `/storitve/prezracevanje.html` | 301 |
| `/klimatizacija/` | `/storitve/klimatizacija.html` | 301 |
| `/toplotne-crpalke/` | `/storitve/toplotne-crpalke.html` | 301 |
| `/pametni-domovi/` | `/storitve/pametni-domovi.html` | 301 |
| `/storitve/elektroinstalacije/` | `/storitve/elektroinstalacije.html` | 301 |
| `/storitve/vzdrzevanje/` | `/storitve/vzdrzevanje.html` | 301 |
| `/storitve/svetovanje/` | `/storitve/svetovanje.html` | 301 |
| `/o-nas/` | `/o-nas.html` | 301 |
| `/reference/` | `/reference.html` | 301 |
| `/dezurna-sluzba/` | `/dezurna-sluzba.html` | 301 |
| `/kontakt/` | `/kontakt.html` | 301 |
| `/varstvo-osebnih-podatkov/` | `/zasebnost.html` | 301 |
| `/storitve` | `/storitve/` | 301 |

The same rules handle the no-trailing-slash variants. `/storitve/` remains a folder index and `/` remains the home page.

## Apache / LiteSpeed (`.htaccess`)

The repo contains `.htaccess` with the 301 rules above. **Do not overwrite the live WordPress `.htaccess` blindly.** Back it up, merge the rules, and keep the WordPress block until the cutover is verified. If the site lives in a subdirectory, adjust the absolute targets. Test:

```bash
curl -I https://example.com/vzdrzevanje/
curl -I https://example.com/storitve/vzdrzevanje/
curl -I https://example.com/storitve/vzdrzevanje.html
```

Expected: `301` for the first two, `200` for the `.html` file.

## Netlify (`_redirects`)

The repo contains `_redirects` with the same 301s. Deploy the repo root; no build command. Verify the same three curls after deployment.

## GitHub Pages

GitHub Pages serves the `.html` files directly. The preview uses `.html` links so it is fully functional; the legacy 301s are only active on a host that processes `.htaccess` or `_redirects`.

As a static-preview fallback, `vzdrzevanje/index.html` and `svetovanje/index.html` use `<meta http-equiv="refresh">` + `location.replace()` to `../storitve/*.html` and are `noindex`. Production hosts should still apply the real 301 rules above; GitHub Pages cannot send 301s.

## Clean URLs — later phase

Clean URLs cannot be enabled safely with `.htaccess` rewrites while internal links use `../` from `storitve/<slug>.html`: a rewrite to `storitve/<slug>/` changes the base directory and breaks those links. The safe clean-URL migration is:

1. Move each `storitve/<slug>.html` to `storitve/<slug>/index.html`.
2. Update assets to `../../assets/...`, root links to `../../...`, other services to `../<slug>/`.
3. Make the service overview link to `<slug>/`.
4. Add 301s from `.html` to the folder URL; remove the 200 rewrites.
5. Update the cookie banner privacy link and the footer service/privacy links to `../../...`.
6. Retest all pages at `/storitve/<slug>/` and `/storitve/<slug>.html`.

This is deliberately **not** enabled yet; doing only the rewrite half would ship broken CSS, navigation and footer links on the clean URLs.

## Cutover checklist

1. Lower DNS TTL at least 24 h before the switch.
2. Back up WordPress files, database and `.htaccess`.
3. Deploy the static files to the web root.
4. Merge/activate the 301 rules; confirm `mod_rewrite`/`AllowOverride`.
5. Test every legacy URL and every `.html` URL with `curl -I`.
6. Confirm `sitemap.xml` and `robots.txt` return 200.
7. Submit the sitemap in Google Search Console; keep 301s for at least 12 months.
