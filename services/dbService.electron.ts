import type { EncryptedVault } from '../types';

// Extend the Window interface to include the electronAPI exposed by the preload script
declare global {
  interface Window {
    electronAPI: {
      getAppPath: (name: string) => Promise<string>;
      pathJoin: (...args: string[]) => Promise<string>;
      sqlite: {
        open: (dbPath: string) => Promise<{ success: boolean }>;
        run: (sql: string, params?: any[]) => Promise<{ success: boolean; changes: number; lastID: number }>;
        get: (sql: string, params?: any[]) => Promise<{ success: boolean; row: any }>;
        all: (sql: string, params?: any[]) => Promise<{ success: boolean; rows: any[] }>;
      };
    };
  }
}

// Make sure TypeScript knows about the global interface
export {};

const VAULT_DB_NAME = 'vaults.db';
const VAULT_TABLE_NAME = 'vaults';
const VAULT_NAMES_TABLE_NAME = 'vault_names';

let dbInitializedPromise: Promise<void> | null = null;

async function initializeDb(): Promise<void> {
  if (!dbInitializedPromise) {
    dbInitializedPromise = (async () => {
      if (window.electronAPI?.sqlite) {
        const userDataPath = await window.electronAPI.getAppPath('userData');
        const dbPath = await window.electronAPI.pathJoin(userDataPath, VAULT_DB_NAME);
        console.log(`Electron DB Service: Opening database at: ${dbPath}`);
        const { success } = await window.electronAPI.sqlite.open(dbPath);
        if (!success) {
          throw new Error("Failed to open Electron database.");
        }
      } else {
        console.warn("Electron SQLite API not available. Using fallback behavior.");
      }
    })();
  }
  return dbInitializedPromise;
}

export const dbService = {
  async getVaultNames(): Promise<string[]> {
    await initializeDb();
    if (!window.electronAPI?.sqlite) {
      return []; // Return empty array if not in Electron environment
    }
    try {
      const { rows } = await window.electronAPI!.sqlite.all(`SELECT name FROM ${VAULT_NAMES_TABLE_NAME}`);
      return rows.map((row: any) => row.name);
    } catch (e) {
      throw new Error(`Failed to get vault names from Electron DB: ${(e as Error).message}`);
    }
  },

  async saveVaultNames(names: string[]): Promise<void> {
    await initializeDb();
    if (!window.electronAPI?.sqlite) {
      return; // Silently return if not in Electron environment
    }
    try {
      await window.electronAPI!.sqlite.run(`DELETE FROM ${VAULT_NAMES_TABLE_NAME}`);
      for (const name of names) {
        await window.electronAPI!.sqlite.run(`INSERT OR IGNORE INTO ${VAULT_NAMES_TABLE_NAME} (name) VALUES (?)`, [name]);
      }
    } catch (e) {
      throw new Error(`Failed to save vault names to Electron DB: ${(e as Error).message}`);
    }
  },

  async getVault(name: string): Promise<EncryptedVault | null> {
    await initializeDb();
    if (!window.electronAPI?.sqlite) {
      return null; // Return null if not in Electron environment
    }
    try {
      const { row } = await window.electronAPI!.sqlite.get(`SELECT data FROM ${VAULT_TABLE_NAME} WHERE name = ?`, [name]);
      return row ? JSON.parse(row.data) : null;
    } catch (e) {
      throw new Error(`Failed to get vault '${name}' from Electron DB: ${(e as Error).message}`);
    }
  },

  async saveVault(name: string, data: EncryptedVault): Promise<void> {
    await initializeDb();
    if (!window.electronAPI?.sqlite) {
      console.warn("Cannot save vault: Electron SQLite API not available");
      return;
    }
    try {
      await window.electronAPI.sqlite.run(`INSERT OR REPLACE INTO ${VAULT_TABLE_NAME} (name, data) VALUES (?, ?)`, [name, JSON.stringify(data)]);
      const names = await this.getVaultNames();
      if (!names.includes(name)) {
        await this.saveVaultNames([...names, name]);
      }
    } catch (e) {
      throw new Error(`Failed to save vault '${name}' to Electron DB: ${(e as Error).message}`);
    }
  },

  async deleteVault(name: string): Promise<void> {
    await initializeDb();
    if (!window.electronAPI?.sqlite) {
      console.warn("Cannot delete vault: Electron SQLite API not available");
      return;
    }
    try {
      await window.electronAPI.sqlite.run(`DELETE FROM ${VAULT_TABLE_NAME} WHERE name = ?`, [name]);
      const names = await this.getVaultNames();
      await this.saveVaultNames(names.filter(n => n !== name));
    } catch (e) {
      throw new Error(`Failed to delete vault '${name}' from Electron DB: ${(e as Error).message}`);
    }
  }
};
