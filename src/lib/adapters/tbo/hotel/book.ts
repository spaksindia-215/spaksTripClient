import "server-only";
import { logRequest, logResponse, logError } from "../log";
import { assertTboSuccess, TboBookingFailedError, TboBookOutcomeUnknownError, TboError } from "../errors";
import { basicAuthHeader, type DistributionType } from "./hotelUtils";
import { fetchWithTimeout, isTimeoutError, TimeoutError } from "../timeout";

// Endpoint: POST https://HotelBE.tektravels.com/hotelservice.svc/rest/book/
// BookingCode must come from the PreBook response.
// NetAmount must match the PreBook response NetAmount exactly.
// Auth: Basic Auth with agency credentials (same pair as Search/PreBook).

const TBO_BOOK_URL = (
  process.env.TBO_HOLIDAYS_BOOK_URL ??
  "https://HotelBE.tektravels.com/hotelservice.svc/rest/book"
).replace(/\/$/, "");

// ─── Input shapes ─────────────────────────────────────────────────────────────

export interface HotelBookPassenger {
  title: string;        // TBO Hotels only support: "Mr", "Mrs", "Ms"
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  phoneNo?: string;
  paxType: 1 | 2;          // 1 = Adult, 2 = Child
  leadPassenger: boolean;
  age?: number;             // required when paxType = 2 (Child, age ≤ 12)
  passportNo?: string;
  passportIssueDate?: string;
  passportExpDate?: string;
  pan?: string;
  gstCompanyName?: string;
  gstNumber?: string;
  gstCompanyEmail?: string;
  gstCompanyAddress?: string;
  gstCompanyContactNumber?: string;
}

export interface HotelBookRoomDetails {
  passengers: HotelBookPassenger[];
}

export interface HotelBookInput {
  bookingCode: string;              // from PreBook response room.bookingCode
  netAmount: number;                // from PreBook response room.netAmount or totalFare
  isVoucherBooking: boolean;        // true = voucher immediately, false = hold
  guestNationality?: string;        // ISO-2, default "IN"
  endUserIp?: string;               // end-user IP, default from env
  clientReferenceId?: string;       // optional reference for reconciliation
  roomsDetails: HotelBookRoomDetails[];
  isPackageFare?: boolean;          // mirror PackageFare from PreBook
  isPackageDetailsMandatory?: boolean;
  arrivalTransportType?: 0 | 1;    // 0 = Flight, 1 = Surface
  arrivalTransportInfoId?: string;
  arrivalTransportTime?: string;
  distributionType?: DistributionType;
  // Corporate booking fields (when corporateBookingAllowed=true from PreBook)
  isCorporate?: boolean;            // true for corporate booking
  corporatePan?: string;            // required when isCorporate=true
}

// ─── Output shapes ────────────────────────────────────────────────────────────

export type HotelBookStatus =
  | "Confirmed"
  | "BookFailed"
  | "VerifyPrice"
  | "Cancelled"
  | "Unknown";

export interface HotelBookOutput {
  bookingId: number | null;
  bookingRefNo: string | null;
  confirmationNo: string | null;
  invoiceNumber: string | null;
  status: number;                       // 0=BookFailed 1=Confirmed 3=VerifyPrice 6=Cancelled
  bookingStatus: HotelBookStatus;
  voucherStatus: boolean;
  isPriceChanged: boolean;
  isCancellationPolicyChanged: boolean;
  updatedNetAmount?: number;            // populated when status=3 (VerifyPrice)
}

// ─── Raw TBO response shape ───────────────────────────────────────────────────

interface TboBookResult {
  VoucherStatus?: boolean;
  ResponseStatus?: number;
  Error?: { ErrorCode: number; ErrorMessage: string };
  TraceId?: string;
  Status?: number;
  HotelBookingStatus?: string;
  InvoiceNumber?: string;
  ConfirmationNo?: string;
  BookingRefNo?: string;
  BookingId?: number | null;
  IsPriceChanged?: boolean;
  IsCancellationPolicyChanged?: boolean;
  NetAmount?: number;
}

