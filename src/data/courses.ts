/**
 * Python courses. Every exercise is checked in the browser (Pyodide): the student's code runs,
 * then `tests` (hidden Python using plain asserts) verify it. `_salida()` returns everything the
 * student's code printed. Each lesson's `solution` must pass its tests.
 */
import type { ProjectRequirement } from '../lib/pythonCheck';

export interface Lesson {
  id: string;
  title: string;
  /** Mini-markdown: paragraphs separated by blank lines, `inline code`, ``` fenced blocks, "- " lists. */
  content: string;
  exercise: string;
  starter: string;
  solution: string;
  tests: string;
  hint?: string;
}

export interface Project {
  title: string;
  /** Mini-markdown, like lessons. */
  intro: string;
  starter: string;
  solution: string;
  /** Python run before each requirement's test (e.g. sample data). */
  setup?: string;
  requirements: ProjectRequirement[];
  /** Concept keys (see CONCEPT_LABELS) the project is meant to exercise. */
  concepts: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  lessons: Lesson[];
  project: Project;
}

export const COURSES: Course[] = [
  {
    id: 'python-desde-cero',
    title: 'Python desde cero',
    description: 'Aprendé a programar con Python paso a paso: variables, decisiones, bucles, funciones, listas, diccionarios y clases.',
    level: 'Principiante',
    lessons: [
      {
        id: 'hola-mundo',
        title: 'Hola, mundo',
        content: `Python es uno de los lenguajes más usados del mundo: sirve para páginas web, datos, inteligencia artificial, automatizar tareas y mucho más.

Todo programa es una lista de instrucciones que la computadora ejecuta en orden, de arriba hacia abajo. La primera instrucción que vas a usar es \`print\`, que muestra texto en pantalla:

\`\`\`
print("Hola, mundo")
print("Estoy aprendiendo Python")
\`\`\`

El texto va entre comillas (dobles \`"..."\` o simples \`'...'\`). A un texto entre comillas se lo llama **string**.

Probá el ejemplo con **Ejecutar** y mirá la salida abajo. Cuando termines el ejercicio, tocá **Comprobar**.`,
        exercise: 'Mostrá en pantalla exactamente el texto: Hola, Pestle',
        starter: '# Escribí tu código acá\n',
        solution: 'print("Hola, Pestle")\n',
        tests: `assert "Hola, Pestle" in _salida(), 'Tu programa tiene que mostrar "Hola, Pestle" (fijate mayúsculas y la coma).'`,
        hint: 'Usá print("...") con el texto entre comillas.',
      },
      {
        id: 'variables',
        title: 'Variables y tipos de datos',
        content: `Una **variable** es un nombre que guarda un valor para usarlo después. Se crea con \`=\`:

\`\`\`
nombre = "Ana"
edad = 31
altura = 1.68
programadora = True

print(nombre, edad)
\`\`\`

Cada valor tiene un **tipo**:

- \`str\`: texto, como \`"Ana"\`
- \`int\`: números enteros, como \`31\`
- \`float\`: números con decimales, como \`1.68\` (se usa punto, no coma)
- \`bool\`: verdadero o falso, \`True\` o \`False\`

Podés preguntar el tipo de algo con \`type(valor)\`. Los nombres de variables van en minúscula y con guion bajo si tienen varias palabras: \`nombre_completo\`.`,
        exercise: 'Creá tres variables: ciudad con el texto "Rosario", habitantes con el número entero 1300000 y temperatura con el decimal 22.5.',
        starter: '# Creá las variables acá\n',
        solution: 'ciudad = "Rosario"\nhabitantes = 1300000\ntemperatura = 22.5\n',
        tests: `assert "ciudad" in globals(), 'Falta la variable ciudad.'
assert ciudad == "Rosario", 'ciudad tiene que valer "Rosario".'
assert "habitantes" in globals() and type(habitantes) is int, 'habitantes tiene que ser un número entero (sin comillas ni decimales).'
assert habitantes == 1300000, 'habitantes tiene que valer 1300000.'
assert "temperatura" in globals() and type(temperatura) is float, 'temperatura tiene que ser un decimal, como 22.5.'
assert temperatura == 22.5, 'temperatura tiene que valer 22.5.'`,
      },
      {
        id: 'operaciones',
        title: 'Operaciones y f-strings',
        content: `Python funciona como una calculadora:

\`\`\`
print(7 + 3)    # 10
print(7 - 3)    # 4
print(7 * 3)    # 21
print(7 / 2)    # 3.5  (división con decimales)
print(7 // 2)   # 3    (división entera)
print(7 % 2)    # 1    (resto)
print(2 ** 10)  # 1024 (potencia)
\`\`\`

Todo lo que va después de \`#\` es un **comentario**: Python lo ignora, sirve para explicar el código.

Para armar textos con valores adentro se usan los **f-strings**: una \`f\` antes de las comillas y las variables entre llaves:

\`\`\`
producto = "Mate"
precio = 2500
print(f"El {producto} cuesta \${precio}")
print(f"Con descuento: {precio * 0.9:.2f}")  # :.2f = 2 decimales
\`\`\``,
        exercise: 'Tenés precio = 1500. Calculá el precio con 21% de IVA en una variable total, y mostrá "Total: " seguido del total con 2 decimales (por ejemplo "Total: 1815.00").',
        starter: 'precio = 1500\n\n# Calculá total y mostralo\n',
        solution: 'precio = 1500\ntotal = precio * 1.21\nprint(f"Total: {total:.2f}")\n',
        tests: `assert "total" in globals(), 'Falta la variable total.'
assert abs(total - 1815) < 0.001, 'total tiene que ser precio * 1.21 (= 1815).'
assert "Total: 1815.00" in _salida(), 'Tenés que mostrar "Total: 1815.00". Usá f"Total: {total:.2f}".'`,
      },
      {
        id: 'funciones',
        title: 'Funciones',
        content: `Una **función** agrupa código con un nombre para reutilizarlo. Se define con \`def\`, recibe **parámetros** entre paréntesis y devuelve un resultado con \`return\`:

\`\`\`
def saludar(nombre):
    return f"Hola, {nombre}!"

mensaje = saludar("Sofi")
print(mensaje)          # Hola, Sofi!
print(saludar("Luis"))  # Hola, Luis!
\`\`\`

Fijate en dos cosas importantes:

- La línea del \`def\` termina con \`:\`
- El cuerpo de la función va **indentado** (con 4 espacios, o la tecla Tab). En Python la indentación no es decorativa: marca qué código pertenece a la función.

\`return\` termina la función y entrega el valor. Si no hay \`return\`, la función devuelve \`None\`.`,
        exercise: 'Escribí una función area_rectangulo(base, altura) que devuelva el área (base por altura).',
        starter: 'def area_rectangulo(base, altura):\n    # completá acá\n    pass\n\nprint(area_rectangulo(3, 4))\n',
        solution: 'def area_rectangulo(base, altura):\n    return base * altura\n\nprint(area_rectangulo(3, 4))\n',
        tests: `assert "area_rectangulo" in globals(), 'Falta la función area_rectangulo.'
assert area_rectangulo(3, 4) == 12, 'area_rectangulo(3, 4) tiene que devolver 12 (¿usaste return?).'
assert area_rectangulo(10, 0.5) == 5, 'area_rectangulo(10, 0.5) tiene que devolver 5.'`,
      },
      {
        id: 'condicionales',
        title: 'Decisiones con if',
        content: `Con \`if\` el programa toma decisiones. Se puede agregar \`elif\` (si no, si...) y \`else\` (si no):

\`\`\`
def estado(temperatura):
    if temperatura >= 30:
        return "calor"
    elif temperatura >= 15:
        return "templado"
    else:
        return "frío"

print(estado(35))  # calor
print(estado(10))  # frío
\`\`\`

Comparaciones: \`==\` (igual), \`!=\` (distinto), \`<\`, \`>\`, \`<=\`, \`>=\`. Ojo: \`=\` guarda un valor y \`==\` compara.

Se pueden combinar condiciones con \`and\`, \`or\` y \`not\`:

\`\`\`
edad = 20
tiene_entrada = True
if edad >= 18 and tiene_entrada:
    print("Puede pasar")
\`\`\``,
        exercise: 'Escribí signo(n) que devuelva "positivo" si n es mayor que 0, "negativo" si es menor que 0 y "cero" si es 0.',
        starter: 'def signo(n):\n    # completá acá\n    pass\n\nprint(signo(5), signo(-2), signo(0))\n',
        solution: 'def signo(n):\n    if n > 0:\n        return "positivo"\n    elif n < 0:\n        return "negativo"\n    else:\n        return "cero"\n\nprint(signo(5), signo(-2), signo(0))\n',
        tests: `assert signo(5) == "positivo", 'signo(5) tiene que devolver "positivo".'
assert signo(-2) == "negativo", 'signo(-2) tiene que devolver "negativo".'
assert signo(0) == "cero", 'signo(0) tiene que devolver "cero".'
assert signo(0.5) == "positivo", 'signo(0.5) tiene que devolver "positivo".'`,
      },
      {
        id: 'listas',
        title: 'Listas',
        content: `Una **lista** guarda varios valores en orden, entre corchetes:

\`\`\`
frutas = ["manzana", "banana", "naranja"]
print(frutas[0])      # manzana (se cuenta desde 0)
print(frutas[-1])     # naranja (el último)
print(len(frutas))    # 3

frutas.append("kiwi")     # agrega al final
frutas.remove("banana")   # quita un elemento
print(frutas)             # ['manzana', 'naranja', 'kiwi']
\`\`\`

Funciones útiles con listas de números:

\`\`\`
notas = [7, 9, 4, 10]
print(sum(notas))  # 30
print(max(notas))  # 10
print(min(notas))  # 4
print(sorted(notas))  # [4, 7, 9, 10]
\`\`\``,
        exercise: 'Escribí promedio(numeros) que devuelva el promedio de una lista de números. Si la lista está vacía, devolvé 0.',
        starter: 'def promedio(numeros):\n    # completá acá\n    pass\n\nprint(promedio([7, 9, 4, 10]))\n',
        solution: 'def promedio(numeros):\n    if len(numeros) == 0:\n        return 0\n    return sum(numeros) / len(numeros)\n\nprint(promedio([7, 9, 4, 10]))\n',
        tests: `assert promedio([7, 9, 4, 10]) == 7.5, 'promedio([7, 9, 4, 10]) tiene que dar 7.5.'
assert promedio([5]) == 5, 'promedio([5]) tiene que dar 5.'
assert promedio([]) == 0, 'Con una lista vacía tenés que devolver 0 (dividir por 0 da error).'`,
        hint: 'sum(lista) suma todo y len(lista) cuenta los elementos.',
      },
      {
        id: 'bucle-for',
        title: 'Bucles con for',
        content: `El bucle \`for\` repite código para cada elemento de una secuencia:

\`\`\`
for fruta in ["manzana", "banana", "kiwi"]:
    print(f"Me gusta la {fruta}")
\`\`\`

Con \`range\` se generan números:

\`\`\`
for i in range(5):        # 0, 1, 2, 3, 4
    print(i)

for i in range(1, 11, 2): # 1, 3, 5, 7, 9 (desde 1, hasta 11 sin incluir, de a 2)
    print(i)
\`\`\`

Un patrón muy común es **acumular** un resultado:

\`\`\`
total = 0
for n in [4, 8, 15]:
    total = total + n   # o: total += n
print(total)  # 27
\`\`\``,
        exercise: 'Escribí suma_pares(n) que devuelva la suma de todos los números pares desde 1 hasta n (incluido). Por ejemplo, suma_pares(10) = 2+4+6+8+10 = 30.',
        starter: 'def suma_pares(n):\n    # completá acá\n    pass\n\nprint(suma_pares(10))\n',
        solution: 'def suma_pares(n):\n    total = 0\n    for i in range(1, n + 1):\n        if i % 2 == 0:\n            total += i\n    return total\n\nprint(suma_pares(10))\n',
        tests: `assert suma_pares(10) == 30, 'suma_pares(10) tiene que dar 30.'
assert suma_pares(1) == 0, 'suma_pares(1) tiene que dar 0.'
assert suma_pares(7) == 12, 'suma_pares(7) tiene que dar 12 (2+4+6).'
assert suma_pares(100) == 2550, 'suma_pares(100) tiene que dar 2550.'`,
        hint: 'Un número es par si n % 2 == 0. Recorré range(1, n + 1).',
      },
      {
        id: 'bucle-while',
        title: 'Bucles con while',
        content: `\`while\` repite mientras una condición sea verdadera. Sirve cuando no sabés de antemano cuántas vueltas vas a dar:

\`\`\`
saldo = 1000
meses = 0
while saldo < 2000:
    saldo = saldo * 1.1
    meses += 1
print(f"En {meses} meses se duplica")
\`\`\`

Cuidado: si la condición nunca se vuelve falsa, el bucle no termina nunca. Siempre tiene que cambiar algo adentro.

\`break\` sale del bucle en cualquier momento y \`continue\` salta a la siguiente vuelta.

Para trabajar con los dígitos de un número: \`n % 10\` da el último dígito y \`n // 10\` lo quita.`,
        exercise: 'Escribí contar_digitos(n) que devuelva cuántos dígitos tiene un número entero positivo, usando while (sin convertirlo a texto). contar_digitos(2025) = 4.',
        starter: 'def contar_digitos(n):\n    # completá acá\n    pass\n\nprint(contar_digitos(2025))\n',
        solution: 'def contar_digitos(n):\n    digitos = 1\n    while n >= 10:\n        n = n // 10\n        digitos += 1\n    return digitos\n\nprint(contar_digitos(2025))\n',
        tests: `assert contar_digitos(2025) == 4, 'contar_digitos(2025) tiene que dar 4.'
assert contar_digitos(7) == 1, 'contar_digitos(7) tiene que dar 1.'
assert contar_digitos(10) == 2, 'contar_digitos(10) tiene que dar 2.'
assert contar_digitos(1000000) == 7, 'contar_digitos(1000000) tiene que dar 7.'`,
      },
      {
        id: 'strings',
        title: 'Trabajar con textos',
        content: `Los strings tienen muchos **métodos** útiles:

\`\`\`
texto = "  Hola Mundo  "
print(texto.strip())        # "Hola Mundo" (sin espacios a los costados)
print(texto.lower())        # "  hola mundo  "
print(texto.upper())        # "  HOLA MUNDO  "
print(texto.replace("o", "0"))
print("mundo" in texto.lower())  # True
print("a,b,c".split(","))   # ['a', 'b', 'c']
print("-".join(["a", "b"])) # "a-b"
\`\`\`

Con corchetes se toman partes (**slicing**):

\`\`\`
palabra = "Python"
print(palabra[0])     # P
print(palabra[0:3])   # Pyt
print(palabra[::-1])  # nohtyP (al revés)
\`\`\``,
        exercise: 'Escribí es_palindromo(texto) que devuelva True si el texto se lee igual al derecho y al revés, sin importar mayúsculas ni espacios. es_palindromo("Anita lava la tina") → True.',
        starter: 'def es_palindromo(texto):\n    # completá acá\n    pass\n\nprint(es_palindromo("Anita lava la tina"))\n',
        solution: 'def es_palindromo(texto):\n    limpio = texto.lower().replace(" ", "")\n    return limpio == limpio[::-1]\n\nprint(es_palindromo("Anita lava la tina"))\n',
        tests: `assert es_palindromo("Anita lava la tina") is True, 'es_palindromo("Anita lava la tina") tiene que devolver True.'
assert es_palindromo("Neuquen") is True, 'es_palindromo("Neuquen") tiene que devolver True (ignorando mayúsculas).'
assert es_palindromo("Python") is False, 'es_palindromo("Python") tiene que devolver False.'
assert es_palindromo("a") is True, 'Una sola letra es palíndromo.'`,
        hint: 'Primero pasá a minúsculas y quitá los espacios; después compará con el texto al revés ([::-1]).',
      },
      {
        id: 'diccionarios',
        title: 'Diccionarios',
        content: `Un **diccionario** guarda pares **clave: valor**. Es ideal para buscar datos por nombre:

\`\`\`
precios = {"mate": 2500, "yerba": 4000}
print(precios["mate"])       # 2500
precios["bombilla"] = 1800   # agregar o cambiar
print(len(precios))          # 3
print("azúcar" in precios)   # False
print(precios.get("azúcar", 0))  # 0 si no existe

for producto, precio in precios.items():
    print(f"{producto}: \${precio}")
\`\`\`

Un uso clásico es **contar** cosas:

\`\`\`
conteo = {}
for letra in "banana":
    conteo[letra] = conteo.get(letra, 0) + 1
print(conteo)  # {'b': 1, 'a': 3, 'n': 2}
\`\`\``,
        exercise: 'Escribí contar_palabras(texto) que devuelva un diccionario con cuántas veces aparece cada palabra (en minúsculas). contar_palabras("el sol y el mar") → {"el": 2, "sol": 1, "y": 1, "mar": 1}.',
        starter: 'def contar_palabras(texto):\n    # completá acá\n    pass\n\nprint(contar_palabras("el sol y el mar"))\n',
        solution: 'def contar_palabras(texto):\n    conteo = {}\n    for palabra in texto.lower().split():\n        conteo[palabra] = conteo.get(palabra, 0) + 1\n    return conteo\n\nprint(contar_palabras("el sol y el mar"))\n',
        tests: `assert contar_palabras("el sol y el mar") == {"el": 2, "sol": 1, "y": 1, "mar": 1}, 'Revisá el conteo de "el sol y el mar".'
assert contar_palabras("Hola hola HOLA") == {"hola": 3}, 'Las palabras tienen que contarse en minúsculas.'
assert contar_palabras("") == {}, 'Un texto vacío da un diccionario vacío.'`,
        hint: 'texto.lower().split() te da la lista de palabras.',
      },
      {
        id: 'comprensiones',
        title: 'Listas por comprensión',
        content: `Las **comprensiones** crean listas en una sola línea. Estas dos formas son equivalentes:

\`\`\`
cuadrados = []
for n in range(1, 6):
    cuadrados.append(n ** 2)

cuadrados = [n ** 2 for n in range(1, 6)]   # [1, 4, 9, 16, 25]
\`\`\`

Se puede filtrar con \`if\`:

\`\`\`
numeros = [3, 8, 12, 5, 20]
grandes = [n for n in numeros if n > 6]       # [8, 12, 20]
nombres = ["ana", "luis"]
mayus = [nombre.title() for nombre in nombres]  # ['Ana', 'Luis']
\`\`\`

También existen para diccionarios: \`{n: n ** 2 for n in range(3)}\` → \`{0: 0, 1: 1, 2: 4}\`.`,
        exercise: 'Escribí cuadrados_pares(numeros) que devuelva, usando una comprensión, los cuadrados de los números pares de la lista, en el mismo orden.',
        starter: 'def cuadrados_pares(numeros):\n    # completá acá (en una sola línea con una comprensión)\n    pass\n\nprint(cuadrados_pares([1, 2, 3, 4, 5, 6]))\n',
        solution: 'def cuadrados_pares(numeros):\n    return [n ** 2 for n in numeros if n % 2 == 0]\n\nprint(cuadrados_pares([1, 2, 3, 4, 5, 6]))\n',
        tests: `assert cuadrados_pares([1, 2, 3, 4, 5, 6]) == [4, 16, 36], 'cuadrados_pares([1, 2, 3, 4, 5, 6]) tiene que dar [4, 16, 36].'
assert cuadrados_pares([1, 3, 5]) == [], 'Si no hay pares, la lista queda vacía.'
assert cuadrados_pares([10, -2]) == [100, 4], 'cuadrados_pares([10, -2]) tiene que dar [100, 4].'`,
      },
      {
        id: 'errores',
        title: 'Manejo de errores',
        content: `Cuando algo sale mal, Python lanza una **excepción** y el programa se detiene. Con \`try\` / \`except\` podés atraparla y reaccionar:

\`\`\`
def convertir(texto):
    try:
        return int(texto)
    except ValueError:
        print(f"'{texto}' no es un número")
        return None

print(convertir("42"))    # 42
print(convertir("hola"))  # None
\`\`\`

Excepciones comunes: \`ValueError\` (valor inválido), \`ZeroDivisionError\` (dividir por cero), \`KeyError\` (clave que no existe en un diccionario), \`IndexError\` (posición fuera de la lista), \`TypeError\` (tipo equivocado).

También podés lanzar las tuyas con \`raise\`:

\`\`\`
def retirar(saldo, monto):
    if monto > saldo:
        raise ValueError("Saldo insuficiente")
    return saldo - monto
\`\`\``,
        exercise: 'Escribí division_segura(a, b) que devuelva a / b, pero si b es 0 devuelva None en lugar de fallar. Usá try/except.',
        starter: 'def division_segura(a, b):\n    # completá acá\n    pass\n\nprint(division_segura(10, 4), division_segura(1, 0))\n',
        solution: 'def division_segura(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        return None\n\nprint(division_segura(10, 4), division_segura(1, 0))\n',
        tests: `assert division_segura(10, 4) == 2.5, 'division_segura(10, 4) tiene que dar 2.5.'
assert division_segura(1, 0) is None, 'division_segura(1, 0) tiene que devolver None.'
assert division_segura(0, 5) == 0, 'division_segura(0, 5) tiene que dar 0.'`,
      },
      {
        id: 'clases',
        title: 'Clases y objetos',
        content: `Una **clase** es un molde para crear **objetos** que tienen datos (atributos) y comportamiento (métodos):

\`\`\`
class Perro:
    def __init__(self, nombre):
        self.nombre = nombre   # atributo
        self.trucos = []

    def aprender(self, truco): # método
        self.trucos.append(truco)

    def presentarse(self):
        return f"Soy {self.nombre} y sé {len(self.trucos)} trucos"

firulais = Perro("Firulais")
firulais.aprender("sentarse")
print(firulais.presentarse())
\`\`\`

- \`__init__\` se ejecuta al crear el objeto y prepara sus atributos.
- \`self\` es el propio objeto: con \`self.algo\` guardás y leés sus datos.
- Cada objeto creado con \`Perro(...)\` tiene sus propios datos.`,
        exercise: 'Creá una clase CuentaBancaria que empiece con saldo 0 (atributo saldo), con métodos depositar(monto) y retirar(monto). Si se intenta retirar más que el saldo, retirar tiene que lanzar ValueError.',
        starter: 'class CuentaBancaria:\n    def __init__(self):\n        # completá acá\n        pass\n\n\ncuenta = CuentaBancaria()\n',
        solution: 'class CuentaBancaria:\n    def __init__(self):\n        self.saldo = 0\n\n    def depositar(self, monto):\n        self.saldo += monto\n\n    def retirar(self, monto):\n        if monto > self.saldo:\n            raise ValueError("Saldo insuficiente")\n        self.saldo -= monto\n\n\ncuenta = CuentaBancaria()\ncuenta.depositar(100)\ncuenta.retirar(30)\nprint(cuenta.saldo)\n',
        tests: `c = CuentaBancaria()
assert hasattr(c, "saldo"), 'Guardá el saldo en self.saldo dentro de __init__ (empezando en 0).'
assert c.saldo == 0, 'Una cuenta nueva tiene que tener saldo 0.'
c.depositar(100)
assert c.saldo == 100, 'Después de depositar(100) el saldo tiene que ser 100.'
c.retirar(30)
assert c.saldo == 70, 'Después de retirar(30) el saldo tiene que ser 70.'
try:
    c.retirar(1000)
    assert False, 'retirar(1000) con saldo 70 tiene que lanzar ValueError.'
except ValueError:
    pass
assert c.saldo == 70, 'Un retiro rechazado no tiene que cambiar el saldo.'
otra = CuentaBancaria()
assert otra.saldo == 0, 'Cada cuenta tiene que tener su propio saldo.'`,
        hint: 'Guardá el saldo en self.saldo dentro de __init__. Para el error: raise ValueError("Saldo insuficiente").',
      },
      {
        id: 'proyecto-fizzbuzz',
        title: 'Proyecto: FizzBuzz',
        content: `¡Último desafío del curso! **FizzBuzz** es un ejercicio clásico de entrevistas de programación que combina todo lo que aprendiste: funciones, bucles, condicionales y listas.

Las reglas: para cada número del 1 al n,

- si es múltiplo de 3 y de 5 → \`"FizzBuzz"\`
- si es múltiplo de 3 → \`"Fizz"\`
- si es múltiplo de 5 → \`"Buzz"\`
- si no → el número como texto, por ejemplo \`"7"\`

Un número es múltiplo de 3 si \`n % 3 == 0\`. Pensá bien en qué orden van los \`if\`: ¿qué pasa con el 15?`,
        exercise: 'Escribí fizzbuzz(n) que devuelva una lista de strings con el resultado del 1 al n. fizzbuzz(5) → ["1", "2", "Fizz", "4", "Buzz"].',
        starter: 'def fizzbuzz(n):\n    # completá acá\n    pass\n\nprint(fizzbuzz(15))\n',
        solution: 'def fizzbuzz(n):\n    resultado = []\n    for i in range(1, n + 1):\n        if i % 15 == 0:\n            resultado.append("FizzBuzz")\n        elif i % 3 == 0:\n            resultado.append("Fizz")\n        elif i % 5 == 0:\n            resultado.append("Buzz")\n        else:\n            resultado.append(str(i))\n    return resultado\n\nprint(fizzbuzz(15))\n',
        tests: `assert fizzbuzz(5) == ["1", "2", "Fizz", "4", "Buzz"], 'fizzbuzz(5) tiene que dar ["1", "2", "Fizz", "4", "Buzz"].'
r = fizzbuzz(15)
assert len(r) == 15, 'fizzbuzz(15) tiene que tener 15 elementos.'
assert r[14] == "FizzBuzz", 'El 15 tiene que ser "FizzBuzz" (revisá el orden de los if).'
assert r[8] == "Fizz" and r[9] == "Buzz", 'El 9 es "Fizz" y el 10 es "Buzz".'
assert r[6] == "7", 'Los demás números van como texto: "7".'
assert fizzbuzz(0) == [], 'fizzbuzz(0) es una lista vacía.'`,
        hint: 'Chequeá primero el caso de múltiplo de 15 (3 y 5), después 3, después 5.',
      },
    ],
    project: {
      title: 'Gestor de tareas',
      intro: `¡Llegaste al final del curso! Ahora vas a construir un programa completo usando todo lo que aprendiste: una **clase**, **listas** y **diccionarios**, **condicionales**, **bucles**, **errores** y **f-strings**.

Vas a programar un **gestor de tareas**: cada tarea tiene un título, una prioridad (1 = alta, 2 = media, 3 = baja) y puede estar pendiente o completada.

Completá los métodos de la clase \`GestorTareas\`. Cada vez que toques **Probar mi proyecto** se revisan los requisitos uno por uno, así sabés exactamente qué te falta. Podés agregar todos los métodos y variables extra que quieras.

Una idea para guardar las tareas: una lista de diccionarios como \`{"titulo": "Estudiar", "prioridad": 1, "hecha": False}\`.`,
      starter: `class GestorTareas:
    """Un gestor de tareas con prioridades."""

    def __init__(self):
        pass

    def agregar(self, titulo, prioridad):
        pass

    def completar(self, titulo):
        pass

    def pendientes(self):
        pass

    def resumen(self):
        pass

    def por_prioridad(self):
        pass


# Probá tu gestor acá abajo
gestor = GestorTareas()
`,
      solution: `class GestorTareas:
    """Un gestor de tareas con prioridades."""

    def __init__(self):
        self.tareas = []

    def agregar(self, titulo, prioridad):
        if prioridad not in (1, 2, 3):
            raise ValueError("La prioridad tiene que ser 1, 2 o 3")
        self.tareas.append({"titulo": titulo, "prioridad": prioridad, "hecha": False})

    def completar(self, titulo):
        for tarea in self.tareas:
            if tarea["titulo"] == titulo:
                tarea["hecha"] = True
                return
        raise KeyError(titulo)

    def pendientes(self):
        pendientes = [t for t in self.tareas if not t["hecha"]]
        ordenadas = sorted(pendientes, key=lambda t: t["prioridad"])
        return [t["titulo"] for t in ordenadas]

    def resumen(self):
        hechas = len([t for t in self.tareas if t["hecha"]])
        return f"Pendientes: {len(self.tareas) - hechas} | Completadas: {hechas}"

    def por_prioridad(self):
        conteo = {}
        for tarea in self.tareas:
            if not tarea["hecha"]:
                conteo[tarea["prioridad"]] = conteo.get(tarea["prioridad"], 0) + 1
        return conteo


gestor = GestorTareas()
gestor.agregar("Estudiar Python", 1)
gestor.agregar("Comprar yerba", 3)
gestor.agregar("Llamar a Sofi", 2)
gestor.completar("Comprar yerba")
print(gestor.pendientes())
print(gestor.resumen())
print(gestor.por_prioridad())
`,
      requirements: [
        {
          id: 'nuevo',
          text: 'Un gestor nuevo empieza sin tareas: pendientes() devuelve una lista vacía.',
          test: `g = GestorTareas()
assert g.pendientes() == [], 'Un gestor nuevo tiene que devolver [] en pendientes().'`,
        },
        {
          id: 'agregar',
          text: 'agregar(titulo, prioridad) guarda la tarea. Si la prioridad no es 1, 2 o 3, lanza ValueError.',
          test: `g = GestorTareas()
g.agregar("Estudiar", 1)
assert g.pendientes() == ["Estudiar"], 'Después de agregar("Estudiar", 1), pendientes() tiene que ser ["Estudiar"].'
try:
    g.agregar("Imposible", 7)
    assert False, 'agregar con prioridad 7 tiene que lanzar ValueError.'
except ValueError:
    pass
assert g.pendientes() == ["Estudiar"], 'Una tarea con prioridad inválida no se tiene que guardar.'`,
        },
        {
          id: 'orden',
          text: 'pendientes() devuelve los títulos ordenados por prioridad (1 primero); a igual prioridad, en el orden en que se agregaron.',
          test: `g = GestorTareas()
g.agregar("baja", 3)
g.agregar("alta", 1)
g.agregar("media", 2)
g.agregar("alta 2", 1)
assert g.pendientes() == ["alta", "alta 2", "media", "baja"], 'El orden tiene que ser ["alta", "alta 2", "media", "baja"].'`,
        },
        {
          id: 'completar',
          text: 'completar(titulo) marca la tarea como hecha (deja de estar pendiente). Si no existe, lanza KeyError.',
          test: `g = GestorTareas()
g.agregar("a", 1)
g.agregar("b", 2)
g.completar("a")
assert g.pendientes() == ["b"], 'Después de completar("a") solo queda "b" pendiente.'
try:
    g.completar("no existe")
    assert False, 'completar una tarea que no existe tiene que lanzar KeyError.'
except KeyError:
    pass`,
        },
        {
          id: 'resumen',
          text: 'resumen() devuelve un texto como "Pendientes: 2 | Completadas: 1".',
          test: `g = GestorTareas()
g.agregar("a", 1)
g.agregar("b", 2)
g.agregar("c", 3)
g.completar("b")
assert g.resumen() == "Pendientes: 2 | Completadas: 1", 'resumen() tiene que devolver exactamente "Pendientes: 2 | Completadas: 1".'`,
        },
        {
          id: 'por-prioridad',
          text: 'por_prioridad() devuelve un diccionario {prioridad: cantidad} contando solo las tareas pendientes.',
          test: `g = GestorTareas()
g.agregar("a", 1)
g.agregar("b", 1)
g.agregar("c", 3)
g.agregar("d", 2)
g.completar("d")
assert g.por_prioridad() == {1: 2, 3: 1}, 'Con 2 pendientes de prioridad 1 y 1 de prioridad 3 tiene que dar {1: 2, 3: 1}.'`,
        },
      ],
      concepts: ['clases', 'funciones', 'condicionales', 'for', 'listas', 'diccionarios', 'errores', 'f-strings'],
    },
  },
  {
    id: 'python-practico',
    title: 'Python práctico',
    description: 'Herramientas del día a día: módulos, fechas, JSON, ordenar datos, archivos y generadores.',
    level: 'Intermedio',
    lessons: [
      {
        id: 'modulos',
        title: 'Módulos: math',
        content: `Python trae una **biblioteca estándar** enorme. Para usar un módulo se lo **importa**:

\`\`\`
import math

print(math.sqrt(16))    # 4.0 (raíz cuadrada)
print(math.pi)          # 3.141592653589793
print(math.ceil(4.2))   # 5 (redondea para arriba)
print(math.floor(4.8))  # 4 (para abajo)
print(round(3.14159, 2))  # 3.14 (round no necesita import)
\`\`\`

También podés importar solo lo que necesitás: \`from math import sqrt, pi\`.

Otros módulos muy usados: \`random\` (números al azar), \`datetime\` (fechas), \`json\`, \`os\`, \`csv\`, \`statistics\`.`,
        exercise: 'Escribí hipotenusa(a, b) que devuelva la hipotenusa de un triángulo rectángulo (raíz de a² + b²) redondeada a 2 decimales, usando math.',
        starter: 'import math\n\ndef hipotenusa(a, b):\n    # completá acá\n    pass\n\nprint(hipotenusa(3, 4))\n',
        solution: 'import math\n\ndef hipotenusa(a, b):\n    return round(math.sqrt(a ** 2 + b ** 2), 2)\n\nprint(hipotenusa(3, 4))\n',
        tests: `assert hipotenusa(3, 4) == 5, 'hipotenusa(3, 4) tiene que dar 5.'
assert hipotenusa(1, 1) == 1.41, 'hipotenusa(1, 1) tiene que dar 1.41 (redondeada a 2 decimales).'
assert hipotenusa(5, 12) == 13, 'hipotenusa(5, 12) tiene que dar 13.'`,
      },
      {
        id: 'fechas',
        title: 'Fechas con datetime',
        content: `El módulo \`datetime\` trabaja con fechas y horas:

\`\`\`
from datetime import date, datetime, timedelta

hoy = date(2025, 3, 15)
print(hoy.year, hoy.month, hoy.day)
print(hoy + timedelta(days=30))       # 2025-04-14

cumple = date(2025, 7, 9)
faltan = cumple - hoy                 # un timedelta
print(faltan.days)                    # 116

# De texto a fecha y de fecha a texto
d = datetime.strptime("25/12/2025", "%d/%m/%Y").date()
print(d.strftime("%d/%m/%Y"))
\`\`\`

En \`strptime\`/\`strftime\`: \`%d\` día, \`%m\` mes, \`%Y\` año con 4 dígitos, \`%H:%M\` hora y minutos.`,
        exercise: 'Escribí dias_entre(desde, hasta) que reciba dos fechas como texto "dd/mm/aaaa" y devuelva cuántos días hay entre ellas (hasta - desde).',
        starter: 'from datetime import datetime\n\ndef dias_entre(desde, hasta):\n    # completá acá\n    pass\n\nprint(dias_entre("01/01/2025", "25/12/2025"))\n',
        solution: 'from datetime import datetime\n\ndef dias_entre(desde, hasta):\n    formato = "%d/%m/%Y"\n    inicio = datetime.strptime(desde, formato)\n    fin = datetime.strptime(hasta, formato)\n    return (fin - inicio).days\n\nprint(dias_entre("01/01/2025", "25/12/2025"))\n',
        tests: `assert dias_entre("01/01/2025", "25/12/2025") == 358, 'Del 01/01/2025 al 25/12/2025 hay 358 días.'
assert dias_entre("28/02/2024", "01/03/2024") == 2, '2024 es bisiesto: del 28/02 al 01/03 hay 2 días.'
assert dias_entre("10/05/2025", "10/05/2025") == 0, 'La misma fecha da 0.'`,
        hint: 'Convertí cada texto con datetime.strptime(texto, "%d/%m/%Y") y restá: el resultado tiene .days',
      },
      {
        id: 'json',
        title: 'Datos en JSON',
        content: `**JSON** es el formato más usado para intercambiar datos entre programas y APIs. Se parece mucho a los diccionarios y listas de Python:

\`\`\`
import json

texto = '{"nombre": "Ana", "edad": 31, "lenguajes": ["Python", "SQL"]}'
datos = json.loads(texto)      # de texto JSON a Python
print(datos["lenguajes"][0])   # Python

nuevo = {"ok": True, "items": [1, 2]}
print(json.dumps(nuevo))                 # de Python a texto JSON
print(json.dumps(nuevo, indent=2))       # con sangría, más legible
\`\`\`

Equivalencias: objeto JSON → \`dict\`, array → \`list\`, \`true/false\` → \`True/False\`, \`null\` → \`None\`.`,
        exercise: 'Escribí usuarios_activos(texto_json) que reciba una lista de usuarios en JSON (cada uno con "nombre" y "activo") y devuelva la lista de nombres de los activos.',
        starter: 'import json\n\ndef usuarios_activos(texto_json):\n    # completá acá\n    pass\n\ndatos = \'[{"nombre": "Ana", "activo": true}, {"nombre": "Luis", "activo": false}]\'\nprint(usuarios_activos(datos))\n',
        solution: 'import json\n\ndef usuarios_activos(texto_json):\n    usuarios = json.loads(texto_json)\n    return [u["nombre"] for u in usuarios if u["activo"]]\n\ndatos = \'[{"nombre": "Ana", "activo": true}, {"nombre": "Luis", "activo": false}]\'\nprint(usuarios_activos(datos))\n',
        tests: `assert usuarios_activos('[{"nombre": "Ana", "activo": true}, {"nombre": "Luis", "activo": false}]') == ["Ana"], 'Solo Ana está activa.'
assert usuarios_activos('[]') == [], 'Una lista vacía da una lista vacía.'
assert usuarios_activos('[{"nombre": "A", "activo": true}, {"nombre": "B", "activo": true}]') == ["A", "B"], 'Tienen que salir en el mismo orden.'`,
      },
      {
        id: 'ordenar',
        title: 'Ordenar datos con sorted y lambda',
        content: `\`sorted\` devuelve una lista ordenada. Con \`key\` le decís **por qué** ordenar, y con \`reverse=True\` ordena de mayor a menor:

\`\`\`
palabras = ["kiwi", "banana", "uva"]
print(sorted(palabras))              # alfabético
print(sorted(palabras, key=len))     # por largo: ['uva', 'kiwi', 'banana']

alumnos = [("Ana", 9), ("Luis", 7), ("Sofi", 10)]
por_nota = sorted(alumnos, key=lambda a: a[1], reverse=True)
print(por_nota[0])  # ('Sofi', 10)
\`\`\`

Una **lambda** es una función cortita sin nombre: \`lambda a: a[1]\` es lo mismo que:

\`\`\`
def nota(a):
    return a[1]
\`\`\`

\`max\` y \`min\` también aceptan \`key\`: \`max(alumnos, key=lambda a: a[1])\`.`,
        exercise: 'Escribí ordenar_por_edad(personas) que reciba una lista de diccionarios con "nombre" y "edad", y devuelva los nombres ordenados de la persona más joven a la mayor.',
        starter: 'def ordenar_por_edad(personas):\n    # completá acá\n    pass\n\ngente = [{"nombre": "Ana", "edad": 31}, {"nombre": "Luis", "edad": 24}, {"nombre": "Sofi", "edad": 19}]\nprint(ordenar_por_edad(gente))\n',
        solution: 'def ordenar_por_edad(personas):\n    ordenadas = sorted(personas, key=lambda p: p["edad"])\n    return [p["nombre"] for p in ordenadas]\n\ngente = [{"nombre": "Ana", "edad": 31}, {"nombre": "Luis", "edad": 24}, {"nombre": "Sofi", "edad": 19}]\nprint(ordenar_por_edad(gente))\n',
        tests: `gente = [{"nombre": "Ana", "edad": 31}, {"nombre": "Luis", "edad": 24}, {"nombre": "Sofi", "edad": 19}]
assert ordenar_por_edad(gente) == ["Sofi", "Luis", "Ana"], 'El resultado tiene que ser ["Sofi", "Luis", "Ana"].'
assert ordenar_por_edad([]) == [], 'Una lista vacía da una lista vacía.'`,
      },
      {
        id: 'archivos',
        title: 'Leer y escribir archivos',
        content: `Con \`open\` se leen y escriben archivos. Lo recomendado es usar \`with\`, que cierra el archivo solo:

\`\`\`
# Escribir ("w" borra lo que había; "a" agrega al final)
with open("notas.txt", "w", encoding="utf-8") as f:
    f.write("Comprar yerba\\n")
    f.write("Llamar a Luis\\n")

# Leer todo
with open("notas.txt", encoding="utf-8") as f:
    contenido = f.read()

# Leer línea por línea
with open("notas.txt", encoding="utf-8") as f:
    for linea in f:
        print(linea.strip())
\`\`\`

Acá en el navegador los archivos se guardan en memoria mientras corre tu código. En tu computadora quedan guardados en el disco.`,
        exercise: 'Escribí guardar_lineas(nombre_archivo, lineas) que guarde cada string de la lista en una línea del archivo, y contar_lineas(nombre_archivo) que devuelva cuántas líneas tiene.',
        starter: 'def guardar_lineas(nombre_archivo, lineas):\n    # completá acá\n    pass\n\ndef contar_lineas(nombre_archivo):\n    # completá acá\n    pass\n\nguardar_lineas("compras.txt", ["yerba", "pan", "queso"])\nprint(contar_lineas("compras.txt"))\n',
        solution: 'def guardar_lineas(nombre_archivo, lineas):\n    with open(nombre_archivo, "w", encoding="utf-8") as f:\n        for linea in lineas:\n            f.write(linea + "\\n")\n\ndef contar_lineas(nombre_archivo):\n    with open(nombre_archivo, encoding="utf-8") as f:\n        return len(f.readlines())\n\nguardar_lineas("compras.txt", ["yerba", "pan", "queso"])\nprint(contar_lineas("compras.txt"))\n',
        tests: `guardar_lineas("_prueba.txt", ["uno", "dos", "tres"])
assert contar_lineas("_prueba.txt") == 3, 'Después de guardar 3 líneas, contar_lineas tiene que dar 3.'
with open("_prueba.txt", encoding="utf-8") as f:
    assert f.read().splitlines() == ["uno", "dos", "tres"], 'El archivo tiene que tener una línea por elemento, en orden.'
guardar_lineas("_prueba.txt", ["solo"])
assert contar_lineas("_prueba.txt") == 1, 'guardar_lineas tiene que reemplazar el contenido (modo "w").'`,
        hint: 'En guardar_lineas escribí linea + "\\n" por cada elemento. En contar_lineas, len(f.readlines()).',
      },
      {
        id: 'generadores',
        title: 'Generadores con yield',
        content: `Un **generador** es una función que va entregando valores de a uno con \`yield\`, en vez de armar una lista entera. Ocupa poca memoria y puede ser infinito:

\`\`\`
def cuenta_regresiva(n):
    while n > 0:
        yield n
        n -= 1

for x in cuenta_regresiva(3):
    print(x)          # 3, 2, 1

print(list(cuenta_regresiva(5)))  # [5, 4, 3, 2, 1]
\`\`\`

Cada vez que se pide el siguiente valor, la función continúa desde donde quedó el último \`yield\`.

La serie de **Fibonacci** empieza 0, 1 y cada número es la suma de los dos anteriores: 0, 1, 1, 2, 3, 5, 8, 13...`,
        exercise: 'Escribí un generador fibonacci(n) que produzca los primeros n números de Fibonacci. list(fibonacci(7)) → [0, 1, 1, 2, 3, 5, 8].',
        starter: 'def fibonacci(n):\n    # completá acá usando yield\n    pass\n\nprint(list(fibonacci(7)))\n',
        solution: 'def fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        yield a\n        a, b = b, a + b\n\nprint(list(fibonacci(7)))\n',
        tests: `import types
assert isinstance(fibonacci(3), types.GeneratorType), 'fibonacci tiene que ser un generador (usá yield, no return de una lista).'
assert list(fibonacci(7)) == [0, 1, 1, 2, 3, 5, 8], 'list(fibonacci(7)) tiene que dar [0, 1, 1, 2, 3, 5, 8].'
assert list(fibonacci(0)) == [], 'fibonacci(0) no produce nada.'
assert list(fibonacci(12))[-1] == 89, 'El número 12 de la serie es 89.'`,
        hint: 'Usá dos variables a, b = 0, 1 y en cada vuelta: yield a y después a, b = b, a + b.',
      },
    ],
    project: {
      title: 'Analizador de gastos',
      intro: `Para cerrar el curso vas a armar un **analizador de gastos** personales, combinando todo lo práctico que aprendiste: **JSON**, **fechas**, **diccionarios**, **ordenar con lambda**, **generadores** y **archivos**.

Los gastos llegan como texto JSON, por ejemplo:

\`\`\`
[{"fecha": "03/01/2025", "categoria": "comida", "monto": 12500.5},
 {"fecha": "10/02/2025", "categoria": "servicios", "monto": 25000}]
\`\`\`

Completá las cinco funciones. Cada requisito se prueba por separado con estos datos de ejemplo (la variable \`DATOS\`), así ves qué funciona y qué falta.`,
      starter: `import json
from datetime import datetime

DATOS = """[
  {"fecha": "03/01/2025", "categoria": "comida", "monto": 12500.5},
  {"fecha": "15/01/2025", "categoria": "transporte", "monto": 3200},
  {"fecha": "02/02/2025", "categoria": "comida", "monto": 8700.25},
  {"fecha": "10/02/2025", "categoria": "servicios", "monto": 25000},
  {"fecha": "28/02/2025", "categoria": "transporte", "monto": 1800}
]"""


def cargar_gastos(texto_json):
    """Devuelve una lista de diccionarios con la fecha convertida a date."""
    pass


def total_por_categoria(gastos):
    """Devuelve {categoria: total} con los totales redondeados a 2 decimales."""
    pass


def top_gastos(gastos, n):
    """Devuelve los n gastos más grandes, de mayor a menor."""
    pass


def gastos_del_mes(gastos, mes, anio):
    """Generador: produce los gastos de ese mes y año."""
    pass


def guardar_reporte(nombre_archivo, gastos):
    """Escribe una línea "categoria: total" por categoría (en orden alfabético) y devuelve cuántas líneas escribió."""
    pass


gastos = cargar_gastos(DATOS)
`,
      solution: `import json
from datetime import datetime

DATOS = """[
  {"fecha": "03/01/2025", "categoria": "comida", "monto": 12500.5},
  {"fecha": "15/01/2025", "categoria": "transporte", "monto": 3200},
  {"fecha": "02/02/2025", "categoria": "comida", "monto": 8700.25},
  {"fecha": "10/02/2025", "categoria": "servicios", "monto": 25000},
  {"fecha": "28/02/2025", "categoria": "transporte", "monto": 1800}
]"""


def cargar_gastos(texto_json):
    """Devuelve una lista de diccionarios con la fecha convertida a date."""
    gastos = []
    for g in json.loads(texto_json):
        fecha = datetime.strptime(g["fecha"], "%d/%m/%Y").date()
        gastos.append({"fecha": fecha, "categoria": g["categoria"], "monto": g["monto"]})
    return gastos


def total_por_categoria(gastos):
    """Devuelve {categoria: total} con los totales redondeados a 2 decimales."""
    totales = {}
    for g in gastos:
        totales[g["categoria"]] = totales.get(g["categoria"], 0) + g["monto"]
    return {categoria: round(total, 2) for categoria, total in totales.items()}


def top_gastos(gastos, n):
    """Devuelve los n gastos más grandes, de mayor a menor."""
    return sorted(gastos, key=lambda g: g["monto"], reverse=True)[:n]


def gastos_del_mes(gastos, mes, anio):
    """Generador: produce los gastos de ese mes y año."""
    for g in gastos:
        if g["fecha"].month == mes and g["fecha"].year == anio:
            yield g


def guardar_reporte(nombre_archivo, gastos):
    """Escribe una línea "categoria: total" por categoría (en orden alfabético) y devuelve cuántas líneas escribió."""
    totales = total_por_categoria(gastos)
    with open(nombre_archivo, "w", encoding="utf-8") as f:
        for categoria in sorted(totales):
            f.write(f"{categoria}: {totales[categoria]}\\n")
    return len(totales)


gastos = cargar_gastos(DATOS)
print(total_por_categoria(gastos))
print([g["monto"] for g in top_gastos(gastos, 2)])
print(sum(g["monto"] for g in gastos_del_mes(gastos, 2, 2025)))
`,
      setup: `from datetime import date as _date
_DATOS = """[
  {"fecha": "03/01/2025", "categoria": "comida", "monto": 12500.5},
  {"fecha": "15/01/2025", "categoria": "transporte", "monto": 3200},
  {"fecha": "02/02/2025", "categoria": "comida", "monto": 8700.25},
  {"fecha": "10/02/2025", "categoria": "servicios", "monto": 25000},
  {"fecha": "28/02/2025", "categoria": "transporte", "monto": 1800}
]"""`,
      requirements: [
        {
          id: 'cargar',
          text: 'cargar_gastos(texto_json) devuelve una lista de diccionarios con "fecha" convertida a fecha (date), "categoria" y "monto".',
          test: `gs = cargar_gastos(_DATOS)
assert isinstance(gs, list) and len(gs) == 5, 'cargar_gastos tiene que devolver una lista con los 5 gastos.'
fecha = gs[0]["fecha"]
assert hasattr(fecha, "year") and (fecha.year, fecha.month, fecha.day) == (2025, 1, 3), 'La fecha "03/01/2025" tiene que convertirse a date(2025, 1, 3). Usá datetime.strptime(..., "%d/%m/%Y").date().'
assert gs[0]["categoria"] == "comida" and gs[0]["monto"] == 12500.5, 'Cada gasto tiene que conservar "categoria" y "monto".'`,
        },
        {
          id: 'totales',
          text: 'total_por_categoria(gastos) devuelve {categoria: total} redondeado a 2 decimales.',
          test: `_gs = cargar_gastos(_DATOS)
assert isinstance(_gs, list) and len(_gs) == 5, 'Este requisito usa cargar_gastos: completala primero.'
assert total_por_categoria(cargar_gastos(_DATOS)) == {"comida": 21200.75, "transporte": 5000, "servicios": 25000}, 'Los totales tienen que ser {"comida": 21200.75, "transporte": 5000, "servicios": 25000}.'
assert total_por_categoria([]) == {}, 'Sin gastos, el resultado es un diccionario vacío.'`,
        },
        {
          id: 'top',
          text: 'top_gastos(gastos, n) devuelve los n gastos más grandes, de mayor a menor.',
          test: `_gs = cargar_gastos(_DATOS)
assert isinstance(_gs, list) and len(_gs) == 5, 'Este requisito usa cargar_gastos: completala primero.'
top = top_gastos(cargar_gastos(_DATOS), 2)
assert [g["monto"] for g in top] == [25000, 12500.5], 'Los 2 gastos más grandes son 25000 y 12500.5 (en ese orden).'`,
        },
        {
          id: 'mes',
          text: 'gastos_del_mes(gastos, mes, anio) es un generador (usa yield) que produce solo los gastos de ese mes.',
          test: `_gs = cargar_gastos(_DATOS)
assert isinstance(_gs, list) and len(_gs) == 5, 'Este requisito usa cargar_gastos: completala primero.'
import types
gen = gastos_del_mes(cargar_gastos(_DATOS), 2, 2025)
assert isinstance(gen, types.GeneratorType), 'gastos_del_mes tiene que ser un generador: usá yield.'
febrero = list(gen)
assert len(febrero) == 3 and round(sum(g["monto"] for g in febrero), 2) == 35500.25, 'En febrero de 2025 hay 3 gastos que suman 35500.25.'
assert list(gastos_del_mes(cargar_gastos(_DATOS), 3, 2025)) == [], 'En marzo de 2025 no hay gastos.'`,
        },
        {
          id: 'reporte',
          text: 'guardar_reporte(nombre_archivo, gastos) escribe "categoria: total" por línea en orden alfabético y devuelve la cantidad de líneas.',
          test: `_gs = cargar_gastos(_DATOS)
assert isinstance(_gs, list) and len(_gs) == 5, 'Este requisito usa cargar_gastos: completala primero.'
n = guardar_reporte("_reporte.txt", cargar_gastos(_DATOS))
assert n == 3, 'guardar_reporte tiene que devolver 3 (una línea por categoría).'
with open("_reporte.txt", encoding="utf-8") as f:
    lineas = f.read().splitlines()
assert lineas == ["comida: 21200.75", "servicios: 25000", "transporte: 5000"], 'El archivo tiene que tener: "comida: 21200.75", "servicios: 25000", "transporte: 5000".'`,
        },
      ],
      concepts: ['modulos', 'funciones', 'diccionarios', 'comprensiones', 'lambda', 'generadores', 'archivos', 'for'],
    },
  },  {
    id: 'algoritmos',
    title: 'Algoritmos con Python',
    description: 'Pensá como programador: búsqueda binaria, recursión, ordenamiento, pilas, conjuntos y cómo elegir la estructura de datos correcta.',
    level: 'Intermedio',
    lessons: [
      {
        id: 'tuplas-conjuntos',
        title: 'Tuplas y conjuntos',
        content: `Además de listas y diccionarios, Python tiene dos colecciones muy útiles.

Una **tupla** es como una lista que no se puede modificar. Se escribe con paréntesis y sirve para agrupar datos que van juntos:

\`\`\`
punto = (3, 4)
x, y = punto          # "desempaquetar": x = 3, y = 4
print(x + y)          # 7
\`\`\`

Un **conjunto** (\`set\`) guarda elementos **sin repetir** y sin orden. Preguntar si algo está adentro es instantáneo, aunque tenga millones de elementos:

\`\`\`
colores = {"rojo", "verde", "rojo"}
print(colores)                 # {'rojo', 'verde'}
print("verde" in colores)      # True

a = {1, 2, 3}
b = {2, 3, 4}
print(a & b)   # {2, 3}       intersección: en los dos
print(a | b)   # {1, 2, 3, 4} unión: en alguno
print(a - b)   # {1}          diferencia: en a pero no en b
\`\`\`

Con \`set(lista)\` convertís una lista en conjunto (y se van los repetidos). Con \`sorted(conjunto)\` obtenés una lista ordenada.`,
        exercise: 'Escribí en_comun(a, b) que reciba dos listas y devuelva una lista ORDENADA con los elementos que están en las dos, sin repetir. en_comun([3, 1, 2, 3], [3, 4, 1]) → [1, 3].',
        starter: 'def en_comun(a, b):\n    # completá acá\n    pass\n\nprint(en_comun([3, 1, 2, 3], [3, 4, 1]))\n',
        solution: 'def en_comun(a, b):\n    return sorted(set(a) & set(b))\n\nprint(en_comun([3, 1, 2, 3], [3, 4, 1]))\n',
        tests: `assert en_comun([3, 1, 2, 3], [3, 4, 1]) == [1, 3], 'en_comun([3, 1, 2, 3], [3, 4, 1]) tiene que dar [1, 3].'
assert en_comun([1, 2], [3, 4]) == [], 'Si no hay elementos en común, el resultado es [].'
assert en_comun(["b", "a", "b"], ["a", "b", "c"]) == ["a", "b"], 'También tiene que funcionar con textos: ["a", "b"].'`,
        hint: 'Convertí las dos listas con set(...), usá & para la intersección y sorted(...) para ordenar.',
      },
      {
        id: 'busqueda-binaria',
        title: 'Búsqueda binaria',
        content: `Para encontrar un número en una lista, lo más simple es revisar los elementos uno por uno (**búsqueda lineal**). Con un millón de elementos, pueden ser un millón de pasos.

Si la lista está **ordenada**, hay algo mucho mejor: la **búsqueda binaria**. Es lo que hacés al buscar una palabra en el diccionario:

- Mirás el elemento del medio.
- Si es el que buscás, listo.
- Si el buscado es más grande, descartás toda la mitad izquierda; si es más chico, la derecha.
- Repetís con la mitad que queda.

Como en cada paso se descarta la mitad, con un millón de elementos alcanzan **20 pasos**.

\`\`\`
izquierda, derecha = 0, len(lista) - 1
while izquierda <= derecha:
    medio = (izquierda + derecha) // 2
    # comparar lista[medio] con lo que buscás
    # y mover izquierda o derecha
\`\`\``,
        exercise: 'Escribí busqueda_binaria(lista, x) que reciba una lista ordenada y devuelva la posición de x, o -1 si no está. Tiene que ser binaria: no revises todos los elementos.',
        starter: 'def busqueda_binaria(lista, x):\n    # completá acá\n    pass\n\nprint(busqueda_binaria([2, 5, 8, 12, 16, 23, 38], 23))\n',
        solution: 'def busqueda_binaria(lista, x):\n    izquierda, derecha = 0, len(lista) - 1\n    while izquierda <= derecha:\n        medio = (izquierda + derecha) // 2\n        if lista[medio] == x:\n            return medio\n        if lista[medio] < x:\n            izquierda = medio + 1\n        else:\n            derecha = medio - 1\n    return -1\n\nprint(busqueda_binaria([2, 5, 8, 12, 16, 23, 38], 23))\n',
        tests: `datos = [2, 5, 8, 12, 16, 23, 38]
assert busqueda_binaria(datos, 23) == 5, 'busqueda_binaria([2, 5, 8, 12, 16, 23, 38], 23) tiene que dar 5.'
assert busqueda_binaria(datos, 2) == 0 and busqueda_binaria(datos, 38) == 6, 'Tiene que encontrar el primero (posición 0) y el último (posición 6).'
assert busqueda_binaria(datos, 7) == -1, 'Si el número no está, devolvé -1.'
assert busqueda_binaria([], 1) == -1, 'En una lista vacía, devolvé -1.'
class _Espia(list):
    accesos = 0
    def __getitem__(self, i):
        _Espia.accesos += 1
        return list.__getitem__(self, i)
grande = _Espia(range(0, 300000, 3))
assert busqueda_binaria(grande, 150000) == 50000, 'En una lista de 100.000 números, 150000 está en la posición 50000.'
assert _Espia.accesos <= 40, f'Revisaste {_Espia.accesos} elementos: la búsqueda binaria descarta la mitad en cada paso y necesita unos 17.'`,
        hint: 'Si lista[medio] < x, lo buscado está a la derecha: izquierda = medio + 1. Si no, derecha = medio - 1.',
      },
      {
        id: 'recursion',
        title: 'Recursión',
        content: `Una función **recursiva** es una función que se llama a sí misma para resolver una versión más chica del mismo problema. Siempre necesita un **caso base**, que se resuelve sin volver a llamarse (si no, no termina nunca).

\`\`\`
def factorial(n):
    if n <= 1:                     # caso base
        return 1
    return n * factorial(n - 1)    # caso recursivo

print(factorial(5))  # 5 * 4 * 3 * 2 * 1 = 120
\`\`\`

La recursión brilla con estructuras que contienen versiones más chicas de sí mismas, como carpetas dentro de carpetas o listas dentro de listas:

\`\`\`
def contar(lista):
    total = 0
    for elemento in lista:
        if isinstance(elemento, list):
            total += contar(elemento)   # otra lista: la cuenta la misma función
        else:
            total += 1
    return total

print(contar([1, [2, 3], [4, [5]]]))  # 5
\`\`\``,
        exercise: 'Escribí aplanar(lista), recursiva, que reciba una lista que puede tener listas adentro (a cualquier profundidad) y devuelva una lista "plana" con todos los elementos en orden. aplanar([1, [2, [3, 4]], 5]) → [1, 2, 3, 4, 5].',
        starter: 'def aplanar(lista):\n    # completá acá\n    pass\n\nprint(aplanar([1, [2, [3, 4]], 5]))\n',
        solution: 'def aplanar(lista):\n    resultado = []\n    for elemento in lista:\n        if isinstance(elemento, list):\n            resultado.extend(aplanar(elemento))\n        else:\n            resultado.append(elemento)\n    return resultado\n\nprint(aplanar([1, [2, [3, 4]], 5]))\n',
        tests: `assert aplanar([1, [2, [3, 4]], 5]) == [1, 2, 3, 4, 5], 'aplanar([1, [2, [3, 4]], 5]) tiene que dar [1, 2, 3, 4, 5].'
assert aplanar([]) == [], 'aplanar([]) tiene que dar [].'
assert aplanar([[[["a"]]], "b"]) == ["a", "b"], 'Tiene que funcionar a cualquier profundidad: [[[["a"]]], "b"] → ["a", "b"].'
assert aplanar([1, 2]) == [1, 2], 'Una lista que ya es plana queda igual.'
assert "aplanar" in aplanar.__code__.co_names, 'aplanar tiene que llamarse a sí misma (recursión) cuando encuentra una lista.'`,
        hint: 'Recorré la lista: si el elemento es una lista (isinstance(elemento, list)), sumá con extend lo que devuelve aplanar(elemento); si no, agregalo con append.',
      },
      {
        id: 'ordenamiento',
        title: 'Algoritmos de ordenamiento',
        content: `\`sorted()\` ordena en un instante, pero ¿cómo lo haría uno a mano? Entenderlo te enseña a pensar algoritmos.

El **ordenamiento por inserción** es el que usás con las cartas: tomás una carta por vez y la metés en su lugar entre las que ya tenés ordenadas.

\`\`\`
cartas = [7, 3, 9, 1]
ordenadas = []
for carta in cartas:
    i = 0
    while i < len(ordenadas) and ordenadas[i] <= carta:
        i += 1                     # avanzar hasta el lugar de la carta
    ordenadas.insert(i, carta)     # meterla ahí
    print(ordenadas)
# [7]  →  [3, 7]  →  [3, 7, 9]  →  [1, 3, 7, 9]
\`\`\`

\`lista.insert(posicion, valor)\` mete un valor en esa posición y corre el resto.

Hay otros algoritmos (burbuja, selección, merge sort, quicksort). Python usa uno llamado **Timsort**, que combina inserción y merge sort.`,
        exercise: 'Escribí ordenar(lista) que devuelva una lista NUEVA con los mismos números de menor a mayor, sin usar sorted() ni .sort() (y sin modificar la original).',
        starter: 'def ordenar(lista):\n    # completá acá (sin sorted ni .sort)\n    pass\n\nprint(ordenar([5, 2, 9, 1, 5, 6]))\n',
        solution: 'def ordenar(lista):\n    resultado = []\n    for x in lista:\n        i = 0\n        while i < len(resultado) and resultado[i] <= x:\n            i += 1\n        resultado.insert(i, x)\n    return resultado\n\nprint(ordenar([5, 2, 9, 1, 5, 6]))\n',
        tests: `nombres = ordenar.__code__.co_names
assert "sorted" not in nombres and "sort" not in nombres, 'Esta vez no vale usar sorted() ni .sort(): ordená vos la lista.'
datos = [5, 2, 9, 1, 5, 6]
assert ordenar(datos) == [1, 2, 5, 5, 6, 9], 'ordenar([5, 2, 9, 1, 5, 6]) tiene que dar [1, 2, 5, 5, 6, 9].'
assert datos == [5, 2, 9, 1, 5, 6], 'No modifiques la lista original: devolvé una nueva.'
assert ordenar([]) == [] and ordenar([3]) == [3], 'Una lista vacía o de un elemento ya está ordenada.'
assert ordenar([-1, -5, 0, 10, -5]) == [-5, -5, -1, 0, 10], 'Tiene que funcionar con negativos y repetidos.'`,
        hint: 'Empezá con resultado = [] y para cada número buscá con un while la posición donde va, y usá resultado.insert(i, x).',
      },
      {
        id: 'pilas-colas',
        title: 'Pilas y colas',
        content: `Dos formas clásicas de organizar datos según el orden en que salen:

**Pila** (*stack*): el último que entra es el primero que sale, como una pila de platos. En Python, una lista con \`append\` y \`pop\`:

\`\`\`
pila = []
pila.append("a")
pila.append("b")
print(pila.pop())   # "b" (el último)
print(pila)         # ["a"]
\`\`\`

**Cola** (*queue*): el primero que entra es el primero que sale, como la fila del banco. Se usa \`deque\`, que saca del principio sin esfuerzo:

\`\`\`
from collections import deque

fila = deque(["Ana", "Beto"])
fila.append("Caro")        # llega al final
print(fila.popleft())      # "Ana" (la primera)
\`\`\`

Las pilas sirven para "deshacer" (Ctrl+Z), para el botón Atrás del navegador y para revisar que los paréntesis de una expresión estén bien cerrados.`,
        exercise: 'Escribí balanceado(texto) que devuelva True si los paréntesis (), corchetes [] y llaves {} del texto están bien abiertos y cerrados, y False si no. Usá una pila. "([]{})" → True, "([)]" → False.',
        starter: 'def balanceado(texto):\n    # completá acá usando una pila\n    pass\n\nprint(balanceado("(a[b]{c})"))\n',
        solution: 'def balanceado(texto):\n    pares = {")": "(", "]": "[", "}": "{"}\n    pila = []\n    for c in texto:\n        if c in "([{":\n            pila.append(c)\n        elif c in pares:\n            if not pila or pila.pop() != pares[c]:\n                return False\n    return len(pila) == 0\n\nprint(balanceado("(a[b]{c})"))\n',
        tests: `assert balanceado("(a[b]{c})") is True, 'balanceado("(a[b]{c})") tiene que dar True.'
assert balanceado("([)]") is False, 'balanceado("([)]") tiene que dar False: se cierra en el orden equivocado.'
assert balanceado("((") is False, 'balanceado("((") tiene que dar False: quedan paréntesis sin cerrar.'
assert balanceado("())") is False, 'balanceado("())") tiene que dar False: hay un cierre de más.'
assert balanceado("") is True, 'Un texto vacío está balanceado (True).'
assert balanceado("x = {1: [2, (3)]}") is True, 'balanceado("x = {1: [2, (3)]}") tiene que dar True: los otros caracteres se ignoran.'`,
        hint: 'Cuando ves una apertura, apilala. Cuando ves un cierre, la pila no puede estar vacía y lo que sacás con pop() tiene que ser la apertura que le corresponde. Al final, la pila tiene que quedar vacía.',
      },
      {
        id: 'contar',
        title: 'Contar con Counter',
        content: `Contar cuántas veces aparece cada cosa es un problema clásico. Con un diccionario:

\`\`\`
votos = ["sí", "no", "sí", "sí"]
conteo = {}
for v in votos:
    conteo[v] = conteo.get(v, 0) + 1
print(conteo)   # {'sí': 3, 'no': 1}
\`\`\`

El módulo \`collections\` trae \`Counter\`, que hace exactamente eso:

\`\`\`
from collections import Counter

conteo = Counter(["sí", "no", "sí", "sí"])
print(conteo["sí"])            # 3
print(conteo.most_common(1))   # [('sí', 3)]
\`\`\`

\`most_common(n)\` devuelve una lista con los \`n\` más frecuentes, como tuplas \`(elemento, cantidad)\`.`,
        exercise: 'Escribí mas_frecuentes(texto, n) que devuelva una lista con las n palabras que más se repiten en el texto, en minúsculas y de la más a la menos frecuente. mas_frecuentes("el gato y el perro y el loro", 2) → ["el", "y"].',
        starter: 'def mas_frecuentes(texto, n):\n    # completá acá\n    pass\n\nprint(mas_frecuentes("el gato y el perro y el loro", 2))\n',
        solution: 'from collections import Counter\n\n\ndef mas_frecuentes(texto, n):\n    conteo = Counter(texto.lower().split())\n    return [palabra for palabra, _ in conteo.most_common(n)]\n\nprint(mas_frecuentes("el gato y el perro y el loro", 2))\n',
        tests: `assert mas_frecuentes("el gato y el perro y el loro", 2) == ["el", "y"], 'mas_frecuentes("el gato y el perro y el loro", 2) tiene que dar ["el", "y"].'
assert mas_frecuentes("Hola hola HOLA chau", 1) == ["hola"], 'No distingas mayúsculas: "Hola hola HOLA chau" → ["hola"].'
assert mas_frecuentes("", 3) == [], 'Un texto vacío no tiene palabras: [].'`,
        hint: 'Counter(texto.lower().split()) cuenta las palabras. Después quedate solo con la palabra de cada tupla de most_common(n).',
      },
      {
        id: 'matrices',
        title: 'Matrices: listas de listas',
        content: `Una tabla o grilla se representa con una **lista de listas**: cada lista interna es una fila.

\`\`\`
tablero = [
    [1, 2, 3],
    [4, 5, 6],
]
print(tablero[1][2])     # fila 1, columna 2 → 6
print(len(tablero))      # 2 filas
print(len(tablero[0]))   # 3 columnas
\`\`\`

Para recorrerla se usan dos bucles, uno dentro del otro:

\`\`\`
for fila in tablero:
    for valor in fila:
        print(valor, end=" ")
    print()
\`\`\`

Y con comprensiones podés armar matrices nuevas:

\`\`\`
dobles = [[valor * 2 for valor in fila] for fila in tablero]
# [[2, 4, 6], [8, 10, 12]]
\`\`\``,
        exercise: 'Escribí transponer(matriz) que devuelva la matriz transpuesta: las filas pasan a ser columnas. transponer([[1, 2, 3], [4, 5, 6]]) → [[1, 4], [2, 5], [3, 6]]. Una matriz vacía da [].',
        starter: 'def transponer(matriz):\n    # completá acá\n    pass\n\nprint(transponer([[1, 2, 3], [4, 5, 6]]))\n',
        solution: 'def transponer(matriz):\n    if not matriz:\n        return []\n    return [[fila[c] for fila in matriz] for c in range(len(matriz[0]))]\n\nprint(transponer([[1, 2, 3], [4, 5, 6]]))\n',
        tests: `m = [[1, 2, 3], [4, 5, 6]]
assert transponer(m) == [[1, 4], [2, 5], [3, 6]], 'transponer([[1, 2, 3], [4, 5, 6]]) tiene que dar [[1, 4], [2, 5], [3, 6]].'
assert m == [[1, 2, 3], [4, 5, 6]], 'No modifiques la matriz original.'
assert transponer([[7]]) == [[7]], 'transponer([[7]]) tiene que dar [[7]].'
assert transponer([]) == [], 'transponer([]) tiene que dar [].'
assert transponer([[1, 2]]) == [[1], [2]], 'Una fila se convierte en una columna: [[1, 2]] → [[1], [2]].'`,
        hint: 'La columna c de la matriz es [fila[c] for fila in matriz]. Hacé eso para cada c en range(len(matriz[0])).',
      },
      {
        id: 'eficiencia',
        title: 'Eficiencia: elegir bien la estructura',
        content: `Dos programas pueden dar el mismo resultado y uno tardar un segundo y el otro una hora. Muchas veces la diferencia está en la estructura de datos.

Preguntar \`x in lista\` obliga a Python a revisar la lista elemento por elemento. Preguntar \`x in conjunto\` (o en las claves de un diccionario) es **instantáneo**, sin importar el tamaño.

\`\`\`
# Lento con listas grandes: cada "in" recorre la lista
vistos = []
for x in datos:
    if x in vistos: ...
    vistos.append(x)

# Rápido: el "in" de un set no recorre nada
vistos = set()
for x in datos:
    if x in vistos: ...
    vistos.add(x)
\`\`\`

Esto se mide con la notación **O grande**: buscar en una lista es O(n) (crece con el tamaño), buscar en un set es O(1) (constante). Con un millón de datos, la diferencia es enorme.`,
        exercise: 'Escribí primer_repetido(lista) que devuelva el primer elemento que aparece por segunda vez al recorrer la lista, o None si no hay repetidos. Usá un set. primer_repetido([3, 1, 4, 1, 5, 3]) → 1.',
        starter: 'def primer_repetido(lista):\n    # completá acá usando un set\n    pass\n\nprint(primer_repetido([3, 1, 4, 1, 5, 3]))\n',
        solution: 'def primer_repetido(lista):\n    vistos = set()\n    for x in lista:\n        if x in vistos:\n            return x\n        vistos.add(x)\n    return None\n\nprint(primer_repetido([3, 1, 4, 1, 5, 3]))\n',
        tests: `assert primer_repetido([3, 1, 4, 1, 5, 3]) == 1, 'primer_repetido([3, 1, 4, 1, 5, 3]) tiene que dar 1: es el primero que se repite al recorrer.'
assert primer_repetido(["a", "b", "a"]) == "a", 'primer_repetido(["a", "b", "a"]) tiene que dar "a".'
assert primer_repetido([1, 2, 3]) is None, 'Si no hay repetidos, devolvé None.'
assert primer_repetido([]) is None, 'En una lista vacía, devolvé None.'
grande = list(range(5000)) + [4999]
assert primer_repetido(grande) == 4999, 'Con 5000 números, el repetido es 4999.'`,
        hint: 'Creá vistos = set(). Para cada x: si ya está en vistos, devolvelo; si no, agregalo con vistos.add(x).',
      },
    ],
    project: {
      title: 'Organizador de biblioteca',
      intro: `Para cerrar el curso vas a programar el **organizador de una biblioteca** usando los algoritmos que aprendiste: **ordenamiento**, **búsqueda binaria**, **conteo** y **diccionarios**.

Cada libro es una tupla \`(titulo, autor, anio)\`:

\`\`\`
("Rayuela", "Julio Cortázar", 1963)
\`\`\`

Completá las cinco funciones. Cada requisito se prueba por separado con la lista \`LIBROS\`, así ves qué funciona y qué falta.`,
      starter: `LIBROS = [
    ("Rayuela", "Julio Cortázar", 1963),
    ("Ficciones", "Jorge Luis Borges", 1944),
    ("El Aleph", "Jorge Luis Borges", 1949),
    ("Cien años de soledad", "Gabriel García Márquez", 1967),
    ("Bestiario", "Julio Cortázar", 1951),
    ("El túnel", "Ernesto Sabato", 1948),
    ("Final del juego", "Julio Cortázar", 1956),
]


def ordenar_por_anio(libros):
    """Devuelve una lista NUEVA ordenada por año (del más viejo al más nuevo), sin usar sorted() ni .sort()."""
    pass


def buscar_anio(libros_ordenados, anio):
    """Búsqueda binaria en una lista ordenada por año: devuelve el título del libro de ese año, o None."""
    pass


def libros_por_autor(libros):
    """Devuelve {autor: cantidad de libros}."""
    pass


def autor_con_mas_libros(libros):
    """Devuelve una tupla (autor, cantidad) con el autor que más libros tiene."""
    pass


def por_decada(libros):
    """Devuelve {decada: [titulos]}, por ejemplo {1940: ["Ficciones", ...]}, con los títulos en el orden de la lista."""
    pass


ordenados = ordenar_por_anio(LIBROS)
`,
      solution: `LIBROS = [
    ("Rayuela", "Julio Cortázar", 1963),
    ("Ficciones", "Jorge Luis Borges", 1944),
    ("El Aleph", "Jorge Luis Borges", 1949),
    ("Cien años de soledad", "Gabriel García Márquez", 1967),
    ("Bestiario", "Julio Cortázar", 1951),
    ("El túnel", "Ernesto Sabato", 1948),
    ("Final del juego", "Julio Cortázar", 1956),
]


def ordenar_por_anio(libros):
    """Devuelve una lista NUEVA ordenada por año (del más viejo al más nuevo), sin usar sorted() ni .sort()."""
    resultado = []
    for libro in libros:
        i = 0
        while i < len(resultado) and resultado[i][2] <= libro[2]:
            i += 1
        resultado.insert(i, libro)
    return resultado


def buscar_anio(libros_ordenados, anio):
    """Búsqueda binaria en una lista ordenada por año: devuelve el título del libro de ese año, o None."""
    izquierda, derecha = 0, len(libros_ordenados) - 1
    while izquierda <= derecha:
        medio = (izquierda + derecha) // 2
        titulo, autor, anio_medio = libros_ordenados[medio]
        if anio_medio == anio:
            return titulo
        if anio_medio < anio:
            izquierda = medio + 1
        else:
            derecha = medio - 1
    return None


def libros_por_autor(libros):
    """Devuelve {autor: cantidad de libros}."""
    conteo = {}
    for titulo, autor, anio in libros:
        conteo[autor] = conteo.get(autor, 0) + 1
    return conteo


def autor_con_mas_libros(libros):
    """Devuelve una tupla (autor, cantidad) con el autor que más libros tiene."""
    conteo = libros_por_autor(libros)
    autor = max(conteo, key=lambda a: conteo[a])
    return (autor, conteo[autor])


def por_decada(libros):
    """Devuelve {decada: [titulos]}, por ejemplo {1940: ["Ficciones", ...]}, con los títulos en el orden de la lista."""
    decadas = {}
    for titulo, autor, anio in libros:
        decada = anio // 10 * 10
        decadas.setdefault(decada, []).append(titulo)
    return decadas


ordenados = ordenar_por_anio(LIBROS)
print([anio for _, _, anio in ordenados])
print(buscar_anio(ordenados, 1956))
print(autor_con_mas_libros(LIBROS))
print(por_decada(LIBROS))
`,
      setup: `_LIBROS = [
    ("Rayuela", "Julio Cortázar", 1963),
    ("Ficciones", "Jorge Luis Borges", 1944),
    ("El Aleph", "Jorge Luis Borges", 1949),
    ("Cien años de soledad", "Gabriel García Márquez", 1967),
    ("Bestiario", "Julio Cortázar", 1951),
    ("El túnel", "Ernesto Sabato", 1948),
    ("Final del juego", "Julio Cortázar", 1956),
]
_ORDENADOS = sorted(_LIBROS, key=lambda libro: libro[2])`,
      requirements: [
        {
          id: 'ordenar',
          text: 'ordenar_por_anio(libros) devuelve una lista nueva ordenada por año, sin usar sorted() ni .sort().',
          test: `_nombres = ordenar_por_anio.__code__.co_names
assert "sorted" not in _nombres and "sort" not in _nombres, 'ordenar_por_anio no puede usar sorted() ni .sort(): usá el ordenamiento por inserción.'
_copia = list(_LIBROS)
_r = ordenar_por_anio(_copia)
assert isinstance(_r, list) and [l[2] for l in _r] == [1944, 1948, 1949, 1951, 1956, 1963, 1967], 'Los años tienen que quedar 1944, 1948, 1949, 1951, 1956, 1963, 1967.'
assert _copia == _LIBROS, 'No modifiques la lista original: devolvé una nueva.'`,
        },
        {
          id: 'buscar',
          text: 'buscar_anio(libros_ordenados, anio) hace una búsqueda binaria y devuelve el título de ese año, o None.',
          test: `assert buscar_anio(_ORDENADOS, 1956) == "Final del juego", 'buscar_anio(ordenados, 1956) tiene que dar "Final del juego".'
assert buscar_anio(_ORDENADOS, 1944) == "Ficciones" and buscar_anio(_ORDENADOS, 1967) == "Cien años de soledad", 'Tiene que encontrar el primero y el último.'
assert buscar_anio(_ORDENADOS, 2000) is None, 'Si no hay libro de ese año, devolvé None.'
class _Espia(list):
    accesos = 0
    def __getitem__(self, i):
        _Espia.accesos += 1
        return list.__getitem__(self, i)
_muchos = _Espia([("Libro " + str(a), "Autor", a) for a in range(1000, 5000)])
assert buscar_anio(_muchos, 4321) == "Libro 4321", 'Con 4000 libros, el de 4321 es "Libro 4321".'
assert _Espia.accesos <= 30, 'Revisaste demasiados libros: usá búsqueda binaria (mirar el del medio y descartar la mitad).'`,
        },
        {
          id: 'autores',
          text: 'libros_por_autor(libros) devuelve un diccionario {autor: cantidad}.',
          test: `assert libros_por_autor(_LIBROS) == {"Julio Cortázar": 3, "Jorge Luis Borges": 2, "Gabriel García Márquez": 1, "Ernesto Sabato": 1}, 'Cortázar tiene 3 libros, Borges 2, García Márquez 1 y Sabato 1.'
assert libros_por_autor([]) == {}, 'Sin libros, el resultado es {}.'`,
        },
        {
          id: 'mas-libros',
          text: 'autor_con_mas_libros(libros) devuelve (autor, cantidad) del autor con más libros.',
          test: `assert autor_con_mas_libros(_LIBROS) == ("Julio Cortázar", 3), 'autor_con_mas_libros tiene que dar ("Julio Cortázar", 3).'
assert autor_con_mas_libros([("A", "Borges", 1944), ("B", "Borges", 1949), ("C", "Sabato", 1948)]) == ("Borges", 2), 'Con dos libros de Borges y uno de Sabato, el resultado es ("Borges", 2).'`,
        },
        {
          id: 'decadas',
          text: 'por_decada(libros) agrupa los títulos por década: {1940: [...], 1950: [...], 1960: [...]}.',
          test: `assert por_decada(_LIBROS) == {1960: ["Rayuela", "Cien años de soledad"], 1940: ["Ficciones", "El Aleph", "El túnel"], 1950: ["Bestiario", "Final del juego"]}, 'Tiene que dar 1940: Ficciones, El Aleph, El túnel; 1950: Bestiario, Final del juego; 1960: Rayuela, Cien años de soledad.'
assert por_decada([]) == {}, 'Sin libros, el resultado es {}.'`,
        },
      ],
      concepts: ['funciones', 'while', 'for', 'listas', 'diccionarios', 'condicionales'],
    },
  },
  {
    id: 'poo',
    title: 'Programación orientada a objetos',
    description: 'Diseñá programas con clases: métodos especiales, herencia, propiedades, dataclasses, composición y tus propias excepciones.',
    level: 'Intermedio',
    lessons: [
      {
        id: 'metodos-especiales',
        title: 'Métodos especiales',
        content: `Los métodos con doble guion bajo (*dunder*) le enseñan a tus objetos a funcionar con las herramientas de Python:

\`\`\`
class Dinero:
    def __init__(self, monto):
        self.monto = monto

    def __str__(self):             # lo que muestra print()
        return f"$ {self.monto}"

    def __eq__(self, otro):         # qué significa ==
        return self.monto == otro.monto

    def __add__(self, otro):        # qué significa +
        return Dinero(self.monto + otro.monto)

print(Dinero(100) + Dinero(50))     # $ 150
print(Dinero(10) == Dinero(10))     # True
\`\`\`

Sin \`__eq__\`, dos objetos distintos nunca son iguales aunque tengan los mismos datos. Sin \`__str__\`, \`print\` muestra algo como \`<Dinero object at 0x...>\`.

Otros útiles: \`__lt__\` (\`<\`), \`__len__\` (\`len()\`), \`__repr__\` (cómo se ve en la consola).`,
        exercise: 'Completá la clase Vector: str(Vector(3, 4)) tiene que dar "Vector(3, 4)", v1 + v2 tiene que devolver un Vector nuevo con las coordenadas sumadas, == tiene que comparar coordenadas, y el método largo() tiene que devolver la longitud (raíz de x² + y²).',
        starter: 'import math\n\n\nclass Vector:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n    # agregá __str__, __eq__, __add__ y largo\n\n\nprint(Vector(3, 4))\n',
        solution: 'import math\n\n\nclass Vector:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n    def __str__(self):\n        return f"Vector({self.x}, {self.y})"\n\n    def __eq__(self, otro):\n        return self.x == otro.x and self.y == otro.y\n\n    def __add__(self, otro):\n        return Vector(self.x + otro.x, self.y + otro.y)\n\n    def largo(self):\n        return math.sqrt(self.x ** 2 + self.y ** 2)\n\n\nprint(Vector(3, 4))\nprint(Vector(1, 2) + Vector(3, 4))\n',
        tests: `v = Vector(3, 4)
assert str(v) == "Vector(3, 4)", 'str(Vector(3, 4)) tiene que dar "Vector(3, 4)". Definí __str__.'
assert Vector(1, 2) == Vector(1, 2), 'Vector(1, 2) == Vector(1, 2) tiene que dar True. Definí __eq__.'
assert Vector(1, 1) != Vector(1, 2), 'Vectores con coordenadas distintas no son iguales.'
suma = Vector(1, 2) + Vector(3, 4)
assert isinstance(suma, Vector) and (suma.x, suma.y) == (4, 6), 'Vector(1, 2) + Vector(3, 4) tiene que dar Vector(4, 6). Definí __add__.'
assert hasattr(v, "largo") and v.largo() == 5.0, 'Vector(3, 4).largo() tiene que dar 5.0.'`,
        hint: 'Para la longitud: math.sqrt(self.x ** 2 + self.y ** 2). En __add__ devolvé Vector(self.x + otro.x, self.y + otro.y).',
      },
      {
        id: 'herencia',
        title: 'Herencia',
        content: `Con **herencia**, una clase nueva aprovecha todo lo de otra y agrega o cambia lo que necesita:

\`\`\`
class Animal:
    def __init__(self, nombre):
        self.nombre = nombre

    def presentarse(self):
        return f"Soy {self.nombre}"

class Perro(Animal):                     # Perro hereda de Animal
    def __init__(self, nombre, raza):
        super().__init__(nombre)         # reutiliza el __init__ de Animal
        self.raza = raza

    def presentarse(self):               # redefine (sobrescribe) el método
        return super().presentarse() + f", un {self.raza}"

print(Perro("Toby", "caniche").presentarse())
# Soy Toby, un caniche
\`\`\`

- \`class Hija(Madre)\` indica de quién hereda.
- \`super()\` llama a la versión de la clase madre.
- \`isinstance(toby, Animal)\` es \`True\`: un Perro también es un Animal.`,
        exercise: 'Creá la clase Gerente que herede de Empleado, reciba (nombre, sueldo, bono) y redefina sueldo_anual() para que sume el bono al sueldo anual del empleado. Gerente("Ana", 1000, 500).sueldo_anual() → 13500.',
        starter: 'class Empleado:\n    def __init__(self, nombre, sueldo):\n        self.nombre = nombre\n        self.sueldo = sueldo\n\n    def sueldo_anual(self):\n        return self.sueldo * 13  # 12 meses + aguinaldo\n\n\nclass Gerente:\n    # completá acá\n    pass\n',
        solution: 'class Empleado:\n    def __init__(self, nombre, sueldo):\n        self.nombre = nombre\n        self.sueldo = sueldo\n\n    def sueldo_anual(self):\n        return self.sueldo * 13  # 12 meses + aguinaldo\n\n\nclass Gerente(Empleado):\n    def __init__(self, nombre, sueldo, bono):\n        super().__init__(nombre, sueldo)\n        self.bono = bono\n\n    def sueldo_anual(self):\n        return super().sueldo_anual() + self.bono\n\n\nprint(Gerente("Ana", 1000, 500).sueldo_anual())\n',
        tests: `assert issubclass(Gerente, Empleado), 'Gerente tiene que heredar de Empleado: class Gerente(Empleado).'
g = Gerente("Ana", 1000, 500)
assert g.nombre == "Ana" and g.sueldo == 1000, 'Usá super().__init__(nombre, sueldo) para guardar nombre y sueldo.'
assert g.sueldo_anual() == 13500, 'Gerente("Ana", 1000, 500).sueldo_anual() tiene que dar 13500.'
assert Empleado("Beto", 1000).sueldo_anual() == 13000, 'El sueldo anual de un Empleado común no tiene que cambiar.'
assert isinstance(g, Empleado), 'Un Gerente también tiene que ser un Empleado.'`,
        hint: 'class Gerente(Empleado): en __init__ llamá a super().__init__(nombre, sueldo) y guardá self.bono; en sueldo_anual devolvé super().sueldo_anual() + self.bono.',
      },
      {
        id: 'propiedades',
        title: 'Propiedades',
        content: `Una **propiedad** parece un atributo común, pero por detrás ejecuta un método. Sirve para validar datos o para calcular valores en el momento:

\`\`\`
class Producto:
    def __init__(self, precio):
        self.precio = precio        # esto ya pasa por el setter

    @property
    def precio(self):               # se ejecuta al LEER p.precio
        return self._precio

    @precio.setter
    def precio(self, valor):        # se ejecuta al ESCRIBIR p.precio = ...
        if valor < 0:
            raise ValueError("El precio no puede ser negativo")
        self._precio = valor

    @property
    def con_iva(self):              # propiedad calculada, solo de lectura
        return self.precio * 1.21

p = Producto(100)
print(p.con_iva)    # 121.0
p.precio = -5       # ValueError
\`\`\`

El guion bajo en \`_precio\` indica "dato interno, no lo toques de afuera".`,
        exercise: 'Completá la clase Temperatura: la propiedad celsius tiene que lanzar ValueError si el valor es menor a -273.15 (el cero absoluto), y la propiedad fahrenheit (solo lectura) tiene que devolver celsius * 9 / 5 + 32.',
        starter: 'class Temperatura:\n    def __init__(self, celsius):\n        self.celsius = celsius\n\n    # agregá la propiedad celsius (con su setter) y la propiedad fahrenheit\n\n\nt = Temperatura(25)\nprint(t.celsius)\n',
        solution: 'class Temperatura:\n    def __init__(self, celsius):\n        self.celsius = celsius\n\n    @property\n    def celsius(self):\n        return self._celsius\n\n    @celsius.setter\n    def celsius(self, valor):\n        if valor < -273.15:\n            raise ValueError("No puede hacer más frío que el cero absoluto")\n        self._celsius = valor\n\n    @property\n    def fahrenheit(self):\n        return self.celsius * 9 / 5 + 32\n\n\nt = Temperatura(25)\nprint(t.celsius, t.fahrenheit)\n',
        tests: `assert isinstance(getattr(Temperatura, "fahrenheit", None), property), 'fahrenheit tiene que ser una propiedad: poné @property arriba del método.'
assert isinstance(getattr(Temperatura, "celsius", None), property), 'celsius tiene que ser una propiedad con @property y @celsius.setter.'
t = Temperatura(25)
assert t.fahrenheit == 77, 'Temperatura(25).fahrenheit tiene que dar 77.'
t.celsius = 100
assert t.celsius == 100 and t.fahrenheit == 212, 'Después de t.celsius = 100, fahrenheit tiene que dar 212.'
try:
    t.celsius = -500
    assert False, 'Asignar -500 grados tiene que lanzar ValueError.'
except ValueError:
    pass
assert t.celsius == 100, 'Un valor rechazado no tiene que cambiar la temperatura.'
try:
    Temperatura(-300)
    assert False, 'Temperatura(-300) tiene que lanzar ValueError.'
except ValueError:
    pass`,
        hint: 'Guardá el valor en self._celsius dentro del setter (@celsius.setter). El getter (@property def celsius) devuelve self._celsius.',
      },
      {
        id: 'metodos-de-clase',
        title: 'Métodos de clase y estáticos',
        content: `No todos los métodos trabajan sobre un objeto ya creado:

- \`@classmethod\` recibe la **clase** (\`cls\`) en lugar del objeto. Se usa mucho para crear objetos de otra forma ("constructores alternativos").
- \`@staticmethod\` no recibe ni la clase ni el objeto: es una función común que vive dentro de la clase porque tiene que ver con ella.

\`\`\`
class Hora:
    def __init__(self, horas, minutos):
        self.horas = horas
        self.minutos = minutos

    @classmethod
    def desde_texto(cls, texto):        # Hora.desde_texto("14:30")
        h, m = texto.split(":")
        return cls(int(h), int(m))

    @staticmethod
    def es_valida(horas, minutos):      # Hora.es_valida(25, 0) → False
        return 0 <= horas < 24 and 0 <= minutos < 60

h = Hora.desde_texto("14:30")
print(h.horas, h.minutos)   # 14 30
\`\`\`

Con \`f"{numero:02d}"\` mostrás un número con dos dígitos: \`f"{7:02d}"\` → \`"07"\`.`,
        exercise: 'Completá la clase Fecha: el método de clase desde_texto("9/7/1816") crea una Fecha, el método estático es_bisiesto(anio) dice si un año es bisiesto, y str(fecha) da "09/07/1816". Un año es bisiesto si es divisible por 4, salvo que sea divisible por 100 y no por 400.',
        starter: 'class Fecha:\n    def __init__(self, dia, mes, anio):\n        self.dia = dia\n        self.mes = mes\n        self.anio = anio\n\n    # agregá desde_texto, es_bisiesto y __str__\n\n\nprint(Fecha(25, 5, 1810).anio)\n',
        solution: 'class Fecha:\n    def __init__(self, dia, mes, anio):\n        self.dia = dia\n        self.mes = mes\n        self.anio = anio\n\n    @classmethod\n    def desde_texto(cls, texto):\n        dia, mes, anio = texto.split("/")\n        return cls(int(dia), int(mes), int(anio))\n\n    @staticmethod\n    def es_bisiesto(anio):\n        return anio % 4 == 0 and (anio % 100 != 0 or anio % 400 == 0)\n\n    def __str__(self):\n        return f"{self.dia:02d}/{self.mes:02d}/{self.anio}"\n\n\nprint(Fecha.desde_texto("9/7/1816"))\n',
        tests: `assert hasattr(Fecha, "desde_texto"), 'Agregá el método de clase desde_texto con @classmethod.'
f = Fecha.desde_texto("9/7/1816")
assert isinstance(f, Fecha), 'desde_texto tiene que devolver una Fecha: return cls(...).'
assert (f.dia, f.mes, f.anio) == (9, 7, 1816), 'Fecha.desde_texto("9/7/1816") tiene que tener dia 9, mes 7 y anio 1816 (como números).'
assert str(f) == "09/07/1816", 'str(Fecha(9, 7, 1816)) tiene que dar "09/07/1816". Usá f"{self.dia:02d}".'
assert hasattr(Fecha, "es_bisiesto"), 'Agregá el método estático es_bisiesto con @staticmethod.'
assert Fecha.es_bisiesto(2024) is True and Fecha.es_bisiesto(2023) is False, '2024 es bisiesto y 2023 no.'
assert Fecha.es_bisiesto(1900) is False and Fecha.es_bisiesto(2000) is True, '1900 no es bisiesto (divisible por 100) pero 2000 sí (divisible por 400).'`,
        hint: 'En desde_texto separá con texto.split("/") y devolvé cls(int(dia), int(mes), int(anio)).',
      },
      {
        id: 'dataclasses',
        title: 'Dataclasses',
        content: `Muchas clases solo guardan datos, y escribir el \`__init__\`, \`__eq__\` y \`__repr__\` cada vez es repetitivo. El decorador \`@dataclass\` los genera solo a partir de los campos:

\`\`\`
from dataclasses import dataclass

@dataclass
class Alumno:
    nombre: str
    nota: float
    materia: str = "Matemática"     # valor por defecto

    def aprobo(self):
        return self.nota >= 6

a = Alumno("Lucía", 8.5)
print(a)            # Alumno(nombre='Lucía', nota=8.5, materia='Matemática')
print(a.aprobo())   # True
print(a == Alumno("Lucía", 8.5))   # True
\`\`\`

Las anotaciones (\`: str\`, \`: float\`) indican el tipo esperado de cada campo. Los campos con valor por defecto van después de los que no tienen.`,
        exercise: 'Convertí Producto en una dataclass con los campos nombre, precio y cantidad (con valor por defecto 1), y agregale el método subtotal() que devuelva precio * cantidad.',
        starter: 'from dataclasses import dataclass\n\n\nclass Producto:\n    # completá acá\n    pass\n',
        solution: 'from dataclasses import dataclass\n\n\n@dataclass\nclass Producto:\n    nombre: str\n    precio: float\n    cantidad: int = 1\n\n    def subtotal(self):\n        return self.precio * self.cantidad\n\n\nprint(Producto("Yerba", 2500, 2))\n',
        tests: `import dataclasses
assert dataclasses.is_dataclass(Producto), 'Poné @dataclass arriba de class Producto.'
campos = [f.name for f in dataclasses.fields(Producto)]
assert campos == ["nombre", "precio", "cantidad"], 'Los campos tienen que ser nombre, precio y cantidad, en ese orden.'
p = Producto("Yerba", 2500, 2)
assert p.subtotal() == 5000, 'Producto("Yerba", 2500, 2).subtotal() tiene que dar 5000.'
assert Producto("Pan", 1000).cantidad == 1, 'Si no se indica, la cantidad tiene que ser 1.'
assert Producto("A", 1, 1) == Producto("A", 1, 1), 'Dos productos con los mismos datos tienen que ser iguales (la dataclass lo hace sola).'`,
        hint: 'Poné @dataclass arriba de la clase y adentro los campos: nombre: str, precio: float y cantidad: int = 1 (uno por línea).',
      },
      {
        id: 'composicion',
        title: 'Composición: objetos dentro de objetos',
        content: `La **composición** es armar objetos que contienen otros objetos. Un carrito *tiene* productos; una playlist *tiene* canciones. Muchas veces es más simple que la herencia.

\`\`\`
class Equipo:
    def __init__(self, nombre):
        self.nombre = nombre
        self.jugadores = []           # ¡la lista se crea para cada equipo!

    def fichar(self, jugador):
        self.jugadores.append(jugador)

    def cantidad(self):
        return len(self.jugadores)
\`\`\`

Un error clásico: crear la lista **afuera** del \`__init__\` (como atributo de clase). Así todos los equipos compartirían la misma lista.

\`\`\`
class EquipoMal:
    jugadores = []    # compartida por TODOS los equipos 😱
\`\`\``,
        exercise: 'Creá la clase Carrito, que empiece vacío y tenga los métodos agregar(producto), total() (suma de los subtotales) y cantidad_de_items() (suma de las cantidades). Cada carrito tiene que tener sus propios productos.',
        starter: 'from dataclasses import dataclass\n\n\n@dataclass\nclass Producto:\n    nombre: str\n    precio: float\n    cantidad: int = 1\n\n    def subtotal(self):\n        return self.precio * self.cantidad\n\n\nclass Carrito:\n    # completá acá\n    pass\n',
        solution: 'from dataclasses import dataclass\n\n\n@dataclass\nclass Producto:\n    nombre: str\n    precio: float\n    cantidad: int = 1\n\n    def subtotal(self):\n        return self.precio * self.cantidad\n\n\nclass Carrito:\n    def __init__(self):\n        self.productos = []\n\n    def agregar(self, producto):\n        self.productos.append(producto)\n\n    def total(self):\n        return sum(p.subtotal() for p in self.productos)\n\n    def cantidad_de_items(self):\n        return sum(p.cantidad for p in self.productos)\n\n\ncarrito = Carrito()\ncarrito.agregar(Producto("Yerba", 2500, 2))\nprint(carrito.total())\n',
        tests: `c = Carrito()
assert hasattr(c, "total") and c.total() == 0, 'Un carrito nuevo tiene que tener total() igual a 0.'
c.agregar(Producto("Yerba", 2500, 2))
c.agregar(Producto("Pan", 1000))
assert c.total() == 6000, 'Con 2 yerbas de 2500 y un pan de 1000, total() tiene que dar 6000.'
assert c.cantidad_de_items() == 3, 'cantidad_de_items() tiene que sumar las cantidades: 2 + 1 = 3.'
otro = Carrito()
assert otro.total() == 0, 'Cada carrito tiene que tener su propia lista: creala en __init__ con self.productos = [].'`,
        hint: 'En __init__: self.productos = []. total() puede ser sum(p.subtotal() for p in self.productos).',
      },
      {
        id: 'excepciones-propias',
        title: 'Tus propias excepciones',
        content: `Además de \`ValueError\` o \`KeyError\`, podés crear excepciones con nombres de tu problema. Así el código que las atrapa sabe exactamente qué pasó:

\`\`\`
class SinSaldo(Exception):     # hereda de Exception
    pass

def pagar(saldo, monto):
    if monto > saldo:
        raise SinSaldo(f"Faltan $ {monto - saldo}")
    return saldo - monto

try:
    pagar(100, 150)
except SinSaldo as error:
    print("No se pudo pagar:", error)   # No se pudo pagar: Faltan $ 50
\`\`\`

- La clase hereda de \`Exception\` (y con \`pass\` alcanza).
- El texto que le pasás es el mensaje: \`str(error)\`.
- Con \`except SinSaldo\` atrapás solo ese problema y dejás pasar los demás.`,
        exercise: 'Escribí vender(stock, producto, cantidad): stock es un diccionario {producto: unidades}. Si hay suficiente, descontá la cantidad. Si no alcanza (o el producto no existe), lanzá StockInsuficiente con un mensaje que incluya el nombre del producto, sin cambiar el stock.',
        starter: 'class StockInsuficiente(Exception):\n    pass\n\n\ndef vender(stock, producto, cantidad):\n    # completá acá\n    pass\n\n\nstock = {"yerba": 5}\nvender(stock, "yerba", 2)\nprint(stock)\n',
        solution: 'class StockInsuficiente(Exception):\n    pass\n\n\ndef vender(stock, producto, cantidad):\n    if stock.get(producto, 0) < cantidad:\n        raise StockInsuficiente(f"No hay suficiente {producto}")\n    stock[producto] -= cantidad\n\n\nstock = {"yerba": 5}\nvender(stock, "yerba", 2)\nprint(stock)\n',
        tests: `assert issubclass(StockInsuficiente, Exception), 'StockInsuficiente tiene que heredar de Exception.'
s = {"yerba": 5, "mate": 1}
vender(s, "yerba", 2)
assert s["yerba"] == 3, 'Después de vender 2 yerbas de 5, tienen que quedar 3.'
try:
    vender(s, "yerba", 10)
    assert False, 'Vender 10 yerbas cuando hay 3 tiene que lanzar StockInsuficiente.'
except StockInsuficiente as e:
    assert "yerba" in str(e), 'El mensaje del error tiene que incluir el nombre del producto.'
assert s["yerba"] == 3, 'Una venta rechazada no tiene que cambiar el stock.'
try:
    vender(s, "azúcar", 1)
    assert False, 'Vender un producto que no está en el stock tiene que lanzar StockInsuficiente.'
except StockInsuficiente:
    pass
vender(s, "mate", 1)
assert s["mate"] == 0, 'Se tiene que poder vender la última unidad.'`,
        hint: 'stock.get(producto, 0) da 0 si el producto no existe. Si eso es menor que la cantidad: raise StockInsuficiente(f"No hay suficiente {producto}").',
      },
      {
        id: 'iterables',
        title: 'Objetos que funcionan con for, len e in',
        content: `Con tres métodos especiales, tus objetos se comportan como las colecciones de Python:

\`\`\`
class Mazo:
    def __init__(self):
        self.cartas = ["As", "Rey", "Reina"]

    def __len__(self):              # len(mazo)
        return len(self.cartas)

    def __iter__(self):             # for carta in mazo
        return iter(self.cartas)

    def __contains__(self, carta):  # "Rey" in mazo
        return carta in self.cartas

mazo = Mazo()
print(len(mazo))         # 3
print("Rey" in mazo)     # True
for carta in mazo:
    print(carta)
\`\`\`

\`iter(lista)\` devuelve un *iterador*: el objeto que \`for\` usa por detrás para pedir los elementos de a uno.`,
        exercise: 'Completá la clase Playlist para que len(playlist) dé la cantidad de canciones, for cancion in playlist recorra las canciones en orden, y "tema" in playlist diga si una canción está.',
        starter: 'class Playlist:\n    def __init__(self, nombre):\n        self.nombre = nombre\n        self.canciones = []\n\n    def agregar(self, cancion):\n        self.canciones.append(cancion)\n\n    # agregá __len__, __iter__ y __contains__\n\n\nrock = Playlist("Rock nacional")\nrock.agregar("Muchacha ojos de papel")\n',
        solution: 'class Playlist:\n    def __init__(self, nombre):\n        self.nombre = nombre\n        self.canciones = []\n\n    def agregar(self, cancion):\n        self.canciones.append(cancion)\n\n    def __len__(self):\n        return len(self.canciones)\n\n    def __iter__(self):\n        return iter(self.canciones)\n\n    def __contains__(self, cancion):\n        return cancion in self.canciones\n\n\nrock = Playlist("Rock nacional")\nrock.agregar("Muchacha ojos de papel")\nrock.agregar("De música ligera")\nprint(len(rock), list(rock))\n',
        tests: `assert hasattr(Playlist, "__len__"), 'Definí __len__ para que funcione len(playlist).'
assert hasattr(Playlist, "__iter__"), 'Definí __iter__ para que funcione for cancion in playlist.'
assert hasattr(Playlist, "__contains__"), 'Definí __contains__ para que funcione "tema" in playlist.'
p = Playlist("Rock nacional")
assert len(p) == 0, 'Una playlist nueva tiene len 0.'
p.agregar("Muchacha ojos de papel")
p.agregar("De música ligera")
assert len(p) == 2, 'Con dos canciones, len(playlist) tiene que dar 2.'
assert list(p) == ["Muchacha ojos de papel", "De música ligera"], 'Recorrer la playlist tiene que dar las canciones en el orden en que se agregaron.'
assert "De música ligera" in p and "Otra" not in p, '"De música ligera" in playlist tiene que dar True y "Otra" in playlist, False.'`,
        hint: '__len__ devuelve len(self.canciones), __iter__ devuelve iter(self.canciones) y __contains__ devuelve cancion in self.canciones.',
      },
    ],
    project: {
      title: 'Sistema de una tienda',
      intro: `Para cerrar el curso vas a modelar una **tienda** con clases que trabajan juntas: una **dataclass**, **herencia**, **composición** y una **excepción propia**.

- \`Producto\`: nombre, precio y stock, con \`precio_final()\`.
- \`ProductoEnOferta\`: un Producto con un \`descuento\` (porcentaje) que cambia el precio final.
- \`Inventario\`: guarda los productos y los busca por nombre.
- \`Carrito\`: se arma a partir de un inventario, no deja pedir más de lo que hay y al confirmar descuenta el stock.

Cada requisito se prueba por separado, así ves qué funciona y qué falta.`,
      starter: `from dataclasses import dataclass


@dataclass
class Producto:
    nombre: str
    precio: float
    stock: int = 0

    def precio_final(self):
        """Devuelve el precio que paga el cliente (para un producto común, su precio)."""
        pass


class ProductoEnOferta(Producto):
    """Un Producto con un campo más, descuento (porcentaje, 0 por defecto), que reduce el precio final."""
    pass


class StockInsuficiente(Exception):
    pass


class Inventario:
    def __init__(self):
        pass

    def agregar(self, producto):
        pass

    def buscar(self, nombre):
        """Devuelve el Producto con ese nombre, o None."""
        pass

    def valor_total(self):
        """Suma de precio_final() * stock de todos los productos."""
        pass


class Carrito:
    def __init__(self, inventario):
        pass

    def agregar(self, nombre, cantidad):
        """Suma unidades al carrito. Lanza StockInsuficiente si el producto no existe o si el total pedido supera el stock."""
        pass

    def total(self):
        """Suma de precio_final() * cantidad de lo que hay en el carrito."""
        pass

    def confirmar(self):
        """Descuenta el stock, vacía el carrito y devuelve el total cobrado."""
        pass
`,
      solution: `from dataclasses import dataclass


@dataclass
class Producto:
    nombre: str
    precio: float
    stock: int = 0

    def precio_final(self):
        """Devuelve el precio que paga el cliente (para un producto común, su precio)."""
        return self.precio


@dataclass
class ProductoEnOferta(Producto):
    """Un Producto con un campo más, descuento (porcentaje, 0 por defecto), que reduce el precio final."""
    descuento: int = 0

    def precio_final(self):
        return self.precio * (100 - self.descuento) / 100


class StockInsuficiente(Exception):
    pass


class Inventario:
    def __init__(self):
        self.productos = {}

    def agregar(self, producto):
        self.productos[producto.nombre] = producto

    def buscar(self, nombre):
        """Devuelve el Producto con ese nombre, o None."""
        return self.productos.get(nombre)

    def valor_total(self):
        """Suma de precio_final() * stock de todos los productos."""
        return sum(p.precio_final() * p.stock for p in self.productos.values())


class Carrito:
    def __init__(self, inventario):
        self.inventario = inventario
        self.items = {}

    def agregar(self, nombre, cantidad):
        """Suma unidades al carrito. Lanza StockInsuficiente si el producto no existe o si el total pedido supera el stock."""
        producto = self.inventario.buscar(nombre)
        pedido = self.items.get(nombre, 0) + cantidad
        if producto is None or pedido > producto.stock:
            raise StockInsuficiente(f"No hay suficiente {nombre}")
        self.items[nombre] = pedido

    def total(self):
        """Suma de precio_final() * cantidad de lo que hay en el carrito."""
        return sum(self.inventario.buscar(n).precio_final() * c for n, c in self.items.items())

    def confirmar(self):
        """Descuenta el stock, vacía el carrito y devuelve el total cobrado."""
        cobrado = self.total()
        for nombre, cantidad in self.items.items():
            self.inventario.buscar(nombre).stock -= cantidad
        self.items = {}
        return cobrado


tienda = Inventario()
tienda.agregar(Producto("Yerba", 2500, 10))
tienda.agregar(ProductoEnOferta("Alfajor", 1000, 5, descuento=20))
carrito = Carrito(tienda)
carrito.agregar("Yerba", 2)
carrito.agregar("Alfajor", 3)
print("Total:", carrito.confirmar())
print("Quedan", tienda.buscar("Yerba").stock, "yerbas")
`,
      setup: `def _inv():
    inv = Inventario()
    inv.agregar(Producto("Yerba", 2500, 10))
    inv.agregar(Producto("Pan", 1000, 3))
    return inv`,
      requirements: [
        {
          id: 'producto',
          text: 'Producto es una dataclass (nombre, precio, stock=0) y precio_final() devuelve su precio.',
          test: `import dataclasses
assert dataclasses.is_dataclass(Producto), 'Producto tiene que ser una dataclass (@dataclass).'
assert Producto("Yerba", 2500).stock == 0, 'Si no se indica, el stock tiene que ser 0.'
assert Producto("Yerba", 2500, 10).precio_final() == 2500, 'Producto("Yerba", 2500, 10).precio_final() tiene que dar 2500.'`,
        },
        {
          id: 'oferta',
          text: 'ProductoEnOferta hereda de Producto, tiene un campo descuento y su precio_final() aplica el porcentaje.',
          test: `assert issubclass(ProductoEnOferta, Producto), 'ProductoEnOferta tiene que heredar de Producto.'
try:
    _p = ProductoEnOferta("Alfajor", 1000, 5, descuento=20)
except TypeError:
    assert False, 'ProductoEnOferta("Alfajor", 1000, 5, descuento=20) tiene que funcionar: decorala con @dataclass y agregá descuento: int = 0.'
assert _p.precio_final() == 800, 'Con 20% de descuento, un alfajor de 1000 tiene que costar 800.'
assert ProductoEnOferta("Alfajor", 1000, 5).precio_final() == 1000, 'Sin descuento, el precio final es el precio.'`,
        },
        {
          id: 'inventario',
          text: 'Inventario guarda productos: buscar(nombre) devuelve el producto (o None) y valor_total() suma precio final por stock.',
          test: `_i = _inv()
_y = _i.buscar("Yerba")
assert _y is not None and _y.nombre == "Yerba", 'buscar("Yerba") tiene que devolver el producto Yerba.'
assert _i.buscar("Fernet") is None, 'buscar de un producto que no existe tiene que devolver None.'
assert _i.valor_total() == 28000, 'El valor total tiene que ser 2500 × 10 + 1000 × 3 = 28000.'`,
        },
        {
          id: 'carrito',
          text: 'Carrito(inventario).agregar(nombre, cantidad) suma unidades y total() calcula lo que hay que pagar.',
          test: `_c = Carrito(_inv())
_c.agregar("Yerba", 2)
_c.agregar("Pan", 1)
assert _c.total() == 6000, 'Con 2 yerbas y 1 pan, total() tiene que dar 6000.'
_c.agregar("Yerba", 1)
assert _c.total() == 8500, 'Agregar otra yerba suma a las que ya estaban: total 8500.'`,
        },
        {
          id: 'stock',
          text: 'Carrito.agregar lanza StockInsuficiente si se pide más de lo que hay (sumando lo ya pedido) o si el producto no existe.',
          test: `assert issubclass(StockInsuficiente, Exception), 'StockInsuficiente tiene que heredar de Exception.'
_c = Carrito(_inv())
try:
    _c.agregar("Pan", 5)
    assert False, 'Pedir 5 panes cuando hay 3 tiene que lanzar StockInsuficiente.'
except StockInsuficiente:
    pass
_c.agregar("Yerba", 8)
try:
    _c.agregar("Yerba", 5)
    assert False, 'Con 8 yerbas en el carrito y stock 10, pedir 5 más tiene que lanzar StockInsuficiente.'
except StockInsuficiente:
    pass
try:
    _c.agregar("Fernet", 1)
    assert False, 'Pedir un producto que no existe tiene que lanzar StockInsuficiente.'
except StockInsuficiente:
    pass`,
        },
        {
          id: 'confirmar',
          text: 'confirmar() descuenta el stock del inventario, vacía el carrito y devuelve el total cobrado.',
          test: `_i = _inv()
_c = Carrito(_i)
_c.agregar("Yerba", 4)
assert _c.confirmar() == 10000, 'Confirmar 4 yerbas tiene que devolver 10000.'
assert _i.buscar("Yerba").stock == 6, 'Después de vender 4 yerbas de 10, tienen que quedar 6 en el inventario.'
assert _c.total() == 0, 'Después de confirmar, el carrito tiene que quedar vacío.'`,
        },
      ],
      concepts: ['clases', 'decoradores', 'errores', 'diccionarios', 'comprensiones', 'modulos'],
    },
  },
  {
    id: 'python-avanzado',
    title: 'Python avanzado',
    description: 'Llevá tus funciones al siguiente nivel: *args y **kwargs, closures, decoradores, context managers, itertools y expresiones regulares.',
    level: 'Avanzado',
    lessons: [
      {
        id: 'args-kwargs',
        title: '*args y **kwargs',
        content: `A veces una función tiene que aceptar **cualquier cantidad** de argumentos:

\`\`\`
def sumar(*numeros):          # numeros es una tupla con todo lo que llegue
    return sum(numeros)

print(sumar(1, 2, 3))   # 6
print(sumar())          # 0
\`\`\`

Con dos asteriscos recibís **argumentos con nombre** en un diccionario:

\`\`\`
def ficha(nombre, **datos):
    print(nombre)
    for clave, valor in datos.items():
        print(f"  {clave}: {valor}")

ficha("Ana", edad=30, ciudad="Rosario")
\`\`\`

Y al revés: con \`*\` y \`**\` podés **desarmar** una lista o un diccionario al llamar a una función: \`sumar(*[1, 2, 3])\`, \`ficha(**{"nombre": "Ana"})\`.`,
        exercise: 'Escribí promedio(*numeros), que devuelva el promedio de todos los números recibidos (0 si no recibe ninguno), y etiqueta(nombre, **datos), que devuelva "Ana (edad=30, ciudad=Rosario)", o solo el nombre si no hay datos.',
        starter: 'def promedio(*numeros):\n    pass\n\n\ndef etiqueta(nombre, **datos):\n    pass\n\n\nprint(promedio(4, 8, 6))\nprint(etiqueta("Ana", edad=30, ciudad="Rosario"))\n',
        solution: 'def promedio(*numeros):\n    if not numeros:\n        return 0\n    return sum(numeros) / len(numeros)\n\n\ndef etiqueta(nombre, **datos):\n    if not datos:\n        return nombre\n    partes = ", ".join(f"{clave}={valor}" for clave, valor in datos.items())\n    return f"{nombre} ({partes})"\n\n\nprint(promedio(4, 8, 6))\nprint(etiqueta("Ana", edad=30, ciudad="Rosario"))\n',
        tests: `assert promedio(4, 8, 6) == 6, 'promedio(4, 8, 6) tiene que dar 6.'
assert promedio(5) == 5, 'promedio(5) tiene que dar 5.'
assert promedio() == 0, 'promedio() sin números tiene que dar 0.'
assert etiqueta("Ana", edad=30, ciudad="Rosario") == "Ana (edad=30, ciudad=Rosario)", 'etiqueta("Ana", edad=30, ciudad="Rosario") tiene que dar "Ana (edad=30, ciudad=Rosario)".'
assert etiqueta("Beto") == "Beto", 'Sin datos, etiqueta("Beto") tiene que dar "Beto".'`,
        hint: 'Para etiqueta: ", ".join(f"{clave}={valor}" for clave, valor in datos.items()).',
      },
      {
        id: 'funciones-como-valores',
        title: 'Funciones como valores',
        content: `En Python las funciones son valores como cualquier otro: se guardan en variables, se meten en listas y se pasan como argumento.

\`\`\`
def gritar(texto):
    return texto.upper() + "!"

hablar = gritar             # sin paréntesis: la función, no su resultado
print(hablar("hola"))       # HOLA!

def aplicar_dos_veces(funcion, valor):
    return funcion(funcion(valor))

print(aplicar_dos_veces(lambda x: x * 3, 2))   # 18
\`\`\`

Tres funciones de Python reciben funciones:

\`\`\`
numeros = [1, 2, 3, 4, 5]
print(list(map(lambda n: n * 10, numeros)))        # [10, 20, 30, 40, 50]
print(list(filter(lambda n: n % 2 == 0, numeros))) # [2, 4]
print(max(["pera", "banana"], key=len))            # banana
\`\`\``,
        exercise: 'Escribí filtrar_y_transformar(lista, condicion, transformacion), que reciba dos funciones y devuelva una lista con transformacion(x) para cada x de la lista que cumpla condicion(x).',
        starter: 'def filtrar_y_transformar(lista, condicion, transformacion):\n    # completá acá\n    pass\n\n\nprint(filtrar_y_transformar([1, 2, 3, 4], lambda n: n % 2 == 0, lambda n: n * 10))\n',
        solution: 'def filtrar_y_transformar(lista, condicion, transformacion):\n    return [transformacion(x) for x in lista if condicion(x)]\n\n\nprint(filtrar_y_transformar([1, 2, 3, 4], lambda n: n % 2 == 0, lambda n: n * 10))\n',
        tests: `assert filtrar_y_transformar([1, 2, 3, 4], lambda n: n % 2 == 0, lambda n: n * 10) == [20, 40], 'Con los pares multiplicados por 10, [1, 2, 3, 4] tiene que dar [20, 40].'
assert filtrar_y_transformar(["ana", "Beto", "caro"], str.islower, str.upper) == ["ANA", "CARO"], 'Tiene que funcionar con cualquier función, por ejemplo str.islower y str.upper.'
assert filtrar_y_transformar([], lambda x: True, lambda x: x) == [], 'Una lista vacía da [].'`,
        hint: 'Una comprensión con if: [transformacion(x) for x in lista if condicion(x)].',
      },
      {
        id: 'closures',
        title: 'Closures',
        content: `Una función definida **dentro** de otra recuerda las variables de la función de afuera, aunque esa ya haya terminado. Eso se llama **closure**:

\`\`\`
def multiplicador(factor):
    def multiplicar(x):
        return x * factor     # "recuerda" factor
    return multiplicar

doble = multiplicador(2)
triple = multiplicador(3)
print(doble(10), triple(10))   # 20 30
\`\`\`

Si la función de adentro necesita **modificar** esa variable, se declara con \`nonlocal\`:

\`\`\`
def acumulador():
    total = 0
    def sumar(x):
        nonlocal total
        total += x
        return total
    return sumar

caja = acumulador()
caja(100)
print(caja(50))   # 150
\`\`\`

Cada llamada a \`acumulador()\` crea su propio \`total\`: dos cajas no se mezclan.`,
        exercise: 'Escribí crear_contador(inicio=0) que devuelva una función: cada vez que se la llama, devuelve el número siguiente. c = crear_contador(); c() → 1, c() → 2. Con crear_contador(10), la primera llamada da 11.',
        starter: 'def crear_contador(inicio=0):\n    # completá acá\n    pass\n\n\nc = crear_contador()\n',
        solution: 'def crear_contador(inicio=0):\n    actual = inicio\n\n    def siguiente():\n        nonlocal actual\n        actual += 1\n        return actual\n\n    return siguiente\n\n\nc = crear_contador()\nprint(c(), c(), c())\n',
        tests: `c = crear_contador()
assert callable(c), 'crear_contador() tiene que devolver una función (definila adentro y devolvela sin paréntesis).'
assert c() == 1 and c() == 2, 'La primera llamada tiene que dar 1 y la segunda 2.'
otro = crear_contador(10)
assert otro() == 11, 'crear_contador(10) tiene que empezar en 11.'
assert c() == 3, 'Cada contador tiene que llevar su propia cuenta.'`,
        hint: 'Guardá actual = inicio, y en la función de adentro usá nonlocal actual, sumale 1 y devolvelo.',
      },
      {
        id: 'decoradores',
        title: 'Decoradores',
        content: `Un **decorador** es una función que recibe una función y devuelve otra "mejorada". Se aplica con \`@\`:

\`\`\`
from functools import wraps

def anunciar(funcion):
    @wraps(funcion)                   # conserva el nombre y la documentación
    def envoltura(*args, **kwargs):
        print(f"Llamando a {funcion.__name__}...")
        return funcion(*args, **kwargs)
    return envoltura

@anunciar
def sumar(a, b):
    return a + b

print(sumar(2, 3))
# Llamando a sumar...
# 5
\`\`\`

\`@anunciar\` es lo mismo que escribir \`sumar = anunciar(sumar)\`. La envoltura usa \`*args\` y \`**kwargs\` para aceptar cualquier argumento y pasárselo a la función original.

Las funciones también pueden tener atributos: \`envoltura.veces = 0\`.`,
        exercise: 'Escribí el decorador contar_llamadas(funcion): la función decorada tiene que seguir funcionando igual, tener un atributo llamadas con cuántas veces se la llamó, y conservar su nombre (__name__) usando functools.wraps.',
        starter: 'from functools import wraps\n\n\ndef contar_llamadas(funcion):\n    # completá acá\n    return funcion\n\n\n@contar_llamadas\ndef saludar(nombre):\n    return f"Hola, {nombre}"\n\n\nprint(saludar("Ana"))\n',
        solution: 'from functools import wraps\n\n\ndef contar_llamadas(funcion):\n    @wraps(funcion)\n    def envoltura(*args, **kwargs):\n        envoltura.llamadas += 1\n        return funcion(*args, **kwargs)\n\n    envoltura.llamadas = 0\n    return envoltura\n\n\n@contar_llamadas\ndef saludar(nombre):\n    return f"Hola, {nombre}"\n\n\nprint(saludar("Ana"))\nprint(saludar.llamadas)\n',
        tests: `@contar_llamadas
def _duplicar(x):
    return x * 2
assert hasattr(_duplicar, "llamadas"), 'La función decorada tiene que tener el atributo llamadas (empezando en 0).'
assert _duplicar.llamadas == 0, 'Antes de llamarla, llamadas tiene que ser 0.'
assert _duplicar(4) == 8, 'La función decorada tiene que seguir devolviendo lo mismo: _duplicar(4) → 8.'
_duplicar(1)
assert _duplicar.llamadas == 2, 'Después de dos llamadas, llamadas tiene que ser 2.'
assert _duplicar.__name__ == "_duplicar", 'La función decorada tiene que conservar su nombre: usá @wraps(funcion).'
@contar_llamadas
def _otra():
    return "ok"
assert _otra.llamadas == 0, 'Cada función decorada tiene que llevar su propia cuenta.'`,
        hint: 'Dentro del decorador definí envoltura(*args, **kwargs) con @wraps(funcion): sumá 1 a envoltura.llamadas y devolvé funcion(*args, **kwargs). Antes del return, poné envoltura.llamadas = 0.',
      },
      {
        id: 'decoradores-con-argumentos',
        title: 'Decoradores con argumentos',
        content: `Para que un decorador reciba opciones, como \`@repetir(3)\`, se agrega un nivel más: una función que recibe las opciones y **devuelve el decorador**.

\`\`\`
from functools import wraps

def repetir(veces):                     # 1. recibe las opciones
    def decorador(funcion):             # 2. el decorador de verdad
        @wraps(funcion)
        def envoltura(*args, **kwargs): # 3. la función nueva
            for _ in range(veces):
                resultado = funcion(*args, **kwargs)
            return resultado
        return envoltura
    return decorador

@repetir(3)
def saludar():
    print("hola")

saludar()   # hola hola hola
\`\`\`

Un uso real: **reintentar** una operación que a veces falla (por ejemplo, una conexión a internet) antes de rendirse.`,
        exercise: 'Escribí el decorador reintentar(veces): si la función lanza una excepción, la vuelve a llamar, hasta un máximo de veces intentos en total. Si funciona, devuelve su resultado; si falla todas las veces, deja pasar la última excepción.',
        starter: 'from functools import wraps\n\n\ndef reintentar(veces):\n    def decorador(funcion):\n        # completá acá\n        return funcion\n    return decorador\n',
        solution: 'from functools import wraps\n\n\ndef reintentar(veces):\n    def decorador(funcion):\n        @wraps(funcion)\n        def envoltura(*args, **kwargs):\n            for intento in range(veces):\n                try:\n                    return funcion(*args, **kwargs)\n                except Exception:\n                    if intento == veces - 1:\n                        raise\n        return envoltura\n    return decorador\n\n\n@reintentar(3)\ndef conectar():\n    print("Conectando...")\n    return "ok"\n\n\nprint(conectar())\n',
        tests: `intentos = []
@reintentar(3)
def _inestable():
    intentos.append(1)
    if len(intentos) < 3:
        raise ConnectionError("se cortó")
    return "conectado"
try:
    r = _inestable()
except ConnectionError:
    assert False, 'Una función que falla 2 veces y anda a la tercera tiene que terminar bien con @reintentar(3).'
assert r == "conectado", 'Tiene que devolver lo que devuelve la función cuando por fin funciona.'
assert len(intentos) == 3, 'Tiene que haberse llamado 3 veces (2 fallidas y 1 buena).'
fallidos = []
@reintentar(2)
def _siempre_falla():
    fallidos.append(1)
    raise ValueError("no")
try:
    _siempre_falla()
    assert False, 'Si falla todas las veces, tiene que dejar pasar la excepción.'
except ValueError:
    pass
assert len(fallidos) == 2, 'Con @reintentar(2), una función que siempre falla se intenta exactamente 2 veces.'
@reintentar(5)
def _bien():
    return 42
assert _bien() == 42 and _bien.__name__ == "_bien", 'Una función que anda a la primera devuelve su resultado y conserva su nombre (@wraps).'`,
        hint: 'En la envoltura: for intento in range(veces): try: return funcion(*args, **kwargs) except Exception: if intento == veces - 1: raise.',
      },
      {
        id: 'context-managers',
        title: 'Context managers (with)',
        content: `\`with\` garantiza que algo se haga **al final**, aunque haya un error en el medio. Ya lo usaste para cerrar archivos:

\`\`\`
with open("datos.txt", "w") as f:
    f.write("hola")
# acá el archivo ya está cerrado, pase lo que pase
\`\`\`

Podés crear los tuyos con \`@contextmanager\`: lo que está antes del \`yield\` se ejecuta al entrar, y lo de después, al salir.

\`\`\`
from contextlib import contextmanager
import time

@contextmanager
def cronometro(nombre):
    inicio = time.time()
    try:
        yield                      # acá se ejecuta el bloque del with
    finally:                       # finally: se ejecuta aunque haya error
        print(f"{nombre}: {time.time() - inicio:.2f} s")

with cronometro("Cálculo"):
    total = sum(range(1_000_000))
\`\`\``,
        exercise: 'Escribí con @contextmanager la función seccion(titulo), que al entrar imprima "== titulo ==" y al salir imprima "== fin titulo ==", incluso si adentro hubo un error.',
        starter: 'from contextlib import contextmanager\n\n\n@contextmanager\ndef seccion(titulo):\n    # imprimí el título, hacé yield y después imprimí el cierre\n    yield\n\n\nwith seccion("Ventas"):\n    print("Total: 1500")\n',
        solution: 'from contextlib import contextmanager\n\n\n@contextmanager\ndef seccion(titulo):\n    print(f"== {titulo} ==")\n    try:\n        yield\n    finally:\n        print(f"== fin {titulo} ==")\n\n\nwith seccion("Ventas"):\n    print("Total: 1500")\n',
        tests: `antes = len(_salida())
with seccion("Prueba"):
    print("adentro")
assert _salida()[antes:] == "== Prueba ==\\nadentro\\n== fin Prueba ==\\n", 'Con seccion("Prueba") tiene que imprimirse "== Prueba ==", después el contenido y al final "== fin Prueba ==".'
antes = len(_salida())
try:
    with seccion("Errores"):
        raise ValueError("algo salió mal")
except ValueError:
    pass
assert _salida()[antes:].endswith("== fin Errores ==\\n"), 'El cierre se tiene que imprimir aunque haya un error adentro: rodeá el yield con try/finally.'`,
        hint: 'print(f"== {titulo} ==") antes; después try: yield finally: print(f"== fin {titulo} ==").',
      },
      {
        id: 'itertools',
        title: 'itertools',
        content: `El módulo \`itertools\` trae herramientas para combinar y recorrer datos sin escribir bucles anidados:

\`\`\`
from itertools import combinations, permutations, product, chain

print(list(combinations([1, 2, 3], 2)))
# [(1, 2), (1, 3), (2, 3)]        pares sin repetir, sin importar el orden

print(list(permutations("abc", 2)))
# [('a','b'), ('a','c'), ('b','a'), ...]   el orden sí importa

print(list(product(["S", "M"], ["rojo", "azul"])))
# todas las combinaciones de talle y color

print(list(chain([1, 2], [3], [4, 5])))
# [1, 2, 3, 4, 5]                  une varias listas
\`\`\`

Todas devuelven **iteradores**: se usan en un \`for\` o se convierten con \`list()\`.`,
        exercise: 'Escribí pares_que_suman(numeros, objetivo), que devuelva la lista de pares (tuplas) de números distintos de la lista cuya suma es igual al objetivo, en el orden que da combinations. pares_que_suman([1, 2, 3, 4, 5], 6) → [(1, 5), (2, 4)].',
        starter: 'from itertools import combinations\n\n\ndef pares_que_suman(numeros, objetivo):\n    # completá acá\n    pass\n\n\nprint(pares_que_suman([1, 2, 3, 4, 5], 6))\n',
        solution: 'from itertools import combinations\n\n\ndef pares_que_suman(numeros, objetivo):\n    return [par for par in combinations(numeros, 2) if sum(par) == objetivo]\n\n\nprint(pares_que_suman([1, 2, 3, 4, 5], 6))\n',
        tests: `assert pares_que_suman([1, 2, 3, 4, 5], 6) == [(1, 5), (2, 4)], 'pares_que_suman([1, 2, 3, 4, 5], 6) tiene que dar [(1, 5), (2, 4)].'
assert pares_que_suman([1, 2], 10) == [], 'Si ningún par suma el objetivo, el resultado es [].'
assert pares_que_suman([3, 3, 3], 6) == [(3, 3), (3, 3), (3, 3)], 'Cada posición cuenta por separado: [3, 3, 3] con objetivo 6 da tres pares (3, 3).'`,
        hint: '[par for par in combinations(numeros, 2) if sum(par) == objetivo]',
      },
      {
        id: 'regex',
        title: 'Expresiones regulares',
        content: `Una **expresión regular** describe un patrón de texto. El módulo \`re\` las usa para buscar, validar y extraer datos:

\`\`\`
import re

texto = "Llamame al 341-555-1234 o al 11-4444-5555"
print(re.findall(r"\\d+-\\d+-\\d+", texto))
# ['341-555-1234', '11-4444-5555']

print(re.fullmatch(r"\\d{4}", "2025") is not None)   # True: son exactamente 4 dígitos
\`\`\`

Las piezas más comunes:

- \`\\d\` un dígito, \`\\w\` una letra, número o guion bajo, \`.\` cualquier carácter.
- \`[A-Z]\` una letra mayúscula, \`[abc]\` una de esas letras.
- \`+\` una o más veces, \`*\` cero o más, \`{3}\` exactamente 3, \`?\` opcional.
- \`a|b\` una cosa o la otra, \`( )\` agrupa, \`\\.\` un punto de verdad.

\`re.findall\` devuelve todo lo que encuentra; \`re.fullmatch\` comprueba que el texto **entero** cumpla el patrón. La \`r\` antes de las comillas evita problemas con las barras invertidas.`,
        exercise: 'Escribí es_patente_valida(p), que devuelva True si p es una patente argentina: formato viejo (3 letras mayúsculas y 3 números, "ABC123") o Mercosur (2 letras, 3 números y 2 letras, "AB123CD"). Usá re.fullmatch.',
        starter: 'import re\n\n\ndef es_patente_valida(p):\n    # completá acá\n    pass\n\n\nprint(es_patente_valida("AB123CD"))\n',
        solution: 'import re\n\n\ndef es_patente_valida(p):\n    return re.fullmatch(r"[A-Z]{3}\\d{3}|[A-Z]{2}\\d{3}[A-Z]{2}", p) is not None\n\n\nprint(es_patente_valida("AB123CD"))\n',
        tests: `assert es_patente_valida("AB123CD") is True, '"AB123CD" (formato Mercosur) tiene que ser válida.'
assert es_patente_valida("ABC123") is True, '"ABC123" (formato viejo) tiene que ser válida.'
assert es_patente_valida("AB12CD") is False, '"AB12CD" tiene solo 2 números: no es válida.'
assert es_patente_valida("ABC1234") is False, '"ABC1234" tiene un número de más: no es válida.'
assert es_patente_valida("ab123cd") is False, 'Las letras tienen que ser mayúsculas: "ab123cd" no es válida.'
assert es_patente_valida("XABC123") is False, 'El texto entero tiene que ser la patente: usá re.fullmatch.'`,
        hint: 'r"[A-Z]{3}\\d{3}|[A-Z]{2}\\d{3}[A-Z]{2}" con re.fullmatch(patron, p) is not None.',
      },
    ],
    project: {
      title: 'Validador de formularios',
      intro: `Para cerrar el curso vas a construir un pequeño **validador de formularios**, como los que usan las páginas web para revisar lo que escribe la gente. Vas a combinar **expresiones regulares**, **closures**, \`*args\`, **funciones como valores** y **decoradores**.

La idea: cada **regla** es una función que recibe un texto y devuelve \`True\` si está bien.

\`\`\`
reglas = {
    "email": [es_email],
    "clave": [largo_entre(8, 64)],
}
validar({"email": "ana@mail.com", "clave": "123"}, reglas)   # ["clave"]
\`\`\`

Cada requisito se prueba por separado, así ves qué funciona y qué falta.`,
      starter: `import re

REGLAS = {}


def regla(funcion):
    """Decorador: guarda la función en REGLAS con su nombre (funcion.__name__) y la devuelve igual."""
    return funcion


@regla
def es_email(texto):
    """True si el texto ENTERO es un email: algo@dominio.algo (usá re.fullmatch)."""
    pass


def largo_entre(minimo, maximo):
    """Devuelve una función que recibe un texto y dice si su largo está entre minimo y maximo (inclusive)."""
    pass


def todas(*reglas):
    """Devuelve una función que recibe un texto y es True solo si cumple todas las reglas."""
    pass


def validar(datos, reglas):
    """Devuelve la lista ORDENADA de campos que no cumplen alguna de sus reglas. Un campo que falta vale ""."""
    pass
`,
      solution: `import re

REGLAS = {}


def regla(funcion):
    """Decorador: guarda la función en REGLAS con su nombre (funcion.__name__) y la devuelve igual."""
    REGLAS[funcion.__name__] = funcion
    return funcion


@regla
def es_email(texto):
    """True si el texto ENTERO es un email: algo@dominio.algo (usá re.fullmatch)."""
    return re.fullmatch(r"[\\w.+-]+@[\\w-]+(\\.[\\w-]+)+", texto) is not None


def largo_entre(minimo, maximo):
    """Devuelve una función que recibe un texto y dice si su largo está entre minimo y maximo (inclusive)."""
    def validar_largo(texto):
        return minimo <= len(texto) <= maximo
    return validar_largo


def todas(*reglas):
    """Devuelve una función que recibe un texto y es True solo si cumple todas las reglas."""
    def combinada(texto):
        return all(r(texto) for r in reglas)
    return combinada


def validar(datos, reglas):
    """Devuelve la lista ORDENADA de campos que no cumplen alguna de sus reglas. Un campo que falta vale ""."""
    errores = []
    for campo, funciones in reglas.items():
        valor = datos.get(campo, "")
        if not all(f(valor) for f in funciones):
            errores.append(campo)
    return sorted(errores)


formulario = {"nombre": "Ana", "email": "ana@mail.com", "clave": "123"}
reglas = {
    "nombre": [largo_entre(2, 30)],
    "email": [es_email],
    "clave": [todas(largo_entre(8, 64), lambda t: any(c.isdigit() for c in t))],
}
print("Campos con errores:", validar(formulario, reglas))
print("Reglas registradas:", list(REGLAS))
`,
      requirements: [
        {
          id: 'email',
          text: 'es_email(texto) usa una expresión regular y devuelve True solo si el texto entero es un email.',
          test: `assert es_email("ana@mail.com") is True, 'es_email("ana@mail.com") tiene que dar True.'
assert es_email("soporte.tecnico@pestle.com.ar") is True, 'es_email("soporte.tecnico@pestle.com.ar") tiene que dar True.'
assert es_email("ana@") is False and es_email("ana.mail.com") is False, '"ana@" y "ana.mail.com" no son emails.'
assert es_email("ana@mail.com y más") is False, 'El texto ENTERO tiene que ser el email: usá re.fullmatch.'`,
        },
        {
          id: 'largo',
          text: 'largo_entre(minimo, maximo) devuelve una función (closure) que controla el largo de un texto.',
          test: `_f = largo_entre(2, 5)
assert callable(_f), 'largo_entre(2, 5) tiene que devolver una función.'
assert _f("ab") is True and _f("abcde") is True, 'Con largo 2 y 5 (los límites) tiene que dar True.'
assert _f("a") is False and _f("abcdef") is False, 'Con largo 1 o 6 tiene que dar False.'
_g = largo_entre(0, 1)
assert _g("") is True and _f("") is False, 'Cada función recuerda sus propios límites.'`,
        },
        {
          id: 'todas',
          text: 'todas(*reglas) recibe cualquier cantidad de reglas y devuelve una regla que exige que se cumplan todas.',
          test: `_r = todas(str.islower, lambda t: len(t) > 2)
assert callable(_r), 'todas(...) tiene que devolver una función.'
assert _r("hola") is True, '"hola" cumple las dos reglas: True.'
assert _r("Hola") is False and _r("ab") is False, '"Hola" (tiene mayúscula) y "ab" (es corto) no cumplen todas: False.'
assert todas()("cualquier cosa") is True, 'Sin reglas, todo es válido: todas()(texto) da True.'`,
        },
        {
          id: 'validar',
          text: 'validar(datos, reglas) devuelve la lista ordenada de campos con errores (un campo que falta vale "").',
          test: `_reglas = {"b": [lambda t: t != ""], "a": [lambda t: t == "x"], "c": [lambda t: t != ""]}
assert validar({"a": "x", "b": ""}, _reglas) == ["b", "c"], 'Con a correcto, b vacío y c ausente, el resultado es ["b", "c"].'
assert validar({"a": "x", "b": "y", "c": "z"}, _reglas) == [], 'Si todo está bien, el resultado es [].'
assert validar({}, {}) == [], 'Sin reglas, no hay errores.'`,
        },
        {
          id: 'registro',
          text: 'El decorador @regla guarda cada regla en el diccionario REGLAS con su nombre, y es_email está registrada.',
          test: `assert isinstance(REGLAS, dict), 'REGLAS tiene que ser un diccionario.'
@regla
def _solo_numeros(t):
    return t.isdigit()
assert REGLAS.get("_solo_numeros") is _solo_numeros, '@regla tiene que guardar la función en REGLAS con su nombre.'
assert _solo_numeros("123") is True, 'La función decorada con @regla tiene que seguir funcionando igual.'
assert "es_email" in REGLAS, 'es_email tiene que estar registrada (decorada con @regla).'`,
        },
      ],
      concepts: ['funciones', 'decoradores', 'modulos', 'lambda', 'comprensiones', 'diccionarios'],
    },
  },
];

export const findLesson = (courseId?: string, lessonId?: string) => {
  const course = COURSES.find((c) => c.id === courseId);
  const index = course ? course.lessons.findIndex((l) => l.id === lessonId) : -1;
  return { course, lesson: course && index >= 0 ? course.lessons[index] : undefined, index };
};
