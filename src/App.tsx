
import React, { useState, useCallback, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { CreateVaultPage } from './components/CreateVaultPage';
import { UnlockVaultPage } from './components/UnlockVaultPage';
import { VaultView } from './components/VaultView';
import type { UnlockedVault, EncryptedVault } from './types';
import { dbService } from './services/dbService';
import { cryptoService } from './services/cryptoService';

type View = 'home' | 'create' | 'unlock';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [currentVaultName, setCurrentVaultName] = useState<string | null>(null);
  const [unlockedVault, setUnlockedVault] = useState<UnlockedVault | null>(null);

  const handleCreateNew = () => setView('create');
  
  const handleSelectVault = (name: string) => {
    setCurrentVaultName(name);
    setView('unlock');
  };

  const handleBackToHome = () => {
    setView('home');
    setCurrentVaultName(null);
    setUnlockedVault(null);
  };
  
  const handleUnlock = (vault: UnlockedVault) => {
    setUnlockedVault(vault);
  };

  const handleLock = () => {
    setUnlockedVault(null);
    setCurrentVaultName(null);
    setView('home');
  };

  const handleSaveVault = async (vault: UnlockedVault) => {
    if (!vault.masterKey) return;
    const encryptedEntries = await cryptoService.encryptEntries(vault.entries, vault.vaultKey);
    const encryptedVaultData: EncryptedVault = {
        ...vault.encryptedVault,
        entries: encryptedEntries,
    };
    await dbService.saveVault(vault.name, encryptedVaultData);
    setUnlockedVault(vault);
  };

  const renderView = () => {
    if (unlockedVault) {
      return <VaultView vault={unlockedVault} onSave={handleSaveVault} onLock={handleLock} />;
    }
    
    switch (view) {
      case 'create':
        return <CreateVaultPage onBack={handleBackToHome} onCreated={handleBackToHome} />;
      case 'unlock':
        return currentVaultName ? <UnlockVaultPage vaultName={currentVaultName} onUnlock={handleUnlock} onBack={handleBackToHome} /> : <HomePage onCreateNew={handleCreateNew} onSelectVault={handleSelectVault} />;
      case 'home':
      default:
        return <HomePage onCreateNew={handleCreateNew} onSelectVault={handleSelectVault} />;
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {renderView()}
      </div>
    </div>
  );
}