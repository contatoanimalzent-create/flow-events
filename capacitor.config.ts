import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'br.com.flowevents.pulse',
  appName: 'Flow Events',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // In production native builds, load from the live domain
    // url: 'https://pulse.animalzgroup.com', // uncomment when building for stores
    cleartext: false,
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    Camera: {
      permissions: ['camera'],
    },
    Geolocation: {
      permissions: ['location'],
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#060d1f',
      androidSplashResourceName: 'splash',
      showSpinnerOnFullScreen: false,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#060d1f',
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
  },
}

export default config
