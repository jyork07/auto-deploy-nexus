import { google, youtube_v3 } from 'googleapis';
import fs from 'fs';

interface TrendingVideo {
  id: string;
  title: string;
  channelTitle: string;
  description: string;
  thumbnails: {
    default: { url: string };
    medium: { url: string };
    high: { url: string };
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
  contentDetails: {
    duration: string;
  };
  snippet: {
    publishedAt: string;
    categoryId: string;
    tags?: string[];
  };
}

interface YouTubeSearchParams {
  region?: string;
  category?: string;
  maxResults?: number;
  shortsOnly?: boolean;
}

export class YouTubeService {
  private apiKey: string;
  private youtube: youtube_v3.Youtube;
  private oauth2Client?: any;

  constructor(apiKey: string, oauth2Credentials?: { client_id: string; client_secret: string; refresh_token: string }) {
    this.apiKey = apiKey;
    this.youtube = google.youtube({
      version: 'v3',
      auth: apiKey
    });

    if (oauth2Credentials) {
      this.oauth2Client = new google.auth.OAuth2(
        oauth2Credentials.client_id,
        oauth2Credentials.client_secret,
        'urn:ietf:wg:oauth:2.0:oob'
      );
      this.oauth2Client.setCredentials({
        refresh_token: oauth2Credentials.refresh_token
      });
    }
  }

  async fetchTrendingVideos(params: YouTubeSearchParams = {}): Promise<TrendingVideo[]> {
    const {
      region = 'US',
      category = '0',
      maxResults = 50,
      shortsOnly = false
    } = params;

    try {
      // Fetch most popular videos
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?` +
        `part=snippet,statistics,contentDetails&` +
        `chart=mostPopular&` +
        `regionCode=${region}&` +
        `videoCategoryId=${category}&` +
        `maxResults=${maxResults}&` +
        `key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.statusText}`);
      }

      const data = await response.json();
      let videos = data.items as TrendingVideo[];

      // Filter for Shorts if requested
      if (shortsOnly) {
        videos = videos.filter(video => {
          const duration = this.parseDuration(video.contentDetails.duration);
          return duration <= 60; // Shorts are typically 60 seconds or less
        });
      }

      return videos;
    } catch (error) {
      console.error('Error fetching trending videos:', error);
      throw error;
    }
  }

  async searchShorts(query: string, maxResults = 25): Promise<TrendingVideo[]> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&` +
        `q=${encodeURIComponent(query)}&` +
        `type=video&` +
        `videoDuration=short&` +
        `maxResults=${maxResults}&` +
        `key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Get detailed video information
      const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
      const detailsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?` +
        `part=snippet,statistics,contentDetails&` +
        `id=${videoIds}&` +
        `key=${this.apiKey}`
      );

      const detailsData = await detailsResponse.json();
      return detailsData.items as TrendingVideo[];
    } catch (error) {
      console.error('Error searching shorts:', error);
      throw error;
    }
  }

  async uploadVideo(videoData: {
    title: string;
    description: string;
    tags: string[];
    categoryId: string;
    privacy: 'private' | 'unlisted' | 'public';
    filePath: string;
  }): Promise<string> {
    if (!this.oauth2Client) {
      throw new Error('OAuth2 credentials not configured for upload');
    }

    if (!fs.existsSync(videoData.filePath)) {
      throw new Error(`Video file not found: ${videoData.filePath}`);
    }

    try {
      const youtubeWithAuth = google.youtube({
        version: 'v3',
        auth: this.oauth2Client
      });

      const response = await youtubeWithAuth.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title: videoData.title,
            description: videoData.description,
            tags: videoData.tags,
            categoryId: videoData.categoryId
          },
          status: {
            privacyStatus: videoData.privacy,
            selfDeclaredMadeForKids: false
          }
        },
        media: {
          body: fs.createReadStream(videoData.filePath)
        }
      });

      return response.data.id || 'unknown';
    } catch (error) {
      console.error('YouTube upload error:', error);
      throw error;
    }
  }

  private parseDuration(duration: string): number {
    // Parse ISO 8601 duration format (PT1M30S)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    return hours * 3600 + minutes * 60 + seconds;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true&key=${this.apiKey}`
      );
      return response.ok;
    } catch {
      return false;
    }
  }
}