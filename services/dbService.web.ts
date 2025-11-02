import type { EncryptedVault } from '../types';

const DB_NAME = 'VaultManagerDB';
const VAULT_STORE = 'vaults';
const VAULT_NAMES_STORE = 'vaultNames';
const DB_VERSION = 1;

interface IDBVaultData {
  name: string;
  data: EncryptedVault;
}

// IndexedDB helper functions
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create vaults object store
      if (!db.objectStoreNames.contains(VAULT_STORE)) {
        const vaultStore = db.createObjectStore(VAULT_STORE, { keyPath: 'name' });
        vaultStore.createIndex('name', 'name', { unique: true });
      }

      // Create vault names object store
      if (!db.objectStoreNames.contains(VAULT_NAMES_STORE)) {
        db.createObjectStore(VAULT_NAMES_STORE, { keyPath: 'name' });
      }
    };
  });
}

async function withTransaction<T>(
  storeName: string,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => Promise<T>
): Promise<T> {
  const db = await openDB();
  const transaction = db.transaction([storeName], mode);
  const store = transaction.objectStore(storeName);

  return new Promise((resolve, reject) => {
    let result: T;

    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error);

    callback(store).then(res => result = res).catch(reject);
  });
}

// IndexedDB implementation
const indexedDbService = {
  async getVaultNames(): Promise<string[]> {
    try {
      console.log('IndexedDB: Getting vault names');
      return await withTransaction(VAULT_NAMES_STORE, 'readonly', async (store) => {
        const request = store.getAll();
        return new Promise<string[]>((resolve, reject) => {
          request.onsuccess = () => resolve(request.result.map((item: any) => item.name));
          request.onerror = () => reject(request.error);
        });
      });
    } catch (e) {
      console.error('IndexedDB Error getting vault names:', e);
      throw new Error(`Failed to get vault names from IndexedDB: ${(e as Error).message}`);
    }
  },

  async saveVaultNames(names: string[]): Promise<void> {
    try {
      console.log('IndexedDB: Saving vault names:', names);
      await withTransaction(VAULT_NAMES_STORE, 'readwrite', async (store) => {
        // Clear existing names
        const clearRequest = store.clear();
        await new Promise<void>((resolve, reject) => {
          clearRequest.onsuccess = () => resolve();
          clearRequest.onerror = () => reject(clearRequest.error);
        });

        // Add new names
        for (const name of names) {
          const addRequest = store.add({ name });
          await new Promise<void>((resolve, reject) => {
            addRequest.onsuccess = () => resolve();
            addRequest.onerror = () => reject(addRequest.error);
          });
        }
      });
    } catch (e) {
      console.error('IndexedDB Error saving vault names:', e);
      throw new Error(`Failed to save vault names to IndexedDB: ${(e as Error).message}`);
    }
  },

  async getVault(name: string): Promise<EncryptedVault | null> {
    try {
      console.log(`IndexedDB: Getting vault '${name}'`);
      return await withTransaction(VAULT_STORE, 'readonly', async (store) => {
        const request = store.get(name);
        return new Promise<EncryptedVault | null>((resolve, reject) => {
          request.onsuccess = () => {
            const result = request.result;
            resolve(result ? result.data : null);
          };
          request.onerror = () => reject(request.error);
        });
      });
    } catch (e) {
      console.error(`IndexedDB Error getting vault '${name}':`, e);
      throw new Error(`Failed to get vault '${name}' from IndexedDB: ${(e as Error).message}`);
    }
  },

  async saveVault(name: string, data: EncryptedVault): Promise<void> {
    try {
      console.log(`IndexedDB: Saving vault '${name}'`);
      // Save vault data first
      await withTransaction(VAULT_STORE, 'readwrite', async (store) => {
        const vaultData: IDBVaultData = { name, data };
        const request = store.put(vaultData);
        await new Promise<void>((resolve, reject) => {
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      });

      // Update vault names immediately after saving vault
      await withTransaction(VAULT_NAMES_STORE, 'readwrite', async (store) => {
        const request = store.put({ name });
        await new Promise<void>((resolve, reject) => {
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      });
    } catch (e) {
      console.error(`IndexedDB Error saving vault '${name}':`, e);
      throw new Error(`Failed to save vault '${name}' to IndexedDB: ${(e as Error).message}`);
    }
  },

  async deleteVault(name: string): Promise<void> {
    try {
      console.log(`IndexedDB: Deleting vault '${name}'`);
      await withTransaction(VAULT_STORE, 'readwrite', async (store) => {
        const deleteRequest = store.delete(name);
        await new Promise<void>((resolve, reject) => {
          deleteRequest.onsuccess = () => resolve();
          deleteRequest.onerror = () => reject(deleteRequest.error);
        });

        // Update vault names
        const names = await this.getVaultNames();
        await this.saveVaultNames(names.filter(n => n !== name));
      });
    } catch (e) {
      console.error(`IndexedDB Error deleting vault '${name}':`, e);
      throw new Error(`Failed to delete vault '${name}' from IndexedDB: ${(e as Error).message}`);
    }
  }
};

// Export IndexedDB service
export const dbService = indexedDbService;