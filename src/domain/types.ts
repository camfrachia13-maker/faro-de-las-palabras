// Tipos del dominio educativo. Sin dependencias de interfaz ni de almacenamiento.

export type Area = 'lectura' | 'escritura' | 'oral' | 'cognitivo';

export type ActivityId =
  | 'letraSonido'
  | 'sonidoInicial'
  | 'armarPalabra'
  | 'lecturaPalabras'
  | 'comprension'
  | 'escrituraPalabras'
  | 'mensajes'
  | 'escrituraLibre'
  | 'secuencias'
  | 'categorias'
  | 'memoria'
  | 'flexibilidad'
  | 'planificacion';

/**
 * autonomo: resuelto al primer intento y sin pistas.
 * conApoyo: resuelto con pistas, repeticiones de ayuda o más de un intento.
 * noResuelto: no se resolvió (se mostró un modelo o se saltó).
 * abierta: producción abierta (escritura libre, relato oral) que no se corrige como correcta/incorrecta.
 */
export type Outcome = 'autonomo' | 'conApoyo' | 'noResuelto' | 'abierta';

export type AttemptContext = 'exploracion' | 'mision' | 'repaso';
export type InputMode = 'toque' | 'teclado' | 'voz' | 'oral';

export interface Attempt {
  id: string;
  sessionId: string;
  activityId: ActivityId;
  area: Area;
  level: number;
  support: number;
  itemId: string;
  prompt: string;
  response: string;
  correct: boolean | null;
  tries: number;
  hintsUsed: number;
  instructionRepeats: number;
  listenedToText: boolean;
  outcome: Outcome;
  context: AttemptContext;
  inputMode: InputMode;
  /** Se registra como condición de la actividad; NO se usa como indicador de aprendizaje. */
  durationMs: number;
  at: string;
}

export type WritingHypothesis =
  | 'presilabica'
  | 'silabica'
  | 'silabicoAlfabetica'
  | 'alfabetica'
  | 'sinDatos';

export interface WordAnalysis {
  target: string;
  written: string;
  targetSyllables: number;
  writtenLength: number;
  matchedSyllables: number;
  correctInitial: boolean;
  exact: boolean;
  distance: number;
  hypothesis: WritingHypothesis;
  evidence: string[];
}

export interface WritingSample {
  id: string;
  sessionId: string;
  at: string;
  kind: 'palabra' | 'mensaje' | 'libre';
  activityId: ActivityId;
  prompt: string;
  target?: string;
  text: string;
  revisedText?: string;
  revisionChecks?: string[];
  context: AttemptContext;
  analysis?: WordAnalysis;
  supportsUsed: string[];
}

export interface Observation {
  id: string;
  at: string;
  area: Area | 'general';
  text: string;
}

export type RuleId = 'masApoyo' | 'menosApoyo' | 'subirNivel' | 'bajarNivel' | 'ajusteAdulto' | 'exploracion';

export interface RuleLog {
  at: string;
  activityId: ActivityId;
  rule: RuleId;
  from: { level: number; support: number };
  to: { level: number; support: number };
  reason: string;
}

export interface SkillState {
  level: number; // 1..maxLevel
  support: number; // 0 = estándar, 1 = apoyo, 2 = apoyo intenso
  enabled: boolean;
  lockedByAdult: boolean;
  recent: Outcome[]; // ventana de resultados desde el último cambio
}

export interface Settings {
  volume: number; // 0..1
  rate: number; // 0.6..1.2
  voiceEnabled: boolean;
  autoRead: boolean;
  reduceMotion: boolean;
  largeText: boolean;
  highContrast: boolean;
  letterCase: 'mayuscula' | 'minuscula';
  recordingAllowed: boolean;
  /** Efectos de sonido (encaje, acierto). */
  sfx: boolean;
  /** Lumi habla menos: solo la consigna, sin comentarios extra. */
  guideBrief: boolean;
}

export interface AvatarConfig {
  base: number; // forma/criatura
  color: number;
  accessory: string | null;
}

export interface SessionLog {
  id: string;
  start: string;
  end?: string;
  missions: number;
}

export interface ExplorationResult {
  at: string;
  reading: { correct: number; total: number; skipped: number; byTask: Record<string, Outcome> };
  writing: { samples: number; hypothesis: WritingHypothesis; confidence: 'baja' | 'media' };
  startLevels: Partial<Record<ActivityId, number>>;
}

export interface Profile {
  id: string;
  alias: string;
  avatar: AvatarConfig;
  createdAt: string;
  welcomed: boolean;
  exploration?: ExplorationResult;
  skills: Record<ActivityId, SkillState>;
  attempts: Attempt[];
  samples: WritingSample[];
  observations: Observation[];
  ruleLog: RuleLog[];
  rewards: { unlocked: string[]; storyPages: number; shells: number };
  missionsCompleted: number;
  zonesVisited: string[];
  sessions: SessionLog[];
  settings: Settings;
  adultHypothesis?: { value: WritingHypothesis; note: string; at: string };
  /** Actividades cuya demostración ya se vio. */
  demosSeen?: ActivityId[];
}

export interface AppIndex {
  version: 1;
  profileIds: string[];
  pinHash?: string;
  pinSalt?: string;
}
