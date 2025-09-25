export interface ApiKey {
  service: string;
  key: string;
  status: "valid" | "invalid" | "untested";
}

export interface AppSettings {
  // Feature Flags
  autopilot: boolean;
  uploader_youtube: boolean;
  uploader_tiktok: boolean;
  experiments: boolean;

  // Autopilot Parameters
  fetchInterval: number; // minutes
  topKClips: number;
  dailyUploadCap: number;
  retentionThreshold: number; // percentage

  // Trending Settings
  region: string;
  categories: string[];
  shortsOnly: boolean;

  // Render Settings
  aspectRatio: '9:16' | '16:9' | '1:1';
  resolution: string;
  durationCap: number; // seconds

  // Audio Settings
  lufsNormalization: boolean;
  targetLUFS: number;
  duckingLevel: number;

  // Upload Settings
  youtubePrivacy: 'private' | 'unlisted' | 'public';
  tiktokPostAsDraft: boolean;
  
  // General Settings
  notifications: boolean;
  autoSave: boolean;
  darkMode: boolean;
  debugMode: boolean;
  maxConcurrentJobs: number;
  cacheSize: number;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

export interface PipelineStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  error?: string;
}

export interface ContentItem {
  id: string;
  sourceUrl: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: number;
  viewCount: number;
  likeCount: number;
  aiScore: number;
  status: 'discovered' | 'scored' | 'processing' | 'ready' | 'uploaded' | 'failed';
  processedVideoPath?: string;
  uploadedUrls?: {
    youtube?: string;
    tiktok?: string;
  };
  createdAt: Date;
  processedAt?: Date;
  uploadedAt?: Date;
}

export interface AnalyticsData {
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
  costPerRequest: number;
  dailyStats: {
    date: string;
    requests: number;
    uploads: number;
    revenue: number;
  }[];
  modelPerformance: {
    model: string;
    accuracy: number;
    speed: number;
    cost: number;
    usage: number;
    status: 'active' | 'standby';
  }[];
}

export const DEFAULT_SETTINGS: AppSettings = {
  // Feature Flags
  autopilot: false,
  uploader_youtube: false,
  uploader_tiktok: false,
  experiments: false,

  // Autopilot Parameters
  fetchInterval: 60,
  topKClips: 10,
  dailyUploadCap: 5,
  retentionThreshold: 70,

  // Trending Settings
  region: 'US',
  categories: ['0'], // All categories
  shortsOnly: true,

  // Render Settings
  aspectRatio: '9:16',
  resolution: '1080x1920',
  durationCap: 60,

  // Audio Settings
  lufsNormalization: true,
  targetLUFS: -14,
  duckingLevel: -12,

  // Upload Settings
  youtubePrivacy: 'unlisted',
  tiktokPostAsDraft: true,

  // General Settings
  notifications: true,
  autoSave: true,
  darkMode: true,
  debugMode: false,
  maxConcurrentJobs: 3,
  cacheSize: 1024,
  logLevel: 'info'
};