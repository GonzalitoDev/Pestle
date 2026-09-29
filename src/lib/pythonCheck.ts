/**
 * Wraps a student's Python code with hidden tests for the course runner.
 * The student's code runs via exec() under the filename "<tu código>" (so tracebacks show their
 * own line numbers); everything it prints is also captured so tests can call _salida().
 * Failed asserts print a friendly "❌ …" line instead of a traceback.
 */
export const PASS_MARKER = '✅ ¡Correcto! Lección completada.';

const py = (s: string) => JSON.stringify(s); // JSON strings are valid Python string literals

export function buildCheckProgram(studentCode: string, tests: string) {
  const indentedTests = tests
    .split('\n')
    .map((line) => '    ' + line)
    .join('\n');
  return `import sys as _pestle_sys, io as _pestle_io
_pestle_buf = _pestle_io.StringIO()
class _PestleTee:
    def __init__(self, inner):
        self.inner = inner
    def write(self, s):
        _pestle_buf.write(s)
        return self.inner.write(s)
    def flush(self):
        return self.inner.flush()
_pestle_sys.stdout = _PestleTee(_pestle_sys.stdout)
def _salida():
    return _pestle_buf.getvalue()
exec(compile(${py(studentCode)}, "<tu código>", "exec"), globals())
def _pestle_run_tests():
${indentedTests}
try:
    _pestle_run_tests()
    print(${py(PASS_MARKER)})
except AssertionError as _e:
    print("❌ " + (str(_e) or "Todavía no está bien. Revisá el enunciado."))
except Exception as _e:
    print("❌ Tu código dio un error al probarlo: " + type(_e).__name__ + ": " + str(_e))
`;
}

/** Runs the student's code as "<tu código>" so error messages point at their own lines. */
export function buildRunProgram(studentCode: string) {
  return `exec(compile(${py(studentCode)}, "<tu código>", "exec"), globals())\n`;
}

/** Markers the project program prints (hidden from the console) so the page can show a checklist. */
export const MARK = { req: '§REQ§', concepts: '§CONCEPTS§', syntax: '§SYNTAX§' } as const;

/** Last (visible) line of a project review; the page uses it to know the review finished. */
export const REVIEW_DONE = '✔ Revisión terminada: mirá la lista de requisitos.';

export interface ProjectRequirement {
  id: string;
  text: string;
  /** Python asserts; runs with the project's `setup` code already executed. */
  test: string;
}

/** Concepts detected in the student's code (by walking its syntax tree), keyed for the UI. */
export const CONCEPT_LABELS: Record<string, string> = {
  funciones: 'Funciones',
  condicionales: 'Condicionales (if)',
  for: 'Bucles for',
  while: 'Bucles while',
  listas: 'Listas',
  diccionarios: 'Diccionarios',
  comprensiones: 'Comprensiones',
  'f-strings': 'f-strings',
  errores: 'Manejo de errores',
  clases: 'Clases',
  modulos: 'Módulos (import)',
  lambda: 'Lambda',
  archivos: 'Archivos (with open)',
  generadores: 'Generadores (yield)',
  decoradores: 'Decoradores (@)',
};

const indent = (code: string, spaces: number) =>
  code
    .split('\n')
    .map((l) => ' '.repeat(spaces) + l)
    .join('\n');

/**
 * Program for a final project: analyses the code's concepts, runs it, then checks each
 * requirement independently so the student sees exactly which ones pass.
 */
export function buildProjectProgram(studentCode: string, requirements: ProjectRequirement[], setup = '') {
  const reqBlocks = requirements
    .map(
      (r, i) => `def _pestle_req_${i}():
${indent(setup ? setup + '\n' + r.test : r.test, 4)}
try:
    _pestle_req_${i}()
    print(${py(`${MARK.req}${r.id}§OK`)})
except AssertionError as _e:
    print(${py(`${MARK.req}${r.id}§FAIL§`)} + (str(_e) or "Todavía no se cumple."))
except Exception as _e:
    print(${py(`${MARK.req}${r.id}§FAIL§`)} + type(_e).__name__ + ": " + str(_e))`
    )
    .join('\n');

  return `import ast as _pestle_ast, json as _pestle_json
_pestle_src = ${py(studentCode)}
try:
    _pestle_tree = _pestle_ast.parse(_pestle_src)
    _pestle_found = set()
    _pestle_map = {
        "FunctionDef": "funciones", "If": "condicionales", "IfExp": "condicionales", "For": "for",
        "While": "while", "List": "listas", "Dict": "diccionarios", "ListComp": "comprensiones",
        "DictComp": "comprensiones", "SetComp": "comprensiones", "GeneratorExp": "comprensiones",
        "JoinedStr": "f-strings", "Try": "errores", "Raise": "errores", "ClassDef": "clases",
        "Import": "modulos", "ImportFrom": "modulos", "Lambda": "lambda", "With": "archivos",
        "Yield": "generadores", "YieldFrom": "generadores",
    }
    for _pestle_node in _pestle_ast.walk(_pestle_tree):
        _pestle_kind = _pestle_map.get(type(_pestle_node).__name__)
        if _pestle_kind:
            _pestle_found.add(_pestle_kind)
        if getattr(_pestle_node, "decorator_list", None):
            _pestle_found.add("decoradores")
    print(${py(MARK.concepts)} + _pestle_json.dumps(sorted(_pestle_found)))
except SyntaxError as _e:
    print(${py(MARK.syntax)} + str(_e.lineno) + "§" + str(_e.msg))
try:
    exec(compile(_pestle_src, "<tu código>", "exec"), globals())
except SyntaxError:
    raise
except Exception as _e:
    import traceback as _pestle_tb
    _pestle_lines = [f.lineno for f in _pestle_tb.extract_tb(_e.__traceback__) if f.filename == "<tu código>"]
    _pestle_where = f" (línea {_pestle_lines[-1]})" if _pestle_lines else ""
    print("❌ Tu código dio un error al ejecutarse" + _pestle_where + ": " + type(_e).__name__ + ": " + str(_e))
${reqBlocks}
print(${py(REVIEW_DONE)})
`;
}
