import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, View, useWindowDimensions } from 'react-native';
import { Text } from '../text';
import type { MemoryItem, PathItem, SequenceItem } from '../../domain/items';
import { bfs, shuffle } from '../../domain/items';
import { ActivityFrame, OralRecorder, RunnerProps, strategyNotes } from './common';
import { Btn, Feedback, IconBtn, Pic, Row, Txt, useReduceMotion, useSettings, useSfx, useSpeak } from '../components';
import { DragArea, Draggable, DropZone, GameTile } from './game';
import { Tito } from '../art';
import { useStore } from '../store';
import { radius } from '../theme';

// ---------------- Secuencias: tira de viñetas ----------------
export function SequenceRunner({ item, onDone }: RunnerProps<SequenceItem>) {
  const { theme } = useStore();
  const say = useSpeak();
  const sfx = useSfx();
  const { width } = useWindowDimensions();
  const shown = useMemo(() => {
    let s = shuffle(item.cards);
    while (s.map((c) => c.id).join() === item.cards.map((c) => c.id).join()) s = shuffle(item.cards);
    return s;
  }, [item.id]);
  const n = item.cards.length;
  const [frames, setFrames] = useState<(string | null)[]>(() => Array(n).fill(null));
  const [tries, setTries] = useState(0);
  const [hints, setHints] = useState(0);
  const [repeats, setRepeats] = useState(0);
  const [listened, setListened] = useState(false);
  const [phase, setPhase] = useState<'order' | 'wrong' | 'ok' | 'model' | 'tell' | 'anticipate' | 'anticipated'>('order');
  const [hintText, setHintText] = useState<string | null>(null);
  const [antChoice, setAntChoice] = useState<string | null>(null);
  const resolvedRef = useRef<boolean>(false);
  const antOptions = useMemo(() => (item.anticipate ? shuffle(item.anticipate.options) : []), [item.id]);
  const card = (id: string) => item.cards.find((c) => c.id === id)!;
  const frameW = Math.min(110, Math.floor((Math.min(width, 560) - 32 - (n - 1) * 8) / n));

  const putIn = (cardId: string, frameIdx?: number): boolean => {
    if (phase !== 'order' && phase !== 'wrong') return false;
    setPhase('order');
    const target = frameIdx ?? frames.findIndex((f) => f === null);
    if (target < 0) return false;
    const nf = frames.map((f) => (f === cardId ? null : f)); // si ya estaba en otro cuadro, se mueve
    nf[target] = cardId;
    setFrames(nf);
    sfx('encaje');
    say(card(cardId).caption);
    return true;
  };
  const takeOut = (i: number) => {
    if (phase !== 'order' && phase !== 'wrong') return;
    const nf = [...frames];
    nf[i] = null;
    setFrames(nf);
    setPhase('order');
  };
  const full = frames.every((f) => f !== null);
  const check = () => {
    const nt = tries + 1;
    setTries(nt);
    if (frames.join() === item.cards.map((c) => c.id).join()) {
      resolvedRef.current = true;
      setPhase('ok');
    } else setPhase(nt >= 3 ? 'model' : 'wrong');
  };
  const finish = () => {
    const r = { hints, tries, repeats, listened };
    onDone({
      resolved: resolvedRef.current,
      ...r,
      response: frames.join('-') + (antChoice ? ` / anticipó: ${antChoice}` : ''),
      prompt: item.title,
      inputMode: 'toque',
      strategies: strategyNotes(r),
    });
  };
  const afterTell = () => (item.anticipate ? setPhase('anticipate') : finish());
  const showOrdered = phase === 'ok' || phase === 'model' || phase === 'tell' || phase === 'anticipate' || phase === 'anticipated';
  const displayFrames = showOrdered ? item.cards.map((c) => c.id) : frames;

  const strip = (
    <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }} accessibilityLabel="Tira de viñetas">
      {displayFrames.map((id, i) => (
        <DropZone key={i} id={`frame-${i}`}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={id ? `Cuadro ${i + 1}: ${card(id).caption}. Tocá para sacar.` : `Cuadro ${i + 1} vacío`}
            onPress={() => !showOrdered && takeOut(i)}
            style={{
              width: frameW,
              height: frameW * 1.15,
              borderRadius: radius.md,
              borderWidth: 3,
              borderStyle: id ? 'solid' : 'dashed',
              borderColor: showOrdered && phase !== 'model' ? theme.ok : phase === 'wrong' && id && item.cards[i].id !== id ? theme.coral : theme.ink,
              backgroundColor: id ? theme.surface : theme.surfaceAlt,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {id && <Pic pic={card(id).pic} size={frameW * 0.8} />}
            <View style={{ position: 'absolute', top: 4, left: 4, width: 26, height: 26, borderRadius: 13, backgroundColor: theme.seaDeep, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>{i + 1}</Text>
            </View>
          </Pressable>
        </DropZone>
      ))}
    </View>
  );

  if (phase === 'tell' || phase === 'anticipate' || phase === 'anticipated') {
    return (
      <View style={{ gap: 14 }}>
        {strip}
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
              <GameTile
                key={o.id}
                label={o.label ?? o.id}
                state={antChoice === o.label ? 'selected' : 'idle'}
                disabled={phase === 'anticipated'}
                onPress={() => {
                  setAntChoice(o.label ?? o.id);
                  setPhase('anticipated');
                }}
                style={{ minHeight: 60 }}
              >
                <Txt size={19}>{o.label}</Txt>
              </GameTile>
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
    <DragArea>
      <ActivityFrame
        instruction={item.instruction}
        speakText={item.speak}
        onRepeat={() => setRepeats(repeats + 1)}
        onHint={() => {
          setHints(hints + 1);
          const first = item.cards[0];
          setHintText(`Empieza con: ${first.caption}`);
          say(`Empieza con: ${first.caption}`);
          putIn(first.id, 0);
        }}
        hintDisabled={hints >= 1 || phase === 'ok' || phase === 'model'}
        hintText={hintText}
      >
        {strip}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', backgroundColor: theme.surfaceAlt, borderRadius: radius.lg, padding: 12 }}>
          {shown.map((c) => {
            const placed = frames.includes(c.id);
            return (
              <View key={c.id} style={{ width: '45%', alignItems: 'center', gap: 2 }}>
                <Draggable label={`${c.caption}${placed ? ', ya ubicada' : ''}`} disabled={placed || showOrdered} onTap={() => putIn(c.id)} onDrop={(z) => putIn(c.id, Number(z.replace('frame-', '')))}>
                  <View style={{ width: 120, height: 110, borderRadius: radius.lg, backgroundColor: theme.surface, borderWidth: 2, borderBottomWidth: placed ? 2 : 6, borderColor: theme.border, alignItems: 'center', justifyContent: 'center', opacity: placed ? 0.35 : 1 }}>
                    <Pic pic={c.pic} size={86} />
                  </View>
                </Draggable>
                <IconBtn
                  icon="speaker"
                  label={`Escuchar: ${c.caption}`}
                  compact
                  onPress={() => {
                    setListened(true);
                    say(c.caption);
                  }}
                />
              </View>
            );
          })}
        </View>
        {phase === 'order' && <Btn label="¡Listo!" icon="check" big disabled={!full} onPress={check} />}
        {phase === 'wrong' && (
          <Feedback kind="retry" text={frames[0] === item.cards[0].id ? 'El comienzo está bien. Pensemos qué pasa después.' : 'Pensemos: ¿qué tiene que pasar antes que todo lo demás?'}>
            <Btn label="Cambiar el orden" onPress={() => setFrames(Array(n).fill(null))} />
          </Feedback>
        )}
        {phase === 'ok' && (
          <Feedback kind="ok" text={`¡Ese es el orden! ${item.cards.map((c) => c.caption).join(' ')}`}>
            <Btn label="Seguir" big onPress={() => setPhase('tell')} />
          </Feedback>
        )}
        {phase === 'model' && (
          <Feedback kind="info" text={`El orden es: ${item.cards.map((c) => c.caption).join(' Después, ')}`}>
            <Btn label="Seguir" big onPress={() => setPhase('tell')} />
          </Feedback>
        )}
      </ActivityFrame>
    </DragArea>
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
  const sfx = useSfx();

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
      sfx('tap');
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
    sfx('encaje');
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
                <View style={{ position: 'absolute', top: -2, width: '56%', height: 8, borderRadius: 3, backgroundColor: '#5B6478' }} />
                <View style={{ position: 'absolute', bottom: -2, width: '56%', height: 8, borderRadius: 3, backgroundColor: '#5B6478' }} />
                <Pic pic={s.pic} size={on ? 60 : 50} />
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
  const sfx = useSfx();
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
    sfx('tap');
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
                    backgroundColor: isRock ? '#D7E9C9' : isHint ? theme.light : visited ? '#F2E2B8' : '#CFE8BF',
                    borderWidth: isHint ? 4 : adj(r, c) && !isRock && !done ? 2 : 1,
                    borderColor: isHint ? theme.lightInk : adj(r, c) && !isRock && !done ? theme.sea : theme.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isTito ? <Tito size={size * 0.85} /> : isRock ? <Pic pic="piedra" size={size * 0.8} /> : isGoal ? <Pic pic="buzon" size={size * 0.85} /> : null}
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