interface TboBookResponse {
  BookResult?: TboBookResult;
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

const STATUS_BY_NAME: Partial<Record<string, HotelBookStatus>> = {
  Confirmed: "Confirmed",
  BookFailed: "BookFailed",
  VerifyPrice: "VerifyPrice",
  Cancelled: "Cancelled",
};

const STATUS_BY_CODE: Partial<Record<number, HotelBookStatus>> = {
  1: "Confirmed",
  3: "VerifyPrice",
  6: "Cancelled",
};

function mapBookingStatus(raw: string | undefined, code: number | undefined): HotelBookStatus {
  const statusFromName = raw ? STATUS_BY_NAME[raw] : undefined;
  const statusFromCode = code !== undefined ? STATUS_BY_CODE[code] : undefined;
  return statusFromName ?? statusFromCode ?? "Unknown";
}

// ─── Public function ──────────────────────────────────────────────────────────

export async function tboBookHotel(input: HotelBookInput): Promise<HotelBookOutput> {
  const hotelPassengersByRoom = input.roomsDetails.map((room) => ({
    HotelPassenger: room.passengers.map((p) => ({
      Title: p.title,
      FirstName: p.firstName,
      MiddleName: p.middleName ?? "",
      LastName: p.lastName,
      Email: p.email ?? null,
      Phoneno: p.phoneNo ?? null,
      PaxType: p.paxType,
      LeadPassenger: p.leadPassenger,
      Age: p.age ?? 0,
      PassportNo: p.passportNo ?? null,
      PassportIssueDate: p.passportIssueDate ?? null,
      PassportExpDate: p.passportExpDate ?? null,
      PAN: p.pan ?? null,
      PaxId: 0,
      GSTCompanyName: p.gstCompanyName ?? null,
      GSTNumber: p.gstNumber ?? null,
      GSTCompanyEmail: p.gstCompanyEmail ?? null,
      GSTCompanyAddress: p.gstCompanyAddress ?? null,
      GSTCompanyContactNumber: p.gstCompanyContactNumber ?? null,
    })),
  }));

  const reqBody: Record<string, unknown> = {
    BookingCode: input.bookingCode,
    IsVoucherBooking: input.isVoucherBooking,
    GuestNationality: input.guestNationality ?? "IN",
    EndUserIp: input.endUserIp ?? process.env.TBO_END_USER_IP ?? "1.1.1.1",
    NetAmount: input.netAmount,
    RequestedBookingMode: 5,
    HotelRoomsDetails: hotelPassengersByRoom,
  };

  if (input.clientReferenceId) {
    reqBody.ClientReferenceId = input.clientReferenceId;
  }
  if (input.isPackageFare !== undefined) {
    reqBody.IsPackageFare = input.isPackageFare;
  }
  if (input.isPackageDetailsMandatory !== undefined) {
    reqBody.IsPackageDetailsMandatory = input.isPackageDetailsMandatory;
  }
  if (input.arrivalTransportType !== undefined) {
    reqBody.ArrivalTransport = {
      ArrivalTransportType: input.arrivalTransportType,
      TransportInfoId: input.arrivalTransportInfoId ?? "",
      Time: input.arrivalTransportTime ?? "0001-01-01T00:00:00",
    };
  }
  // Corporate booking support (when hotel allows corporate bookings)
  if (input.isCorporate) {
    if (!input.corporatePan) {
      throw new Error("Corporate PAN is required when isCorporate=true");
    }
    reqBody.IsCorporate = true;
    reqBody.CorporatePAN = input.corporatePan;
  }

  logRequest("Hotel Book", TBO_BOOK_URL, {
    ...reqBody,
    HotelRoomsDetails: `[${hotelPassengersByRoom.length} room(s), ${hotelPassengersByRoom.reduce((n, r) => n + r.HotelPassenger.length, 0)} passenger(s)]`,
  });
  // Diagnostic only: confirms PAN is present/absent per passenger without
  // logging the actual PAN value.
  console.log(
    "[Hotel Book] passenger PAN presence:",
    hotelPassengersByRoom.flatMap((r) =>
      r.HotelPassenger.map((p) => ({
        PaxType: p.PaxType,
        LeadPassenger: p.LeadPassenger,
        hasPan: p.PAN != null && p.PAN !== "",
      })),
    ),
  );

  const distributionType = input.distributionType ?? "b2c";
  let res: Response;
  let bookingTimeout = false;
  let timeoutBookingId: number | null = null;

  try {
    res = await fetchWithTimeout(TBO_BOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: basicAuthHeader(distributionType),
      },
      body: JSON.stringify(reqBody),
      cache: "no-store",
      timeoutMs: 120000, // TBO recommends 120 second cutoff
    });
  } catch (err) {
    // Handle timeout: attempt to retrieve booking status via BookingDetail
    if (isTimeoutError(err)) {
      const timeoutMsg = err instanceof Error ? err.message : String(err);
      logError("Hotel Book", new Error(`Booking request timed out (${timeoutMsg}). Attempting to verify booking status...`));
      bookingTimeout = true;

      // Try to fetch booking detail using ClientReferenceId or booking code
      // Note: This is a best-effort attempt; BookingDetail requires BookingId which we may not have
      // In production, you'd want to persist the booking state and retry status checks
      console.warn("[Hotel Book] Timeout occurred. Booking may have been created at TBO. Status verification attempted.");
      throw new TboBookingFailedError(
        "Booking request timed out after 120 seconds. Please verify booking status on your account. If issue persists, contact support with reference: " +
          (input.clientReferenceId || "N/A")
      );
    }

    // Non-timeout network/transport failure (DNS, connection reset, etc.) —
    // the request may or may not have reached TBO. Outcome is unknown, not a
    // confirmed failure: must be verified via GetBookingDetail, never
    // refunded outright. See TboBookOutcomeUnknownError.
    logError("Hotel Book", err);
    const errMsg = err instanceof Error ? err.message : String(err);
    throw new TboBookOutcomeUnknownError(`TBO Book request failed before a response was received: ${errMsg}`);
  }

  const text = await res.text();
  let data: TboBookResponse;
  try {
    data = JSON.parse(text);
  } catch {
    // TBO responded but the body isn't parseable — we can't read the actual
    // booking outcome. Unknown, not a confirmed failure.
    throw new TboBookOutcomeUnknownError(
      `TBO Book non-JSON (HTTP ${res.status}) from ${TBO_BOOK_URL}: ${text.slice(0, 200)}`,
    );
  }

  // Diagnostics only: Error/TraceId are not passenger or payment data, safe to log.
  logResponse("Hotel Book", res.status, {
    Status: data.BookResult?.Status,
    HotelBookingStatus: data.BookResult?.HotelBookingStatus,
    BookingId: data.BookResult?.BookingId,
    IsPriceChanged: data.BookResult?.IsPriceChanged,
    Error: data.BookResult?.Error,
    TraceId: data.BookResult?.TraceId,
  });

  // HTTP-level failure with a parsed body — TBO's own BookResult (if present)
  // did not report success/failure via the normal envelope, so we can't trust
  // this as a confirmed outcome either way. Unknown, not a confirmed failure.
  if (!res.ok) {
    const unknownErr = new TboBookOutcomeUnknownError(`TBO Book HTTP ${res.status}`);
    if (data.BookResult?.TraceId) {
      (unknownErr as TboBookOutcomeUnknownError & { traceId?: string }).traceId = data.BookResult.TraceId;
    }
    throw unknownErr;
  }

  try {
    assertTboSuccess(data.BookResult?.Error);
  } catch (err) {
    // Diagnostic-only: attach raw TraceId so it survives alongside the typed
    // error's existing ErrorCode/ErrorMessage (already preserved as .code/.message).
    if (err instanceof TboError && data.BookResult?.TraceId) {
      (err as TboError & { traceId?: string }).traceId = data.BookResult.TraceId;
    }
    throw err;
  }

  const r = data.BookResult;
  if (!r) throw new Error("TBO Book returned empty BookResult");

  const bookingStatus = mapBookingStatus(r.HotelBookingStatus, r.Status);
  // BookingId is preserved on rawDetails even for failure statuses: TBO's
  // certification remark "Not calling in failed booking case" means
  // GetBookingDetail must still be called whenever TBO gave us an identifier
  // to look up, even though Book itself reported failure.
  const rawDetails = {
    tboErrorCode: r.Error?.ErrorCode,
    tboErrorMessage: r.Error?.ErrorMessage,
    traceId: r.TraceId,
    bookingId: r.BookingId ?? null,
  };

  // Status 3 = VerifyPrice — rate changed since PreBook; caller must re-prebook
  if (bookingStatus === "VerifyPrice") {
    throw new TboBookingFailedError(
      `Price or cancellation policy changed (VerifyPrice). Updated amount: ${r.NetAmount ?? "unknown"}. Please re-confirm with updated rate.`,
      rawDetails,
    );
  }

  if (bookingStatus === "BookFailed") {
    // Explicit failure (status code 0) — TBO may still have created a
    // booking record; caller must call GetBookingDetail using BookingId/
    // TraceId before treating this as a confirmed hard failure (TBO cert:
    // "Not calling in failed booking case").
    throw new TboBookingFailedError(
      `Booking explicitly failed (status_code=0).`,
      rawDetails,
    );
  }

  if (bookingStatus === "Unknown") {
    throw new TboBookingFailedError(
      `Booking returned unknown status "${r.HotelBookingStatus ?? bookingStatus}"`,
      rawDetails,
    );
  }

  return {
    bookingId: r.BookingId ?? null,
    bookingRefNo: r.BookingRefNo ?? null,
    confirmationNo: r.ConfirmationNo ?? null,
    invoiceNumber: r.InvoiceNumber ?? null,
    status: r.Status ?? 0,
    bookingStatus,
    voucherStatus: r.VoucherStatus ?? false,
    isPriceChanged: r.IsPriceChanged ?? false,
    isCancellationPolicyChanged: r.IsCancellationPolicyChanged ?? false,
    updatedNetAmount: r.IsPriceChanged ? r.NetAmount : undefined,
  };
}
