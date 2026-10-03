import type { PhraseCard, PracticeSession, VoiceSettings } from '../app/types';
import { getAll, put } from '../storage/indexeddb';
import { scheduleReview } from '../content/review-scheduler';
import { createSpeechEngine } from '../audio/speech-engine';
import { TOPIC_PACKS } from '../content/topic-packs';

export interface SessionResult {
  phrasesPracticed: number;
  corrections: number;
  totalSeconds: number;
  ratings: Record<string, string>;
}

/** Pick random phrases from a topic pack */
function pickPhrases(packId: string, count: number): PhraseCard[] {
  const pack = TOPIC_PACKS.find(p => p.id === packId);
  if (!pack) return [];
  const shuffled = [...pack.phrases].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/** Run a 90-second offline practice session */
export function createOfflineSession(
  container: HTMLElement,
  voiceSettings: VoiceSettings,
  packId: string,
  durationSec: number = 90,
  onComplete: (result: SessionResult) => void,
) {
  const engine = createSpeechEngine();
  const phrases = pickPhrases(packId, 10);
  let currentIndex = 0;
  let practiced = 0;
  let corrections = 0;
  const ratings: Record<string, string> = {};
  let timeLeft = durationSec;
  let timerInterval: ReturnType<typeof setInterval>;
  let resolved = false;

  function render() {
    const phrase = phrases[currentIndex];
    if (!phrase || timeLeft <= 0) { finish(); return; }

    container.innerHTML = `
      <div class="practice-session">
        <div class="practice-header">
          <div class="timer" id="timer">${timeLeft}s</div>
          <div class="progress">${currentIndex + 1} / ${phrases.length}</div>
        </div>
        <div class="phrase-display" id="phrase-text">${phrase.english}</div>
        <div class="phrase-meaning">${phrase.meaning ?? ''}</div>
        <div class="practice-actions">
          <button class="btn btn-primary" id="btn-listen">🔊 再聽一次</button>
          <button class="btn btn-primary" id="btn-speak">✅ 我講完了</button>
          <button class="btn btn-secondary" id="btn-skip">⏭ 跳過</button>
        </div>
        <div class="practice-hint" id="hint-area" style="display:none">
          <div class="hint-label">示範答案：</div>
          <div class="hint-text">${phrase.english}</div>
        </div>
        <div class="rating-area" id="rating-area" style="display:none">
          <div class="rating-label">你覺得這句：</div>
          <button class="btn btn-rate" data-rate="easy">😊 簡單</button>
          <button class="btn btn-rate" data-rate="okay">😐 普通</button>
          <button class="btn btn-rate" data-rate="hard">😓 困難</button>
        </div>
      </div>
    `;

    // Auto-play
    engine.speak(phrase.english, voiceSettings);

    // Events
    document.getElementById('btn-listen')!.onclick = () => {
      engine.speak(phrase.english, voiceSettings);
    };
    document.getElementById('btn-speak')!.onclick = () => {
      document.getElementById('hint-area')!.style.display = 'block';
      document.getElementById('rating-area')!.style.display = 'flex';
      (document.getElementById('btn-speak') as HTMLButtonElement).disabled = true;
    };
    document.getElementById('btn-skip')!.onclick = () => {
      ratings[phrase.id] = 'skipped';
      next();
    };
    for (const btn of document.querySelectorAll('.btn-rate')) {
      btn.addEventListener('click', async () => {
        const rate = (btn as HTMLElement).dataset.rate!;
        ratings[phrase.id] = rate;
        practiced++;
        if (rate === 'hard') corrections++;
        await scheduleReview(phrase.id, rate as 'easy' | 'okay' | 'hard');
        next();
      });
    }
  }

  function next() {
    currentIndex++;
    render();
  }

  function finish() {
    if (resolved) return;
    resolved = true;
    clearInterval(timerInterval);
    engine.stop();
    const result: SessionResult = {
      phrasesPracticed: practiced,
      corrections,
      totalSeconds: durationSec - timeLeft,
      ratings,
    };

    // Save session
    const session: PracticeSession = {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      startedAt: new Date(Date.now() - (durationSec - timeLeft) * 1000).toISOString(),
      endedAt: new Date().toISOString(),
      mode: 'quick',
      topicPackId: packId,
      phrasesPracticed: practiced,
      corrections,
      score: practiced > 0 ? Math.round(Object.values(ratings).filter(r => r === 'easy').length / practiced * 3) : 0,
      durationMs: (durationSec - timeLeft) * 1000,
    };
    put('practiceSessions', session).catch(() => {});

    container.innerHTML = `
      <div class="practice-complete">
        <h2>🎉 練習完成！</h2>
        <div class="stats-grid">
          <div class="stat"><span class="stat-num">${practiced}</span><span class="stat-label">完成句數</span></div>
          <div class="stat"><span class="stat-num">${result.totalSeconds}s</span><span class="stat-label">練習時間</span></div>
          <div class="stat"><span class="stat-num">${corrections}</span><span class="stat-label">需要修正</span></div>
        </div>
        <button class="btn btn-primary" id="btn-home">回到首頁</button>
        <button class="btn btn-secondary" id="btn-again">再練一次</button>
      </div>
    `;
    document.getElementById('btn-home')!.onclick = () => { window.location.hash = '#/home'; };
    document.getElementById('btn-again')!.onclick = () => {
      currentIndex = 0; practiced = 0; corrections = 0; timeLeft = durationSec;
      for (const k in ratings) delete ratings[k];
      resolved = false;
      startTimer();
      render();
    };

    onComplete(result);
  }

  function startTimer() {
    timerInterval = setInterval(() => {
      timeLeft--;
      const el = document.getElementById('timer');
      if (el) el.textContent = `${timeLeft}s`;
      if (timeLeft <= 0) finish();
    }, 1000);
  }

  startTimer();
  render();

  return { destroy() { clearInterval(timerInterval); engine.stop(); } };
}
