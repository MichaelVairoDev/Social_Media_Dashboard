export interface SocialMetric {
  id?: string;
  platform: string;
  followers: number;
  engagement: number;
  posts: number;
  likes?: number;
  comments?: number;
  shares?: number;
  views?: number;
  timestamp: any;
  metadata?: any;
  userId?: string;
}

export type SocialPlatform = 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok' | 'pinterest';

export interface PlatformStats {
  followers: number;
  engagement: number;
  posts: number;
}

export interface AnalyticsSummary {
  totalFollowers: number;
  totalEngagement: number;
  platformStats: {
    [key: string]: PlatformStats;
  };
  recentMetrics: SocialMetric[];
}

export interface PlatformComparison {
  [platform: string]: {
    followers: number[];
    engagement: number[];
    posts: number[];
    timestamps: any[];
  };
}

export interface PredictionData {
  [platform: string]: {
    estimatedFollowers: number;
    estimatedEngagement: number;
    basedOn: {
      current: SocialMetric;
      previous: SocialMetric;
    };
  };
} 