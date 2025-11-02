import type { EncryptedVault } from '../types';

interface IDBService {
  getVaultNames(): Promise<string[]>;
  saveVaultNames(names: string[]): Promise<void>;
  getVault(name: string): Promise<EncryptedVault | null>;
  saveVault(name: string, data: EncryptedVault): Promise<void>;
  deleteVault(name: string): Promise<void>;
}

let _currentDbService: IDBService | null = null; // Use _ to denote it's internal and not directly exported

async function getInitializedDbService(): Promise<IDBService> {
  if (_currentDbService) {
    return _currentDbService;
  }

  // Detect platform and load the appropriate dbService
  const hasElectronAPI = typeof window !== 'undefined' && !!(window as any).electronAPI;
  const hasElectronSQLite = hasElectronAPI && !!(window as any).electronAPI.sqlite;
  const isTauri = typeof window !== 'undefined' && !!(window as any).__TAURI__;
  const isCapacitor = typeof window !== 'undefined' && !!(window as any).Capacitor && !!(window as any).Capacitor.isNativePlatform;
  const isElectron = hasElectronAPI;

  console.log('dbService: Detection - hasElectronAPI:', hasElectronAPI, 'hasElectronSQLite:', hasElectronSQLite, 'isTauri:', isTauri, 'isCapacitor:', isCapacitor);

  if (isElectron && hasElectronSQLite) {
    // Electron environment with SQLite
    console.log('dbService: Platform detected: Electron with SQLite');
    const { dbService: electronDbService } = await import('./dbService.electron');
    _currentDbService = electronDbService;
  } else if (isTauri) {
    // Tauri environment
    console.log('dbService: Platform detected: Tauri');
    const { dbService: tauriDbService } = await import('./dbService.tauri');
    _currentDbService = tauriDbService;
  } else if (isCapacitor) {
    // Capacitor environment (mobile)
    console.log('dbService: Platform detected: Capacitor');
    const { dbService: capacitorDbService } = await import('./dbService.capacitor');
    _currentDbService = capacitorDbService;
  } else {
    // Web environment (default) or Electron without SQLite
    console.log('dbService: Platform detected: Web (or Electron fallback)');
    const { dbService: webDbService } = await import('./dbService.web');
    _currentDbService = webDbService;
  }
  return _currentDbService;
}

export async function getDbService(): Promise<IDBService> {
  return getInitializedDbService();
}
