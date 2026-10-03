import type { ReviewEntry, PhraseCard } from '../app/types';
import { getAll, put, getById } from '../storage/indexeddb';

const INTERVALS = [0, 1, 3, 7, 14]; // days for first 5 reviews

/** Schedule next review for a phrase */
export async function scheduleReview(
  phraseId: string,
  quality: 'easy' | 'okay' | 'hard',
): Promise<void> {
  const existing = await getById<ReviewEntry>('reviewQueue', phraseId);
  const now = new Date();
  let entry: ReviewEntry;

  if (!existing) {
    entry = {
      phraseId,
      nextReviewAt: now.toISOString(),
      interval: INTERVALS[0],
      easeFactor: 2.5,
      repetitions: 0,
    };
  } else {
    entry = { ...existing };
  }

  // SM-2 inspired
  if (quality === 'hard') {
    entry.repetitions = Math.max(0, entry.repetitions - 1);
    entry.easeFactor = Math.max(1.3, entry.easeFactor - 0.2);
  } else if (quality === 'okay') {
    entry.repetitions += 1;
  } else {
    entry.repetitions += 1;
    entry.easeFactor = Math.min(3.0, entry.easeFactor + 0.1);
  }

  const idx = Math.min(entry.repetitions, INTERVALS.length - 1);
  entry.interval = INTERVALS[idx] ?? Math.round(INTERVALS[INTERVALS.length - 1] * entry.easeFactor);
  const next = new Date(now.getTime() + entry.interval * 24 * 60 * 60 * 1000);
  entry.nextReviewAt = next.toISOString();

  await put('reviewQueue', entry);

  // Also update the phrase card
  const card = await getById<PhraseCard>('phraseCards', phraseId);
  if (card) {
    card.nextReviewAt = entry.nextReviewAt;
    card.lastScore = quality === 'easy' ? 3 : quality === 'okay' ? 2 : 1;
    card.reviewCount += 1;
    card.updatedAt = now.toISOString();
    await put('phraseCards', card);
  }
}

/** Get phrases due for review (nextReviewAt <= now) */
export async function getDuePhrases(): Promise<PhraseCard[]> {
  const now = new Date().toISOString();
  const all = await getAll<PhraseCard>('phraseCards');
  return all.filter(p => p.nextReviewAt <= now);
}

/** Initialize review for a new phrase (first review in 10 minutes) */
export async function initReview(phraseId: string): Promise<void> {
  const existing = await getById<ReviewEntry>('reviewQueue', phraseId);
  if (existing) return;
  const now = new Date();
  const inTenMin = new Date(now.getTime() + 10 * 60 * 1000);
  await put('reviewQueue', {
    phraseId,
    nextReviewAt: inTenMin.toISOString(),
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
  } as ReviewEntry);
}
