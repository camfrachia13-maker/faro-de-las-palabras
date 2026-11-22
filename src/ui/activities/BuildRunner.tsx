import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { BuildItem } from '../../domain/items';
import { ActivityFrame, RunnerProps, strategyNotes } from './common';
import { Btn, Feedback, Pic, Row, caseText, useSettings, useSpeak } from '../components';
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

  const fixed = (i: number) => i < item.prefilled;
  const place = (tileIdx: number) => {
    if (phase !== 'build') setPhase('build');
    const empty = slots.findIndex((s) => s === null);
    if (empty < 0) return;
    const ns = [...slots];
    ns[empty] = { ch: item.tiles[tileIdx], tile: tileIdx };
    setSlots(ns);
    setUsedTiles([...usedTiles, tileIdx]);
    say(item.tiles[tileIdx]);
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
    say(`Va la ${target[i]}`);
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
    <ActivityFrame
      instruction={item.instruction}
      speakText={item.speak}
      onRepeat={() => setRepeats(repeats + 1)}
      onHint={hint}
      hintLabel="Pista"
      hintDisabled={phase === 'ok' || phase === 'model'}
    >
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Pic pic={item.word.pic} size={88} label={item.word.text} />
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
          <Pressable
            key={i}
            accessibilityRole="button"
            accessibilityLabel={s ? `Lugar ${i + 1}: ${s.ch}. Tocá para sacar.` : `Lugar ${i + 1} vacío`}
            onPress={() => remove(i)}
            style={{
              width: slotW,
              height: slotW * 1.15,
              borderRadius: radius.sm,
              borderWidth: 3,
              borderStyle: s ? 'solid' : 'dashed',
              borderColor: phase === 'wrong' && i === mismatch ? theme.coral : fixed(i) ? theme.sea : theme.border,
              backgroundColor: s ? (fixed(i) ? theme.infoBg : theme.surface) : theme.surfaceAlt,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: item.showSyllableGuide && sylBreaks.has(i) ? 10 : 0,
            }}
          >
            <Text style={{ fontSize: theme.fs(Math.min(36, slotW * 0.6)), fontWeight: '800', color: theme.ink }}>{s ? caseText(s.ch, settings.letterCase) : ''}</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
        {item.tiles.map((t, k) => {
          const used = usedTiles.includes(k);
          return (
            <Pressable
              key={k}
              accessibilityRole="button"
              accessibilityLabel={`Letra ${t}${used ? ', ya usada' : ''}`}
              disabled={used || full || phase === 'ok' || phase === 'model'}
              onPress={() => place(k)}
              style={({ pressed }) => ({
                width: 60,
                height: 64,
                borderRadius: radius.md,
                backgroundColor: used ? theme.surfaceAlt : theme.light,
                borderWidth: 2,
                borderColor: used ? theme.border : theme.lightInk,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: used ? 0.4 : pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ fontSize: theme.fs(32), fontWeight: '800', color: theme.ink }}>{caseText(t, settings.letterCase)}</Text>
            </Pressable>
          );
        })}
      </View>
      {phase === 'build' && <Btn label="¡Listo!" icon="check" big disabled={!full} onPress={check} />}
      {phase === 'wrong' && (
        <Feedback
          kind="retry"
          text={
            mismatch > 0
              ? `Hasta la ${target[mismatch - 1].toUpperCase()} va bien. Escuchemos desde ahí: ${item.word.syllables.join('... ')}.`
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
  );
}
