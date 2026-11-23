// Voz sintetizada del dispositivo (sin internet), SIEMPRE en español.
// Orden de preferencia: Argentina, Latinoamérica (es-419, es-US, es-MX), España
// y, si no, cualquier otra voz en español que tenga el equipo.
// Importante: nunca se pide un idioma que el equipo no tenga instalado (p. ej.
// "es-AR" en iPhone), porque en ese caso el sistema usa la voz por defecto, que
// suele estar en inglés. En producción se recomienda grabar los audios con una voz humana.
import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import type { Settings } from '../domain/types';
import { toSpeech } from '../domain/speechText';

const PREFERRED = ['es-ar', 'es-419', 'es-us', 'es-mx', 'es-co', 'es-cl', 'es-uy', 'es-es'];
const FALLBACK_LANG = 'es-ES';
const norm = (lang?: string) => (lang ?? '').toLowerCase().replace('_', '-');

function bestSpanish<T>(voices: T[], langOf: (v: T) => string | undefined): T | undefined {
  const es = voices.filter((v) => norm(langOf(v)).startsWith('es'));
  for (const p of PREFERRED) {
    const found = es.find((v) => norm(langOf(v)) === p);
    if (found) return found;
  }
  return es[0];
}

let speaking = false;
const listeners = new Set<(s: boolean) => void>();
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
export const isSpeaking = () => speaking;

// ---------- Web: se usa speechSynthesis directamente con el objeto de voz ----------

const synth = (): SpeechSynthesis | undefined => (typeof window !== 'undefined' ? window.speechSynthesis : undefined);

function webVoice(): SpeechSynthesisVoice | undefined {
  const s = synth();
  if (!s) return undefined;
  // las voces se cargan de forma asíncrona: se consulta cada vez (nunca se guarda una lista vacía)
  return bestSpanish(s.getVoices(), (v) => v.lang);
}
if (Platform.OS === 'web' && synth()) {
  try {
    synth()!.getVoices();
    synth()!.addEventListener?.('voiceschanged', () => synth()!.getVoices());
  } catch {}
}

function webSpeak(text: string, settings: Pick<Settings, 'volume' | 'rate'>, onDone?: () => void) {
  const s = synth();
  if (!s) return onDone?.();
  s.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const v = webVoice();
  try {
    if (v) u.voice = v;
  } catch {}
  u.lang = v?.lang ?? FALLBACK_LANG;
  u.rate = settings.rate;
  u.volume = settings.volume;
  u.pitch = 1.05;
  u.onstart = () => setSpeaking(true);
  u.onend = () => {
    setSpeaking(false);
    onDone?.();
  };
  u.onerror = () => {
    setSpeaking(false);
    onDone?.();
  };
  setSpeaking(true);
  s.speak(u);
}

// ---------- iOS / Android ----------

let nativeVoice: { id: string; lang: string } | undefined;
async function resolveNativeVoice() {
  if (nativeVoice) return nativeVoice;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const v = bestSpanish(voices, (x) => x.language);
    if (v) nativeVoice = { id: v.identifier, lang: v.language }; // si no hay, se vuelve a intentar la próxima vez
  } catch {}
  return nativeVoice;
}

export async function speak(text: string, settings: Pick<Settings, 'voiceEnabled' | 'volume' | 'rate'>, onDone?: () => void) {
  if (!settings.voiceEnabled || !text) {
    onDone?.();
    return;
  }
  const spoken = toSpeech(text);
  if (Platform.OS === 'web') return webSpeak(spoken, settings, onDone);
  const v = await resolveNativeVoice();
  Speech.stop();
  setSpeaking(true);
  Speech.speak(spoken, {
    language: v?.lang ?? FALLBACK_LANG,
    voice: v?.id,
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

let unlocked = false;
/**
 * Safari en iPhone solo permite hablar después de un toque del usuario.
 * Se llama dentro del manejador de un toque para "destrabar" la voz.
 */
export function unlockAudio() {
  if (unlocked) return;
  unlocked = true;
  try {
    if (Platform.OS === 'web') {
      const s = synth();
      if (!s) return;
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      u.lang = webVoice()?.lang ?? FALLBACK_LANG;
      s.speak(u);
    }
  } catch {}
}

export function stopSpeaking() {
  if (Platform.OS === 'web') synth()?.cancel();
  else Speech.stop();
  setSpeaking(false);
}
