// Léxico base. Cada palabra tiene sílabas, un pictograma provisorio (emoji del
// sistema; en producción se reemplazan por ilustraciones propias), categoría y género.
export type Category = 'animal' | 'comida' | 'transporte' | 'cielo' | 'objeto' | 'planta' | 'lugar';

export interface Word {
  id: string;
  text: string;
  syllables: string[];
  pic: string;
  category: Category;
  gender: 'm' | 'f';
  /** false si el dibujo se puede nombrar de otra forma (p. ej. 💡 "luz" o "foco"): no se usa donde el niño debe nombrar el dibujo. */
  pictureOk: boolean;
}

const w = (text: string, syl: string, pic: string, category: Category, gender: 'm' | 'f', pictureOk = true): Word => ({
  id: text,
  text,
  syllables: syl.split('-'),
  pic,
  category,
  gender,
  pictureOk,
});

export const WORDS: Word[] = [
  // 1 sílaba
  w('sol', 'sol', '☀️', 'cielo', 'm'),
  w('pan', 'pan', '🍞', 'comida', 'm'),
  w('mar', 'mar', '🌊', 'cielo', 'm', false),
  w('flor', 'flor', '🌸', 'planta', 'f'),
  w('tren', 'tren', '🚂', 'transporte', 'm'),
  w('pez', 'pez', '🐟', 'animal', 'm'),
  w('luz', 'luz', '💡', 'objeto', 'f', false),
  // 2 sílabas
  w('gato', 'ga-to', '🐱', 'animal', 'm'),
  w('pato', 'pa-to', '🦆', 'animal', 'm'),
  w('luna', 'lu-na', '🌙', 'cielo', 'f'),
  w('casa', 'ca-sa', '🏠', 'lugar', 'f'),
  w('nube', 'nu-be', '☁️', 'cielo', 'f'),
  w('sapo', 'sa-po', '🐸', 'animal', 'm'),
  w('foca', 'fo-ca', '🦭', 'animal', 'f'),
  w('vaca', 'va-ca', '🐄', 'animal', 'f'),
  w('mono', 'mo-no', '🐒', 'animal', 'm'),
  w('dado', 'da-do', '🎲', 'objeto', 'm'),
  w('lupa', 'lu-pa', '🔍', 'objeto', 'f'),
  w('pera', 'pe-ra', '🍐', 'comida', 'f'),
  w('uva', 'u-va', '🍇', 'comida', 'f'),
  w('oso', 'o-so', '🐻', 'animal', 'm'),
  w('isla', 'is-la', '🏝️', 'lugar', 'f'),
  w('auto', 'au-to', '🚗', 'transporte', 'm'),
  w('moto', 'mo-to', '🏍️', 'transporte', 'f'),
  w('barco', 'bar-co', '⛵', 'transporte', 'm'),
  w('llave', 'lla-ve', '🔑', 'objeto', 'f'),
  w('rosa', 'ro-sa', '🌹', 'planta', 'f'),
  w('nariz', 'na-riz', '👃', 'objeto', 'f'),
  w('ratón', 'ra-tón', '🐭', 'animal', 'm'),
  w('delfín', 'del-fín', '🐬', 'animal', 'm'),
  // 3 sílabas
  w('pelota', 'pe-lo-ta', '⚽', 'objeto', 'f'),
  w('tomate', 'to-ma-te', '🍅', 'comida', 'm'),
  w('conejo', 'co-ne-jo', '🐰', 'animal', 'm'),
  w('camisa', 'ca-mi-sa', '👕', 'objeto', 'f'),
  w('zapato', 'za-pa-to', '👟', 'objeto', 'm'),
  w('manzana', 'man-za-na', '🍎', 'comida', 'f'),
  w('galleta', 'ga-lle-ta', '🍪', 'comida', 'f'),
  w('ballena', 'ba-lle-na', '🐋', 'animal', 'f'),
  w('tortuga', 'tor-tu-ga', '🐢', 'animal', 'f'),
  w('estrella', 'es-tre-lla', '⭐', 'cielo', 'f'),
  w('banana', 'ba-na-na', '🍌', 'comida', 'f'),
  w('caracol', 'ca-ra-col', '🐌', 'animal', 'm'),
  w('avión', 'a-vión', '✈️', 'transporte', 'm'),
  // 4 sílabas
  w('mariposa', 'ma-ri-po-sa', '🦋', 'animal', 'f'),
  w('elefante', 'e-le-fan-te', '🐘', 'animal', 'm'),
  w('cocodrilo', 'co-co-dri-lo', '🐊', 'animal', 'm'),
  w('bicicleta', 'bi-ci-cle-ta', '🚲', 'transporte', 'f'),
  w('dinosaurio', 'di-no-sau-rio', '🦕', 'animal', 'm'),
];

