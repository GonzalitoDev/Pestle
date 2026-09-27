# Pestle — Code & Text Sharing

A fast pastebin for sharing code snippets with syntax highlighting, ready to deploy on **Vercel**.

- **Frontend:** React 19 + Vite + Tailwind CSS (static SPA)
- **Backend:** Vercel Functions in [`api/`](api) backed by **Upstash Redis**
- **Code library** (`/codes`): 29 tested, working snippets (JavaScript, TypeScript, Python, HTML, CSS, JSON, Markdown) with search, language filters, copy, download and *Edit & share*
- **In-browser runner**: JavaScript, HTML and CSS run in a sandboxed iframe with a live console — in the library, in the editor before publishing, and on any paste
- **Public feed** (`/explore`) of public pastes; unlisted pastes stay link-only
- Fork any paste into the editor, copy its link, download it with the right file extension
- Anonymous per-browser identity: see your pastes in *My Vault* and delete them
- Optional expiration (1 hour / 1 day / 1 week) enforced with Redis TTLs
- Raw endpoint `GET /api/pastes/:id?raw=1` and full API docs at `/api-docs`


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
