import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { ACTIVITIES } from '../../content/activities';
import { ZONES } from '../../content/world';
import { buildExploration, summarizeExploration } from '../../domain/exploration';
import { buildMission, Item } from '../../domain/items';
import { completeMission, masteredWords, newId, recordAttempt, recordSample } from '../../domain/profile';
import { classify } from '../../domain/adaptation';
import type { ActivityId, Attempt, Outcome, Profile, WritingSample } from '../../domain/types';
import { ChoiceRunner } from '../activities/ChoiceRunner';
import { BuildRunner } from '../activities/BuildRunner';
import { WriteRunner } from '../activities/WriteRunner';
import { MemoryRunner, PathRunner, SequenceRunner } from '../activities/OtherRunners';
import type { RunResult } from '../activities/common';
import { Btn, GuideBubble, IconBtn, Screen, Txt } from '../components';
import { Demo, demoKindFor } from '../activities/game';
import { PlaceArt } from './WorldMap';
import { useStore, MissionSummary } from '../store';
import { radius } from '../theme';

function Runner({ item, onDone, exploration }: { item: Item; onDone: (r: RunResult) => void; exploration?: boolean }) {
  switch (item.kind) {
    case 'choice':
      return <ChoiceRunner key={item.id} item={item} onDone={onDone} exploration={exploration} />;
    case 'build':
      return <BuildRunner key={item.id} item={item} onDone={onDone} exploration={exploration} />;
    case 'write':
      return <WriteRunner key={item.id} item={item} onDone={onDone} exploration={exploration} />;
    case 'sequence':
      return <SequenceRunner key={item.id} item={item} onDone={onDone} />;
    case 'memory':
      return <MemoryRunner key={item.id} item={item} onDone={onDone} />;
    case 'path':
      return <PathRunner key={item.id} item={item} onDone={onDone} />;
  }
}

function makeAttempt(p: Profile, sessionId: string, activityId: ActivityId, item: Item, r: RunResult, started: number): Attempt {
  const s = p.skills[activityId];
  const outcome: Outcome = r.outcome ?? (r.resolved === null ? 'abierta' : classify(!!r.resolved, r.tries, r.hints, r.listened));
  return {
    id: newId(),
    sessionId,
    activityId,
    area: ACTIVITIES[activityId].area,
    level: s.level,
    support: s.support,
    itemId: item.id,
    prompt: r.prompt,
    response: r.response,
    correct: r.resolved,
    tries: r.tries,
    hintsUsed: r.hints,
    instructionRepeats: r.repeats,
    listenedToText: r.listened,
    outcome,
    context: item.context ?? 'mision',
    inputMode: r.inputMode,
    durationMs: Date.now() - started,
    at: new Date().toISOString(),
  };
}

function makeSample(sessionId: string, activityId: ActivityId, item: Item, r: RunResult): WritingSample | null {
  if (!r.sample || !r.sample.text.trim()) return null;
  return { ...r.sample, id: newId(), sessionId, at: new Date().toISOString(), context: item.context ?? 'mision', activityId };
}

/** Avance dentro de la misión: piedras del camino (hechas, actual, por venir). */
function Progress({ i, n, color }: { i: number; n: number; color?: string }) {
  const { theme } = useStore();
  return (
    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }} accessibilityLabel={`Consigna ${i + 1} de ${n}`}>
      {Array.from({ length: n }).map((_, k) => (
        <View
          key={k}
          style={{
            flex: 1,
            maxWidth: 44,
            height: 12,
            borderRadius: 6,
            backgroundColor: k < i ? color ?? theme.sea : k === i ? theme.light : theme.surface,
            borderWidth: 2,
            borderColor: k === i ? theme.lightInk : theme.border,
          }}
        />
      ))}
    </View>
  );
}

