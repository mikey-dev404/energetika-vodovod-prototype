# Private GitHub repo with a public Netlify preview

Goal: the client can open the website, but the GitHub repository is **private** and the GitHub Pages site is retired.

## Why Netlify

GitHub Pages cannot publish from a private repo on the current GitHub plan (verified with a 422). Netlify can deploy a static site from a private repository; the preview URL is public, the source repo stays private.

**Important:** any public website exposes its rendered HTML/CSS/JS to browser DevTools. A private repo hides the GitHub source, not the client-side files. If the client must not see front-end code at all, use a video/screenshots or a server-rendered app instead.

## One-time connection

1. Log in to Netlify and choose **Add new site → Import an existing project**.
2. Choose **GitHub** and authorize Netlify for the `energetika-vodovod-prototype` repository. Private-repo access is supported.
3. Build command: leave **empty**. Publish directory: `.` (the repo includes `netlify.toml`).
4. Deploy. Netlify gives a URL such as `https://energetika-vodovod-preview.netlify.app`.
5. Send that URL back so it can be verified before the GitHub repo is switched to private.

If you prefer a token-based deploy instead of the GitHub connection, provide a Netlify personal access token and site name; the same static root is published.

## What is published

`netlify.toml` publishes the site root. `_redirects`:

- 301s legacy `/vzdrzevanje/`, `/svetovanje/`, other old service/root URLs;
- returns 404 for `README.md`, `docs/*`, `.htaccess`, `netlify.toml`, `.nojekyll`, `_redirects`, `.gitignore`.

`X-Robots-Tag: noindex, nofollow` keeps the preview out of search engines. The branded `404.html` handles unknown paths.

## After the preview is live

1. Verify home, all eight service pages, both forms, cookie consent and the 301s on the Netlify URL.
2. Make the GitHub repo private:
   ```bash
   gh repo edit mikey-dev404/energetika-vodovod-prototype \
     --visibility private --accept-visibility-change-consequences
   ```
3. Disable the old GitHub Pages site:
   ```bash
   gh api -X DELETE repos/mikey-dev404/energetika-vodovod-prototype/pages
   ```
4. Update the README live-preview link to the Netlify URL.
5. Confirm the GitHub Pages URL no longer serves the site and that `README.md`/`docs/*` return 404 on Netlify.

## Updates

With the GitHub connection, every push to `main` on the private repo redeploys Netlify. The GitHub Actions/build logs are visible only to the Netlify account.
