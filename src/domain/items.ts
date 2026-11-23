// Generación de consignas según actividad, nivel y apoyo.
import {
  LETTER_LEVELS,
  LETTER_NAMES,
  PICTURABLE,
  WORDS,
  Word,
  aDet,
  det,
  firstLetter,
  indef,
  initialPhoneme,
  soundAlikeLetters,
  wordById,
  wordsBySyllables,
  wordsStartingWith,
} from '../content/words';
import { STORIES } from '../content/stories';
import type { ActivityId, AttemptContext } from './types';

export type Rng = () => number;
export const shuffle = <T,>(arr: T[], rng: Rng = Math.random): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
export const pick = <T,>(arr: T[], rng: Rng = Math.random): T => arr[Math.floor(rng() * arr.length)];

export interface Option {
  id: string;
  label?: string;
  pic?: string;
  glyph?: { shape: Shape; color: ColorName; star?: boolean };
  speak?: string;
}
export interface Hint {
  text: string;
  speak?: string;
  removeOption?: boolean;
  revealText?: boolean; // implica que escuchó el texto
  highlight?: number; // índice de oración a resaltar
}
export interface ChoiceItem {
  kind: 'choice';
  id: string;
  instruction: string;
  speak: string;
  stimulus: {
    pic?: string;
    text?: string; // texto para leer (no se lee automáticamente)
    sayWord?: string; // palabra que se puede volver a escuchar
    bigLetter?: string; // letra grande como estímulo
    story?: { title: string; sentences: string[]; autoRead: boolean; art?: string[] };
    card?: { shape: Shape; color: ColorName; star?: boolean };
    rule?: 'forma' | 'color';
    template?: string; // mensaje con ___
  };
  options: Option[];
  correctId: string;
  hints: Hint[];
  explainCorrect: string;
  explainWrong: (chosen: Option) => string;
  followUpOral?: string; // invitación a explicar en voz alta
  textIsReading?: boolean; // si escuchar el texto cuenta como apoyo
  optionLayout?: 'grid' | 'list';
  showPicLabels?: boolean; // muestra el nombre escrito debajo de cada dibujo
  optionAudio?: boolean; // cada dibujo tiene un botón para escuchar su nombre
}
export interface BuildItem {
  kind: 'build';
  id: string;
  word: Word;
  tiles: string[];
  prefilled: number;
  showSyllableGuide: boolean;
  instruction: string;
  speak: string;
}
export interface WriteItem {
  kind: 'write';
  id: string;
  mode: 'palabra' | 'mensaje' | 'libre';
  word?: Word;
  prompt: string;
  speak: string;
  template?: string; // para mensajes: "Querida Mara: te mando una ___."
  showPic: boolean;
  ideas?: string[];
  minSentences?: number;
}
export interface SequenceItem {
  kind: 'sequence';
  id: string;
  title: string;
  cards: { id: string; pic: string; caption: string }[]; // en orden correcto
  anticipate?: { question: string; options: Option[] };
  instruction: string;
  speak: string;
}
export interface MemoryItem {
  kind: 'memory';
  id: string;
  symbols: { id: string; pic: string; name: string }[];
  sequence: string[];
  instruction: string;
  speak: string;
}
export interface PathItem {
  kind: 'path';
  id: string;
  size: number;
  start: [number, number];
  goal: [number, number];
  rocks: [number, number][];
  minMoves: number;
  instruction: string;
  speak: string;
}
export type Item = (ChoiceItem | BuildItem | WriteItem | SequenceItem | MemoryItem | PathItem) & { context?: AttemptContext };

export type Shape = 'círculo' | 'triángulo' | 'cuadrado';
export type ColorName = 'rojo' | 'azul' | 'amarillo';

