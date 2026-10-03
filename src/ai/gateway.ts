import type { AiProvider, AiProviderConfig } from '../app/types';
import type { WeaknessAnalysis, QuizQuestion, ScenarioTask, AiFeedback } from './schemas';
import { mimoProvider } from './providers/mimo-provider';
import { getPref, setPref } from '../storage/local-preferences';
import { getStoredToken } from '../storage/token-vault';

const DEFAULT_CONFIG: AiProviderConfig = {
  id: 'mimo',
  label: 'MiMo（小米）',
  baseUrl: 'https://api.xiaomimimo.com/v1',
  model: 'mimo-v2.6-flash',
  authScheme: 'bearer',
  tokenMode: 'memory',
  supportsStreaming: false,
  maxOutputTokens: 512,
  requestTimeoutMs: 30000,
  enabled: true,
};

export function getAiConfig(): AiProviderConfig {
  return getPref<AiProviderConfig>('aiConfig', DEFAULT_CONFIG);
}

export function saveAiConfig(config: Partial<AiProviderConfig>): void {
  const current = getAiConfig();
  setPref('aiConfig', { ...current, ...config });
}

function getProvider(config: AiProviderConfig): AiProvider {
  // In future, look up from a registry. For now only MiMo.
  return mimoProvider;
}

export async function aiChat(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options: { responseFormat?: 'text' | 'json'; maxTokens?: number } = {},
): Promise<string> {
  const config = getAiConfig();
  const token = await getStoredToken();
  if (!token) throw Object.assign(new Error('no-token'), { code: 'no-token' });

  const provider = getProvider(config);
  const response = await provider.chat({
    messages,
    responseFormat: options.responseFormat,
    maxOutputTokens: options.maxTokens ?? config.maxOutputTokens,
  }, config, token);

  return response.text;
}

export async function testAiConnection(): Promise<{ ok: boolean; message: string }> {
  const config = getAiConfig();
  const token = await getStoredToken();
  if (!token) return { ok: false, message: '尚未設定 AI token' };

  const provider = getProvider(config);
  return provider.healthCheck(config, token);
}

export function hasAiToken(): Promise<boolean> {
  return getStoredToken().then(t => !!t);
}

/** Parse JSON from AI response, handling markdown code fences */
export function parseAiJson<T>(raw: string): T | null {
  try { return JSON.parse(raw); } catch {}
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) {
    try { return JSON.parse(match[1]); } catch {}
  }
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try { return JSON.parse(raw.slice(start, end + 1)); } catch {}
  }
  return null;
}

// ---- Structured AI methods ----

export async function analyzeWeakness(
  hardPhrases: Array<{ english: string; example?: string; scenario?: string }>,
  recentSessions: Array<{ topicPackId?: string; phrasesPracticed: number; score: number }>,
): Promise<WeaknessAnalysis | null> {
  const phrasesList = hardPhrases.map(p => p.example || p.english).join('\n');
  const sessionsSummary = recentSessions.slice(-10).map(s =>
    `topic=${s.topicPackId || 'unknown'}, phrases=${s.phrasesPracticed}, score=${s.score}`
  ).join('\n');

  const prompt = `Analyze this English learner's weak areas based on their practice data.

Phrases they rated as difficult:
${phrasesList || '(none yet)'}

Recent practice sessions:
${sessionsSummary || '(none yet)'}

Respond in this EXACT JSON format:
{"weakPhrases":["phrase1","phrase2"],"pattern":"what they struggle with","focusTopic":"topic-id","suggestedScenario":"scenario-name"}`;

  const raw = await aiChat([{ role: 'user', content: prompt }], { responseFormat: 'json', maxTokens: 256 });
  return parseAiJson<WeaknessAnalysis>(raw);
}

export async function generateQuiz(
  phrases: Array<{ id: string; english: string; example?: string }>,
): Promise<QuizQuestion[]> {
  const phrasesList = phrases.map(p => `${p.english} (example: ${p.example || p.english})`).join('\n');

  const prompt = `Create fill-in-the-blank English quiz questions from these phrases.
Replace ONE key word/phrase in each sentence with ___. The answer should be the word that fills the blank.

Phrases:
${phrasesList}

Respond in this EXACT JSON format:
{"questions":[{"phraseId":"the-original-id","question":"sentence with ___","answer":"the-word-to-fill","hint":"中文提示"}]}`;

  const raw = await aiChat([{ role: 'user', content: prompt }], { responseFormat: 'json', maxTokens: 512 });
  const result = parseAiJson<{ questions: QuizQuestion[] }>(raw);
  return result?.questions ?? [];
}

export async function generateScenario(
  weakPhrases: string[],
  topic: string,
): Promise<ScenarioTask | null> {
  const phraseList = weakPhrases.join('\n');

  const prompt = `Create a realistic English workplace scenario for this B2 learner.
They need to use these phrases in context:

${phraseList}

Topic: ${topic}

Respond in this EXACT JSON format:
{"scenario":"what's happening","role":"who the AI will play","question":"the question they'll hear","expectedKeyPhrases":["phrase1","phrase2"],"successCriteria":"what a good answer includes"}`;

  const raw = await aiChat([{ role: 'user', content: prompt }], { responseFormat: 'json', maxTokens: 384 });
  return parseAiJson<ScenarioTask>(raw);
}

export async function scoreResponse(
  userResponse: string,
  expectedPhrases: string[],
  question: string,
): Promise<AiFeedback | null> {
  const prompt = `Score this English learner's response to a workplace question.

Question: ${question}
Expected key phrases: ${expectedPhrases.join('; ')}

Their response: "${userResponse}"

Respond in this EXACT JSON format:
{"correct":true/false,"score":0-100,"corrections":["correction1","correction2"],"nextQuestion":"follow-up question","improvementTip":"one specific tip"}`;

  const raw = await aiChat([{ role: 'user', content: prompt }], { responseFormat: 'json', maxTokens: 384 });
  return parseAiJson<AiFeedback>(raw);
}
