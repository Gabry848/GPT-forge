// Types for react-speech-recognition
declare module 'react-speech-recognition' {
  export interface SpeechRecognitionOptions {
    continuous?: boolean;
    interimResults?: boolean;
    lang?: string;
  }

  export interface SpeechRecognitionListenOptions {
    continuous?: boolean;
    language?: string;
    interimResults?: boolean;
  }

  export interface SpeechRecognitionResults {
    transcript: string;
    interimTranscript: string;
    finalTranscript: string;
    listening: boolean;
    resetTranscript: () => void;
    browserSupportsSpeechRecognition: boolean;
    isMicrophoneAvailable: boolean;
  }

  export const useSpeechRecognition: (options?: SpeechRecognitionOptions) => SpeechRecognitionResults;

  export const startListening: (options?: SpeechRecognitionListenOptions) => Promise<void>;
  export const stopListening: () => void;
  export const abortListening: () => void;
  export const browserSupportsSpeechRecognition: boolean;
  export const getRecognition: () => any;
}