let counter = 0;
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${(counter++).toString(36)}`;

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ---------- Lectura ----------

/** Estira el comienzo de una palabra para la voz: "sssol", "mmmono"; en oclusivas, la sílaba: "da... dado". */
export function stretchStart(x: Word): string {
  const ph = initialPhoneme(x);
  if (/[aeiou]/.test(x.text[0])) return `${x.text[0]}${x.text[0]}${x.text[0]}... ${x.text}`;
  if (['m', 'n', 's', 'f', 'l', 'r', 'y'].includes(ph)) {
    const head = x.text.startsWith('ll') ? 'll' : x.text[0];
    return `${head}${head}${head}${x.text.slice(head.length)}... ${x.text}`;
  }
  // Oclusivas (p, t, k, b, d, g): se dice el comienzo hasta la primera vocal: "pa... pato", "tre... tren".
  const onset = x.syllables.length > 1 ? x.syllables[0] : (x.text.match(/^[^aeiouáéíóú]*[aeiouáéíóú]/)?.[0] ?? x.text);
  return `${onset}... ${x.text}`;
}

const letterName = (l: string) => LETTER_NAMES[l] ?? l;

function letraSonido(level: number, support: number, rng: Rng, index: number): ChoiceItem {
  const set = LETTER_LEVELS[Math.min(level, LETTER_LEVELS.length) - 1].filter((l) => wordsStartingWith(l).length > 0);
  const target = pick(set, rng);
  const nOpts = support >= 1 ? 2 : level >= 3 ? 4 : 3;
  // Las letras distractoras nunca representan el mismo sonido que la buscada (b/v, s/z/c…).
  const distractLetters = shuffle(
    [...new Set([...set, ...LETTER_LEVELS.flat()])].filter((l) => !soundAlikeLetters(l, target) && wordsStartingWith(l).length > 0),
    rng,
  );
  const word = pick(wordsStartingWith(target), rng);
  const pictureMode = index % 2 === 1; // alterna: palabra→letra y letra→dibujo

  if (!pictureMode) {
    const letters = [target, ...distractLetters.filter((l) => set.includes(l)).slice(0, nOpts - 1)];
    while (letters.length < nOpts) letters.push(distractLetters.find((l) => !letters.includes(l))!);
    return {
      kind: 'choice',
      id: uid('ls'),
      instruction: `¿Con qué letra empieza ${word.text.toUpperCase()}?`,
      speak: `¿Con qué letra empieza ${word.text}?`,
      stimulus: { pic: word.pic, sayWord: word.text },
      options: shuffle(letters, rng).map((l) => ({ id: l, label: l, speak: `la ${letterName(l)}` })),
      correctId: target,
      hints: [
        { text: `Escuchá el comienzo: ${stretchStart(word).toUpperCase()}`, speak: stretchStart(word) },
        { text: 'Saqué una opción para ayudarte.', removeOption: true },
      ],
      explainCorrect: `¡Sí! ${word.text.toUpperCase()} empieza con la letra ${target.toUpperCase()}.`,
      explainWrong: (o) => `Esa es la letra ${o.id.toUpperCase()}. Escuchemos otra vez el comienzo: ${stretchStart(word)}.`,
    };
  }
  // letra → dibujo
  const nPics = support >= 1 ? 2 : 3;
  const otherWords: Word[] = [];
  for (const l of distractLetters) {
    if (otherWords.length >= nPics - 1) break;
    const cand = shuffle(wordsStartingWith(l), rng).find((x) => !soundAlikeLetters(firstLetter(x), target));
    if (cand && !otherWords.some((o) => soundAlikeLetters(firstLetter(o), firstLetter(cand)))) otherWords.push(cand);
  }
  return {
    kind: 'choice',
    id: uid('ls'),
    instruction: `¿Qué dibujo empieza con la letra ${target.toUpperCase()}?`,
    speak: `¿Qué dibujo empieza con la letra ${letterName(target)}?`,
    stimulus: { bigLetter: target },
    options: shuffle([word, ...otherWords], rng).map((x) => ({ id: x.id, pic: x.pic, label: x.text, speak: x.text })),
    correctId: word.id,
    optionAudio: true,
    hints: [
      { text: `La ${target.toUpperCase()} suena al comienzo de ${word.syllables[0].toUpperCase()}…`, speak: `La ${letterName(target)} suena así: ${stretchStart(word).split('...')[0]}` },
      { text: 'Saqué una opción para ayudarte.', removeOption: true },
    ],
    explainCorrect: `¡Sí! ${word.text.toUpperCase()} empieza con la letra ${target.toUpperCase()}.`,
    explainWrong: (o) => {
      const ow = wordById(o.id);
      return `${ow.text.toUpperCase()} empieza con la letra ${firstLetter(ow).toUpperCase()}. Buscamos uno que empiece con la ${target.toUpperCase()}.`;
    },
  };
}

function lastSyl(x: Word) {
  return strip(x.syllables[x.syllables.length - 1]);
}
const strip = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

function sonidoInicial(level: number, support: number, rng: Rng): ChoiceItem {
  const pool = PICTURABLE;
  if (level >= 4) {
    const target = pick(pool, rng);
    const n = target.syllables.length;
    const nums = support >= 1 ? shuffle([n, n === 1 ? 2 : n - 1], rng) : [1, 2, 3, 4];
    return {
      kind: 'choice',
      id: uid('si'),
      instruction: `¿Cuántas partes tiene ${target.text.toUpperCase()}? Aplaudí al decirla.`,
      speak: `¿Cuántas partes tiene ${target.text}? Aplaudí al decirla.`,
      stimulus: { pic: target.pic, sayWord: target.text },
      options: nums.map((k) => ({ id: String(k), label: String(k), speak: String(k) })),
      correctId: String(n),
      hints: [
        { text: target.syllables.join(' - ').toUpperCase(), speak: target.syllables.join('... ') },
        { text: 'Saqué una opción.', removeOption: true },
      ],
      explainCorrect: `Sí: ${target.syllables.join('-').toUpperCase()} tiene ${n} parte${n > 1 ? 's' : ''}.`,
      explainWrong: () => `Aplaudamos despacio: ${target.syllables.join(' - ')}.`,
      optionLayout: 'grid',
    };
  }
  if (level === 3) {
    // Rima: termina con la misma sílaba. Las otras opciones terminan distinto.
    const groups: Record<string, Word[]> = {};
    for (const x of pool) (groups[lastSyl(x)] ??= []).push(x);
    const g = pick(Object.values(groups).filter((gr) => gr.length >= 2), rng);
    const [target, match] = shuffle(g, rng);
    const others = shuffle(pool.filter((x) => lastSyl(x) !== lastSyl(target)), rng).slice(0, support >= 1 ? 1 : 2);
    return {
      kind: 'choice',
      id: uid('si'),
      instruction: `¿Qué otro dibujo termina igual que ${target.text.toUpperCase()}?`,
      speak: `¿Qué otro dibujo termina igual que ${target.text}?`,
      stimulus: { pic: target.pic, sayWord: target.text },
      options: shuffle([match, ...others], rng).map((x) => ({ id: x.id, pic: x.pic, label: x.text, speak: x.text })),
      correctId: match.id,
      optionAudio: true,
      hints: [
        { text: `Escuchá el final: …${lastSyl(target).toUpperCase()}`, speak: `${target.text}... termina con ${lastSyl(target)}` },
        { text: 'Saqué una opción.', removeOption: true },
      ],
      explainCorrect: `Sí: ${target.text.toUpperCase()} y ${match.text.toUpperCase()} terminan con ${lastSyl(target).toUpperCase()}.`,
      explainWrong: (o) => `${(o.label ?? '').toUpperCase()} termina distinto. Escuchemos otra vez el final de ${target.text}.`,
    };
  }
  // Sonido inicial: solo palabras que tienen al menos otra con el mismo primer sonido.
  const candidates = pool.filter((x) => pool.some((y) => y.id !== x.id && initialPhoneme(y) === initialPhoneme(x)));
  const target = pick(candidates, rng);
  const ph = initialPhoneme(target);
  const match = pick(pool.filter((x) => x.id !== target.id && initialPhoneme(x) === ph), rng);
  const nOthers = support >= 1 || level === 1 ? 1 : 2;
  const others: Word[] = [];
  for (const x of shuffle(pool, rng)) {
    if (others.length >= nOthers) break;
    if (initialPhoneme(x) !== ph && !others.some((o) => initialPhoneme(o) === initialPhoneme(x))) others.push(x);
  }
  return {
    kind: 'choice',
    id: uid('si'),
    instruction: `¿Qué otro dibujo empieza con el mismo sonido que ${target.text.toUpperCase()}?`,
    speak: `¿Qué otro dibujo empieza con el mismo sonido que ${target.text}?`,
    stimulus: { pic: target.pic, sayWord: target.text },
    options: shuffle([match, ...others], rng).map((x) => ({ id: x.id, pic: x.pic, label: x.text, speak: x.text })),
    correctId: match.id,
    optionAudio: true,
    hints: [
      { text: `Escuchemos otra vez el comienzo: ${stretchStart(target).toUpperCase()}`, speak: stretchStart(target) },
      { text: 'Saqué una opción.', removeOption: true },
    ],
    explainCorrect: `Sí: ${target.text.toUpperCase()} y ${match.text.toUpperCase()} empiezan con el mismo sonido.`,
    explainWrong: (o) => `${(o.label ?? '').toUpperCase()} empieza distinto. Escuchemos otra vez el comienzo: ${stretchStart(target)}.`,
  };
}

/** Grupos de palabras que se parecen al leer (todas con dibujo claro). */
const SIMILAR_SETS = [
  ['gato', 'pato', 'dado'],
  ['casa', 'vaca', 'camisa'],
  ['luna', 'lupa', 'uva'],
  ['sapo', 'zapato', 'sol'],
  ['mono', 'moto', 'oso'],
  ['pera', 'pez', 'pelota'],
  ['foca', 'vaca', 'flor'],
  ['barco', 'banana', 'ballena'],
  ['rosa', 'ratón', 'oso'],
];

const SENTENCE_SUBJECTS = ['gato', 'pato', 'oso', 'mono', 'foca', 'conejo', 'ratón'];
const SENTENCE_OBJECTS = ['pera', 'pan', 'banana', 'manzana', 'galleta', 'tomate'];

/** "come pan" (incontable) o "come una pera". */
const eats = (o: Word) => (o.id === 'pan' ? 'pan' : `${indef(o)} ${o.text}`);
const sentenceOf = (s: Word, o: Word) => `${capital(det(s))} ${s.text} come ${eats(o)}.`;

function lecturaPalabras(level: number, support: number, rng: Rng, reviewWord?: Word): ChoiceItem {
  const reviewOk = reviewWord && reviewWord.pictureOk ? reviewWord : undefined;
  if (level <= 2) {
    let target: Word;
    let others: Word[];
    if (level === 2) {
      const set = pick(SIMILAR_SETS, rng).map(wordById);
      target = reviewOk && !reviewOk.text.includes('ll') ? reviewOk : pick(set, rng);
      others = shuffle(set.filter((x) => x.id !== target.id), rng);
      if (others.length < 2) others = [...others, ...shuffle(PICTURABLE.filter((x) => x.id !== target.id && !others.includes(x)), rng)].slice(0, 2);
    } else {
      target = reviewOk ?? pick(PICTURABLE.filter((x) => x.syllables.length <= 2), rng);
      others = [];
      for (const x of shuffle(PICTURABLE, rng)) {
        if (others.length >= 2) break;
        if (x.text[0] !== target.text[0] && !others.some((o) => o.text[0] === x.text[0])) others.push(x);
      }
    }
    others = others.slice(0, support >= 1 ? 1 : 2);
    return {
      kind: 'choice',
      id: uid('lp'),
      instruction: 'Leé la palabra y tocá su dibujo',
      speak: 'Leé la palabra y tocá su dibujo.',
      stimulus: { text: target.text },
      options: shuffle([target, ...others], rng).map((x) => ({ id: x.id, pic: x.pic, speak: x.text })),
      correctId: target.id,
      textIsReading: true,
      hints: [
        { text: `Empieza con ${target.syllables[0].toUpperCase()}`, speak: `Empieza con ${target.syllables[0]}` },
        { text: 'Te la leo.', speak: target.text, revealText: true },
      ],
      explainCorrect: `Sí: dice ${target.text.toUpperCase()}.`,
      explainWrong: (o) => `Ese dibujo es ${wordById(o.id).text.toUpperCase()}. Mirá de nuevo las letras: ${target.text.toUpperCase()}.`,
    };
  }
  const subj = wordById(pick(SENTENCE_SUBJECTS, rng));
  const obj = reviewOk && SENTENCE_OBJECTS.includes(reviewOk.id) ? reviewOk : wordById(pick(SENTENCE_OBJECTS, rng));
  const subj2 = wordById(pick(SENTENCE_SUBJECTS.filter((x) => x !== subj.id), rng));
  const obj2 = wordById(pick(SENTENCE_OBJECTS.filter((x) => x !== obj.id), rng));
  if (level === 3) {
    const opts: Option[] = [
      { id: 'ok', pic: `${subj.pic}+${obj.pic}`, speak: `${det(subj)} ${subj.text} y ${eats(obj)}` },
      { id: 'a', pic: `${subj2.pic}+${obj.pic}`, speak: `${det(subj2)} ${subj2.text} y ${eats(obj)}` },
    ];
    if (support === 0) opts.push({ id: 'b', pic: `${subj.pic}+${obj2.pic}`, speak: `${det(subj)} ${subj.text} y ${eats(obj2)}` });
    const text = sentenceOf(subj, obj);
    return {
      kind: 'choice',
      id: uid('lo'),
      instruction: 'Leé la oración y tocá el dibujo que corresponde',
      speak: 'Leé la oración y tocá el dibujo que corresponde.',
      stimulus: { text },
      options: shuffle(opts, rng),
      correctId: 'ok',
      textIsReading: true,
      hints: [
        { text: '¿Quién come? Mirá la segunda palabra.', speak: '¿Quién come? Mirá la segunda palabra.' },
        { text: 'Te la leo.', speak: text, revealText: true },
      ],
      explainCorrect: `Sí: «${text}» El dibujo muestra ${aDet(subj)} ${subj.text} con ${eats(obj)}.`,
      explainWrong: () => 'Ese dibujo no coincide del todo. Leamos otra vez: ¿quién come y qué come?',
    };
  }
  const t1 = sentenceOf(subj, obj);
  const t2 = sentenceOf(subj2, obj);
  const t3 = sentenceOf(subj, obj2);
  const opts: Option[] = [{ id: 'ok', label: t1 }, { id: 'a', label: t2 }];
  if (support === 0) opts.push({ id: 'b', label: t3 });
  return {
    kind: 'choice',
    id: uid('lo'),
    instruction: '¿Qué oración cuenta lo que muestra el dibujo?',
    speak: '¿Qué oración cuenta lo que muestra el dibujo?',
    stimulus: { pic: `${subj.pic}+${obj.pic}` },
    options: shuffle(opts, rng),
    correctId: 'ok',
    textIsReading: true,
    optionLayout: 'list',
    hints: [
      { text: `En el dibujo hay: ${det(subj)} ${subj.text} y ${eats(obj)}.`, speak: `En el dibujo hay ${indef(subj)} ${subj.text} y ${eats(obj)}.` },
      { text: 'Te leo las oraciones.', speak: opts.map((o) => o.label).join(' ... '), revealText: true },
    ],
    explainCorrect: `Sí: «${t1}» coincide con el dibujo.`,
    explainWrong: (o) => `Esa oración cambia una palabra: «${o.label}». Compará cada palabra con el dibujo.`,
  };
}

function comprension(level: number, support: number, rng: Rng, used: Set<string>): ChoiceItem {
  const candidates = STORIES.filter((s) => s.level === Math.min(level, 3));
  const flat = candidates.flatMap((s) => s.questions.map((q, i) => ({ s, q, key: `${s.id}#${i}` })));
  const fresh = flat.filter((f) => !used.has(f.key));
  const { s, q, key } = pick(fresh.length ? fresh : flat, rng);
  used.add(key);
  let options = q.options.map((o) => ({ id: o.id, label: o.label, pic: o.pic }));
  if (support >= 1) options = [options.find((o) => o.id === q.correct)!, options.find((o) => o.id !== q.correct)!];
  const keyIdx = Math.max(
    0,
    s.sentences.findIndex((x) => q.options.find((o) => o.id === q.correct)!.label.toLowerCase().split(' ').some((wd) => wd.length > 3 && x.toLowerCase().includes(wd))),
  );
  return {
    kind: 'choice',
    id: uid('co'),
    instruction: q.q,
    speak: q.q,
    stimulus: { story: { title: s.title, sentences: s.sentences, autoRead: support >= 1, art: s.art } },
    options: shuffle(options, rng),
    correctId: q.correct,
    textIsReading: true,
    optionLayout: 'list',
    hints: [
      q.type === 'literal'
        ? { text: 'Mirá la oración resaltada.', highlight: keyIdx }
        : { text: 'No está escrito: pensá en las pistas del cuento.', speak: 'No está escrito con esas palabras. Pensá en las pistas que da el cuento.' },
      { text: 'Saqué una opción.', removeOption: true },
    ],
    explainCorrect: q.explain,
    explainWrong: () => (q.type === 'literal' ? 'Volvamos al cuento: la respuesta está escrita.' : 'Pensemos otra vez: ¿qué pistas da el cuento?'),
    followUpOral: q.type === 'inferencia' ? 'Contale a alguien por qué elegiste esa respuesta.' : undefined,
  };
}

