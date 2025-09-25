import { YouTubeService } from './YouTubeService';
import { AIService } from './AIService';
import { VideoProcessor } from './VideoProcessor';
import { TikTokService } from './TikTokService';
import { AppSettings, ContentItem, PipelineStep } from '@/types/settings';

export class AutopilotService {
  private youtubeService: YouTubeService;
  private aiService: AIService;
  private videoProcessor: VideoProcessor;
  private tiktokService: TikTokService;
  private settings: AppSettings;
  private isRunning: boolean = false;
  private intervalId?: NodeJS.Timeout;
  private contentQueue: ContentItem[] = [];
  private currentPipelineSteps: PipelineStep[] = [];

  constructor(
    youtubeService: YouTubeService,
    aiService: AIService,
    videoProcessor: VideoProcessor,
    tiktokService: TikTokService,
    settings: AppSettings
  ) {
    this.youtubeService = youtubeService;
    this.aiService = aiService;
    this.videoProcessor = videoProcessor;
    this.tiktokService = tiktokService;
    this.settings = settings;
  }

  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🚀 ViraPilot Autopilot Started');
    
    // Run initial discovery
    this.runAutopilotCycle();
    
    // Set up recurring cycles
    this.intervalId = setInterval(() => {
      this.runAutopilotCycle();
    }, this.settings.fetchInterval * 60 * 1000);
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
    try {
      console.log('🔄 Starting Autopilot Cycle');
      
      this.updatePipelineStep('discovery', 'running', 0);
      
      // Step 1: Fetch trending content
      const trendingVideos = await this.youtubeService.fetchTrendingVideos({
        region: this.settings.region,
        maxResults: 50,
        shortsOnly: this.settings.shortsOnly
      });
      
      this.updatePipelineStep('discovery', 'completed', 100);
      this.updatePipelineStep('scoring', 'running', 0);
      
      // Step 2: AI Scoring
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
          
          if (analysis.score >= this.settings.retentionThreshold) {
            const contentItem: ContentItem = {
              id: `content_${Date.now()}_${i}`,
              sourceUrl: `https://youtube.com/watch?v=${video.id}`,
              title: video.title,
              description: video.description,
              thumbnailUrl: video.thumbnails.high.url,
              duration: this.parseDuration(video.contentDetails.duration),
              viewCount: parseInt(video.statistics.viewCount),
              likeCount: parseInt(video.statistics.likeCount),
              aiScore: analysis.score,
              status: 'scored',
              createdAt: new Date()
            };
            
            scoredContent.push(contentItem);
          }
        } catch (error) {
          console.error(`Error scoring video ${video.id}:`, error);
        }
        
        this.updatePipelineStep('scoring', 'running', ((i + 1) / trendingVideos.length) * 100);
      }
      
      this.updatePipelineStep('scoring', 'completed', 100);
      
      // Step 3: Select top K content
      const topContent = scoredContent
        .sort((a, b) => b.aiScore - a.aiScore)
        .slice(0, this.settings.topKClips);
      
      // Add to processing queue
      this.contentQueue.push(...topContent);
      
      // Step 4: Process videos
      await this.processContentQueue();
      
      console.log(`✅ Autopilot Cycle Complete - Processed ${topContent.length} items`);
      
    } catch (error) {
      console.error('❌ Autopilot Cycle Failed:', error);
      this.updatePipelineStep('discovery', 'failed', 0);
    }
  }

  private async processContentQueue(): Promise<void> {
    this.updatePipelineStep('processing', 'running', 0);
    
    const itemsToProcess = this.contentQueue.splice(0, this.settings.maxConcurrentJobs);
    const processingPromises = itemsToProcess.map(item => this.processContentItem(item));
    
    await Promise.allSettled(processingPromises);
    
    this.updatePipelineStep('processing', 'completed', 100);
  }

  private async processContentItem(item: ContentItem): Promise<void> {
    try {
      console.log(`🎬 Processing: ${item.title}`);
      
      item.status = 'processing';
      
      // Step 1: Download and process video
      const processedPath = await this.videoProcessor.processVideo(
        item.sourceUrl,
        VideoProcessor.PRESETS.YOUTUBE_SHORTS
      );
      
      item.processedVideoPath = processedPath;
      item.status = 'ready';
      item.processedAt = new Date();
      
      // Step 2: Upload to platforms
      if (this.settings.uploader_youtube || this.settings.uploader_tiktok) {
        await this.uploadContent(item);
      }
      
      console.log(`✅ Completed: ${item.title}`);
      
    } catch (error) {
      console.error(`❌ Failed to process ${item.title}:`, error);
      item.status = 'failed';
    }
  }

  private async uploadContent(item: ContentItem): Promise<void> {
    try {
      this.updatePipelineStep('upload', 'running', 0);
      
      item.uploadedUrls = {};
      
      // Generate metadata variants
      const variants = await this.aiService.generateMetadataVariants(
        item.title,
        item.description
      );
      
      // Upload to YouTube
      if (this.settings.uploader_youtube && item.processedVideoPath) {
        try {
          const videoId = await this.youtubeService.uploadVideo({
            title: variants.title[0],
            description: variants.description[0],
            tags: variants.hashtags[0],
            categoryId: '22', // People & Blogs
            privacy: this.settings.youtubePrivacy,
            filePath: item.processedVideoPath
          });
          
          item.uploadedUrls.youtube = `https://youtube.com/watch?v=${videoId}`;
          console.log(`📺 Uploaded to YouTube: ${videoId}`);
        } catch (error) {
          console.error('YouTube upload failed:', error);
        }
      }
      
      // Upload to TikTok
      if (this.settings.uploader_tiktok && item.processedVideoPath) {
        try {
          const result = await this.tiktokService.uploadVideo({
            title: variants.title[1],
            description: variants.description[1],
            hashtags: variants.hashtags[1],
            filePath: item.processedVideoPath,
            privacy: 'public',
            allowComments: true,
            allowDuet: true,
            allowStitch: true,
            postAsDraft: this.settings.tiktokPostAsDraft
          });
          
          if (result.success && result.shareUrl) {
            item.uploadedUrls.tiktok = result.shareUrl;
            console.log(`🎵 Uploaded to TikTok: ${result.videoId}`);
          }
        } catch (error) {
          console.error('TikTok upload failed:', error);
        }
      }
      
      item.status = 'uploaded';
      item.uploadedAt = new Date();
      
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
    queueLength: number;
    currentSteps: PipelineStep[];
    processedCount: number;
  } {
    return {
      isRunning: this.isRunning,
      queueLength: this.contentQueue.length,
      currentSteps: this.currentPipelineSteps,
      processedCount: this.contentQueue.filter(item => item.status === 'uploaded').length
    };
  }

  getQueue(): ContentItem[] {
    return [...this.contentQueue];
  }

  updateSettings(newSettings: AppSettings): void {
    this.settings = newSettings;
    
    // Restart with new interval if running
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }
}