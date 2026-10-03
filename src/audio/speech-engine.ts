import type { VoiceSettings } from '../app/types';

export interface SpeechEngine {
  speak(text: string, settings?: Partial<VoiceSettings>): Promise<void>;
  stop(): void;
  pause(): void;
  resume(): void;
  onWordBoundary: ((wordIndex: number) => void) | null;
  isPlaying(): boolean;
}

export function createSpeechEngine(): SpeechEngine {
  const synth = window.speechSynthesis;
  let currentUtterance: SpeechSynthesisUtterance | null = null;
  let playing = false;

  const engine: SpeechEngine = {
    onWordBoundary: null,

    speak(text, settings = {}) {
      return new Promise<void>((resolve, reject) => {
        synth.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = settings.lang ?? 'en-US';
        u.rate = settings.rate ?? 1.0;
        u.pitch = settings.pitch ?? 1.0;
        u.volume = settings.volume ?? 1.0;

        if (settings.voiceName) {
          const voices = synth.getVoices();
          const match = voices.find(v => v.name === settings.voiceName);
          if (match) u.voice = match;
        }

        u.onboundary = (e) => {
          if (e.name === 'word' && engine.onWordBoundary) {
            engine.onWordBoundary(e.charIndex);
          }
        };

        u.onend = () => { playing = false; resolve(); };
        u.onerror = (e) => {
          playing = false;
          // "interrupted" is normal when cancel() or speak() again
          if (e.error === 'interrupted' || e.error === 'canceled') {
            resolve();
          } else {
            reject(new Error(e.error));
          }
        };

        playing = true;
        currentUtterance = u;
        synth.speak(u);

        // Safety: some browsers (Chrome) fail to fire onend after long utterances
        setTimeout(() => { if (playing) { playing = false; resolve(); } }, 30_000);
      });
    },

    stop() { synth.cancel(); playing = false; },
    pause() { synth.pause(); },
    resume() { synth.resume(); },
    isPlaying() { return playing; },
  };

  return engine;
}
