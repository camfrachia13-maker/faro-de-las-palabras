// Análisis descriptivo de escrituras de palabras. Produce HIPÓTESIS PEDAGÓGICAS
// provisorias (inspiradas en la psicogénesis de la escritura) que requieren
// revisión profesional. No es una evaluación ni un diagnóstico.
import type { WordAnalysis, WritingHypothesis, WritingSample } from './types';

export const HYPOTHESIS_LABEL: Record<WritingHypothesis, string> = {
  presilabica: 'Posible escritura presilábica',
  silabica: 'Posible escritura silábica',
  silabicoAlfabetica: 'Posible escritura silábico-alfabética',
  alfabetica: 'Posible escritura alfabética',
  sinDatos: 'Sin datos suficientes',
};

export const HYPOTHESIS_HELP: Record<WritingHypothesis, string> = {
  presilabica: 'Las letras escritas todavía no parecen vincularse con los sonidos de la palabra.',
  silabica: 'Parece usar aproximadamente una letra por sílaba, a menudo una vocal o consonante de esa sílaba.',
  silabicoAlfabetica: 'Algunas sílabas aparecen completas y otras con una sola letra.',
  alfabetica: 'Escribe la mayoría de los sonidos de la palabra; puede haber errores ortográficos.',
  sinDatos: 'Hacen falta más producciones para formular una hipótesis.',
};

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/ñ/g, '\u0001')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\u0001/g, 'ñ')
    .replace(/[^a-zñ ]/g, '')
    .trim();
}

export function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}

/** Letras que suenan igual en español rioplatense; se aceptan como correspondencia sonora. */
const SAME_SOUND: string[][] = [
  ['b', 'v'],
  ['s', 'z', 'c'],
  ['c', 'k', 'q'],
  ['y', 'll', 'i'],
  ['g', 'j'],
];
function soundsAlike(a: string, b: string) {
  if (a === b) return true;
  return SAME_SOUND.some((g) => g.includes(a) && g.includes(b));
}

/**
 * Cuenta cuántas sílabas tienen, en orden, al menos una letra escrita que les
 * corresponde. Aproximación simple y explicable.
 */
export function matchSyllables(syllables: string[], written: string): number {
  let pos = 0;
  let matched = 0;
  for (const syl of syllables) {
    const letters = normalize(syl).replace(/h/g, '').split('');
    let found = -1;
    // se busca en una ventana corta para no "saltar" demasiado
    for (let i = pos; i < Math.min(written.length, pos + 3); i++) {
      if (letters.some((l) => soundsAlike(l, written[i]))) {
        found = i;
        break;
      }
    }
    if (found >= 0) {
      matched++;
      pos = found + 1;
      // consumir letras adicionales que pertenecen a la misma sílaba
      while (pos < written.length && letters.some((l) => soundsAlike(l, written[pos]))) pos++;
    }
  }
  return matched;
}

export function analyzeWord(target: string, syllables: string[], writtenRaw: string): WordAnalysis {
  const t = normalize(target).replace(/ /g, '');
  const w = normalize(writtenRaw).replace(/ /g, '');
  const evidence: string[] = [];
  const base = {
    target,
    written: writtenRaw,
    targetSyllables: syllables.length,
    writtenLength: w.length,
  };
  if (!w) {
    return { ...base, matchedSyllables: 0, correctInitial: false, exact: false, distance: t.length, hypothesis: 'sinDatos', evidence: ['No escribió letras en esta consigna.'] };
  }
  const distance = levenshtein(t, w);
  const exact = distance === 0;
  const correctInitial = soundsAlike(t[0], w[0]);
  const matched = matchSyllables(syllables, w);
  evidence.push(`Escribió ${w.length} letra${w.length === 1 ? '' : 's'} para una palabra de ${syllables.length} sílaba${syllables.length === 1 ? '' : 's'}.`);
  evidence.push(`${matched} de ${syllables.length} sílabas tienen alguna letra que les corresponde.`);
  if (correctInitial) evidence.push('El comienzo coincide con el sonido inicial.');

  let hypothesis: WritingHypothesis;
  const soundDistance = levenshtein(t.replace(/h/g, ''), w.replace(/h/g, ''));
  if (exact || (soundDistance <= Math.max(1, Math.floor(t.length / 4)) && Math.abs(w.length - t.length) <= 1)) {
    hypothesis = 'alfabetica';
    evidence.push(exact ? 'Coincide con la escritura convencional.' : 'Representa casi todos los sonidos (diferencias menores u ortográficas).');
  } else if (matched === 0) {
    hypothesis = 'presilabica';
  } else if (w.length <= syllables.length + (syllables.length === 1 ? 1 : 0) && matched >= Math.ceil(syllables.length / 2)) {
    hypothesis = 'silabica';
  } else {
    hypothesis = 'silabicoAlfabetica';
  }
  return { ...base, matchedSyllables: matched, correctInitial, exact, distance, hypothesis, evidence };
}

const ORDER: WritingHypothesis[] = ['presilabica', 'silabica', 'silabicoAlfabetica', 'alfabetica'];

/**
 * Hipótesis agregada a partir de varias producciones. Requiere al menos 3
 * muestras de palabras para formularse, y marca la confianza como "baja" si
 * las muestras no coinciden.
 */
export function aggregateHypothesis(samples: WritingSample[]): {
  hypothesis: WritingHypothesis;
  confidence: 'baja' | 'media';
  basedOn: number;
  counts: Partial<Record<WritingHypothesis, number>>;
} {
  const analyses = samples
    .map((s) => s.analysis)
    .filter((a): a is WordAnalysis => !!a && a.hypothesis !== 'sinDatos')
    .slice(-8);
  const counts: Partial<Record<WritingHypothesis, number>> = {};
  for (const a of analyses) counts[a.hypothesis] = (counts[a.hypothesis] ?? 0) + 1;
  if (analyses.length < 3) return { hypothesis: 'sinDatos', confidence: 'baja', basedOn: analyses.length, counts };
  let best: WritingHypothesis = 'sinDatos';
  let bestN = 0;
  for (const h of ORDER) {
    const n = counts[h] ?? 0;
    if (n >= bestN && n > 0) {
      best = h;
      bestN = n;
    }
  }
  const confidence = bestN / analyses.length >= 0.6 && analyses.length >= 4 ? 'media' : 'baja';
  return { hypothesis: best, confidence, basedOn: analyses.length, counts };
}

/** Nivel inicial sugerido para actividades de escritura según la hipótesis. */
export function writingStartLevel(h: WritingHypothesis): number {
  switch (h) {
    case 'alfabetica':
      return 3;
    case 'silabicoAlfabetica':
      return 2;
    default:
      return 1;
  }
}