export const wordById = (id: string) => {
  const found = WORDS.find((x) => x.id === id);
  if (!found) throw new Error(`Palabra inexistente en el léxico: ${id}`);
  return found;
};

/** Palabras cuyo dibujo se reconoce sin ambigüedad. */
export const PICTURABLE = WORDS.filter((x) => x.pictureOk);

export const wordsBySyllables = (n: number) => WORDS.filter((x) => x.syllables.length === n && !x.text.includes('ll'));

const strip = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * Primer SONIDO de la palabra (no la letra), en español rioplatense:
 * c/k/qu → k; s/z/ce/ci → s; b/v → b; g+e/i y j → j; ll/y → y.
 */
export function initialPhoneme(word: Word | string): string {
  const t = strip(typeof word === 'string' ? word : word.text).toLowerCase();
  if (t.startsWith('ll')) return 'y';
  if (t.startsWith('ch')) return 'ch';
  if (t.startsWith('qu')) return 'k';
  const [c0, c1] = t;
  if (c0 === 'h') return initialPhoneme(t.slice(1));
  if (c0 === 'c') return c1 === 'e' || c1 === 'i' ? 's' : 'k';
  if (c0 === 'z') return 's';
  if (c0 === 'v') return 'b';
  if (c0 === 'g') return c1 === 'e' || c1 === 'i' ? 'j' : 'g';
  if (c0 === 'y') return 'y';
  return c0;
}

/** Primera letra escrita (ll y ch como unidad). */
export function firstLetter(word: Word): string {
  const t = strip(word.text).toLowerCase();
  if (t.startsWith('ll')) return 'll';
  if (t.startsWith('ch')) return 'ch';
  return t[0];
}

/** Letras que representan el mismo sonido inicial: nunca se ofrecen juntas como opciones. */
export const SAME_SOUND_LETTERS: string[][] = [
  ['b', 'v'],
  ['s', 'z', 'c'],
  ['c', 'k', 'q'],
  ['g', 'j'],
  ['y', 'll', 'i'],
];
export const soundAlikeLetters = (a: string, b: string) =>
  a === b || SAME_SOUND_LETTERS.some((g) => g.includes(a) && g.includes(b));

/** Nombre de cada letra, para que la voz no las lea de forma ambigua. */
export const LETTER_NAMES: Record<string, string> = {
  a: 'a', b: 'be', c: 'ce', d: 'de', e: 'e', f: 'efe', g: 'ge', h: 'hache', i: 'i', j: 'jota', k: 'ka', l: 'ele',
  m: 'eme', n: 'ene', ñ: 'eñe', o: 'o', p: 'pe', q: 'cu', r: 'erre', s: 'ese', t: 'te', u: 'u', v: 've corta',
  w: 'doble ve', x: 'equis', y: 'ye', z: 'zeta', ll: 'doble ele', ch: 'che',
};

/**
 * Letras por nivel. Solo letras cuyo sonido inicial es inequívoco en las
 * palabras del léxico (p. ej. no hay "v": suena igual que "b").
 */
export const LETTER_LEVELS: string[][] = [
  ['a', 'e', 'i', 'o', 'u'],
  ['m', 's', 'l', 'p', 't'],
  ['n', 'f', 'd', 'g', 'c', 'r'],
  ['b', 'd', 'p', 'r', 'z'],
];

/** Palabras de dibujo claro que empiezan con esa letra (y con el sonido esperado). */
export function wordsStartingWith(letter: string): Word[] {
  return PICTURABLE.filter((x) => firstLetter(x) === letter && !(letter === 'c' && initialPhoneme(x) !== 'k') && !(letter === 'g' && initialPhoneme(x) !== 'g'));
}

/** Artículo determinado: "el gato", "la foca". */
export const det = (x: Word) => (x.gender === 'f' ? 'la' : 'el');
/** Artículo indeterminado: "un tomate", "una pera". */
export const indef = (x: Word) => (x.gender === 'f' ? 'una' : 'un');
/** "al gato" / "a la foca". */
export const aDet = (x: Word) => (x.gender === 'f' ? 'a la' : 'al');
