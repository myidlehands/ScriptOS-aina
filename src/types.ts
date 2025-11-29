
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

export interface TitleVariant {
  title: string;
  psychology: string;
  score: number;
}

export interface ThumbnailData {
  concept: string;
  imagePrompt: string;
  imageBase64?: string;
}

export type ReferenceType = 'FILE' | 'URL' | 'YOUTUBE_VIDEO' | 'YOUTUBE_CHANNEL';

export interface ScriptReference {
  id: string;
  type: ReferenceType;
  data: string;
  mimeType?: string;
  title: string;
  metadata?: any;
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
  selectedTitle?: TitleVariant;
  thumbnail?: ThumbnailData;
  references?: ScriptReference[];
  duration?: string;
}

export interface StyleDNA {
  id: string;
  name: string;
  tone: string;
  structure: string;
  audioSignature: string;
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
  viralVelocity: number;
  description: string;
}

// --- IDENTITY & PROFILE ---
export interface ChannelIdentity {
  brandVoice: string; // e.g. "Sarcastic, Nihilistic, Educational"
  targetAudience: string; // e.g. "Gen Z interested in True Crime"
  manifesto: string; // The "why" of the channel
}

export interface ChannelAnalytics {
  views: number;
  subscribers: number;
  videos: number;
  avgViews: number;
  growthRate: number; // Percentage
  topVideos: { title: string; views: number }[];
  chartData?: { name: string; val: number }[]; // Real historical data
}

export interface UserProfile {
  channelId?: string;
  channelName?: string;
  channelHandle?: string;
  avatarUrl?: string;
  subscriberCount?: string;
  identity: ChannelIdentity;
  accessToken?: string; // Short-lived OAuth token
  analytics?: ChannelAnalytics;
}

// --- AUTOMATION ---
export type NodeType = 'TRIGGER_TREND' | 'ACTION_SCRIPT' | 'FILTER_STYLE' | 'OUTPUT_NOTIFY' | 'LOGIC_DELAY';

export interface AutomationNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: { label: string; config?: any; status?: 'idle' | 'running' | 'completed' };
}

export interface AutomationEdge {
  id: string;
  source: string;
  target: string;
}

export interface AutomationFlow {
  id: string;
  name: string;
  nodes: AutomationNode[];
  edges: AutomationEdge[];
  active: boolean;
}

// --- CHAT ---
export type ChatRole = 'user' | 'model';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  timestamp: number;
}

export type ViewState = 'DASHBOARD' | 'TREND_HUNTER' | 'WRITER' | 'DECODER' | 'PRODUCTION' | 'STUDIO' | 'AUTOMATIONS' | 'PROFILE';