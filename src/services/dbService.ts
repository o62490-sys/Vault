import type { EncryptedVault } from '../types';

const VAULT_PREFIX = 'vault_';
const VAULT_NAMES_FILE = 'vault_names.json';

// --- Helper to check if running in Tauri ---
const isTauri = () => typeof window !== 'undefined' && '__TAURI__' in window;

// --- Helper to check if running in Electron ---
const isElectron = () => typeof window !== 'undefined' && 'electronAPI' in window;

// --- Tauri-specific implementation ---
const tauriDb = {
  async ensureDir(): Promise<void> {
    try {
      // @ts-ignore - Tauri modules are externalized in vite config
      const { appDataDir } = await import('@tauri-apps/api/path');
      // @ts-ignore
      const { mkdir, exists } = await import('@tauri-apps/plugin-fs');

      const dirPath = await appDataDir();
      if (!(await exists(dirPath))) {
        await mkdir(dirPath, { recursive: true });
      }
    } catch (e) {
      console.error('Failed to create app data directory', e);
    }
  },

  async getVaultNames(): Promise<string[]> {
    await this.ensureDir();
    try {
      // @ts-ignore
      const { readTextFile } = await import('@tauri-apps/plugin-fs');
      // @ts-ignore
      const { BaseDirectory } = await import('@tauri-apps/api/path');
      const content = await readTextFile(VAULT_NAMES_FILE, { baseDir: BaseDirectory.AppData });
      return JSON.parse(content);
    } catch (e) {
      return [];
    }
  },

  async saveVaultNames(names: string[]): Promise<void> {
    await this.ensureDir();
    // @ts-ignore
    const { writeTextFile } = await import('@tauri-apps/plugin-fs');
    // @ts-ignore
    const { BaseDirectory } = await import('@tauri-apps/api/path');
    await writeTextFile(VAULT_NAMES_FILE, JSON.stringify(names), { baseDir: BaseDirectory.AppData });
  },

  async getVault(name: string): Promise<EncryptedVault | null> {
    await this.ensureDir();
    try {
      // @ts-ignore
      const { readTextFile } = await import('@tauri-apps/plugin-fs');
      // @ts-ignore
      const { BaseDirectory } = await import('@tauri-apps/api/path');
      const data = await readTextFile(`${VAULT_PREFIX}${name}.json`, { baseDir: BaseDirectory.AppData });
      return JSON.parse(data);
    } catch (e) {
      return null;
    }
  },

  async saveVault(name: string, data: EncryptedVault): Promise<void> {
    await this.ensureDir();
    // @ts-ignore
    const { writeTextFile } = await import('@tauri-apps/plugin-fs');
    // @ts-ignore
    const { BaseDirectory } = await import('@tauri-apps/api/path');
    await writeTextFile(`${VAULT_PREFIX}${name}.json`, JSON.stringify(data), { baseDir: BaseDirectory.AppData });

    const names = await this.getVaultNames();
    if (!names.includes(name)) {
      await this.saveVaultNames([...names, name]);
    }
  },

  async deleteVault(name: string): Promise<void> {
    await this.ensureDir();
    try {
      // @ts-ignore
      const { remove } = await import('@tauri-apps/plugin-fs');
      // @ts-ignore
      const { BaseDirectory } = await import('@tauri-apps/api/path');
      await remove(`${VAULT_PREFIX}${name}.json`, { baseDir: BaseDirectory.AppData });
    } catch (e) {
      console.error(`Failed to delete vault file for ${name}`, e);
    }

    const names = await this.getVaultNames();
    await this.saveVaultNames(names.filter(n => n !== name));
  }
};

// --- Electron-specific implementation ---
const electronDb = {
  async getVaultNames(): Promise<string[]> {
    try {
      const appDataPath = await window.electronAPI.getAppPath('appData');
      const vaultNamesPath = await window.electronAPI.pathJoin(appDataPath, 'react-vault-manager', VAULT_NAMES_FILE);

      if (await window.electronAPI.fileExists(vaultNamesPath)) {
        const content = await window.electronAPI.readFile(vaultNamesPath);
        return JSON.parse(content);
      }
      return [];
    } catch (e) {
      console.error('Failed to get vault names', e);
      return [];
    }
  },

  async saveVaultNames(names: string[]): Promise<void> {
    try {
      const appDataPath = await window.electronAPI.getAppPath('appData');
      const vaultDir = await window.electronAPI.pathJoin(appDataPath, 'react-vault-manager');
      const vaultNamesPath = await window.electronAPI.pathJoin(vaultDir, VAULT_NAMES_FILE);

      await window.electronAPI.makeDirectory(vaultDir);
      await window.electronAPI.writeFile(vaultNamesPath, JSON.stringify(names));
    } catch (e) {
      console.error('Failed to save vault names', e);
    }
  },

  async getVault(name: string): Promise<EncryptedVault | null> {
    try {
      const appDataPath = await window.electronAPI.getAppPath('appData');
      const vaultPath = await window.electronAPI.pathJoin(appDataPath, 'react-vault-manager', `${VAULT_PREFIX}${name}.json`);

      if (await window.electronAPI.fileExists(vaultPath)) {
        const vaultData = await window.electronAPI.readFile(vaultPath);
        return JSON.parse(vaultData);
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  async saveVault(name: string, data: EncryptedVault): Promise<void> {
    try {
      const appDataPath = await window.electronAPI.getAppPath('appData');
      const vaultDir = await window.electronAPI.pathJoin(appDataPath, 'react-vault-manager');
      const vaultPath = await window.electronAPI.pathJoin(vaultDir, `${VAULT_PREFIX}${name}.json`);

      await window.electronAPI.makeDirectory(vaultDir);
      await window.electronAPI.writeFile(vaultPath, JSON.stringify(data));

      const names = await this.getVaultNames();
      if (!names.includes(name)) {
        await this.saveVaultNames([...names, name]);
      }
    } catch (e) {
      console.error('Failed to save vault', e);
    }
  },

  async deleteVault(name: string): Promise<void> {
    try {
      const appDataPath = await window.electronAPI.getAppPath('appData');
      const vaultPath = await window.electronAPI.pathJoin(appDataPath, 'react-vault-manager', `${VAULT_PREFIX}${name}.json`);

      if (await window.electronAPI.fileExists(vaultPath)) {
        await window.electronAPI.deleteFile(vaultPath);
      }

      const names = await this.getVaultNames();
      await this.saveVaultNames(names.filter(n => n !== name));
    } catch (e) {
      console.error(`Failed to delete vault file for ${name}`, e);
    }
  }
};

// --- Web-specific implementation using localStorage ---
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

// --- Export correct DB implementation ---
let dbService: typeof tauriDb | typeof electronDb | typeof webDb;

if (isTauri()) {
  dbService = tauriDb;
} else if (isElectron()) {
  dbService = electronDb;
} else {
  dbService = webDb;
}

export { dbService };
