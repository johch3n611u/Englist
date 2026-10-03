import type { VoiceSettings } from '../app/types';
import { TOPIC_PACKS } from '../content/topic-packs';
import { getPref, setPref } from '../storage/local-preferences';

export function renderHomeView(container: HTMLElement) {
  const onboardingDone = getPref<boolean>('onboardingDone', false);

  if (!onboardingDone) {
    renderOnboarding(container);
    return;
  }

  container.innerHTML = `
    <div class="home-view">
      <h1 class="home-title">Englist</h1>
      <p class="home-subtitle">每天 90 秒，輕鬆練英文</p>
      <div class="home-actions">
        <button class="btn btn-primary btn-big" id="btn-quick">⚡ 開始 90 秒</button>
        <button class="btn btn-secondary btn-big" id="btn-review">📝 今天複習</button>
        <button class="btn btn-secondary btn-big" id="btn-quiz">✏️ 測驗</button>
        <button class="btn btn-secondary btn-big" id="btn-scenario">🎯 情境任務</button>
        <button class="btn btn-secondary btn-big" id="btn-ai">🤖 AI 對話</button>
        <button class="btn btn-secondary btn-big" id="btn-phrases">📖 新增一句話</button>
        <button class="btn btn-secondary btn-big" id="btn-stats">📊 統計</button>
        <button class="btn btn-secondary btn-big" id="btn-settings">⚙️ 設定</button>
      </div>
    </div>
  `;

  document.getElementById('btn-quick')!.onclick = () => { window.location.hash = '#/practice'; };
  document.getElementById('btn-review')!.onclick = () => { window.location.hash = '#/review'; };
  document.getElementById('btn-quiz')!.onclick = () => { window.location.hash = '#/quiz'; };
  document.getElementById('btn-scenario')!.onclick = () => { window.location.hash = '#/scenario'; };
  document.getElementById('btn-ai')!.onclick = () => { window.location.hash = '#/ai'; };
  document.getElementById('btn-phrases')!.onclick = () => { window.location.hash = '#/phrases'; };
  document.getElementById('btn-stats')!.onclick = () => { window.location.hash = '#/stats'; };
  document.getElementById('btn-settings')!.onclick = () => { window.location.hash = '#/settings'; };
}

