
import React, { useState, useCallback, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { CreateVaultPage } from './components/CreateVaultPage';
import { UnlockVaultPage } from './components/UnlockVaultPage';
import { VaultView } from './components/VaultView';
import type { UnlockedVault, EncryptedVault } from './types';
import { getDbService } from './services/dbService';
import { cryptoService } from './services/cryptoService';

interface IDBService {
  getVaultNames(): Promise<string[]>;
  saveVaultNames(names: string[]): Promise<void>;
  getVault(name: string): Promise<any>;
  saveVault(name: string, data: any): Promise<void>;
  deleteVault(name: string): Promise<void>;
}

type View = 'home' | 'create' | 'unlock';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [currentVaultName, setCurrentVaultName] = useState<string | null>(null);
  const [unlockedVault, setUnlockedVault] = useState<UnlockedVault | null>(null);
  const [isElectronApiReady, setIsElectronApiReady] = useState(false);
  const [initializedDbService, setInitializedDbService] = useState<IDBService | null>(null);

  useEffect(() => {
    const initializeService = async () => {
      // Check if electronAPI is available (only in Electron environment)
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        setIsElectronApiReady(true);
      } else if (typeof window !== 'undefined' && !(window as any).electronAPI) {
        // If not Electron, or electronAPI is not exposed, assume ready for other platforms
        // or handle as a non-Electron environment.
        setIsElectronApiReady(true);
      }
      const service = await getDbService();
      setInitializedDbService(service);
    };
    initializeService();
  }, []);

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
    if (!initializedDbService) return;
    const encryptedEntries = await cryptoService.encryptEntries(vault.entries, vault.vaultKey);
    const encryptedVaultData: EncryptedVault = {
        ...vault.encryptedVault,
        entries: encryptedEntries,
    };
    await initializedDbService.saveVault(vault.name, encryptedVaultData);
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
        return currentVaultName ? <UnlockVaultPage vaultName={currentVaultName} onUnlock={handleUnlock} onBack={handleBackToHome} onVaultDeleted={handleBackToHome} /> : <HomePage onCreateNew={handleCreateNew} onSelectVault={handleSelectVault} />;
      case 'home':
      default:
        return <HomePage onCreateNew={handleCreateNew} onSelectVault={handleSelectVault} />;
    }
  };

  if (!isElectronApiReady || !initializedDbService) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <div className="w-full max-w-4xl text-center text-text-primary">
          Loading application (waiting for Electron API and DB Service)...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {renderView()}
      </div>
    </div>
  );
}