// ---------- Escritura ----------

// Cada carta tiene una sola palabra que le da sentido; las otras concuerdan en
// género y número (no delatan la respuesta) pero no tienen sentido.
const MESSAGES: { template: string; answer: string; distract: string[]; to: string }[] = [
  { template: 'Querida Mara: te mando una ___ de mi jardín. Tito', answer: 'flor', distract: ['nube', 'ballena'], to: 'Mara' },
  { template: 'Bruno: no encuentro la ___ para abrir la puerta del faro. ¿La tenés vos? Lumi', answer: 'llave', distract: ['banana', 'luna'], to: 'Bruno' },
  { template: 'Tito: el sábado cruzamos el mar en ___. ¿Venís? Mara', answer: 'barco', distract: ['tomate', 'dado'], to: 'Tito' },
  { template: 'Lumi: para la fiesta me voy a poner la ___ nueva. Bruno', answer: 'camisa', distract: ['nube', 'manzana'], to: 'Lumi' },
  { template: 'Mara: perdí un ___ en la playa. ¿Lo viste? Tito', answer: 'zapato', distract: ['sol', 'tren'], to: 'Mara' },
  { template: 'Bruno: esta noche brilla la ___ arriba del faro. Lumi', answer: 'luna', distract: ['pelota', 'galleta'], to: 'Bruno' },
];

