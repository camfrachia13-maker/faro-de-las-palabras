import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import type { WriteItem } from '../../domain/items';
import { analyzeWord, normalize } from '../../domain/writingAnalysis';
import { LETTER_NAMES } from '../../content/words';

/** Deletrea con el nombre de cada letra: "ese, o, ele". */
const spell = (t: string) =>
  t
    .toLowerCase()
    .split('')
    .map((c) => (c === ' ' ? 'espacio' : LETTER_NAMES[c.normalize('NFD')[0]] ?? c))
    .join(', ');
import type { Outcome } from '../../domain/types';
import { ActivityFrame, RunnerProps, strategyNotes } from './common';
import { Btn, Feedback, LetterKeyboard, Pic, Row, Toggle, Txt, caseText, useSettings, useSpeak } from '../components';
import { useStore } from '../store';
import { radius } from '../theme';

const REVISION = ['Lo escuché leído', 'Se entiende lo que quiero decir', 'Agregué o cambié algo', 'Separé las palabras'];

export function WriteRunner({ item, onDone, exploration }: RunnerProps<WriteItem>) {
  const { theme } = useStore();
  const settings = useSettings();
  const say = useSpeak();
  const [text, setText] = useState('');
  const [firstText, setFirstText] = useState<string | null>(null);
  const [phase, setPhase] = useState<'write' | 'review' | 'revise' | 'done'>('write');
  const [repeats, setRepeats] = useState(0);
  const [hints, setHints] = useState(0);
  const [tries, setTries] = useState(0);
  const [supports, setSupports] = useState<string[]>([]);
  const [hintText, setHintText] = useState<string | null>(null);
  const [showModel, setShowModel] = useState(false);
  const [checks, setChecks] = useState<string[]>([]);
  const [systemKb, setSystemKb] = useState(false);
  const lower = settings.letterCase === 'minuscula';
  const addSupport = (s: string) => setSupports((x) => (x.includes(s) ? x : [...x, s]));
  const free = item.mode === 'libre';
  const word = item.word;

  const readBack = () => {
    addSupport('escuchó lo que escribió');
    if (!text.trim()) return say('Todavía no escribiste nada.');
    // Se deletrea si es una palabra corta, así el niño escucha qué letras puso
    if (!free && text.trim().length <= 10) say(`Escribiste: ${spell(text.trim())}. Se lee: ${text.toLowerCase()}`);
    else say(text);
  };

  const submit = () => {
    setTries(tries + 1);
    if (firstText === null) setFirstText(text);
    setPhase('review');
  };

  const finish = (outcome: Outcome, resolved: boolean | null) => {
    const r = { hints, tries: Math.max(1, tries), repeats, listened: false };
    const original = firstText ?? text;
    const analysis = word && item.mode !== 'libre' ? analyzeWord(word.text, word.syllables, original) : undefined;
    onDone({
      resolved,
      ...r,
      response: text,
      prompt: word?.text ?? item.prompt,
      inputMode: 'teclado',
      outcome,
      strategies: [...strategyNotes(r), ...(phase === 'done' || firstText !== text ? ['Revisaste tu escritura.'] : [])],
      sample: {
        kind: item.mode,
        prompt: item.template ?? item.prompt,
        target: word?.text,
        text: original,
        revisedText: text !== original ? text : undefined,
        revisionChecks: checks.length ? checks : undefined,
        analysis,
        supportsUsed: supports,
      },
    });
  };

  // --- resultado para palabras / mensajes
  const evaluate = (): { outcome: Outcome; resolved: boolean | null } => {
    if (!word) return { outcome: 'abierta', resolved: null };
    if (exploration) return { outcome: 'abierta', resolved: null };
    const a = analyzeWord(word.text, word.syllables, text);
    const exact = normalize(text) === normalize(word.text);
    if (exact) return { outcome: tries <= 1 && hints === 0 && !showModel ? 'autonomo' : 'conApoyo', resolved: true };
    if (a.hypothesis === 'alfabetica') return { outcome: 'conApoyo', resolved: true };
    return { outcome: 'noResuelto', resolved: false };
  };

  const header = (
    <View style={{ alignItems: 'center', gap: 8 }}>
      {item.showPic && word && <Pic pic={word.pic} size={88} label="dibujo" />}
      {item.template && (
        <View style={{ backgroundColor: '#FFFDF6', borderRadius: radius.md, padding: 14, borderWidth: 2, borderColor: theme.border, width: '100%' }}>
          <Txt size={20}>{item.template.replace('___', text ? `[${text}]` : '______')}</Txt>
        </View>
      )}
      {word && item.mode === 'palabra' && (
        <Btn
          label="Escuchar la palabra"
          icon="speaker"
          kind="secondary"
          onPress={() => {
            setRepeats(repeats + 1);
            say(word.text);
          }}
        />
      )}
      {item.template && (
        <Btn
          label="Escuchar la carta"
          icon="speaker"
          kind="secondary"
          onPress={() => {
            addSupport('escuchó la carta');
            say(item.template!.replace('___', '...'));
          }}
        />
      )}
    </View>
  );

  const editor = (
    <View style={{ gap: 10, alignItems: 'center' }}>
      <View style={{ width: '100%', minHeight: free ? 120 : 72, backgroundColor: theme.surface, borderRadius: radius.md, borderWidth: 3, borderColor: theme.sea, padding: 12, justifyContent: 'center' }}>
        {systemKb ? (
          <TextInput
            value={text}
            onChangeText={setText}
            multiline={free}
            autoCapitalize={lower ? 'none' : 'characters'}
            autoCorrect={false}
            spellCheck={false}
            accessibilityLabel="Escribí acá"
            style={{ fontSize: theme.fs(free ? 22 : 34), color: theme.ink, fontWeight: '700', minHeight: free ? 100 : 48 }}
          />
        ) : (
          <Text accessibilityLabel={`Escribiste: ${text || 'nada todavía'}`} style={{ fontSize: theme.fs(free ? 24 : 38), color: theme.ink, fontWeight: '700', letterSpacing: free ? 0.5 : 4, textAlign: free ? 'left' : 'center' }}>
            {(lower ? text : caseText(text, 'mayuscula')) || ' '}
            <Text style={{ color: theme.sea }}>|</Text>
          </Text>
        )}
      </View>
      {free && item.ideas && phase === 'write' && !text && (
        <Row wrap gap={8}>
          {item.ideas.map((idea) => (
            <Pressable
              key={idea}
              accessibilityRole="button"
              accessibilityLabel={`Idea para empezar: ${idea}`}
              onPress={() => {
                addSupport('ideas para empezar');
                setText(idea.replace('…', ' '));
                say(idea);
              }}
              style={{ backgroundColor: theme.warnBg, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, minHeight: 48, justifyContent: 'center' }}
            >
              <Txt size={16}>{idea}</Txt>
            </Pressable>
          ))}
        </Row>
      )}
      {!systemKb && (
        <LetterKeyboard
          lowercase={lower}
          onKey={(ch) => {
            setText((t) => (t + ch).slice(0, free ? 400 : 24));
            say(`la letra ${ch.toUpperCase()}`);
          }}
          onDelete={() => setText((t) => t.slice(0, -1))}
          onSpace={free || item.mode === 'palabra' ? () => setText((t) => t + ' ') : undefined}
          extraKeys={free ? ['.', ',', '¿', '?', '¡', '!'] : undefined}
        />
      )}
      <Toggle label="Usar el teclado del dispositivo" value={systemKb} onChange={setSystemKb} />
      <Row wrap>
        <Btn label="Escuchar lo que escribí" icon="speaker" kind="secondary" onPress={readBack} style={{ flex: 1 }} />
        <Btn label={phase === 'revise' ? 'Listo, terminé' : free ? 'Terminé' : '¡Listo!'} icon="check" onPress={phase === 'revise' ? () => setPhase('done') : submit} disabled={!text.trim()} style={{ flex: 1 }} />
      </Row>
    </View>
  );

  const hint =
    item.mode === 'mensaje' && word
      ? () => {
          setHints(hints + 1);
          if (hints === 0) {
            setHintText(`Es esto: ${word.pic}`);
            say(`Pensá en ${word.text}`);
          } else {
            setHintText(`Empieza con ${caseText(word.text[0], settings.letterCase)}`);
          }
        }
      : undefined;

  // --- revisión
  let review: React.ReactNode = null;
  if (phase === 'review' && !free && word) {
    const a = analyzeWord(word.text, word.syllables, text);
    const exact = normalize(text) === normalize(word.text);
    const msg = exploration
      ? '¡Gracias! Guardé tu escritura. Así conozco cómo escribís.'
      : exact
        ? `¡Sí! Escribiste ${word.text.toUpperCase()} como se escribe en los libros.`
        : item.mode === 'mensaje'
          ? `Escuchá cómo queda la carta. ¿Querés compararla con otra forma de escribir la palabra?`
          : `Escribiste ${a.writtenLength} letra${a.writtenLength === 1 ? '' : 's'}. ${a.correctInitial ? 'El comienzo suena como la palabra. ' : ''}¿Querés compararla con otra forma de escribirla?`;
    review = (
      <Feedback kind={exact ? 'ok' : 'info'} text={msg}>
        {showModel && (
          <View style={{ backgroundColor: theme.surface, padding: 10, borderRadius: radius.md, gap: 4 }}>
            <Txt size={15} color={theme.inkSoft}>
              Tu escritura:
            </Txt>
            <Txt size={28} weight="800">
              {caseText(firstText ?? text, settings.letterCase)}
            </Txt>
            <Txt size={15} color={theme.inkSoft}>
              Otra forma (como en los libros):
            </Txt>
            <Txt size={28} weight="800" color={theme.seaDeep}>
              {caseText(word.text, settings.letterCase)}
            </Txt>
          </View>
        )}
        <Row wrap>
          {!exact && !showModel && !exploration && (
            <Btn
              label="Ver otra forma"
              icon="eye"
              kind="secondary"
              onPress={() => {
                setShowModel(true);
                addSupport('vio la forma convencional');
                say(`Se escribe así: ${spell(word.text)}`);
              }}
              style={{ flex: 1 }}
            />
          )}
          {!exact && !exploration && <Btn label="Volver a escribir" icon="pencil" kind="secondary" onPress={() => setPhase('write')} style={{ flex: 1 }} />}
          <Btn
            label="Seguir"
            onPress={() => {
              const e = evaluate();
              finish(e.outcome, e.resolved);
            }}
            style={{ flex: 1 }}
          />
        </Row>
      </Feedback>
    );
  }
  if ((phase === 'review' || phase === 'done') && free) {
    review = (
      <Feedback kind="info" text={phase === 'done' ? '¡Gracias! Guardé tu texto. Lo voy a llevar en mi farol.' : 'Revisemos juntos. Marcá lo que ya hiciste.'}>
        {phase === 'review' && (
          <View style={{ gap: 4 }}>
            {REVISION.map((c) => (
              <Toggle key={c} label={c} value={checks.includes(c)} onChange={(v) => setChecks(v ? [...checks, c] : checks.filter((x) => x !== c))} />
            ))}
            <Btn label="Escuchar mi texto" icon="speaker" kind="secondary" onPress={readBack} />
          </View>
        )}
        <Row wrap>
          {phase === 'review' && <Btn label="Quiero cambiar algo" icon="pencil" kind="secondary" onPress={() => setPhase('revise')} style={{ flex: 1 }} />}
          <Btn label="Seguir" onPress={() => finish('abierta', null)} style={{ flex: 1 }} />
        </Row>
      </Feedback>
    );
  }

  return (
    <ActivityFrame
      instruction={item.prompt}
      speakText={item.speak}
      onRepeat={() => setRepeats(repeats + 1)}
      onHint={hint}
      hintDisabled={hints >= 2}
      hintText={hintText}
      onSkip={phase === 'write' ? () => finish(free ? 'abierta' : exploration ? 'abierta' : 'noResuelto', free || exploration ? null : false) : undefined}
    >
      {header}
      {phase === 'write' || phase === 'revise' ? editor : review}
    </ActivityFrame>
  );
}
