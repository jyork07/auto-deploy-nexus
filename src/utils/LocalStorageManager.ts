import { AppSettings, ApiKey, DEFAULT_SETTINGS } from '@/types/settings';

/**
 * Local Storage Manager for ViraPilot
 * Handles all local file-based storage for offline operation
 */
export class LocalStorageManager {
  private static SETTINGS_KEY = 'virapilot-settings';
  private static API_KEYS_KEY = 'virapilot-api-keys';
  private static CONFIG_DIR = '.virapilot';

  /**
   * Load settings from localStorage (browser) or local file (Electron)
   */
  static loadSettings(): AppSettings {
    try {
      // Check if running in Electron
      if (window.electron) {
        return this.loadFromElectron<AppSettings>(this.SETTINGS_KEY, DEFAULT_SETTINGS);
      }
      
      // Browser fallback
      const stored = localStorage.getItem(this.SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    return DEFAULT_SETTINGS;
  }

  /**
   * Save settings to localStorage (browser) or local file (Electron)
   */
  static saveSettings(settings: AppSettings): void {
    try {
      if (window.electron) {
        this.saveToElectron(this.SETTINGS_KEY, settings);
      } else {
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  /**
   * Load API keys from secure local storage
   */
  static loadApiKeys(): ApiKey[] {
    try {
      if (window.electron) {
        return this.loadFromElectron<ApiKey[]>('api-keys', this.getDefaultApiKeys());
      }
      
      const stored = localStorage.getItem(this.API_KEYS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
    }
    
    return this.getDefaultApiKeys();
  }

  /**
   * Save API keys to secure local storage
   */
  static saveApiKeys(apiKeys: ApiKey[]): void {
    try {
      if (window.electron) {
        this.saveToElectron('api-keys', apiKeys);
      } else {
        localStorage.setItem(this.API_KEYS_KEY, JSON.stringify(apiKeys));
      }
    } catch (error) {
      console.error('Failed to save API keys:', error);
    }
  }

  /**
   * Get API key value by service name
   */
  static getApiKey(service: string): string | null {
    const apiKeys = this.loadApiKeys();
    const apiKey = apiKeys.find(key => key.service === service);
    return apiKey?.key || null;
  }

  /**
   * Update API key status after validation
   */
  static updateApiKeyStatus(service: string, status: ApiKey['status']): void {
    const apiKeys = this.loadApiKeys();
    const updatedKeys = apiKeys.map(key => 
      key.service === service ? { ...key, status } : key
    );
    this.saveApiKeys(updatedKeys);
  }

  /**
   * Clear all local data
   */
  static clearAllData(): void {
    try {
      if (window.electron) {
        window.electron.deleteFile('settings.json');
        window.electron.deleteFile('api-keys.json');
        window.electron.deleteFile('analytics.json');
        window.electron.deleteFile('content-queue.json');
      } else {
        localStorage.removeItem(this.SETTINGS_KEY);
        localStorage.removeItem(this.API_KEYS_KEY);
        localStorage.removeItem('virapilot-content-queue');
        localStorage.removeItem('virapilot-analytics');
      }
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }

  /**
   * Export configuration to file
   */
  static async exportConfiguration(): Promise<boolean> {
    try {
      const config = {
        settings: this.loadSettings(),
        apiKeys: this.loadApiKeys().filter(key => key.key),
        exportDate: new Date().toISOString(),
        version: '2.0.0'
      };

      if (window.electron) {
        const filePath = await window.electron.saveDialog({
          defaultPath: 'virapilot-config.json',
          filters: [{ name: 'JSON Files', extensions: ['json'] }]
        });
        
        if (filePath) {
          window.electron.writeFile(filePath, JSON.stringify(config, null, 2));
          return true;
        }
      } else {
        // Browser download
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'virapilot-config.json';
        a.click();
        URL.revokeObjectURL(url);
        return true;
      }
    } catch (error) {
      console.error('Failed to export configuration:', error);
    }
    return false;
  }

  /**
   * Import configuration from file
   */
  static async importConfiguration(): Promise<boolean> {
    try {
      let data: any;

      if (window.electron) {
        const filePath = await window.electron.openDialog({
          filters: [{ name: 'JSON Files', extensions: ['json'] }]
        });
        
        if (filePath) {
          const content = window.electron.readFile(filePath);
          data = JSON.parse(content);
        }
      } else {
        // Browser file input (would need UI component)
        return false;
      }

      if (data) {
        if (data.settings) {
          this.saveSettings({ ...DEFAULT_SETTINGS, ...data.settings });
        }
        if (data.apiKeys && Array.isArray(data.apiKeys)) {
          const currentKeys = this.loadApiKeys();
          const mergedKeys = currentKeys.map(currentKey => {
            const importedKey = data.apiKeys.find((k: ApiKey) => k.service === currentKey.service);
            return importedKey ? { ...currentKey, ...importedKey } : currentKey;
          });
          this.saveApiKeys(mergedKeys);
        }
        return true;
      }
    } catch (error) {
      console.error('Failed to import configuration:', error);
    }
    return false;
  }

  /**
   * Electron-specific file operations
   */
  private static loadFromElectron<T>(key: string, defaultValue: T): T {
    try {
      const content = window.electron.readConfigFile(`${key}.json`);
      return content ? JSON.parse(content) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private static saveToElectron(key: string, data: any): void {
    window.electron.writeConfigFile(`${key}.json`, JSON.stringify(data, null, 2));
  }

  private static getDefaultApiKeys(): ApiKey[] {
    return [
      { service: "OpenAI", key: "", status: "untested" },
      { service: "Anthropic", key: "", status: "untested" },
      { service: "Google AI", key: "", status: "untested" },
      { service: "YouTube Data API", key: "", status: "untested" },
      { service: "TikTok API", key: "", status: "untested" },
      { service: "Tavily Search", key: "", status: "untested" }
    ];
  }

  /**
   * Validate API key format
   */
  static validateApiKey(service: string, key: string): boolean {
    const patterns: { [key: string]: RegExp } = {
      'OpenAI': /^sk-[a-zA-Z0-9]{20,}$/,
      'Anthropic': /^sk-ant-[a-zA-Z0-9\-_]{95,}$/,
      'Google AI': /^AIza[a-zA-Z0-9\-_]{35}$/,
      'YouTube Data API': /^AIza[a-zA-Z0-9\-_]{35}$/,
      'TikTok API': /^[a-zA-Z0-9]{32,}$/,
      'Tavily Search': /^tvly-[a-zA-Z0-9]{32,}$/
    };

    const pattern = patterns[service];
    return pattern ? pattern.test(key) : key.length > 10;
  }

  /**
   * Check if feature is enabled
   */
  static isFeatureEnabled(feature: keyof AppSettings): boolean {
    const settings = this.loadSettings();
    return Boolean(settings[feature]);
  }

  /**
   * Get required API keys based on enabled features
   */
  static getRequiredApiKeys(): string[] {
    const settings = this.loadSettings();
    const required = ['OpenAI'];
    
    if (settings.uploader_youtube) {
      required.push('YouTube Data API');
    }
    
    if (settings.uploader_tiktok) {
      required.push('TikTok API');
    }
    
    if (settings.experiments) {
      required.push('Tavily Search');
    }
    
    return required;
  }

  /**
   * Validate that all required API keys are configured
   */
  static validateRequiredKeys(): { valid: boolean; missing: string[] } {
    const required = this.getRequiredApiKeys();
    const apiKeys = this.loadApiKeys();
    const missing: string[] = [];
    
    for (const service of required) {
      const apiKey = apiKeys.find(key => key.service === service);
      if (!apiKey?.key || apiKey.status === 'invalid') {
        missing.push(service);
      }
    }
    
    return {
      valid: missing.length === 0,
      missing
    };
  }
}

// Extend Window interface for Electron API
declare global {
  interface Window {
    electron?: {
      readConfigFile: (filename: string) => string;
      writeConfigFile: (filename: string, content: string) => void;
      deleteFile: (filename: string) => void;
      readFile: (filepath: string) => string;
      writeFile: (filepath: string, content: string) => void;
      saveDialog: (options: any) => Promise<string | null>;
      openDialog: (options: any) => Promise<string | null>;
    };
  }
}