function mensajesChoice(level: number, support: number, rng: Rng): ChoiceItem {
  const m = pick(MESSAGES, rng);
  const n = level === 1 || support >= 1 ? 1 : 2;
  const options = shuffle([m.answer, ...m.distract.slice(0, n)], rng).map((x) => ({ id: x, label: x, pic: wordById(x).pic }));
  return {
    kind: 'choice',
    id: uid('me'),
    instruction: '¿Qué palabra falta para que la carta se entienda?',
    speak: '¿Qué palabra falta para que la carta se entienda?',
    stimulus: { template: m.template },
    options,
    correctId: m.answer,
    textIsReading: true,
    hints: [
      { text: 'Te leo la carta.', speak: m.template.replace('___', '... ¿qué falta? ...'), revealText: true },
      { text: 'Saqué una opción.', removeOption: true },
    ],
    explainCorrect: `Sí, ahora se entiende: «${m.template.replace('___', m.answer)}»`,
    explainWrong: (o) => `Escuchá cómo queda: «${m.template.replace('___', o.id)}». ¿Tiene sentido?`,
  };
}

function mensajesWrite(level: number, rng: Rng): WriteItem {
  const m = pick(MESSAGES, rng);
  const wd = wordById(m.answer);
  return {
    kind: 'write',
    id: uid('mw'),
    mode: 'mensaje',
    word: wd,
    prompt: 'Escribí la palabra que falta en la carta',
    speak: 'Escribí la palabra que falta en la carta.',
    template: m.template,
    showPic: level === 3,
  };
}

