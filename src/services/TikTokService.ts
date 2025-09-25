interface TikTokUploadData {
  title: string;
  description: string;
  hashtags: string[];
  filePath: string;
  privacy: 'public' | 'private' | 'friends';
  allowComments: boolean;
  allowDuet: boolean;
  allowStitch: boolean;
  postAsDraft: boolean;
}

interface TikTokUploadResponse {
  success: boolean;
  videoId?: string;
  shareUrl?: string;
  error?: string;
}

export class TikTokService {
  private accessToken: string;
  private appId: string;
  private appSecret: string;

  constructor(accessToken: string, appId: string, appSecret: string) {
    this.accessToken = accessToken;
    this.appId = appId;
    this.appSecret = appSecret;
  }

  async uploadVideo(uploadData: TikTokUploadData): Promise<TikTokUploadResponse> {
    try {
      console.log('Uploading to TikTok:', uploadData);

      // Phase 1: Initialize upload
      const initResponse = await this.initializeUpload(uploadData);
      if (!initResponse.success) {
        return initResponse;
      }

      // Phase 2: Upload video file
      const uploadResponse = await this.uploadVideoFile(
        uploadData.filePath, 
        initResponse.uploadUrl!
      );
      if (!uploadResponse.success) {
        return uploadResponse;
      }

      // Phase 3: Publish video
      const publishResponse = await this.publishVideo(
        uploadResponse.uploadId!,
        uploadData
      );

      return publishResponse;
    } catch (error) {
      console.error('TikTok upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  private async initializeUpload(uploadData: TikTokUploadData): Promise<{
    success: boolean;
    uploadUrl?: string;
    uploadId?: string;
    error?: string;
  }> {
    try {
      // TikTok API endpoint for initializing upload
      const response = await fetch('https://open-api.tiktok.com/share/video/upload/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_info: {
            source: 'FILE_UPLOAD',
            video_size: await this.getFileSize(uploadData.filePath),
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`TikTok API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        uploadUrl: data.data.upload_url,
        uploadId: data.data.upload_id
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initialize upload'
      };
    }
  }

  private async uploadVideoFile(filePath: string, uploadUrl: string): Promise<{
    success: boolean;
    uploadId?: string;
    error?: string;
  }> {
    try {
      // In a real implementation, this would read the file and upload it
      console.log(`Uploading file ${filePath} to ${uploadUrl}`);
      
      // Simulate file upload
      await this.sleep(5000);
      
      return {
        success: true,
        uploadId: `upload_${Date.now()}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'File upload failed'
      };
    }
  }

  private async publishVideo(uploadId: string, uploadData: TikTokUploadData): Promise<TikTokUploadResponse> {
    try {
      const postInfo = {
        title: uploadData.title,
        privacy_level: uploadData.privacy.toUpperCase(),
        disable_duet: !uploadData.allowDuet,
        disable_comment: !uploadData.allowComments,
        disable_stitch: !uploadData.allowStitch,
        video_cover_timestamp_ms: 1000, // First second as cover
      };

      const response = await fetch('https://open-api.tiktok.com/share/video/publish/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_info: postInfo,
          source_info: {
            video_id: uploadId,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`TikTok publish error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        videoId: data.data.video_id,
        shareUrl: data.data.share_url
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to publish video'
      };
    }
  }

  async getVideoAnalytics(videoId: string): Promise<{
    views: number;
    likes: number;
    shares: number;
    comments: number;
    playTime: number;
  }> {
    try {
      const response = await fetch(`https://open-api.tiktok.com/research/video/query/?video_id=${videoId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`TikTok analytics error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        views: data.data.video_views,
        likes: data.data.like_count,
        shares: data.data.share_count,
        comments: data.data.comment_count,
        playTime: data.data.video_duration
      };
    } catch (error) {
      console.error('Error fetching TikTok analytics:', error);
      return {
        views: 0,
        likes: 0,
        shares: 0,
        comments: 0,
        playTime: 0
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch('https://open-api.tiktok.com/oauth/access_token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_key: this.appId,
          client_secret: this.appSecret,
          grant_type: 'client_credentials',
        }),
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  private async getFileSize(filePath: string): Promise<number> {
    // In a real implementation, this would get the actual file size
    // For simulation, return a mock size
    return 1024 * 1024 * 50; // 50MB
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}