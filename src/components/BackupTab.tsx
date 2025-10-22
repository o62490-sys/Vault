import React from 'react';
import type { UnlockedVault, BackupData } from '../types';
import { cryptoService } from '../services/cryptoService';

interface BackupTabProps {
  vault: UnlockedVault;
}

export function BackupTab({ vault }: BackupTabProps) {

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