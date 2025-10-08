import { YouTubeService } from './YouTubeService';
import { AIService } from './AIService';
import { VideoProcessorReal } from './VideoProcessorReal';
import { TikTokService } from './TikTokService';
import { SupabaseService, ContentItem } from './SupabaseService';
import { ConfigService, AppConfig } from './ConfigService';

interface PipelineStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime?: Date;
  endTime?: Date;
}

export class AutopilotServiceReal {
  private youtubeService: YouTubeService;
  private aiService: AIService;
  private videoProcessor: VideoProcessorReal;
  private tiktokService: TikTokService;
  private supabase: SupabaseService;
  private config: AppConfig;
  private isRunning: boolean = false;
  private intervalId?: NodeJS.Timeout;
  private currentPipelineSteps: PipelineStep[] = [];
  private currentRunId?: string;

  constructor(config: AppConfig) {
    this.config = config;
    this.supabase = SupabaseService.getInstance();

    this.youtubeService = new YouTubeService(
      config.youtube.apiKey,
      config.youtube.oauth
    );

    this.aiService = new AIService({
      openAIKey: config.ai.openaiKey,
      anthropicKey: config.ai.anthropicKey
    });

    this.videoProcessor = new VideoProcessorReal('./processed_videos');

    this.tiktokService = new TikTokService(
      config.tiktok.accessToken,
      config.tiktok.appId,
      config.tiktok.appSecret
    );
  }

