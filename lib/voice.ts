// app/lib/voice.ts
export type UseVoiceOptions = {
  lang?: string;
  onText?: (text: string) => void;
  onState?: (state: "idle" | "listening" | "error") => void;
};

export function useVoice({ lang="en-US", onText, onState }: UseVoiceOptions) {
  let rec: SpeechRecognition | null = null;

  const start = async () => {
    const SR = (window as Window & typeof globalThis).SpeechRecognition || (window as Window & typeof globalThis).webkitSpeechRecognition;
    if (!SR) {
      onState?.("error");
      console.warn("SpeechRecognition not supported in this browser");
      return;
    }
    try {
      // запрос разрешения на микрофон
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      onState?.("error");
      return;
    }

    rec = new SR();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = false;

    rec.onresult = (ev: SpeechRecognitionEvent) => {
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        if (!ev.results[i].isFinal) continue;
        const text = ev.results[i][0].transcript?.toLowerCase().trim();
        if (text) onText?.(text);
      }
    };
    rec.onerror = () => onState?.("error");
    rec.onend = () => onState?.("idle");

    rec.start();
    onState?.("listening");
  };

  const stop = () => {
    try { rec?.stop(); } catch {}
    onState?.("idle");
  };

  return { start, stop };
}