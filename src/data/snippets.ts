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
    description: 'Espera a que dejen de llamar a una función durante N ms antes de ejecutarla. Ideal para buscadores y para cuando se cambia el tamaño de la ventana.',
    language: 'javascript',
    tags: ['rendimiento', 'eventos'],
    code: `function debounce(fn, espera = 300) {
  let temporizador;
  return (...args) => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => fn(...args), espera);
  };
}

// Demo: solo se ejecuta la última llamada dentro de los 100 ms
const buscar = debounce((valor) => console.log('Buscando:', valor), 100);
buscar('p');
buscar('pe');
buscar('pes');
buscar('pestle'); // -> Buscando: pestle
`,
  },
  {
    id: 'throttle',
    title: 'Throttle',
    description: 'Ejecuta una función como máximo una vez cada N ms, por ejemplo al hacer scroll.',
    language: 'javascript',
    tags: ['rendimiento', 'eventos'],
    code: `function throttle(fn, limite = 200) {
  let ultima = 0;
  return (...args) => {
    const ahora = Date.now();
    if (ahora - ultima >= limite) {
      ultima = ahora;
      fn(...args);
    }
  };
}

const tic = throttle((i) => console.log('tic', i), 50);
let i = 0;
const id = setInterval(() => {
  tic(i++);
  if (i > 20) clearInterval(id);
}, 10);
`,
  },
  {
    id: 'deep-clone',
    title: 'Copia profunda',
    description: 'Copia objetos anidados, listas, fechas y Maps con structuredClone, que viene con el navegador.',
    language: 'javascript',
    tags: ['objetos'],
    code: `const original = {
  nombre: 'Pestle',
  creado: new Date('2024-01-01'),
  etiquetas: ['código', 'compartir'],
  datos: new Map([['visitas', 42]]),
};

const copia = structuredClone(original);
copia.etiquetas.push('copia');
copia.datos.set('visitas', 43);

console.log('etiquetas del original:', original.etiquetas);
console.log('etiquetas de la copia:', copia.etiquetas);
console.log('visitas del original:', original.datos.get('visitas'));
console.log('¿la fecha sigue siendo Date?', copia.creado instanceof Date);
`,
  },
  {
    id: 'group-by',
    title: 'Agrupar por',
    description: 'Agrupa una lista de objetos según una propiedad o una función.',
    language: 'javascript',
    tags: ['listas'],
    code: `function agruparPor(lista, clave) {
  const obtenerClave = typeof clave === 'function' ? clave : (item) => item[clave];
  return lista.reduce((grupos, item) => {
    const k = obtenerClave(item);
    (grupos[k] ||= []).push(item);
    return grupos;
  }, {});
}

const personas = [
  { nombre: 'Ana', ciudad: 'Rosario', edad: 31 },
  { nombre: 'Luis', ciudad: 'Córdoba', edad: 24 },
  { nombre: 'Sofi', ciudad: 'Rosario', edad: 17 },
];

console.log(agruparPor(personas, 'ciudad'));
console.log(agruparPor(personas, (p) => (p.edad >= 18 ? 'mayores' : 'menores')));
`,
  },
  {
    id: 'chunk',
    title: 'Partir una lista en grupos',
    description: 'Divide una lista en grupos de tamaño fijo (paginación, procesar de a tandas).',
    language: 'javascript',
    tags: ['listas'],
    code: `const partir = (lista, tamanio) =>
  Array.from({ length: Math.ceil(lista.length / tamanio) }, (_, i) =>
    lista.slice(i * tamanio, i * tamanio + tamanio)
  );

console.log(partir([1, 2, 3, 4, 5, 6, 7], 3)); // [[1,2,3],[4,5,6],[7]]
`,
  },
  {
    id: 'unique',
    title: 'Quitar repetidos',
    description: 'Saca los valores repetidos de una lista, y los objetos repetidos según una propiedad.',
    language: 'javascript',
    tags: ['listas'],
    code: `const sinRepetidos = (lista) => [...new Set(lista)];
const sinRepetidosPor = (lista, clave) => [...new Map(lista.map((x) => [x[clave], x])).values()];

console.log(sinRepetidos([1, 2, 2, 3, 3, 3]));
console.log(
  sinRepetidosPor(
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
    title: 'Memoización',
    description: 'Guarda los resultados de funciones puras para no recalcularlos. Ejemplo: Fibonacci(90) al instante.',
    language: 'javascript',
    tags: ['rendimiento', 'funciones'],
    code: `function memoizar(fn) {
  const cache = new Map();
  return function (n) {
    if (cache.has(n)) return cache.get(n);
    const resultado = fn.call(this, n);
    cache.set(n, resultado);
    return resultado;
  };
}

const fib = memoizar((n) => (n < 2 ? BigInt(n) : fib(n - 1) + fib(n - 2)));

console.log('fib(10) =', fib(10).toString());
console.log('fib(90) =', fib(90).toString());
`,
  },
  {
    id: 'retry',
    title: 'Reintentar con espera creciente',
    description: 'Reintenta una operación asíncrona esperando cada vez el doble (backoff exponencial).',
    language: 'javascript',
    tags: ['async', 'red'],
    code: `const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

async function reintentar(fn, { intentos = 3, espera = 100 } = {}) {
  for (let intento = 0; ; intento++) {
    try {
      return await fn(intento);
    } catch (err) {
      if (intento >= intentos) throw err;
      const ms = espera * 2 ** intento;
      console.log('falló el intento ' + (intento + 1) + ', reintento en ' + ms + ' ms');
      await dormir(ms);
    }
  }
}

// Demo: falla dos veces y a la tercera funciona
reintentar(async (intento) => {
  if (intento < 2) throw new Error('inestable');
  return 'funcionó en el intento ' + (intento + 1);
}).then(console.log);
`,
  },
  {
    id: 'fetch-timeout',
    title: 'Pedir JSON con tiempo límite',
    description: 'Una función sobre fetch() que cancela el pedido si tarda demasiado y avisa si el servidor responde con error.',
    language: 'javascript',
    tags: ['async', 'red'],
    code: `async function pedirJSON(url, { limite = 5000, ...opciones } = {}) {
  const res = await fetch(url, { ...opciones, signal: AbortSignal.timeout(limite) });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

pedirJSON('https://api.github.com/repos/facebook/react')
  .then((repo) => console.log(repo.full_name, '★', repo.stargazers_count))
  .catch((err) => console.error('Falló el pedido:', err.message));
`,
  },
  {
    id: 'format',
    title: 'Formatear plata, números y fechas',
    description: 'Formatos según el país con la API Intl que trae JavaScript, sin librerías.',
    language: 'javascript',
    tags: ['formatos', 'textos'],
    code: `const pesos = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
const dolares = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const compacto = new Intl.NumberFormat('es', { notation: 'compact' });
const fecha = new Intl.DateTimeFormat('es-AR', { dateStyle: 'full' });
const relativo = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

console.log(pesos.format(1234567.891));
console.log(dolares.format(1234567.891));
console.log(compacto.format(1234567));
console.log(fecha.format(new Date(2025, 11, 25)));
console.log(relativo.format(-1, 'day'), '/', relativo.format(3, 'week'));
`,
  },
  {
    id: 'slugify',
    title: 'Convertir un título en URL (slug)',
    description: 'Transforma cualquier título (con tildes y todo) en un texto seguro para usar en una URL.',
    language: 'javascript',
    tags: ['textos', 'slugify', 'url'],
    code: `const aSlug = (texto) =>
  texto
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

console.log(aSlug('¡Hola Mundo! Código en Acción 2025'));
console.log(aSlug('  Ñandú & Café con Leche  '));
`,
  },
  {
    id: 'validate-email',
    title: 'Validar email y contraseña',
    description: 'Validación práctica de formularios, con mensajes de error que ayudan.',
    language: 'javascript',
    tags: ['formularios', 'validación'],
    code: `const esEmail = (s) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(s);

function revisarClave(clave) {
  const faltan = [];
  if (clave.length < 8) faltan.push('al menos 8 caracteres');
  if (!/[A-Z]/.test(clave)) faltan.push('una mayúscula');
  if (!/[a-z]/.test(clave)) faltan.push('una minúscula');
  if (!/\\d/.test(clave)) faltan.push('un número');
  return faltan.length ? 'Le falta: ' + faltan.join(', ') : 'Contraseña segura';
}

console.log(esEmail('dev@pestle.app'), esEmail('esto-no-es-un-email'));
console.log(revisarClave('abc'));
console.log(revisarClave('Pestle2025'));
`,
  },
  {
    id: 'random-id',
    title: 'IDs al azar seguros y UUIDs',
    description: 'Identificadores criptográficamente seguros con la API Web Crypto.',
    language: 'javascript',
    tags: ['criptografía', 'textos'],
    code: `function idAlAzar(largo = 12) {
  const alfabeto = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = crypto.getRandomValues(new Uint8Array(largo));
  return Array.from(bytes, (b) => alfabeto[b % alfabeto.length]).join('');
}

console.log('uuid:', crypto.randomUUID());
console.log('id corto:', idAlAzar());
console.log('token:', idAlAzar(32));
`,
  },
  {
    id: 'sha256',
    title: 'Hash SHA-256',
    description: 'Calcula el hash de un texto en hexadecimal con SubtleCrypto (anda en el navegador y en Node 18+).',
    language: 'javascript',
    tags: ['criptografía'],
    code: `async function sha256(texto) {
  const datos = new TextEncoder().encode(texto);
  const resumen = await crypto.subtle.digest('SHA-256', datos);
  return Array.from(new Uint8Array(resumen), (b) => b.toString(16).padStart(2, '0')).join('');
}

sha256('hola mundo').then((hash) => console.log(hash));
// 0b894166d3336435c800bea36ff21b29eaa801a52f584c006c49289a0dcf6e2f
`,
  },
  {
    id: 'event-emitter',
    title: 'Emisor de eventos',
    description: 'Publicar y suscribirse en 15 líneas: on, off, once y emit.',
    language: 'javascript',
    tags: ['patrones', 'eventos'],
    code: `class Emisor {
  #oyentes = new Map();
  on(evento, fn) {
    if (!this.#oyentes.has(evento)) this.#oyentes.set(evento, new Set());
    this.#oyentes.get(evento).add(fn);
    return () => this.off(evento, fn);
  }
  off(evento, fn) {
    this.#oyentes.get(evento)?.delete(fn);
  }
  once(evento, fn) {
    const quitar = this.on(evento, (...args) => {
      quitar();
      fn(...args);
    });
  }
  emit(evento, ...args) {
    this.#oyentes.get(evento)?.forEach((fn) => fn(...args));
  }
}

const canal = new Emisor();
canal.on('publicado', (id) => console.log('nuevo código', id));
canal.once('publicado', () => console.log('(solo el primero)'));
canal.emit('publicado', 'abc123');
canal.emit('publicado', 'def456');
`,
  },
  {
    id: 'sort-by',
    title: 'Ordenar por varios campos',
    description: 'Orden estable por varias propiedades, cada una ascendente o descendente.',
    language: 'javascript',
    tags: ['listas'],
    code: `const ordenarPor = (...claves) => (a, b) => {
  for (const clave of claves) {
    const desc = clave.startsWith('-');
    const k = desc ? clave.slice(1) : clave;
    if (a[k] < b[k]) return desc ? 1 : -1;
    if (a[k] > b[k]) return desc ? -1 : 1;
  }
  return 0;
};

const tabla = [
  { equipo: 'Boca', pts: 30, dif: 12 },
  { equipo: 'River', pts: 32, dif: 15 },
  { equipo: 'Racing', pts: 30, dif: 18 },
];

console.log(tabla.sort(ordenarPor('-pts', '-dif')).map((f) => f.equipo)); // River, Racing, Boca
`,
  },
  {
    id: 'html-todo',
    title: 'Lista de tareas',
    description: 'Una app de tareas completa y sin dependencias: agregar, tachar y borrar.',
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
  li.hecha span { text-decoration: line-through; opacity: .5; }
  li span { flex: 1; cursor: pointer; }
  .borrar { background: transparent; color: #c00; border: none; }
</style>
</head>
<body>
  <h2>Tareas</h2>
  <form id="form">
    <input id="input" placeholder="¿Qué tenés que hacer?" autocomplete="off" />
    <button>Agregar</button>
  </form>
  <ul id="lista"></ul>
  <p id="cuenta"></p>

<script>
  const tareas = [{ texto: 'Compartir un código en Pestle', hecha: true }, { texto: 'Probar el ejecutor', hecha: false }];
  const lista = document.getElementById('lista');

  function mostrar() {
    lista.innerHTML = '';
    tareas.forEach((tarea, i) => {
      const li = document.createElement('li');
      li.className = tarea.hecha ? 'hecha' : '';
      const span = document.createElement('span');
      span.textContent = tarea.texto;
      span.onclick = () => { tarea.hecha = !tarea.hecha; mostrar(); };
      const borrar = document.createElement('button');
      borrar.className = 'borrar';
      borrar.textContent = '✕';
      borrar.onclick = () => { tareas.splice(i, 1); mostrar(); };
      li.append(span, borrar);
      lista.append(li);
    });
    const pendientes = tareas.filter(t => !t.hecha).length;
    document.getElementById('cuenta').textContent = 'Pendientes: ' + pendientes;
  }

  document.getElementById('form').onsubmit = (e) => {
    e.preventDefault();
    const input = document.getElementById('input');
    if (!input.value.trim()) return;
    tareas.push({ texto: input.value.trim(), hecha: false });
    input.value = '';
    mostrar();
  };

  mostrar();
</script>
</body>
</html>
`,
  },
  {
    id: 'html-counter',
    title: 'Contador interactivo',
    description: 'Un contador mínimo para ver cómo funcionan los eventos del DOM y el estado.',
    language: 'html',
    tags: ['dom', 'principiante'],
    code: `<div style="font-family: system-ui; text-align: center; padding: 32px">
  <h1 id="valor" style="font-size: 64px; margin: 0">0</h1>
  <button id="restar">−</button>
  <button id="reiniciar">reiniciar</button>
  <button id="sumar">+</button>
</div>

<script>
  let cuenta = 0;
  const valor = document.getElementById('valor');
  const actualizar = (n) => { cuenta = n; valor.textContent = cuenta; console.log('cuenta =', cuenta); };
  document.getElementById('sumar').onclick = () => actualizar(cuenta + 1);
  document.getElementById('restar').onclick = () => actualizar(cuenta - 1);
  document.getElementById('reiniciar').onclick = () => actualizar(0);
</script>
`,
  },
  {
    id: 'html-fetch-users',
    title: 'Traer datos de una API y mostrarlos',
    description: 'Carga usuarios de una API pública y los muestra como tarjetas, con estados de carga y de error.',
    language: 'html',
    tags: ['dom', 'red'],
    code: `<div id="app" style="font-family: system-ui; padding: 16px">Cargando…</div>

<script>
  const app = document.getElementById('app');

  fetch('https://jsonplaceholder.typicode.com/users')
    .then((res) => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then((usuarios) => {
      app.innerHTML = '';
      usuarios.slice(0, 6).forEach((u) => {
        const tarjeta = document.createElement('div');
        tarjeta.style.cssText = 'border:1px solid #141414;padding:12px;margin-bottom:8px';
        tarjeta.innerHTML = '<strong></strong><br><small></small>';
        tarjeta.querySelector('strong').textContent = u.name;
        tarjeta.querySelector('small').textContent = u.email + ' · ' + u.address.city;
        app.append(tarjeta);
      });
      console.log('Se cargaron', usuarios.length, 'usuarios');
    })
    .catch((err) => {
      app.textContent = 'No se pudieron cargar los usuarios: ' + err.message;
      console.error(err.message);
    });
</script>
`,
  },
  {
    id: 'css-center',
    title: 'Centrar cualquier cosa',
    description: 'Las dos formas modernas de centrar un elemento: grid y flexbox.',
    language: 'css',
    tags: ['diseño'],
    code: `.centrado-grid {
  display: grid;
  place-items: center;
  height: 140px;
  background: #E4E3E0;
  margin-bottom: 12px;
}

.centrado-flex {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 140px;
  background: #141414;
  color: #E4E3E0;
}
`,
    demo: `<div class="centrado-grid"><div>Centrado con grid</div></div>
<div class="centrado-flex"><div>Centrado con flexbox</div></div>`,
  },
  {
    id: 'css-loader',
    title: 'Ruedita de carga en CSS',
    description: 'Un indicador de carga hecho solo con CSS, sin imágenes ni JavaScript.',
    language: 'css',
    tags: ['animación'],
    code: `.ruedita {
  width: 48px;
  height: 48px;
  border: 5px solid #E4E3E0;
  border-top-color: #141414;
  border-radius: 50%;
  animation: girar 0.8s linear infinite;
  margin: 40px auto;
}

@keyframes girar {
  to { transform: rotate(360deg); }
}
`,
    demo: `<div class="ruedita"></div>`,
  },
  {
    id: 'css-responsive-grid',
    title: 'Grilla de tarjetas adaptable',
    description: 'Una grilla que acomoda las tarjetas sola según el ancho, sin media queries.',
    language: 'css',
    tags: ['diseño', 'responsive'],
    code: `.tarjetas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  font-family: system-ui, sans-serif;
}

.tarjeta {
  border: 1px solid #141414;
  padding: 16px;
  box-shadow: 4px 4px 0 #141414;
  background: white;
}
`,
    demo: `<div class="tarjetas">
  <div class="tarjeta">Uno</div><div class="tarjeta">Dos</div><div class="tarjeta">Tres</div>
  <div class="tarjeta">Cuatro</div><div class="tarjeta">Cinco</div>
</div>`,
  },
  {
    id: 'ts-result',
    title: 'Resultado tipado (Result)',
    description: 'Manejá errores sin llenar todo de try/catch, con tipos de TypeScript.',
    language: 'typescript',
    tags: ['tipos', 'errores'],
    code: `type Resultado<T, E = Error> = { ok: true; valor: T } | { ok: false; error: E };

async function intentar<T>(fn: () => Promise<T>): Promise<Resultado<T>> {
  try {
    return { ok: true, valor: await fn() };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
}

// Uso
const resultado = await intentar(() => fetch('/api/health').then((r) => r.json()));
if (resultado.ok) {
  console.log('Funciona:', resultado.valor);
} else {
  console.error('Falló:', resultado.error.message);
}
`,
  },
  {
    id: 'ts-use-local-storage',
    title: 'Hook de React useLocalStorage',
    description: 'Un useState que se guarda en localStorage y sobrevive a las recargas.',
    language: 'typescript',
    tags: ['react', 'hooks'],
    code: `import { useEffect, useState } from 'react';

export function useLocalStorage<T>(clave: string, inicial: T) {
  const [valor, setValor] = useState<T>(() => {
    try {
      const guardado = localStorage.getItem(clave);
      return guardado !== null ? (JSON.parse(guardado) as T) : inicial;
    } catch {
      return inicial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
    } catch {
      // almacenamiento lleno o bloqueado: queda el valor en memoria
    }
  }, [clave, valor]);

  return [valor, setValor] as const;
}

// const [tema, setTema] = useLocalStorage('tema', 'claro');
`,
  },
  {
    id: 'py-fastapi',
    runLocally: 'pip install fastapi uvicorn && uvicorn main:app --reload',
    title: 'API REST con FastAPI',
    description: 'Una API completa (crear, listar y borrar) en un solo archivo, con validación y los códigos de estado correctos.',
    language: 'python',
    tags: ['api', 'backend'],
    code: `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()


class Producto(BaseModel):
    nombre: str
    precio: float


productos: dict[int, Producto] = {}


@app.get("/productos")
def listar_productos():
    return productos


@app.post("/productos/{producto_id}", status_code=201)
def crear_producto(producto_id: int, producto: Producto):
    if producto_id in productos:
        raise HTTPException(409, "Ese producto ya existe")
    productos[producto_id] = producto
    return producto


@app.delete("/productos/{producto_id}", status_code=204)
def borrar_producto(producto_id: int):
    if productos.pop(producto_id, None) is None:
        raise HTTPException(404, "No existe ese producto")
`,
  },
  {
    id: 'py-csv',
    title: 'Resumir un archivo CSV',
    description: 'Lee un CSV y suma una columna por grupo, usando solo la biblioteca estándar.',
    language: 'python',
    tags: ['datos', 'archivos'],
    code: `import csv
import io
from collections import defaultdict

# Para un archivo de verdad, cambiá io.StringIO(...) por open("ventas.csv", newline="")
datos = io.StringIO("""region,producto,monto
Norte,Lapiceras,120.5
Sur,Lapiceras,80
Norte,Papel,45.25
Sur,Papel,99.9
""")

totales = defaultdict(float)
for fila in csv.DictReader(datos):
    totales[fila["region"]] += float(fila["monto"])

for region, total in sorted(totales.items()):
    print(f"{region:<6} {total:>8.2f}")
`,
  },
  {
    id: 'py-scraper',
    runLocally: 'python scraper.py',
    title: 'Obtener el título de una página web',
    description: 'Descarga una página y saca su <title> usando solo la biblioteca estándar.',
    language: 'python',
    tags: ['red', 'scraping'],
    code: `from html.parser import HTMLParser
from urllib.request import Request, urlopen


class LectorDeTitulo(HTMLParser):
    def __init__(self):
        super().__init__()
        self.en_titulo = False
        self.titulo = ""

    def handle_starttag(self, tag, attrs):
        self.en_titulo = tag == "title"

    def handle_endtag(self, tag):
        if tag == "title":
            self.en_titulo = False

    def handle_data(self, data):
        if self.en_titulo:
            self.titulo += data


pedido = Request("https://example.com", headers={"User-Agent": "Mozilla/5.0"})
with urlopen(pedido, timeout=10) as respuesta:
    lector = LectorDeTitulo()
    lector.feed(respuesta.read().decode("utf-8", errors="replace"))

print("Título:", lector.titulo.strip())
`,
  },
  {
    id: 'json-vercel',
    title: 'vercel.json para una SPA',
    description: 'Publicá una app de una sola página en Vercel, con rutas de API y caché larga para los archivos estáticos.',
    language: 'json',
    tags: ['configuración', 'deploy'],
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
    title: 'Plantilla de README',
    description: 'Una estructura prolija de README para cualquier proyecto.',
    language: 'markdown',
    tags: ['documentación'],
    code: `# Nombre del proyecto

Una oración sobre qué hace este proyecto y para quién es.

## Funciones

- Función uno
- Función dos

## Cómo empezar

\`\`\`bash
npm install
npm run dev
\`\`\`

## Configuración

| Variable | Descripción | Valor por defecto |
| --- | --- | --- |
| \`PORT\` | Puerto donde escucha | \`3000\` |

## Licencia

MIT
`,
  },
];

export { RUNNABLE_LANGUAGES, isRunnable } from '../lib/runnable';
