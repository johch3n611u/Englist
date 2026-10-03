import type { AiProvider, AiProviderConfig, NormalizedChatRequest, NormalizedChatResponse } from '../../app/types';

// See docs/mimo-contract.md for full API details
// Base URL: https://api.xiaomimimo.com/v1 (PAYG) or https://token-plan-cn.xiaomimimo.com/v1 (Token Plan)
// Auth: api-key: $KEY or Authorization: Bearer $KEY
// Endpoint: POST {baseUrl}/chat/completions
// Note: max_completion_tokens (not max_tokens)

interface RawChatResponse {
  choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number };
  error?: { message?: string; code?: string };
}

function mapError(httpStatus: number, errorBody: any): string {
  if (errorBody?.error?.code) {
    const code = String(errorBody.error.code).toLowerCase();
    if (code.includes('auth') || code.includes('401')) return 'invalid-token';
    if (code.includes('403') || code.includes('forbidden')) return 'forbidden';
    if (code.includes('429') || code.includes('rate')) return 'rate-limited';
    if (code.includes('402') || code.includes('balance') || code.includes('quota')) return 'insufficient-balance';
  }
  switch (httpStatus) {
    case 401: return 'invalid-token';
    case 402: return 'insufficient-balance';
    case 403: return 'forbidden';
    case 404: return 'invalid-endpoint';
    case 421: return 'content-filtered';
    case 429: return 'rate-limited';
    case 400: return 'unsupported-format';
    default: return httpStatus >= 500 ? 'unknown' : 'unknown';
  }
}

export const mimoProvider: AiProvider = {
  id: 'mimo',

  async validateConfig(config) {
    if (!config.baseUrl) return { ok: false, message: '缺少 API 網址' };
    if (!config.model) return { ok: false, message: '缺少模型名稱' };
    return { ok: true, message: '設定正確' };
  },

  async healthCheck(config, token) {
    try {
      const res = await fetch(`${config.baseUrl}/models`, {
        headers: {
          'api-key': token,
          'Authorization': `Bearer ${token}`,
          'Origin': window.location.origin,
        },
        signal: AbortSignal.timeout(config.requestTimeoutMs),
      });
      if (res.ok) return { ok: true, message: '連線正常' };
      const body = await res.json().catch(() => null);
      return { ok: false, message: mapError(res.status, body) };
    } catch (e: any) {
      if (e.name === 'TimeoutError') return { ok: false, message: 'timeout' };
      return { ok: false, message: 'network' };
    }
  },

  async chat(request, config, token): Promise<NormalizedChatResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'api-key': token,
      'Authorization': `Bearer ${token}`,
    };

    const body: Record<string, any> = {
      model: config.model,
      messages: request.messages,
      stream: false,
    };

    if (request.system) {
      body.messages = [{ role: 'system', content: request.system }, ...request.messages];
    }
    if (request.maxOutputTokens) body.max_completion_tokens = request.maxOutputTokens;
    if (request.temperature) body.temperature = request.temperature;

    const res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(config.requestTimeoutMs),
    });

    const raw: RawChatResponse = await res.json().catch(() => ({}));

    if (!res.ok) {
      const code = mapError(res.status, raw);
      throw Object.assign(new Error(code), { code });
    }

    const text = raw.choices?.[0]?.message?.content ?? '';
    return {
      text,
      provider: 'mimo',
      model: config.model,
      usage: raw.usage ? {
        inputTokens: raw.usage.prompt_tokens,
        outputTokens: raw.usage.completion_tokens,
      } : undefined,
      finishReason: raw.choices?.[0]?.finish_reason,
    };
  },
};
