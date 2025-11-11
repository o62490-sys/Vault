import React, { useState } from 'react';
import { getDbService } from '../../services/dbService';
import { cryptoService } from '../../services/cryptoService';
import type { EncryptedVault } from '../types';
import * as OTPAuth from 'otpauth';
import QRCode from 'react-qr-code';

interface CreateVaultPageProps {
  onBack: () => void;
  onCreated: () => void;
}

const PREDEFINED_QUESTIONS = [
  "What was your childhood nickname?",
  "What is the name of your favorite childhood friend?",
  "What street did you live on in third grade?",
  "What is your oldest sibling's middle name?",
  "What was the name of your first pet?",
  "What was the name of the high school you graduated from?",
  "What was your favorite food as a child?"
];

type RecoveryMethod = 'none' | 'code' | 'questions';

export function CreateVaultPage({ onBack, onCreated }: CreateVaultPageProps) {
  const [vaultName, setVaultName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [enableTotp, setEnableTotp] = useState(false);
  const [recoveryMethod, setRecoveryMethod] = useState<RecoveryMethod>('none');
  const [securityQuestions, setSecurityQuestions] = useState([{ q: PREDEFINED_QUESTIONS[0], a: '' }, { q: PREDEFINED_QUESTIONS[1], a: '' }]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [showTotpModal, setShowTotpModal] = useState(false);
  const [totpSecret, setTotpSecret] = useState('');
  const [totpUri, setTotpUri] = useState('');

  const [showRecoveryCodeModal, setShowRecoveryCodeModal] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');

  const handleCreate = async () => {
    setError('');
    if (!vaultName.trim()) {
      setError('Vault name is required.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    const dbService = await getDbService();
    if (await dbService.getVault(vaultName.trim())) {
      setError('A vault with this name already exists.');
      return;
    }
    if (recoveryMethod === 'questions') {
      if (securityQuestions.some(sq => !sq.a.trim())) {
        setError('Please answer both security questions.');
        return;
      }
      if (securityQuestions[0].q === securityQuestions[1].q) {
        setError('Please select two different security questions.');
        return;
      }
    }

    setIsLoading(true);

    try {
      // Common crypto setup
      const salt = cryptoService.generateSalt();
      const masterKey = await cryptoService.deriveKey(password, salt);
      const vaultKey = await cryptoService.generateVaultKey();
      const { iv, encryptedKey } = await cryptoService.encryptVaultKey(vaultKey, masterKey);

      const newVault: Partial<EncryptedVault> = {
       name: vaultName.trim(),
       encryptedVaultKey: encryptedKey,
       salt: cryptoService.b64encode(salt.buffer as ArrayBuffer),
       iv: iv,
       authMethods: ['master_password'],
       entries: '', // Initially empty
     };

      // 2FA Setup
      if (enableTotp) {
        newVault.authMethods!.push('totp');
        const secret = new OTPAuth.Secret();
        const plainTotpSecret = secret.base32;

        // Encrypt the TOTP secret with the master key
        const { iv: totpIv, encryptedData: encryptedTotpData } = await cryptoService.encryptData(new TextEncoder().encode(plainTotpSecret).buffer, masterKey);
        newVault.encryptedTotpSecret = cryptoService.b64encode(encryptedTotpData);
        newVault.totpIv = cryptoService.b64encode(totpIv.buffer as ArrayBuffer);

        const totp = new OTPAuth.TOTP({
            issuer: "Vault Manager",
            label: vaultName.trim(),
            algorithm: "SHA1",
            digits: 6,
            period: 30,
            secret: secret,
        });
        setTotpSecret(plainTotpSecret); // Show plain secret to user
        setTotpUri(totp.toString());
      }

      // Recovery Setup
      if (recoveryMethod !== 'none') {
        const recoverySalt = cryptoService.generateSalt();
        newVault.recoverySalt = cryptoService.b64encode(recoverySalt.buffer as ArrayBuffer);
        newVault.recoveryMethod = recoveryMethod;

        let recoverySecret: string;
        let recoveryDataToStore: string;

        if (recoveryMethod === 'code') {
          const generatedCode = (cryptoService.b64encode(cryptoService.generateSalt().buffer as ArrayBuffer) + cryptoService.b64encode(cryptoService.generateSalt().buffer as ArrayBuffer)).substring(0, 32);
          recoverySecret = generatedCode;
          setRecoveryCode(generatedCode); // For the modal
          recoveryDataToStore = await cryptoService.hashData(recoverySecret, recoverySalt);
        } else { // questions
          recoverySecret = securityQuestions.map(sq => sq.a.trim().toLowerCase()).join('');
          const hashedAnswers = await Promise.all(
              securityQuestions.map(sq => cryptoService.hashData(sq.a.trim().toLowerCase(), recoverySalt))
          );
          recoveryDataToStore = JSON.stringify([
              { q: securityQuestions[0].q, a: hashedAnswers[0] },
              { q: securityQuestions[1].q, a: hashedAnswers[1] },
          ]);
        }

        const recoveryKey = await cryptoService.deriveKey(recoverySecret, recoverySalt);
        const { iv: recoveryIv, encryptedKey: encryptedVaultKeyForRecovery } = await cryptoService.encryptVaultKey(vaultKey, recoveryKey);

        newVault.recoveryIv = recoveryIv;
        newVault.encryptedVaultKeyForRecovery = encryptedVaultKeyForRecovery;
        newVault.recoveryData = recoveryDataToStore;
      }

      await dbService.saveVault(newVault.name!, newVault as EncryptedVault);

      if (enableTotp) setShowTotpModal(true);
      else if (recoveryMethod === 'code') setShowRecoveryCodeModal(true);
      else {
          alert(`Vault "${newVault.name}" created successfully!`);
          onCreated();
      }
    } catch (e) {
      console.error(e);
      setError('An unexpected error occurred during vault creation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
      setShowTotpModal(false);
      setShowRecoveryCodeModal(false);
      let message = `Vault "${vaultName.trim()}" created successfully!`;
      if(enableTotp) message += " Remember to save your 2FA secret.";
      if(recoveryMethod === 'code') message += " Remember to save your recovery code.";
      alert(message);
      onCreated();
  }

  const handleQuestionChange = (index: number, field: 'q' | 'a', value: string) => {
      const newQuestions = [...securityQuestions];
      newQuestions[index] = {...newQuestions[index], [field]: value};
      setSecurityQuestions(newQuestions);
  }

  return (
    <>
      <div className="bg-surface rounded-lg shadow-main p-8 max-w-lg mx-auto animate-fade-in">
        <h1 className="text-3xl font-bold text-center text-primary mb-8">Create New Vault</h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Vault Name</label>
            <input type="text" value={vaultName} onChange={e => setVaultName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Master Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" />
            <p className="text-xs text-text-muted mt-1">Minimum 8 characters.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input-field" />
          </div>
          <div className="flex items-center">
            <input id="totp" type="checkbox" checked={enableTotp} onChange={e => setEnableTotp(e.target.checked)} className="custom-checkbox" />
            <label htmlFor="totp" className="ml-3 block text-sm text-text-primary">Enable 2FA (TOTP)</label>
          </div>
        </div>

        <div className="mt-8 border-t border-input-bg pt-6">
          <h2 className="text-xl font-semibold text-primary mb-2">Password Recovery (Recommended)</h2>
          <p className="text-text-muted text-sm mb-4">Set up a way to recover your vault if you forget your master password.</p>
          <select value={recoveryMethod} onChange={e => setRecoveryMethod(e.target.value as RecoveryMethod)} className="input-field">
              <option value="none">No recovery method</option>
              <option value="code">Generate a recovery code</option>
              <option value="questions">Use security questions</option>
          </select>

          {recoveryMethod === 'questions' && (
              <div className="mt-6 space-y-4 animate-fade-in">
                  <p className="text-sm text-text-muted">Answers are case-insensitive and combined for recovery.</p>
                  <div>
                      <label className="block text-sm font-medium text-text-muted mb-2">Question 1</label>
                      <select value={securityQuestions[0].q} onChange={e => handleQuestionChange(0, 'q', e.target.value)} className="input-field mb-2">
                          {PREDEFINED_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                      </select>
                      <input type="text" placeholder="Answer 1" value={securityQuestions[0].a} onChange={e => handleQuestionChange(0, 'a', e.target.value)} className="input-field" />
                  </div>
                   <div>
                      <label className="block text-sm font-medium text-text-muted mb-2">Question 2</label>
                      <select value={securityQuestions[1].q} onChange={e => handleQuestionChange(1, 'q', e.target.value)} className="input-field mb-2">
                          {PREDEFINED_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                      </select>
                      <input type="text" placeholder="Answer 2" value={securityQuestions[1].a} onChange={e => handleQuestionChange(1, 'a', e.target.value)} className="input-field" />
                  </div>
              </div>
          )}
        </div>

        {error && <p className="text-error text-sm mt-6 text-center">{error}</p>}

        <div className="mt-8 space-y-3">
          <button onClick={handleCreate} disabled={isLoading} className="btn btn-main disabled:opacity-50">
            {isLoading ? 'Creating...' : 'Create Vault'}
          </button>
          <button onClick={onBack} className="btn btn-secondary">
            Back
          </button>
        </div>
      </div>

      {showTotpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-surface p-8 rounded-lg shadow-modal max-w-sm w-full text-center animate-slide-in-up">
            <h2 className="text-2xl font-bold text-primary mb-4">Set Up 2FA</h2>
            <p className="text-text-muted mb-6">Scan this QR code with your authenticator app.</p>
            <div className="bg-white p-4 rounded-md inline-block">
                <QRCode value={totpUri} size={200} level="M" />
            </div>
            <p className="text-sm text-text-muted mt-6 break-all">Or manually enter this secret: <br/><strong className="text-accent font-mono mt-1 inline-block">{totpSecret}</strong></p>
            <p className="text-error font-bold my-6 p-3 bg-red-900 bg-opacity-30 rounded-md">⚠️ Save this secret in a safe place! You will need it to recover access.</p>
            <button onClick={handleModalClose} className="btn btn-primary mt-2">
              Done
            </button>
          </div>
        </div>
      )}

      {showRecoveryCodeModal && (
         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-surface p-8 rounded-lg shadow-modal max-w-md w-full text-center animate-slide-in-up">
            <h2 className="text-2xl font-bold text-primary mb-4">Save Your Recovery Code</h2>
            <p className="text-text-muted mb-6">Store this code in a very safe place. It's the only way to reset your password.</p>
            <div className="bg-input-bg p-4 rounded-md text-accent font-mono text-lg break-all my-4">
                {recoveryCode}
            </div>
            <p className="text-error font-bold my-6 p-3 bg-red-900 bg-opacity-30 rounded-md">⚠️ If you lose this code AND your password, your data will be permanently lost.</p>
            <button onClick={handleModalClose} className="btn btn-primary mt-2">
              I have saved my recovery code
            </button>
          </div>
        </div>
      )}
    </>
  );
}
