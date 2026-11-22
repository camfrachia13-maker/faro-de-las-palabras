import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ActivityId, AppIndex, Profile } from '../domain/types';
import { newId } from '../domain/profile';
import * as repo from '../storage/repository';
import { makeTheme, Theme } from './theme';
import { stopSpeaking } from '../services/voice';

export type Route =
  | { name: 'profiles' }
  | { name: 'createProfile' }
  | { name: 'welcome' }
  | { name: 'exploration' }
  | { name: 'map' }
  | { name: 'zone'; zoneId: string }
  | { name: 'mission'; activityId: ActivityId }
  | { name: 'missionEnd'; activityId: ActivityId; summary: MissionSummary }
  | { name: 'story' }
  | { name: 'wardrobe' }
  | { name: 'goodbye' }
  | { name: 'gate'; then: Route }
  | { name: 'adult' }
  | { name: 'adultProfile'; profileId: string }
  | { name: 'about' };

export interface MissionSummary {
  items: number;
  autonomo: number;
  conApoyo: number;
  noResuelto: number;
  abierta: number;
  hints: number;
  newReward?: string;
  newPage?: string;
  strategies: string[];
}

interface Store {
  ready: boolean;
  index: AppIndex;
  profiles: Profile[];
  current: Profile | null;
  sessionId: string | null;
  theme: Theme;
  route: Route;
  canGoBack: boolean;
  push: (r: Route) => void;
  replace: (r: Route) => void;
  back: () => void;
  reset: (r: Route) => void;
  selectProfile: (id: string) => void;
  addProfile: (p: Profile) => Promise<void>;
  updateProfile: (id: string, fn: (p: Profile) => Profile) => void;
  updateCurrent: (fn: (p: Profile) => Profile) => void;
  deleteProfile: (id: string) => Promise<void>;
  endSession: () => void;
  setIndex: (idx: AppIndex) => Promise<void>;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [index, setIdx] = useState<AppIndex>({ version: 1, profileIds: [] });
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [stack, setStack] = useState<Route[]>([{ name: 'profiles' }]);
  const profilesRef = useRef(profiles);
  profilesRef.current = profiles;

  useEffect(() => {
    (async () => {
      const idx = await repo.loadIndex();
      const ps = await repo.loadProfiles(idx);
      setIdx(idx);
      setProfiles(ps);
      setReady(true);
    })();
  }, []);

  const persist = useCallback((p: Profile) => {
    repo.saveProfile(p).catch(() => {});
  }, []);

  const updateProfile = useCallback(
    (id: string, fn: (p: Profile) => Profile) => {
      setProfiles((ps) =>
        ps.map((p) => {
          if (p.id !== id) return p;
          const np = fn(p);
          persist(np);
          return np;
        }),
      );
    },
    [persist],
  );

  const current = profiles.find((p) => p.id === currentId) ?? null;

  const endSession = useCallback(() => {
    if (currentId && sessionId) {
      updateProfile(currentId, (p) => ({
        ...p,
        sessions: p.sessions.map((s) => (s.id === sessionId ? { ...s, end: new Date().toISOString() } : s)),
      }));
    }
    setSessionId(null);
  }, [currentId, sessionId, updateProfile]);

  const selectProfile = useCallback(
    (id: string) => {
      const sid = newId();
      setCurrentId(id);
      setSessionId(sid);
      updateProfile(id, (p) => ({ ...p, sessions: [...p.sessions, { id: sid, start: new Date().toISOString(), missions: 0 }].slice(-300) }));
    },
    [updateProfile],
  );

  const addProfile = useCallback(
    async (p: Profile) => {
      const idx = { ...index, profileIds: [...index.profileIds, p.id] };
      await repo.saveProfile(p);
      await repo.saveIndex(idx);
      setIdx(idx);
      setProfiles((ps) => [...ps, p]);
    },
    [index],
  );

  const deleteProfile = useCallback(
    async (id: string) => {
      await repo.deleteProfileData(id);
      const idx = { ...index, profileIds: index.profileIds.filter((x) => x !== id) };
      await repo.saveIndex(idx);
      setIdx(idx);
      setProfiles((ps) => ps.filter((p) => p.id !== id));
      if (currentId === id) {
        setCurrentId(null);
        setSessionId(null);
      }
    },
    [index, currentId],
  );

  const setIndex = useCallback(async (idx: AppIndex) => {
    await repo.saveIndex(idx);
    setIdx(idx);
  }, []);

  const nav = useMemo(
    () => ({
      push: (r: Route) => {
        stopSpeaking();
        setStack((s) => [...s, r]);
      },
      replace: (r: Route) => {
        stopSpeaking();
        setStack((s) => [...s.slice(0, -1), r]);
      },
      back: () => {
        stopSpeaking();
        setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
      },
      reset: (r: Route) => {
        stopSpeaking();
        setStack([r]);
      },
    }),
    [],
  );

  const theme = useMemo(() => makeTheme(current?.settings), [current?.settings]);

  const value: Store = {
    ready,
    index,
    profiles,
    current,
    sessionId,
    theme,
    route: stack[stack.length - 1],
    canGoBack: stack.length > 1,
    ...nav,
    selectProfile,
    addProfile,
    updateProfile,
    updateCurrent: (fn) => currentId && updateProfile(currentId, fn),
    deleteProfile,
    endSession,
    setIndex,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('StoreProvider missing');
  return s;
}
