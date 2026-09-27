import { Language } from '../types';

export interface Snippet {
  id: string;
  title: string;
  description: string;
  language: Language;
  tags: string[];
  code: string;
  /** Markup rendered under a CSS snippet when previewing it. */
  demo?: string;
  /** Set when the snippet needs a real machine (servers, sockets): shows how to run it locally instead. */
  runLocally?: string;
}

/**
 * Curated, working snippets. Every JavaScript / Python / HTML / CSS entry runs as-is in the
 * in-browser runner and prints (or renders) its result, except those marked `runLocally`.
 */
export const SNIPPETS: Snippet[] = [
  {
    id: 'debounce',
    title: 'Debounce',
    description: 'Delay a function until calls stop for N ms. Ideal for search inputs and resize handlers.',
    language: 'javascript',
    tags: ['performance', 'events'],
    code: `function debounce(fn, wait = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

// Demo: only the last call within 100ms runs
const log = debounce((value) => console.log('Search for:', value), 100);
log('p');
log('pe');
log('pes');
log('pestle'); // -> Search for: pestle
`,
  },
  {
    id: 'throttle',
    title: 'Throttle',
    description: 'Run a function at most once every N ms, e.g. for scroll listeners.',
    language: 'javascript',
    tags: ['performance', 'events'],
    code: `function throttle(fn, limit = 200) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= limit) {
      last = now;
      fn(...args);
    }
  };
}

const tick = throttle((i) => console.log('tick', i), 50);
let i = 0;
const id = setInterval(() => {
  tick(i++);
  if (i > 20) clearInterval(id);
}, 10);
`,
  },
  {
    id: 'deep-clone',
    title: 'Deep clone',
    description: 'Copy nested objects, arrays, dates and maps with the native structuredClone.',
    language: 'javascript',
    tags: ['objects'],
    code: `const original = {
  name: 'Pestle',
  created: new Date('2024-01-01'),
  tags: ['code', 'share'],
  meta: new Map([['views', 42]]),
};

const copy = structuredClone(original);
copy.tags.push('clone');
copy.meta.set('views', 43);

console.log('original tags:', original.tags);
console.log('copy tags:', copy.tags);
console.log('original views:', original.meta.get('views'));
console.log('date preserved:', copy.created instanceof Date);
`,
  },
  {
    id: 'group-by',
    title: 'Group by',
    description: 'Group an array of objects by a key or by a function.',
    language: 'javascript',
    tags: ['arrays'],
    code: `function groupBy(list, key) {
  const getKey = typeof key === 'function' ? key : (item) => item[key];
  return list.reduce((acc, item) => {
    const k = getKey(item);
    (acc[k] ||= []).push(item);
    return acc;
  }, {});
}

const people = [
  { name: 'Ana', city: 'Rosario', age: 31 },
  { name: 'Luis', city: 'Córdoba', age: 24 },
  { name: 'Sofi', city: 'Rosario', age: 19 },
];

console.log(groupBy(people, 'city'));
console.log(groupBy(people, (p) => (p.age >= 21 ? 'adult' : 'young')));
`,
  },
  {
    id: 'chunk',
    title: 'Chunk array',
    description: 'Split an array into groups of a fixed size (pagination, batching).',
    language: 'javascript',
    tags: ['arrays'],
    code: `const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

console.log(chunk([1, 2, 3, 4, 5, 6, 7], 3)); // [[1,2,3],[4,5,6],[7]]
`,
  },
  {
    id: 'unique',
    title: 'Unique values & objects',
    description: 'Remove duplicates from primitive arrays and from arrays of objects by key.',
    language: 'javascript',
    tags: ['arrays'],
    code: `const unique = (arr) => [...new Set(arr)];
const uniqueBy = (arr, key) => [...new Map(arr.map((x) => [x[key], x])).values()];

console.log(unique([1, 2, 2, 3, 3, 3]));
console.log(
  uniqueBy(
    [
      { id: 1, n: 'a' },
      { id: 2, n: 'b' },
      { id: 1, n: 'c' },
    ],
    'id'
  )
);
`,
  },
  {
    id: 'memo-fib',
    title: 'Memoize',
    description: 'Cache results of pure functions. Shown with an instant Fibonacci(90).',
    language: 'javascript',
    tags: ['performance', 'functions'],
    code: `function memoize(fn) {
  const cache = new Map();
  return function (n) {
    if (cache.has(n)) return cache.get(n);
    const result = fn.call(this, n);
    cache.set(n, result);
    return result;
  };
}

const fib = memoize((n) => (n < 2 ? BigInt(n) : fib(n - 1) + fib(n - 2)));

console.log('fib(10) =', fib(10).toString());
console.log('fib(90) =', fib(90).toString());
`,
  },
  {
    id: 'retry',
    title: 'Retry with backoff',
    description: 'Retry an async operation with exponential backoff.',
    language: 'javascript',
    tags: ['async', 'network'],
    code: `const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function retry(fn, { retries = 3, delay = 100 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      if (attempt >= retries) throw err;
      const wait = delay * 2 ** attempt;
      console.log('attempt ' + (attempt + 1) + ' failed, retrying in ' + wait + 'ms');
      await sleep(wait);
    }
  }
}

// Demo: fails twice, then succeeds
retry(async (attempt) => {
  if (attempt < 2) throw new Error('flaky');
  return 'success on attempt ' + (attempt + 1);
}).then(console.log);
`,
  },
  {
    id: 'fetch-timeout',
    title: 'Fetch JSON with timeout',
    description: 'fetch() wrapper that aborts after a timeout and throws on HTTP errors.',
    language: 'javascript',
    tags: ['async', 'network'],
    code: `async function fetchJSON(url, { timeout = 5000, ...options } = {}) {
  const res = await fetch(url, { ...options, signal: AbortSignal.timeout(timeout) });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

fetchJSON('https://api.github.com/repos/facebook/react')
  .then((repo) => console.log(repo.full_name, '★', repo.stargazers_count))
  .catch((err) => console.error('Request failed:', err.message));
`,
  },
  {
    id: 'format',
    title: 'Format money, numbers & dates',
    description: 'Locale-aware formatting with the built-in Intl API — no libraries.',
    language: 'javascript',
    tags: ['i18n', 'strings'],
    code: `const ars = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const compact = new Intl.NumberFormat('en', { notation: 'compact' });
const date = new Intl.DateTimeFormat('es-AR', { dateStyle: 'full' });
const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

console.log(ars.format(1234567.891));
console.log(usd.format(1234567.891));
console.log(compact.format(1234567));
console.log(date.format(new Date(2025, 11, 25)));
console.log(rtf.format(-1, 'day'), '/', rtf.format(3, 'week'));
`,
  },
  {
    id: 'slugify',
    title: 'Slugify',
    description: 'Turn any title (accents included) into a URL-safe slug.',
    language: 'javascript',
    tags: ['strings'],
    code: `const slugify = (text) =>
  text
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

console.log(slugify('¡Hola Mundo! Código en Acción 2025'));
console.log(slugify('  Crème Brûlée & Café  '));
`,
  },
  {
    id: 'validate-email',
    title: 'Validate email & password',
    description: 'Practical form validation with helpful error messages.',
    language: 'javascript',
    tags: ['forms', 'validation'],
    code: `const isEmail = (s) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(s);

function checkPassword(pw) {
  const errors = [];
  if (pw.length < 8) errors.push('at least 8 characters');
  if (!/[A-Z]/.test(pw)) errors.push('an uppercase letter');
  if (!/[a-z]/.test(pw)) errors.push('a lowercase letter');
  if (!/\\d/.test(pw)) errors.push('a number');
  return errors.length ? 'Needs ' + errors.join(', ') : 'Strong password';
}

console.log(isEmail('dev@pestle.app'), isEmail('not-an-email'));
console.log(checkPassword('abc'));
console.log(checkPassword('Pestle2025'));
`,
  },
  {
    id: 'random-id',
    title: 'Secure random IDs & UUIDs',
    description: 'Cryptographically secure IDs using the Web Crypto API.',
    language: 'javascript',
    tags: ['crypto', 'strings'],
    code: `function randomId(length = 12) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

console.log('uuid:', crypto.randomUUID());
console.log('short id:', randomId());
console.log('token:', randomId(32));
`,
  },
  {
    id: 'sha256',
    title: 'SHA-256 hash',
    description: 'Hash a string to hex with SubtleCrypto (works in browsers and Node 18+).',
    language: 'javascript',
    tags: ['crypto'],
    code: `async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

sha256('hello world').then((hash) => console.log(hash));
// b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
`,
  },
  {
    id: 'event-emitter',
    title: 'Tiny event emitter',
    description: 'Pub/sub in 15 lines: on, off, once and emit.',
    language: 'javascript',
    tags: ['patterns', 'events'],
    code: `class Emitter {
  #handlers = new Map();
  on(event, fn) {
    if (!this.#handlers.has(event)) this.#handlers.set(event, new Set());
    this.#handlers.get(event).add(fn);
    return () => this.off(event, fn);
  }
  off(event, fn) {
    this.#handlers.get(event)?.delete(fn);
  }
  once(event, fn) {
    const off = this.on(event, (...args) => {
      off();
      fn(...args);
    });
  }
  emit(event, ...args) {
    this.#handlers.get(event)?.forEach((fn) => fn(...args));
  }
}

const bus = new Emitter();
bus.on('paste', (id) => console.log('new paste', id));
bus.once('paste', () => console.log('(first paste only)'));
bus.emit('paste', 'abc123');
bus.emit('paste', 'def456');
`,
  },
  {
    id: 'sort-by',
    title: 'Sort by multiple fields',
    description: 'Stable multi-key sort, with per-key ascending/descending order.',
    language: 'javascript',
    tags: ['arrays'],
    code: `const sortBy = (...keys) => (a, b) => {
  for (const key of keys) {
    const desc = key.startsWith('-');
    const k = desc ? key.slice(1) : key;
    if (a[k] < b[k]) return desc ? 1 : -1;
    if (a[k] > b[k]) return desc ? -1 : 1;
  }
  return 0;
};

const scores = [
  { team: 'Boca', pts: 30, gd: 12 },
  { team: 'River', pts: 32, gd: 15 },
  { team: 'Racing', pts: 30, gd: 18 },
];

console.log(scores.sort(sortBy('-pts', '-gd')).map((s) => s.team)); // River, Racing, Boca
`,
  },
  {
    id: 'html-todo',
    title: 'To-do list app',
    description: 'A complete, dependency-free to-do app with add, toggle and delete.',
    language: 'html',
    tags: ['app', 'dom'],
    code: `<!doctype html>
<html>
<head>
<style>
  body { font-family: system-ui, sans-serif; max-width: 420px; margin: 24px auto; padding: 0 16px; }
  form { display: flex; gap: 8px; }
  input { flex: 1; padding: 8px; border: 1px solid #141414; }
  button { padding: 8px 12px; border: 1px solid #141414; background: #141414; color: #fff; cursor: pointer; }
  ul { list-style: none; padding: 0; }
  li { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #ddd; }
  li.done span { text-decoration: line-through; opacity: .5; }
  li span { flex: 1; cursor: pointer; }
  .del { background: transparent; color: #c00; border: none; }
</style>
</head>
<body>
  <h2>To-do</h2>
  <form id="form">
    <input id="input" placeholder="What needs doing?" autocomplete="off" />
    <button>Add</button>
  </form>
  <ul id="list"></ul>
  <p id="count"></p>

<script>
  const todos = [{ text: 'Share a snippet on Pestle', done: true }, { text: 'Try the runner', done: false }];
  const list = document.getElementById('list');

  function render() {
    list.innerHTML = '';
    todos.forEach((todo, i) => {
      const li = document.createElement('li');
      li.className = todo.done ? 'done' : '';
      const span = document.createElement('span');
      span.textContent = todo.text;
      span.onclick = () => { todo.done = !todo.done; render(); };
      const del = document.createElement('button');
      del.className = 'del';
      del.textContent = '✕';
      del.onclick = () => { todos.splice(i, 1); render(); };
      li.append(span, del);
      list.append(li);
    });
    const left = todos.filter(t => !t.done).length;
    document.getElementById('count').textContent = left + ' item(s) left';
  }

  document.getElementById('form').onsubmit = (e) => {
    e.preventDefault();
    const input = document.getElementById('input');
    if (!input.value.trim()) return;
    todos.push({ text: input.value.trim(), done: false });
    input.value = '';
    render();
  };

  render();
</script>
</body>
</html>
`,
  },
  {
    id: 'html-counter',
    title: 'Interactive counter',
    description: 'Minimal interactive counter showing DOM events and state.',
    language: 'html',
    tags: ['dom', 'beginner'],
    code: `<div style="font-family: system-ui; text-align: center; padding: 32px">
  <h1 id="value" style="font-size: 64px; margin: 0">0</h1>
  <button id="dec">−</button>
  <button id="reset">reset</button>
  <button id="inc">+</button>
</div>

<script>
  let count = 0;
  const value = document.getElementById('value');
  const update = (n) => { count = n; value.textContent = count; console.log('count =', count); };
  document.getElementById('inc').onclick = () => update(count + 1);
  document.getElementById('dec').onclick = () => update(count - 1);
  document.getElementById('reset').onclick = () => update(0);
</script>
`,
  },
  {
    id: 'html-fetch-users',
    title: 'Fetch & render API data',
    description: 'Load users from a public API and render them as cards, with loading and error states.',
    language: 'html',
    tags: ['dom', 'network'],
    code: `<div id="app" style="font-family: system-ui; padding: 16px">Loading…</div>

<script>
  const app = document.getElementById('app');

  fetch('https://jsonplaceholder.typicode.com/users')
    .then((res) => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then((users) => {
      app.innerHTML = '';
      users.slice(0, 6).forEach((u) => {
        const card = document.createElement('div');
        card.style.cssText = 'border:1px solid #141414;padding:12px;margin-bottom:8px';
        card.innerHTML = '<strong></strong><br><small></small>';
        card.querySelector('strong').textContent = u.name;
        card.querySelector('small').textContent = u.email + ' · ' + u.address.city;
        app.append(card);
      });
      console.log('Loaded', users.length, 'users');
    })
    .catch((err) => {
      app.textContent = 'Could not load users: ' + err.message;
      console.error(err.message);
    });
</script>
`,
  },
  {
    id: 'css-center',
    title: 'Center anything',
    description: 'The two modern ways to center an element: grid and flexbox.',
    language: 'css',
    tags: ['layout'],
    code: `.grid-center {
  display: grid;
  place-items: center;
  height: 140px;
  background: #E4E3E0;
  margin-bottom: 12px;
}

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 140px;
  background: #141414;
  color: #E4E3E0;
}
`,
    demo: `<div class="grid-center"><div>Centered with grid</div></div>
<div class="flex-center"><div>Centered with flexbox</div></div>`,
  },
  {
    id: 'css-loader',
    title: 'CSS spinner',
    description: 'A pure-CSS loading spinner, no images or JS.',
    language: 'css',
    tags: ['animation'],
    code: `.spinner {
  width: 48px;
  height: 48px;
  border: 5px solid #E4E3E0;
  border-top-color: #141414;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 40px auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
`,
    demo: `<div class="spinner"></div>`,
  },
  {
    id: 'css-responsive-grid',
    title: 'Responsive card grid',
    description: 'Auto-fitting grid that reflows cards without media queries.',
    language: 'css',
    tags: ['layout', 'responsive'],
    code: `.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  font-family: system-ui, sans-serif;
}

.card {
  border: 1px solid #141414;
  padding: 16px;
  box-shadow: 4px 4px 0 #141414;
  background: white;
}
`,
    demo: `<div class="cards">
  <div class="card">One</div><div class="card">Two</div><div class="card">Three</div>
  <div class="card">Four</div><div class="card">Five</div>
</div>`,
  },
  {
    id: 'ts-result',
    title: 'Typed Result helper',
    description: 'Handle errors without try/catch everywhere, fully typed.',
    language: 'typescript',
    tags: ['types', 'errors'],
    code: `type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

async function attempt<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, value: await fn() };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
}

// Usage
const result = await attempt(() => fetch('/api/health').then((r) => r.json()));
if (result.ok) {
  console.log('Healthy:', result.value);
} else {
  console.error('Failed:', result.error.message);
}
`,
  },
  {
    id: 'ts-use-local-storage',
    title: 'React useLocalStorage hook',
    description: 'useState that persists to localStorage and survives reloads.',
    language: 'typescript',
    tags: ['react', 'hooks'],
    code: `import { useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage full or unavailable: keep in-memory value
    }
  }, [key, value]);

  return [value, setValue] as const;
}

// const [theme, setTheme] = useLocalStorage('theme', 'light');
`,
  },
  {
    id: 'py-fastapi',
    runLocally: 'pip install fastapi uvicorn && uvicorn main:app --reload',
    title: 'FastAPI REST API',
    description: 'A working CRUD API in one file, with validation and proper status codes.',
    language: 'python',
    tags: ['api', 'backend'],
    code: `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()


class Item(BaseModel):
    name: str
    price: float


items: dict[int, Item] = {}


@app.get("/items")
def list_items():
    return items


@app.post("/items/{item_id}", status_code=201)
def create_item(item_id: int, item: Item):
    if item_id in items:
        raise HTTPException(409, "Item already exists")
    items[item_id] = item
    return item


@app.delete("/items/{item_id}", status_code=204)
def delete_item(item_id: int):
    if items.pop(item_id, None) is None:
        raise HTTPException(404, "Item not found")
`,
  },
  {
    id: 'py-csv',
    title: 'Summarize a CSV file',
    description: 'Read a CSV and total a column per group using only the standard library.',
    language: 'python',
    tags: ['data', 'files'],
    code: `import csv
import io
from collections import defaultdict

# Replace io.StringIO(...) with open("sales.csv", newline="") for a real file
data = io.StringIO("""region,product,amount
North,Pens,120.5
South,Pens,80
North,Paper,45.25
South,Paper,99.9
""")

totals = defaultdict(float)
for row in csv.DictReader(data):
    totals[row["region"]] += float(row["amount"])

for region, total in sorted(totals.items()):
    print(f"{region:<6} {total:>8.2f}")
`,
  },
  {
    id: 'py-scraper',
    runLocally: 'python scraper.py',
    title: 'Fetch a web page title',
    description: 'Download a page and extract its <title> with only the standard library.',
    language: 'python',
    tags: ['network', 'scraping'],
    code: `from html.parser import HTMLParser
from urllib.request import Request, urlopen


class TitleParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_title = False
        self.title = ""

    def handle_starttag(self, tag, attrs):
        self.in_title = tag == "title"

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False

    def handle_data(self, data):
        if self.in_title:
            self.title += data


req = Request("https://example.com", headers={"User-Agent": "Mozilla/5.0"})
with urlopen(req, timeout=10) as res:
    parser = TitleParser()
    parser.feed(res.read().decode("utf-8", errors="replace"))

print("Title:", parser.title.strip())
`,
  },
  {
    id: 'json-vercel',
    title: 'vercel.json for SPAs',
    description: 'Serve a single-page app on Vercel with API routes and long-lived asset caching.',
    language: 'json',
    tags: ['config', 'deploy'],
    code: `{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
`,
  },
  {
    id: 'md-readme',
    title: 'README template',
    description: 'A clean README structure for any project.',
    language: 'markdown',
    tags: ['docs'],
    code: `# Project Name

One sentence about what this project does and who it is for.

## Features

- Feature one
- Feature two

## Getting started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Configuration

| Variable | Description | Default |
| --- | --- | --- |
| \`PORT\` | Port to listen on | \`3000\` |

## License

MIT
`,
  },
];

export { RUNNABLE_LANGUAGES, isRunnable } from '../lib/runnable';
