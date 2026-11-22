// Reglas de adaptación transparentes. Cada cambio queda registrado con su motivo
// para que un adulto pueda verlo y revertirlo.
import type { ActivityId, Outcome, RuleLog, SkillState } from './types';

export const MAX_SUPPORT = 2;

/** Texto que se muestra a los adultos (fuente única de verdad de las reglas). */
export const RULES_DESCRIPTION: { id: string; title: string; text: string }[] = [
  {
    id: 'masApoyo',
    title: 'Más apoyo ante dificultades reiteradas',
    text:
      'Si dos consignas seguidas quedan sin resolver, o 3 de las últimas 4 necesitaron ayuda o quedaron sin resolver, se suma un nivel de apoyo (menos opciones, audio automático, modelo visible). Si ya tiene el apoyo máximo, se baja un nivel de complejidad.',
  },
  {
    id: 'subirNivel',
    title: 'Aumento gradual de la complejidad',
    text:
      'Si 4 consignas seguidas se resuelven sin pistas y al primer intento, primero se retira apoyo; cuando ya no hay apoyo extra, se sube un nivel.',
  },
  {
    id: 'repaso',
    title: 'Recuperar contenidos en nuevas situaciones',
    text:
      'Cada misión incluye una consigna de repaso: una palabra ya resuelta en otra actividad aparece en un contexto nuevo (por ejemplo, la palabra que armó ahora la lee en una oración), o una consigna del nivel anterior.',
  },
  {
    id: 'ajusteAdulto',
    title: 'Ajuste del adulto',
    text:
      'Un adulto puede fijar nivel y apoyo, bloquear los cambios automáticos o desactivar actividades. Lo que decide el adulto siempre prevalece.',
  },
  {
    id: 'abiertas',
    title: 'Producciones abiertas',
    text:
      'La escritura libre y los relatos orales no se califican como correctos o incorrectos. Se guardan para que un adulto los observe.',
  },
];

const isStruggle = (o: Outcome) => o === 'noResuelto' || o === 'conApoyo';

export interface ApplyResult {
  state: SkillState;
  log?: RuleLog;
}

export function applyOutcome(
  activityId: ActivityId,
  state: SkillState,
  outcome: Outcome,
  maxLevel: number,
  now: string = new Date().toISOString(),
): ApplyResult {
  if (outcome === 'abierta') return { state };
  const recent = [...state.recent, outcome].slice(-6);
  const next: SkillState = { ...state, recent };
  if (state.lockedByAdult) return { state: next };

  const last2 = recent.slice(-2);
  const last4 = recent.slice(-4);
  const from = { level: state.level, support: state.support };

  // Regla 1: más apoyo
  const twoUnresolved = last2.length === 2 && last2.every((o) => o === 'noResuelto');
  const threeOfFourStruggle = last4.length === 4 && last4.filter(isStruggle).length >= 3;
  if (twoUnresolved || threeOfFourStruggle) {
    const reason = twoUnresolved
      ? 'Dos consignas seguidas quedaron sin resolver.'
      : '3 de las últimas 4 consignas necesitaron ayuda o quedaron sin resolver.';
    if (state.support < MAX_SUPPORT) {
      next.support = state.support + 1;
      next.recent = [];
      return { state: next, log: { at: now, activityId, rule: 'masApoyo', from, to: { level: next.level, support: next.support }, reason } };
    }
    if (state.level > 1) {
      next.level = state.level - 1;
      next.support = 1;
      next.recent = [];
      return {
        state: next,
        log: { at: now, activityId, rule: 'bajarNivel', from, to: { level: next.level, support: next.support }, reason: reason + ' Ya tenía el apoyo máximo.' },
      };
    }
    return { state: next };
  }

  // Regla 2: subir gradualmente
  if (last4.length === 4 && last4.every((o) => o === 'autonomo')) {
    const reason = '4 consignas seguidas resueltas sin pistas y al primer intento.';
    if (state.support > 0) {
      next.support = state.support - 1;
      next.recent = [];
      return { state: next, log: { at: now, activityId, rule: 'menosApoyo', from, to: { level: next.level, support: next.support }, reason } };
    }
    if (state.level < maxLevel) {
      next.level = state.level + 1;
      next.recent = [];
      return { state: next, log: { at: now, activityId, rule: 'subirNivel', from, to: { level: next.level, support: next.support }, reason } };
    }
  }
  return { state: next };
}

/** Clasifica un intento cerrado según intentos y ayudas usadas. */
export function classify(resolved: boolean, tries: number, hintsUsed: number, listenedToText = false): Outcome {
  if (!resolved) return 'noResuelto';
  if (tries <= 1 && hintsUsed === 0 && !listenedToText) return 'autonomo';
  return 'conApoyo';
}

export function adultAdjust(
  activityId: ActivityId,
  state: SkillState,
  patch: Partial<Pick<SkillState, 'level' | 'support' | 'enabled' | 'lockedByAdult'>>,
  now: string = new Date().toISOString(),
): ApplyResult {
  const next = { ...state, ...patch, recent: [] };
  return {
    state: next,
    log: {
      at: now,
      activityId,
      rule: 'ajusteAdulto',
      from: { level: state.level, support: state.support },
      to: { level: next.level, support: next.support },
      reason: 'Ajuste realizado por un adulto.',
    },
  };
}
