import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import TranslationProvider from "@/i18n/TranslationProvider";
import { AgentBrandingProvider, ThemePreviewScope } from "@/lib/agentBranding";
import { readAgentTheme } from "@/lib/theme/readAgentTheme";
import { buildThemeCssVars } from "@/lib/theme/tokens";
import { SITE_CONFIG, GOOGLE_ANALYTICS, GOOGLE_TAG_MANAGER } from "@/lib/seo/constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const { branding } = readAgentTheme(h.get("x-agent-theme"));

  if (branding.companyName) {
    // Agent subdomain: brand the tab (favicon → logo → platform default) and OG.
    const favicon = branding.favicon ?? branding.logo ?? "/logo.svg";
    const title = `${branding.companyName} — Flights, Hotels & More`;
    const description =
      branding.tagline ??
      `Book flights, hotels, and holiday packages with ${branding.companyName}.`;
    return {
      title,
      description,
      icons: { icon: favicon },
      openGraph: {
        title,
        description,
        siteName: branding.companyName,
        ...(branding.logo ? { images: [{ url: branding.logo }] } : {}),
      },
    };
  }

  return {
    title:       SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    icons:       { icon: "/logo.svg" },
    verification: {
      google: SITE_CONFIG.googleSearchConsoleVerification,
    },
  };
}

export const viewport: Viewport = {
  width:        "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const h = await headers();
  const { branding } = readAgentTheme(h.get("x-agent-theme"));

  // Derive the full CSS-var token set (primary, AA-safe fg, 50–900 scale, font)
  // from the agent's chosen colour and inject on <html>. Apex requests have no
  // theme header → undefined → globals.css defaults (== platform brand) stand,
  // so apex is pixel-identical.
  const agentStyle = buildThemeCssVars(branding.primaryColor, branding.fontKey) as
    | React.CSSProperties
    | undefined;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={agentStyle}
    >
      <head>
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS.id}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GOOGLE_ANALYTICS.id}');`}
        </Script>

        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GOOGLE_TAG_MANAGER.id}');`}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-surface text-ink">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GOOGLE_TAG_MANAGER.id}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        <ToastProvider>
          <TranslationProvider>
            <AgentBrandingProvider value={branding}>
              <ThemePreviewScope>{children}</ThemePreviewScope>
            </AgentBrandingProvider>
          </TranslationProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
