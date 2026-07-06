"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { TolgeeProvider } from "@tolgee/react";
import { useLocaleStore } from "@/state/localeStore";
import {
  createTolgee,
  languageNameToCode,
} from "./tolgee";

export default function TranslationProvider({ children }: { children: ReactNode }) {
  const language = useLocaleStore((s) => s.language);
  const tolgee = useMemo(() => createTolgee(languageNameToCode(language)), []);

  useEffect(() => {
    const code = languageNameToCode(language);
    tolgee.changeLanguage(code);
    if (typeof document !== "undefined") {
      document.documentElement.lang = code;
    }
  }, [language, tolgee]);

  return (
    <TolgeeProvider tolgee={tolgee} fallback={null}>
      {children}
    </TolgeeProvider>
  );
}
