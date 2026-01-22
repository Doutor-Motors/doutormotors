import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.doutormotors.app',
  appName: 'Doutor Motors',
  webDir: 'dist',

  // Server configuration
  server: {
    androidScheme: 'https',
    cleartext: true
  },

  // Plugin configurations
  plugins: {
    // Bluetooth Serial plugin configuration
    BluetoothSerial: {
      // No specific configuration needed
    },

    // Splash Screen configuration
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0A0F1C',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      spinnerColor: '#3B82F6',
    },

    // Status Bar configuration
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#0A0F1C',
    },
  },

  // Android specific configuration
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true, // Set to false for production
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
    }
  },

  // iOS specific configuration
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: true,
    scrollEnabled: true,
  },
};

export default config;
