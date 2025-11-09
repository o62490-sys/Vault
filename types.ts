export interface Entry {
  id: string;
  title: string;
  url: string;
  username: string;
  password?: string; // Decrypted password
  notes?: string; // Decrypted notes
  notesEncrypted?: boolean; // Whether notes are encrypted with separate password
  notesPassword?: string; // Password for encrypting notes (if notesEncrypted is true)
}

export interface TwoFactorEntry {
  id: string;
  title: string;
  issuer: string;
  secret: string; // TOTP secret
  algorithm?: 'SHA1' | 'SHA256' | 'SHA512';
  digits?: 6 | 8;
  period?: number;
}

// Stored in localStorage, passwords are encrypted
export interface EncryptedVault {
  name: string;
  encryptedVaultKey: string; // vaultKey encrypted with masterKey
  salt: string;
  iv: string;
  authMethods: ('master_password' | 'recovery_password' | 'totp' | 'biometric')[];
  encryptedTotpSecret?: string; // Encrypted with masterKey
  totpIv?: string; // IV for TOTP secret encryption
  recoverySalt?: string;
  entries: string; // JSON string of Entry[] with passwords encrypted by vaultKey, then base64
  twoFactorEntries?: string; // JSON string of TwoFactorEntry[] with secrets encrypted by vaultKey, then base64

  // New fields for password recovery
  recoveryMethod?: 'code' | 'questions';
  // Hashed recovery code OR JSON string of {q: string, a: string (hashed)}[]
  recoveryData?: string;
  recoveryIv?: string; // IV for encrypting vault key with recovery key
  encryptedVaultKeyForRecovery?: string; // vaultKey encrypted with recoveryKey
}

// In-memory representation when vault is unlocked
export interface UnlockedVault {
  name: string;
  vaultKey: CryptoKey;
  masterKey: CryptoKey;
  entries: Entry[];
  twoFactorEntries: TwoFactorEntry[];
  encryptedVault: Omit<EncryptedVault, 'entries' | 'twoFactorEntries'>;
}

export interface BackupData {
    vault_name: string;
    master_key: string;
    salt: string;
    iv: string;
    auth_methods: string;
    encrypted_totp_secret?: string;
    totp_iv?: string;
    recovery_salt?: string;
    entries: string;
    two_factor_entries?: string;
    created_at: string;

    recovery_method?: 'code' | 'questions';
    recovery_data?: string;
    recovery_iv?: string;
    encrypted_vault_key_for_recovery?: string;
}
