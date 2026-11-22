import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyOutcome, classify } from '../src/domain/adaptation';
import { analyzeWord, aggregateHypothesis } from '../src/domain/writingAnalysis';
import { buildMission, generateItem, bfs } from '../src/domain/items';
import { ACTIVITY_IDS, ACTIVITIES } from '../src/content/activities';
import { completeMission, createProfile } from '../src/domain/profile';
import { activityEvidence } from '../src/domain/report';
import { buildExploration, summarizeExploration } from '../src/domain/exploration';
import type { SkillState, WritingSample } from '../src/domain/types';

const base: SkillState = { level: 2, support: 0, enabled: true, lockedByAdult: false, recent: [] };

test('clasificación de intentos', () => {
  assert.equal(classify(true, 1, 0), 'autonomo');
  assert.equal(classify(true, 2, 0), 'conApoyo');
  assert.equal(classify(true, 1, 1), 'conApoyo');
  assert.equal(classify(true, 1, 0, true), 'conApoyo');
  assert.equal(classify(false, 3, 2), 'noResuelto');
});

test('regla de más apoyo ante dos sin resolver', () => {
  let s = applyOutcome('letraSonido', base, 'noResuelto', 4).state;
  const r = applyOutcome('letraSonido', s, 'noResuelto', 4);
  assert.equal(r.state.support, 1);
  assert.equal(r.log?.rule, 'masApoyo');
});

test('con apoyo máximo baja de nivel', () => {
  const r = applyOutcome('letraSonido', { ...base, support: 2, recent: ['noResuelto'] }, 'noResuelto', 4);
  assert.equal(r.state.level, 1);
  assert.equal(r.log?.rule, 'bajarNivel');
});

test('sube gradualmente: primero retira apoyo, luego nivel', () => {
  let s: SkillState = { ...base, support: 1 };
  for (let i = 0; i < 4; i++) s = applyOutcome('letraSonido', s, 'autonomo', 4).state;
  assert.equal(s.support, 0);
  assert.equal(s.level, 2);
  for (let i = 0; i < 4; i++) s = applyOutcome('letraSonido', s, 'autonomo', 4).state;
  assert.equal(s.level, 3);
});

test('bloqueo del adulto impide cambios automáticos', () => {
  let s: SkillState = { ...base, lockedByAdult: true };
  for (let i = 0; i < 6; i++) s = applyOutcome('letraSonido', s, 'noResuelto', 4).state;
  assert.equal(s.support, 0);
  assert.equal(s.level, 2);
});

test('producciones abiertas no modifican nivel', () => {
  const r = applyOutcome('escrituraLibre', base, 'abierta', 3);
  assert.deepEqual(r.state, base);
});

test('análisis de escritura: hipótesis descriptivas', () => {
  assert.equal(analyzeWord('mariposa', ['ma', 'ri', 'po', 'sa'], 'mariposa').hypothesis, 'alfabetica');
  assert.equal(analyzeWord('mariposa', ['ma', 'ri', 'po', 'sa'], 'maripoza').hypothesis, 'alfabetica');
  assert.equal(analyzeWord('mariposa', ['ma', 'ri', 'po', 'sa'], 'aioa').hypothesis, 'silabica');
  assert.equal(analyzeWord('mariposa', ['ma', 'ri', 'po', 'sa'], 'mripsa').hypothesis, 'silabicoAlfabetica');
  assert.equal(analyzeWord('mariposa', ['ma', 'ri', 'po', 'sa'], 'xkwt').hypothesis, 'presilabica');
  assert.equal(analyzeWord('sol', ['sol'], '').hypothesis, 'sinDatos');
});

test('hipótesis agregada requiere al menos 3 muestras', () => {
  const mk = (t: string, syl: string[], w: string): WritingSample => ({
    id: t,
    sessionId: 's',
    at: '',
    kind: 'palabra',
    activityId: 'escrituraPalabras',
    prompt: '',
    target: t,
    text: w,
    context: 'mision',
    analysis: analyzeWord(t, syl, w),
    supportsUsed: [],
  });
  assert.equal(aggregateHypothesis([mk('gato', ['ga', 'to'], 'ao')]).hypothesis, 'sinDatos');
  const agg = aggregateHypothesis([mk('gato', ['ga', 'to'], 'ao'), mk('luna', ['lu', 'na'], 'ua'), mk('tomate', ['to', 'ma', 'te'], 'oae')]);
  assert.equal(agg.hypothesis, 'silabica');
  assert.equal(agg.confidence, 'baja');
});

test('todas las actividades generan consignas válidas en todos los niveles y apoyos', () => {
  for (const id of ACTIVITY_IDS) {
    for (let lvl = 1; lvl <= ACTIVITIES[id].maxLevel; lvl++) {
      for (let sup = 0; sup <= 2; sup++) {
        for (let k = 0; k < 15; k++) {
          const it = generateItem(id, lvl, sup, { index: k });
          if (it.kind === 'choice') {
            assert.ok(it.options.some((o) => o.id === it.correctId), `${id} L${lvl} S${sup}: falta la opción correcta`);
            assert.equal(new Set(it.options.map((o) => o.id)).size, it.options.length, `${id} L${lvl}: opciones repetidas`);
            assert.ok(it.options.length >= 2, `${id} L${lvl} S${sup}: menos de 2 opciones`);
          }
          if (it.kind === 'build') assert.ok(it.word.text.split('').every((ch) => it.tiles.includes(ch)));
          if (it.kind === 'path') assert.equal(bfs(it.size, it.start, it.goal, it.rocks), it.minMoves);
          if (it.kind === 'memory') assert.ok(it.sequence.length >= 2);
        }
      }
    }
  }
});

test('misiones incluyen consigna de repaso', () => {
  const m = buildMission('lecturaPalabras', 2, 0, ['gato']);
  assert.ok(m.some((i) => i.context === 'repaso'));
});

test('recompensas por participar y sin pérdida', () => {
  let p = createProfile('Exploradora', { base: 0, color: 0, accessory: null });
  const r1 = completeMission(p);
  assert.equal(r1.profile.rewards.shells, 1);
  assert.ok(r1.newPage);
  p = r1.profile;
  const r2 = completeMission(p);
  assert.ok(r2.profile.rewards.unlocked.length >= p.rewards.unlocked.length);
});

test('el informe no concluye con pocos datos', () => {
  const p = createProfile('A', { base: 0, color: 0, accessory: null });
  assert.equal(activityEvidence(p, 'letraSonido').kind, 'pocosDatos');
});

test('exploración genera tareas y resume niveles', () => {
  const tasks = buildExploration();
  assert.ok(tasks.length >= 10);
  const r = summarizeExploration({ letras1: 'autonomo', letras2: 'autonomo', palabra1: 'autonomo', palabra2: 'conApoyo' }, [], 0);
  assert.equal(r.startLevels.letraSonido, 3);
  assert.equal(r.startLevels.lecturaPalabras, 2);
  assert.equal(r.writing.hypothesis, 'sinDatos');
});
