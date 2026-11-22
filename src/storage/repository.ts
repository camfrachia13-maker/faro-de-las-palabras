// Persistencia local (AsyncStorage: en iOS/Android queda en el dispositivo;
// en la vista web usa localStorage del navegador). Sin servidores ni rastreadores.
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import type { AppIndex, Profile } from '../domain/types';
import { DEFAULT_SETTINGS } from '../domain/profile';

// Respaldo en memoria si el almacenamiento no está disponible (p. ej. visores web restringidos).
const memory = new Map<string, string>();
const store = {
  async getItem(k: string) {
    try {
      return await AsyncStorage.getItem(k);
    } catch {
      return memory.get(k) ?? null;
    }
  },
  async setItem(k: string, v: string) {
    try {
      await AsyncStorage.setItem(k, v);
    } catch {
      memory.set(k, v);
    }
  },
  async removeItem(k: string) {
    memory.delete(k);
    try {
      await AsyncStorage.removeItem(k);
    } catch {}
  },
};

const INDEX_KEY = 'faro:v1:index';
const profileKey = (id: string) => `faro:v1:profile:${id}`;

export async function loadIndex(): Promise<AppIndex> {
  try {
    const raw = await store.getItem(INDEX_KEY);
    if (raw) return JSON.parse(raw) as AppIndex;
  } catch {}
  return { version: 1, profileIds: [] };
}

export async function saveIndex(idx: AppIndex) {
  await store.setItem(INDEX_KEY, JSON.stringify(idx));
}

export async function loadProfiles(idx: AppIndex): Promise<Profile[]> {
  const out: Profile[] = [];
  for (const id of idx.profileIds) {
    try {
      const raw = await store.getItem(profileKey(id));
      if (raw) {
        const p = JSON.parse(raw) as Profile;
        p.settings = { ...DEFAULT_SETTINGS, ...p.settings };
        out.push(p);
      }
    } catch {}
  }
  return out;
}

export async function saveProfile(p: Profile) {
  await store.setItem(profileKey(p.id), JSON.stringify(p));
}

export async function deleteProfileData(id: string) {
  await store.removeItem(profileKey(id));
}

export async function hashPin(pin: string, salt: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${pin}`);
}

export function makeSalt() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
