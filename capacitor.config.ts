import type { CapacitorConfig } from '@capacitor/cli';



const config: CapacitorConfig = {
  appId: 'com.magster.app',
  appName: 'Magster',
  webDir: 'dist/client',
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#000000',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    SplashScreen: {
      launchAutoHide: false,
    },
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
