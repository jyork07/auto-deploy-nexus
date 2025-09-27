import { AppSettings, ApiKey, DEFAULT_SETTINGS } from '@/types/settings';

interface SettingsExportData {
  settings?: Partial<AppSettings>;
  apiKeys?: ApiKey[];
  exportDate?: string;
  version?: string;
}

export class SettingsManager {
  private static SETTINGS_KEY = 'virapilot-settings';
  private static API_KEYS_KEY = 'virapilot-api-keys';

  static loadSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(this.SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all keys exist
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    return DEFAULT_SETTINGS;
  }

  static saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  static loadApiKeys(): ApiKey[] {
    try {
      const stored = localStorage.getItem(this.API_KEYS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
    }
    
    // Return default empty API keys
    return [
      { service: "OpenAI", key: "", status: "untested" },
      { service: "Anthropic", key: "", status: "untested" },
      { service: "Google AI", key: "", status: "untested" },
      { service: "YouTube Data API", key: "", status: "untested" },
      { service: "TikTok API", key: "", status: "untested" },
      { service: "Tavily Search", key: "", status: "untested" }
    ];
  }

  static saveApiKeys(apiKeys: ApiKey[]): void {
    try {
      localStorage.setItem(this.API_KEYS_KEY, JSON.stringify(apiKeys));
    } catch (error) {
      console.error('Failed to save API keys:', error);
    }
  }

  static clearAllData(): void {
    try {
      localStorage.removeItem(this.SETTINGS_KEY);
      localStorage.removeItem(this.API_KEYS_KEY);
      localStorage.removeItem('virapilot-content-queue');
      localStorage.removeItem('virapilot-analytics');
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }

  static exportConfiguration(): object {
    return {
      settings: this.loadSettings(),
      apiKeys: this.loadApiKeys().filter(key => key.key), // Only export keys that have values
      exportDate: new Date().toISOString(),
      version: '2.0.0'
    };
  }

  static importConfiguration(data: SettingsExportData): boolean {
    try {
      if (data.settings) {
        this.saveSettings({ ...DEFAULT_SETTINGS, ...data.settings });
      }
      if (data.apiKeys && Array.isArray(data.apiKeys)) {
        const currentKeys = this.loadApiKeys();
        const importedKeys = data.apiKeys;
        
        // Merge imported keys with current ones
        const mergedKeys = currentKeys.map(currentKey => {
          const importedKey = importedKeys.find((k: ApiKey) => k.service === currentKey.service);
          return importedKey ? { ...currentKey, ...importedKey } : currentKey;
        });
        
        this.saveApiKeys(mergedKeys);
      }
      return true;
    } catch (error) {
      console.error('Failed to import configuration:', error);
      return false;
    }
  }

  static validateApiKey(service: string, key: string): boolean {
    // Basic validation patterns for different services
    const patterns: { [key: string]: RegExp } = {
      'OpenAI': /^sk-[a-zA-Z0-9]{20,}$/,
      'Anthropic': /^sk-ant-[a-zA-Z0-9\-_]{95,}$/,
      'Google AI': /^AIza[a-zA-Z0-9\-_]{35}$/,
      'YouTube Data API': /^AIza[a-zA-Z0-9\-_]{35}$/,
      'TikTok API': /^[a-zA-Z0-9]{32,}$/,
      'Tavily Search': /^tvly-[a-zA-Z0-9]{32,}$/
    };

    const pattern = patterns[service];
    return pattern ? pattern.test(key) : key.length > 10; // Fallback validation
  }

  static getApiKey(service: string): string | null {
    const apiKeys = this.loadApiKeys();
    const apiKey = apiKeys.find(key => key.service === service);
    return apiKey?.key || null;
  }

  static updateApiKeyStatus(service: string, status: ApiKey['status']): void {
    const apiKeys = this.loadApiKeys();
    const updatedKeys = apiKeys.map(key => 
      key.service === service ? { ...key, status } : key
    );
    this.saveApiKeys(updatedKeys);
  }

  static isFeatureEnabled(feature: keyof AppSettings): boolean {
    const settings = this.loadSettings();
    return Boolean(settings[feature]);
  }

  static getRequiredApiKeys(): string[] {
    const settings = this.loadSettings();
    const required = ['OpenAI']; // Always required for AI features
    
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