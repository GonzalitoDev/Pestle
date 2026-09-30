/**
 * "Guía de Python": reading material that explains Python and programming concepts, chapter by
 * chapter. Content uses the same mini-markdown as lessons (see Prose): "## " headings, "- " lists,
 * `code`, **bold** and ``` blocks (runnable Python; ```consola / ```texto are shown only).
 */
export interface GuideChapter {
  id: string;
  title: string;
  part: string;
  summary: string;
  minutes: number;
  content: string;
}

export const GUIDE_PARTS = ['Primeros pasos', 'Lo básico', 'Estructuras de datos', 'Organizar el código', 'Seguir creciendo'];

export const GUIDE: GuideChapter[] = [
  {
    id: 'que-es-python',
    part: 'Primeros pasos',
    title: '¿Qué es Python?',
    summary: 'Qué es un lenguaje de programación, de dónde salió Python y por qué es un gran primer lenguaje.',
    minutes: 5,
    content: `Una computadora solo entiende instrucciones muy simples: sumar números, mover datos de un lugar a otro, comparar. Un **lenguaje de programación** es una forma de escribir instrucciones que una persona puede leer y que la computadora puede ejecutar.

**Python** es uno de esos lenguajes. Lo creó Guido van Rossum y se publicó en 1991. El nombre no viene de la serpiente sino del grupo de humor británico Monty Python.

## ¿Por qué Python?

- **Se lee casi como inglés.** Tiene pocas reglas raras y poco "ruido" (llaves, puntos y comas), así que te concentrás en el problema.
- **Sirve para casi todo:** páginas web, análisis de datos, inteligencia artificial, automatizar tareas repetitivas, juegos, robótica y ciencia.
- **Tiene "pilas incluidas":** trae una biblioteca enorme con herramientas para fechas, archivos, matemática, internet y mucho más.
- **Tiene una comunidad gigante:** para casi cualquier cosa que quieras hacer, alguien ya escribió una librería y hay respuestas en internet.
- **Lo usan empresas grandes** como Google, Netflix, Spotify, la NASA y Mercado Libre.

## Así se ve

Este programa saluda y hace una cuenta. Tocá **Probar** para ejecutarlo acá mismo:

\`\`\`
print("¡Hola! Estoy aprendiendo Python")
edad = 15
print("Dentro de 10 años voy a tener", edad + 10)
\`\`\`

Aunque todavía no sepas programar, seguramente entendiste qué hace. Esa es una de las grandes virtudes de Python.

## Lenguaje interpretado

Python es un lenguaje **interpretado**: un programa llamado **intérprete** lee tu código y lo va ejecutando línea por línea. No hace falta "compilarlo" antes, como en otros lenguajes. Por eso podés probar cosas muy rápido.

En Pestle, el intérprete de Python corre **dentro de tu navegador** (con una herramienta llamada Pyodide), así que no tenés que instalar nada para practicar.`,
  },
  {
    id: 'instalar',
    part: 'Primeros pasos',
    title: 'Instalar Python y ejecutar tu primer programa',
    summary: 'Cómo tener Python en tu computadora, dónde escribir el código y cómo ejecutarlo.',
    minutes: 6,
    content: `Para practicar, alcanza con Pestle. Pero cuando quieras hacer tus propios proyectos, vas a querer Python en tu computadora.

## Instalarlo

- **Windows:** entrá a python.org, descargá la última versión y, en el instalador, marcá la casilla **"Add python.exe to PATH"** antes de tocar Install.
- **macOS:** descargalo de python.org, o con Homebrew: \`brew install python\`.
- **Linux:** casi siempre ya viene instalado. Si no, con el gestor de paquetes (por ejemplo \`sudo apt install python3\`).

Para comprobar que quedó bien, abrí una terminal (en Windows, "Símbolo del sistema" o PowerShell) y escribí:

\`\`\`consola
python --version
Python 3.13.1
\`\`\`

En macOS y Linux a veces el comando es \`python3\` en lugar de \`python\`.

## ¿Dónde escribo el código?

Un programa de Python es un archivo de texto con extensión \`.py\`. Podés escribirlo en cualquier editor, pero conviene uno pensado para programar:

- **Visual Studio Code** (gratis, el más usado): instalale la extensión "Python".
- **PyCharm Community** (gratis): muy completo.
- **IDLE**: viene con Python, simple para empezar.

## Ejecutarlo

Guardá este código en un archivo llamado \`hola.py\`:

\`\`\`
nombre = "Pestle"
print(f"Hola desde {nombre}")
\`\`\`

Y en la terminal, parado en la carpeta del archivo:

\`\`\`consola
python hola.py
Hola desde Pestle
\`\`\`

## El modo interactivo

Si escribís solo \`python\` en la terminal, se abre el **modo interactivo** (el "REPL"). Ahí escribís una línea y ves el resultado al instante. Es ideal para probar cosas chiquitas. Para salir, escribí \`exit()\`.

\`\`\`consola
>>> 2 + 3
5
>>> "hola".upper()
'HOLA'
\`\`\``,
  },
  {
    id: 'como-se-ejecuta',
    part: 'Primeros pasos',
    title: 'Cómo se ejecuta tu código (y cómo leer los errores)',
    summary: 'El orden de ejecución, los comentarios, la sangría y cómo entender un mensaje de error.',
    minutes: 7,
    content: `## De arriba hacia abajo

Python ejecuta las instrucciones **en orden, de arriba hacia abajo**, una por línea. Si una línea usa algo que todavía no existe, falla:

\`\`\`
mensaje = "primero se crea"
print(mensaje)       # funciona: mensaje ya existe
\`\`\`

## Comentarios

Todo lo que está después de \`#\` es un **comentario**: Python lo ignora. Sirve para explicarle a otras personas (o a vos en el futuro) qué hace el código.

\`\`\`
# Esto es un comentario
precio = 100  # también se puede poner al final de una línea
print(precio)
\`\`\`

## La sangría importa

En Python, los espacios al principio de la línea (la **sangría** o indentación) no son decorativos: indican qué líneas están "adentro" de otra. Se usan **4 espacios** por nivel.

\`\`\`
edad = 20
if edad >= 18:
    print("Sos mayor de edad")   # adentro del if
    print("Podés votar")         # también adentro
print("Esto se ejecuta siempre")  # afuera
\`\`\`

## Leer un error sin miedo

Los errores son normales: los programadores con años de experiencia los ven todo el día. Cuando algo falla, Python muestra un **traceback**. Se lee **de abajo hacia arriba**:

\`\`\`texto
Traceback (most recent call last):
  File "hola.py", line 2, in <module>
    print(nombre)
NameError: name 'nombre' is not defined
\`\`\`

- La **última línea** dice qué pasó: \`NameError\` (usaste un nombre que no existe) y el detalle.
- Arriba dice **en qué archivo y en qué línea** (line 2) y muestra esa línea.

Los errores más comunes al empezar:

- \`SyntaxError\`: algo está mal escrito (falta un paréntesis, unas comillas o los dos puntos).
- \`IndentationError\`: la sangría no es consistente.
- \`NameError\`: un nombre mal escrito o una variable que todavía no creaste.
- \`TypeError\`: mezclaste tipos que no se pueden combinar, como sumar un texto y un número.

Probá este código, mirá el error y arreglalo cambiando la última línea:

\`\`\`
edad = 15
print("Tengo " + str(edad) + " años")
print("Tengo " + edad + " años")
\`\`\``,
  },
  {
    id: 'variables-tipos',
    part: 'Lo básico',
    title: 'Variables y tipos de datos',
    summary: 'Qué es una variable, cómo nombrarla y los tipos básicos: números, textos, booleanos y None.',
    minutes: 7,
    content: `Una **variable** es un nombre que apunta a un valor. Se crea con \`=\` (que en programación significa "guardar", no "es igual"):

\`\`\`
ciudad = "Rosario"
habitantes = 1_300_000     # los guiones bajos ayudan a leer números grandes
print(ciudad, habitantes)
habitantes = habitantes + 1   # se puede cambiar el valor
print(habitantes)
\`\`\`

## Buenos nombres

- Solo letras, números y \`_\`, y no pueden empezar con un número.
- Distinguen mayúsculas: \`edad\` y \`Edad\` son dos variables distintas.
- En Python se escriben en **minúscula con guiones bajos**: \`precio_total\`, \`cantidad_de_alumnos\`.
- Elegí nombres que expliquen qué guardan: \`promedio\` es mucho mejor que \`x\`.

## Los tipos básicos

Cada valor tiene un **tipo**, que define qué se puede hacer con él. Con \`type()\` lo averiguás:

- \`int\`: números enteros, como \`42\` o \`-7\`.
- \`float\`: números con decimales, como \`3.14\` (se usa **punto**, no coma).
- \`str\`: textos (*strings*), entre comillas simples o dobles: \`"hola"\`.
- \`bool\`: verdadero o falso: \`True\` o \`False\`.
- \`None\`: "nada", la ausencia de valor.

\`\`\`
print(type(42), type(3.14), type("hola"), type(True), type(None))
\`\`\`

## Convertir entre tipos

\`\`\`
texto = "25"
numero = int(texto)        # de texto a entero
print(numero + 5)          # 30
print(float("2.5") * 2)    # 5.0
print(str(100) + " pesos") # de número a texto
print(int(7.9))            # 7: int() corta los decimales, no redondea
print(round(7.9))          # 8
\`\`\`

Si el texto no es un número válido, \`int("hola")\` da un \`ValueError\`.`,
  },
  {
    id: 'operadores',
    part: 'Lo básico',
    title: 'Operadores: cuentas, comparaciones y lógica',
    summary: 'Aritmética, división entera y resto, comparaciones y los operadores and, or y not.',
    minutes: 6,
    content: `## Aritmética

\`\`\`
print(7 + 2)    # 9   suma
print(7 - 2)    # 5   resta
print(7 * 2)    # 14  multiplicación
print(7 / 2)    # 3.5 división (siempre da float)
print(7 // 2)   # 3   división entera
print(7 % 2)    # 1   resto (módulo)
print(7 ** 2)   # 49  potencia
\`\`\`

El **resto** (\`%\`) es más útil de lo que parece: \`n % 2 == 0\` te dice si un número es par, y \`minutos % 60\` te da los minutos que sobran después de contar las horas.

Hay atajos para modificar una variable: \`x += 1\` es lo mismo que \`x = x + 1\` (también existen \`-=\`, \`*=\`, \`/=\`).

## Comparaciones

Dan siempre \`True\` o \`False\`:

\`\`\`
print(5 > 3, 5 < 3)     # mayor, menor
print(5 >= 5, 4 <= 3)   # mayor o igual, menor o igual
print(5 == 5, 5 != 5)   # igual, distinto
print("a" < "b")        # los textos se comparan en orden alfabético
\`\`\`

Ojo: \`=\` guarda un valor y \`==\` compara. Es de los errores más comunes al principio.

## Lógica: and, or, not

- \`a and b\`: verdadero solo si **los dos** son verdaderos.
- \`a or b\`: verdadero si **al menos uno** es verdadero.
- \`not a\`: lo invierte.

\`\`\`
edad = 20
tiene_entrada = True
print(edad >= 18 and tiene_entrada)   # puede entrar
print(edad < 12 or edad > 65)         # ¿paga menos?
print(not tiene_entrada)
print(10 < edad < 30)                 # Python permite comparar en cadena
\`\`\`

## Orden de las operaciones

Igual que en matemática: primero \`**\`, después \`*\` \`/\` \`//\` \`%\`, después \`+\` \`-\`, después las comparaciones y al final \`not\`, \`and\`, \`or\`. Ante la duda, **usá paréntesis**: \`(2 + 3) * 4\`.`,
  },
  {
    id: 'textos',
    part: 'Lo básico',
    title: 'Textos (strings)',
    summary: 'Índices, porciones, métodos útiles, f-strings y por qué los textos no se pueden modificar.',
    minutes: 8,
    content: `Un texto es una secuencia de caracteres. Cada carácter tiene una **posición** (índice) que **empieza en 0**:

\`\`\`
palabra = "Python"
print(palabra[0])     # P
print(palabra[-1])    # n (los negativos cuentan desde el final)
print(len(palabra))   # 6 caracteres
\`\`\`

## Porciones (slicing)

\`texto[inicio:fin]\` toma desde \`inicio\` hasta **antes** de \`fin\`:

\`\`\`
s = "Programación"
print(s[0:3])    # Pro
print(s[3:])     # gramación (hasta el final)
print(s[:-4])    # Programa
print(s[::-1])   # nóicamargorP (dado vuelta)
\`\`\`

## Métodos útiles

Un **método** es una función que se llama con un punto después del valor:

\`\`\`
frase = "  Hola, Mundo  "
print(frase.strip())                 # saca espacios de los bordes
print(frase.lower(), frase.upper())  # minúsculas / mayúsculas
print(frase.replace("Mundo", "Pestle"))
print("a,b,c".split(","))            # separa en una lista
print("-".join(["2025", "03", "10"]))  # une una lista con un texto
print("Python".startswith("Py"), "hola" in "hola mundo")
print("ana".capitalize(), "el señor de los anillos".title())
\`\`\`

## f-strings

La forma moderna de armar textos con valores adentro: una \`f\` antes de las comillas y los valores entre llaves.

\`\`\`
nombre, nota = "Sofi", 8.756
print(f"{nombre} sacó {nota:.1f}")      # :.1f → un decimal
print(f"{'Total':<10}|{1500:>8}")        # alineado a izquierda y derecha
print(f"{0.25:.0%} de descuento")       # porcentaje
\`\`\`

## Los textos son inmutables

No se puede cambiar un carácter de un texto: \`palabra[0] = "J"\` da error. Los métodos como \`upper()\` o \`replace()\` **devuelven un texto nuevo**; si lo querés conservar, guardalo: \`frase = frase.upper()\`.

## Caracteres especiales

Dentro de las comillas, \`\\n\` es un salto de línea y \`\\t\` un tabulador. Para textos de varias líneas se usan tres comillas.

\`\`\`
print("Uno\\nDos")
poema = """Primera línea
Segunda línea"""
print(poema)
\`\`\``,
  },
  {
    id: 'entrada-salida',
    part: 'Lo básico',
    title: 'Mostrar y pedir datos: print e input',
    summary: 'Todo lo que puede hacer print() y cómo se piden datos a quien usa el programa.',
    minutes: 5,
    content: `## print()

\`print\` muestra valores en pantalla. Acepta varios valores separados por comas y los separa con un espacio:

\`\`\`
print("Hola", "mundo", 2025)
print("a", "b", "c", sep=" - ")      # cambiar el separador
print("Sin salto de línea", end="")  # cambiar el final (por defecto es un salto)
print(" ← sigue en la misma línea")
print()                              # línea vacía
\`\`\`

## input()

\`input\` muestra un mensaje, **espera** a que la persona escriba algo y aprete Enter, y devuelve lo que escribió **siempre como texto**:

\`\`\`texto
nombre = input("¿Cómo te llamás? ")
edad = int(input("¿Cuántos años tenés? "))   # convertir para hacer cuentas
print(f"{nombre}, el año que viene vas a tener {edad + 1}")
\`\`\`

El error más común: olvidarse de convertir. \`input()\` devuelve \`"15"\`, y \`"15" + 1\` da error.

En el navegador (en Pestle) no hay una terminal donde escribir, así que en los ejercicios los datos se ponen directamente en variables. En tu computadora, \`input()\` funciona perfecto.

## Pedir un número de forma segura

Si la persona escribe algo que no es un número, \`int()\` falla. Con un bucle y \`try\` (que vas a ver más adelante) se puede volver a preguntar:

\`\`\`texto
while True:
    texto = input("Número: ")
    try:
        numero = int(texto)
        break
    except ValueError:
        print("Eso no es un número, probá de nuevo")
\`\`\``,
  },
  {
    id: 'decisiones',
    part: 'Lo básico',
    title: 'Tomar decisiones: if, elif y else',
    summary: 'Ejecutar código solo si se cumple una condición, encadenar casos y el match de Python 3.10.',
    minutes: 7,
    content: `Con \`if\` un programa decide qué hacer según una condición. Después de la condición van **dos puntos** y el bloque va con **sangría**:

\`\`\`
temperatura = 31
if temperatura > 30:
    print("Hace mucho calor")
elif temperatura > 20:
    print("Está lindo")
else:
    print("Llevate abrigo")
\`\`\`

- \`if\` evalúa la primera condición.
- \`elif\` (de "else if") se revisa solo si las anteriores fueron falsas. Puede haber muchos.
- \`else\` se ejecuta si ninguna se cumplió. Es opcional.
- Se ejecuta **un solo bloque**: el primero cuya condición sea verdadera.

## Condiciones compuestas

\`\`\`
edad, con_permiso = 16, True
if edad >= 18 or (edad >= 16 and con_permiso):
    print("Puede manejar")
\`\`\`

## Verdadero y falso sin comparar

Python considera **falsos** al \`0\`, al texto vacío \`""\`, a la lista vacía \`[]\`, a \`None\` y a \`False\`. Todo lo demás es verdadero. Por eso se puede escribir:

\`\`\`
carrito = []
if not carrito:
    print("El carrito está vacío")
nombre = "Ana"
if nombre:
    print("Hay un nombre cargado")
\`\`\`

## If en una línea

Para elegir entre dos valores existe la **expresión condicional**:

\`\`\`
nota = 7
resultado = "aprobado" if nota >= 6 else "desaprobado"
print(resultado)
\`\`\`

## match (Python 3.10+)

Cuando comparás una variable contra muchos valores posibles, \`match\` queda más prolijo:

\`\`\`
comando = "salir"
match comando:
    case "hola":
        print("¡Hola!")
    case "ayuda" | "?":
        print("Comandos: hola, ayuda, salir")
    case "salir":
        print("Chau")
    case _:
        print("No entiendo ese comando")
\`\`\``,
  },
  {
    id: 'bucles',
    part: 'Lo básico',
    title: 'Repetir: bucles while y for',
    summary: 'Repetir mientras se cumpla algo, recorrer colecciones, range, break, continue, enumerate y zip.',
    minutes: 8,
    content: `Los **bucles** repiten un bloque de código. Son la razón por la que las computadoras son tan útiles: hacen mil veces lo mismo sin cansarse.

## while: mientras se cumpla

\`\`\`
cuenta = 3
while cuenta > 0:
    print(cuenta)
    cuenta -= 1
print("¡Despegue!")
\`\`\`

Cuidado: si la condición nunca se vuelve falsa, el bucle es **infinito** y el programa se cuelga.

## for: para cada elemento

\`for\` recorre los elementos de una colección (una lista, un texto, un rango), uno por uno:

\`\`\`
for fruta in ["manzana", "banana", "pera"]:
    print("Me gusta la", fruta)

for letra in "hola":
    print(letra.upper())
\`\`\`

## range

\`range\` genera una secuencia de números. Como en las porciones, el final **no se incluye**:

\`\`\`
print(list(range(5)))          # 0 a 4
print(list(range(2, 8)))       # 2 a 7
print(list(range(0, 20, 5)))   # de 5 en 5
for i in range(3):
    print("Vuelta", i)
\`\`\`

## break y continue

- \`break\` corta el bucle de inmediato.
- \`continue\` salta al siguiente elemento.

\`\`\`
for n in range(1, 20):
    if n % 2 == 0:
        continue          # salteamos los pares
    if n > 9:
        break             # y cortamos al pasar el 9
    print(n)
\`\`\`

## enumerate y zip

\`\`\`
alumnos = ["Ana", "Luis", "Sofi"]
notas = [9, 7, 8]
for posicion, nombre in enumerate(alumnos, start=1):
    print(posicion, nombre)
for nombre, nota in zip(alumnos, notas):   # recorrer dos listas a la par
    print(f"{nombre}: {nota}")
\`\`\`

## Acumular

Un patrón que vas a usar siempre: arrancar una variable en 0 (o en una lista vacía) e ir sumando dentro del bucle.

\`\`\`
total = 0
for precio in [1500, 800, 2300]:
    total += precio
print("Total:", total)
\`\`\``,
  },
  {
    id: 'listas-tuplas',
    part: 'Estructuras de datos',
    title: 'Listas y tuplas',
    summary: 'Guardar muchos valores en orden, modificarlos, copiarlos bien y cuándo usar una tupla.',
    minutes: 9,
    content: `Una **lista** guarda varios valores en orden, entre corchetes. Se accede por posición, igual que en los textos:

\`\`\`
compras = ["yerba", "pan", "leche"]
print(compras[0], compras[-1], len(compras))
compras[1] = "facturas"        # las listas SÍ se pueden modificar
print(compras)
\`\`\`

## Métodos de las listas

\`\`\`
numeros = [5, 2, 8]
numeros.append(1)          # agrega al final
numeros.insert(0, 10)      # agrega en una posición
numeros.remove(8)          # saca el primer 8
ultimo = numeros.pop()     # saca y devuelve el último
print(numeros, ultimo)
numeros.sort()             # ordena la lista (la modifica)
print(numeros, sorted(numeros, reverse=True))  # sorted() devuelve una nueva
print(sum(numeros), min(numeros), max(numeros), 5 in numeros)
\`\`\`

## Porciones y listas dentro de listas

\`\`\`
dias = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"]
print(dias[:5])      # los días hábiles
tablero = [[1, 2, 3], [4, 5, 6]]
print(tablero[1][0]) # fila 1, columna 0 → 4
\`\`\`

## ¡Cuidado con las copias!

Una variable no guarda la lista en sí: **apunta** a ella. Si hacés \`b = a\`, las dos variables apuntan a **la misma** lista:

\`\`\`
a = [1, 2, 3]
b = a            # NO es una copia
b.append(4)
print(a)         # [1, 2, 3, 4] ¡a también cambió!
c = a.copy()     # esto sí es una copia (también sirve list(a) o a[:])
c.append(5)
print(a, c)
\`\`\`

## Tuplas

Una **tupla** es como una lista que **no se puede modificar**. Se escribe con paréntesis y se usa para datos que van juntos y no deberían cambiar, como coordenadas o una fecha:

\`\`\`
punto = (3, 4)
x, y = punto              # desempaquetar
print(x, y)
a, b = 1, 2
a, b = b, a               # intercambiar valores en una línea
print(a, b)
\`\`\`

¿Lista o tupla? Si la cantidad de elementos va a cambiar (agregar, sacar), lista. Si es un grupo fijo de datos, tupla.`,
  },
  {
    id: 'diccionarios-conjuntos',
    part: 'Estructuras de datos',
    title: 'Diccionarios y conjuntos',
    summary: 'Guardar pares clave-valor, recorrerlos, y usar conjuntos para datos sin repetir.',
    minutes: 8,
    content: `## Diccionarios

Un **diccionario** guarda pares **clave: valor**. En vez de buscar por posición, buscás por clave, como en un diccionario de verdad buscás por palabra:

\`\`\`
alumno = {"nombre": "Ana", "edad": 16, "curso": "4to"}
print(alumno["nombre"])
alumno["edad"] = 17                # modificar
alumno["email"] = "ana@mail.com"   # agregar
del alumno["curso"]                # borrar
print(alumno)
\`\`\`

Si la clave no existe, \`alumno["telefono"]\` da un \`KeyError\`. Para evitarlo, \`get\` devuelve un valor por defecto:

\`\`\`
precios = {"yerba": 2500, "pan": 1200}
print(precios.get("leche", 0))
print("pan" in precios)            # ¿existe la clave?
for producto, precio in precios.items():
    print(f"{producto}: $ {precio}")
print(list(precios.keys()), list(precios.values()))
\`\`\`

## Contar con un diccionario

Un uso clásico: contar cuántas veces aparece cada cosa.

\`\`\`
votos = ["sí", "no", "sí", "sí", "no", "blanco"]
conteo = {}
for voto in votos:
    conteo[voto] = conteo.get(voto, 0) + 1
print(conteo)
\`\`\`

Las claves tienen que ser valores **inmutables** (textos, números, tuplas). Los valores pueden ser cualquier cosa, incluso listas u otros diccionarios.

## Conjuntos (sets)

Un **conjunto** guarda valores **sin repetir** y sin orden. Preguntar si algo está adentro es instantáneo, aunque tenga millones de elementos:

\`\`\`
invitados = {"Ana", "Luis", "Ana", "Sofi"}
print(invitados)                   # el repetido desaparece
invitados.add("Caro")
a = {1, 2, 3}
b = {2, 3, 4}
print(a & b, a | b, a - b)         # intersección, unión, diferencia
print(list(set([3, 1, 3, 2, 1])))  # truco para sacar repetidos de una lista
\`\`\`

## ¿Cuál uso?

- **Lista:** elementos en orden, pueden repetirse (una fila de gente).
- **Tupla:** un grupo fijo de datos (unas coordenadas).
- **Diccionario:** buscar un valor por su nombre (una agenda).
- **Conjunto:** elementos únicos y saber rápido si algo está (una lista de invitados).`,
  },
  {
    id: 'comprensiones',
    part: 'Estructuras de datos',
    title: 'Comprensiones',
    summary: 'Crear listas, diccionarios y conjuntos a partir de otros en una sola línea legible.',
    minutes: 5,
    content: `Muchas veces armás una lista nueva transformando o filtrando otra. Con un bucle:

\`\`\`
cuadrados = []
for n in range(1, 6):
    cuadrados.append(n ** 2)
print(cuadrados)
\`\`\`

Una **comprensión de lista** hace lo mismo en una línea que se lee casi como castellano: "n al cuadrado, para cada n en el rango".

\`\`\`
cuadrados = [n ** 2 for n in range(1, 6)]
pares = [n for n in range(20) if n % 2 == 0]
nombres = ["ana", "luis", "sofi"]
print(cuadrados, pares, [nombre.title() for nombre in nombres])
\`\`\`

La estructura es: \`[expresión for elemento in colección if condición]\` (el \`if\` es opcional).

## Diccionarios y conjuntos

\`\`\`
precios = {"yerba": 2500, "pan": 1200, "leche": 1100}
con_aumento = {producto: precio * 1.1 for producto, precio in precios.items()}
print(con_aumento)
iniciales = {nombre[0] for nombre in ["Ana", "Andrés", "Luis"]}
print(iniciales)
\`\`\`

## Expresiones generadoras

Si solo necesitás recorrer los valores una vez (por ejemplo para sumarlos), usá paréntesis en lugar de corchetes: no se arma la lista entera en memoria.

\`\`\`
print(sum(n ** 2 for n in range(1_000_000)))
\`\`\`

Un consejo: si una comprensión se vuelve difícil de leer, volvé al bucle \`for\`. La claridad está primero.`,
  },
  {
    id: 'funciones',
    part: 'Organizar el código',
    title: 'Funciones',
    summary: 'Agrupar código con un nombre, parámetros y return, valores por defecto, alcance de variables y lambdas.',
    minutes: 9,
    content: `Una **función** es un bloque de código con nombre que podés usar muchas veces. Evita repetir código y hace que los programas sean más fáciles de entender.

\`\`\`
def saludar(nombre):
    return f"¡Hola, {nombre}!"

print(saludar("Ana"))
print(saludar("Luis"))
\`\`\`

- \`def\` define la función; \`nombre\` es un **parámetro** (una variable que recibe un valor).
- Al llamarla, \`"Ana"\` es el **argumento**.
- \`return\` devuelve un resultado y **termina** la función. Si no hay \`return\`, devuelve \`None\`.

## print no es lo mismo que return

\`print\` muestra algo en pantalla; \`return\` devuelve un valor para usarlo después. Una función que calcula algo casi siempre debería **devolverlo**:

\`\`\`
def area_rectangulo(base, altura):
    return base * altura

total = area_rectangulo(3, 4) + area_rectangulo(2, 5)
print(total)
\`\`\`

## Valores por defecto y argumentos con nombre

\`\`\`
def precio_final(precio, descuento=0, iva=0.21):
    return round(precio * (1 - descuento) * (1 + iva), 2)

print(precio_final(1000))                    # usa los valores por defecto
print(precio_final(1000, 0.1))
print(precio_final(1000, iva=0.105))         # nombrar el argumento
\`\`\`

## Alcance (scope)

Las variables creadas **dentro** de una función solo existen ahí adentro. Eso es bueno: cada función tiene su propio espacio y no pisa las variables del resto del programa.

\`\`\`
def calcular():
    resultado = 42      # variable local
    return resultado

print(calcular())
# print(resultado)  ← daría NameError: afuera no existe
\`\`\`

## Documentar

Un texto entre triples comillas justo debajo del \`def\` es la **docstring**: explica qué hace la función. Aparece con \`help(funcion)\`.

## Lambdas

Una \`lambda\` es una función chiquita, sin nombre, de una sola expresión. Se usan sobre todo para pasarlas a otras funciones:

\`\`\`
alumnos = [("Ana", 9), ("Luis", 6), ("Sofi", 8)]
print(sorted(alumnos, key=lambda alumno: alumno[1], reverse=True))
\`\`\`

## Pensar en funciones

Un buen hábito: si un pedazo de código hace **una cosa** que podés describir en pocas palabras ("calcular el total", "validar el email"), convertilo en una función con ese nombre.`,
  },
  {
    id: 'modulos-paquetes',
    part: 'Organizar el código',
    title: 'Módulos, paquetes y pip',
    summary: 'Usar la biblioteca estándar, instalar librerías con pip, entornos virtuales y dividir tu programa en archivos.',
    minutes: 8,
    content: `Un **módulo** es un archivo de Python con funciones y variables que podés usar desde otro programa. Python trae cientos: es la **biblioteca estándar**.

\`\`\`
import math
import random
from datetime import date

print(math.sqrt(16), math.pi)
print(random.choice(["piedra", "papel", "tijera"]))
print(date(2025, 12, 25).strftime("%d/%m/%Y"))
\`\`\`

Formas de importar:

- \`import math\` y después \`math.sqrt(...)\`.
- \`from math import sqrt\` y después \`sqrt(...)\` directo.
- \`import datetime as dt\` para ponerle un nombre más corto.

Algunos módulos muy usados: \`math\`, \`random\`, \`datetime\`, \`json\`, \`csv\`, \`os\` y \`pathlib\` (archivos y carpetas), \`re\` (expresiones regulares), \`collections\`, \`itertools\`, \`statistics\`.

## Instalar librerías con pip

Además de la biblioteca estándar hay más de medio millón de librerías publicadas en **PyPI**, el catálogo de Python. Se instalan con \`pip\` desde la terminal:

\`\`\`consola
pip install requests
\`\`\`

Algunas famosas: \`requests\` (internet), \`pandas\` (datos), \`matplotlib\` (gráficos), \`flask\` y \`django\` (páginas web), \`pygame\` (juegos).

## Entornos virtuales

Cada proyecto puede necesitar versiones distintas de las librerías. Un **entorno virtual** es una carpeta con un Python propio para ese proyecto:

\`\`\`consola
python -m venv .venv
source .venv/bin/activate      # en Windows: .venv\\Scripts\\activate
pip install requests
pip freeze > requirements.txt  # anotar qué usa el proyecto
\`\`\`

## Tus propios módulos

Cuando un programa crece, se divide en varios archivos. Si tenés \`calculos.py\` con una función \`promedio\`, desde otro archivo en la misma carpeta hacés \`from calculos import promedio\`.

Muchos archivos terminan con esto:

\`\`\`texto
if __name__ == "__main__":
    main()
\`\`\`

Significa: "ejecutá \`main()\` solo si este archivo se corre directamente, y no cuando otro archivo lo importa".`,
  },
  {
    id: 'errores',
    part: 'Organizar el código',
    title: 'Errores y excepciones',
    summary: 'Qué es una excepción, cómo atraparla con try/except, finally, y cómo lanzar tus propios errores.',
    minutes: 7,
    content: `Cuando algo sale mal mientras el programa corre (dividir por cero, abrir un archivo que no existe, convertir "hola" a número), Python lanza una **excepción**. Si nadie la atrapa, el programa se detiene y muestra el traceback.

## try / except

Con \`try\` intentás algo; si falla, \`except\` se encarga:

\`\`\`
def dividir(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        print("No se puede dividir por cero")
        return None

print(dividir(10, 2))
print(dividir(1, 0))
\`\`\`

## Varios except, else y finally

\`\`\`
for texto in ["42", "hola", "0"]:
    try:
        numero = int(texto)
        resultado = 100 / numero
    except ValueError:
        print(f"{texto!r} no es un número")
    except ZeroDivisionError:
        print("El cero no vale")
    else:
        print("Resultado:", resultado)   # solo si no hubo error
    finally:
        print("  (esto se ejecuta siempre)")
\`\`\`

- \`else\`: se ejecuta solo si no hubo ningún error.
- \`finally\`: se ejecuta siempre, haya error o no. Sirve para "limpiar" (cerrar algo, avisar que terminó).

## Lanzar tus propios errores

Con \`raise\` avisás que algo está mal, con un mensaje claro:

\`\`\`
def retirar(saldo, monto):
    if monto <= 0:
        raise ValueError("El monto tiene que ser positivo")
    if monto > saldo:
        raise ValueError(f"Saldo insuficiente: tenés {saldo}")
    return saldo - monto

try:
    retirar(100, 500)
except ValueError as error:
    print("Error:", error)
\`\`\`

## Un consejo

Atrapá solo los errores que esperás y sabés manejar. Un \`except:\` a secas, que atrapa todo, esconde los errores de verdad y hace muy difícil encontrar los problemas.`,
  },
  {
    id: 'archivos',
    part: 'Organizar el código',
    title: 'Archivos',
    summary: 'Leer y escribir archivos de texto con with open, los modos de apertura, JSON y pathlib.',
    minutes: 7,
    content: `Los programas pierden todo al terminar, salvo que guarden los datos en **archivos**.

## Escribir y leer

\`\`\`
with open("notas.txt", "w", encoding="utf-8") as archivo:
    archivo.write("Primera línea\\n")
    archivo.write("Segunda línea\\n")

with open("notas.txt", encoding="utf-8") as archivo:
    contenido = archivo.read()
print(contenido)
\`\`\`

- \`with\` abre el archivo y lo **cierra solo** al terminar el bloque, aunque haya un error.
- \`encoding="utf-8"\` evita problemas con tildes y eñes.

## Modos de apertura

- \`"r"\`: leer (es el modo por defecto). Falla si el archivo no existe.
- \`"w"\`: escribir. **Borra** lo que había antes.
- \`"a"\`: agregar al final, sin borrar.

## Leer línea por línea

Para archivos grandes, conviene recorrerlo con un \`for\`: lee de a una línea sin cargar todo en memoria.

\`\`\`
with open("notas.txt", "a", encoding="utf-8") as archivo:
    archivo.write("Tercera línea\\n")

with open("notas.txt", encoding="utf-8") as archivo:
    for numero, linea in enumerate(archivo, start=1):
        print(numero, linea.strip())
\`\`\`

## Guardar datos con JSON

Para guardar listas y diccionarios, el formato más usado es **JSON**:

\`\`\`
import json

agenda = {"Ana": "341-555-1234", "Luis": "11-4444-5555"}
with open("agenda.json", "w", encoding="utf-8") as f:
    json.dump(agenda, f, ensure_ascii=False, indent=2)

with open("agenda.json", encoding="utf-8") as f:
    print(json.load(f)["Ana"])
\`\`\`

## Rutas con pathlib

\`pathlib\` maneja rutas de archivos de forma cómoda y funciona igual en Windows, macOS y Linux:

\`\`\`
from pathlib import Path

ruta = Path("saludo.txt")
ruta.write_text("Hola desde pathlib\\nChau", encoding="utf-8")
print(ruta.exists(), ruta.suffix, ruta.stat().st_size, "bytes")
print(ruta.read_text(encoding="utf-8").splitlines()[0])
\`\`\``,
  },
  {
    id: 'clases',
    part: 'Organizar el código',
    title: 'Clases y objetos',
    summary: 'La idea de la programación orientada a objetos: clases, objetos, atributos, métodos y herencia.',
    minutes: 9,
    content: `Hasta ahora los datos (variables) y las acciones (funciones) iban por separado. La **programación orientada a objetos** los junta: un **objeto** tiene sus datos (**atributos**) y sabe hacer cosas (**métodos**).

Una **clase** es el molde; los objetos son lo que se crea con ese molde. "Perro" es una clase; tu perro Firulais es un objeto.

\`\`\`
class Perro:
    def __init__(self, nombre, raza):
        self.nombre = nombre      # atributos
        self.raza = raza
        self.trucos = []

    def aprender(self, truco):    # método
        self.trucos.append(truco)

    def presentarse(self):
        return f"Soy {self.nombre}, un {self.raza}, y sé {len(self.trucos)} trucos"


firulais = Perro("Firulais", "caniche")
toby = Perro("Toby", "ovejero")
firulais.aprender("sentarse")
print(firulais.presentarse())
print(toby.presentarse())
\`\`\`

- \`__init__\` se ejecuta al crear el objeto y prepara sus atributos.
- \`self\` es el propio objeto. Con \`self.algo\` guardás y leés **sus** datos.
- Cada objeto tiene sus propios datos: los trucos de Firulais no son los de Toby.

## Herencia

Una clase puede **heredar** de otra: recibe todo lo que tiene y agrega o cambia lo que necesita.

\`\`\`
class Animal:
    def __init__(self, nombre):
        self.nombre = nombre

    def hablar(self):
        return "..."

class Gato(Animal):
    def hablar(self):
        return "Miau"

class Vaca(Animal):
    def hablar(self):
        return "Muu"

for animal in [Gato("Michi"), Vaca("Lola")]:
    print(animal.nombre, "dice", animal.hablar())
\`\`\`

## Métodos especiales

Los métodos con doble guion bajo le enseñan a tus objetos a funcionar con Python: \`__str__\` define cómo se ven con \`print\`, \`__eq__\` qué significa \`==\`, \`__len__\` qué devuelve \`len()\`.

\`\`\`
class Fraccion:
    def __init__(self, num, den):
        self.num, self.den = num, den

    def __str__(self):
        return f"{self.num}/{self.den}"

    def __add__(self, otra):
        return Fraccion(self.num * otra.den + otra.num * self.den, self.den * otra.den)

print(Fraccion(1, 2) + Fraccion(1, 3))
\`\`\`

¿Cuándo usar clases? Cuando tenés "cosas" con datos y comportamiento propios: un usuario, una cuenta bancaria, un personaje de un juego, un producto. Para cálculos sueltos, alcanza con funciones.`,
  },
  {
    id: 'buenas-practicas',
    part: 'Seguir creciendo',
    title: 'Buenas prácticas y el Zen de Python',
    summary: 'Cómo escribir código que se entienda: PEP 8, nombres, funciones cortas y cómo buscar ayuda.',
    minutes: 6,
    content: `El código se escribe una vez pero se **lee muchísimas veces**, por otras personas y por vos dentro de unos meses. Por eso importa que sea claro.

## El Zen de Python

Python tiene su propia filosofía escondida. Ejecutá esto:

\`\`\`
import this
\`\`\`

Algunas ideas clave: "Lo bello es mejor que lo feo", "Lo explícito es mejor que lo implícito", "Lo simple es mejor que lo complejo" y "La legibilidad cuenta".

## PEP 8: el estilo de Python

**PEP 8** es la guía de estilo oficial. Lo más importante:

- Sangría de **4 espacios**.
- Nombres de variables y funciones en \`minusculas_con_guiones\`; clases en \`PalabrasConMayuscula\`; constantes en \`MAYUSCULAS\`.
- Espacios alrededor de los operadores: \`total = precio * 2\`, no \`total=precio*2\`.
- Líneas no muy largas (menos de unos 80 a 100 caracteres).
- Dos líneas en blanco entre funciones y clases.

Herramientas como **Black** o **Ruff** arreglan el formato solas.

## Consejos

- **Nombres que expliquen:** \`dias_hasta_vencimiento\` en vez de \`d\`.
- **Funciones cortas que hagan una sola cosa.** Si necesitás la palabra "y" para describirla, quizás son dos funciones.
- **No repitas código:** si copiás y pegás lo mismo tres veces, convertilo en una función.
- **Comentá el porqué, no el qué:** el código ya dice qué hace; el comentario explica por qué se hizo así.
- **Probá seguido:** ejecutá tu programa cada pocas líneas en lugar de escribir todo y rezar.

## Cuando te trabás

- Leé el mensaje de error completo, de abajo hacia arriba.
- Agregá \`print()\` para ver qué valor tienen las variables en cada paso.
- Explicale el problema a otra persona (o a un patito de goma): muchas veces la solución aparece al explicarlo.
- Buscá el mensaje de error en internet: casi seguro a alguien le pasó lo mismo.
- La documentación oficial está en docs.python.org y tiene partes en español.`,
  },
  {
    id: 'que-sigue',
    part: 'Seguir creciendo',
    title: '¿Y ahora qué? Caminos con Python',
    summary: 'Qué podés construir con Python y qué aprender para cada camino.',
    minutes: 5,
    content: `Con lo básico de Python ya podés elegir hacia dónde ir. Algunos caminos:

## Automatizar tareas

Renombrar cientos de archivos, completar planillas, mandar mails o descargar información de páginas web. Módulos: \`pathlib\`, \`csv\`, \`openpyxl\` (Excel), \`requests\`, \`beautifulsoup4\`.

## Análisis de datos

Leer datos, limpiarlos, sacar conclusiones y hacer gráficos. Es uno de los usos más pedidos en el trabajo. Librerías: **pandas**, **numpy**, **matplotlib**, y el entorno **Jupyter Notebook**.

## Páginas web y APIs

Hacer el "backend" de una página: usuarios, bases de datos, APIs. Frameworks: **Django** (completo, con todo incluido), **Flask** (simple y liviano) y **FastAPI** (moderno, ideal para APIs).

## Inteligencia artificial

Aprendizaje automático, reconocimiento de imágenes, procesamiento de texto. Librerías: **scikit-learn** para empezar, y después **PyTorch**. Primero conviene afianzar pandas y algo de matemática.

## Juegos

Con **pygame** podés hacer juegos 2D y aprender mucho sobre bucles, eventos y objetos.

## Hardware y robótica

Python corre en placas como **Raspberry Pi** y en microcontroladores con **MicroPython**, para controlar luces, sensores y motores.

## Cómo seguir practicando

- **Hacé proyectos propios**, aunque sean chiquitos: una calculadora de gastos, un juego de preguntas, un organizador de tareas. Se aprende mucho más que solo leyendo.
- **Resolvé ejercicios** todos los días un rato: la constancia gana.
- **Leé código de otros** y compartí el tuyo (¡podés publicarlo en Pestle!).
- Hacé los **cursos** de Pestle, con ejercicios que se corrigen solos y certificado al final.`,
  },
  {
    id: 'glosario',
    part: 'Seguir creciendo',
    title: 'Glosario',
    summary: 'Las palabras que vas a escuchar todo el tiempo, explicadas en una línea.',
    minutes: 6,
    content: `- **Algoritmo:** una serie de pasos precisos para resolver un problema.
- **Argumento:** el valor que le pasás a una función cuando la llamás.
- **Biblioteca estándar:** los módulos que vienen incluidos con Python.
- **Booleano (bool):** un valor que solo puede ser True o False.
- **Bucle:** código que se repite (while, for).
- **Bug:** un error en el programa. "Debuggear" es buscarlo y arreglarlo.
- **Clase:** un molde para crear objetos con datos y comportamiento.
- **Comentario:** texto que empieza con # y que Python ignora.
- **Condición:** una expresión que da True o False, usada por if y while.
- **Depurar:** encontrar y corregir errores (debugging).
- **Diccionario (dict):** colección de pares clave: valor.
- **Excepción:** un error que ocurre mientras el programa corre, que se puede atrapar con try/except.
- **Expresión:** algo que produce un valor, como 2 + 3 o len(nombre).
- **f-string:** un texto con f adelante que permite meter valores entre llaves.
- **Función:** un bloque de código con nombre que se puede reutilizar.
- **Indentación (sangría):** los espacios al principio de una línea, que en Python marcan los bloques.
- **Índice:** la posición de un elemento en una lista o texto, empezando en 0.
- **Intérprete:** el programa que lee y ejecuta tu código Python.
- **Iterar:** recorrer los elementos de una colección de a uno.
- **Librería (o biblioteca):** código que escribió otra persona para que lo reutilices.
- **Lista:** colección ordenada y modificable de valores.
- **Método:** una función que pertenece a un objeto y se llama con un punto: texto.upper().
- **Módulo:** un archivo de Python que se puede importar.
- **None:** el valor que representa "nada".
- **Objeto:** un valor concreto creado a partir de una clase. En Python, todo es un objeto.
- **Parámetro:** la variable que recibe un valor en la definición de una función.
- **pip:** la herramienta para instalar librerías de PyPI.
- **Return:** la instrucción que devuelve un valor desde una función.
- **Sintaxis:** las reglas de cómo se escribe el código.
- **String (str):** un texto.
- **Terminal (consola):** la ventana donde se escriben comandos, como python archivo.py.
- **Traceback:** el informe que muestra Python cuando ocurre un error.
- **Tupla:** colección ordenada que no se puede modificar.
- **Variable:** un nombre que apunta a un valor.`,
  },
];

export const findChapter = (id?: string) => {
  const index = GUIDE.findIndex((c) => c.id === id);
  return { chapter: index >= 0 ? GUIDE[index] : undefined, index };
};
