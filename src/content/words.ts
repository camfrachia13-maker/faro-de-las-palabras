// Léxico base. Cada palabra tiene sílabas y un pictograma (emoji del sistema)
// como ilustración provisoria; en producción se reemplazan por ilustraciones propias.
export interface Word {
  id: string;
  text: string;
  syllables: string[];
  pic: string;
  category: 'animal' | 'comida' | 'naturaleza' | 'objeto' | 'transporte';
}

const w = (text: string, syl: string, pic: string, category: Word['category']): Word => ({
  id: text,
  text,
  syllables: syl.split('-'),
  pic,
  category,
});

export const WORDS: Word[] = [
  // 1 sílaba
  w('sol', 'sol', '☀️', 'naturaleza'),
  w('pan', 'pan', '🍞', 'comida'),
  w('mar', 'mar', '🌊', 'naturaleza'),
  w('flor', 'flor', '🌸', 'naturaleza'),
  w('tren', 'tren', '🚂', 'transporte'),
  w('pez', 'pez', '🐟', 'animal'),
  w('luz', 'luz', '💡', 'objeto'),
  // 2 sílabas
  w('gato', 'ga-to', '🐱', 'animal'),
  w('pato', 'pa-to', '🦆', 'animal'),
  w('luna', 'lu-na', '🌙', 'naturaleza'),
  w('casa', 'ca-sa', '🏠', 'objeto'),
  w('nube', 'nu-be', '☁️', 'naturaleza'),
  w('sapo', 'sa-po', '🐸', 'animal'),
  w('foca', 'fo-ca', '🦭', 'animal'),
  w('vaca', 'va-ca', '🐄', 'animal'),
  w('mono', 'mo-no', '🐒', 'animal'),
  w('dado', 'da-do', '🎲', 'objeto'),
  w('lupa', 'lu-pa', '🔍', 'objeto'),
  w('pera', 'pe-ra', '🍐', 'comida'),
  w('uva', 'u-va', '🍇', 'comida'),
  w('oso', 'o-so', '🐻', 'animal'),
  w('isla', 'is-la', '🏝️', 'naturaleza'),
  w('auto', 'au-to', '🚗', 'transporte'),
  w('moto', 'mo-to', '🏍️', 'transporte'),
  w('barco', 'bar-co', '⛵', 'transporte'),
  w('llave', 'lla-ve', '🔑', 'objeto'),
  // 3 sílabas
  w('pelota', 'pe-lo-ta', '⚽', 'objeto'),
  w('tomate', 'to-ma-te', '🍅', 'comida'),
  w('conejo', 'co-ne-jo', '🐰', 'animal'),
  w('camisa', 'ca-mi-sa', '👕', 'objeto'),
  w('zapato', 'za-pa-to', '👟', 'objeto'),
  w('manzana', 'man-za-na', '🍎', 'comida'),
  w('galleta', 'ga-lle-ta', '🍪', 'comida'),
  w('ballena', 'ba-lle-na', '🐋', 'animal'),
  w('tortuga', 'tor-tu-ga', '🐢', 'animal'),
  w('estrella', 'es-tre-lla', '⭐', 'naturaleza'),
  w('banana', 'ba-na-na', '🍌', 'comida'),
  w('caracol', 'ca-ra-col', '🐌', 'animal'),
  w('avión', 'a-vión', '✈️', 'transporte'),
  // 4 sílabas
  w('mariposa', 'ma-ri-po-sa', '🦋', 'animal'),
  w('elefante', 'e-le-fan-te', '🐘', 'animal'),
  w('cocodrilo', 'co-co-dri-lo', '🐊', 'animal'),
  w('bicicleta', 'bi-ci-cle-ta', '🚲', 'transporte'),
  w('pirata', 'pi-ra-ta', '🏴‍☠️', 'objeto'),
];

export const wordById = (id: string) => WORDS.find((x) => x.id === id)!;
export const wordsBySyllables = (n: number) => WORDS.filter((x) => x.syllables.length === n && !x.text.includes('ll'));

/** Letra inicial "sonora" (para ll se toma la ll como unidad). */
export const firstSound = (word: Word) => (word.text.startsWith('ll') ? 'll' : word.text[0]);

/** Pista hablada para cada letra: cómo suena y una palabra clave. */
export const LETTER_SOUNDS: Record<string, { say: string; key: string }> = {
  a: { say: 'aaa', key: 'auto' },
  e: { say: 'eee', key: 'elefante' },
  i: { say: 'iii', key: 'isla' },
  o: { say: 'ooo', key: 'oso' },
  u: { say: 'uuu', key: 'uva' },
  m: { say: 'mmm', key: 'mono' },
  s: { say: 'sss', key: 'sol' },
  l: { say: 'lll', key: 'luna' },
  p: { say: 'pa, pe, pi', key: 'pato' },
  t: { say: 'ta, te, ti', key: 'tomate' },
  n: { say: 'nnn', key: 'nube' },
  f: { say: 'fff', key: 'foca' },
  d: { say: 'da, de, di', key: 'dado' },
  g: { say: 'ga, go, gu', key: 'gato' },
  c: { say: 'ca, co, cu', key: 'casa' },
  b: { say: 'ba, be, bi', key: 'barco' },
  v: { say: 'va, ve, vi', key: 'vaca' },
  r: { say: 'rrr', key: 'mar' },
  z: { say: 'sss, como en zapato', key: 'zapato' },
};

export const LETTER_LEVELS: string[][] = [
  ['a', 'e', 'i', 'o', 'u'],
  ['m', 's', 'l', 'p', 't'],
  ['n', 'f', 'd', 'g', 'c'],
  ['b', 'd', 'p', 'v', 'z'],
];
