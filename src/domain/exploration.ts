// Exploración inicial: tareas breves de lectura y escritura. Los resultados se
// usan solo para elegir un punto de partida provisorio, que el adulto puede cambiar.
import { wordById } from '../content/words';
import { aggregateHypothesis, writingStartLevel } from './writingAnalysis';
import { generateItem, Item } from './items';
import type { ActivityId, ExplorationResult, Outcome, WritingSample } from './types';

export interface ExplorationTask {
  key: string;
  activityId: ActivityId;
  area: 'lectura' | 'escritura';
  item: Item;
  /** Si se define, la tarea solo se presenta si alguna de estas claves fue resuelta. */
  requires?: string[];
}

export function buildExploration(): ExplorationTask[] {
  const t = (key: string, activityId: ActivityId, area: 'lectura' | 'escritura', level: number, requires?: string[]): ExplorationTask => ({
    key,
    activityId,
    area,
    item: { ...generateItem(activityId, level, 0), context: 'exploracion' },
    requires,
  });
  const write = (key: string, word: string, requires?: string[]): ExplorationTask => ({
    key,
    activityId: 'escrituraPalabras',
    area: 'escritura',
    requires,
    item: {
      kind: 'write',
      id: `exp-${key}`,
      mode: 'palabra',
      word: wordById(word),
      prompt: 'Escribí el nombre del dibujo como sepas',
      speak: `Escribí, como sepas, la palabra: ${word}. Lo que escribas me ayuda a conocerte.`,
      showPic: true,
      context: 'exploracion',
    },
  });
  return [
    t('letras1', 'letraSonido', 'lectura', 1),
    t('inicial1', 'sonidoInicial', 'lectura', 1),
    write('esc1', 'sol'),
    t('letras2', 'letraSonido', 'lectura', 2),
    t('palabra1', 'lecturaPalabras', 'lectura', 1),
    write('esc2', 'luna'),
    t('inicial2', 'sonidoInicial', 'lectura', 2),
    t('palabra2', 'lecturaPalabras', 'lectura', 2, ['palabra1', 'letras2']),
    write('esc3', 'tomate'),
    t('oracion', 'lecturaPalabras', 'lectura', 3, ['palabra1', 'palabra2']),
    t('mensaje', 'comprension', 'lectura', 1, ['palabra1', 'palabra2']),
    write('esc4', 'mariposa', ['esc2', 'esc3']),
    {
      key: 'libre',
      activityId: 'escrituraLibre',
      area: 'escritura',
      item: {
        kind: 'write',
        id: 'exp-libre',
        mode: 'libre',
        prompt: 'Escribí tu alias o lo que quieras contarle a Lumi',
        speak: 'Si querés, escribí tu alias o algo que quieras contarme. También podés saltar.',
        showPic: false,
        ideas: ['Me llamo…', 'Me gusta…'],
        minSentences: 1,
        context: 'exploracion',
      },
    },
  ];
}

const solved = (o?: Outcome) => o === 'autonomo' || o === 'conApoyo';

export function summarizeExploration(byTask: Record<string, Outcome>, samples: WritingSample[], skipped: number): ExplorationResult {
  const readingKeys = ['letras1', 'letras2', 'inicial1', 'inicial2', 'palabra1', 'palabra2', 'oracion', 'mensaje'];
  const presented = readingKeys.filter((k) => byTask[k]);
  const correct = presented.filter((k) => solved(byTask[k])).length;
  const agg = aggregateHypothesis(samples.filter((s) => s.kind === 'palabra'));
  const startLevels: Partial<Record<ActivityId, number>> = {};
  startLevels.letraSonido = solved(byTask.letras2) && solved(byTask.letras1) ? 3 : solved(byTask.letras1) ? 2 : 1;
  startLevels.sonidoInicial = solved(byTask.inicial1) && solved(byTask.inicial2) ? 2 : 1;
  const readLevel = solved(byTask.oracion) ? 3 : solved(byTask.palabra2) ? 2 : 1;
  startLevels.lecturaPalabras = readLevel;
  startLevels.armarPalabra = readLevel >= 2 ? 2 : 1;
  startLevels.comprension = byTask.mensaje === 'autonomo' && solved(byTask.oracion) ? 2 : 1;
  startLevels.escrituraPalabras = writingStartLevel(agg.hypothesis);
  startLevels.mensajes = agg.hypothesis === 'alfabetica' ? 3 : readLevel >= 2 ? 2 : 1;
  return {
    at: new Date().toISOString(),
    reading: { correct, total: presented.length, skipped, byTask },
    writing: { samples: agg.basedOn, hypothesis: agg.hypothesis, confidence: agg.confidence },
    startLevels,
  };
}
