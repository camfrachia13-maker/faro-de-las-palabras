import { ACTIVITIES, ACTIVITY_IDS } from '../content/activities';
import { REWARDS, STORY_PAGES } from '../content/world';
import { applyOutcome } from './adaptation';
import type { ActivityId, Attempt, AvatarConfig, Profile, Settings, SkillState, WritingSample } from './types';

export const DEFAULT_SETTINGS: Settings = {
  volume: 0.9,
  rate: 0.9,
  voiceEnabled: true,
  autoRead: true,
  reduceMotion: false,
  largeText: false,
  highContrast: false,
  letterCase: 'mayuscula',
  recordingAllowed: false,
  sfx: true,
  guideBrief: false,
};

export const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export function createProfile(alias: string, avatar: AvatarConfig): Profile {
  const skills = {} as Record<ActivityId, SkillState>;
  for (const id of ACTIVITY_IDS) skills[id] = { level: 1, support: 0, enabled: true, lockedByAdult: false, recent: [] };
  return {
    id: newId(),
    alias: alias.trim().slice(0, 16),
    avatar,
    createdAt: new Date().toISOString(),
    welcomed: false,
    skills,
    attempts: [],
    samples: [],
    observations: [],
    ruleLog: [],
    rewards: { unlocked: [], storyPages: 0, shells: 0 },
    missionsCompleted: 0,
    zonesVisited: [],
    sessions: [],
    settings: { ...DEFAULT_SETTINGS },
  };
}

/** Registra un intento y aplica las reglas de adaptación (salvo en exploración). */
export function recordAttempt(p: Profile, a: Attempt): Profile {
  const attempts = [...p.attempts, a].slice(-3000);
  if (a.context === 'exploracion') return { ...p, attempts };
  const def = ACTIVITIES[a.activityId];
  const res = applyOutcome(a.activityId, p.skills[a.activityId], a.outcome, def.maxLevel, a.at);
  return {
    ...p,
    attempts,
    skills: { ...p.skills, [a.activityId]: res.state },
    ruleLog: res.log ? [...p.ruleLog, res.log].slice(-500) : p.ruleLog,
  };
}

export function recordSample(p: Profile, s: WritingSample): Profile {
  return { ...p, samples: [...p.samples, s].slice(-500) };
}

/** Recompensas por participar: nunca dependen de acertar ni se pierden. */
export function completeMission(p: Profile): { profile: Profile; newReward?: string; newPage?: string } {
  const missions = p.missionsCompleted + 1;
  const nextReward = REWARDS.find((r) => !p.rewards.unlocked.includes(r.id));
  const pageIdx = p.rewards.storyPages;
  const givePage = pageIdx < STORY_PAGES.length;
  const giveReward = !!nextReward && missions % 2 === 1;
  return {
    profile: {
      ...p,
      missionsCompleted: missions,
      rewards: {
        shells: p.rewards.shells + 1,
        storyPages: givePage ? pageIdx + 1 : pageIdx,
        unlocked: giveReward && nextReward ? [...p.rewards.unlocked, nextReward.id] : p.rewards.unlocked,
      },
    },
    newReward: giveReward ? nextReward?.name : undefined,
    newPage: givePage ? STORY_PAGES[pageIdx] : undefined,
  };
}

/** Palabras que el niño ya resolvió sin ayuda en alguna actividad (para repaso). */
export function masteredWords(p: Profile): string[] {
  const set = new Set<string>();
  for (const a of p.attempts.slice(-200)) {
    if ((a.outcome === 'autonomo' || a.outcome === 'conApoyo') && a.correct && /^[a-zñáéíóú]+$/.test(a.prompt)) set.add(a.prompt);
  }
  return [...set];
}