function renderOnboarding(container: HTMLElement) {
  const steps = [
    {
      title: '每天只要 90 秒',
      body: '用零碎時間練英文口說，不需要整塊時間。',
      action: '開始',
    },
    {
      title: '選擇你的目標',
      body: `<div class="onboard-options">
        <button class="btn btn-option" data-goal="daily">日常聊天</button>
        <button class="btn btn-option" data-goal="small-talk">Small Talk</button>
        <button class="btn btn-option selected" data-goal="business">工作英文</button>
        <button class="btn btn-option" data-goal="listening">聽力</button>
      </div>`,
      action: '下一步',
    },
    {
      title: '選擇每天練習時間',
      body: `<div class="onboard-options">
        <button class="btn btn-option selected" data-time="90">90 秒</button>
        <button class="btn btn-option" data-time="300">5 分鐘</button>
        <button class="btn btn-option" data-time="900">15 分鐘</button>
      </div>`,
      action: '下一步',
    },
    {
      title: '可以開始了！',
      body: '你的資料只保存在這台設備，不會上傳到任何地方。',
      action: '開始第一次練習',
    },
  ];

  let step = 0;

  function renderStep() {
    const s = steps[step];
    container.innerHTML = `
      <div class="onboarding">
        <div class="onboard-dots">${steps.map((_, i) => `<span class="dot ${i === step ? 'active' : ''}"></span>`).join('')}</div>
        <h2>${s.title}</h2>
        <div class="onboard-body">${s.body}</div>
        <div class="onboard-actions">
          <button class="btn btn-secondary" id="btn-skip">稍後設定</button>
          <button class="btn btn-primary" id="btn-next">${s.action}</button>
        </div>
      </div>
    `;

    // Option selection
    for (const btn of container.querySelectorAll('.btn-option')) {
      btn.addEventListener('click', () => {
        const parent = btn.parentElement!;
        parent.querySelectorAll('.btn-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    }

    document.getElementById('btn-skip')!.onclick = () => {
      setPref('onboardingDone', true);
      renderHomeView(container);
    };
    document.getElementById('btn-next')!.onclick = () => {
      if (step < steps.length - 1) {
        step++;
        renderStep();
      } else {
        setPref('onboardingDone', true);
        window.location.hash = '#/practice';
      }
    };
  }

  renderStep();
}

export function renderPracticeView(container: HTMLElement) {
  container.innerHTML = `
    <div class="practice-select">
      <h2>選擇練習主題</h2>
      <div class="topic-list">
        ${TOPIC_PACKS.map(p => `
          <button class="btn btn-topic" data-pack="${p.id}">
            <span class="topic-title">${p.title}</span>
            <span class="topic-cn">${p.titleCn}</span>
            <span class="topic-count">${p.phrases.length} 句</span>
          </button>
        `).join('')}
      </div>
      <button class="btn btn-back" id="btn-back">← 返回</button>
    </div>
  `;

  document.getElementById('btn-back')!.onclick = () => { window.location.hash = '#/home'; };
  for (const btn of container.querySelectorAll('.btn-topic')) {
    btn.addEventListener('click', () => {
      const packId = (btn as HTMLElement).dataset.pack!;
      startSession(container, packId);
    });
  }
}

function startSession(container: HTMLElement, packId: string) {
  import('../practice/offline-session').then(({ createOfflineSession }) => {
    const voiceSettings = getPref<VoiceSettings>('voiceSettings', {
      lang: 'en-US', rate: 1.0, pitch: 1.0, volume: 1.0, sentencePauseMs: 600, repeatCount: 1,
    });
    createOfflineSession(container, voiceSettings, packId, 90, () => {});
  });
}

export async function renderReviewView(container: HTMLElement) {
  const { getDuePhrases } = await import('../content/review-scheduler');
  const { createSpeechEngine } = await import('../audio/speech-engine');
  const engine = createSpeechEngine();
  const due = await getDuePhrases();

  if (due.length === 0) {
    container.innerHTML = `
      <div class="review-empty">
        <h2>📝 今天沒有待複習的句子</h2>
        <p>去「開始 90 秒」練習新句子，它們會自動排入複習。</p>
        <button class="btn btn-primary" id="btn-home">回到首頁</button>
      </div>
    `;
    document.getElementById('btn-home')!.onclick = () => { window.location.hash = '#/home'; };
    return;
  }

  let idx = 0;
  const voiceSettings = getPref<VoiceSettings>('voiceSettings', { lang: 'en-US', rate: 1.0, pitch: 1.0, volume: 1.0, sentencePauseMs: 600, repeatCount: 1 });

  function renderCard() {
    if (idx >= due.length) {
      container.innerHTML = `
        <div class="review-done">
          <h2>🎉 今天的複習都完成了！</h2>
          <p>共複習 ${due.length} 句。</p>
          <button class="btn btn-primary" id="btn-home">回到首頁</button>
        </div>
      `;
      document.getElementById('btn-home')!.onclick = () => { window.location.hash = '#/home'; };
      return;
    }
    const p = due[idx];
    const display = p.example || p.english;
    container.innerHTML = `
      <div class="review-card">
        <div class="review-header">${idx + 1} / ${due.length}</div>
        <div class="phrase-display">${display}</div>
        <div class="phrase-meaning" id="meaning" style="display:none">${p.meaning ?? ''}</div>
        <div class="review-actions">
          <button class="btn btn-primary" id="btn-listen">🔊 聽</button>
          <button class="btn btn-secondary" id="btn-show">顯示中文</button>
          <button class="btn btn-rate" data-rate="easy">😊 記得</button>
          <button class="btn btn-rate" data-rate="okay">😐 想一下</button>
          <button class="btn btn-rate" data-rate="hard">😓 忘了</button>
        </div>
        <button class="btn btn-back" id="btn-back">← 返回</button>
      </div>
    `;
    engine.speak(display, voiceSettings);
    document.getElementById('btn-listen')!.onclick = () => engine.speak(display, voiceSettings);
    document.getElementById('btn-show')!.onclick = () => { document.getElementById('meaning')!.style.display = 'block'; };
    document.getElementById('btn-back')!.onclick = () => { window.location.hash = '#/home'; };
    for (const btn of container.querySelectorAll('.btn-rate')) {
      btn.addEventListener('click', async () => {
        const { scheduleReview } = await import('../content/review-scheduler');
        await scheduleReview(p.id, (btn as HTMLElement).dataset.rate as 'easy' | 'okay' | 'hard');
        idx++;
        renderCard();
      });
    }
  }
  renderCard();
}

export async function renderPhrasesView(container: HTMLElement) {
  const { getAll, put, remove } = await import('../storage/indexeddb');
  const { initReview } = await import('../content/review-scheduler');
  const phrases = await getAll<any>('phraseCards');

  function render() {
    container.innerHTML = `
      <div class="phrases-view">
        <div class="phrases-header">
          <h2>📖 我的句子</h2>
          <button class="btn btn-primary" id="btn-add">+ 新增</button>
        </div>
        <div class="phrases-list" id="phrases-list">
          ${phrases.length === 0 ? '<p class="empty-hint">還沒有句子，按「新增」開始。</p>' : ''}
          ${phrases.map((p: any) => `
            <div class="phrase-card" data-id="${p.id}">
              <div class="phrase-en">${p.example || p.english}</div>
              ${p.example && p.english.includes('___') ? `<div class="hint-template">句型：${p.english}</div>` : ''}
              <div class="phrase-cn">${p.meaning ?? ''}</div>
              <div class="phrase-meta">
                <span class="tag">${p.scenario ?? 'custom'}</span>
                <span class="diff">${'★'.repeat(p.difficulty)}</span>
              </div>
              <div class="phrase-actions">
                <button class="btn btn-sm btn-play" data-id="${p.id}">🔊</button>
                <button class="btn btn-sm btn-delete" data-id="${p.id}">🗑</button>
              </div>
            </div>
          `).join('')}
        </div>
        <button class="btn btn-back" id="btn-back">← 返回首頁</button>
      </div>
    `;

    document.getElementById('btn-back')!.onclick = () => { window.location.hash = '#/home'; };
    document.getElementById('btn-add')!.onclick = () => showAddForm();
    for (const btn of container.querySelectorAll('.btn-delete')) {
      btn.addEventListener('click', async () => {
        const id = (btn as HTMLElement).dataset.id!;
        await remove('phraseCards', id);
        const idx = phrases.findIndex((p: any) => p.id === id);
        if (idx >= 0) phrases.splice(idx, 1);
        render();
      });
    }
    for (const btn of container.querySelectorAll('.btn-play')) {
      btn.addEventListener('click', async () => {
        const { createSpeechEngine } = await import('../audio/speech-engine');
        const engine = createSpeechEngine();
        const p = phrases.find((x: any) => x.id === (btn as HTMLElement).dataset.id);
        if (p) engine.speak(p.example || p.english);
      });
    }
  }

  async function showAddForm() {
    container.innerHTML = `
      <div class="phrase-form">
        <h2>新增句子</h2>
        <label>英文句子<input type="text" id="inp-en" placeholder="Enter your sentence here" /></label>
        <label>中文意思<input type="text" id="inp-cn" optional placeholder="中文翻譯" /></label>
        <label>難度
          <select id="inp-diff">
            <option value="1">★ 很簡單</option>
            <option value="2">★★ 簡單</option>
            <option value="3" selected>★★★ 普通</option>
            <option value="4">★★★★ 困難</option>
            <option value="5">★★★★★ 很難</option>
          </select>
        </label>
        <label>場合
          <select id="inp-scenario">
            <option value="daily">日常</option>
            <option value="small-talk">Small Talk</option>
            <option value="business">工作</option>
            <option value="repair">修復句</option>
          </select>
        </label>
        <div class="form-actions">
          <button class="btn btn-secondary" id="btn-cancel">取消</button>
          <button class="btn btn-primary" id="btn-save">保存</button>
        </div>
      </div>
    `;
    document.getElementById('btn-cancel')!.onclick = () => renderPhrasesView(container);
    document.getElementById('btn-save')!.onclick = async () => {
      const en = (document.getElementById('inp-en') as HTMLInputElement).value.trim();
      if (!en) return;
      const now = new Date().toISOString();
      const card = {
        id: Math.random().toString(36).slice(2) + Date.now().toString(36),
        english: en,
        meaning: (document.getElementById('inp-cn') as HTMLInputElement).value.trim() || undefined,
        tags: ['custom'],
        scenario: (document.getElementById('inp-scenario') as HTMLSelectElement).value as any,
        difficulty: Number((document.getElementById('inp-diff') as HTMLSelectElement).value) as 1|2|3|4|5,
        createdAt: now,
        updatedAt: now,
        nextReviewAt: now,
        reviewCount: 0,
      };
      await put('phraseCards', card);
      await initReview(card.id);
      phrases.push(card);
      render();
    };
  }

  render();
}

export async function renderSettingsView(container: HTMLElement) {
  const { getPref, setPref } = await import('../storage/local-preferences');
  const vs = getPref<any>('voiceSettings', { lang: 'en-US', rate: 1.0, pitch: 1.0, volume: 1.0, sentencePauseMs: 600, repeatCount: 1 });

  container.innerHTML = `
    <div class="settings-view">
      <h2>⚙️ 設定</h2>

      <section class="settings-section">
        <h3>🔊 語音</h3>
        <label>語速 <input type="range" id="set-rate" min="0.6" max="1.4" step="0.1" value="${vs.rate}" /> <span id="rate-val">${vs.rate}x</span></label>
        <label>音量 <input type="range" id="set-volume" min="0" max="1" step="0.1" value="${vs.volume}" /> <span id="vol-val">${Math.round(vs.volume * 100)}%</span></label>
        <label>語調 <input type="range" id="set-pitch" min="0.8" max="1.2" step="0.1" value="${vs.pitch}" /> <span id="pitch-val">${vs.pitch}</span></label>
        <button class="btn btn-secondary" id="btn-test">測試語音</button>
      </section>

      <section class="settings-section">
        <h3>📊 資料</h3>
        <button class="btn btn-secondary" id="btn-export">匯出（JSON）</button>
        <button class="btn btn-secondary" id="btn-clear-cache">清除 AI 快取</button>
      </section>

      <section class="token-setup">
        <h3>🤖 AI 設定</h3>
        <label>方案
          <select id="ai-plan">
            <option value="payg">按量付費（Pay-as-you-go）</option>
            <option value="token-plan">Token Plan（訂閱制）</option>
          </select>
        </label>
        <label>模型
          <select id="ai-model">
            <option value="mimo-v2.6-flash">mimo-v2.6-flash（快速）</option>
            <option value="mimo-v2.6-pro">mimo-v2.6-pro（較強）</option>
          </select>
        </label>
        <label>AI Token
          <input type="password" id="ai-token" placeholder="sk-xxxx 或 tp-xxxx" />
        </label>
        <p class="hint">Token 只保存在瀏覽器，不會上傳到任何地方。換設備需要重新輸入。</p>
        <div style="display:flex;gap:8px;margin-top:12px">
          <button class="btn btn-primary" id="btn-save-token">儲存</button>
          <button class="btn btn-secondary" id="btn-test-token">測試連線</button>
          <button class="btn btn-secondary" id="btn-clear-token">清除</button>
        </div>
        <div id="token-status" class="hint" style="margin-top:8px"></div>
      </section>

      <button class="btn btn-back" id="btn-back">← 返回首頁</button>
    </div>
  `;

  document.getElementById('btn-back')!.onclick = () => { window.location.hash = '#/home'; };

  const saveSettings = () => {
    setPref('voiceSettings', vs);
  };

  (document.getElementById('set-rate') as HTMLInputElement).oninput = (e) => {
    vs.rate = Number((e.target as HTMLInputElement).value);
    document.getElementById('rate-val')!.textContent = vs.rate + 'x';
    saveSettings();
  };
  (document.getElementById('set-volume') as HTMLInputElement).oninput = (e) => {
    vs.volume = Number((e.target as HTMLInputElement).value);
    document.getElementById('vol-val')!.textContent = Math.round(vs.volume * 100) + '%';
    saveSettings();
  };
  (document.getElementById('set-pitch') as HTMLInputElement).oninput = (e) => {
    vs.pitch = Number((e.target as HTMLInputElement).value);
    document.getElementById('pitch-val')!.textContent = String(vs.pitch);
    saveSettings();
  };

  document.getElementById('btn-test')!.onclick = async () => {
    const { createSpeechEngine } = await import('../audio/speech-engine');
    const engine = createSpeechEngine();
    engine.speak('Hello! This is a test of your voice settings.', vs);
  };

  document.getElementById('btn-export')!.onclick = async () => {
    const { getAll } = await import('../storage/indexeddb');
    const data = {
      phraseCards: await getAll('phraseCards'),
      practiceSessions: await getAll('practiceSessions'),
      reviewQueue: await getAll('reviewQueue'),
      exportedAt: new Date().toISOString(),
      schemaVersion: 1,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `englist-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // AI token setup
  const { storeToken, clearToken, hasToken } = await import('../storage/token-vault');
  const { saveAiConfig, testAiConnection } = await import('../ai/gateway');

  const tokenInput = document.getElementById('ai-token') as HTMLInputElement;
  const tokenStatus = document.getElementById('token-status')!;
  const planSelect = document.getElementById('ai-plan') as HTMLSelectElement;
  const modelSelect = document.getElementById('ai-model') as HTMLSelectElement;

  // Pre-fill if token exists
  if (hasToken()) {
    tokenStatus.textContent = '✅ 已設定 token（顯示不回填）';
  }

  document.getElementById('btn-save-token')!.onclick = async () => {
    const token = tokenInput.value.trim();
    if (!token) { tokenStatus.textContent = '請輸入 token'; return; }

    // Update config based on plan
    const baseUrl = planSelect.value === 'token-plan'
      ? 'https://token-plan-cn.xiaomimimo.com/v1'
      : 'https://api.xiaomimimo.com/v1';
    saveAiConfig({ baseUrl, model: modelSelect.value });

    await storeToken(token, 'session');
    tokenInput.value = '';
    tokenStatus.textContent = '✅ token 已儲存（僅在本次分頁有效）';
  };

  document.getElementById('btn-test-token')!.onclick = async () => {
    const token = tokenInput.value.trim();
    if (!token) { tokenStatus.textContent = '請先輸入 token'; return; }

    tokenStatus.textContent = '測試中...';
    const baseUrl = planSelect.value === 'token-plan'
      ? 'https://token-plan-cn.xiaomimimo.com/v1'
      : 'https://api.xiaomimimo.com/v1';
    saveAiConfig({ baseUrl, model: modelSelect.value });
    await storeToken(token, 'session');

    const result = await testAiConnection();
    tokenStatus.textContent = result.ok ? '✅ 連線正常' : `❌ ${result.message}`;
    if (result.ok) tokenInput.value = '';
  };

  document.getElementById('btn-clear-token')!.onclick = async () => {
    await clearToken();
    tokenInput.value = '';
    tokenStatus.textContent = '已清除 token';
  };
}
