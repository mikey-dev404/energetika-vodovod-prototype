# Copyright, ownership and evidence

> This is practical information, not legal advice. Have a Slovenian/EU IP lawyer review the final contract before sending it to the client.

## Short answer

- **A private GitHub repo is free.** GitHub Free can host a private repository.
- **A free GitHub Pages preview from that private repo is not available.** GitHub returned 422 for this account. The free route is a **private GitHub repo + a public Netlify preview** (config already prepared in `netlify.toml`).
- **Copyright exists automatically** when the code/design is created. You do not need a public repo or a copyright registration to own the work.
- **A private repo is not, by itself, strong legal ground.** The practical evidence is a signed contract, dated authorship records and — ideally — a registration or notarised deposit.

## What is already in the repo

- `LICENSE` — proprietary, all rights reserved, no open-source permission.
- Copyright comments in the HTML, CSS and JS source.
- Client brand assets (name, logo, photography, copy) are expressly excluded and remain the client’s property.
- `MANIFEST.sha256` — a hash manifest of the source at this commit.
- Git history with timestamps.

The client can still inspect the rendered HTML/CSS/JS in browser DevTools on any public preview. A private repo hides the **repository**, not the front-end source. Copyright protects the expression; it does not make the files invisible.

## The strongest practical protection

1. **Signed development agreement before handover**
   - You retain copyright until the invoice is paid in full.
   - After payment, the client receives a **non-exclusive, non-transferable licence** to use the delivered site on the agreed domain.
   - No ownership transfer, resale, sublicensing or reuse of the code for other projects without written permission.
   - Client warrants it owns the logo, photos and copy and indemnifies you for them.
   - Confidentiality/NDA and a clause that the client may not remove copyright notices.
2. **Payment and access leverage**
   - Deposit and milestone payments.
   - Keep the repo, hosting and domain in your account until final payment.
   - Deliver a preview, not a ZIP/source export, before payment.
3. **Dated authorship evidence**
   - Keep the Git history and a tagged release.
   - Keep `MANIFEST.sha256` and an archive of the final commit.
   - Email the archive to yourself and/or the client; keep the sent message.
   - Optionally use OpenTimestamps or a notary for a timestamped hash.
4. **Registration (optional, jurisdiction-dependent)**
   - EU/Slovenia: copyright is automatic; there is no general requirement to register.
   - US: registration is optional for basic rights, but timely registration can unlock statutory damages and attorney’s fees in US proceedings. It is a paid process.
   - Ask an IP lawyer whether registration in the client’s/main market is worth it for this project.
5. **Enforcement**
   - Written cease-and-desist.
   - DMCA takedown to the host if the copy is hosted in the US.
   - Contract damages / court action where applicable.

## Contract clause template (Slovenian)

> **Avtorske pravice in licenca.** Izvajalec zadrži vse materialne avtorske pravice do izvorne kode, strukture in izvedbe spletne strani do popolnega plačila celotnega dogovorjenega zneska. Po popolnem plačilu se naročniku podeli neizključna, neprenosljiva in časovno neomejena licenca za uporabo dostavljene spletne strani na dogovorjeni domeni. Naročnik ni upravičen do nadaljnje prodaje, podlicenciranja, distribuiranja ali ponovne uporabe izvorne kode brez predhodnega pisnega soglasja izvajalca. Naročnik ne sme odstraniti obvestil o avtorskih pravicah. Pravice do logotipa, fotografij in vsebine, ki jih zagotovi naročnik, ostanejo pri naročniku; naročnik jamči, da ima za njih potrebne pravice.

Use placeholders for the legal names and have the contract reviewed.

## Replace before delivery

`mikey-dev404` is used as the copyright holder in `LICENSE` and source headers. Replace it with your full legal name or company before sending the final work to the client.
