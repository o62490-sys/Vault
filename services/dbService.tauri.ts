import type { EncryptedVault } from '../types';
import Database from '@tauri-apps/plugin-sql';

const VAULT_DB_NAME = 'vaults.db';
const VAULT_TABLE_NAME = 'vaults';
const VAULT_NAMES_TABLE_NAME = 'vault_names';

let dbInstance: Database | null = null;
let dbInitializedPromise: Promise<void> | null = null;

async function getDb(): Promise<Database> {
  if (!dbInitializedPromise) {
    dbInitializedPromise = (async () => {
      try {
        const dbPath = VAULT_DB_NAME;
        console.log("Tauri DB Path:", dbPath); // Add this line for debugging
        dbInstance = await Database.load(`sqlite:${dbPath}`);
        // Initialize schema if not already done
        await dbInstance.execute(`
          CREATE TABLE IF NOT EXISTS ${VAULT_TABLE_NAME} (
            name TEXT PRIMARY KEY,
            data TEXT
          )
        `);
        await dbInstance.execute(`
          CREATE TABLE IF NOT EXISTS ${VAULT_NAMES_TABLE_NAME} (
            name TEXT PRIMARY KEY
          )
        `);
      } catch (e) {
        dbInitializedPromise = null; // Allow retry on error
        throw new Error(`Failed to initialize Tauri database: ${(e as Error).message}`);
      }
    })();
  }
  await dbInitializedPromise;
  if (!dbInstance) {
    throw new Error("Tauri database instance is null after initialization.");
  }
  return dbInstance;
}

export const dbService = {
  async getVaultNames(): Promise<string[]> {
    try {
      const db = await getDb();
      const rows = await db.select(`SELECT name FROM ${VAULT_NAMES_TABLE_NAME}`);
      return (rows as any[]).map((row: any) => row.name);
    } catch (e) {
      throw new Error(`Failed to get vault names from Tauri DB: ${(e as Error).message}`);
    }
  },

  async saveVaultNames(names: string[]): Promise<void> {
    try {
      const db = await getDb();
      await db.execute(`DELETE FROM ${VAULT_NAMES_TABLE_NAME}`);
      for (const name of names) {
        await db.execute(`INSERT OR IGNORE INTO ${VAULT_NAMES_TABLE_NAME} (name) VALUES (?)`, [name]);
      }
    } catch (e) {
      throw new Error(`Failed to save vault names to Tauri DB: ${(e as Error).message}`);
    }
  },

  async getVault(name: string): Promise<EncryptedVault | null> {
    try {
      const db = await getDb();
      const row = await db.select(`SELECT data FROM ${VAULT_TABLE_NAME} WHERE name = ?`, [name]);
      return (row as any[]).length > 0 ? JSON.parse((row as any[])[0].data) : null;
    } catch (e) {
      throw new Error(`Failed to get vault '${name}' from Tauri DB: ${(e as Error).message}`);
    }
  },

  async saveVault(name: string, data: EncryptedVault): Promise<void> {
    try {
      const db = await getDb();
      await db.execute(`INSERT OR REPLACE INTO ${VAULT_TABLE_NAME} (name, data) VALUES (?, ?)`, [name, JSON.stringify(data)]);
      const names = await this.getVaultNames();
      if (!names.includes(name)) {
        await this.saveVaultNames([...names, name]);
      }
    } catch (e) {
      throw new Error(`Failed to save vault '${name}' to Tauri DB: ${(e as Error).message}`);
    }
  },

  async deleteVault(name: string): Promise<void> {
    try {
      const db = await getDb();
      await db.execute(`DELETE FROM ${VAULT_TABLE_NAME} WHERE name = ?`, [name]);
      const names = await this.getVaultNames();
      await this.saveVaultNames(names.filter(n => n !== name));
    } catch (e) {
      throw new Error(`Failed to delete vault '${name}' from Tauri DB: ${(e as Error).message}`);
    }
  }
};