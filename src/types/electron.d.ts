export interface ElectronAPI {
  // File dialog operations
  openFileDialog: () => Promise<string | null>;
  saveFileDialog: () => Promise<string | null>;

  // File system operations
  readFile: (filePath: string) => Promise<string>;
  writeFile: (filePath: string, content: string) => Promise<boolean>;
  fileExists: (filePath: string) => Promise<boolean>;
  makeDirectory: (dirPath: string) => Promise<boolean>;
  deleteFile: (filePath: string) => Promise<boolean>;

  // Path utilities
  pathJoin: (...args: string[]) => Promise<string>;
  pathBasename: (filePath: string) => Promise<string>;
  pathDirname: (filePath: string) => Promise<string>;

  // App paths
  getAppPath: (name: string) => Promise<string>;

  // Platform info
  platform: string;
  isDev: boolean;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
