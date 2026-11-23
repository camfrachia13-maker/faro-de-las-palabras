import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';
import { Text } from '../text';
import type { BuildItem } from '../../domain/items';
import { ActivityFrame, RunnerProps, strategyNotes } from './common';
import { Btn, Feedback, Pic, Row, caseText, useReduceMotion, useSettings, useSfx, useSpeak } from '../components';
import { DragArea, Draggable, DropZone } from './game';
import { useStore } from '../store';
import { radius } from '../theme';

export function BuildRunner({ item, onDone }: RunnerProps<BuildItem>) {
  const { theme } = useStore();
  const settings = useSettings();
  const say = useSpeak();
  const target = item.word.text.split('');
  const initialSlots = useMemo(() => target.map((ch, i) => (i < item.prefilled ? { ch, tile: -1 } : null)), [item.id]);
  const [slots, setSlots] = useState<({ ch: string; tile: number } | null)[]>(initialSlots);
  const [usedTiles, setUsedTiles] = useState<number[]>(() => {
    // las letras precolocadas consumen una ficha igual
    const used: number[] = [];
    initialSlots.forEach((s) => {
      if (s) {
        const idx = item.tiles.findIndex((t, k) => t === s.ch && !used.includes(k));
        used.push(idx);
      }
    });
    return used;
  });
  const [tries, setTries] = useState(0);
  const [hints, setHints] = useState(0);
  const [repeats, setRepeats] = useState(0);
  const [phase, setPhase] = useState<'build' | 'wrong' | 'ok' | 'model'>('build');
  const [mismatch, setMismatch] = useState<number>(-1);

  const sfx = useSfx();
  const reduce = useReduceMotion();
  const alive = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (phase !== 'ok' || reduce) return;
    // el dibujo "cobra vida" cuando la palabra queda armada
    Animated.sequence([
      Animated.timing(alive, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(alive, { toValue: 0, duration: 380, easing: Easing.bounce, useNativeDriver: true }),
    ]).start();
  }, [phase, reduce, alive]);
  const fixed = (i: number) => i < item.prefilled;
  /** Coloca una letra: en el casillero indicado (arrastre) o en el primero libre (toque). */
  const place = (tileIdx: number, slotIdx?: number): boolean => {
    if (phase === 'ok' || phase === 'model') return false;
    if (phase !== 'build') setPhase('build');
    const target = slotIdx ?? slots.findIndex((x) => x === null);
    if (target < 0 || target >= slots.length || fixed(target)) return false;
    const ns = [...slots];
    let nu = [...usedTiles, tileIdx];
    const prev = ns[target];
    if (prev) nu = nu.filter((t) => t !== prev.tile); // la letra que estaba vuelve a la bandeja
    ns[target] = { ch: item.tiles[tileIdx], tile: tileIdx };
    setSlots(ns);
    setUsedTiles(nu);
    sfx('encaje');
    say(`la letra ${item.tiles[tileIdx].toUpperCase()}`);
    return true;
  };
  const remove = (i: number) => {
    const s = slots[i];
    if (!s || fixed(i)) return;
    const ns = [...slots];
    ns[i] = null;
    setSlots(ns);
    setUsedTiles(usedTiles.filter((t) => t !== s.tile));
    if (phase !== 'build') setPhase('build');
  };
  const built = slots.map((s) => s?.ch ?? '').join('');
  const full = slots.every((s) => s !== null);

  const check = () => {
    const nt = tries + 1;
    setTries(nt);
    if (built === item.word.text) return setPhase('ok');
    setMismatch(target.findIndex((ch, i) => slots[i]?.ch !== ch));
    setPhase(nt >= 3 ? 'model' : 'wrong');
  };
  const hint = () => {
    setHints(hints + 1);
    // coloca la letra correcta en el primer lugar incorrecto o vacío
    const i = target.findIndex((ch, k) => slots[k]?.ch !== ch);
    if (i < 0) return;
    const ns = [...slots];
    let nu = [...usedTiles];
    if (ns[i]) nu = nu.filter((t) => t !== ns[i]!.tile);
    const tileIdx = item.tiles.findIndex((t, k) => t === target[i] && !nu.includes(k));
    if (tileIdx < 0) {
      // la ficha está usada en otro lugar: liberarla
      const other = ns.findIndex((s, k) => k !== i && s?.ch === target[i] && !fixed(k));
      if (other >= 0) {
        nu = nu.filter((t) => t !== ns[other]!.tile);
        ns[i] = ns[other];
        ns[other] = null;
        nu.push(ns[i]!.tile);
      }
    } else {
      ns[i] = { ch: target[i], tile: tileIdx };
      nu.push(tileIdx);
    }
    setSlots(ns);
    setUsedTiles(nu);
    setPhase('build');
    say(`Va la letra ${target[i].toUpperCase()}`);
  };
  const finish = (resolved: boolean) => {
    const r = { hints, tries, repeats, listened: false };
    onDone({ resolved, ...r, response: built, prompt: item.word.text, inputMode: 'toque', strategies: strategyNotes(r) });
  };

  const slotW = Math.min(64, Math.floor(320 / target.length));
  const sylBreaks = new Set<number>();
  let acc = 0;
  item.word.syllables.forEach((s) => {
    acc += s.length;
    sylBreaks.add(acc - 1);
  });

  return (
    <DragArea>
    <ActivityFrame
      instruction={item.instruction}
      speakText={item.speak}
      onRepeat={() => setRepeats(repeats + 1)}
      onHint={hint}
      hintLabel="Pista"
      hintDisabled={phase === 'ok' || phase === 'model'}
    >
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Animated.View style={{ transform: [{ translateY: alive.interpolate({ inputRange: [0, 1], outputRange: [0, -18] }) }, { rotate: alive.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['0deg', '-6deg', '0deg'] }) }] }}>
          <Pic pic={item.word.pic} size={120} label={item.word.text} />
        </Animated.View>
        <Btn
          label="Escuchar por sílabas"
          icon="speaker"
          kind="secondary"
          onPress={() => {
            setRepeats(repeats + 1);
            say(item.word.syllables.join('... '));
          }}
        />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }} accessibilityLabel={`Palabra armada: ${built || 'vacía'}`}>
        {slots.map((s, i) => (
          <DropZone key={i} id={`slot-${i}`}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={s ? `Lugar ${i + 1}: ${s.ch}. Tocá para sacar.` : `Lugar ${i + 1} vacío`}
              onPress={() => remove(i)}
              style={{
                width: slotW,
                height: slotW * 1.15,
                borderRadius: radius.sm,
                borderWidth: 3,
                borderStyle: s ? 'solid' : 'dashed',
                borderColor: phase === 'wrong' && i === mismatch ? theme.coral : phase === 'ok' ? theme.ok : fixed(i) ? theme.sea : theme.border,
                backgroundColor: phase === 'ok' ? theme.okBg : s ? (fixed(i) ? theme.infoBg : theme.surface) : theme.surfaceAlt,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: item.showSyllableGuide && sylBreaks.has(i) ? 10 : 0,
              }}
            >
              <Text style={{ fontSize: theme.fs(Math.min(36, slotW * 0.6)), fontWeight: '800', color: theme.ink }}>{s ? caseText(s.ch, settings.letterCase) : ''}</Text>
            </Pressable>
          </DropZone>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', backgroundColor: theme.surfaceAlt, borderRadius: radius.lg, padding: 12 }}>
        {item.tiles.map((t, k) => {
          const used = usedTiles.includes(k);
          const blocked = used || phase === 'ok' || phase === 'model';
          return (
            <Draggable
              key={k}
              label={`Letra ${t}${used ? ', ya usada' : ''}`}
              disabled={blocked}
              onTap={() => !full && place(k)}
              onDrop={(zone) => place(k, Number(zone.replace('slot-', '')))}
            >
              <View
                style={{
                  width: 60,
                  height: 66,
                  borderRadius: radius.md,
                  backgroundColor: used ? theme.surface : theme.light,
                  borderWidth: 2,
                  borderBottomWidth: used ? 2 : 6,
                  borderColor: used ? theme.border : theme.lightInk,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: used ? 0.35 : 1,
                }}
              >
                <Text style={{ fontSize: theme.fs(32), fontWeight: '800', color: theme.ink }}>{caseText(t, settings.letterCase)}</Text>
              </View>
            </Draggable>
          );
        })}
      </View>
      {phase === 'build' && <Btn label="¡Listo!" icon="check" big disabled={!full} onPress={check} />}
      {phase === 'wrong' && (
        <Feedback
          kind="retry"
          text={
            mismatch > 0
              ? `Hasta la letra ${target[mismatch - 1].toUpperCase()} va bien. Escuchemos desde ahí: ${item.word.syllables.join('... ')}.`
              : `Escuchemos otra vez el comienzo de la palabra: ${item.word.syllables[0]}...`
          }
        >
          <Row wrap>
            <Btn label="Cambiar letras" onPress={() => setPhase('build')} style={{ flex: 1 }} />
            <Btn label="Probemos con una pista" kind="light" icon="hint" onPress={hint} style={{ flex: 1 }} />
          </Row>
        </Feedback>
      )}
      {phase === 'ok' && (
        <Feedback kind="ok" text={`¡Armaste ${item.word.text.toUpperCase()}! Cada letra está en el lugar de su sonido.`}>
          <Btn label="Seguir" big onPress={() => finish(true)} />
        </Feedback>
      )}
      {phase === 'model' && (
        <Feedback kind="info" text={`Se escribe así: ${item.word.text.toUpperCase()}. La vamos a volver a armar más adelante.`}>
          <Btn label="Seguir" big onPress={() => finish(false)} />
        </Feedback>
      )}
    </ActivityFrame>
    </DragArea>
  );
}
