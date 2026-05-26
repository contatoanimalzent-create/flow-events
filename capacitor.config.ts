import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.animalzgroup.pulse',
  appName: 'Pulse',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    // Em producao, descomente para carregar do dominio:
    // url: 'https://pulse.animalzgroup.com',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    backgroundColor: '#060d1fff',
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#060d1fff',
    limitsNavigationsToAppBoundDomains: false,
    scrollEnabled: true,
    preferredContentMode: 'mobile',
  },
  plugins: {
    Camera: {
      permissions: ['camera'],
      androidScaleType: 'CENTER_CROP',
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
      launchFadeOutDuration: 300,
      backgroundColor: '#060d1fff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#060d1fff',
      overlaysWebView: false,
    },
    Keyboard: {
      resize: 'body',
      style: 'DARK',
      resizeOnFullScreen: true,
    },
    Network: {},
  },
}

export default config
