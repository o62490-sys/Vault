import React, { useState } from 'react';
import type { EncryptedVault } from '../types';
import { cryptoService } from '../services/cryptoService';
import { dbService } from '../services/dbService';

interface PasswordResetModalProps {
  vaultData: EncryptedVault;
  onClose: () => void;
}

type Step = 'verify' | 'reset' | 'success';

interface StoredQuestion {
    q: string;
    a: string; // This is a hash
}

export function PasswordResetModal({ vaultData, onClose }: PasswordResetModalProps) {
  const [step, setStep] = useState<Step>('verify');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // State for verification step
  const [recoveryCode, setRecoveryCode] = useState('');
  const [securityAnswers, setSecurityAnswers] = useState(['', '']);

  // State for reset step
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [decryptedVaultKey, setDecryptedVaultKey] = useState<CryptoKey | null>(null);

  const parsedQuestions: StoredQuestion[] | null = vaultData.recoveryMethod === 'questions' && vaultData.recoveryData
    ? JSON.parse(vaultData.recoveryData)
    : null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        if (!vaultData.recoverySalt || !vaultData.recoveryMethod || !vaultData.recoveryData || !vaultData.recoveryIv || !vaultData.encryptedVaultKeyForRecovery) {
            throw new Error("Recovery data is missing or corrupt.");
        }
        const recoverySalt = new Uint8Array(cryptoService.b64decode(vaultData.recoverySalt));
        let recoverySecret: string;
        let isVerified = false;

        if (vaultData.recoveryMethod === 'code') {
            recoverySecret = recoveryCode.trim();
            const hashedCode = await cryptoService.hashData(recoverySecret, recoverySalt);
            if (hashedCode === vaultData.recoveryData) {
                isVerified = true;
            }
        } else { // 'questions'
            recoverySecret = securityAnswers.map(a => a.trim().toLowerCase()).join('');
            // We can't directly verify the combined secret, so we derive the key and try to decrypt.
            // If decryption works, the secret was correct. This is a more robust check.
            isVerified = true; // Assume true and let decryption prove it.
        }

        if (!isVerified) {
            throw new Error("Recovery information is incorrect.");
        }

        // Derive key and attempt to decrypt the vault key
        const recoveryKey = await cryptoService.deriveKey(recoverySecret, recoverySalt);
        const vaultKey = await cryptoService.decryptVaultKey(vaultData.encryptedVaultKeyForRecovery, recoveryKey, vaultData.recoveryIv);
        
        setDecryptedVaultKey(vaultKey);
        setStep('reset');

    } catch (err: any) {
        setError(err.message || "Verification failed. Please check your input.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      if (!decryptedVaultKey) {
          setError("An internal error occurred. Decrypted key not found.");
          return;
      }
      if (newPassword.length < 8) {
          setError("New password must be at least 8 characters.");
          return;
      }
      if (newPassword !== confirmPassword) {
          setError("Passwords do not match.");
          return;
      }

      setIsLoading(true);
      try {
          const salt = new Uint8Array(cryptoService.b64decode(vaultData.salt));
          const newMasterKey = await cryptoService.deriveKey(newPassword, salt);
          const { iv, encryptedKey } = await cryptoService.encryptVaultKey(decryptedVaultKey, newMasterKey);

          const updatedVault: EncryptedVault = {
              ...vaultData,
              encryptedVaultKey: encryptedKey,
              iv: iv,
          };

          dbService.saveVault(updatedVault.name, updatedVault);
          setStep('success');

      } catch (err: any) {
          setError(err.message || "Failed to reset password.");
      } finally {
          setIsLoading(false);
      }
  };

  const renderContent = () => {
    switch (step) {
      case 'verify':
        return (
          <form onSubmit={handleVerify}>
            <h3 className="text-xl font-bold text-primary mb-4">Password Recovery</h3>
            <p className="text-text-muted mb-6">Enter your recovery information to proceed.</p>
            {vaultData.recoveryMethod === 'code' && (
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Recovery Code</label>
                <input type="text" value={recoveryCode} onChange={e => setRecoveryCode(e.target.value)} className="input-field" autoFocus />
              </div>
            )}
            {vaultData.recoveryMethod === 'questions' && parsedQuestions && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-2">{parsedQuestions[0].q}</label>
                         <input type="text" value={securityAnswers[0]} onChange={e => setSecurityAnswers([e.target.value, securityAnswers[1]])} className="input-field" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-text-muted mb-2">{parsedQuestions[1].q}</label>
                         <input type="text" value={securityAnswers[1]} onChange={e => setSecurityAnswers([securityAnswers[0], e.target.value])} className="input-field" />
                    </div>
                </div>
            )}
            <button type="submit" disabled={isLoading} className="btn btn-primary mt-8 disabled:opacity-50">
                {isLoading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        );
      case 'reset':
        return (
          <form onSubmit={handleResetPassword}>
            <h3 className="text-xl font-bold text-primary mb-6">Set New Master Password</h3>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">New Master Password</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-field" autoFocus />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">Confirm New Password</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input-field" />
                </div>
            </div>
            <button type="submit" disabled={isLoading} className="btn btn-primary mt-8 disabled:opacity-50">
                {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        );
      case 'success':
        return (
            <div className="text-center">
                 <h3 className="text-xl font-bold text-success mb-4">Success!</h3>
                 <p className="text-text-muted mb-6">Your master password has been successfully reset. You can now close this window and unlock your vault with the new password.</p>
                 <button onClick={onClose} className="btn btn-primary mt-4">
                    Close
                </button>
            </div>
        )
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-surface p-8 rounded-lg shadow-modal max-w-md w-full relative animate-slide-in-up">
        <button onClick={onClose} className="absolute top-3 right-4 text-text-muted hover:text-text-primary text-3xl font-light">&times;</button>
        {error && <p className="text-error text-sm mb-4 text-center p-3 bg-red-900 bg-opacity-30 rounded-md">{error}</p>}
        {renderContent()}
      </div>
    </div>
  );
}