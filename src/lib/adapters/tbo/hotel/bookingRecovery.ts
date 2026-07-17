import "server-only";
import { tboGetHotelBookingDetail, type GetBookingDetailInput, type HotelBookingDetailResult } from "./booking";

/**
 * Booking Verification: verify TBO's actual booking outcome via GetBookingDetail.
 *
 * TBO certification clarification: "BookingDetails must be called only when
 * no response is received for the Book request (timeout/no response), using
 * the TraceId." This function must be called ONLY when the Book request's
 * outcome is ambiguous — request timeout, network failure, aborted fetch, or
 * any other case where we never received a determinate response from TBO —
 * using the TraceId. It must NOT be called for an explicit BookFailed
 * response: that is already a confirmed outcome and is handled by the
 * existing failure/refund flow directly.
 *
 * Callers should pass traceId (required per TBO). bookingId/confirmationNo
 * are supported as alternate lookup keys but are not expected to be
 * available in the ambiguous-outcome case this function targets.
 */
export async function verifyBookingStatusAfterTimeout(
  input: Partial<GetBookingDetailInput> & {
    bookingId?: number;
    confirmationNo?: string;
    traceId?: string;
    clientReferenceId?: string;
    tboFailureReason?: string;
  },
): Promise<{ found: boolean; booking?: HotelBookingDetailResult; error?: string }> {
  if (!input.bookingId && !input.confirmationNo && !input.traceId) {
    return {
      found: false,
      error: "Cannot verify booking: provide at least bookingId, confirmationNo, or traceId",
    };
  }

  try {
    const detail = await tboGetHotelBookingDetail({
      bookingId: input.bookingId,
      confirmationNo: input.confirmationNo,
      firstName: input.firstName,
      lastName: input.lastName,
      traceId: input.traceId,
      clientReferenceNo: input.clientReferenceId,
      endUserIp: input.endUserIp,
    });

    return {
      found: true,
      booking: detail,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Failed to verify booking status";
    return {
      found: false,
      error: errorMsg,
    };
  }
}

/**
 * Returns user-friendly message about timeout recovery process.
 */
export function getTimeoutRecoveryMessage(clientReferenceId: string): string {
  return (
    `Your booking request took longer than expected (>120 seconds) to process. ` +
    `This may indicate a network issue, but your booking may have been created at TBO. ` +
    `Please:\n\n` +
    `1. Check your email for booking confirmation\n` +
    `2. Log into your account to check booking status\n` +
    `3. Contact support with reference ID: ${clientReferenceId}\n\n` +
    `Your booking is protected and will be verified through our backend system.`
  );
}
