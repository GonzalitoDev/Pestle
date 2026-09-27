import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

function InfoPage({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <article className="max-w-3xl space-y-8 animate-in fade-in duration-700">
      <header className="space-y-2 border-b border-[#141414] pb-6">
        <h1 className="text-3xl font-mono font-bold tracking-tighter">{title}</h1>
        <p className="text-xs font-mono uppercase tracking-[0.2em] opacity-40">{subtitle}</p>
      </header>
      <div className="space-y-6 text-sm leading-relaxed [&_h2]:font-mono [&_h2]:font-bold [&_h2]:uppercase [&_h2]:tracking-wider [&_h2]:text-xs [&_h2]:mb-2 [&_code]:font-mono [&_code]:text-xs [&_code]:bg-white [&_code]:px-1 [&_code]:border [&_code]:border-[#141414]/10">
        {children}
      </div>
    </article>
  );
}

export function Privacy() {
  return (
    <InfoPage title="PRIVACY.MD" subtitle="What Pestle stores and why">
      <section>
        <h2>No accounts</h2>
        <p>
          Pestle has no sign-up. Your browser gets a random identifier (stored in <code>localStorage</code>) so you can list
          and delete the pastes you created. The server only keeps a one-way SHA-256 hash of it.
        </p>
      </section>
      <section>
        <h2>What we store</h2>
        <p>
          The title, content, language, visibility, creation time and optional expiry of each paste. No email, no
          accounts, no tracking cookies, no analytics.
        </p>
      </section>
      <section>
        <h2>Abuse protection</h2>
        <p>
          To stop spam, the API counts requests per IP address. The IP is never stored as-is: only a keyed hash is kept,
          and each counter is deleted automatically after at most 10 minutes.
        </p>
      </section>
      <section>
        <h2>Visibility</h2>
        <p>
          <strong>Public</strong> pastes appear in the <Link className="underline" to="/explore">public feed</Link>.{' '}
          <strong>Unlisted</strong> pastes never appear there, but anyone with the link can open them. Do not paste
          passwords, API keys or personal data.
        </p>
      </section>
      <section>
        <h2>Deletion</h2>
        <p>
          Pastes with an expiry are deleted automatically when it passes. You can delete any paste you created from its page
          with the <strong>PURGE</strong> button. Clearing your browser data loses your identifier, and with it the ability to
          delete older pastes.
        </p>
      </section>
      <section>
        <h2>Code runner</h2>
        <p>
          Code you run executes only in your browser, inside an isolated sandbox with no access to this site, its storage
          or your cookies, and it cannot open pop-ups or redirect the page. It is never sent to our servers.
        </p>
      </section>
    </InfoPage>
  );
}

export function Terms() {
  return (
    <InfoPage title="TERMS_OF_USE" subtitle="Short and simple">
      <section>
        <h2>Acceptable use</h2>
        <p>
          Share code and text you have the right to share. Do not upload malware, illegal content, credentials or other
          people&apos;s personal data. Abusive content may be removed without notice.
        </p>
      </section>
      <section>
        <h2>Running code</h2>
        <p>
          Only run code you understand. The runner is sandboxed, but code can still make network requests from your browser.
        </p>
      </section>
      <section>
        <h2>No warranty</h2>
        <p>
          Pestle is provided as-is, without guarantees of availability or persistence. Keep your own copy of anything
          important. Snippets in the code library are provided under the MIT license.
        </p>
      </section>
      <section>
        <h2>Limits</h2>
        <p>
          Each paste can be up to 512&nbsp;KB and titles up to 200 characters. The API allows 20 new pastes per 10 minutes
          and 300 reads per minute per IP address; above that it answers <code>429 Too Many Requests</code>.
        </p>
      </section>
    </InfoPage>
  );
}

const ENDPOINTS: { method: string; path: string; description: string; example: string }[] = [
  {
    method: 'GET',
    path: '/api/health',
    description: 'Service status and whether persistent storage is connected.',
    example: `curl ${location.origin}/api/health`,
  },
  {
    method: 'POST',
    path: '/api/pastes',
    description:
      'Create a paste. Body: { content, language, title?, isPublic?, expiresIn? }. language is one of javascript, typescript, python, html, css, json, markdown, text; expiresIn is never, 1h, 1d or 1w. Send x-owner-id (any random string of 16+ chars) to be able to list and delete it later.',
    example: `curl -X POST ${location.origin}/api/pastes \\
  -H 'content-type: application/json' \\
  -H 'x-owner-id: my-secret-owner-id-123' \\
  -d '{"content":"console.log(42)","language":"javascript","expiresIn":"1d"}'`,
  },
  {
    method: 'GET',
    path: '/api/pastes/:id',
    description: 'Get a paste as JSON. Add ?raw=1 for plain text, ideal for curl or scripts.',
    example: `curl ${location.origin}/api/pastes/ID?raw=1`,
  },
  {
    method: 'GET',
    path: '/api/pastes?scope=public',
    description: 'Latest 50 public pastes (content truncated to a preview).',
    example: `curl '${location.origin}/api/pastes?scope=public'`,
  },
  {
    method: 'GET',
    path: '/api/pastes',
    description: 'Your own pastes, identified by the x-owner-id header.',
    example: `curl ${location.origin}/api/pastes -H 'x-owner-id: my-secret-owner-id-123'`,
  },
  {
    method: 'DELETE',
    path: '/api/pastes/:id',
    description: 'Delete a paste. Only works with the same x-owner-id used to create it.',
    example: `curl -X DELETE ${location.origin}/api/pastes/ID -H 'x-owner-id: my-secret-owner-id-123'`,
  },
];

export function ApiDocs() {
  return (
    <InfoPage title="RAW_API" subtitle="Use Pestle from your terminal or scripts">
      <p>
        Everything the web app does is available as a JSON API. Responses are JSON unless you request <code>?raw=1</code>.
        Errors return <code>{'{ "error": "..." }'}</code> with a 4xx/5xx status. <code>POST</code> requires{' '}
        <code>content-type: application/json</code>. Rate limits: 20 creates / 10&nbsp;min and 300 reads / min per IP.
      </p>
      {ENDPOINTS.map((e) => (
        <section key={e.method + e.path} className="border border-[#141414] bg-white">
          <div className="flex items-center gap-3 px-4 py-2 border-b border-[#141414] bg-[#f8f8f7]">
            <span className="px-2 py-0.5 bg-[#141414] text-[#E4E3E0] text-[10px] font-mono font-bold">{e.method}</span>
            <span className="font-mono text-xs font-bold break-all">{e.path}</span>
          </div>
          <p className="px-4 py-3 text-sm">{e.description}</p>
          <pre className="mx-4 mb-4 p-3 bg-[#141414] text-[#E4E3E0] text-[11px] font-mono overflow-x-auto">{e.example}</pre>
        </section>
      ))}
    </InfoPage>
  );
}

export function NotFound() {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
      <h2 className="text-6xl font-mono font-bold opacity-10">404_</h2>
      <p className="font-mono text-sm uppercase tracking-widest font-bold">ROUTE_NOT_FOUND</p>
      <Link
        to="/"
        className="px-6 py-2 border border-[#141414] text-[10px] font-mono uppercase tracking-widest hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors"
      >
        RETURN_TO_ROOT
      </Link>
    </div>
  );
}