function escrituraPalabras(level: number, rng: Rng, reviewWord?: Word): WriteItem {
  const n = Math.min(level, 4);
  const pool = PICTURABLE.filter((x) => x.syllables.length === n);
  const wd = reviewWord && reviewWord.pictureOk ? reviewWord : pick(pool.length ? pool : PICTURABLE, rng);
  return {
    kind: 'write',
    id: uid('ep'),
    mode: 'palabra',
    word: wd,
    prompt: 'Escribí el nombre del dibujo como sepas',
    // Se dice la palabra para que todos escriban la misma (el dibujo podría nombrarse de otra forma).
    speak: `Escribí, como sepas, la palabra: ${wd.text}. No hay una forma equivocada de empezar.`,
    showPic: true,
  };
}

const FREE_PROMPTS = [
  { prompt: 'Escribile a Tito: ¿qué le llevarías a la isla?', ideas: ['Tito, te llevo…', 'Para la isla…'] },
  { prompt: 'Contale a Mara qué te gusta jugar', ideas: ['Me gusta jugar a…', 'Con mis amigos…'] },
  { prompt: 'Inventá un nombre para un barco y contá adónde va', ideas: ['Mi barco se llama…', 'Va a…'] },
  { prompt: 'Escribile a Bruno una idea para encender el faro', ideas: ['Bruno, podés…', 'Mi idea es…'] },
  { prompt: 'Escribí lo que quieras', ideas: ['Hoy…', 'Una vez…'] },
];

function escrituraLibre(level: number, rng: Rng): WriteItem {
  const p = pick(FREE_PROMPTS, rng);
  return {
    kind: 'write',
    id: uid('el'),
    mode: 'libre',
    prompt: p.prompt,
    speak: p.prompt + '. Escribí como sepas.',
    showPic: false,
    ideas: p.ideas,
    minSentences: level,
  };
}

// ---------- Construcción ----------

function armarPalabra(level: number, support: number, rng: Rng, reviewWord?: Word): BuildItem {
  const syl = level <= 1 ? 1 : level <= 3 ? 2 : 3;
  const pool = wordsBySyllables(syl).filter((x) => !/[áéíóú]/.test(x.text));
  const wd = reviewWord && reviewWord.syllables.length === syl ? reviewWord : pick(pool, rng);
  const nDistract = level === 1 ? 0 : level === 2 ? 1 : 2;
  const extras = shuffle('aeioumslpt'.split('').filter((c) => !wd.text.includes(c)), rng).slice(0, support >= 2 ? 0 : nDistract);
  return {
    kind: 'build',
    id: uid('ap'),
    word: wd,
    tiles: shuffle([...wd.text.split(''), ...extras], rng),
    prefilled: support >= 1 ? 1 : 0,
    showSyllableGuide: support >= 2,
    instruction: 'Armá la palabra del dibujo',
    speak: `Armá la palabra ${wd.text}.`,
  };
}

// ---------- Oral ----------

const SEQUENCES: { title: string; cards: { pic: string; caption: string }[]; anticipate?: { q: string; options: string[] } }[] = [
  {
    title: 'La semilla',
    cards: [
      { pic: 'semilla', caption: 'Plantamos una semilla.' },
      { pic: 'brote', caption: 'Sale un brote.' },
      { pic: 'girasol', caption: 'Crece una flor.' },
      { pic: 'abeja', caption: 'Llega una abeja a la flor.' },
    ],
    anticipate: { q: '¿Qué puede pasar después?', options: ['La abeja hace miel', 'La flor vuela', 'Se congela el sol'] },
  },
  {
    title: 'El huevo',
    cards: [
      { pic: 'huevo', caption: 'Hay un huevo en el nido.' },
      { pic: 'huevoRoto', caption: 'El huevo se rompe.' },
      { pic: 'pollito', caption: 'Sale un pollito.' },
      { pic: 'gallina', caption: 'El pollito crece.' },
    ],
    anticipate: { q: '¿Qué puede pasar después?', options: ['Pone un huevo', 'Maneja un auto', 'Va a la escuela'] },
  },
  {
    title: 'La torta',
    cards: [
      { pic: 'bol', caption: 'Mezclamos harina y huevos.' },
      { pic: 'horno', caption: 'La ponemos en el horno.' },
      { pic: 'torta', caption: 'Decoramos la torta.' },
      { pic: 'porcion', caption: 'Comemos una porción.' },
    ],
    anticipate: { q: '¿Qué puede pasar después?', options: ['Lavamos los platos', 'Nadamos en la torta', 'Aparece un dinosaurio'] },
  },
  {
    title: 'La lluvia',
    cards: [
      { pic: 'nube', caption: 'Se nubla el cielo.' },
      { pic: 'lluvia', caption: 'Empieza a llover.' },
      { pic: 'arcoiris', caption: 'Sale el arcoíris.' },
      { pic: 'sol', caption: 'Vuelve el sol.' },
    ],
    anticipate: { q: '¿Qué puede pasar después?', options: ['Salimos a jugar', 'Sale el sol de noche', 'Nieva en la playa'] },
  },
];