export function MissionScreen({ activityId }: { activityId: ActivityId }) {
  const { current, sessionId, updateCurrent, back, replace, theme } = useStore();
  const p = current!;
  const def = ACTIVITIES[activityId];
  const items = useMemo(() => {
    const s = p.skills[activityId];
    return buildMission(activityId, s.level, s.support, masteredWords(p));
    // se genera una vez por misión
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId]);
  const [i, setI] = useState(0);
  const [started, setStarted] = useState(Date.now());
  const [tally, setTally] = useState<MissionSummary>({ items: 0, autonomo: 0, conApoyo: 0, noResuelto: 0, abierta: 0, hints: 0, strategies: [] });

  const onDone = (r: RunResult) => {
    const item = items[i];
    let att: Attempt | null = null;
    updateCurrent((prof) => {
      att = makeAttempt(prof, sessionId ?? 'sin-sesion', activityId, item, r, started);
      let np = recordAttempt(prof, att);
      const sample = makeSample(sessionId ?? 'sin-sesion', activityId, item, r);
      if (sample) np = recordSample(np, sample);
      return np;
    });
    const outcome: Outcome = r.outcome ?? (r.resolved === null ? 'abierta' : classify(!!r.resolved, r.tries, r.hints, r.listened));
    const t: MissionSummary = {
      ...tally,
      items: tally.items + 1,
      [outcome]: tally[outcome] + 1,
      hints: tally.hints + r.hints,
      strategies: [...new Set([...tally.strategies, ...r.strategies.filter((x) => !x.startsWith('Usaste'))])],
    };
    setTally(t);
    if (i + 1 < items.length) {
      setI(i + 1);
      setStarted(Date.now());
    } else {
      // Las recompensas no dependen de los intentos: se calculan con el perfil actual.
      if (t.hints > 0) t.strategies = [`Usaste ${t.hints === 1 ? 'una pista' : `${t.hints} pistas`} en total.`, ...t.strategies];
      const preview = completeMission(p);
      const reward = { newReward: preview.newReward, newPage: preview.newPage };
      updateCurrent((prof) => {
        const res = completeMission(prof);
        return {
          ...res.profile,
          sessions: res.profile.sessions.map((s) => (s.id === sessionId ? { ...s, missions: s.missions + 1 } : s)),
        };
      });
      setTimeout(() => replace({ name: 'missionEnd', activityId, summary: { ...t, ...reward } }), 0);
    }
  };

  const zone = zoneOf(activityId);
  const demoKind = demoKindFor(def.runner, activityId);
  const firstTime = !(p.demosSeen ?? []).includes(activityId);
  const [showDemo, setShowDemo] = useState(firstTime);
  const closeDemo = () => {
    setShowDemo(false);
    if (firstTime) updateCurrent((x) => ({ ...x, demosSeen: [...(x.demosSeen ?? []), activityId] }));
  };

  return (
    <Screen title={def.kidTitle} onBack={back} right={<IconBtn icon="hint" label="¿Cómo se juega?" compact onPress={() => setShowDemo(true)} />}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: zone.color + '1F', borderRadius: radius.lg, paddingHorizontal: 10, paddingVertical: 4 }}>
        <PlaceArt zoneId={zone.id} width={56} />
        <View style={{ flex: 1, gap: 4 }}>
          <Txt size={13} weight="700" color={theme.inkSoft}>
            {zone.name}
          </Txt>
          <Progress i={i} n={items.length} color={zone.color} />
        </View>
      </View>
      {showDemo ? (
        <Demo kind={demoKind} onClose={closeDemo} />
      ) : (
        <>
          {items[i].context === 'repaso' && (
            <Txt size={15} align="center" weight="600">
              Repaso: algo que ya conocés, en un lugar nuevo.
            </Txt>
          )}
          <Runner item={items[i]} onDone={onDone} />
        </>
      )}
    </Screen>
  );
}

