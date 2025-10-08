import YTDlpWrap from 'yt-dlp-wrap';
import path from 'path';
import fs from 'fs';

interface ProcessingJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  videoUrl: string;
  outputPath?: string;
  error?: string;
  startTime: Date;
  endTime?: Date;
}

interface ProcessingOptions {
  aspectRatio: '9:16' | '16:9' | '1:1';
  resolution: '1080x1920' | '1920x1080' | '1080x1080';
  duration: number;
  addSubtitles: boolean;
  addVoiceover: boolean;
  audioNormalization: boolean;
  targetLUFS: number;
  duckingLevel: number;
}

export class VideoProcessorReal {
  private jobs: Map<string, ProcessingJob> = new Map();
  private ytDlpWrap: YTDlpWrap;
  private outputDir: string;

  constructor(outputDir: string = './processed_videos') {
    this.ytDlpWrap = new YTDlpWrap();
    this.outputDir = outputDir;

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async processVideo(
    videoUrl: string,
    options: ProcessingOptions,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const job: ProcessingJob = {
      id: jobId,
      status: 'pending',
      progress: 0,
      videoUrl,
      startTime: new Date()
    };

    this.jobs.set(jobId, job);

    try {
      job.status = 'processing';

      const downloadedPath = await this.downloadVideo(videoUrl, jobId, (progress) => {
        job.progress = Math.floor(progress * 0.5);
        onProgress?.(job.progress);
      });

      job.progress = 50;
      onProgress?.(50);

      const processedPath = await this.convertAndOptimize(downloadedPath, options, jobId, (progress) => {
        job.progress = 50 + Math.floor(progress * 0.5);
        onProgress?.(job.progress);
      });

      fs.unlinkSync(downloadedPath);

      job.status = 'completed';
      job.outputPath = processedPath;
      job.progress = 100;
      job.endTime = new Date();
      onProgress?.(100);

      return processedPath;
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.endTime = new Date();
      throw error;
    }
  }

  private async downloadVideo(url: string, jobId: string, onProgress?: (progress: number) => void): Promise<string> {
    const outputTemplate = path.join(this.outputDir, `${jobId}_raw.%(ext)s`);

    return new Promise((resolve, reject) => {
      const ytDlpEventEmitter = this.ytDlpWrap.exec([
        url,
        '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        '-o', outputTemplate,
        '--merge-output-format', 'mp4'
      ]);

      ytDlpEventEmitter.on('progress', (progressData) => {
        const match = progressData.percent?.match(/(\d+\.?\d*)/);
        if (match) {
          const percent = parseFloat(match[1]);
          onProgress?.(percent / 100);
        }
      });

      ytDlpEventEmitter.on('close', () => {
        const outputPath = path.join(this.outputDir, `${jobId}_raw.mp4`);
        if (fs.existsSync(outputPath)) {
          resolve(outputPath);
        } else {
          reject(new Error('Downloaded file not found'));
        }
      });

      ytDlpEventEmitter.on('error', (error) => {
        reject(error);
      });
    });
  }

  private async convertAndOptimize(
    inputPath: string,
    options: ProcessingOptions,
    jobId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const ffmpeg = require('fluent-ffmpeg');
      const outputPath = path.join(this.outputDir, `${jobId}_processed.mp4`);

      let cmd = ffmpeg(inputPath);

      if (options.aspectRatio === '9:16') {
        cmd = cmd.videoFilters([
          {
            filter: 'scale',
            options: {
              w: 1080,
              h: 1920,
              force_original_aspect_ratio: 'decrease'
            }
          },
          {
            filter: 'pad',
            options: {
              w: 1080,
              h: 1920,
              x: '(ow-iw)/2',
              y: '(oh-ih)/2',
              color: 'black'
            }
          }
        ]);
      } else if (options.aspectRatio === '16:9') {
        cmd = cmd.videoFilters([
          {
            filter: 'scale',
            options: { w: 1920, h: 1080 }
          }
        ]);
      } else if (options.aspectRatio === '1:1') {
        cmd = cmd.videoFilters([
          {
            filter: 'scale',
            options: { w: 1080, h: 1080 }
          }
        ]);
      }

      if (options.duration > 0) {
        cmd = cmd.duration(options.duration);
      }

      if (options.audioNormalization) {
        cmd = cmd.audioFilters([
          `loudnorm=I=${options.targetLUFS}:TP=-1.5:LRA=11`
        ]);
      }

      cmd
        .videoCodec('libx264')
        .audioCodec('aac')
        .audioBitrate('128k')
        .outputOptions([
          '-preset medium',
          '-crf 23',
          '-movflags +faststart'
        ])
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log('FFmpeg command:', commandLine);
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            onProgress?.(progress.percent / 100);
          }
        })
        .on('end', () => {
          resolve(outputPath);
        })
        .on('error', (err) => {
          reject(err);
        })
        .run();
    });
  }

  getJob(jobId: string): ProcessingJob | undefined {
    return this.jobs.get(jobId);
  }

  getAllJobs(): ProcessingJob[] {
    return Array.from(this.jobs.values());
  }

  static readonly PRESETS = {
    YOUTUBE_SHORTS: {
      aspectRatio: '9:16' as const,
      resolution: '1080x1920' as const,
      duration: 60,
      addSubtitles: true,
      addVoiceover: false,
      audioNormalization: true,
      targetLUFS: -14,
      duckingLevel: -12
    },
    TIKTOK: {
      aspectRatio: '9:16' as const,
      resolution: '1080x1920' as const,
      duration: 180,
      addSubtitles: true,
      addVoiceover: false,
      audioNormalization: true,
      targetLUFS: -14,
      duckingLevel: -12
    },
    INSTAGRAM_REELS: {
      aspectRatio: '9:16' as const,
      resolution: '1080x1920' as const,
      duration: 90,
      addSubtitles: true,
      addVoiceover: false,
      audioNormalization: true,
      targetLUFS: -14,
      duckingLevel: -12
    }
  };
}