function secuencias(level: number, support: number, rng: Rng): SequenceItem {
  const s = pick(SEQUENCES, rng);
  const n = level === 1 || support >= 2 ? 3 : 4;
  return {
    kind: 'sequence',
    id: uid('sq'),
    title: s.title,
    cards: s.cards.slice(0, n).map((c, i) => ({ id: `${i}`, ...c })),
    anticipate:
      level >= 3 && s.anticipate
        ? { question: s.anticipate.q, options: s.anticipate.options.map((o, i) => ({ id: `${i}`, label: o })) }
        : undefined,
    instruction: '¿Qué pasó primero? Tocá las escenas en orden',
    speak: `${s.title}. Tocá las escenas en el orden en que pasaron.`,
  };
}

// Solo categorías sin ambigüedad para chicos, con dibujos claros.
type Cat = 'animal' | 'comida' | 'transporte' | 'cielo';
const CATS: Cat[] = ['animal', 'comida', 'transporte', 'cielo'];
const CATEGORY_LABEL: Record<Cat, string> = {
  animal: 'animales',
  comida: 'comidas',
  transporte: 'transportes',
  cielo: 'cosas que se ven en el cielo',
};
/** "los animales", "las comidas"… */
const CATEGORY_WITH_ART: Record<Cat, string> = {
  animal: 'los animales',
  comida: 'las comidas',
  transporte: 'los transportes',
  cielo: 'las cosas que se ven en el cielo',
};
const inCat = (c: Cat) => PICTURABLE.filter((x) => x.category === c);

const RIDDLES = [
  { text: 'Tiene caparazón y camina muy despacio.', answer: 'tortuga', others: ['conejo', 'pez'] },
  { text: 'Es amarilla, larga y se pela para comerla.', answer: 'banana', others: ['pera', 'tomate'] },
  { text: 'Tiene trompa larga y orejas enormes.', answer: 'elefante', others: ['oso', 'gato'] },
  { text: 'Tiene dos ruedas y pedales.', answer: 'bicicleta', others: ['auto', 'barco'] },
  { text: 'Tiene alas de colores y antes fue oruga.', answer: 'mariposa', others: ['pato', 'ballena'] },
  { text: 'Vive en el agua, es enorme y echa agua por la cabeza.', answer: 'ballena', others: ['foca', 'pato'] },
  { text: 'Tiene orejas largas y le encantan las zanahorias.', answer: 'conejo', others: ['ratón', 'gato'] },
];

function categorias(level: number, support: number, rng: Rng): ChoiceItem {
  if (level >= 4) {
    const r = pick(RIDDLES, rng);
    const opts = [r.answer, ...r.others.slice(0, support >= 1 ? 1 : 2)].map(wordById);
    const ans = wordById(r.answer);
    return {
      kind: 'choice',
      id: uid('ca'),
      instruction: `Adiviná: ${r.text}`,
      speak: `Adiviná: ${r.text}`,
      stimulus: {},
      options: shuffle(opts, rng).map((x) => ({ id: x.id, pic: x.pic, label: x.text, speak: x.text })),
      correctId: r.answer,
      showPicLabels: true,
      optionAudio: true,
      hints: [
        { text: 'Te lo digo otra vez.', speak: r.text },
        { text: 'Saqué una opción.', removeOption: true },
      ],
      explainCorrect: `¡Sí! Es ${det(ans)} ${ans.text}.`,
      explainWrong: (o) => {
        const x = wordById(o.id);
        return `${capital(det(x))} ${x.text} no coincide con todas las pistas. Escuchemos otra vez.`;
      },
      followUpOral: 'Ahora inventá vos una adivinanza y decila en voz alta.',
    };
  }
  const cat = pick(CATS, rng);
  const otherCats = CATS.filter((c) => c !== cat);
  const group = shuffle(inCat(cat), rng).slice(0, support >= 1 ? 2 : 3);
  if (level === 3) {
    const same = pick(inCat(cat).filter((x) => !group.includes(x)), rng);
    const diffCats = shuffle(otherCats, rng).slice(0, support >= 1 ? 1 : 2);
    const candidates = [same, ...diffCats.map((c) => pick(inCat(c), rng))];
    return {
      kind: 'choice',
      id: uid('ca'),
      instruction: '¿Cuál va con este grupo?',
      speak: `Mirá el grupo: ${group.map((g) => g.text).join(', ')}. ¿Cuál va con este grupo?`,
      stimulus: { pic: group.map((g) => g.pic).join('+') },
      options: shuffle(candidates, rng).map((x) => ({ id: x.id, pic: x.pic, label: x.text, speak: x.text })),
      correctId: same.id,
      showPicLabels: true,
      optionAudio: true,
      hints: [
        { text: `Todos son ${CATEGORY_LABEL[cat]}.`, speak: `Pensá: todos son ${CATEGORY_LABEL[cat]}.` },
        { text: 'Saqué una opción.', removeOption: true },
      ],
      explainCorrect: `Sí: ${det(same)} ${same.text} también va con ${CATEGORY_WITH_ART[cat]}.`,
      explainWrong: (o) => `${capital(o.label ?? '')} es de otro grupo. Este grupo es de ${CATEGORY_LABEL[cat]}.`,
      followUpOral: 'Nombrá en voz alta otro que también vaya en el grupo.',
    };
  }
  const odd = pick(inCat(pick(otherCats, rng)), rng);
  return {
    kind: 'choice',
    id: uid('ca'),
    instruction: '¿Cuál no va con los demás?',
    speak: '¿Cuál no va con los demás?',
    stimulus: {},
    options: shuffle([...group, odd], rng).map((x) => ({ id: x.id, pic: x.pic, label: x.text, speak: x.text })),
    correctId: odd.id,
    showPicLabels: true,
      optionAudio: true,
    hints: [
      { text: `Hay ${group.length} que son ${CATEGORY_LABEL[cat]}.`, speak: `Hay ${group.length} que son ${CATEGORY_LABEL[cat]}.` },
      { text: 'Saqué una opción.', removeOption: true },
    ],
    explainCorrect: `Sí: ${det(odd)} ${odd.text} no va, porque los demás son ${CATEGORY_LABEL[cat]}.`,
    explainWrong: (o) => `${capital(o.label ?? '')} sí va: es de ${CATEGORY_WITH_ART[cat]}, como los demás. Buscá el que es distinto.`,
    followUpOral: 'Contá en voz alta por qué no va.',
  };
}

