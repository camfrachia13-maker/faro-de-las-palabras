// Voz sintetizada del dispositivo (sin internet). Prefiere voces es-AR, luego
// otras variantes de español. En producción se recomienda grabar los audios
// con una voz humana rioplatense: los sonidos aislados (/m/, /s/) se oyen mejor así.
import * as Speech from 'expo-speech';
import type { Settings } from '../domain/types';

let preferredVoice: string | undefined;
let resolved = false;
let speaking = false;
const listeners = new Set<(s: boolean) => void>();

async function resolveVoice() {
  if (resolved) return;
  resolved = true;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const es = voices.filter((v) => v.language?.toLowerCase().startsWith('es'));
    const byPref = (tag: string) => es.find((v) => v.language.toLowerCase().replace('_', '-') === tag);
    const v = byPref('es-ar') ?? byPref('es-419') ?? byPref('es-us') ?? byPref('es-mx') ?? es[0];
    preferredVoice = v?.identifier;
  } catch {}
}

function setSpeaking(v: boolean) {
  speaking = v;
  listeners.forEach((l) => l(v));
}

export function onSpeakingChange(l: (s: boolean) => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export async function speak(text: string, settings: Pick<Settings, 'voiceEnabled' | 'volume' | 'rate'>, onDone?: () => void) {
  if (!settings.voiceEnabled || !text) {
    onDone?.();
    return;
  }
  await resolveVoice();
  Speech.stop();
  setSpeaking(true);
  Speech.speak(text, {
    language: 'es-AR',
    voice: preferredVoice,
    rate: settings.rate,
    volume: settings.volume,
    pitch: 1.05,
    onDone: () => {
      setSpeaking(false);
      onDone?.();
    },
    onStopped: () => setSpeaking(false),
    onError: () => {
      setSpeaking(false);
      onDone?.();
    },
  });
}

export function stopSpeaking() {
  Speech.stop();
  setSpeaking(false);
}

export const isSpeaking = () => speaking;
