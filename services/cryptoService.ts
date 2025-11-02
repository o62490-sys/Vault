import type { Entry, TwoFactorEntry } from '../src/types';

const ITERATIONS = 100000;

// Helper to convert string to ArrayBuffer
function str2ab(str: string): ArrayBuffer {
  return new TextEncoder().encode(str);
}

// Helper to convert ArrayBuffer to string
function ab2str(buf: ArrayBuffer): string {
  return new TextDecoder().decode(buf);
}

// Helper to convert ArrayBuffer to Base64 string
function ab2b64(buf: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buf);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper to convert Base64 string to ArrayBuffer
function b642ab(b64: string): ArrayBuffer {
  const binary_string = window.atob(b64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

export const cryptoService = {
  generateSalt(): Uint8Array {
    return window.crypto.getRandomValues(new Uint8Array(16));
  },

  async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    try {
      const baseKey = await window.crypto.subtle.importKey(
        'raw',
        str2ab(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );

      return await window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: ITERATIONS,
          hash: 'SHA-256',
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
    } catch (e) {
      throw new Error(`Failed to derive key: ${(e as Error).message}`);
    }
  },

  async generateVaultKey(): Promise<CryptoKey> {
    try {
      return await window.crypto.subtle.generateKey(
          { name: 'AES-GCM', length: 256 },
          true,
          ['encrypt', 'decrypt']
      );
    } catch (e) {
      throw new Error(`Failed to generate vault key: ${(e as Error).message}`);
    }
  },

  async exportKey(key: CryptoKey): Promise<string> {
    try {
      const rawKey = await window.crypto.subtle.exportKey('raw', key);
      return ab2b64(rawKey);
    } catch (e) {
      throw new Error(`Failed to export key: ${(e as Error).message}`);
    }
  },

  async importKey(keyData: string): Promise<CryptoKey> {
    try {
      const rawKey = b642ab(keyData);
      return await window.crypto.subtle.importKey(
          'raw',
          rawKey,
          { name: 'AES-GCM' },
          true,
          ['encrypt', 'decrypt']
      );
    } catch (e) {
      throw new Error(`Failed to import key: ${(e as Error).message}`);
    }
  },

  async encryptData(data: ArrayBuffer, key: CryptoKey): Promise<{ iv: Uint8Array, encryptedData: ArrayBuffer }> {
    try {
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encryptedData = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        data
      );
      return { iv, encryptedData };
    } catch (e) {
      throw new Error(`Failed to encrypt data: ${(e as Error).message}`);
    }
  },

  async decryptData(encryptedData: ArrayBuffer, key: CryptoKey, iv: Uint8Array): Promise<ArrayBuffer> {
    try {
      return await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encryptedData
      );
    } catch (e) {
      throw new Error(`Failed to decrypt data: ${(e as Error).message}`);
    }
  },

  // Vault-specific encryption/decryption
  async encryptVaultKey(vaultKey: CryptoKey, masterKey: CryptoKey): Promise<{ iv: string, encryptedKey: string }> {
    try {
      const rawVaultKey = await this.exportKey(vaultKey);
      const { iv, encryptedData } = await this.encryptData(str2ab(rawVaultKey), masterKey);
      return {
          iv: ab2b64(iv),
          encryptedKey: ab2b64(encryptedData),
      };
    } catch (e) {
      throw new Error(`Failed to encrypt vault key: ${(e as Error).message}`);
    }
  },
  
  async decryptVaultKey(encryptedKey: string, masterKey: CryptoKey, iv: string): Promise<CryptoKey> {
    try {
      const decryptedRawKeyAb = await this.decryptData(b642ab(encryptedKey), masterKey, b642ab(iv));
      const decryptedRawKeyStr = ab2str(decryptedRawKeyAb);
      return await this.importKey(decryptedRawKeyStr);
    } catch (e) {
      throw new Error(`Failed to decrypt vault key: ${(e as Error).message}`);
    }
  },

  async encryptEntries(entries: Entry[], vaultKey: CryptoKey): Promise<string> {
    try {
      const entriesToEncrypt = entries.map(e => ({...e, password: e.password || ''}));
      const jsonString = JSON.stringify(entriesToEncrypt);
      const { iv, encryptedData } = await this.encryptData(str2ab(jsonString), vaultKey);
      // Combine IV and encrypted data for storage
      const combined = new Uint8Array(iv.length + encryptedData.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encryptedData), iv.length);
      return ab2b64(combined.buffer);
    } catch (e) {
      throw new Error(`Failed to encrypt entries: ${(e as Error).message}`);
    }
  },

  async encryptTwoFactorEntries(twoFactorEntries: TwoFactorEntry[], vaultKey: CryptoKey): Promise<string> {
    try {
      const jsonString = JSON.stringify(twoFactorEntries);
      const { iv, encryptedData } = await this.encryptData(str2ab(jsonString), vaultKey);
      // Combine IV and encrypted data for storage
      const combined = new Uint8Array(iv.length + encryptedData.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encryptedData), iv.length);
      return ab2b64(combined.buffer);
    } catch (e) {
      throw new Error(`Failed to encrypt 2FA entries: ${(e as Error).message}`);
    }
  },
  
  async decryptEntries(encryptedEntriesB64: string, vaultKey: CryptoKey): Promise<Entry[]> {
    try {
      if (!encryptedEntriesB64) return [];
      const combined = b642ab(encryptedEntriesB64);
      const iv = combined.slice(0, 12);
      const encryptedData = combined.slice(12);
      const decryptedAb = await this.decryptData(encryptedData, vaultKey, new Uint8Array(iv));
      const jsonString = ab2str(decryptedAb);
      return JSON.parse(jsonString) as Entry[];
    } catch (e) {
      throw new Error(`Failed to decrypt entries: ${(e as Error).message}`);
    }
  },

  async decryptTwoFactorEntries(encryptedEntriesB64: string, vaultKey: CryptoKey): Promise<TwoFactorEntry[]> {
    try {
      if (!encryptedEntriesB64) return [];
      const combined = b642ab(encryptedEntriesB64);
      const iv = combined.slice(0, 12);
      const encryptedData = combined.slice(12);
      const decryptedAb = await this.decryptData(encryptedData, vaultKey, new Uint8Array(iv));
      const jsonString = ab2str(decryptedAb);
      return JSON.parse(jsonString) as TwoFactorEntry[];
    } catch (e) {
      throw new Error(`Failed to decrypt 2FA entries: ${(e as Error).message}`);
    }
  },

  // New function for simple, non-keyed hashing for recovery data
  async hashData(data: string, salt: Uint8Array): Promise<string> {
    try {
      const dataBuffer = str2ab(data);
      const combined = new Uint8Array(salt.length + dataBuffer.byteLength);
      combined.set(salt);
      combined.set(new Uint8Array(dataBuffer), salt.length);
      
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', combined);
      return ab2b64(hashBuffer);
    } catch (e) {
      throw new Error(`Failed to hash data: ${(e as Error).message}`);
    }
  },

  b64encode: ab2b64,
  b64decode: b642ab,
};
