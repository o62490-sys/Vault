import type { EncryptedVault } from '../types';
import { Preferences } from '@capacitor/preferences';

const VAULT_PREFIX = 'vault_';
const VAULT_NAMES_KEY = 'vault_names';

export const dbService = {
  async getVaultNames(): Promise<string[]> {
    try {
      const { value } = await Preferences.get({ key: VAULT_NAMES_KEY });
      return value ? JSON.parse(value) : [];
    } catch (e) {
      throw new Error(`Failed to get vault names from Capacitor Preferences: ${(e as Error).message}`);
    }
  },

  async saveVaultNames(names: string[]): Promise<void> {
    try {
      await Preferences.set({ key: VAULT_NAMES_KEY, value: JSON.stringify(names) });
    } catch (e) {
      throw new Error(`Failed to save vault names to Capacitor Preferences: ${(e as Error).message}`);
    }
  },

  async getVault(name: string): Promise<EncryptedVault | null> {
    try {
      const { value } = await Preferences.get({ key: `${VAULT_PREFIX}${name}` });
      return value ? JSON.parse(value) : null;
    } catch (e) {
      throw new Error(`Failed to get vault '${name}' from Capacitor Preferences: ${(e as Error).message}`);
    }
  },

  async saveVault(name: string, data: EncryptedVault): Promise<void> {
    try {
      await Preferences.set({ key: `${VAULT_PREFIX}${name}`, value: JSON.stringify(data) });
      const names = await this.getVaultNames();
      if (!names.includes(name)) {
        await this.saveVaultNames([...names, name]);
      }
    } catch (e) {
      throw new Error(`Failed to save vault '${name}' to Capacitor Preferences: ${(e as Error).message}`);
    }
  },

  async deleteVault(name: string): Promise<void> {
    try {
      await Preferences.remove({ key: `${VAULT_PREFIX}${name}` });
      const names = await this.getVaultNames();
      await this.saveVaultNames(names.filter(n => n !== name));
    } catch (e) {
      throw new Error(`Failed to delete vault '${name}' from Capacitor Preferences: ${(e as Error).message}`);
    }
  }
};
