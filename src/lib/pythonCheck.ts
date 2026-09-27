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
