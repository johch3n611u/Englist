// ---- PhraseCard ----
export interface PhraseCard {
  id: string;
  english: string;
  meaning?: string;
  tags: string[];
  scenario?: 'daily' | 'small-talk' | 'business' | 'repair';
  difficulty: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
  updatedAt: string;
  nextReviewAt: string;
  lastScore?: number;
  reviewCount: number;
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
  mode: 'quick' | 'review' | 'custom';
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
