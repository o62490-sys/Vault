import React, { useState, useEffect } from 'react';
import { getDbService } from '../../services/dbService';
import type { EncryptedVault } from '../types';

interface HomePageProps {
  onCreateNew: () => void;
  onSelectVault: (name: string) => void;
}

export function HomePage({ onCreateNew, onSelectVault }: HomePageProps) {
  const [vaults, setVaults] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchVaults = async () => {
      const dbService = await getDbService();
      setVaults(await dbService.getVaultNames());
    };
    fetchVaults();
  }, []);

  const handleRestoreBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== 'string') {
            alert('Error reading file.');
            return;
        }
        const backupData = JSON.parse(result);
        const vaultName = backupData.vault_name;
        if (!vaultName || !backupData.master_key) {
            alert('Invalid backup file.');
            return;
        }

        // FIX: Restore password recovery fields and 2FA entries from backup to prevent data loss.
        const restoredVault: EncryptedVault = {
            name: vaultName,
            encryptedVaultKey: backupData.master_key,
            salt: backupData.salt,
            iv: backupData.iv,
            authMethods: JSON.parse(backupData.auth_methods),
            encryptedTotpSecret: backupData.encrypted_totp_secret,
            totpIv: backupData.totp_iv,
            recoverySalt: backupData.recovery_salt,
            entries: backupData.entries,
            twoFactorEntries: backupData.two_factor_entries,
            recoveryMethod: backupData.recovery_method,
            recoveryData: backupData.recovery_data,
            recoveryIv: backupData.recovery_iv,
            encryptedVaultKeyForRecovery: backupData.encrypted_vault_key_for_recovery,
        };

        const dbService = await getDbService();
        if (await dbService.getVault(vaultName)) {
            if (!window.confirm(`Vault "${vaultName}" already exists. Overwrite it?`)) {
                return;
            }
        }

        await dbService.saveVault(vaultName, restoredVault);
        setVaults(await dbService.getVaultNames());
        alert(`Vault "${vaultName}" restored successfully!`);
      } catch (error) {
        console.error("Restore failed:", error);
        alert('Failed to restore backup. The file may be corrupt or invalid.');
      }
    };
    reader.readAsText(file);
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-8 max-w-md mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-center text-white mb-8">Vault Manager</h1>
      <div className="space-y-6">
        {vaults.length > 0 && (
          <div>
            <h2 className="text-lg text-gray-300 mb-4 text-center">Open an existing vault:</h2>
            <div className="space-y-3">
              {vaults.map(name => (
                <button
                  key={name}
                  onClick={() => onSelectVault(name)}
                  className="btn btn-accent"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="pt-4 space-y-3">
          <button
            onClick={onCreateNew}
            className="btn btn-primary"
          >
            Create New Vault
          </button>
          <label className="btn btn-secondary text-center cursor-pointer">
            <span>Restore from Backup</span>
            <input type="file" accept=".vaultbak" className="hidden" onChange={handleRestoreBackup} />
          </label>
        </div>
      </div>
    </div>
  );
}
