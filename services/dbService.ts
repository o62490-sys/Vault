
import type { EncryptedVault } from '../types';

const VAULT_PREFIX = 'vault_';

export const dbService = {
  getVaultNames(): string[] {
    const names = localStorage.getItem('vault_names');
    return names ? JSON.parse(names) : [];
  },

  saveVaultNames(names: string[]): void {
    localStorage.setItem('vault_names', JSON.stringify(names));
  },

  getVault(name: string): EncryptedVault | null {
    const vaultData = localStorage.getItem(`${VAULT_PREFIX}${name}`);
    return vaultData ? JSON.parse(vaultData) : null;
  },

  saveVault(name: string, data: EncryptedVault): void {
    localStorage.setItem(`${VAULT_PREFIX}${name}`, JSON.stringify(data));
    const names = this.getVaultNames();
    if (!names.includes(name)) {
      this.saveVaultNames([...names, name]);
    }
  },

  deleteVault(name: string): void {
    localStorage.removeItem(`${VAULT_PREFIX}${name}`);
    const names = this.getVaultNames();
    this.saveVaultNames(names.filter(n => n !== name));
  }
};