export interface BiometricResult {
  success: boolean;
  error?: string;
}

// Check if we're running on a Capacitor platform (exclude Electron and Tauri)
const isCapacitor = !!(window as any).Capacitor && !(window as any).__TAURI__ && !((window as any).process && (window as any).process.type);

let biometricService: {
  isAvailable(): Promise<boolean>;
  authenticate(reason?: string): Promise<BiometricResult>;
  getBiometryType(): Promise<string>;
};

// Initialize service based on platform
if (isCapacitor) {
  // For Capacitor platforms, we'll use dynamic import
  biometricService = {
    async isAvailable(): Promise<boolean> {
      try {
        const { BiometricAuth, BiometryType } = await import('@aparajita/capacitor-biometric-auth');
        console.log('Checking biometry availability...');
        const result = await BiometricAuth.checkBiometry();
        console.log('Biometry check result:', result);
        const available = result.isAvailable && result.biometryType !== BiometryType.none;
        console.log('Biometry available:', available);
        return available;
      } catch (error) {
        console.warn('Biometric check failed:', error);
        return false;
      }
    },

    async authenticate(reason: string = 'Authenticate to unlock vault'): Promise<BiometricResult> {
      try {
        const { BiometricAuth } = await import('@aparajita/capacitor-biometric-auth');
        await BiometricAuth.authenticate({
          reason,
          cancelTitle: 'Cancel',
          iosFallbackTitle: 'Use Passcode',
          androidTitle: 'Authentication Required',
          androidSubtitle: reason,
          allowDeviceCredential: true, // Allow PIN/pattern/password as fallback
        });

        return { success: true };
      } catch (error: any) {
        console.error('Authentication failed:', error);
        return {
          success: false,
          error: error.message || 'Authentication failed'
        };
      }
    },

    async getBiometryType(): Promise<string> {
      try {
        const { BiometricAuth, BiometryType } = await import('@aparajita/capacitor-biometric-auth');
        const result = await BiometricAuth.checkBiometry();
        return BiometryType[result.biometryType] || 'none';
      } catch (error) {
        return 'none';
      }
    }
  };
} else {
  // Fallback for non-Capacitor platforms (Electron, web)
  biometricService = {
    async isAvailable(): Promise<boolean> {
      console.log('Biometrics not available on this platform');
      return false;
    },

    async authenticate(reason?: string): Promise<BiometricResult> {
      console.log('Biometric authentication not available on this platform');
      return {
        success: false,
        error: 'Biometric authentication not available on this platform'
      };
    },

    async getBiometryType(): Promise<string> {
      return 'none';
    }
  };
}

export { biometricService };
