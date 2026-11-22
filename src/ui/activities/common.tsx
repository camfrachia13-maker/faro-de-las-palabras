import React, { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { useAudioPlayer, useAudioRecorder, RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync } from 'expo-audio';
import type { InputMode, Outcome, WritingSample } from '../../domain/types';
import { Btn, IconBtn, Row, Txt, useSettings, useSpeak } from '../components';
import { useStore } from '../store';
import { radius } from '../theme';

export interface RunResult {
  resolved: boolean | null;
  tries: number;
  hints: number;
  repeats: number;
  listened: boolean;
  response: string;
  prompt: string;
  inputMode: InputMode;
  outcome?: Outcome;
  sample?: Omit<WritingSample, 'id' | 'sessionId' | 'at' | 'context' | 'activityId'>;
  strategies: string[];
}

export interface RunnerProps<T> {
  item: T;
  onDone: (r: RunResult) => void;
  exploration?: boolean;
}

/** Marco común: consigna visible y hablada, repetir, pista, saltar. */
export function ActivityFrame({ instruction, speakText, onRepeat, hintLabel, onHint, hintDisabled, onSkip, hintText, children, autoSpeak = true }: {
  instruction: string;
  speakText?: string;
  onRepeat?: () => void;
  hintLabel?: string;
  onHint?: () => void;
  hintDisabled?: boolean;
  onSkip?: () => void;
  hintText?: string | null;
  children: React.ReactNode;
  autoSpeak?: boolean;
}) {
  const { theme } = useStore();
  const settings = useSettings();
  const say = useSpeak();
  useEffect(() => {
    if (autoSpeak && settings.autoRead) say(speakText ?? instruction);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instruction, speakText]);
  return (
    <View style={{ gap: 14 }}>
      <View style={{ backgroundColor: theme.surface, borderRadius: radius.lg, borderWidth: 2, borderColor: theme.border, padding: 12, gap: 10 }}>
        <Txt size={20} weight="700" accessibilityRole="header">
          {instruction}
        </Txt>
        <Row gap={8} wrap>
          <IconBtn
            icon="speaker"
            label="Repetir"
            onPress={() => {
              onRepeat?.();
              say(speakText ?? instruction);
            }}
          />
          {onHint && <IconBtn icon="hint" label={hintLabel ?? 'Pista'} onPress={onHint} disabled={hintDisabled} />}
          {onSkip && <IconBtn icon="skip" label="Saltar" onPress={onSkip} />}
        </Row>
        {hintText ? (
          <View style={{ backgroundColor: theme.warnBg, borderRadius: radius.md, padding: 10 }} accessibilityLiveRegion="polite">
            <Txt size={17} weight="600" color={theme.lightInk}>
              {hintText}
            </Txt>
          </View>
        ) : null}
      </View>
      {children}
    </View>
  );
}

/**
 * Grabación opcional para relatos orales. Solo aparece si un adulto la habilitó.
 * La grabación NO se guarda: se escucha en el momento y se descarta al salir.
 * No se usa reconocimiento de voz ni se califica la pronunciación.
 */
export function OralRecorder() {
  const settings = useSettings();
  if (!settings.recordingAllowed) return null;
  return <RecorderInner />;
}

function RecorderInner() {
  const { theme } = useStore();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [uri, setUri] = useState<string | null>(null);
  const [state, setState] = useState<'idle' | 'rec' | 'denied'>('idle');
  const player = useAudioPlayer(uri ? { uri } : null);
  const start = async () => {
    try {
      const perm = await requestRecordingPermissionsAsync();
      if (!perm.granted) return setState('denied');
      if (Platform.OS !== 'web') await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setState('rec');
    } catch {
      setState('denied');
    }
  };
  const stop = async () => {
    try {
      await recorder.stop();
      if (Platform.OS !== 'web') await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      setUri(recorder.uri);
    } catch {}
    setState('idle');
  };
  return (
    <View style={{ backgroundColor: theme.infoBg, borderRadius: radius.md, padding: 10, gap: 8 }}>
      <Txt size={15} color={theme.inkSoft}>
        Grabación habilitada por un adulto. Se escucha ahora y no se guarda.
      </Txt>
      {state === 'denied' && <Txt size={15}>No hay permiso para usar el micrófono. Podés contarlo en voz alta igual.</Txt>}
      <Row wrap>
        {state !== 'rec' ? <Btn label="Grabar" icon="mic" kind="secondary" onPress={start} /> : <Btn label="Parar" icon="stop" kind="danger" onPress={stop} />}
        {uri && state !== 'rec' && (
          <Btn
            label="Escucharme"
            icon="play"
            kind="secondary"
            onPress={() => {
              player.seekTo(0);
              player.play();
            }}
          />
        )}
      </Row>
    </View>
  );
}

export function strategyNotes(r: { hints: number; tries: number; repeats: number; listened: boolean }): string[] {
  const s: string[] = [];
  if (r.repeats > 0) s.push('Volviste a escuchar la consigna.');
  if (r.hints > 0) s.push(`Usaste ${r.hints === 1 ? 'una pista' : `${r.hints} pistas`}.`);
  if (r.tries > 1) s.push('Probaste otra vez después de equivocarte.');
  if (r.listened) s.push('Pediste escuchar el texto.');
  return s;
}
