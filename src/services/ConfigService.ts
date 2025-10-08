import { SupabaseService } from './SupabaseService';

export interface AppConfig {
  youtube: {
    apiKey: string;
    oauth?: {
      clientId: string;
      clientSecret: string;
      refreshToken: string;
    };
  };
  tiktok: {
    accessToken: string;
    appId: string;
    appSecret: string;
  };
  ai: {
    provider: 'openai' | 'anthropic';
    openaiKey?: string;
    anthropicKey?: string;
  };
  pipeline: {
    fetchInterval: number;
    topKClips: number;
    retentionThreshold: number;
    region: string;
    shortsOnly: boolean;
    maxConcurrentJobs: number;
  };
  uploaders: {
    youtube: boolean;
    tiktok: boolean;
    instagram: boolean;
  };
  privacy: {
    youtube: 'private' | 'unlisted' | 'public';
    tiktok: 'public' | 'private' | 'friends';
    tiktokPostAsDraft: boolean;
  };
}

export class ConfigService {
  private static instance: ConfigService;
  private supabase: SupabaseService;
  private config: AppConfig | null = null;

  private constructor() {
    this.supabase = SupabaseService.getInstance();
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  async loadConfig(): Promise<AppConfig> {
    if (this.config) {
      return this.config;
    }

    const defaultConfig: AppConfig = {
      youtube: {
        apiKey: ''
      },
      tiktok: {
        accessToken: '',
        appId: '',
        appSecret: ''
      },
      ai: {
        provider: 'openai'
      },
      pipeline: {
        fetchInterval: 60,
        topKClips: 5,
        retentionThreshold: 70,
        region: 'US',
        shortsOnly: true,
        maxConcurrentJobs: 3
      },
      uploaders: {
        youtube: false,
        tiktok: false,
        instagram: false
      },
      privacy: {
        youtube: 'private',
        tiktok: 'private',
        tiktokPostAsDraft: true
      }
    };

    try {
      const storedConfig = await this.supabase.getSetting('app_config');
      if (storedConfig) {
        this.config = { ...defaultConfig, ...storedConfig };
      } else {
        this.config = defaultConfig;
      }

      const youtubeKey = await this.supabase.getApiKey('youtube');
      if (youtubeKey) {
        this.config.youtube = { ...this.config.youtube, ...youtubeKey.key_data };
      }

      const tiktokKey = await this.supabase.getApiKey('tiktok');
      if (tiktokKey) {
        this.config.tiktok = { ...this.config.tiktok, ...tiktokKey.key_data };
      }

      const aiKey = await this.supabase.getApiKey('ai');
      if (aiKey) {
        this.config.ai = { ...this.config.ai, ...aiKey.key_data };
      }

      return this.config;
    } catch (error) {
      console.error('Error loading config:', error);
      this.config = defaultConfig;
      return defaultConfig;
    }
  }

  async saveConfig(config: Partial<AppConfig>): Promise<boolean> {
    try {
      const currentConfig = await this.loadConfig();
      const newConfig = { ...currentConfig, ...config };

      await this.supabase.saveSetting('app_config', newConfig);

      if (config.youtube) {
        await this.supabase.saveApiKey('youtube', config.youtube);
      }

      if (config.tiktok) {
        await this.supabase.saveApiKey('tiktok', config.tiktok);
      }

      if (config.ai) {
        await this.supabase.saveApiKey('ai', config.ai);
      }

      this.config = newConfig;
      return true;
    } catch (error) {
      console.error('Error saving config:', error);
      return false;
    }
  }

  async updatePipelineSettings(settings: Partial<AppConfig['pipeline']>): Promise<boolean> {
    const config = await this.loadConfig();
    config.pipeline = { ...config.pipeline, ...settings };
    return this.saveConfig({ pipeline: config.pipeline });
  }

  async updateUploaderSettings(uploaders: Partial<AppConfig['uploaders']>): Promise<boolean> {
    const config = await this.loadConfig();
    config.uploaders = { ...config.uploaders, ...uploaders };
    return this.saveConfig({ uploaders: config.uploaders });
  }

  async testYouTubeConnection(): Promise<boolean> {
    try {
      const config = await this.loadConfig();
      if (!config.youtube.apiKey) return false;

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=id&chart=mostPopular&maxResults=1&key=${config.youtube.apiKey}`
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  async testAIConnection(): Promise<boolean> {
    try {
      const config = await this.loadConfig();
      if (config.ai.provider === 'openai' && config.ai.openaiKey) {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${config.ai.openaiKey}`
          }
        });
        return response.ok;
      } else if (config.ai.provider === 'anthropic' && config.ai.anthropicKey) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  getConfig(): AppConfig | null {
    return this.config;
  }

  clearCache(): void {
    this.config = null;
  }
}