// ---------- Cognitivo ----------

const LANTERNS = [
  { id: 'estrella', pic: 'estrella', name: 'estrella' },
  { id: 'luna', pic: 'luna', name: 'luna' },
  { id: 'pez', pic: 'pez', name: 'pez' },
  { id: 'caracol', pic: 'caracolMar', name: 'caracol' },
  { id: 'hoja', pic: 'hoja', name: 'hoja' },
  { id: 'ancla', pic: 'ancla', name: 'ancla' },
];

function memoria(level: number, support: number, rng: Rng): MemoryItem {
  const len = Math.max(2, level + 1 - (support >= 2 ? 1 : 0));
  const nSymbols = Math.min(6, Math.max(4, len + 1));
  const symbols = LANTERNS.slice(0, nSymbols);
  const sequence: string[] = [];
  for (let i = 0; i < len; i++) {
    let s = pick(symbols, rng).id;
    while (sequence[i - 1] === s) s = pick(symbols, rng).id;
    sequence.push(s);
  }
  return {
    kind: 'memory',
    id: uid('mm'),
    symbols,
    sequence,
    instruction: 'Mirá los faroles que se encienden y tocalos en el mismo orden',
    speak: 'Mirá los faroles que se encienden. Después tocalos en el mismo orden.',
  };
}

const SHAPES: Shape[] = ['círculo', 'triángulo', 'cuadrado'];
const COLORS: ColorName[] = ['rojo', 'azul', 'amarillo'];

export function flexibilidad(level: number, support: number, rng: Rng, index: number): ChoiceItem {
  const boxA = { shape: SHAPES[0], color: COLORS[1] };
  const boxB = { shape: SHAPES[1], color: COLORS[0] };
  // la carta comparte forma con una caja y color con la otra
  const shapeFromA = rng() < 0.5;
  const card = shapeFromA ? { shape: boxA.shape, color: boxB.color } : { shape: boxB.shape, color: boxA.color };
  let rule: 'forma' | 'color';
  if (level === 1) rule = 'color';
  else if (level === 2) rule = Math.floor(index / 3) % 2 === 0 ? 'color' : 'forma';
  else rule = rng() < 0.5 ? 'color' : 'forma';
  const star = level >= 4 && rng() < 0.4;
  const matchBy = (r: 'forma' | 'color') => (r === 'forma' ? (shapeFromA ? 'A' : 'B') : shapeFromA ? 'B' : 'A');
  const inverted = star ? (rule === 'forma' ? 'color' : 'forma') : rule;
  const correctId = matchBy(inverted);
  const ruleText = rule === 'forma' ? 'Ordená por FORMA' : 'Ordená por COLOR';
  return {
    kind: 'choice',
    id: uid('fx'),
    instruction: star ? `${ruleText}… ¡pero esta carta tiene estrella: hacé lo contrario!` : ruleText,
    speak: star ? `${ruleText}. Pero esta carta tiene estrella: hacé lo contrario.` : `${ruleText}.`,
    stimulus: { card: { ...card, star }, rule },
    options: [
      { id: 'A', glyph: boxA, label: `${boxA.shape} ${boxA.color}` },
      { id: 'B', glyph: boxB, label: `${boxB.shape} ${boxB.color}` },
    ],
    correctId,
    hints: [
      {
        text: `Fijate solo en el ${inverted === 'forma' ? 'dibujo (la forma)' : 'color'} de la carta: es ${inverted === 'forma' ? card.shape : card.color}.`,
        speak: `Fijate solo en ${inverted === 'forma' ? 'la forma' : 'el color'}. La carta es ${inverted === 'forma' ? card.shape : card.color}.`,
      },
    ],
    explainCorrect: `Sí: por ${inverted}, la carta (${card.shape} ${card.color}) va con la caja ${correctId === 'A' ? `${boxA.shape} ${boxA.color}` : `${boxB.shape} ${boxB.color}`}.`,
    explainWrong: () => `Esa caja coincide por ${inverted === 'forma' ? 'color' : 'forma'}. ${star ? 'Con estrella se hace lo contrario.' : `La regla ahora es ${rule}.`}`,
    optionLayout: 'grid',
  };
}

