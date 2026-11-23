import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from './src/ui/store';
import {
  CreateProfileScreen,
  GoodbyeScreen,
  MissionEndScreen,
  ProfilesScreen,
  StoryScreen,
  WardrobeScreen,
  WelcomeScreen,
} from './src/ui/screens/Child';
import { ExplorationScreen, MissionScreen } from './src/ui/screens/Mission';
import { MapScreen, ZoneScreen } from './src/ui/screens/WorldMap';
import { AboutScreen, AdultHomeScreen, AdultProfileScreen, GateScreen } from './src/ui/screens/Adult';

function Router() {
  const { route, current } = useStore();
  // pantallas del niño requieren un perfil activo
  const needsProfile = !['profiles', 'createProfile', 'gate', 'adult', 'adultProfile', 'about'].includes(route.name);
  if (needsProfile && !current) return <ProfilesScreen />;
  switch (route.name) {
    case 'profiles':
      return <ProfilesScreen />;
    case 'createProfile':
      return <CreateProfileScreen />;
    case 'welcome':
      return <WelcomeScreen />;
    case 'exploration':
      return <ExplorationScreen />;
    case 'map':
      return <MapScreen />;
    case 'zone':
      return <ZoneScreen zoneId={route.zoneId} />;
    case 'mission':
      return <MissionScreen activityId={route.activityId} />;
    case 'missionEnd':
      return <MissionEndScreen activityId={route.activityId} summary={route.summary} />;
    case 'story':
      return <StoryScreen />;
    case 'wardrobe':
      return <WardrobeScreen />;
    case 'goodbye':
      return <GoodbyeScreen />;
    case 'gate':
      return <GateScreen then={route.then} />;
    case 'adult':
      return <AdultHomeScreen />;
    case 'adultProfile':
      return <AdultProfileScreen profileId={route.profileId} />;
    case 'about':
      return <AboutScreen />;
  }
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="dark" />
        <Router />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
