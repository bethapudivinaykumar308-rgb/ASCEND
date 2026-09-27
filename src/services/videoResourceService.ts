import { LearningResource } from '../types';

export interface VideoSearchQuery {
  career: string;
  level: number;
  domain?: string;
  topic: string;
  technology?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface VideoResourceResult {
  available: boolean;
  message: string;
  resources: LearningResource[];
}

export const videoResourceService = {
  /**
   * Search video resources via server endpoint.
   * If YouTube API key is configured on server, returns real, verified video resources.
   * If unconfigured, cleanly returns available: false without fake URLs or mock links.
   */
  async getTopicVideos(query: VideoSearchQuery): Promise<VideoResourceResult> {
    try {
      const params = new URLSearchParams({
        career: query.career,
        level: String(query.level),
        domain: query.domain || '',
        topic: query.topic,
        technology: query.technology || '',
        difficulty: query.difficulty || 'beginner',
      });

      const response = await fetch(`/api/video-resources?${params.toString()}`);
      if (!response.ok) {
        return {
          available: false,
          message: 'Video resource service is temporarily unavailable.',
          resources: [],
        };
      }

      const data = await response.json();
      return {
        available: data.available || false,
        message: data.message || '',
        resources: data.resources || [],
      };
    } catch {
      return {
        available: false,
        message: 'Could not contact video resource service. Use official documentation below.',
        resources: [],
      };
    }
  },
};
