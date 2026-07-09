import { test } from "node:test";
import assert from "node:assert/strict";
import {
  flightConfirmationHtml,
  flightConfirmationText,
  type FlightConfirmationData,
} from "./flightConfirmation";

const BASE: FlightConfirmationData = {
  to: "traveller@example.com",
  pnr: "ABC123",
  bookingReference: "SPK-000042",
  origin: "DEL",
  destination: "BOM",
  passengerNames: ["Mr Raj Kumar"],
  totalAmount: 4500,
};

test("unbranded email (apex / no agent) shows SpaksTrip and no reply-to note", () => {
  const html = flightConfirmationHtml(BASE);
  const text = flightConfirmationText(BASE);
  assert.match(html, /SpaksTrip/);
  assert.match(html, /Please do not reply to this email/);
  assert.doesNotMatch(html, /Reply to this email for support/);
  assert.match(text, /^BOOKING CONFIRMED — SpaksTrip$/m);
});

test("branded email (agent subdomain) shows agent name, logo, and reply-to note", () => {
  const data: FlightConfirmationData = {
    ...BASE,
    brand: {
      companyName: "Demo B2B Holidays",
      logo: "https://cdn.example.com/demob2b-logo.png",
      replyTo: "support@demob2b.example.com",
    },
  };
  const html = flightConfirmationHtml(data);
  const text = flightConfirmationText(data);

  assert.match(html, /Demo B2B Holidays/);
  assert.match(html, /<img src="https:\/\/cdn\.example\.com\/demob2b-logo\.png"/);
  assert.match(html, /Reply to this email for support/);
  assert.doesNotMatch(html, /Please do not reply to this email/);
  assert.match(text, /^BOOKING CONFIRMED — Demo B2B Holidays$/m);
});

test("branded email escapes HTML in the agent company name (XSS guard)", () => {
  const data: FlightConfirmationData = {
    ...BASE,
    brand: { companyName: '<script>alert(1)</script>' },
  };
  const html = flightConfirmationHtml(data);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
});

test("branded email without a logo falls back to a text wordmark", () => {
  const data: FlightConfirmationData = {
    ...BASE,
    brand: { companyName: "Raj Travels" },
  };
  const html = flightConfirmationHtml(data);
  assert.match(html, /Raj Travels<\/div>/);
  assert.doesNotMatch(html, /<img/);
});
