// Validador de contenido: genera miles de consignas y controla que cada una
// sea pedagógica y lingüísticamente correcta. Si este test falla, hay una
// consigna que un niño podría ver con un error.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateItem, ChoiceItem, Item } from '../src/domain/items';
import { ACTIVITIES, ACTIVITY_IDS } from '../src/content/activities';
import { STORIES } from '../src/content/stories';
import { WORDS, firstLetter, initialPhoneme, soundAlikeLetters, wordById } from '../src/content/words';
import { toSpeech } from '../src/domain/speechText';
import { buildExploration } from '../src/domain/exploration';

const RUNS = 120;
const byPic = new Map(WORDS.map((w) => [w.pic, w]));
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zñ0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const lastSyl = (id: string) => norm(wordById(id).syllables.at(-1)!);

/** Errores de concordancia: "una tomate", "el foca", "a el"… */
function grammarErrors(text: string): string[] {
  const errs: string[] = [];
  if (/\ba el\b/i.test(text)) errs.push('"a el" debería ser "al"');
  if (/\bde el\b/i.test(text)) errs.push('"de el" debería ser "del"');
  for (const w of WORDS) {
    const t = w.text;
    const masc = w.gender === 'm';
    const wrong = masc ? [`una ${t}`, `la ${t}`] : [`un ${t}`, `el ${t}`];
    for (const bad of wrong) if (new RegExp(`(^|[^a-záéíóúñ])${bad}($|[^a-záéíóúñ])`, 'i').test(text)) errs.push(`concordancia: "${bad}"`);
  }
  if (/undefined|null|NaN|\[object/.test(text)) errs.push('texto con valor vacío');
  if (/ {2,}/.test(text)) errs.push('doble espacio');
  return errs;
}

function allTexts(it: Item): string[] {
  const out: string[] = [];
  if (it.kind === 'choice') {
    out.push(it.instruction, it.speak, it.explainCorrect, ...it.hints.map((h) => h.text), ...it.hints.map((h) => h.speak ?? ''));
    for (const o of it.options) {
      out.push(o.label ?? '', o.speak ?? '');
      if (o.id !== it.correctId) out.push(it.explainWrong(o));
    }
    if (it.stimulus.text) out.push(it.stimulus.text);
    if (it.stimulus.template) out.push(it.stimulus.template);
  } else if ('instruction' in it) out.push(it.instruction, it.speak);
  else if (it.kind === 'write') out.push(it.prompt, it.speak, it.template ?? '');
  return out.filter(Boolean);
}

function checkChoice(id: string, it: ChoiceItem, ctx: string) {
  const ids = it.options.map((o) => o.id);
  assert.ok(ids.includes(it.correctId), `${ctx}: falta la opción correcta`);
  assert.equal(new Set(ids).size, ids.length, `${ctx}: opciones repetidas`);
  assert.ok(it.options.length >= 2, `${ctx}: menos de 2 opciones`);
  const pics = it.options.map((o) => o.pic).filter(Boolean);
  assert.equal(new Set(pics).size, pics.length, `${ctx}: dibujos repetidos entre opciones`);
  const others = it.options.filter((o) => o.id !== it.correctId);

  // La voz debe decir lo mismo que está escrito.
  if (id !== 'categorias' || !it.speak.startsWith('Mirá')) {
    assert.ok(norm(toSpeech(it.speak)).includes(norm(toSpeech(it.instruction))), `${ctx}: la voz no coincide con el texto.\n  texto: ${it.instruction}\n  voz: ${it.speak}`);
  } else assert.ok(norm(it.speak).includes(norm(it.instruction)), `${ctx}: voz y texto difieren`);
  // La voz no recibe palabras en mayúsculas (algunas voces las deletrean).
  for (const t of [it.speak, it.explainCorrect, ...others.map((o) => it.explainWrong(o))])
    assert.ok(!/[A-ZÁÉÍÓÚÑ]{2,}/.test(toSpeech(t)), `${ctx}: mayúsculas en voz: ${t}`);

  const stimWord = it.stimulus.sayWord ? wordById(it.stimulus.sayWord) : undefined;
  if (stimWord) assert.ok(!it.options.some((o) => o.id === stimWord.id || o.pic === stimWord.pic), `${ctx}: el dibujo de la pregunta (${stimWord.text}) aparece como opción`);

  if (id === 'letraSonido') {
    if (it.stimulus.bigLetter) {
      const L = it.stimulus.bigLetter;
      const correct = wordById(it.correctId);
      assert.equal(firstLetter(correct), L, `${ctx}: ${correct.text} no empieza con ${L}`);
      for (const o of others) {
        const ow = wordById(o.id);
        assert.ok(!soundAlikeLetters(firstLetter(ow), L), `${ctx}: ${ow.text} también podría empezar con ${L}`);
        assert.notEqual(initialPhoneme(ow), initialPhoneme(correct), `${ctx}: ${ow.text} empieza con el mismo sonido que ${correct.text}`);
      }
    } else {
      assert.ok(stimWord, `${ctx}: falta la palabra`);
      assert.equal(firstLetter(stimWord!), it.correctId, `${ctx}: ${stimWord!.text} no empieza con ${it.correctId}`);
      for (const o of others) assert.ok(!soundAlikeLetters(o.id, it.correctId), `${ctx}: ${o.id} y ${it.correctId} suenan igual al comienzo de ${stimWord!.text}`);
    }
  }
  if (id === 'sonidoInicial' && stimWord) {
    if (/empieza/.test(it.instruction)) {
      assert.equal(initialPhoneme(wordById(it.correctId)), initialPhoneme(stimWord), `${ctx}: la correcta no empieza igual`);
      for (const o of others) assert.notEqual(initialPhoneme(wordById(o.id)), initialPhoneme(stimWord), `${ctx}: ${o.id} también empieza igual que ${stimWord.text}`);
    } else if (/termina/.test(it.instruction)) {
      assert.equal(lastSyl(it.correctId), lastSyl(stimWord.id), `${ctx}: no rima`);
      for (const o of others) assert.notEqual(lastSyl(o.id), lastSyl(stimWord.id), `${ctx}: ${o.id} también rima`);
    } else if (/partes/.test(it.instruction)) {
      assert.equal(it.correctId, String(stimWord.syllables.length), `${ctx}: conteo de sílabas`);
    }
    for (const o of it.options) if (o.pic) assert.ok(byPic.get(o.pic)?.pictureOk, `${ctx}: dibujo ambiguo ${o.pic}`);
  }
  if (id === 'lecturaPalabras' && it.stimulus.text && !it.stimulus.text.includes(' ')) {
    assert.equal(it.correctId, it.stimulus.text, `${ctx}: el dibujo correcto no es la palabra escrita`);
  }
  if (id === 'categorias' && /no va/.test(it.instruction)) {
    const cats = it.options.map((o) => wordById(o.id).category);
    const oddCat = wordById(it.correctId).category;
    const rest = others.map((o) => wordById(o.id).category);
    assert.equal(new Set(rest).size, 1, `${ctx}: el grupo no es homogéneo (${cats})`);
    assert.notEqual(rest[0], oddCat, `${ctx}: el distinto es de la misma categoría`);
  }
  if (id === 'categorias' && /va con este grupo/.test(it.instruction)) {
    const groupCats = it.stimulus.pic!.split('+').map((p) => byPic.get(p)!.category);
    assert.equal(new Set(groupCats).size, 1, `${ctx}: grupo mezclado`);
    assert.equal(wordById(it.correctId).category, groupCats[0], `${ctx}: la correcta no es del grupo`);
    for (const o of others) assert.notEqual(wordById(o.id).category, groupCats[0], `${ctx}: ${o.id} también es del grupo`);
  }
  if (id === 'mensajes' && it.stimulus.template) {
    const g = wordById(it.correctId).gender;
    for (const o of others) assert.equal(wordById(o.id).gender, g, `${ctx}: el género de "${o.id}" delata la respuesta`);
  }
}

for (const id of ACTIVITY_IDS) {
  test(`contenido válido: ${ACTIVITIES[id].title}`, () => {
    for (let lvl = 1; lvl <= ACTIVITIES[id].maxLevel; lvl++)
      for (let sup = 0; sup <= 2; sup++)
        for (let k = 0; k < RUNS; k++) {
          const it = generateItem(id, lvl, sup, { index: k, reviewWords: k % 3 === 0 ? ['gato', 'pera', 'ojo-viejo'] : [] });
          const ctx = `${id} nivel ${lvl} apoyo ${sup}`;
          for (const t of allTexts(it)) assert.deepEqual(grammarErrors(t), [], `${ctx}: «${t}»`);
          if (it.kind === 'choice') checkChoice(id, it, ctx);
          if (it.kind === 'write' && it.word) assert.ok(it.word.pictureOk || !it.showPic, `${ctx}: dibujo ambiguo para escribir (${it.word.text})`);
        }
  });
}

test('relatos: cada pregunta tiene su respuesta entre las opciones y sin errores', () => {
  for (const s of STORIES) {
    for (const t of [s.title, ...s.sentences]) assert.deepEqual(grammarErrors(t), [], t);
    for (const q of s.questions) {
      assert.ok(q.options.some((o) => o.id === q.correct), `${s.id}: ${q.q}`);
      assert.equal(new Set(q.options.map((o) => o.id)).size, q.options.length);
    }
  }
});

test('exploración inicial: tareas válidas', () => {
  for (let k = 0; k < 50; k++)
    for (const t of buildExploration()) {
      for (const x of allTexts(t.item)) assert.deepEqual(grammarErrors(x), [], x);
      if (t.item.kind === 'choice') checkChoice(t.activityId, t.item, `exploración ${t.key}`);
    }
});

test('léxico: dibujos únicos y palabras bien formadas', () => {
  const pics = WORDS.map((w) => w.pic);
  assert.equal(new Set(pics).size, pics.length, 'dos palabras con el mismo dibujo');
  for (const w of WORDS) assert.equal(norm(w.syllables.join('')), norm(w.text), `sílabas de ${w.text}`);
});

// ---------- Ilustraciones: todo dibujo referido existe y no quedan emojis ----------
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { ACTIVITIES as ACTS } from '../src/content/activities';

const ILLU_SRC = readFileSync(join(__dirname, '../src/ui/illustrations.tsx'), 'utf8');
const ILLU_KEYS = new Set([...ILLU_SRC.matchAll(/^ {2}'?([\wáéíóúñ]+)'?: \(\) =>/gm)].map((m) => m[1]));

test('cada dibujo usado en el contenido existe en la biblioteca de ilustraciones', () => {
  const used = new Set<string>();
  const add = (pic?: string) => pic && pic.split('+').forEach((k) => used.add(k));
  WORDS.forEach((w) => add(w.pic));
  Object.values(ACTS).forEach((a) => add(a.icon));
  STORIES.forEach((s) => {
    s.art.forEach(add);
    s.questions.forEach((q) => q.options.forEach((o) => add(o.pic)));
  });
  for (const id of ACTIVITY_IDS)
    for (let lvl = 1; lvl <= ACTIVITIES[id].maxLevel; lvl++)
      for (let k = 0; k < 40; k++) {
        const it = generateItem(id, lvl, 0, { index: k });
        if (it.kind === 'choice') {
          add(it.stimulus.pic);
          it.options.forEach((o) => add(o.pic));
        }
        if (it.kind === 'sequence') it.cards.forEach((c) => add(c.pic));
        if (it.kind === 'memory') it.symbols.forEach((s) => add(s.pic));
        if (it.kind === 'build' || it.kind === 'write') add(it.word?.pic);
      }
  const missing = [...used].filter((k) => !ILLU_KEYS.has(k));
  assert.deepEqual(missing, [], `Faltan ilustraciones: ${missing.join(', ')}`);
});

test('no quedan emojis usados como ilustración en el código de la app', () => {
  const files: string[] = [];
  const walk = (d: string) => readdirSync(d).forEach((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : files.push(join(d, f))));
  walk(join(__dirname, '../src'));
  const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
  const offenders = files.filter((f) => /\.tsx?$/.test(f) && readFileSync(f, 'utf8').split('\n').some((line) => emoji.test(line) && !line.trim().startsWith('/') && !line.trim().startsWith('*')));
  assert.deepEqual(offenders, []);
});
