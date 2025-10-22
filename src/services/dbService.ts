import type { EncryptedVault } from '../types';
import { BaseDirectory, createDir, readTextFile, writeTextFile, removeFile, exists } from '@tauri-apps/api/fs';
import { appDataDir } from '@tauri-apps/api/path';

const VAULT_PREFIX = 'vault_';
const VAULT_NAMES_FILE = 'vault_names.json';

// --- Helper to check if running in Tauri ---
const isTauri = () => '__TAURI__' in window;

// --- Tauri-specific implementation using the filesystem ---
const tauriDb = {
  // Ensure the app data directory exists
  async ensureDir(): Promise<void> {
    try {
      const dirPath = await appDataDir();
      if (!(await exists(dirPath))) {
        await createDir(dirPath, { recursive: true });
      }
    } catch (e) {
      console.error("Failed to create app data directory", e);
    }
  },
  
  async getVaultNames(): Promise<string[]> {
    await this.ensureDir();
    try {
      const content = await readTextFile(VAULT_NAMES_FILE, { dir: BaseDirectory.AppData });
      return JSON.parse(content);
    } catch (e) {
      // File might not exist yet, which is fine
      return [];
    }
  },

  async saveVaultNames(names: string[]): Promise<void> {
    await this.ensureDir();
    await writeTextFile(VAULT_NAMES_FILE, JSON.stringify(names), { dir: BaseDirectory.AppData });
  },

  async getVault(name: string): Promise<EncryptedVault | null> {
    await this.ensureDir();
    try {
      const vaultData = await readTextFile(`${VAULT_PREFIX}${name}.json`, { dir: BaseDirectory.AppData });
      return vaultData ? JSON.parse(vaultData) : null;
    } catch(e) {
      return null;
    }
  },

  async saveVault(name: string, data: EncryptedVault): Promise<void> {
    await this.ensureDir();
    await writeTextFile(`${VAULT_PREFIX}${name}.json`, JSON.stringify(data), { dir: BaseDirectory.AppData });
    const names = await this.getVaultNames();
    if (!names.includes(name)) {
      await this.saveVaultNames([...names, name]);
    }
  },

  async deleteVault(name: string): Promise<void> {
    await this.ensureDir();
    try {
      await removeFile(`${VAULT_PREFIX}${name}.json`, { dir: BaseDirectory.AppData });
    } catch (e) {
      console.error(`Failed to delete vault file for ${name}`, e);
    }
    const names = await this.getVaultNames();
    await this.saveVaultNames(names.filter(n => n !== name));
  }
};

// --- Web-specific (localStorage) implementation (made async for API consistency) ---
const webDb = {
  getVaultNames(): Promise<string[]> {
    const names = localStorage.getItem('vault_names');
    return Promise.resolve(names ? JSON.parse(names) : []);
  },

  saveVaultNames(names: string[]): Promise<void> {
    localStorage.setItem('vault_names', JSON.stringify(names));
    return Promise.resolve();
  },

  getVault(name: string): Promise<EncryptedVault | null> {
    const vaultData = localStorage.getItem(`${VAULT_PREFIX}${name}`);
    return Promise.resolve(vaultData ? JSON.parse(vaultData) : null);
  },

  async saveVault(name: string, data: EncryptedVault): Promise<void> {
    localStorage.setItem(`${VAULT_PREFIX}${name}`, JSON.stringify(data));
    const names = await this.getVaultNames();
    if (!names.includes(name)) {
      await this.saveVaultNames([...names, name]);
    }
  },

  async deleteVault(name: string): Promise<void> {
    localStorage.removeItem(`${VAULT_PREFIX}${name}`);
    const names = await this.getVaultNames();
    await this.saveVaultNames(names.filter(n => n !== name));
  }
};

export const dbService = isTauri() ? tauriDb : webDb;
