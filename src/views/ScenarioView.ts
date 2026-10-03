import type { ScenarioTask, AiFeedback } from '../ai/schemas';
import { analyzeWeakness, generateScenario, scoreResponse, hasAiToken } from '../ai/gateway';
import { getAll } from '../storage/indexeddb';
import { createSpeechEngine } from '../audio/speech-engine';
import { getPref } from '../storage/local-preferences';

export async function renderScenarioView(container: HTMLElement) {
  const hasToken = await hasAiToken();

  if (!hasToken) {
    container.innerHTML = `
      <div class="ai-view">
        <h2>🎯 情境任務</h2>
        <div class="hint">需要 AI token 才能生成情境任務。<br>可以先用「開始 90 秒」或「填空測驗」練習。</div>
        <button class="btn btn-primary" id="btn-back">回到首頁</button>
      </div>`;
    document.getElementById('btn-back')!.onclick = () => { window.location.hash = '#/home'; };
    return;
  }

  container.innerHTML = '<div class="ai-loading">分析弱點中...</div>';

  // Step 1: Get weak phrases
  const all = await getAll<any>('phraseCards');
  const weak = all.filter(p => p.lastScore && p.lastScore <= 2);
  const pool = weak.length >= 2 ? weak : all.slice(0, 5);

  // Step 2: Analyze weakness
  const analysis = await analyzeWeakness(
    pool.map(p => ({ english: p.english, example: p.example, scenario: p.scenario })),
    await getAll<any>('practiceSessions'),
  );

  // Step 3: Generate scenario
  const weakPhrases = analysis?.weakPhrases?.length
    ? analysis.weakPhrases
    : pool.map(p => p.example || p.english);

  let task: ScenarioTask | null = null;
  try {
    task = await generateScenario(weakPhrases, analysis?.focusTopic || 'general');
  } catch {
    // Fallback: use local scenario
    task = {
      scenario: 'Your manager asks about project progress in a team meeting.',
      role: 'manager',
      question: 'Where are we on the project? We said Friday.',
      expectedKeyPhrases: weakPhrases.slice(0, 3),
      successCriteria: 'Explain current status, mention any delays, propose a plan.',
    };
  }

  if (!task) {
    container.innerHTML = `
      <div class="review-empty">
        <h2>⚠️ 無法生成情境</h2>
        <p>請稍後再試，或使用「開始 90 秒」練習。</p>
        <button class="btn btn-primary" id="btn-back">回到首頁</button>
      </div>`;
    document.getElementById('btn-back')!.onclick = () => { window.location.hash = '#/home'; };
    return;
  }

  runScenario(container, task, weakPhrases);
}

function runScenario(container: HTMLElement, task: ScenarioTask, weakPhrases: string[]) {
  const engine = createSpeechEngine();
  const voiceSettings = getPref<any>('voiceSettings', { lang: 'en-US', rate: 1.0, pitch: 1.0, volume: 1.0, sentencePauseMs: 600, repeatCount: 1 });
  let turnCount = 0;
  const maxTurns = 3;

  function renderScenario() {
    container.innerHTML = `
      <div class="practice-session">
        <div class="practice-header">
          <div class="progress">情境任務 · 第 ${turnCount + 1} / ${maxTurns} 題</div>
        </div>

        <div class="practice-hint" style="background:#e8f0fe">
          <div class="hint-label">📋 情境</div>
          <div>${task.scenario}</div>
          <div style="margin-top:8px;font-size:0.9em">你要扮演：<strong>${task.role === 'manager' ? '被主管問的人' : task.role}</strong></div>
        </div>

        <div class="practice-hint" style="background:#fce8e6">
          <div class="hint-label">🎯 期望用到的句子</div>
          <ul style="margin:4px 0 0 16px">
            ${task.expectedKeyPhrases.map(p => `<li style="margin:4px 0">${p}</li>`).join('')}
          </ul>
        </div>

        <div class="phrase-display">${task.question}</div>

        <div class="quiz-input-area">
          <textarea id="scenario-answer" placeholder="用英文回答..." rows="3"></textarea>
          <button class="btn btn-primary" id="scenario-submit">送出回答</button>
        </div>

        <div id="scenario-feedback"></div>

        <button class="btn btn-back" id="btn-back">← 返回</button>
      </div>`;

    // Speak the question
    engine.speak(task.question, voiceSettings);

    const textarea = document.getElementById('scenario-answer') as HTMLTextAreaElement;
    const feedback = document.getElementById('scenario-feedback')!;
    textarea.focus();

    document.getElementById('btn-back')!.onclick = () => { window.location.hash = '#/home'; };

    document.getElementById('scenario-submit')!.onclick = async () => {
      const answer = textarea.value.trim();
      if (!answer) return;

      const btn = document.getElementById('scenario-submit') as HTMLButtonElement;
      btn.disabled = true;
      feedback.innerHTML = '<div class="ai-loading">AI 評分中</div>';

      try {
        const result = await scoreResponse(answer, task.expectedKeyPhrases, task.question);
        if (result) {
          feedback.innerHTML = `
            <div class="${result.correct ? 'practice-hint' : 'ai-corrections'}">
              <div style="font-size:1.5em;margin-bottom:8px">
                ${result.correct ? '✅' : '⚠️'} 分數：${result.score}
              </div>
              ${result.corrections?.length ? `
                <div class="ai-corrections-title">✏️ 修正</div>
                <ul>${result.corrections.map(c => `<li>${c}</li>`).join('')}</ul>
              ` : ''}
              ${result.improvementTip ? `
                <div style="margin-top:8px">💡 ${result.improvementTip}</div>
              ` : ''}
              <button class="btn btn-primary" id="scenario-next" style="margin-top:12px">
                ${turnCount < maxTurns - 1 ? '下一題' : '完成任務'}
              </button>
            </div>`;

          document.getElementById('scenario-next')!.onclick = () => {
            turnCount++;
            if (turnCount >= maxTurns) {
              // Done
              container.innerHTML = `
                <div class="practice-complete">
                  <h2>🎉 情境任務完成！</h2>
                  <p>你完成了 ${maxTurns} 題情境對話練習。</p>
                  <button class="btn btn-primary" id="btn-back">回到首頁</button>
                </div>`;
              document.getElementById('btn-back')!.onclick = () => { window.location.hash = '#/home'; };
            } else {
              renderScenario();
            }
          };
        } else {
          feedback.innerHTML = `
            <div class="hint">評分失敗，請重試。</div>
            <button class="btn btn-primary" id="scenario-retry">重試</button>`;
          document.getElementById('scenario-retry')!.onclick = () => {
            btn.disabled = false;
            feedback.innerHTML = '';
          };
        }
      } catch (e: any) {
        feedback.innerHTML = `
          <div class="ai-corrections">
            <div class="ai-corrections-title">⚠️ ${e.message === 'no-token' ? 'token 已過期，請重新設定' : 'AI 請求失敗'}</div>
            <button class="btn btn-primary" id="scenario-retry">重試</button>
          </div>`;
        document.getElementById('scenario-retry')!.onclick = () => {
          btn.disabled = false;
          feedback.innerHTML = '';
        };
      }
    };
  }

  renderScenario();
}
