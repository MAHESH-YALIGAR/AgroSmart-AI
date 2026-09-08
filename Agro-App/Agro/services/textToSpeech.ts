import * as Speech from "expo-speech";
import { getTtsLanguageCode } from "../utils/languageMapping";

let activeSpeechSession = 0;

export type SpeakTextOptions = {
  selectedLanguage?: string | null;
  onError?: (message: string) => void;
  onDone?: () => void;
  onStopped?: () => void;
};

export const stopSpeech = () => {
  activeSpeechSession += 1;

  try {
    Speech.stop();
  } catch (error) {
    console.log("TTS stop error:", error);
  }
};

export const speakText = async (
  text: string,
  selectedLanguage?: string | null,
  options?: SpeakTextOptions
) => {
  if (!text || !text.trim()) {
    return;
  }

  const trimmedText = text.trim();
  const ttsLanguage = getTtsLanguageCode(selectedLanguage);
  const sessionId = activeSpeechSession + 1;
  activeSpeechSession = sessionId;

  try {
    const availableVoices = await Speech.getAvailableVoicesAsync();

    if (sessionId !== activeSpeechSession) {
      return;
    }

    const voiceExists = availableVoices.some((voice) => {
      const voiceLanguage = voice.language?.toLowerCase();
      return voiceLanguage === ttsLanguage.toLowerCase();
    });

    if (!voiceExists) {
      const message = `This device does not have a voice for ${selectedLanguage || "the selected language"}.`;
      if (sessionId === activeSpeechSession) {
        options?.onError?.(message);
      }
      return;
    }

    if (sessionId !== activeSpeechSession) {
      return;
    }

    Speech.speak(trimmedText, {
      language: ttsLanguage,
      pitch: 1,
      rate: 1,
      onDone: () => {
        console.log("TTS finished");
        if (sessionId === activeSpeechSession) {
          options?.onDone?.();
        }
      },
      onStopped: () => {
        console.log("TTS stopped");
        if (sessionId === activeSpeechSession) {
          options?.onStopped?.();
        }
      },
      onError: (error) => {
        console.log("TTS error:", error);
        if (sessionId === activeSpeechSession) {
          options?.onError?.("Unable to play the selected response right now.");
        }
      },
    });
  } catch (error) {
    console.log("TTS speak error:", error);
    if (sessionId === activeSpeechSession) {
      options?.onError?.("Unable to play the selected response right now.");
    }
  }
};
