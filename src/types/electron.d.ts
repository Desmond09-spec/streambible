export interface ElectronAPI {
  saveFile: (content: string, filename: string) => Promise<{ success: boolean; filePath?: string; error?: string }>;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}
