import type { QuizQuestion } from '../ai/schemas';
import { generateQuiz, hasAiToken } from '../ai/gateway';
import { getAll, put } from '../storage/indexeddb';
import { scheduleReview } from '../content/review-scheduler';
import { extractFilledWords } from '../ai/schemas';

export async function renderQuizView(container: HTMLElement) {
  // Load phrases — prioritize weak ones (lastScore <= 2)
  const all = await getAll<any>('phraseCards');
  const weak = all.filter(p => p.lastScore && p.lastScore <= 2);
  const pool = weak.length >= 3 ? weak : all.slice(0, 10);

  if (pool.length === 0) {
    container.innerHTML = `
      <div class="review-empty">
        <h2>📝 還沒有句子可以測驗</h2>
        <p>先去「開始 90 秒」練習一些句子。</p>
        <button class="btn btn-primary" id="btn-back">回到首頁</button>
      </div>`;
    document.getElementById('btn-back')!.onclick = () => { window.location.hash = '#/home'; };
    return;
  }

  const hasToken = await hasAiToken();
  let questions: QuizQuestion[] = [];

  container.innerHTML = '<div class="ai-loading" id="quiz-loading">準備測驗中</div>';

  if (hasToken) {
    try {
      questions = await generateQuiz(pool.slice(0, 5));
    } catch {
      questions = buildLocalQuiz(pool.slice(0, 5));
    }
  } else {
    questions = buildLocalQuiz(pool.slice(0, 5));
  }

  if (questions.length === 0) {
    questions = buildLocalQuiz(pool.slice(0, 5));
  }

  runQuiz(container, questions);
}

function buildLocalQuiz(phrases: any[]): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  for (const p of phrases) {
    const filled = extractFilledWords(p.english, p.example || p.english);
    if (filled.length > 0 && p.example) {
      // Pick one word to blank out
      const words = p.example.split(/\s+/);
      // Find a content word (not stopword)
      const stopWords = new Set(['a', 'an', 'the', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'but', 'with', 'that', 'this', 'it', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'can', 'could', 'should', 'may', 'might', 'shall', 'about', 'by', 'from', 'as', 'not', 'no', 'so', 'if', 'than', 'then', 'too', 'very', 'just']);
      const contentIdx = words.findIndex(w => !stopWords.has(w.toLowerCase()) && w.length > 2);
      if (contentIdx >= 0) {
        const answer = words[contentIdx];
        const question = words.map((w, i) => i === contentIdx ? '___' : w).join(' ');
        questions.push({
          type: 'fill-blank',
          phraseId: p.id,
          question,
          answer,
          hint: p.meaning ? p.meaning.slice(0, 20) : '填入缺少的字',
        });
      }
    }
  }
  // Fallback: use template blanks
  if (questions.length === 0) {
    for (const p of phrases) {
      if (p.english.includes('___')) {
        const filled = extractFilledWords(p.english, p.example || '');
        questions.push({
          type: 'fill-blank',
          phraseId: p.id,
          question: p.english,
          answer: filled[0] || '',
          hint: p.meaning?.slice(0, 20) || '填入缺少的字',
        });
      }
    }
  }
  return questions;
}

function runQuiz(container: HTMLElement, questions: QuizQuestion[]) {
  let idx = 0;
  let correctCount = 0;

  function renderQuestion() {
    if (idx >= questions.length) {
      // Done
      container.innerHTML = `
        <div class="practice-complete">
          <h2>🎉 測驗完成！</h2>
          <div class="stats-grid">
            <div class="stat"><span class="stat-num">${correctCount}/${questions.length}</span><span class="stat-label">正確率</span></div>
          </div>
          <button class="btn btn-primary" id="btn-back">回到首頁</button>
          <button class="btn btn-secondary" id="btn-retry">再測一次</button>
        </div>`;
      document.getElementById('btn-back')!.onclick = () => { window.location.hash = '#/home'; };
      document.getElementById('btn-retry')!.onclick = () => renderQuizView(container);
      return;
    }

    const q = questions[idx];
    container.innerHTML = `
      <div class="practice-session">
        <div class="practice-header">
          <div class="progress">${idx + 1} / ${questions.length}</div>
        </div>
        <div class="phrase-display">${q.question}</div>
        <div class="phrase-meaning">提示：${q.hint}</div>
        <div class="quiz-input-area">
          <input type="text" id="quiz-answer" placeholder="輸入答案..." autocomplete="off" />
          <button class="btn btn-primary" id="quiz-submit">確認</button>
        </div>
        <div id="quiz-feedback"></div>
        <button class="btn btn-back" id="btn-back">← 返回</button>
      </div>`;

    const input = document.getElementById('quiz-answer') as HTMLInputElement;
    const feedback = document.getElementById('quiz-feedback')!;
    input.focus();

    function submit() {
      const userAnswer = input.value.trim().toLowerCase();
      const correct = q.answer.toLowerCase();
      const isCorrect = userAnswer === correct || (correct && userAnswer.includes(correct));

      if (isCorrect) correctCount++;

      // Update review
      scheduleReview(q.phraseId, isCorrect ? 'easy' : 'hard').catch(() => {});

      feedback.innerHTML = `
        <div class="${isCorrect ? 'practice-hint' : 'ai-corrections'}">
          ${isCorrect
            ? `<div style="color:var(--color-success)">✅ 答對了！</div>`
            : `<div style="color:var(--color-error)">❌ 答案是：${q.answer}</div>`
          }
          <button class="btn btn-primary" id="quiz-next">${idx < questions.length - 1 ? '下一題' : '看結果'}</button>
        </div>`;

      (document.getElementById('quiz-submit') as HTMLButtonElement).disabled = true;
      (document.getElementById('quiz-next') as HTMLButtonElement)!.onclick = () => {
        idx++;
        renderQuestion();
      };
    }

    document.getElementById('quiz-submit')!.onclick = submit;
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); submit(); }
    });
    document.getElementById('btn-back')!.onclick = () => { window.location.hash = '#/home'; };
  }

  renderQuestion();
}
