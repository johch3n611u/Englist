import type { TopicPack, PhraseCard } from '../app/types';

function makeId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function phrase(
  english: string,
  meaning: string,
  scenario: PhraseCard['scenario'],
  difficulty: PhraseCard['difficulty'],
  tags: string[] = [],
): PhraseCard {
  const now = new Date().toISOString();
  return {
    id: makeId(),
    english,
    meaning,
    tags,
    scenario,
    difficulty,
    createdAt: now,
    updatedAt: now,
    nextReviewAt: now,
    reviewCount: 0,
  };
}

export const TOPIC_PACKS: TopicPack[] = [
  {
    id: 'introductions',
    title: 'Introductions',
    titleCn: '自我介紹',
    level: 'b2',
    category: 'small-talk',
    phrases: [
      phrase("Hi, I'm ___. I work in ___.", '嗨，我是___，我在___工作。', 'small-talk', 1, ['intro']),
      phrase("Nice to meet you. What do you do?", '很高興認識你，你做什麼工作？', 'small-talk', 1, ['intro']),
      phrase("I've been with the company for about ___ years.", '我在這家公司大約___年了。', 'small-talk', 2, ['intro', 'work']),
      phrase("My role mainly involves ___.", '我的職責主要是___。', 'business', 2, ['work']),
      phrase("I'm originally from ___, but I've been living in ___ for ___.", '我來自___，但我在___住了___年了。', 'small-talk', 2, ['personal']),
      phrase("Before this, I worked at ___ as a ___.", '之前我在___擔任___。', 'small-talk', 2, ['work']),
      phrase("I specialize in ___.", '我的專長是___。', 'business', 3, ['work']),
      phrase("What brings you here today?", '你今天怎麼會來這裡？', 'small-talk', 1, ['intro']),
      phrase("We've actually met before, at ___.", '我們其實見過，在___。', 'small-talk', 2, ['intro']),
      phrase("I'd love to hear more about your work.", '我很想多了解你的工作。', 'small-talk', 2, ['intro']),
      phrase("I graduated from ___ with a degree in ___.", '我從___畢業，主修___。', 'small-talk', 2, ['education']),
      phrase("I'm currently working on a project related to ___.", '我目前在做一個跟___有關的專案。', 'business', 3, ['work']),
      phrase("Outside of work, I enjoy ___.", '工作以外，我喜歡___。', 'small-talk', 1, ['hobby']),
      phrase("I just joined the team last month.", '我上個月才加入這個團隊。', 'small-talk', 2, ['work']),
      phrase("Could you remind me of your name?", '可以再告訴我你的名字嗎？', 'small-talk', 1, ['intro']),
      phrase("I don't think we've been introduced.", '我想我們還沒正式認識。', 'small-talk', 1, ['intro']),
      phrase("I've heard a lot about you from ___.", '我從___那裡聽過很多關於你的事。', 'small-talk', 2, ['intro']),
      phrase("Let me give you my card.", '這是我的名片。', 'business', 1, ['work']),
      phrase("Feel free to reach out if you need anything.", '有需要隨時聯繫我。', 'business', 2, ['work']),
      phrase("It was great talking to you.", '跟你聊天很棒。', 'small-talk', 1, ['intro']),
    ],
  },
  {
    id: 'progress-update',
    title: 'Progress Update',
    titleCn: '進度更新',
    level: 'b2',
    category: 'business',
    phrases: [
      phrase("We're currently on track to meet the deadline.", '我們目前進度正常，可以如期完成。', 'business', 2, ['status']),
      phrase("We've completed about ___ percent of the work.", '我們已經完成了大約___%的工作。', 'business', 2, ['status']),
      phrase("The main blocker right now is ___.", '目前主要的阻礙是___。', 'business', 3, ['blocker']),
      phrase("We need ___ more days to finish this.", '我們需要再___天才能完成。', 'business', 2, ['timeline']),
      phrase("I'd like to give a quick update on ___.", '我想快速報告一下___的進度。', 'business', 2, ['status']),
      phrase("The good news is ___.", '好消息是___。', 'business', 1, ['status']),
      phrase("The challenge we're facing is ___.", '我們面臨的挑戰是___。', 'business', 3, ['blocker']),
      phrase("We should be able to resolve this by ___.", '我們應該能在___之前解決這個問題。', 'business', 3, ['timeline']),
      phrase("I'll send a follow-up email with the details.", '我會再發一封郵件說明細節。', 'business', 2, ['followup']),
      phrase("Is there anything you'd like me to prioritize?", '有什麼需要我優先處理的嗎？', 'business', 2, ['question']),
      phrase("We ran into an issue with ___.", '我們遇到一個___的問題。', 'business', 3, ['blocker']),
      phrase("The status hasn't changed since last week.", '進度跟上週一樣，沒有變化。', 'business', 2, ['status']),
      phrase("I'll need to push the deadline by ___.", '我需要把截止日期往後延___。', 'business', 3, ['timeline']),
      phrase("Can we schedule a quick sync on this?", '我們可以約個時間快速同步嗎？', 'business', 2, ['followup']),
      phrase("Everything is going according to plan.", '一切都在按計劃進行。', 'business', 1, ['status']),
      phrase("I've already flagged this to ___.", '我已經跟___提過這個問題了。', 'business', 3, ['followup']),
      phrase("We're waiting on ___ to finish their part.", '我們在等___完成他們的部分。', 'business', 3, ['blocker']),
      phrase("Let me share my screen to show the numbers.", '讓我分享螢幕給你看數據。', 'business', 2, ['status']),
      phrase("I think we should discuss this offline.", '我覺得這個我們可以之後再討論。', 'business', 2, ['followup']),
      phrase("To summarize, we're at ___ percent and expect to finish by ___.", '總結一下，我們目前完成___%，預計___完成。', 'business', 3, ['status']),
    ],
  },
  {
    id: 'repair-phrases',
    title: 'Repair Phrases',
    titleCn: '聽不懂時的修復句',
    level: 'b2',
    category: 'repair',
    phrases: [
      phrase("Could you say that again?", '可以再說一次嗎？', 'repair', 1, ['clarify']),
      phrase("Could you say it more slowly?", '可以說慢一點嗎？', 'repair', 1, ['clarify']),
      phrase("Do you mean that ___?", '你的意思是___嗎？', 'repair', 2, ['confirm']),
      phrase("Let me think for a second.", '讓我想一下。', 'repair', 1, ['pause']),
      phrase("What I'm trying to say is ___.", '我想說的是___。', 'repair', 2, ['rephrase']),
      phrase("I'm not familiar with that term.", '我不太熟悉那個用語。', 'repair', 2, ['vocabulary']),
      phrase("Could you give me an example?", '可以給我一個例子嗎？', 'repair', 2, ['clarify']),
      phrase("Let me make sure I understood you.", '讓我確認一下我有沒有聽懂。', 'repair', 2, ['confirm']),
      phrase("Sorry, I didn't catch that last part.", '抱歉，最後那部分我沒聽清楚。', 'repair', 1, ['clarify']),
      phrase("Could you rephrase that?", '可以換個方式說嗎？', 'repair', 2, ['clarify']),
      phrase("I think I follow, but just to clarify ___.", '我想我懂了，但想確認一下___。', 'repair', 3, ['confirm']),
      phrase("What does ___ mean in this context?", '這裡的___是什麼意思？', 'repair', 2, ['vocabulary']),
      phrase("I'm not sure I understand the question.", '我不確定我有沒有理解這個問題。', 'repair', 2, ['clarify']),
      phrase("Can you break that down for me?", '可以拆開來解釋嗎？', 'repair', 3, ['clarify']),
      phrase("Let me repeat what you said to make sure.", '讓我重複一下你說的，確認一下。', 'repair', 2, ['confirm']),
      phrase("I missed the first part, could you start over?", '前面的部分我沒聽到，可以從頭說嗎？', 'repair', 1, ['clarify']),
      phrase("Are you saying that ___?", '你是說___嗎？', 'repair', 1, ['confirm']),
      phrase("I got stuck on the word ___.", '我在___這個詞卡住了。', 'repair', 2, ['vocabulary']),
      phrase("Could you write that down?", '可以寫下來嗎？', 'repair', 1, ['clarify']),
      phrase("Sorry, English isn't my first language — could you simplify that?", '抱歉，英文不是我的母語——可以說簡單一點嗎？', 'repair', 1, ['clarify']),
    ],
  },
];

/** Seed phraseCards into IDB if empty */
export async function seedTopicPacksIfNeeded(): Promise<void> {
  const { getAll, put } = await import('../storage/indexeddb');
  const existing = await getAll('phraseCards');
  if (existing.length > 0) return;
  for (const pack of TOPIC_PACKS) {
    for (const p of pack.phrases) {
      await put('phraseCards', p);
    }
  }
}
