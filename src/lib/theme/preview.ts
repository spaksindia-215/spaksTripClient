// Contract for the live branding preview: the /agent/branding page embeds an
// iframe of the agent's real subdomain and postMessages unsaved form state into
// it. The child page (ThemePreviewScope in agentBranding.tsx) applies it as a
// client-only override — never written to any store, never sent to the server,
// cleared the moment the iframe navigates or unmounts.

export const PREVIEW_MESSAGE_TYPE = "spakstrip:preview-theme";

export interface PreviewThemePayload {
  companyName?: string | null;
  tagline?: string | null;
  primaryColor?: string | null;
  fontKey?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
}

export interface PreviewThemeMessage {
  type: typeof PREVIEW_MESSAGE_TYPE;
  payload: PreviewThemePayload;
}

export function isPreviewThemeMessage(data: unknown): data is PreviewThemeMessage {
  if (typeof data !== "object" || data === null) return false;
  return (data as { type?: unknown }).type === PREVIEW_MESSAGE_TYPE;
}
