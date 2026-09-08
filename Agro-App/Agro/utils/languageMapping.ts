export const SUPPORTED_LANGUAGE_OPTIONS = [
  "English",
  "Kannada",
  "Hindi",
  "Tamil",
  "Telugu",
  "Malayalam",
  "Marathi",
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGE_OPTIONS)[number];

export const LANGUAGE_TTS_MAP: Record<SupportedLanguage, string> = {
  English: "en-US",
  Kannada: "kn-IN",
  Hindi: "hi-IN",
  Tamil: "ta-IN",
  Telugu: "te-IN",
  Malayalam: "ml-IN",
  Marathi: "mr-IN",
};

export const getTtsLanguageCode = (selectedLanguage?: string | null): string => {
  if (!selectedLanguage) {
    return LANGUAGE_TTS_MAP.English;
  }

  const normalizedLanguage = selectedLanguage.trim();

  const matchedLanguage = Object.keys(LANGUAGE_TTS_MAP).find(
    (language) => language.toLowerCase() === normalizedLanguage.toLowerCase()
  );

  return matchedLanguage ? LANGUAGE_TTS_MAP[matchedLanguage as SupportedLanguage] : LANGUAGE_TTS_MAP.English;
};
