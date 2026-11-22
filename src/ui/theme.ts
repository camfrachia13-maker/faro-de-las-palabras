import type { Settings } from '../domain/types';

// Paleta cálida: noche marina + luz de faro. Contrastes verificados ≥ 4.5:1 para texto.
const base = {
  bg: '#FFF8EC', // crema
  surface: '#FFFFFF',
  surfaceAlt: '#F6EBD6',
  ink: '#1F2A44', // azul noche (texto)
  inkSoft: '#4A5672',
  sea: '#2D5D8A',
  seaDeep: '#1B3A5C',
  light: '#F2B544', // luz del faro
  lightInk: '#7A4E00',
  coral: '#C85A3F',
  green: '#2F7D5B',
  border: '#E3D3B5',
  focus: '#1B3A5C',
  ok: '#2F7D5B',
  okBg: '#E3F3EA',
  info: '#2D5D8A',
  infoBg: '#E5EEF8',
  warnBg: '#FCEFD6',
};

export type Theme = typeof base & { fs: (n: number) => number; contrast: boolean };

export function makeTheme(s?: Pick<Settings, 'largeText' | 'highContrast'>): Theme {
  const scale = s?.largeText ? 1.2 : 1;
  const c = s?.highContrast
    ? { ...base, bg: '#FFFFFF', surfaceAlt: '#FFFFFF', inkSoft: '#1F2A44', border: '#1F2A44' }
    : base;
  return { ...c, fs: (n: number) => Math.round(n * scale), contrast: !!s?.highContrast };
}

export const radius = { sm: 10, md: 16, lg: 24, xl: 32 };
export const MIN_TOUCH = 56;
