/**
 * Python courses. Every exercise is checked in the browser (Pyodide): the student's code runs,
 * then `tests` (hidden Python using plain asserts) verify it. `_salida()` returns everything the
 * student's code printed. Each lesson's `solution` must pass its tests — see scripts/check-courses.
 */

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

export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'Principiante' | 'Intermedio';
  lessons: Lesson[];
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
  },
];

export const findLesson = (courseId?: string, lessonId?: string) => {
  const course = COURSES.find((c) => c.id === courseId);
  const index = course ? course.lessons.findIndex((l) => l.id === lessonId) : -1;
  return { course, lesson: course && index >= 0 ? course.lessons[index] : undefined, index };
};
