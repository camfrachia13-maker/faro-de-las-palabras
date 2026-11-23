// Efectos de sonido breves y suaves (sin chicharras de error). Se desactivan
// desde Ajustes ("Efectos de sonido"). La app no tiene música de fondo.
import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import type { Settings } from '../domain/types';

const SOURCES = {
  tap: require('../../assets/sfx/tap.wav'),
  encaje: require('../../assets/sfx/encaje.wav'),
  acierto: require('../../assets/sfx/acierto.wav'),
  otra: require('../../assets/sfx/otra.wav'),
  premio: require('../../assets/sfx/premio.wav'),
};
export type Sfx = keyof typeof SOURCES;

const players: Partial<Record<Sfx, AudioPlayer>> = {};

export function playSfx(name: Sfx, settings: Pick<Settings, 'sfx' | 'volume'>) {
  if (!settings.sfx) return;
  try {
    let p = players[name];
    if (!p) {
      p = createAudioPlayer(SOURCES[name]);
      players[name] = p;
    }
    p.volume = Math.min(1, settings.volume * 0.8);
    p.seekTo(0);
    p.play();
  } catch {
    // sin audio disponible: la respuesta visual igual aparece
  }
}
