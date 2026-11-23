import React, { useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { Text } from '../text';
import type { ChoiceItem, Option } from '../../domain/items';
import { ActivityFrame, OralRecorder, RunnerProps, strategyNotes } from './common';
import { Btn, Feedback, IconBtn, Pic, Txt, caseText, useSettings, useSpeak } from '../components';
import { ShapeGlyph, Icon } from '../art';
import { GameTile } from './game';
import { useStore } from '../store';
import { radius } from '../theme';

const MAX_TRIES = 3;

export function ChoiceRunner({ item, onDone, exploration }: RunnerProps<ChoiceItem>) {
  const { theme } = useStore();
  const settings = useSettings();
  const say = useSpeak();
  const { width } = useWindowDimensions();
  const [tried, setTried] = useState<string[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [hintIdx, setHintIdx] = useState(0);
  const [hintText, setHintText] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<number | null>(null);
  const [repeats, setRepeats] = useState(0);
  const [listened, setListened] = useState(false);
  const [phase, setPhase] = useState<'answer' | 'wrong' | 'ok' | 'model'>('answer');
  const [last, setLast] = useState<Option | null>(null);

  const finish = (resolved: boolean | null, response: string) => {
    const r = { hints: hintIdx, tries: phase === 'ok' ? tried.length + 1 : tried.length, repeats, listened };
    onDone({
      resolved,
      ...r,
      response,
      prompt: item.stimulus.text && !item.stimulus.text.includes(' ') ? item.stimulus.text : item.instruction,
      inputMode: 'toque',
      strategies: strategyNotes(r),
    });
  };

  const choose = (o: Option) => {
    if (phase === 'ok' || phase === 'model') return;
    setLast(o);
    if (o.id === item.correctId) {
      setPhase('ok');
    } else {
      const nt = [...tried, o.id];
      setTried(nt);
      const remaining = item.options.filter((x) => !nt.includes(x.id) && !removed.includes(x.id));
      setPhase(nt.length >= MAX_TRIES || remaining.length <= 1 ? 'model' : 'wrong');
    }
  };

  const useHint = () => {
    const h = item.hints[hintIdx];
    if (!h) return;
    setHintIdx(hintIdx + 1);
    setHintText(h.text);
    if (h.speak) say(h.speak);
    if (h.revealText) setListened(true);
    if (h.highlight !== undefined) setHighlight(h.highlight);
    if (h.removeOption) {
      const candidate = item.options.find((o) => o.id !== item.correctId && !removed.includes(o.id) && !tried.includes(o.id));
      if (candidate) setRemoved([...removed, candidate.id]);
    }
    if (phase === 'wrong') setPhase('answer');
  };

  const visible = item.options.filter((o) => !removed.includes(o.id));
  const list = item.optionLayout === 'list';
  const cols = list ? 1 : visible.length <= 2 ? 2 : visible.length === 4 && width < 500 ? 2 : Math.min(visible.length, 3);
  const cardW = list ? '100%' : `${Math.floor(100 / cols) - 4}%`;
  const correct = item.options.find((o) => o.id === item.correctId)!;
  const st = item.stimulus;

  return (
    <ActivityFrame
      instruction={item.instruction}
      speakText={item.speak}
      onRepeat={() => setRepeats((r) => r + 1)}
      onHint={item.hints.length ? useHint : undefined}
      hintDisabled={hintIdx >= item.hints.length || phase === 'ok' || phase === 'model'}
      hintText={hintText}
      onSkip={phase === 'answer' || phase === 'wrong' ? () => finish(false, '(saltó)') : undefined}
    >
      {/* Estímulo */}
      <View style={{ alignItems: 'center', gap: 10 }}>
        {st.bigLetter && (
          <View style={{ backgroundColor: theme.surface, borderRadius: radius.xl, paddingHorizontal: 36, paddingVertical: 4, borderWidth: 3, borderColor: theme.seaDeep }}>
            <Text accessibilityLabel={`Letra ${st.bigLetter}`} style={{ fontSize: theme.fs(84), fontWeight: '800', color: theme.ink, textAlign: 'center' }}>
              {caseText(st.bigLetter, settings.letterCase)}
            </Text>
          </View>
        )}
        {st.pic && (
          <View style={{ backgroundColor: theme.surface, borderRadius: radius.xl, paddingHorizontal: 22, paddingVertical: 8, borderWidth: 2, borderColor: theme.border }}>
            <Pic pic={st.pic} size={st.pic.includes('+') ? 110 : 120} label={st.sayWord} />
          </View>
        )}
        {st.sayWord && (
          <Btn
            label={`Escuchar «${st.sayWord}»`}
            icon="speaker"
            kind="light"
            onPress={() => {
              setRepeats((r) => r + 1);
              say(st.sayWord!);
            }}
          />
        )}
        {st.text && (
          <View style={{ backgroundColor: theme.surface, borderRadius: radius.lg, padding: 16, borderWidth: 2, borderColor: theme.border, width: '100%' }}>
            <Text style={{ fontSize: theme.fs(st.text.includes(' ') ? 26 : 40), fontWeight: '700', color: theme.ink, textAlign: 'center', letterSpacing: st.text.includes(' ') ? 0.5 : 3 }}>
              {st.text.includes(' ') ? st.text : caseText(st.text, settings.letterCase)}
            </Text>
          </View>
        )}
        {st.template && (
          <View style={{ backgroundColor: '#FFFDF6', borderRadius: radius.md, padding: 16, borderWidth: 2, borderColor: theme.border, width: '100%' }}>
            <Txt size={21}>{st.template.replace('___', phase === 'ok' ? correct.label ?? '' : '______')}</Txt>
            <IconBtn
              icon="speaker"
              label="Leer la carta"
              compact
              onPress={() => {
                setListened(true);
                say(st.template!.replace('___', '...'));
              }}
            />
          </View>
        )}
        {st.story && (
          <View style={{ backgroundColor: theme.surface, borderRadius: radius.lg, padding: 16, borderWidth: 2, borderColor: theme.border, width: '100%', gap: 6 }}>
            {st.story.art && st.story.art.length > 0 && (
              <View style={{ alignItems: 'center' }}>
                <Pic pic={st.story.art.join('+')} size={120} />
              </View>
            )}
            <Txt size={19} weight="800" color={theme.seaDeep}>
              {st.story.title}
            </Txt>
            {st.story.sentences.map((s, i) => (
              <Text
                key={i}
                style={{
                  fontSize: theme.fs(20),
                  lineHeight: theme.fs(30),
                  color: theme.ink,
                  backgroundColor: highlight === i ? theme.warnBg : 'transparent',
                  fontWeight: highlight === i ? '700' : '400',
                }}
              >
                {s}
              </Text>
            ))}
            <Btn
              label="Escuchar el cuento"
              icon="speaker"
              kind="secondary"
              onPress={() => {
                setListened(true);
                say(st.story!.sentences.join(' '));
              }}
            />
          </View>
        )}
        {st.card && (
          <View style={{ alignItems: 'center', gap: 4 }}>
            <View style={{ backgroundColor: theme.surface, borderRadius: radius.md, padding: 12, borderWidth: 3, borderColor: theme.ink }}>
              <ShapeGlyph shape={st.card.shape} color={st.card.color} star={st.card.star} size={96} />
            </View>
            <Txt size={16} weight="600">
              Carta: {st.card.shape} {st.card.color}
              {st.card.star ? ' con estrella' : ''}
            </Txt>
          </View>
        )}
      </View>

      {/* Opciones: fichas que reaccionan al tocarlas */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }} accessibilityRole="radiogroup">
        {visible.map((o) => {
          const isTried = tried.includes(o.id);
          const isCorrectShown = (phase === 'ok' || phase === 'model') && o.id === item.correctId;
          const picSize = list ? 40 : o.pic && o.pic.includes('+') ? 64 : width < 380 ? 70 : 84;
          return (
            <GameTile
              key={o.id}
              state={isCorrectShown ? 'correct' : isTried ? 'tried' : 'idle'}
              label={o.label ?? o.speak ?? 'opción'}
              disabled={isTried || phase === 'ok' || phase === 'model'}
              onPress={() => choose(o)}
              style={{ width: cardW as any, minHeight: list ? 64 : 120 }}
            >
              <View style={{ flexDirection: list ? 'row' : 'column', alignItems: 'center', gap: 8, width: '100%', justifyContent: list ? 'flex-start' : 'center' }}>
                {o.glyph && <ShapeGlyph shape={o.glyph.shape} color={o.glyph.color} size={64} />}
                {o.pic && <Pic pic={o.pic} size={picSize} />}
                {o.label && (!o.pic || list || item.stimulus.template || o.glyph || item.showPicLabels) ? (
                  <Text style={{ fontSize: theme.fs(o.label.length <= 2 ? 44 : list ? 19 : 17), fontWeight: '800', color: theme.ink, textAlign: list ? 'left' : 'center', flexShrink: 1 }}>
                    {o.label.length <= 2 || item.showPicLabels ? caseText(o.label, settings.letterCase) : o.label}
                  </Text>
                ) : null}
                {isTried && <Icon name="close" size={20} color={theme.coral} />}
                {isCorrectShown && <Icon name="check" size={26} color={theme.ok} />}
                {o.speak && !list && item.optionAudio && <IconBtn icon="speaker" label={`Escuchar ${o.speak}`} compact onPress={() => say(o.speak!)} />}
              </View>
            </GameTile>
          );
        })}
      </View>

      {/* Devoluciones */}
      {phase === 'wrong' && last && (
        <Feedback kind="retry" text={item.explainWrong(last)}>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Btn label="Probar otra vez" onPress={() => setPhase('answer')} style={{ flex: 1 }} />
            {hintIdx < item.hints.length && <Btn label="Probemos con una pista" kind="light" icon="hint" onPress={useHint} style={{ flex: 1 }} />}
          </View>
        </Feedback>
      )}
      {phase === 'ok' && (
        <Feedback kind="ok" text={item.explainCorrect + (hintIdx > 0 || tried.length > 0 ? ' Usar pistas y volver a probar también es una buena estrategia.' : '')}>
          {item.followUpOral && !exploration && (
            <View style={{ gap: 8 }}>
              <Txt size={16} weight="600">
                {item.followUpOral}
              </Txt>
              <OralRecorder />
            </View>
          )}
          <Btn label="Seguir" big onPress={() => finish(true, last?.label ?? last?.id ?? '')} />
        </Feedback>
      )}
      {phase === 'model' && (
        <Feedback kind="info" text={`La respuesta era: ${(correct.label ?? correct.speak ?? (correct.id.length > 2 ? correct.id.toUpperCase() : 'la opción marcada con un tilde')).replace(/[.!?]+$/, '')}. Lo vamos a volver a practicar más adelante.`}>
          <Btn label="Seguir" big onPress={() => finish(false, last?.label ?? last?.id ?? '')} />
        </Feedback>
      )}
    </ActivityFrame>
  );
}
