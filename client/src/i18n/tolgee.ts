import { Tolgee, DevTools, FormatSimple } from "@tolgee/web";
import en from "./keys/en.json";
import hi from "./keys/hi.json";

export const LANGUAGE_CODES = {
  English: "en",
  Hindi: "hi",
  Spanish: "es",
  French: "fr",
  Chinese: "zh",
  Arabic: "ar",
  Bengali: "bn",
  Portuguese: "pt",
  Russian: "ru",
  Urdu: "ur",
} as const;

export type LanguageName = keyof typeof LANGUAGE_CODES;
export type LanguageCode = (typeof LANGUAGE_CODES)[LanguageName];

export const CODE_TO_LANGUAGE: Record<string, LanguageName> = Object.fromEntries(
  Object.entries(LANGUAGE_CODES).map(([name, code]) => [code, name as LanguageName]),
) as Record<string, LanguageName>;

export function languageNameToCode(name: string): LanguageCode {
  return LANGUAGE_CODES[name as LanguageName] ?? "en";
}

export function languageCodeToName(code: string): LanguageName {
  return CODE_TO_LANGUAGE[code] ?? "English";
}

export function createTolgee(initialLanguageCode: LanguageCode = "en") {
  return Tolgee()
    .use(DevTools())
    .use(FormatSimple())
    .init({
      language: initialLanguageCode,
      defaultLanguage: "en",
      fallbackLanguage: "en",
      availableLanguages: Object.values(LANGUAGE_CODES),
      staticData: {
        en,
        hi,
      },
    });
}
