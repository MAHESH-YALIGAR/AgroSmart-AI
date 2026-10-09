import { useEffect, useState } from "react";
import type { LearningLanguage } from "../app/learn/LanguageDropdown";

const translationCache = new Map<string, string>();
let translationQueue = Promise.resolve();
const NON_TRANSLATABLE_KEYS = new Set(["key", "icon", "color", "url", "type"]);

const isTranslatableKey = (key: string) =>
  !NON_TRANSLATABLE_KEYS.has(key) && !key.toLowerCase().startsWith("kannada");

async function translateText(text: string, language: Exclude<LearningLanguage, "en" | "kn">) {
  const trimmedText = text.trim();
  if (!trimmedText || /^https?:\/\//.test(trimmedText) || translationCache.has(`${language}:${trimmedText}`)) {
    return translationCache.get(`${language}:${trimmedText}`) ?? text;
  }

  const translationTask = translationQueue.then(async () => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const query = encodeURIComponent(trimmedText);
        const response = await fetch(
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${language}&dt=t&q=${query}`
        );
        const responseText = await response.text();
        const trimmedResponse = responseText.trimStart();

        if (response.ok && !trimmedResponse.startsWith("<")) {
          const payload = JSON.parse(responseText);
          const translated = Array.isArray(payload?.[0])
            ? payload[0].map((part: unknown[]) => part?.[0] || "").join("")
            : text;
          translationCache.set(`${language}:${trimmedText}`, translated);
          return translated;
        }
      } catch {
        // Retry after a short pause when the service returns a block page.
      }

      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }

    return text;
  });

  translationQueue = translationTask.then(() => undefined, () => undefined);
  return translationTask;
}

async function translateValue(value: unknown, language: Exclude<LearningLanguage, "en" | "kn">, key?: string): Promise<unknown> {
  if (typeof value === "string") {
    return key && !isTranslatableKey(key) ? value : translateText(value, language);
  }

  if (Array.isArray(value)) {
    return Promise.all(value.map((item) => translateValue(item, language)));
  }

  if (value && typeof value === "object") {
    const entries = await Promise.all(
      Object.entries(value).map(async ([entryKey, entryValue]) => [
        entryKey,
        await translateValue(entryValue, language, entryKey),
      ])
    );
    return Object.fromEntries(entries);
  }

  return value;
}

export function useTranslatedContent<T>(source: T, language: LearningLanguage): T {
  const [translatedSource, setTranslatedSource] = useState(source);

  useEffect(() => {
    let cancelled = false;

    if (language === "en" || language === "kn") {
      setTranslatedSource(source);
      return () => {
        cancelled = true;
      };
    }

    translateValue(source, language).then((translated) => {
      if (!cancelled) {
        setTranslatedSource(translated as T);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [source, language]);

  return translatedSource;
}
