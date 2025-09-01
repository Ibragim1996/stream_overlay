// app/types/speech-rec.d.ts

// Минимальные типы для Web Speech API (Chrome)
declare global {
  interface Window {
    webkitSpeechRecognition?: {
      new(): SpeechRecognition;
    };
    SpeechRecognition?: {
      new(): SpeechRecognition;
    };
  }

  interface SpeechRecognition extends EventTarget {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    start(): void;
    stop(): void;
    onresult: ((ev: SpeechRecognitionEvent) => void) | null;
    onerror: ((ev: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
  }

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

  interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
  }
}
export {};