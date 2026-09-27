/**
 * YouTubeService - Backend integration for YouTube Data API v3
 * Handles video discovery and metadata collection for career learning paths.
 */
export class YouTubeService {
  private static instance: YouTubeService;
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  private constructor() {
    this.apiKey = ''; // Initialized lazily
  }

  private getApiKey(): string {
    if (!this.apiKey) {
      this.apiKey = process.env.YOUTUBE_API_KEY || '';
    }
    return this.apiKey;
  }

  public static getInstance(): YouTubeService {
    if (!YouTubeService.instance) {
      YouTubeService.instance = new YouTubeService();
    }
    return YouTubeService.instance;
  }

  public isConfigured(): boolean {
    return !!this.getApiKey();
  }

  /**
   * Discovers relevant technical videos for a specific topic and career.
   */
  public async searchVideos(query: {
    career: string;
    topic: string;
    maxResults?: number;
  }) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('YouTube API key not configured');
    }

    const searchQuery = `${query.career} ${query.topic} technical explanation tutorial`.trim();
    const url = new URL(`${this.baseUrl}/search`);
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('q', searchQuery);
    url.searchParams.set('type', 'video');
    url.searchParams.set('maxResults', String(query.maxResults || 3));
    url.searchParams.set('key', apiKey);

    const response = await fetch(url.toString());
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`YouTube API failed: ${JSON.stringify(error)}`);
    }

    const data: any = await response.json();
    return (data.items || []).map((item: any) => ({
      id: `yt-${item.id?.videoId || Math.random().toString(36).substring(2, 8)}`,
      title: item.snippet?.title || `${query.topic} Video Tutorial`,
      provider: item.snippet?.channelTitle || 'YouTube',
      thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url,
      description: item.snippet?.description,
      topic: query.topic,
      url: `https://www.youtube.com/watch?v=${item.id?.videoId}`,
    }));
  }
}

export const youtubeService = YouTubeService.getInstance();
