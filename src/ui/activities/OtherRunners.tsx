import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import type { MemoryItem, PathItem, SequenceItem } from '../../domain/items';
import { bfs, shuffle } from '../../domain/items';
import { ActivityFrame, OralRecorder, RunnerProps, strategyNotes } from './common';
import { Btn, Feedback, IconBtn, Pic, Row, Txt, useSettings, useSpeak } from '../components';
import { Tito } from '../art';
import { useStore } from '../store';
import { radius } from '../theme';

// ---------------- Secuencias ----------------
export function SequenceRunner({ item, onDone }: RunnerProps<SequenceItem>) {
  const { theme } = useStore();
  const say = useSpeak();
  const shown = useMemo(() => {
    let s = shuffle(item.cards);
    while (s.map((c) => c.id).join() === item.cards.map((c) => c.id).join()) s = shuffle(item.cards);
    return s;
  }, [item.id]);
  const [order, setOrder] = useState<string[]>([]);
  const [tries, setTries] = useState(0);
  const [hints, setHints] = useState(0);
  const [repeats, setRepeats] = useState(0);
  const [listened, setListened] = useState(false);
  const [phase, setPhase] = useState<'order' | 'wrong' | 'ok' | 'model' | 'tell' | 'anticipate' | 'anticipated'>('order');
  const [hintText, setHintText] = useState<string | null>(null);
  const [antChoice, setAntChoice] = useState<string | null>(null);
  const resolvedRef = useRef<boolean>(false);
  const antOptions = useMemo(() => (item.anticipate ? shuffle(item.anticipate.options) : []), [item.id]);

  const tap = (id: string) => {
    if (phase !== 'order' && phase !== 'wrong') return;
    setPhase('order');
    if (order.includes(id)) {
      // tocar de nuevo saca la escena y las siguientes
      setOrder(order.slice(0, order.indexOf(id)));
    } else setOrder([...order, id]);
  };
  const check = () => {
    const nt = tries + 1;
    setTries(nt);
    const ok = order.join() === item.cards.map((c) => c.id).join();
    if (ok) {
      resolvedRef.current = true;
      setPhase('ok');
      say(item.cards.map((c) => c.caption).join(' '));
    } else setPhase(nt >= 3 ? 'model' : 'wrong');
  };
  const finish = () => {
    const r = { hints, tries, repeats, listened };
    onDone({
      resolved: resolvedRef.current,
      ...r,
      response: order.join('-') + (antChoice ? ` / anticipó: ${antChoice}` : ''),
      prompt: item.title,
      inputMode: 'toque',
      strategies: strategyNotes(r),
    });
  };
  const afterTell = () => (item.anticipate ? setPhase('anticipate') : finish());

  if (phase === 'tell' || phase === 'anticipate' || phase === 'anticipated') {
    return (
      <View style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          {item.cards.map((c, i) => (
            <View key={c.id} style={{ alignItems: 'center', backgroundColor: theme.surface, borderRadius: radius.md, padding: 8, borderWidth: 2, borderColor: theme.border }}>
              <Txt size={14} weight="700">
                {i + 1}
              </Txt>
              <Pic pic={c.pic} size={40} />
            </View>
          ))}
        </View>
        {phase === 'tell' && (
          <Feedback kind="info" text="Ahora contalo vos en voz alta, con tus palabras. Podés empezar con: Primero…">
            <OralRecorder />
            <Btn label="Ya lo conté" icon="check" onPress={afterTell} />
            <Btn label="Prefiero seguir" kind="ghost" onPress={afterTell} />
          </Feedback>
        )}
        {(phase === 'anticipate' || phase === 'anticipated') && item.anticipate && (
          <View style={{ gap: 10 }}>
            <Row>
              <Txt size={20} weight="700" style={{ flex: 1 }}>
                {item.anticipate.question}
              </Txt>
              <IconBtn icon="speaker" label="Repetir" compact onPress={() => say(item.anticipate!.question)} />
            </Row>
            {antOptions.map((o) => (
              <Pressable
                key={o.id}
                accessibilityRole="button"
                accessibilityLabel={o.label}
                disabled={phase === 'anticipated'}
                onPress={() => {
                  setAntChoice(o.label ?? o.id);
                  setPhase('anticipated');
                }}
                style={{
                  minHeight: 60,
                  borderRadius: radius.md,
                  borderWidth: antChoice === o.label ? 4 : 2,
                  borderColor: antChoice === o.label ? theme.seaDeep : theme.border,
                  backgroundColor: theme.surface,
                  padding: 12,
                  justifyContent: 'center',
                }}
              >
                <Txt size={19}>{o.label}</Txt>
              </Pressable>
            ))}
            {phase === 'anticipated' && (
              <Feedback
                kind="info"
                text={
                  antChoice === item.anticipate.options[0].label
                    ? 'Eso podría pasar: tiene sentido con la historia. ¿Por qué lo pensaste? Contalo en voz alta.'
                    : 'Mmm, ¿eso podría pasar de verdad? Pensemos qué tiene sentido con la historia. Contá en voz alta tu idea.'
                }
              >
                <Btn label="Seguir" big onPress={finish} />
              </Feedback>
            )}
          </View>
        )}
      </View>
    );
  }

  return (
    <ActivityFrame
      instruction={item.instruction}
      speakText={item.speak}
      onRepeat={() => setRepeats(repeats + 1)}
      onHint={() => {
        setHints(hints + 1);
        const first = item.cards[0];
        setHintText(`Empieza con: ${first.caption}`);
        say(`Empieza con: ${first.caption}`);
        if (order[0] !== first.id) setOrder([first.id]);
      }}
      hintDisabled={hints >= 1 || phase === 'ok' || phase === 'model'}
      hintText={hintText}
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
        {shown.map((c) => {
          const pos = order.indexOf(c.id);
          return (
            <View key={c.id} style={{ width: '46%', gap: 4 }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${c.caption}${pos >= 0 ? `, elegida en el lugar ${pos + 1}` : ''}`}
                onPress={() => tap(c.id)}
                style={{
                  minHeight: 120,
                  borderRadius: radius.lg,
                  borderWidth: pos >= 0 ? 4 : 2,
                  borderColor: pos >= 0 ? theme.seaDeep : theme.border,
                  backgroundColor: theme.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 8,
                }}
              >
                <Pic pic={c.pic} size={56} />
                {pos >= 0 && (
                  <View style={{ position: 'absolute', top: 6, left: 6, width: 36, height: 36, borderRadius: 18, backgroundColor: theme.seaDeep, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#fff', fontWeight: '800', fontSize: 20 }}>{pos + 1}</Text>
                  </View>
                )}
              </Pressable>
              <Btn
                label="Escuchar"
                icon="speaker"
                kind="ghost"
                onPress={() => {
                  setListened(true);
                  say(c.caption);
                }}
              />
            </View>
          );
        })}
      </View>
      {phase === 'order' && <Btn label="¡Listo!" icon="check" big disabled={order.length !== item.cards.length} onPress={check} />}
      {phase === 'wrong' && (
        <Feedback kind="retry" text={order[0] === item.cards[0].id ? 'El comienzo está bien. Pensemos qué pasa después.' : 'Pensemos: ¿qué tiene que pasar antes que todo lo demás?'}>
          <Btn label="Cambiar el orden" onPress={() => setOrder([])} />
        </Feedback>
      )}
      {phase === 'ok' && (
        <Feedback kind="ok" text="¡Ese es el orden! Cada escena lleva a la siguiente.">
          <Btn label="Seguir" big onPress={() => setPhase('tell')} />
        </Feedback>
      )}
      {phase === 'model' && (
        <Feedback kind="info" text={`El orden es: ${item.cards.map((c) => c.caption).join(' Después, ')}`}>
          <Btn label="Seguir" big onPress={() => setPhase('tell')} />
        </Feedback>
      )}
    </ActivityFrame>
  );
}

// ---------------- Memoria ----------------
export function MemoryRunner({ item, onDone }: RunnerProps<MemoryItem>) {
  const { theme } = useStore();
  const settings = useSettings();
  const say = useSpeak();
  const [phase, setPhase] = useState<'ready' | 'watch' | 'answer' | 'ok' | 'wrong' | 'model'>('ready');
  const [lit, setLit] = useState<number>(-1);
  const [views, setViews] = useState(0);
  const [answer, setAnswer] = useState<string[]>([]);
  const [tries, setTries] = useState(0);
  const [named, setNamed] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  const play = (withNames: boolean) => {
    setViews((v) => v + 1);
    setAnswer([]);
    setPhase('watch');
    let i = 0;
    const step = () => {
      if (i >= item.sequence.length) {
        setLit(-1);
        setPhase('answer');
        return;
      }
      setLit(i);
      if (withNames) say(item.symbols.find((s) => s.id === item.sequence[i])!.name);
      if (!settings.reduceMotion) {
        scale.setValue(1.15);
        Animated.timing(scale, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      }
      i++;
      setTimeout(() => {
        setLit(-1);
        setTimeout(step, 350);
      }, 900);
    };
    setTimeout(step, 500);
  };

  const tap = (id: string) => {
    if (phase !== 'answer') return;
    const na = [...answer, id];
    setAnswer(na);
    if (na.length === item.sequence.length) {
      const nt = tries + 1;
      setTries(nt);
      if (na.join() === item.sequence.join()) setPhase('ok');
      else setPhase(nt >= 3 ? 'model' : 'wrong');
    }
  };
  const finish = (resolved: boolean) => {
    const r = { hints: Math.max(0, views - 1) + (named ? 1 : 0), tries, repeats: 0, listened: named };
    onDone({ resolved, ...r, response: answer.join('-'), prompt: `secuencia de ${item.sequence.length}`, inputMode: 'toque', strategies: strategyNotes(r) });
  };
  const litId = lit >= 0 ? item.sequence[lit] : null;
  const sym = (id: string) => item.symbols.find((s) => s.id === id)!;

  return (
    <ActivityFrame instruction={item.instruction} speakText={item.speak}>
      <Txt size={16} color={theme.inkSoft} align="center">
        {item.sequence.length} faroles. No hay apuro: respondé cuando estés listo.
      </Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
        {item.symbols.map((s) => {
          const on = litId === s.id;
          return (
            <Animated.View key={s.id} style={{ width: '30%', transform: [{ scale: on ? scale : 1 }] }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Farol ${s.name}${on ? ', encendido' : ''}`}
                disabled={phase !== 'answer'}
                onPress={() => tap(s.id)}
                style={({ pressed }) => ({
                  minHeight: 96,
                  borderRadius: radius.lg,
                  borderWidth: on ? 5 : 2,
                  borderColor: on ? theme.lightInk : theme.border,
                  backgroundColor: on ? theme.light : pressed ? theme.warnBg : theme.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                })}
              >
                <Pic pic={s.pic} size={40} />
                <Txt size={14} weight={on ? '800' : '500'}>
                  {on ? '¡Encendido!' : s.name}
                </Txt>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
      {phase === 'answer' || answer.length ? (
        <Row wrap gap={6} style={{ justifyContent: 'center' }}>
          <Txt size={16}>Tu orden:</Txt>
          {answer.map((a, i) => (
            <Txt key={i} size={16} weight="700">
              {i + 1}. {sym(a).name}
            </Txt>
          ))}
        </Row>
      ) : null}
      {phase === 'ready' && <Btn label="Encender los faroles" icon="play" big onPress={() => play(false)} />}
      {phase === 'answer' && (
        <Row wrap>
          <Btn label="Ver otra vez" icon="eye" kind="secondary" onPress={() => play(false)} style={{ flex: 1 }} />
          <Btn
            label="Ver y escuchar"
            icon="speaker"
            kind="secondary"
            onPress={() => {
              setNamed(true);
              play(true);
            }}
            style={{ flex: 1 }}
          />
          {answer.length > 0 && <Btn label="Borrar" icon="undo" kind="ghost" onPress={() => setAnswer(answer.slice(0, -1))} />}
        </Row>
      )}
      {phase === 'wrong' && (
        <Feedback kind="retry" text="Ese orden cambia en algún lugar. Una estrategia: decir en voz baja el nombre de cada farol mientras se enciende.">
          <Btn label="Mirar otra vez" onPress={() => play(false)} />
        </Feedback>
      )}
      {phase === 'ok' && (
        <Feedback kind="ok" text={`¡Recordaste los ${item.sequence.length} faroles en orden!`}>
          <Btn label="Seguir" big onPress={() => finish(true)} />
        </Feedback>
      )}
      {phase === 'model' && (
        <Feedback kind="info" text={`El orden era: ${item.sequence.map((id) => sym(id).name).join(', ')}.`}>
          <Btn label="Seguir" big onPress={() => finish(false)} />
        </Feedback>
      )}
    </ActivityFrame>
  );
}

// ---------------- Camino (planificación) ----------------
export function PathRunner({ item, onDone }: RunnerProps<PathItem>) {
  const { theme } = useStore();
  const say = useSpeak();
  const [path, setPath] = useState<[number, number][]>([item.start]);
  const [hints, setHints] = useState(0);
  const [undos, setUndos] = useState(0);
  const [resets, setResets] = useState(0);
  const [hintCell, setHintCell] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const pos = path[path.length - 1];
  const moves = path.length - 1;
  const rock = (r: number, c: number) => item.rocks.some(([a, b]) => a === r && b === c);
  const adj = (r: number, c: number) => Math.abs(r - pos[0]) + Math.abs(c - pos[1]) === 1;

  useEffect(() => {
    if (pos[0] === item.goal[0] && pos[1] === item.goal[1]) setDone(true);
  }, [pos]);

  const move = (r: number, c: number) => {
    if (done || rock(r, c) || !adj(r, c)) {
      if (rock(r, c)) say('Ahí hay una piedra.');
      else if (!done) say('Tito solo puede ir a una casilla de al lado.');
      return;
    }
    setHintCell(null);
    setPath([...path, [r, c]]);
  };
  const hint = () => {
    setHints(hints + 1);
    // próximo paso del camino más corto
    let best: string | null = null;
    let bestD = Infinity;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const r = pos[0] + dr;
      const c = pos[1] + dc;
      if (r < 0 || c < 0 || r >= item.size || c >= item.size || rock(r, c)) continue;
      const d = bfs(item.size, [r, c], item.goal, item.rocks);
      if (d >= 0 && d < bestD) {
        bestD = d;
        best = `${r},${c}`;
      }
    }
    setHintCell(best);
    say('Te marqué un buen paso.');
  };
  const finish = () => {
    const efficient = moves <= item.minMoves + 2;
    const r = { hints, tries: 1 + resets, repeats: 0, listened: false };
    onDone({
      resolved: true,
      ...r,
      outcome: hints === 0 && efficient && resets === 0 ? 'autonomo' : 'conApoyo',
      response: `${moves} pasos (mínimo ${item.minMoves}), ${undos} deshacer`,
      prompt: `tablero ${item.size}x${item.size}`,
      inputMode: 'toque',
      strategies: [...strategyNotes(r), ...(undos > 0 ? ['Volviste atrás para pensar otro camino.'] : [])],
    });
  };
  const cell = `${Math.floor(300 / item.size)}`;
  const size = Math.min(72, Number(cell));

  return (
    <ActivityFrame instruction={item.instruction} speakText={item.speak} onHint={hint} hintDisabled={done}>
      <View style={{ alignSelf: 'center', gap: 4 }} accessibilityLabel={`Tablero de ${item.size} por ${item.size}. Tito está en la fila ${pos[0] + 1}, columna ${pos[1] + 1}.`}>
        {Array.from({ length: item.size }).map((_, r) => (
          <View key={r} style={{ flexDirection: 'row', gap: 4 }}>
            {Array.from({ length: item.size }).map((__, c) => {
              const isTito = pos[0] === r && pos[1] === c;
              const isGoal = item.goal[0] === r && item.goal[1] === c;
              const visited = path.some(([a, b]) => a === r && b === c);
              const isRock = rock(r, c);
              const isHint = hintCell === `${r},${c}`;
              return (
                <Pressable
                  key={c}
                  accessibilityRole="button"
                  accessibilityLabel={`Fila ${r + 1}, columna ${c + 1}${isRock ? ', piedra' : ''}${isGoal ? ', buzón' : ''}${isTito ? ', Tito' : ''}`}
                  onPress={() => move(r, c)}
                  style={{
                    width: size,
                    height: size,
                    borderRadius: 10,
                    backgroundColor: isRock ? '#BDB6A6' : isHint ? theme.light : visited ? '#D6ECF5' : '#EAF4E4',
                    borderWidth: isHint ? 4 : adj(r, c) && !isRock && !done ? 2 : 1,
                    borderColor: isHint ? theme.lightInk : adj(r, c) && !isRock && !done ? theme.sea : theme.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isTito ? <Tito size={size * 0.85} /> : isRock ? <Pic pic="🪨" size={size * 0.45} /> : isGoal ? <Pic pic="📮" size={size * 0.5} /> : null}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
      <Txt size={16} align="center">
        Pasos: {moves}
      </Txt>
      {!done && (
        <Row wrap>
          <Btn
            label="Deshacer"
            icon="undo"
            kind="secondary"
            disabled={path.length <= 1}
            onPress={() => {
              setUndos(undos + 1);
              setPath(path.slice(0, -1));
            }}
            style={{ flex: 1 }}
          />
          <Btn
            label="Empezar de nuevo"
            kind="secondary"
            onPress={() => {
              setResets(resets + 1);
              setPath([item.start]);
            }}
            style={{ flex: 1 }}
          />
        </Row>
      )}
      {done && (
        <Feedback
          kind="ok"
          text={
            moves <= item.minMoves
              ? `¡Tito llegó al buzón en ${moves} pasos! Era el camino más corto.`
              : `¡Tito llegó en ${moves} pasos! Había un camino de ${item.minMoves}. ¿Lo buscamos la próxima?`
          }
        >
          <Btn label="Seguir" big onPress={finish} />
        </Feedback>
      )}
    </ActivityFrame>
  );
}
