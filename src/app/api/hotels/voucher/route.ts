import { NextRequest, NextResponse } from "next/server";
import { tboGenerateVoucher } from "@/lib/adapters/tbo/hotel/generateVoucher";
import type { GenerateVoucherInput } from "@/lib/adapters/tbo/hotel/generateVoucher";
import { validateVoucherDeadline } from "@/lib/adapters/tbo/hotel/voucherDeadline";
import { TboError, TboBookingFailedError } from "@/lib/adapters/tbo/errors";
import { internalApiHeaders } from "@/lib/server/internalApi";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

function err(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// Flips the dashboard-facing Booking record from "held" to "active" so the
// customer stops seeing the "Generate Voucher" prompt. Best-effort — the TBO
// voucher itself already succeeded by the time this runs, so a failure here
// must never fail the voucher response.
function notifyDashboardVouchered(bookingId: number): void {
  fetch(new URL("/api/internal/hotel-booking-vouchered", API_BASE), {
    method: "POST",
    headers: { "content-type": "application/json", ...internalApiHeaders() },
    body: JSON.stringify({ bookingId }),
    cache: "no-store",
  }).catch((e: unknown) => {
    console.error("[hotel-booking-vouchered] fire-and-forget failed:", e instanceof Error ? e.message : String(e));
  });
}

// POST /api/hotels/voucher
// Required: bookingId (integer)
// Optional: lastVoucherDate (ISO date string) — deadline check
// Optional: isCorporate, endUserIp
// Optional: roomsDetails[].passengers[].{ paxId, pan }  — only when PAN was deferred at Book time
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body?.bookingId == null) {
      return err("bookingId is required.", 400);
    }

    // Validate voucher deadline if provided
    if (body.lastVoucherDate) {
      try {
        validateVoucherDeadline(body.lastVoucherDate);
      } catch (deadlineErr) {
        const msg = deadlineErr instanceof Error ? deadlineErr.message : "Voucher deadline exceeded";
        return err(msg, 410); // 410 Gone - deadline passed
      }
    }

    const bookingId = Number(body.bookingId);
    if (!Number.isFinite(bookingId) || bookingId <= 0) {
      return err("bookingId must be a positive integer.", 400);
    }

    if (body.roomsDetails !== undefined) {
      if (!Array.isArray(body.roomsDetails)) {
        return err("roomsDetails must be an array.", 400);
      }
      for (let i = 0; i < body.roomsDetails.length; i++) {
        const room = body.roomsDetails[i];
        if (!Array.isArray(room?.passengers)) {
          return err(`roomsDetails[${i}].passengers must be an array.`, 400);
        }
        for (let j = 0; j < room.passengers.length; j++) {
          const pax = room.passengers[j];
          if (pax?.paxId == null || !pax?.pan) {
            return err(`roomsDetails[${i}].passengers[${j}] must have paxId and pan.`, 400);
          }
        }
      }
    }

    const input: GenerateVoucherInput = {
      bookingId,
      endUserIp: body.endUserIp,
      isCorporate: body.isCorporate,
      roomsDetails: body.roomsDetails,
    };

    const result = await tboGenerateVoucher(input);
    notifyDashboardVouchered(bookingId);
    return NextResponse.json({ success: true, data: result });
  } catch (e) {
    const stack = e instanceof Error ? e.stack : String(e);
    console.error("[API /api/hotels/voucher] FAILED");
    console.error("  stack:", stack);

    if (e instanceof TboBookingFailedError) {
      return err(`Voucher failed: ${e.message}`, 422);
    }
    if (e instanceof TboError) return err(`TBO error (${e.code}): ${e.message}`, 502);
    const message = e instanceof Error ? e.message : "GenerateVoucher failed";
    return err(message, 500);
  }
}
