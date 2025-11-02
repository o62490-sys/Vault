import React, { useState, useEffect } from 'react';
import type { UnlockedVault, BackupData } from '../types';
import { cryptoService } from '../services/cryptoService';
import { getDbService } from '../services/dbService';

interface BackupTabProps {
  vault: UnlockedVault;
}

export function BackupTab({ vault }: BackupTabProps) {
  const [dbLocationHint, setDbLocationHint] = useState<string | null>(null);

  useEffect(() => {
    const getDbPathHint = async () => {
      if (typeof window !== 'undefined') {
        if ((window as any).electronAPI) {
          // Electron environment
          const userDataPath = await (window as any).electronAPI.getAppPath('userData');
          const dbPath = await (window as any).electronAPI.pathJoin(userDataPath, 'vaults.db');
          setDbLocationHint(`Your vault data is stored in a SQLite database at: ${dbPath}`);
        } else if ((window as any).__TAURI__) {
          // Tauri environment
          // Tauri's plugin-sql stores in app data directory by default
          setDbLocationHint(`Your vault data is stored in a SQLite database within your application data directory.`);
        }
      }
    };
    getDbPathHint();
  }, []);

  const handleExport = async () => {
    try {
        const backupData: BackupData = {
            vault_name: vault.name,
            master_key: vault.encryptedVault.encryptedVaultKey,
            salt: vault.encryptedVault.salt,
            iv: vault.encryptedVault.iv,
            auth_methods: JSON.stringify(vault.encryptedVault.authMethods),
            encrypted_totp_secret: vault.encryptedVault.encryptedTotpSecret,
            totp_iv: vault.encryptedVault.totpIv,
            recovery_salt: vault.encryptedVault.recoverySalt,
            // FIX: Add password recovery fields to the backup data to ensure they are not lost.
            recovery_method: vault.encryptedVault.recoveryMethod,
            recovery_data: vault.encryptedVault.recoveryData,
            recovery_iv: vault.encryptedVault.recoveryIv,
            encrypted_vault_key_for_recovery: vault.encryptedVault.encryptedVaultKeyForRecovery,
            entries: await cryptoService.encryptEntries(vault.entries, vault.vaultKey),
            created_at: new Date().toISOString()
        };

        const jsonString = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${vault.name}_backup.vaultbak`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert('Backup exported successfully!');
    } catch (error) {
        console.error("Backup failed:", error);
        alert('Failed to create backup.');
    }
  };

  return (
    <div className="p-4 text-center">
      <h2 className="text-xl font-bold text-primary mb-4">Backup & Restore</h2>
      <p className="text-text-muted mb-6 max-w-md mx-auto">
        Export your vault to a secure backup file. Store this file in a safe place. You can restore your vault from this file on any device.
      </p>
      
      {dbLocationHint && (
        <div className="max-w-md mx-auto mb-8 text-sm text-info bg-blue-100 border border-blue-400 rounded p-3" role="alert">
          <strong>Note for Desktop Users:</strong> {dbLocationHint}
        </div>
      )}

      <div className="max-w-md mx-auto mb-8 text-sm text-accent bg-input-bg p-3 rounded-md">
        <strong>Security Note:</strong> The backup file contains your encrypted data. It is useless without your original Master Password.
      </div>

      <button 
        onClick={handleExport}
        className="btn btn-primary max-w-xs mx-auto"
      >
        Export Vault Backup
      </button>
    </div>
  );
}
