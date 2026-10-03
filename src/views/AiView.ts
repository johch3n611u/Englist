import type { CoachReply } from '../app/types';
import { aiChat, hasAiToken, parseAiJson } from '../ai/gateway';
import { createSpeechEngine } from '../audio/speech-engine';
import { getPref } from '../storage/local-preferences';

const SYSTEM_PROMPT = `You are an English speaking coach for intermediate (B2) learners. Keep responses short (1-2 sentences). Always ask a follow-up question. Correct at most 3 important errors per turn. Respond in this exact JSON format:
{"reply":"your response","nextQuestion":"your follow-up question","corrections":["error 1","error 2","error 3"],"usefulPhrases":["phrase1","phrase2"],"shouldContinue":true}`;

export async function renderAiView(container: HTMLElement) {
  const hasToken = await hasAiToken();

  if (!hasToken) {
    container.innerHTML = `
      <div class="ai-view">
        <h2>🤖 AI 對話練習</h2>
        <div class="ai-loading">需要設定 AI token 才能使用。</div>
        <button class="btn btn-primary" id="btn-settings">去設定</button>
        <button class="btn btn-back" id="btn-back">← 返回</button>
      </div>
    `;
    document.getElementById('btn-settings')!.onclick = () => { window.location.hash = '#/settings'; };
    document.getElementById('btn-back')!.onclick = () => { window.location.hash = '#/home'; };
    return;
  }

  const engine = createSpeechEngine();
  const voiceSettings = getPref<any>('voiceSettings', { lang: 'en-US', rate: 1.0, pitch: 1.0, volume: 1.0, sentencePauseMs: 600, repeatCount: 1 });
  const history: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  container.innerHTML = `
    <div class="ai-view">
      <h2>🤖 AI 對話練習</h2>
      <div class="ai-chat" id="ai-chat"></div>
      <div class="ai-input-area">
        <input type="text" id="ai-input" placeholder="用英文回答..." />
        <button class="btn btn-primary" id="ai-send">發送</button>
      </div>
      <button class="btn btn-back" id="btn-back">← 返回</button>
    </div>
  `;

  document.getElementById('btn-back')!.onclick = () => { window.location.hash = '#/home'; };

  const chatArea = document.getElementById('ai-chat')!;
  const input = document.getElementById('ai-input') as HTMLInputElement;
  const sendBtn = document.getElementById('ai-send') as HTMLButtonElement;

  async function send() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    sendBtn.disabled = true;

    // Show user message
    chatArea.innerHTML += `<div class="ai-message user">${escapeHtml(text)}</div>`;
    chatArea.innerHTML += `<div class="ai-loading" id="ai-loading">AI 思考中</div>`;
    chatArea.scrollTop = chatArea.scrollHeight;

    history.push({ role: 'user', content: text });

    try {
      const raw = await aiChat(
        [{ role: 'system', content: SYSTEM_PROMPT }, ...history.slice(-10)],
        { responseFormat: 'json', maxTokens: 512 },
      );

      const reply = parseAiJson<CoachReply>(raw);
      document.getElementById('ai-loading')?.remove();

      if (reply) {
        history.push({ role: 'assistant', content: reply.reply });

        let html = `<div class="ai-message coach">${escapeHtml(reply.reply)}</div>`;

        if (reply.corrections?.length) {
          html += `<div class="ai-corrections">
            <div class="ai-corrections-title">✏️ 修正（最多 3 個）</div>
            <ul>${reply.corrections.map(c => `<li>${escapeHtml(c)}</li>`).join('')}</ul>
          </div>`;
        }

        if (reply.usefulPhrases?.length) {
          html += `<div class="ai-corrections" style="background:#e8f0fe">
            <div class="ai-corrections-title" style="color:var(--color-primary)">💡 有用的句子</div>
            <ul>${reply.usefulPhrases.map(p => `<li>${escapeHtml(p)}</li>`).join('')}</ul>
          </div>`;
        }

        if (reply.nextQuestion) {
          html += `<div class="ai-next-q">❓ ${escapeHtml(reply.nextQuestion)}</div>`;
          history.push({ role: 'assistant', content: reply.nextQuestion });
        }

        chatArea.innerHTML += html;
        engine.speak(reply.nextQuestion || reply.reply, voiceSettings);
      } else {
        // JSON parse failed — show raw text
        chatArea.innerHTML += `<div class="ai-message coach">${escapeHtml(raw.slice(0, 500))}</div>`;
      }
    } catch (e: any) {
      document.getElementById('ai-loading')?.remove();
      const code = e.code || e.message;
      const msg = code === 'no-token'
        ? '需要設定 AI token'
        : code === 'invalid-token'
        ? 'AI token 無法使用，請重新檢查'
        : code === 'rate-limited'
        ? 'AI 暫時限制請求，請稍後再試'
        : code === 'network'
        ? '目前沒有網路，可使用離線練習'
        : `AI 回應發生錯誤：${code}`;

      chatArea.innerHTML += `<div class="ai-corrections">
        <div class="ai-corrections-title">⚠️ ${msg}</div>
      </div>`;
    }

    sendBtn.disabled = false;
    input.focus();
  }

  sendBtn.onclick = send;
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
