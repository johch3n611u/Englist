/** Structured AI response schemas */

export interface WeaknessAnalysis {
  weakPhrases: string[];
  pattern: string;
  focusTopic: string;
  suggestedScenario: string;
}

export interface QuizQuestion {
  type: 'fill-blank';
  phraseId: string;
  question: string;   // "I've been with the company for about ___ years."
  answer: string;     // "three"
  hint: string;
}

export interface ScenarioTask {
  scenario: string;
  role: string;
  question: string;
  expectedKeyPhrases: string[];
  successCriteria: string;
}

export interface AiFeedback {
  correct: boolean;
  score: number;
  corrections: string[];
  nextQuestion: string;
  improvementTip: string;
}

/** Offline fallback quiz (no AI needed) */
export function localFillBlank(phrase: { id: string; english: string }): QuizQuestion | null {
  const text = phrase.english;
  // Find fill-in positions: ___ markers
  const parts = text.split('___');
  if (parts.length < 2) return null;

  // Pick a random blank to show
  const blankIdx = Math.floor(Math.random() * (parts.length - 1));
  const before = parts[blankIdx];
  const after = parts[blankIdx + 1];

  // Extract the answer from example if available, otherwise use generic
  // For offline mode, we just show the template and let user say it
  return {
    type: 'fill-blank',
    phraseId: phrase.id,
    question: `${before}___${after}`,
    answer: '', // Will be filled from example
    hint: '想想句子裡該填什麼',
  };
}

/** Extract the filled words from example vs template */
export function extractFilledWords(template: string, example: string): string[] {
  if (!template.includes('___')) return [];
  const templateParts = template.split('___');
  const exampleWords: string[] = [];
  let pos = 0;

  for (let i = 0; i < templateParts.length - 1; i++) {
    const prevEnd = pos + templateParts[i].length;
    const nextStart = example.indexOf(templateParts[i + 1], prevEnd);
    if (nextStart > prevEnd) {
      exampleWords.push(example.slice(prevEnd, nextStart).trim());
    }
    pos = nextStart + (templateParts[i + 1]?.length || 0);
  }
  return exampleWords;
}
