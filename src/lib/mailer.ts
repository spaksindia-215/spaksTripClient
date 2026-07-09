import "server-only";
import nodemailer from "nodemailer";
import {
  flightConfirmationHtml,
  flightConfirmationSubject,
  flightConfirmationText,
  type FlightConfirmationData,
} from "./mailTemplates/flightConfirmation";

export type { FlightConfirmationData, MailBrand } from "./mailTemplates/flightConfirmation";

// Configured via env vars — set these in .env.local:
//   EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM
// Falls back to console logging when EMAIL_HOST is unset (dev/CI).

function buildTransport() {
  const host = process.env.EMAIL_HOST;
  if (!host) return null;
  return nodemailer.createTransport({
    host,
    port: Number(process.env.EMAIL_PORT ?? 587),
    secure: Number(process.env.EMAIL_PORT ?? 587) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

export async function sendFlightConfirmation(data: FlightConfirmationData): Promise<void> {
  const from = process.env.EMAIL_FROM ?? "SpaksTrip <noreply@spakstrip.com>";
  const subject = flightConfirmationSubject(data);

  const transport = buildTransport();
  if (!transport) {
    // Dev fallback: log to console when SMTP is not configured.
    console.log(
      [
        "",
        "──────── FLIGHT CONFIRMATION MAIL (console transport) ────────",
        `To:      ${data.to}`,
        `Subject: ${subject}`,
        "",
        flightConfirmationText(data),
        "──────────────────────────────────────────────────────────────",
        "",
      ].join("\n"),
    );
    return;
  }

  await transport.sendMail({
    from,
    to: data.to,
    subject,
    text: flightConfirmationText(data),
    html: flightConfirmationHtml(data),
    // On an agent subdomain, replies route to the agent's support inbox; the
    // platform stays the technical sender (SPF/DKIM alignment on our domain).
    ...(data.brand?.replyTo ? { replyTo: data.brand.replyTo } : {}),
  });
}
