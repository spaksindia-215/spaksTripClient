"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { buildThemeCssVars } from "./theme/tokens";
import { isPreviewThemeMessage, type PreviewThemePayload } from "./theme/preview";

export interface AgentBranding {
  agentId:      string | null;
  slug:         string | null;
  companyName:  string | null;
  tagline:      string | null;
  primaryColor: string | null;
  logo:         string | null;
  logoDark:     string | null;
  favicon:      string | null;
  fontKey:      string | null;
  contactEmail: string | null;
  contactPhone: string | null;
}

const DEFAULT_BRANDING: AgentBranding = {
  agentId:      null,
  slug:         null,
  companyName:  null,
  tagline:      null,
  primaryColor: null,
  logo:         null,
  logoDark:     null,
  favicon:      null,
  fontKey:      null,
  contactEmail: null,
  contactPhone: null,
};

const AgentBrandingContext = createContext<AgentBranding>(DEFAULT_BRANDING);
const PreviewOverrideContext = createContext<PreviewThemePayload | null>(null);

export function AgentBrandingProvider({
  value,
  children,
}: {
  value: AgentBranding;
  children: React.ReactNode;
}) {
  return (
    <AgentBrandingContext.Provider value={value}>
      {children}
    </AgentBrandingContext.Provider>
  );
}

/**
 * Listens for postMessage'd draft branding from a parent /agent/branding tab
 * (see lib/theme/preview.ts) and applies it as a CLIENT-ONLY override: CSS vars
 * are set directly on <html> and reverted on change/unmount; nothing is written
 * to storage, cache, or the network. Mount once, near the root, below
 * AgentBrandingProvider — real (saved) branding still comes from the server.
 */
export function ThemePreviewScope({ children }: { children: React.ReactNode }) {
  const [override, setOverride] = useState<PreviewThemePayload | null>(null);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (!isPreviewThemeMessage(event.data)) return;
      setOverride(event.data.payload);
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    if (!override) return;
    const vars = buildThemeCssVars(override.primaryColor, override.fontKey);
    if (!vars) return;
    const root = document.documentElement;
    const previous: Record<string, string> = {};
    for (const [key, val] of Object.entries(vars)) {
      previous[key] = root.style.getPropertyValue(key);
      root.style.setProperty(key, val);
    }
    return () => {
      for (const [key, val] of Object.entries(previous)) {
        if (val) root.style.setProperty(key, val);
        else root.style.removeProperty(key);
      }
    };
  }, [override]);

  return (
    <PreviewOverrideContext.Provider value={override}>
      {children}
    </PreviewOverrideContext.Provider>
  );
}

/**
 * Returns agent branding for the current subdomain, or all-null on apex.
 * Text/contact fields reflect a live preview override when one is active
 * (see ThemePreviewScope) — the override is client-only and never persisted.
 */
export function useAgentBranding(): AgentBranding {
  const base = useContext(AgentBrandingContext);
  const override = useContext(PreviewOverrideContext);
  if (!override) return base;
  return {
    ...base,
    companyName:  override.companyName ?? base.companyName,
    tagline:      override.tagline ?? base.tagline,
    primaryColor: override.primaryColor ?? base.primaryColor,
    fontKey:      override.fontKey ?? base.fontKey,
    contactEmail: override.contactEmail ?? base.contactEmail,
    contactPhone: override.contactPhone ?? base.contactPhone,
  };
}
