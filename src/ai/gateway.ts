import type { AiProvider, AiProviderConfig } from '../app/types';
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
  // Try direct parse
  try { return JSON.parse(raw); } catch {}
  // Try extracting from code fences
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) {
    try { return JSON.parse(match[1]); } catch {}
  }
  // Try finding first { to last }
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try { return JSON.parse(raw.slice(start, end + 1)); } catch {}
  }
  return null;
}
