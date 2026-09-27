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
