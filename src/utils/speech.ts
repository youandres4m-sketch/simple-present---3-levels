export interface SpeechController {
  isSupported: boolean;
  speak: (
    text: string,
    options?: {
      lang?: string;
      rate?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: () => void;
    }
  ) => void;
  stop: () => void;
}

function pickBestEnglishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null;

  const preferredExact = ['en-US', 'en_US', 'en-GB', 'en_GB'];
  for (const lang of preferredExact) {
    const natural = voices.find(
      (v) => v.lang === lang && /natural|google|samantha|daniel|alex|aria|guy/i.test(v.name)
    );
    if (natural) return natural;
  }

  for (const lang of preferredExact) {
    const match = voices.find((v) => v.lang === lang);
    if (match) return match;
  }

  return voices.find((v) => v.lang.toLowerCase().startsWith('en')) ?? null;
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

export function stopPronunciation(): void {
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore browser speech synthesis cancellation errors
  }
}

export function speakPronunciation(
  text: string,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  }
): boolean {
  if (!isSpeechSupported()) {
    callbacks?.onError?.();
    return false;
  }

  try {
    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    const voices = synth.getVoices();
    const voice = pickBestEnglishVoice(voices);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }

    utterance.onstart = () => {
      callbacks?.onStart?.();
    };
    utterance.onend = () => {
      callbacks?.onEnd?.();
    };
    utterance.onerror = () => {
      callbacks?.onEnd?.();
    };

    synth.speak(utterance);
    return true;
  } catch {
    callbacks?.onError?.();
    return false;
  }
}
