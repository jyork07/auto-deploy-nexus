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

interface YouTubeSearchItem {
  id: {
    videoId: string;
  };
}

interface YouTubeSearchResponse {
  items: YouTubeSearchItem[];
}

export class YouTubeService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
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

      const data: YouTubeSearchResponse = await response.json();

      // Get detailed video information
      const videoIds = data.items.map(item => item.id.videoId).join(',');
      const detailsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?` +
        `part=snippet,statistics,contentDetails&` +
        `id=${videoIds}&` +
        `key=${this.apiKey}`
      );

      const detailsData = (await detailsResponse.json()) as { items: TrendingVideo[] };
      return detailsData.items;
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
    // This would require OAuth2 implementation for actual uploads
    // For now, simulate the upload process
    console.log('Simulating video upload:', videoData);
    
    // Return a mock video ID
    return `mock_video_${Date.now()}`;
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