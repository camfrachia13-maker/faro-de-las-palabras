// Informes para adultos: evidencias concretas, sin porcentajes inventados.
// Se diferencia participar (completar) de mostrar evidencia de aprendizaje.
import { ACTIVITIES } from '../content/activities';
import { aggregateHypothesis } from './writingAnalysis';
import type { ActivityId, Area, Attempt, Profile } from './types';

export interface ActivityEvidence {
  activityId: ActivityId;
  level: number;
  support: number;
  total: number;
  recentAtLevel: { autonomo: number; conApoyo: number; noResuelto: number; abierta: number; n: number };
  hintsUsed: number;
  listened: number;
  statement: string;
  kind: 'pocosDatos' | 'evidencia' | 'enProceso' | 'necesitaAcompanamiento' | 'abierta';
}

export function activityEvidence(p: Profile, id: ActivityId): ActivityEvidence {
  const s = p.skills[id];
  const all = p.attempts.filter((a) => a.activityId === id && a.context !== 'exploracion');
  const atLevel = all.filter((a) => a.level === s.level).slice(-8);
  const c = { autonomo: 0, conApoyo: 0, noResuelto: 0, abierta: 0, n: atLevel.length };
  for (const a of atLevel) c[a.outcome]++;
  const hintsUsed = atLevel.reduce((acc, a) => acc + a.hintsUsed, 0);
  const listened = atLevel.filter((a) => a.listenedToText).length;
  const lvlName = ACTIVITIES[id].levels[s.level - 1] ?? `nivel ${s.level}`;
  let statement: string;
  let kind: ActivityEvidence['kind'];
  if (c.abierta > 0 && c.abierta === c.n) {
    kind = 'abierta';
    statement = `${c.n} producción${c.n === 1 ? '' : 'es'} abierta${c.n === 1 ? '' : 's'} guardada${c.n === 1 ? '' : 's'}. Revisalas en "Escritura": no se califican automáticamente.`;
  } else if (c.n < 4) {
    kind = 'pocosDatos';
    statement = `Todavía hay pocos datos en "${lvlName}" (${c.n} consigna${c.n === 1 ? '' : 's'}). No alcanza para sacar conclusiones.`;
  } else if (c.autonomo >= Math.ceil(c.n * 0.75)) {
    kind = 'evidencia';
    statement = `En "${lvlName}", resolvió sin pistas y al primer intento ${c.autonomo} de las últimas ${c.n} consignas.`;
  } else if (c.noResuelto >= Math.ceil(c.n / 2)) {
    kind = 'necesitaAcompanamiento';
    statement = `En "${lvlName}", ${c.noResuelto} de las últimas ${c.n} consignas quedaron sin resolver. Conviene acompañar esta actividad.`;
  } else {
    kind = 'enProceso';
    statement = `En "${lvlName}", de las últimas ${c.n} consignas: ${c.autonomo} sin ayuda, ${c.conApoyo} con apoyo y ${c.noResuelto} sin resolver.`;
  }
  return { activityId: id, level: s.level, support: s.support, total: all.length, recentAtLevel: c, hintsUsed, listened, statement, kind };
}

export function participation(p: Profile) {
  const attempts = p.attempts.filter((a) => a.context !== 'exploracion');
  const byArea: Record<Area, number> = { lectura: 0, escritura: 0, oral: 0, cognitivo: 0 };
  for (const a of attempts) byArea[a.area]++;
  return {
    sessions: p.sessions.length,
    missions: p.missionsCompleted,
    attempts: attempts.length,
    samples: p.samples.length,
    byArea,
    lastActivity: attempts.length ? attempts[attempts.length - 1].at : undefined,
  };
}

export function writingSummary(p: Profile) {
  return aggregateHypothesis(p.samples.filter((s) => s.kind === 'palabra'));
}

/** Sugerencias breves para acompañar, basadas en datos observables. */
export function suggestions(p: Profile): string[] {
  const out: string[] = [];
  const ev = (id: ActivityId) => activityEvidence(p, id);
  const sk = (id: ActivityId) => p.skills[id];
  if (sk('letraSonido').support >= 1 || ev('letraSonido').kind === 'necesitaAcompanamiento')
    out.push('Jueguen a "veo veo con sonidos": "Veo algo que empieza con mmm…". Estiren los sonidos que se pueden alargar (m, s, l, f).');
  if (sk('sonidoInicial').support >= 1)
    out.push('Al leer cuentos juntos, deténganse en palabras que empiezan o terminan igual y repítanlas en voz alta.');
  if (ev('lecturaPalabras').listened >= 3)
    out.push('Suele pedir que le lean el texto. Probá leer la primera sílaba y dejar que complete la palabra.');
  const w = writingSummary(p);
  if (w.hypothesis === 'presilabica' || w.hypothesis === 'silabica')
    out.push('Pídanle que lea en voz alta lo que escribió señalando con el dedo. Conversen sobre qué sonidos escucha, sin corregir cada letra.');
  if (w.hypothesis === 'silabicoAlfabetica')
    out.push('Al escribir juntos, digan la palabra despacio sílaba por sílaba y pregunten: "¿Qué más se escucha en esta parte?".');
  if (p.samples.filter((s) => s.kind === 'libre').length === 0)
    out.push('Todavía no hay escrituras libres. Una lista de compras o un mensaje para alguien de la familia son buenas oportunidades fuera de la app.');
  if (sk('comprension').support >= 1)
    out.push('Después de leer un cuento, preguntá "¿Cómo te diste cuenta?" para conversar sobre las pistas del texto.');
  if (sk('memoria').support >= 1)
    out.push('En juegos de memoria, nombrar en voz alta lo que se ve puede ayudar a recordar.');
  if (!out.length) out.push('Conversen sobre lo que jugó hoy: qué le resultó fácil, qué le costó y qué estrategia usó.');
  return out.slice(0, 5);
}

export function attemptsForDisplay(p: Profile, limit = 60): Attempt[] {
  return [...p.attempts].reverse().slice(0, limit);
}

export const OUTCOME_LABEL: Record<string, string> = {
  autonomo: 'Sin ayuda',
  conApoyo: 'Con apoyo',
  noResuelto: 'Sin resolver',
  abierta: 'Producción abierta',
};
