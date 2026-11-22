// Universo narrativo: personajes, zonas, historia y recompensas.
import type { ActivityId, Area } from '../domain/types';

export const APP_NAME = 'El Faro de las Palabras';

export interface Character {
  id: 'lumi' | 'tito' | 'mara' | 'bruno';
  name: string;
  role: string;
  story: string;
  color: string;
}

export const CHARACTERS: Record<Character['id'], Character> = {
  lumi: {
    id: 'lumi',
    name: 'Lumi',
    role: 'Luciérnaga guardiana del faro',
    story: 'Una tormenta apagó el faro y desparramó las palabras por el archipiélago. Lumi te guía para recuperarlas.',
    color: '#F2B544',
  },
  tito: {
    id: 'tito',
    name: 'Tito',
    role: 'Tortuga cartera de la Bahía',
    story: 'Tito reparte cartas entre las islas, pero el viento le mezcló las letras. Necesita ayuda para escribir mensajes.',
    color: '#3E9C7A',
  },
  mara: {
    id: 'mara',
    name: 'Mara',
    role: 'Gaviota que junta cuentos',
    story: 'Mara guarda los cuentos del bosque en su nido. Le encanta escuchar cómo los contás vos.',
    color: '#5B7FD6',
  },
  bruno: {
    id: 'bruno',
    name: 'Bruno',
    role: 'Pulpo que arregla el faro',
    story: 'Bruno tiene ocho brazos y mil ideas. Arma desafíos para volver a encender la luz del faro.',
    color: '#D9705A',
  },
};

export interface Zone {
  id: string;
  name: string;
  area: Area;
  host: Character['id'];
  description: string;
  activities: ActivityId[];
  unlockAtMissions: number; // se desbloquea por participar, no por aciertos
  pos: { x: number; y: number }; // posición relativa en el mapa (0..1)
}

export const ZONES: Zone[] = [
  {
    id: 'sonidos',
    name: 'Isla de los Sonidos',
    area: 'lectura',
    host: 'lumi',
    description: 'Letras, sonidos y palabras para leer.',
    activities: ['letraSonido', 'sonidoInicial', 'armarPalabra', 'lecturaPalabras'],
    unlockAtMissions: 0,
    pos: { x: 0.27, y: 0.24 },
  },
  {
    id: 'bahia',
    name: 'Bahía de las Cartas',
    area: 'escritura',
    host: 'tito',
    description: 'Escribir palabras, mensajes y cartas.',
    activities: ['escrituraPalabras', 'mensajes', 'escrituraLibre'],
    unlockAtMissions: 0,
    pos: { x: 0.73, y: 0.46 },
  },
  {
    id: 'bosque',
    name: 'Bosque de los Cuentos',
    area: 'oral',
    host: 'mara',
    description: 'Escuchar, contar y ordenar historias.',
    activities: ['comprension', 'secuencias', 'categorias'],
    unlockAtMissions: 2,
    pos: { x: 0.27, y: 0.68 },
  },
  {
    id: 'torre',
    name: 'Torre del Faro',
    area: 'cognitivo',
    host: 'bruno',
    description: 'Desafíos para pensar, recordar y planificar.',
    activities: ['memoria', 'flexibilidad', 'planificacion'],
    unlockAtMissions: 4,
    pos: { x: 0.73, y: 0.86 },
  },
];

/** Páginas de la historia del faro: se recuperan una por misión terminada. */
export const STORY_PAGES: string[] = [
  'Había una vez un faro que iluminaba un archipiélago lleno de palabras.',
  'Una noche de tormenta, el viento sopló tan fuerte que las palabras volaron por el aire.',
  'Algunas cayeron en la Isla de los Sonidos y se quedaron sin voz.',
  'Otras llegaron a la Bahía, donde Tito las guardó en su bolsa de cartas.',
  'Mara encontró cuentos enredados entre las ramas del bosque.',
  'Bruno subió a la torre y vio que la lámpara necesitaba ideas nuevas para brillar.',
  'Con cada palabra recuperada, la luz del faro se hacía un poquito más fuerte.',
  'Y así, entre todos, el archipiélago volvió a llenarse de historias.',
];

export interface RewardItem {
  id: string;
  name: string;
  kind: 'accesorio';
}

/** Se desbloquean en orden al participar (una cada misión), nunca se pierden. */
export const REWARDS: RewardItem[] = [
  { id: 'gorro', name: 'Gorro marinero', kind: 'accesorio' },
  { id: 'bufanda', name: 'Bufanda de rayas', kind: 'accesorio' },
  { id: 'anteojos', name: 'Anteojos de explorador', kind: 'accesorio' },
  { id: 'corona', name: 'Corona de caracoles', kind: 'accesorio' },
  { id: 'farol', name: 'Farolito', kind: 'accesorio' },
  { id: 'flor', name: 'Flor en la oreja', kind: 'accesorio' },
];

export const AVATAR_BASES = ['Pingüino', 'Zorrito', 'Gatita', 'Ranita', 'Robot', 'Búho'];
export const AVATAR_COLORS: { name: string; hex: string }[] = [
  { name: 'Naranja', hex: '#E8833A' },
  { name: 'Azul', hex: '#4A78C9' },
  { name: 'Verde', hex: '#4E9F6B' },
  { name: 'Violeta', hex: '#8A63C2' },
  { name: 'Rojo', hex: '#C9504A' },
  { name: 'Turquesa', hex: '#2E9BA6' },
];

export const GUIDE_LINES = {
  welcomeNew: (alias: string) =>
    `¡Hola, ${alias}! Soy Lumi, la luciérnaga del faro. Una tormenta desparramó las palabras por las islas. ¿Me ayudás a recuperarlas?`,
  welcomeBack: (alias: string) => `¡Qué bueno verte otra vez, ${alias}! Seguimos donde quedamos.`,
  explorationIntro:
    'Antes de salir de viaje, quiero conocerte un poco. Vamos a jugar con letras, palabras y dibujos. Si algo no lo sabés, podés tocar "Saltar". ¡No pasa nada!',
  explorationEnd: 'Gracias por jugar conmigo. Ya armé tu mapa de viaje.',
  mapHint: 'Tocá una isla para ver sus misiones.',
  goodbye: (alias: string) => `Guardé todo lo que hiciste, ${alias}. Cuando quieras, seguimos la aventura.`,
};
