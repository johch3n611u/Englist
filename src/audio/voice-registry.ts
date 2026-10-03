export interface VoiceInfo {
  name: string;
  lang: string;
  isDefault: boolean;
}

export interface VoiceRegistry {
  getVoices(): VoiceInfo[];
  getVoicesByLang(langPrefix: string): VoiceInfo[];
  testVoice(name: string, text?: string): Promise<void>;
  onReady(fn: () => void): void;
}

export function createVoiceRegistry(): VoiceRegistry {
  const synth = window.speechSynthesis;
  let voices: VoiceInfo[] = [];
  let readyCallbacks: (() => void)[] = [];
  let loaded = false;

  function loadVoices() {
    voices = synth.getVoices().map(v => ({
      name: v.name,
      lang: v.lang,
      isDefault: v.default,
    }));
    if (voices.length > 0 && !loaded) {
      loaded = true;
      for (const fn of readyCallbacks) fn();
      readyCallbacks = [];
    }
  }

  loadVoices();
  synth.addEventListener('voiceschanged', loadVoices);

  return {
    getVoices: () => voices,
    getVoicesByLang(prefix) {
      return voices.filter(v => v.lang.startsWith(prefix));
    },
    async testVoice(name, text = 'Hello, this is a test.') {
      const v = synth.getVoices().find(x => x.name === name);
      if (!v) return;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.voice = v;
      u.lang = v.lang;
      synth.speak(u);
    },
    onReady(fn) {
      if (loaded) fn(); else readyCallbacks.push(fn);
    },
  };
}