export function ExplorationScreen() {
  const { current, sessionId, updateCurrent, reset, theme } = useStore();
  const tasks = useMemo(() => buildExploration(), []);
  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const [byTask, setByTask] = useState<Record<string, Outcome>>({});
  const [skipped, setSkipped] = useState(0);
  const [finished, setFinished] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const p = current!;

  const nextIndex = (from: number, done: Record<string, Outcome>) => {
    let k = from;
    while (k < tasks.length) {
      const t = tasks[k];
      if (!t.requires || t.requires.some((key) => done[key] === 'autonomo' || done[key] === 'conApoyo')) return k;
      k++;
    }
    return k;
  };

  const onDone = (r: RunResult) => {
    const task = tasks[i];
    const outcome: Outcome = r.outcome ?? (r.resolved === null ? 'abierta' : classify(!!r.resolved, r.tries, r.hints, r.listened));
    const nb = { ...byTask, [task.key]: outcome };
    setByTask(nb);
    if (r.response === '(saltó)' || (task.area === 'escritura' && !r.response.trim())) setSkipped((s) => s + 1);
    updateCurrent((prof) => {
      let np = recordAttempt(prof, makeAttempt(prof, sessionId ?? 'sin-sesion', task.activityId, task.item, r, startTime));
      const sample = makeSample(sessionId ?? 'sin-sesion', task.activityId, task.item, r);
      if (sample) np = recordSample(np, sample);
      return np;
    });
    const ni = nextIndex(i + 1, nb);
    if (ni >= tasks.length) {
      updateCurrent((prof) => {
        const result = summarizeExploration(nb, prof.samples.filter((s) => s.context === 'exploracion'), skipped);
        const skills = { ...prof.skills };
        const logs = [...prof.ruleLog];
        for (const [id, lvl] of Object.entries(result.startLevels) as [ActivityId, number][]) {
          logs.push({
            at: result.at,
            activityId: id,
            rule: 'exploracion',
            from: { level: skills[id].level, support: skills[id].support },
            to: { level: lvl, support: 0 },
            reason: 'Punto de partida provisorio según la exploración inicial.',
          });
          skills[id] = { ...skills[id], level: lvl, support: 0, recent: [] };
        }
        return { ...prof, exploration: result, skills, ruleLog: logs };
      });
      setFinished(true);
    } else {
      setI(ni);
      setStartTime(Date.now());
    }
  };

  if (!started) {
    return (
      <Screen title="Conocernos">
        <GuideBubble text="Antes de salir de viaje, quiero conocerte. Vamos a jugar con letras, palabras y dibujos. Si algo no lo sabés, tocá Saltar. ¡No pasa nada!" />
        <View style={{ backgroundColor: theme.surface, borderRadius: radius.lg, padding: 14, borderWidth: 2, borderColor: theme.border }}>
          <Txt size={15} color={theme.inkSoft}>
            Para adultos: son unas 10 a 13 tareas breves, sin tiempo límite. Las respuestas solo sirven para elegir un punto de partida provisorio, que se puede cambiar en el espacio para adultos. No es una evaluación.
          </Txt>
        </View>
        <Btn label="¡Empecemos!" icon="play" big onPress={() => setStarted(true)} />
        <Btn
          label="Hacerlo otro día"
          kind="ghost"
          onPress={() => {
            updateCurrent((prof) => ({ ...prof, welcomed: true }));
            reset({ name: 'map' });
          }}
        />
      </Screen>
    );
  }
  if (finished) {
    return (
      <Screen title="¡Listo!">
        <GuideBubble mood="celebra" text={`¡Gracias por jugar conmigo, ${p.alias}! Ya armé tu mapa de viaje. Vamos a recuperar las palabras del faro.`} />
        <Btn label="Ver el mapa" icon="play" big onPress={() => reset({ name: 'map' })} />
      </Screen>
    );
  }
  const count = tasks.filter((t, k) => k <= i).length;
  return (
    <Screen title="Conocernos">
      <Txt size={15} align="center" color={theme.inkSoft}>
        Juego {count}
      </Txt>
      <Runner item={tasks[i].item} onDone={onDone} exploration />
    </Screen>
  );
}

export function zoneOf(activityId: ActivityId) {
  return ZONES.find((z) => z.activities.includes(activityId))!;
}
