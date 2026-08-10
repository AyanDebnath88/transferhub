import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.transferhub',
  appName: 'TransferHub',
  // Bundled static build (offline fallback / app-store review build)
  webDir: 'dist',
  // Live content: native shell loads the deployed site so news stays fresh.
  // Comment out `server` to ship the bundled `dist` snapshot instead.
  server: {
    url: 'https://transferhub.vercel.app',
    cleartext: false,
  },
  backgroundColor: '#f9fafb',
  ios: {
    contentInset: 'always',
  },
  android: {
    backgroundColor: '#f9fafb',
  },
};

export default config;