  async start(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log('🚀 ViraPilot Autopilot Started');

    await this.runAutopilotCycle();

    this.intervalId = setInterval(async () => {
      await this.runAutopilotCycle();
    }, this.config.pipeline.fetchInterval * 60 * 1000);
  }

  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    console.log('⏹️ ViraPilot Autopilot Stopped');
  }

  private async runAutopilotCycle(): Promise<void> {
    const pipelineRun = await this.supabase.createPipelineRun();
    if (!pipelineRun) {
      console.error('Failed to create pipeline run');
      return;
    }

    this.currentRunId = pipelineRun.id;

    try {
      console.log('🔄 Starting Autopilot Cycle');
      this.updatePipelineStep('discovery', 'running', 0);

      const trendingVideos = await this.youtubeService.fetchTrendingVideos({
        region: this.config.pipeline.region,
        maxResults: 50,
        shortsOnly: this.config.pipeline.shortsOnly
      });

      this.updatePipelineStep('discovery', 'completed', 100);
      this.updatePipelineStep('scoring', 'running', 0);

      const scoredContent: ContentItem[] = [];

      for (let i = 0; i < trendingVideos.length; i++) {
        const video = trendingVideos[i];

        try {
          const analysis = await this.aiService.analyzeVideo({
            title: video.title,
            description: video.description,
            viewCount: parseInt(video.statistics.viewCount),
            likeCount: parseInt(video.statistics.likeCount),
            duration: this.parseDuration(video.contentDetails.duration)
          });

          if (analysis.score >= this.config.pipeline.retentionThreshold) {
            const contentItem: ContentItem = {
              source_url: `https://youtube.com/watch?v=${video.id}`,
              title: video.title,
              description: video.description,
              thumbnail_url: video.thumbnails.high.url,
              duration: this.parseDuration(video.contentDetails.duration),
              view_count: parseInt(video.statistics.viewCount),
              like_count: parseInt(video.statistics.likeCount),
              ai_score: analysis.score,
              status: 'scored'
            };

            const saved = await this.supabase.insertContentItem(contentItem);
            if (saved) {
              scoredContent.push(saved);
            }
          }
        } catch (error) {
          console.error(`Error scoring video ${video.id}:`, error);
        }

        this.updatePipelineStep('scoring', 'running', ((i + 1) / trendingVideos.length) * 100);
      }

      this.updatePipelineStep('scoring', 'completed', 100);

      const topContent = scoredContent
        .sort((a, b) => b.ai_score - a.ai_score)
        .slice(0, this.config.pipeline.topKClips);

      await this.processContentQueue(topContent);

      await this.supabase.updatePipelineRun(pipelineRun.id!, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        items_processed: topContent.length,
        items_uploaded: topContent.filter(item => item.status === 'uploaded').length
      });

      console.log(`✅ Autopilot Cycle Complete - Processed ${topContent.length} items`);
    } catch (error) {
      console.error('❌ Autopilot Cycle Failed:', error);
      this.updatePipelineStep('discovery', 'failed', 0);

      if (this.currentRunId) {
        await this.supabase.updatePipelineRun(this.currentRunId, {
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  private async processContentQueue(items: ContentItem[]): Promise<void> {
    this.updatePipelineStep('processing', 'running', 0);

    const batchSize = this.config.pipeline.maxConcurrentJobs;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      await Promise.allSettled(batch.map(item => this.processContentItem(item)));

      const progress = Math.min(((i + batchSize) / items.length) * 100, 100);
      this.updatePipelineStep('processing', 'running', progress);
    }

    this.updatePipelineStep('processing', 'completed', 100);
  }

  private async processContentItem(item: ContentItem): Promise<void> {
    if (!item.id) return;

    try {
      console.log(`🎬 Processing: ${item.title}`);

      await this.supabase.updateContentItem(item.id, { status: 'processing' });

      const processedPath = await this.videoProcessor.processVideo(
        item.source_url,
        VideoProcessorReal.PRESETS.YOUTUBE_SHORTS,
        (progress) => {
          console.log(`Processing progress: ${Math.floor(progress * 100)}%`);
        }
      );

      await this.supabase.updateContentItem(item.id, {
        status: 'ready',
        processed_video_path: processedPath,
        processed_at: new Date().toISOString()
      });

      if (this.config.uploaders.youtube || this.config.uploaders.tiktok) {
        await this.uploadContent(item, processedPath);
      }

      console.log(`✅ Completed: ${item.title}`);
    } catch (error) {
      console.error(`❌ Failed to process ${item.title}:`, error);
      if (item.id) {
        await this.supabase.updateContentItem(item.id, { status: 'failed' });
      }
    }
  }

  private async uploadContent(item: ContentItem, processedPath: string): Promise<void> {
    if (!item.id) return;

    try {
      this.updatePipelineStep('upload', 'running', 0);

      const variants = await this.aiService.generateMetadataVariants(
        item.title,
        item.description
      );

      const uploadedUrls: Record<string, string> = {};

      if (this.config.uploaders.youtube) {
        try {
          const videoId = await this.youtubeService.uploadVideo({
            title: variants.title[0],
            description: variants.description[0],
            tags: variants.hashtags[0],
            categoryId: '22',
            privacy: this.config.privacy.youtube,
            filePath: processedPath
          });

          uploadedUrls.youtube = `https://youtube.com/watch?v=${videoId}`;
          console.log(`📺 Uploaded to YouTube: ${videoId}`);
        } catch (error) {
          console.error('YouTube upload failed:', error);
        }
      }

      if (this.config.uploaders.tiktok) {
        try {
          const result = await this.tiktokService.uploadVideo({
            title: variants.title[1],
            description: variants.description[1],
            hashtags: variants.hashtags[1],
            filePath: processedPath,
            privacy: this.config.privacy.tiktok,
            allowComments: true,
            allowDuet: true,
            allowStitch: true,
            postAsDraft: this.config.privacy.tiktokPostAsDraft
          });

          if (result.success && result.shareUrl) {
            uploadedUrls.tiktok = result.shareUrl;
            console.log(`🎵 Uploaded to TikTok: ${result.videoId}`);
          }
        } catch (error) {
          console.error('TikTok upload failed:', error);
        }
      }

      await this.supabase.updateContentItem(item.id, {
        status: 'uploaded',
        uploaded_urls: uploadedUrls,
        uploaded_at: new Date().toISOString()
      });

      this.updatePipelineStep('upload', 'completed', 100);
    } catch (error) {
      console.error('Upload failed:', error);
      this.updatePipelineStep('upload', 'failed', 0);
    }
  }

  private updatePipelineStep(stepName: string, status: PipelineStep['status'], progress: number): void {
    const stepId = stepName.toLowerCase();
    let step = this.currentPipelineSteps.find(s => s.id === stepId);

    if (!step) {
      step = {
        id: stepId,
        name: this.formatStepName(stepName),
        status: 'pending',
        progress: 0
      };
      this.currentPipelineSteps.push(step);
    }

    step.status = status;
    step.progress = progress;

    if (status === 'running' && !step.startTime) {
      step.startTime = new Date();
    } else if ((status === 'completed' || status === 'failed') && !step.endTime) {
      step.endTime = new Date();
    }
  }

  private formatStepName(stepName: string): string {
    const names: { [key: string]: string } = {
      'discovery': 'Content Discovery',
      'scoring': 'AI Scoring',
      'processing': 'Video Processing',
      'upload': 'Platform Upload'
    };
    return names[stepName] || stepName;
  }

  private parseDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    return hours * 3600 + minutes * 60 + seconds;
  }

  getStatus(): {
    isRunning: boolean;
    currentSteps: PipelineStep[];
  } {
    return {
      isRunning: this.isRunning,
      currentSteps: this.currentPipelineSteps
    };
  }

  async updateConfig(newConfig: AppConfig): Promise<void> {
    this.config = newConfig;

    if (this.isRunning) {
      this.stop();
      await this.start();
    }
  }
}
