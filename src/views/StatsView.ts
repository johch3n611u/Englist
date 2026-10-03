import { getAll } from '../storage/indexeddb';
import type { PracticeSession } from '../app/types';

export async function renderStatsView(container: HTMLElement) {
  const sessions = await getAll<PracticeSession>('practiceSessions');
  const today = new Date().toISOString().slice(0, 10);
  const todaySessions = sessions.filter(s => s.startedAt.startsWith(today));
  const totalMinutes = Math.round(sessions.reduce((sum, s) => sum + s.durationMs, 0) / 60000);
  const avgDuration = sessions.length ? Math.round(sessions.reduce((s, x) => s + x.durationMs, 0) / sessions.length / 1000) : 0;
  const totalPhrases = sessions.reduce((s, x) => s + x.phrasesPracticed, 0);

  container.innerHTML = `
    <div class="stats-view">
      <h2>📊 練習統計</h2>

      ${sessions.length === 0 ? '<p class="empty-hint">還沒有練習紀錄。</p>' : `
      <div class="stats-grid">
        <div class="stat"><span class="stat-num">${sessions.length}</span><span class="stat-label">總練習次數</span></div>
        <div class="stat"><span class="stat-num">${todaySessions.length}</span><span class="stat-label">今日練習</span></div>
        <div class="stat"><span class="stat-num">${totalMinutes}m</span><span class="stat-label">總時長</span></div>
        <div class="stat"><span class="stat-num">${avgDuration}s</span><span class="stat-label">平均每次</span></div>
        <div class="stat"><span class="stat-num">${totalPhrases}</span><span class="stat-label">完成句數</span></div>
        <div class="stat"><span class="stat-num">${sessions.filter(s => s.topicPackId === 'introductions').length}</span><span class="stat-label">自我介紹</span></div>
      </div>

      <div class="stats-section">
        <h3>最近練習</h3>
        ${sessions.slice(-5).reverse().map(s => `
          <div class="stats-row">
            <span>${new Date(s.startedAt).toLocaleDateString('zh-TW')}</span>
            <span>${s.phrasesPracticed} 句 · ${Math.round(s.durationMs / 1000)}s</span>
            <span>${s.mode === 'ai' ? '🤖' : s.mode === 'review' ? '📝' : '⚡'}</span>
          </div>
        `).join('')}
      </div>
      `}
    </div>
  `;
}
