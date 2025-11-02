import React, { useState, useEffect } from 'react';
import { getDbService } from '../../services/dbService';
import { cryptoService } from '../../services/cryptoService';
import type { UnlockedVault, EncryptedVault, TwoFactorEntry } from '../types';
import * as OTPAuth from 'otpauth';
import { PasswordResetModal } from './PasswordResetModal';

interface UnlockVaultPageProps {
  vaultName: string;
  onUnlock: (vault: UnlockedVault) => void;
  onBack: () => void;
  onVaultDeleted?: () => void;
}

export function UnlockVaultPage({ vaultName, onUnlock, onBack, onVaultDeleted }: UnlockVaultPageProps) {
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  
  const [vaultData, setVaultData] = useState<EncryptedVault | null>(null);
  const [isLoadingVault, setIsLoadingVault] = useState(true);

  useEffect(() => {
    const loadVault = async () => {
      setIsLoadingVault(true);
      const dbService = await getDbService();
      const data = await dbService.getVault(vaultName);
      setVaultData(data);
      setIsLoadingVault(false);
    };
    loadVault();
  }, [vaultName]);
  
  const handleUnlock = async () => {
    if (!vaultData) {
      setError('Vault data could not be found.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const salt = cryptoService.b64decode(vaultData.salt);
      const masterKey = await cryptoService.deriveKey(password, new Uint8Array(salt));

      if (vaultData.authMethods.includes('totp') && vaultData.encryptedTotpSecret && vaultData.totpIv) {
        if (!totpCode.trim()) {
          throw new Error("TOTP code is required.");
        }

        // Decrypt the TOTP secret
        const encryptedSecretAb = cryptoService.b64decode(vaultData.encryptedTotpSecret);
        const totpIvAb = cryptoService.b64decode(vaultData.totpIv);
        const decryptedSecretAb = await cryptoService.decryptData(encryptedSecretAb, masterKey, new Uint8Array(totpIvAb));
        const totpSecret = new TextDecoder().decode(decryptedSecretAb);

        const totp = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(totpSecret) });
        const delta = totp.validate({ token: totpCode, window: 1 });
        if (delta === null) {
          throw new Error("Invalid TOTP code.");
        }
      }

      const vaultKey = await cryptoService.decryptVaultKey(
        vaultData.encryptedVaultKey,
        masterKey,
        vaultData.iv,
      );

      const entries = await cryptoService.decryptEntries(vaultData.entries, vaultKey);
      const twoFactorEntries = vaultData.twoFactorEntries
        ? await cryptoService.decryptTwoFactorEntries(vaultData.twoFactorEntries, vaultKey)
        : [];

      const unlockedVault: UnlockedVault = {
          name: vaultData.name,
          vaultKey,
          masterKey,
          entries,
          twoFactorEntries,
          encryptedVault: {
            name: vaultData.name,
            encryptedVaultKey: vaultData.encryptedVaultKey,
            salt: vaultData.salt,
            iv: vaultData.iv,
            authMethods: vaultData.authMethods,
            encryptedTotpSecret: vaultData.encryptedTotpSecret,
            totpIv: vaultData.totpIv,
            recoverySalt: vaultData.recoverySalt,
            twoFactorEntries: vaultData.twoFactorEntries,
            recoveryMethod: vaultData.recoveryMethod,
            recoveryData: vaultData.recoveryData,
            recoveryIv: vaultData.recoveryIv,
            encryptedVaultKeyForRecovery: vaultData.encryptedVaultKeyForRecovery,
          }
      };

      onUnlock(unlockedVault);

    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Invalid password or an error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVault = async () => {
    const firstConfirm = window.confirm(`Are you sure you want to delete the vault '${vaultName}'? This action cannot be undone.`);
    if (firstConfirm) {
      const secondConfirm = window.confirm(`This will permanently delete all passwords and data in the vault '${vaultName}'. Are you absolutely sure?`);
      if (secondConfirm) {
        try {
          const dbService = await getDbService();
          await dbService.deleteVault(vaultName);
          onVaultDeleted?.(); // Call the callback if provided
        } catch (e: any) {
          console.error("Failed to delete vault:", e);
          setError(e.message || 'Failed to delete vault.');
        }
      }
    }
  };

  if (isLoadingVault) {
    return (
      <div className="bg-surface rounded-lg shadow-main p-8 max-w-md mx-auto text-center animate-fade-in">
        <h1 className="text-2xl font-bold text-primary mb-4">Loading Vault...</h1>
      </div>
    );
  }

  if (!vaultData) {
    return (
      <div className="bg-surface rounded-lg shadow-main p-8 max-w-md mx-auto text-center animate-fade-in">
        <h1 className="text-2xl font-bold text-error mb-4">Error</h1>
        <p>Could not find vault: {vaultName}</p>
        <button onClick={onBack} className="mt-6 btn btn-primary">Back to Home</button>
      </div>
    );
  }

  const canAttemptRecovery = !!vaultData.recoveryMethod;

  return (
    <>
      <div className="bg-surface rounded-lg shadow-main p-8 max-w-md mx-auto animate-fade-in">
        <h1 className="text-2xl font-bold text-center text-primary mb-2">Unlock '{vaultName}'</h1>
        <form onSubmit={e => {e.preventDefault(); handleUnlock();}} className="space-y-6 mt-8">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Master Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="input-field"
              autoFocus 
            />
          </div>
          {vaultData.authMethods.includes('totp') && (
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">2FA Code</label>
              <input 
                type="text" 
                value={totpCode} 
                onChange={e => setTotpCode(e.target.value)} 
                className="input-field"
                inputMode="numeric"
                autoComplete="one-time-code"
              />
            </div>
          )}

          <div className="text-right -mt-2">
              {canAttemptRecovery ? (
                <button type="button" onClick={() => setShowResetModal(true)} className="text-sm text-primary hover:underline focus:outline-none focus:underline">
                  Forgot Password?
                </button>
              ) : (
                <span className="text-sm text-text-muted cursor-help" title="No recovery method was set up for this vault.">Forgot Password?</span>
              )}
          </div>
          
          {error && <p className="text-error text-sm text-center">{error}</p>}

          <div className="pt-2 space-y-3">
            <button type="submit" disabled={isLoading} className="btn btn-primary disabled:opacity-50">
              {isLoading ? 'Unlocking...' : 'Unlock'}
            </button>
            <button type="button" onClick={onBack} className="btn btn-secondary">
              Back
            </button>
            {onVaultDeleted && (
              <button type="button" onClick={handleDeleteVault} className="btn btn-danger w-full">
                Delete Vault
              </button>
            )}
          </div>
        </form>
      </div>
      {showResetModal && canAttemptRecovery && (
        <PasswordResetModal vaultData={vaultData} onClose={() => setShowResetModal(false)} />
      )}
    </>
  );
}
