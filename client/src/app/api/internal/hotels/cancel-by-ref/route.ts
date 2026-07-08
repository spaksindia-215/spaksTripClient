import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import {
  tboSendChangeRequest,
  tboGetChangeRequestStatus,
  ChangeRequestType,
} from "@/lib/adapters/tbo/hotel/sendChangeRequest";
import { TboError } from "@/lib/adapters/tbo/errors";

function err(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

interface HotelPaymentRecordLookup {
  tboBookingId?: number | null;
  tboBookingRefNo?: string | null;
}

// POST /api/internal/hotels/cancel-by-ref
// Called server-to-server by the Express/Railway customer dashboard
// (requestCancel in server/src/controllers/customer.controller.ts) — never
// proxied from the browser. The dashboard's Booking document only stores TBO's
// BookingRefNo as `pnr`; this endpoint resolves that back to the numeric TBO
// BookingId (via hotel_payment_records, written at booking time) and actually
// invokes TBO's SendChangeRequest, which the dashboard's own Mongo update never did.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const bookingRefNo: string | undefined = body?.bookingRefNo;
    const remarks: string | undefined = body?.remarks;

    if (!bookingRefNo) {
      return err("bookingRefNo is required.", 400);
    }

    const db = await getDb();
    const col = db.collection<HotelPaymentRecordLookup>("hotel_payment_records");
    const record = await col.findOne({ tboBookingRefNo: bookingRefNo });

    if (!record?.tboBookingId) {
      return err(`No TBO bookingId found for bookingRefNo: ${bookingRefNo}`, 404);
    }

    const sendResult = await tboSendChangeRequest({
      bookingId: record.tboBookingId,
      requestType: ChangeRequestType.HotelCancel,
      remarks: remarks || "Customer-initiated cancellation",
    });

    let status = sendResult.changeRequestStatus;
    let refundAmount: number | undefined;
    let cancellationCharge: number | undefined;

    if (sendResult.changeRequestId) {
      try {
        const statusResult = await tboGetChangeRequestStatus({
          changeRequestId: sendResult.changeRequestId,
        });
        status = statusResult.changeRequestStatus;
        refundAmount = statusResult.refundAmount;
        cancellationCharge = statusResult.cancellationCharge;
      } catch {
        // SendChangeRequest already succeeded; a failed status poll doesn't
        // change that TBO received and accepted the cancel request.
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        changeRequestId: sendResult.changeRequestId,
        status,
        refundAmount,
        cancellationCharge,
        bookingId: record.tboBookingId,
        bookingRefNo,
      },
    });
  } catch (e) {
    const stack = e instanceof Error ? e.stack : String(e);
    console.error("[API /api/internal/hotels/cancel-by-ref] FAILED");
    console.error("  stack:", stack);

    if (e instanceof TboError) return err(`TBO error (${e.code}): ${e.message}`, 502);
    const message = e instanceof Error ? e.message : "Cancel request failed";
    return err(message, 500);
  }
}
