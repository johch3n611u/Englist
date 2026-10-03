import { createRouter } from './app/router';
import { createStore } from './app/state';
import type { AppState } from './app/types';
import { getPref, setPref } from './storage/local-preferences';
import { openDB } from './storage/indexeddb';
import { seedTopicPacksIfNeeded } from './content/topic-packs';
import { renderHomeView, renderPracticeView, renderReviewView, renderPhrasesView, renderSettingsView } from './views';
import { renderAiView } from './views/AiView';
import { renderStatsView } from './views/StatsView';
import { renderQuizView } from './views/QuizView';
import { renderScenarioView } from './views/ScenarioView';

const VERSION = '0.1.0';

async function main() {
  // Initialize DB and seed content
  await openDB();
  await seedTopicPacksIfNeeded();

  // App state
  const store = createStore<AppState>({
    currentView: 'home',
    onboardingDone: getPref('onboardingDone', false),
    voiceSettings: getPref('voiceSettings', { lang: 'en-US', rate: 1.0, pitch: 1.0, volume: 1.0, sentencePauseMs: 600, repeatCount: 1 }),
    phrases: [],
    reviews: [],
    sessions: [],
    practiceActive: false,
    practiceTimeLeft: 0,
    offline: !navigator.onLine,
  });

  // Offline detection
  window.addEventListener('online', () => {
    store.set({ offline: false });
    document.querySelector('.offline-banner')?.remove();
  });
  window.addEventListener('offline', () => {
    store.set({ offline: true });
    showOfflineBanner();
  });

  // Version tag
  const verEl = document.getElementById('version');
  if (verEl) verEl.textContent = `v${VERSION}`;

  // Router
  const app = document.getElementById('app')!;
  createRouter({
    home: renderHomeView,
    practice: renderPracticeView,
    review: renderReviewView,
    phrases: renderPhrasesView,
    settings: renderSettingsView,
    ai: renderAiView,
    stats: renderStatsView,
    quiz: renderQuizView,
    scenario: renderScenarioView,
  }, app);

  // Show offline banner if needed
  if (!navigator.onLine) showOfflineBanner();
}

function showOfflineBanner() {
  if (document.querySelector('.offline-banner')) return;
  const banner = document.createElement('div');
  banner.className = 'offline-banner';
  banner.textContent = '📡 目前沒有網路，可以先複習已保存的句子。';
  document.body.prepend(banner);
}

main().catch(console.error);