export function bfs(size: number, start: [number, number], goal: [number, number], rocks: [number, number][]): number {
  const blocked = new Set(rocks.map(([r, c]) => `${r},${c}`));
  const q: [number, number, number][] = [[start[0], start[1], 0]];
  const seen = new Set([`${start[0]},${start[1]}`]);
  while (q.length) {
    const [r, c, d] = q.shift()!;
    if (r === goal[0] && c === goal[1]) return d;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr;
      const nc = c + dc;
      const k = `${nr},${nc}`;
      if (nr < 0 || nc < 0 || nr >= size || nc >= size || blocked.has(k) || seen.has(k)) continue;
      seen.add(k);
      q.push([nr, nc, d + 1]);
    }
  }
  return -1;
}

function planificacion(level: number, rng: Rng): PathItem {
  const size = level === 1 ? 4 : 5;
  const nRocks = level === 1 ? 3 : level === 2 ? 5 : 8;
  for (let attempt = 0; attempt < 200; attempt++) {
    const start: [number, number] = [size - 1, 0];
    const goal: [number, number] = [0, size - 1];
    const rocks: [number, number][] = [];
    while (rocks.length < nRocks) {
      const r = Math.floor(rng() * size);
      const c = Math.floor(rng() * size);
      if ((r === start[0] && c === start[1]) || (r === goal[0] && c === goal[1]) || rocks.some(([a, b]) => a === r && b === c)) continue;
      rocks.push([r, c]);
    }
    const d = bfs(size, start, goal, rocks);
    if (d > 0 && d >= (size - 1) * 2) {
      return {
        kind: 'path',
        id: uid('pl'),
        size,
        start,
        goal,
        rocks,
        minMoves: d,
        instruction: 'Llevá a Tito hasta el buzón sin pisar piedras',
        speak: 'Llevá a Tito hasta el buzón. Pensá el camino antes de moverte. No se puede pisar las piedras.',
      };
    }
  }
  return { kind: 'path', id: uid('pl'), size: 4, start: [3, 0], goal: [0, 3], rocks: [], minMoves: 6, instruction: 'Llevá a Tito hasta el buzón', speak: 'Llevá a Tito hasta el buzón.' };
}

// ---------- API ----------

export interface GenContext {
  rng?: Rng;
  reviewWords?: string[]; // palabras ya resueltas en otras actividades
  index?: number;
  usedStories?: Set<string>;
}

/** Para quienes todavía no leen: la voz nombra los dibujos después de la consigna. */
function withOptionNames(it: Item): Item {
  if (it.kind !== 'choice' || !it.optionAudio) return it;
  const names = it.options.map((o) => o.speak).filter(Boolean);
  return names.length ? { ...it, speak: `${it.speak} Los dibujos son: ${names.join(', ')}.` } : it;
}

export function generateItem(activity: ActivityId, level: number, support: number, ctx: GenContext = {}): Item {
  return withOptionNames(generateItemRaw(activity, level, support, ctx));
}

function generateItemRaw(activity: ActivityId, level: number, support: number, ctx: GenContext = {}): Item {
  const rng = ctx.rng ?? Math.random;
  // Solo palabras que existen en el léxico actual (los datos guardados pueden ser de versiones anteriores).
  const validReview = (ctx.reviewWords ?? []).filter((id) => WORDS.some((x) => x.id === id));
  const review = validReview.length ? wordById(pick(validReview, rng)) : undefined;
  switch (activity) {
    case 'letraSonido':
      return letraSonido(level, support, rng, ctx.index ?? 0);
    case 'sonidoInicial':
      return sonidoInicial(level, support, rng);
    case 'armarPalabra':
      return armarPalabra(level, support, rng, review);
    case 'lecturaPalabras':
      return lecturaPalabras(level, support, rng, review);
    case 'comprension':
      return comprension(level, support, rng, ctx.usedStories ?? new Set());
    case 'escrituraPalabras':
      return escrituraPalabras(level, rng, review);
    case 'mensajes':
      return level <= 2 ? mensajesChoice(level, support, rng) : mensajesWrite(level, rng);
    case 'escrituraLibre':
      return escrituraLibre(level, rng);
    case 'secuencias':
      return secuencias(level, support, rng);
    case 'categorias':
      return categorias(level, support, rng);
    case 'memoria':
      return memoria(level, support, rng);
    case 'flexibilidad':
      return flexibilidad(level, support, rng, ctx.index ?? 0);
    case 'planificacion':
      return planificacion(level, rng);
  }
}

export const MISSION_LENGTH: Record<ActivityId, number> = {
  letraSonido: 5,
  sonidoInicial: 5,
  armarPalabra: 4,
  lecturaPalabras: 5,
  comprension: 3,
  escrituraPalabras: 4,
  mensajes: 4,
  escrituraLibre: 1,
  secuencias: 2,
  categorias: 4,
  memoria: 5,
  flexibilidad: 6,
  planificacion: 2,
};

/**
 * Arma una misión: consignas del nivel actual + una de repaso (regla 3).
 * El repaso usa una palabra ya resuelta en otra actividad, o el nivel anterior.
 */
export function buildMission(
  activity: ActivityId,
  level: number,
  support: number,
  reviewWords: string[],
  rng: Rng = Math.random,
): Item[] {
  const n = MISSION_LENGTH[activity];
  const usedStories = new Set<string>();
  const items: Item[] = [];
  for (let i = 0; i < n; i++) items.push({ ...generateItem(activity, level, support, { rng, index: i, usedStories }), context: 'mision' });
  if (n >= 3) {
    const wordBased: ActivityId[] = ['armarPalabra', 'lecturaPalabras', 'escrituraPalabras'];
    let reviewItem: Item | null = null;
    if (wordBased.includes(activity) && reviewWords.length) {
      reviewItem = generateItem(activity, level, support, { rng, reviewWords, index: n });
    } else if (level > 1) {
      reviewItem = generateItem(activity, level - 1, 0, { rng, index: n, usedStories });
    }
    if (reviewItem) items.splice(Math.floor(n / 2), 1, { ...reviewItem, context: 'repaso' });
  }
  return items;
}
