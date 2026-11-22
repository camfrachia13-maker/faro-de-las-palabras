import type { ConfigContext, ExpoConfig } from 'expo/config';

// En GitHub Pages la app vive en /<nombre-del-repo>/; el workflow define EXPO_BASE_URL.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  experiments: {
    ...config.experiments,
    baseUrl: process.env.EXPO_BASE_URL || undefined,
  },
});
