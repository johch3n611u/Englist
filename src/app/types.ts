// ---- PhraseCard ----
export interface PhraseCard {
  id: string;
  english: string;       // template: "Hi, I'm ___. I work in ___."
  example?: string;      // concrete: "Hi, I'm Tom. I work in marketing."
  meaning?: string;
  tags: string[];
  scenario?: 'daily' | 'small-talk' | 'business' | 'repair';
  difficulty: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
  updatedAt: string;
  nextReviewAt: string;
  lastScore?: number;
  reviewCount: number;
  /** Custom phrases only — no AI needed */
  isCustom?: boolean;
}

// ---- Voice ----
export interface VoiceSettings {
  voiceName?: string;
  lang: string;
  rate: number;       // 0.6 - 1.4
  pitch: number;      // 0.8 - 1.2
  volume: number;     // 0 - 1
  sentencePauseMs: number;
  repeatCount: number;
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  lang: 'en-US',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  sentencePauseMs: 600,
  repeatCount: 1,
};

// ---- TopicPack ----
export interface TopicPack {
  id: string;
  title: string;
  titleCn: string;
  level: 'b1' | 'b2' | 'c1';
  category: 'small-talk' | 'business' | 'repair' | 'listening';
  phrases: PhraseCard[];
}

// ---- Practice Session ----
export interface PracticeSession {
  id: string;
  startedAt: string;
  endedAt?: string;
  mode: 'quick' | 'review' | 'custom' | 'ai';
  topicPackId?: string;
  phrasesPracticed: number;
  corrections: number;
  score: number; // self-rated 1-3
  durationMs: number;
}

// ---- Review ----
export interface ReviewEntry {
  phraseId: string;
  nextReviewAt: string;
  interval: number; // days
  easeFactor: number;
  repetitions: number;
}

// ---- AI Types ----
export type AiProviderId = 'mimo' | 'openai' | 'anthropic' | 'gemini' | 'custom';

export interface AiProviderConfig {
  id: AiProviderId;
  label: string;
  baseUrl: string;
  model: string;
  authScheme: 'bearer' | 'api-key';
  tokenMode: 'memory' | 'session' | 'device-encrypted';
  supportsStreaming: boolean;
  maxOutputTokens: number;
  requestTimeoutMs: number;
  enabled: boolean;
}

export interface NormalizedChatRequest {
  system?: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  responseFormat?: 'text' | 'json';
  temperature?: number;
  maxOutputTokens?: number;
  stream?: boolean;
  metadata?: { feature: string; locale: string; targetLevel: string };
}

export interface NormalizedChatResponse {
  text: string;
  provider: AiProviderId;
  model: string;
  usage?: { inputTokens?: number; outputTokens?: number };
  finishReason?: string;
}

export interface AiProvider {
  id: AiProviderId;
  validateConfig(config: AiProviderConfig): Promise<{ ok: boolean; message: string }>;
  chat(request: NormalizedChatRequest, config: AiProviderConfig, token: string): Promise<NormalizedChatResponse>;
  healthCheck(config: AiProviderConfig, token: string): Promise<{ ok: boolean; message: string }>;
}

export type ProviderErrorCode =
  | 'invalid-token' | 'forbidden' | 'invalid-model' | 'invalid-endpoint'
  | 'content-filtered' | 'insufficient-balance' | 'rate-limited'
  | 'cors-blocked' | 'timeout' | 'network' | 'unsupported-format' | 'unknown';

// ---- AI Coach Reply ----
export interface CoachReply {
  reply: string;
  nextQuestion: string;
  corrections: string[];
  usefulPhrases: string[];
  shouldContinue: boolean;
}

export interface PhraseVariants {
  natural: string;
  simple: string;
  formal: string;
  alternatives: string[];
}

// ---- App State ----
export interface AppState {
  currentView: string;
  onboardingDone: boolean;
  voiceSettings: VoiceSettings;
  phrases: PhraseCard[];
  reviews: ReviewEntry[];
  sessions: PracticeSession[];
  practiceActive: boolean;
  practiceTimeLeft: number;
  offline: boolean;
}

// ---- Views ----
export type ViewRenderer = (container: HTMLElement) => void;
