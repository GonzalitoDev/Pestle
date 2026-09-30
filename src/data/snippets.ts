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
 * Curated, working Python examples. Every entry runs as-is in the in-browser runner (Pyodide) and
 * prints its result, except those marked `runLocally`.
 */
export const SNIPPETS: Snippet[] = [
  {
    id: 'hola-fstrings',
    title: 'Hola mundo con f-strings',
    description: 'Mostrar textos con variables adentro, números con decimales y columnas alineadas.',
    language: 'python',
    tags: ['principiante', 'textos'],
    code: `nombre = "Ana"
edad = 17
precio = 1234.5

print(f"Hola, {nombre}. Tenés {edad} años.")
print(f"El año que viene vas a tener {edad + 1}.")
print(f"Precio: $ {precio:,.2f}")        # 2 decimales y separador de miles
print(f"{'Producto':<10}|{'Precio':>8}")  # < izquierda, > derecha
print(f"{'Yerba':<10}|{2500:>8}")
`,
  },
  {
    id: 'adivina-numero',
    title: 'Adiviná el número (búsqueda binaria)',
    description: 'La computadora adivina un número del 1 al 100 en pocos intentos, partiendo el rango a la mitad.',
    language: 'python',
    tags: ['juegos', 'algoritmos'],
    code: `import random

secreto = random.randint(1, 100)
bajo, alto = 1, 100
intentos = 0

while True:
    intentos += 1
    intento = (bajo + alto) // 2
    if intento == secreto:
        print(f"¡Es el {intento}! Lo adiviné en {intentos} intentos.")
        break
    elif intento < secreto:
        print(f"{intento}: es más grande")
        bajo = intento + 1
    else:
        print(f"{intento}: es más chico")
        alto = intento - 1
`,
  },
  {
    id: 'calculadora-imc',
    title: 'Calculadora de IMC',
    description: 'Funciones con varios parámetros, redondeo y decisiones con if/elif/else.',
    language: 'python',
    tags: ['funciones', 'principiante'],
    code: `def imc(peso_kg, altura_m):
    return peso_kg / altura_m ** 2


def categoria(valor):
    if valor < 18.5:
        return "bajo peso"
    elif valor < 25:
        return "peso saludable"
    elif valor < 30:
        return "sobrepeso"
    return "obesidad"


for peso, altura in [(55, 1.70), (72, 1.75), (95, 1.80)]:
    valor = imc(peso, altura)
    print(f"{peso} kg, {altura} m → IMC {valor:.1f} ({categoria(valor)})")
`,
  },
  {
    id: 'tabla-multiplicar',
    title: 'Tabla de multiplicar',
    description: 'Dos bucles for, uno dentro del otro, para armar una tabla prolija.',
    language: 'python',
    tags: ['bucles', 'principiante'],
    code: `n = 6
print("    " + "".join(f"{i:>4}" for i in range(1, n + 1)))
print("    " + "-" * 4 * n)
for fila in range(1, n + 1):
    celdas = "".join(f"{fila * col:>4}" for col in range(1, n + 1))
    print(f"{fila:>2} |{celdas}")
`,
  },
  {
    id: 'contar-palabras',
    title: 'Contar palabras de un texto',
    description: 'Limpiar un texto, separarlo en palabras y contar las más repetidas con Counter.',
    language: 'python',
    tags: ['textos', 'diccionarios'],
    code: `from collections import Counter
import string

texto = """
Python es simple. Python es poderoso.
Con Python podés automatizar tareas, analizar datos y crear juegos.
"""

limpio = texto.lower().translate(str.maketrans("", "", string.punctuation))
palabras = limpio.split()
conteo = Counter(palabras)

print(f"Palabras: {len(palabras)} ({len(conteo)} distintas)")
for palabra, veces in conteo.most_common(3):
    print(f"  {palabra}: {veces}")
`,
  },
  {
    id: 'palindromos',
    title: 'Detectar palíndromos',
    description: 'Normalizar tildes y espacios para saber si una frase se lee igual al derecho y al revés.',
    language: 'python',
    tags: ['textos'],
    code: `import unicodedata


def normalizar(texto):
    sin_tildes = unicodedata.normalize("NFD", texto)
    return "".join(c for c in sin_tildes.lower() if c.isalnum())


def es_palindromo(texto):
    limpio = normalizar(texto)
    return limpio == limpio[::-1]   # [::-1] da vuelta el texto


for frase in ["Neuquén", "Anita lava la tina", "Hola mundo", "Yo hago yoga hoy"]:
    print(f"{frase!r}: {es_palindromo(frase)}")
`,
  },
  {
    id: 'primos',
    title: 'Números primos (criba de Eratóstenes)',
    description: 'Un algoritmo clásico y rápido para encontrar todos los primos hasta un número.',
    language: 'python',
    tags: ['algoritmos', 'matemática'],
    code: `def primos_hasta(n):
    es_primo = [True] * (n + 1)
    es_primo[0] = es_primo[1] = False
    for i in range(2, int(n ** 0.5) + 1):
        if es_primo[i]:
            for multiplo in range(i * i, n + 1, i):
                es_primo[multiplo] = False
    return [i for i, primo in enumerate(es_primo) if primo]


print(primos_hasta(50))
print("Primos menores a un millón:", len(primos_hasta(1_000_000)))
`,
  },
  {
    id: 'fibonacci-generador',
    title: 'Fibonacci con un generador',
    description: 'Un generador infinito con yield y cómo tomar solo los primeros valores con islice.',
    language: 'python',
    tags: ['generadores', 'matemática'],
    code: `from itertools import islice


def fibonacci():
    a, b = 0, 1
    while True:        # infinito: yield entrega un valor por vez
        yield a
        a, b = b, a + b


print(list(islice(fibonacci(), 15)))
print("El número 100:", next(islice(fibonacci(), 100, None)))
`,
  },
  {
    id: 'lista-compras',
    title: 'Lista de compras con totales',
    description: 'Listas de diccionarios, sumas, el más caro con max() y ordenar con sorted().',
    language: 'python',
    tags: ['listas', 'diccionarios'],
    code: `compras = [
    {"producto": "Yerba", "precio": 2500, "cantidad": 2},
    {"producto": "Pan", "precio": 1200, "cantidad": 1},
    {"producto": "Leche", "precio": 1100, "cantidad": 3},
    {"producto": "Dulce de leche", "precio": 3200, "cantidad": 1},
]

for item in compras:
    item["subtotal"] = item["precio"] * item["cantidad"]

total = sum(item["subtotal"] for item in compras)
mas_caro = max(compras, key=lambda item: item["subtotal"])

for item in sorted(compras, key=lambda item: item["subtotal"], reverse=True):
    print(f"{item['producto']:<15} {item['cantidad']} x {item['precio']:>5} = {item['subtotal']:>6}")
print(f"{'TOTAL':<15} {total:>22}")
print("Lo que más gastaste:", mas_caro["producto"])
`,
  },
  {
    id: 'fechas',
    title: 'Fechas: cuántos días faltan',
    description: 'Crear fechas, restarlas, sumar días con timedelta y mostrarlas en formato argentino.',
    language: 'python',
    tags: ['fechas', 'módulos'],
    code: `from datetime import date, timedelta

hoy = date(2025, 3, 10)                    # usá date.today() para la fecha real
vacaciones = date(2025, 7, 14)

faltan = vacaciones - hoy
print(f"Faltan {faltan.days} días para las vacaciones")
print("En 100 días va a ser:", (hoy + timedelta(days=100)).strftime("%d/%m/%Y"))

dias = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
print("El 9/7/2025 cae", dias[date(2025, 7, 9).weekday()])
`,
  },
  {
    id: 'json',
    title: 'Leer y escribir JSON',
    description: 'Convertir datos de Python a texto JSON y al revés, como hacen las APIs.',
    language: 'python',
    tags: ['datos', 'json'],
    code: `import json

alumno = {"nombre": "Luis", "notas": [8, 9, 7], "activo": True, "apodo": None}

texto = json.dumps(alumno, ensure_ascii=False, indent=2)
print(texto)                       # True → true, None → null

de_vuelta = json.loads(texto)
promedio = sum(de_vuelta["notas"]) / len(de_vuelta["notas"])
print(f"Promedio de {de_vuelta['nombre']}: {promedio:.2f}")
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
    id: 'archivos',
    title: 'Guardar y leer un archivo de texto',
    description: 'Escribir líneas en un archivo con with open(...) y volver a leerlas.',
    language: 'python',
    tags: ['archivos'],
    code: `tareas = ["Estudiar Python", "Hacer el proyecto final", "Pedir el certificado"]

with open("tareas.txt", "w", encoding="utf-8") as archivo:
    for tarea in tareas:
        archivo.write(tarea + "\\n")

with open("tareas.txt", encoding="utf-8") as archivo:
    for numero, linea in enumerate(archivo, start=1):
        print(f"{numero}. {linea.strip()}")
`,
  },
  {
    id: 'clase-cuenta',
    title: 'Clase: cuenta bancaria',
    description: 'Una clase con atributos, métodos, una propiedad y un error propio.',
    language: 'python',
    tags: ['clases', 'errores'],
    code: `class SaldoInsuficiente(Exception):
    pass


class Cuenta:
    def __init__(self, titular):
        self.titular = titular
        self.movimientos = []

    @property
    def saldo(self):
        return sum(self.movimientos)

    def depositar(self, monto):
        self.movimientos.append(monto)

    def retirar(self, monto):
        if monto > self.saldo:
            raise SaldoInsuficiente(f"Querés sacar {monto} y tenés {self.saldo}")
        self.movimientos.append(-monto)


cuenta = Cuenta("Ana")
cuenta.depositar(5000)
cuenta.retirar(1200)
print(f"Saldo de {cuenta.titular}: {cuenta.saldo}")
try:
    cuenta.retirar(10000)
except SaldoInsuficiente as error:
    print("No se pudo:", error)
`,
  },
  {
    id: 'dataclass',
    title: 'Dataclasses',
    description: 'Clases para guardar datos sin escribir __init__ a mano, con orden y comparación automáticos.',
    language: 'python',
    tags: ['clases'],
    code: `from dataclasses import dataclass, field


@dataclass(order=True)
class Jugador:
    puntos: int
    nombre: str = field(compare=False)


tabla = [Jugador(12, "Lu"), Jugador(30, "Gonza"), Jugador(21, "Sofi")]
for posicion, jugador in enumerate(sorted(tabla, reverse=True), start=1):
    print(posicion, jugador)
`,
  },
  {
    id: 'decorador-tiempo',
    title: 'Decorador que mide el tiempo',
    description: 'Un decorador reutilizable que avisa cuánto tardó cualquier función.',
    language: 'python',
    tags: ['decoradores', 'funciones'],
    code: `import time
from functools import wraps


def cronometrar(funcion):
    @wraps(funcion)
    def envoltura(*args, **kwargs):
        inicio = time.perf_counter()
        resultado = funcion(*args, **kwargs)
        print(f"{funcion.__name__} tardó {(time.perf_counter() - inicio) * 1000:.1f} ms")
        return resultado
    return envoltura


@cronometrar
def suma_cuadrados(n):
    return sum(i * i for i in range(n))


print(suma_cuadrados(1_000_000))
`,
  },
  {
    id: 'regex-emails',
    title: 'Buscar emails y teléfonos con regex',
    description: 'Extraer datos de un texto con expresiones regulares del módulo re.',
    language: 'python',
    tags: ['textos', 'regex'],
    code: `import re

texto = """Escribime a ana.gomez@mail.com o a soporte@pestle.com.ar.
Teléfonos: 341-555-1234 y (011) 4444-5555."""

emails = re.findall(r"[\\w.+-]+@[\\w-]+(?:\\.[\\w-]+)+", texto)
telefonos = re.findall(r"\\(?\\d{2,4}\\)?[ -]?\\d{3,4}-\\d{4}", texto)

print("Emails:", emails)
print("Teléfonos:", telefonos)
print(re.sub(r"@[\\w.-]+", "@***", texto.splitlines()[0]))   # ocultar dominios
`,
  },
  {
    id: 'contrasenas',
    title: 'Generar contraseñas seguras',
    description: 'Contraseñas al azar con el módulo secrets, pensado para seguridad (no uses random para esto).',
    language: 'python',
    tags: ['seguridad', 'módulos'],
    code: `import secrets
import string


def generar(largo=16):
    caracteres = string.ascii_letters + string.digits + "!@#$%&*"
    while True:
        clave = "".join(secrets.choice(caracteres) for _ in range(largo))
        # Que tenga al menos una minúscula, una mayúscula y un número
        if any(c.islower() for c in clave) and any(c.isupper() for c in clave) and any(c.isdigit() for c in clave):
            return clave


for _ in range(3):
    print(generar())
print("Token para una URL:", secrets.token_urlsafe(16))
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
];

export { RUNNABLE_LANGUAGES, isRunnable } from '../lib/runnable';
