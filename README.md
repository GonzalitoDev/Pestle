# Pestle — Code & Text Sharing

A fast pastebin for sharing code snippets with syntax highlighting, ready to deploy on **Vercel**.

- **Frontend:** React 19 + Vite + Tailwind CSS (static SPA)
- **Backend:** Vercel Functions in [`api/`](api) backed by **Upstash Redis**
- **Light / dark / system theme** with a toggle in the header (remembered per browser)
- **Code library** (`/codes`): 29 tested, working snippets (JavaScript, TypeScript, Python, HTML, CSS, JSON, Markdown) with search, language filters, copy, download and *Edit & share*
- **In-browser runner**: JavaScript, **Python** (via Pyodide/WebAssembly), HTML and CSS run in a sandboxed iframe with a live console — in the library, in the editor before publishing, and on any paste
- **Language auto-detection**: pasting code selects its language, a banner flags mismatches, and code saved under the wrong language (e.g. Python as JavaScript) still runs with the right interpreter
- **Public feed** (`/explore`) of public pastes; unlisted pastes stay link-only
- Fork any paste into the editor, copy its link, download it with the right file extension
- Anonymous per-browser identity: see your pastes in *My Vault* and delete them
- Optional expiration (1 hour / 1 day / 1 week) enforced with Redis TTLs
- Raw endpoint `GET /api/pastes/:id?raw=1` and full API docs at `/api-docs`


## Android app (APK)

The `android/` folder is a [Capacitor](https://capacitorjs.com) app that bundles the whole UI (editor, library, code
runner). It talks to the deployed site's API (`VITE_API_BASE`, default `https://pestle-app.vercel.app`); with no
connection, or if the site is unreachable, it works offline and keeps pastes on the phone.

**Download:** every push builds the APK with GitHub Actions (`.github/workflows/android.yml`) and publishes it under
**Releases** → `Pestle.apk` (latest: `https://github.com/gonzalitodev/pestesting/releases/latest/download/Pestle.apk`).
On the phone: open the APK and allow installing from that source when Android asks.

**Updates install over the previous version only if every build is signed with the same key.** Create one once:

```bash
keytool -genkeypair -v -keystore pestle.jks -alias pestle -keyalg RSA -keysize 4096 -validity 10000
base64 -w0 pestle.jks   # copy the output
```

Then add these repository secrets (Settings → Secrets and variables → Actions): `ANDROID_KEYSTORE_BASE64`,
`ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` (`pestle`), `ANDROID_KEY_PASSWORD`. Keep `pestle.jks` private and
backed up. Without these secrets the workflow still builds a debug-signed APK, but you must uninstall the old app
before installing a new build. To point the app at another backend, set the `PESTLE_API_URL` repository variable.

Build locally (needs Android Studio / the Android SDK and JDK 21):

```bash
npm run build && npx cap sync android
cd android && ./gradlew assembleDebug   # app/build/outputs/apk/debug/app-debug.apk
```

## Security

- **Strict Content-Security-Policy** on the app (`script-src 'self'`, no inline scripts), plus HSTS, `nosniff`,
  `X-Frame-Options: DENY`, COOP, Referrer-Policy and a locked-down Permissions-Policy (see `vercel.json`).
- **Isolated code runner**: user code runs in `/runner.html`, loaded in a sandboxed iframe without
  `allow-same-origin` and served with its own CSP (`sandbox`, `form-action 'none'`). It cannot read the app's DOM,
  cookies or storage, open pop-ups, show dialogs, redirect the page or submit forms to other sites.
- **API hardening**: strict input validation, JSON-only `POST` (blocks cross-site form posts), body size limits,
  generic 500s, `nosniff` + sandbox CSP on responses (raw pastes are always inert `text/plain`).
- **Rate limiting** per IP (20 creates / 10 min, 300 reads / min, 60 deletes / 10 min); IPs are stored only as a
  keyed hash that expires with the window.
- **Ownership**: the browser's owner id acts as a secret; the server stores only an HMAC of it, and only the creator
  can delete a paste. Paste ids are 12 unbiased base62 characters (~71 bits), so unlisted links can't be guessed.
- **Android app**: no cloud backups of app data, cleartext traffic disabled, WebView debugging off; the API only
  accepts cross-origin calls from the app's own origin (`https://localhost`, configurable with `CORS_ORIGINS`).
- Dependencies audited (`npm audit`); only a low-severity dev-server issue on Windows remains.

## Run locally

```bash
npm install
npm run dev          # frontend only, mock mode (localStorage)
```

With the real API and database:

```bash
npm i -g vercel
vercel link
vercel env pull .env.local
vercel dev
```

## API

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/health` | `{ ok, storage }` — whether Redis is connected |
| `POST` | `/api/pastes` | Create: `{ content, language, title?, isPublic?, expiresIn? }` |
| `GET` | `/api/pastes` | List your pastes (needs the `x-owner-id` header) |
| `GET` | `/api/pastes?scope=public` | Latest public pastes (content truncated to a preview) |
| `GET` | `/api/pastes/:id` | Get a paste (`?raw=1` for plain text) |
| `DELETE` | `/api/pastes/:id` | Delete (only its creator, via `x-owner-id`) |
