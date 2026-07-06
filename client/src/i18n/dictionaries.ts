import en from "./locales/en.json";
import hi from "./locales/hi.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import zh from "./locales/zh.json";
import ar from "./locales/ar.json";
import bn from "./locales/bn.json";
import pt from "./locales/pt.json";
import ru from "./locales/ru.json";
import ur from "./locales/ur.json";

export type Dictionary = Record<string, string>;

type LanguageConfig = {
  code: string;
  dictionary: Dictionary;
};

export const LANGUAGE_DICTIONARIES: Record<string, LanguageConfig> = {
  English: { code: "en", dictionary: en },
  Hindi: { code: "hi", dictionary: hi },
  Spanish: { code: "es", dictionary: es },
  French: { code: "fr", dictionary: fr },
  Chinese: { code: "zh", dictionary: zh },
  Arabic: { code: "ar", dictionary: ar },
  Bengali: { code: "bn", dictionary: bn },
  Portuguese: { code: "pt", dictionary: pt },
  Russian: { code: "ru", dictionary: ru },
  Urdu: { code: "ur", dictionary: ur },
};

export function getLanguageConfig(language: string): LanguageConfig {
  return LANGUAGE_DICTIONARIES[language] ?? LANGUAGE_DICTIONARIES.English;
}

export function getDictionary(language: string): Dictionary {
  return getLanguageConfig(language).dictionary;
}
