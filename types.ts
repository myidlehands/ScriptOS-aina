
export enum ScriptStatus {
  IDEA = 'IDEA',
  DRAFTING = 'DRAFTING',
  FILMING = 'FILMING',
  EDITING = 'EDITING',
  PUBLISHED = 'PUBLISHED'
}

export type Language = 'pt-br' | 'en-us';

export interface ViralMetrics {
  hookScore: number;
  retentionScore: number;
  controversyScore: number;
  feedback: string;
}

export interface Script {
  id: string;
  title: string;
  topic: string;
  content: string;
  status: ScriptStatus;
  styleId?: string;
  createdAt: number;
  lastModified: number;
  viralMetrics?: ViralMetrics;
  estimatedViews?: number;
  language?: Language;
}

export interface StyleDNA {
  id: string;
  name: string;
  tone: string; // e.g., "Melancólico", "Agressivo"
  structure: string; // e.g., "Hook 5s -> Intro -> Deep Dive"
  audioSignature: string; // e.g., "Dark Synthwave"
  description: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface TrendReport {
  content: string;
  sources: GroundingSource[];
}

export interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  publishedAt: string;
  viewCount: string;
  viralVelocity: number; // Views per day
  description: string;
}

export type ViewState = 'DASHBOARD' | 'TREND_HUNTER' | 'WRITER' | 'DECODER' | 'PRODUCTION' | 'STUDIO';
