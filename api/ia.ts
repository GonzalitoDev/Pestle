import Anthropic from '@anthropic-ai/sdk';
import { COURSES } from '../src/data/courses.js';
import { GUIDE } from '../src/data/guide.js';
import { API_HEADERS, json, preflight, rateLimit, safe } from './_lib/store.js';

/**
 * Pestle IA: answers questions about Python and the site, streaming the reply as plain text.
 * Needs ANTHROPIC_API_KEY in Vercel; without it the endpoint answers 503 and the widget says
 * the assistant isn't set up. Each IP gets 15 questions per 10 minutes and 60 per day.
 */

const MODEL = 'claude-opus-5-5';
const MAX_MESSAGES = 16;
const MAX_MESSAGE_CHARS = 4000;
const MAX_TOTAL_CHARS = 24000;
const MAX_CODE_CHARS = 6000;

const SYSTEM = `Sos Pestle IA, el asistente de Pestle: un sitio gratuito para aprender Python en el navegador, con una guía para leer, cursos con ejercicios que se corrigen solos, un editor para ejecutar código, una biblioteca de ejemplos, logros y ranking.

Tu trabajo es resolver dudas de las personas que están aprendiendo, muchas de ellas principiantes o adolescentes.

Cómo responder:
- En castellano rioplatense (usá "vos"), con un tono cercano y paciente, sin exagerar el entusiasmo.
- Claro y al grano: explicá la idea con palabras simples y un ejemplo corto. Si la pregunta es simple, la respuesta también.
- El código va en bloques \`\`\`python. Tiene que poder ejecutarse en el navegador: no uses input() (poné los datos en variables) ni librerías que haya que instalar, salvo que la pregunta sea justamente sobre eso.
- Si te pasan un error, explicá qué significa, en qué línea está y cómo arreglarlo.
- Si la duda es sobre un ejercicio o el proyecto final de un curso, no des la solución completa de entrada: ayudá con pistas, preguntas y ejemplos parecidos para que la persona llegue sola. Si después de intentarlo te pide la solución de forma explícita, dásela explicada.
- Si no sabés algo o no estás seguro, decilo.
- Solo ayudás con Python, programación en general y el uso de Pestle. Si te preguntan otra cosa, contá amablemente que solo podés ayudar con eso.
- No inventes secciones ni funciones de Pestle que no conozcas.

Empezá la respuesta visible enseguida.`;

interface ChatMessage {
  rol: 'usuario' | 'ia';
  texto: string;
}

/** Describes where the person is, so "este ejercicio" makes sense to the model. */
function pageContext(path: string, code: string) {
  const [, section, a, b] = path.split('/');
  if (section === 'cursos' && a) {
    const course = COURSES.find((c) => c.id === a);
    if (!course) return '';
    if (b === 'proyecto') {
      const reqs = course.project.requirements.map((r) => `- ${r.text}`).join('\n');
      return `La persona está en el proyecto final "${course.project.title}" del curso "${course.title}". Requisitos:\n${reqs}${code ? `\n\nSu código actual:\n\`\`\`python\n${code}\n\`\`\`` : ''}`;
    }
    const lesson = course.lessons.find((l) => l.id === b);
    if (lesson) {
      return `La persona está en la lección "${lesson.title}" del curso "${course.title}". El ejercicio dice: ${lesson.exercise}${code ? `\n\nSu código actual:\n\`\`\`python\n${code}\n\`\`\`` : ''}`;
    }
    return `La persona está mirando el curso "${course.title}".`;
  }
  if (section === 'guia' && a) {
    const chapter = GUIDE.find((c) => c.id === a);
    if (chapter) return `La persona está leyendo el capítulo "${chapter.title}" de la Guía de Python.`;
  }
  return '';
}

function cleanMessages(raw: unknown): ChatMessage[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const messages = raw
    .slice(-MAX_MESSAGES)
    .filter(
      (m): m is ChatMessage =>
        m && typeof m === 'object' && (m.rol === 'usuario' || m.rol === 'ia') && typeof m.texto === 'string'
    )
    .map((m) => ({ rol: m.rol, texto: m.texto.slice(0, MAX_MESSAGE_CHARS) }))
    .filter((m) => m.texto.trim());
  // The conversation has to start with the person and end with their question.
  while (messages.length && messages[0].rol !== 'usuario') messages.shift();
  if (!messages.length || messages[messages.length - 1].rol !== 'usuario') return null;
  let total = 0;
  for (let i = messages.length - 1; i >= 0; i--) {
    total += messages[i].texto.length;
    if (total > MAX_TOTAL_CHARS) return messages.slice(i + 1).length ? messages.slice(i + 1) : null;
  }
  return messages;
}

export const POST = safe(async (request) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return json({ error: 'Pestle IA todavía no está configurada en este sitio.' }, 503);
  }
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return json({ error: 'El content-type tiene que ser application/json' }, 415);
  }
  const limited =
    (await rateLimit(request, 'ia', 15, 600)) ?? (await rateLimit(request, 'ia-dia', 60, 86400));
  if (limited) {
    return json({ error: 'Hiciste muchas preguntas seguidas. Esperá un rato y probá de nuevo.' }, 429, {
      'retry-after': limited.headers.get('retry-after') ?? '600',
    });
  }

  let body: { mensajes?: unknown; pagina?: unknown; codigo?: unknown };
  try {
    const text = await request.text();
    if (text.length > 120_000) return json({ error: 'El mensaje es demasiado largo' }, 413);
    body = JSON.parse(text);
  } catch {
    return json({ error: 'El cuerpo no es un JSON válido' }, 400);
  }
  const messages = cleanMessages(body.mensajes);
  if (!messages) return json({ error: 'Escribí una pregunta.' }, 400);
  const path = typeof body.pagina === 'string' ? body.pagina.slice(0, 200) : '';
  const code = typeof body.codigo === 'string' ? body.codigo.slice(0, MAX_CODE_CHARS) : '';
  const context = pageContext(path, code);

  const client = new Anthropic();
  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 8000,
    // Chat answers don't need deep reasoning: low effort keeps them fast and cheap.
    output_config: { effort: 'low' },
    // If a request is declined by the safety classifiers, Anthropic retries it on its
    // recommended fallback model instead of returning the refusal.
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: [
      { type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } },
      ...(context ? [{ type: 'text' as const, text: `Contexto de la página: ${context}` }] : []),
    ],
    messages: messages.map((m) => ({ role: m.rol === 'usuario' ? 'user' : 'assistant', content: m.texto })),
  });

  const encoder = new TextEncoder();
  const body$ = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === 'refusal') {
          controller.enqueue(encoder.encode('\n\nPerdón, con eso no te puedo ayudar. ¿Tenés alguna otra duda de Python?'));
        } else if (final.stop_reason === 'max_tokens') {
          controller.enqueue(encoder.encode('\n\n(La respuesta quedó cortada: pedime que siga.)'));
        }
      } catch (err) {
        console.error('ia', err instanceof Anthropic.APIError ? `${err.status} ${err.message}` : err);
        const msg =
          err instanceof Anthropic.RateLimitError || (err instanceof Anthropic.APIError && (err.status ?? 0) >= 500)
            ? 'Pestle IA está con mucha demanda. Probá de nuevo en un ratito.'
            : 'Hubo un problema al responder. Probá de nuevo.';
        controller.enqueue(encoder.encode(`\n\n⚠️ ${msg}`));
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body$, {
    headers: { ...API_HEADERS, 'content-type': 'text/plain; charset=utf-8', 'x-accel-buffering': 'no' },
  });
});

export const OPTIONS = preflight;
