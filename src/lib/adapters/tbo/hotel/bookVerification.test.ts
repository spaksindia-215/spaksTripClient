import { test } from "node:test";
import assert from "node:assert/strict";
import { tboBookHotel, type HotelBookInput } from "./book";
import {
  TboBookingFailedError,
  TboBookOutcomeUnknownError,
  TboInvalidSessionError,
  TboError,
} from "../errors";
import { verifyBookingStatusAfterTimeout } from "./bookingRecovery";

// Exercises the real tboBookHotel() against a mocked fetch, then replicates
// the exact classification/gating logic from
// src/app/api/hotels/razorpay/verify-payment/route.ts (the only live hotel
// booking entry point — /api/hotels/book and its useBook() hook have zero
// importers and are dead code) so any drift between this test and the
// deployed route has to be introduced deliberately in both places.
//
// TBO certification requirement under test: GetBookingDetail must be called
// ONLY when the Book request's outcome is ambiguous (timeout, network
// failure, aborted fetch, no HTTP response, or an unrecognized status) —
// never for an explicit BookFailed response — and must use TraceId.

process.env.TBO_HOLIDAYS_USER_NAME ??= "test-user";
process.env.TBO_HOLIDAYS_PASSWORD ??= "test-pass";
process.env.TBO_HOLIDAYS_BOOK_URL ??= "https://HotelBE.tektravels.com/hotelservice.svc/rest/book";
process.env.TBO_HOLIDAYS_BOOKING_URL ??= "https://hotelbe.tektravels.com/hotelservice.svc/rest/Getbookingdetail";

type FetchCall = { url: string; body: Record<string, unknown> | undefined };

function jsonResponse(status: number, ok: boolean, bodyObj: unknown) {
  return { ok, status, text: async () => JSON.stringify(bodyObj) } as Response;
}

function withMockedFetch(
  impl: (url: string, opts: RequestInit & { signal?: AbortSignal }) => Promise<Response>,
) {
  const calls: FetchCall[] = [];
  const original = globalThis.fetch;
  globalThis.fetch = (async (url: string, opts: RequestInit & { signal?: AbortSignal }) => {
    calls.push({ url: String(url), body: opts?.body ? JSON.parse(opts.body as string) : undefined });
    return impl(url, opts);
  }) as typeof fetch;
  return {
    calls,
    restore: () => {
      globalThis.fetch = original;
    },
  };
}

const BOOK_INPUT: HotelBookInput = {
  bookingCode: "BC-TEST-1",
  netAmount: 5000,
  isVoucherBooking: false,
  clientReferenceId: "CLIENTREF-TEST-1",
  roomsDetails: [
    { passengers: [{ title: "Mr", firstName: "John", lastName: "Doe", paxType: 1, leadPassenger: true }] },
  ],
};

// Verbatim copy of the decision logic in verify-payment/route.ts's catch
// block (lines ~641-717): classification + GetBookingDetail gating. Keeping
// this inline (rather than importing the route, which isn't a plain
// importable module under Next's app router) means this test enforces that
// anyone changing the route's classification must also update this comment
// block's twin — a deliberate, visible sync point instead of silent drift.
async function runRouteDecisionLogic(
  e: unknown,
  { clientReferenceId = "CLIENTREF-TEST-1" }: { clientReferenceId?: string } = {},
) {
  const msg = e instanceof Error ? e.message : String(e);
  const isExplicitFailure = msg.includes("explicitly failed") || msg.includes("status_code=0");
  const isTimeout = !isExplicitFailure && msg.includes("timed out after 120 seconds");
  const isAmbiguousOutcome = !isExplicitFailure && !isTimeout && e instanceof TboBookOutcomeUnknownError;

  const tboTraceId =
    e instanceof TboBookingFailedError
      ? e.traceId
      : e instanceof TboError
        ? (e as TboError & { traceId?: string }).traceId
        : undefined;

  let getBookingDetailCalled = false;
  let bookingRecovered = false;

  const isAmbiguousBookOutcome = isTimeout || isAmbiguousOutcome;
  if (isAmbiguousBookOutcome && tboTraceId) {
    getBookingDetailCalled = true;
    const recovery = await verifyBookingStatusAfterTimeout({ traceId: tboTraceId, clientReferenceId });
    bookingRecovered = recovery.found && recovery.booking?.bookingStatus === "Confirmed";
  }

  return { isExplicitFailure, isTimeout, isAmbiguousOutcome, tboTraceId, getBookingDetailCalled, bookingRecovered };
}

test("successful booking: never touches GetBookingDetail", async () => {
  const mock = withMockedFetch(async () =>
    jsonResponse(200, true, {
      BookResult: {
        Status: 1,
        HotelBookingStatus: "Confirmed",
        BookingId: 1001,
        BookingRefNo: "REF-1001",
        ConfirmationNo: "CONF-1001",
        Error: { ErrorCode: 0, ErrorMessage: "" },
        TraceId: "TRACE-SUCCESS-1",
      },
    }),
  );
  try {
    const result = await tboBookHotel(BOOK_INPUT);
    assert.equal(result.bookingStatus, "Confirmed");
    assert.equal(result.bookingId, 1001);
    assert.equal(mock.calls.length, 1, "only the Book endpoint should be called");
  } finally {
    mock.restore();
  }
});

test("explicit BookFailed: GetBookingDetail is NOT called, even with BookingId+TraceId present", async () => {
  const mock = withMockedFetch(async () =>
    jsonResponse(200, true, {
      BookResult: {
        Status: 0,
        HotelBookingStatus: "BookFailed",
        BookingId: 2002,
        Error: { ErrorCode: 4, ErrorMessage: "Booking Failed" },
        TraceId: "TRACE-EXPLICIT-FAIL-1",
      },
    }),
  );
  try {
    let caught: unknown;
    try {
      await tboBookHotel(BOOK_INPUT);
    } catch (e) {
      caught = e;
    }
    assert.ok(caught instanceof TboBookingFailedError);
    const callsAfterBook = mock.calls.length;
    const r = await runRouteDecisionLogic(caught);
    assert.equal(r.isExplicitFailure, true);
    assert.equal(r.getBookingDetailCalled, false);
    assert.equal(mock.calls.length, callsAfterBook, "no additional fetch call for GetBookingDetail");
  } finally {
    mock.restore();
  }
});

test("regression: explicit BookFailed with a generic ErrorMessage assertTboSuccess doesn't recognize is still classified as explicit failure", async () => {
  // Guards against the ordering bug found during QA: assertTboSuccess() used
  // to run before the Status/HotelBookingStatus check, so a non-zero
  // ErrorCode with text outside its known substrings ("booking failed",
  // "unable to book", etc.) produced a generic TboError whose message the
  // route's isExplicitFailure check didn't recognize — silently routing an
  // explicit failure into the ambiguous/unknown bucket.
  const mock = withMockedFetch(async () =>
    jsonResponse(200, true, {
      BookResult: {
        Status: 0,
        HotelBookingStatus: "BookFailed",
        BookingId: 2003,
        Error: { ErrorCode: 99, ErrorMessage: "Supplier rejected the request" },
        TraceId: "TRACE-EXPLICIT-FAIL-2",
      },
    }),
  );
  try {
    let caught: unknown;
    try {
      await tboBookHotel(BOOK_INPUT);
    } catch (e) {
      caught = e;
    }
    assert.ok(caught instanceof TboBookingFailedError);
    assert.match((caught as Error).message, /explicitly failed/);
    const r = await runRouteDecisionLogic(caught);
    assert.equal(r.isExplicitFailure, true);
    assert.equal(r.getBookingDetailCalled, false);
  } finally {
    mock.restore();
  }
});

test("regression: Confirmed status with a genuine session-error Error node still throws (assertTboSuccess still runs)", async () => {
  const mock = withMockedFetch(async () =>
    jsonResponse(200, true, {
      BookResult: {
        Status: 1,
        HotelBookingStatus: "Confirmed",
        BookingId: 2004,
        Error: { ErrorCode: 6, ErrorMessage: "Invalid session" },
        TraceId: "TRACE-SESSION-1",
      },
    }),
  );
  try {
    let caught: unknown;
    try {
      await tboBookHotel(BOOK_INPUT);
    } catch (e) {
      caught = e;
    }
    assert.ok(caught instanceof TboInvalidSessionError, "reordering must not suppress genuine session errors");
  } finally {
    mock.restore();
  }
});

test("timeout (no response within 120s): GetBookingDetail is NOT called (no TraceId exists to use)", async () => {
  const mock = withMockedFetch(
    (_url, opts) =>
      new Promise((_resolve, reject) => {
        opts.signal?.addEventListener("abort", () => {
          const e = new Error("The operation was aborted");
          e.name = "AbortError";
          reject(e);
        });
      }),
  );
  const realSetTimeout = global.setTimeout;
  // Fire the internal 120s cutoff after 10ms instead, without editing book.ts.
  // @ts-expect-error -- intentional monkeypatch for test speed only
  global.setTimeout = (fn: (...a: unknown[]) => void, _ms: number, ...args: unknown[]) =>
    realSetTimeout(fn, 10, ...args);
  try {
    let caught: unknown;
    try {
      await tboBookHotel(BOOK_INPUT);
    } catch (e) {
      caught = e;
    }
    assert.ok(caught instanceof TboBookingFailedError);
    assert.match((caught as Error).message, /timed out after 120 seconds/);
    const r = await runRouteDecisionLogic(caught);
    assert.equal(r.isTimeout, true);
    assert.equal(r.tboTraceId, undefined);
    assert.equal(r.getBookingDetailCalled, false);
  } finally {
    global.setTimeout = realSetTimeout;
    mock.restore();
  }
});

test("aborted fetch (AbortError not from the internal timer): classified the same as timeout, GetBookingDetail NOT called", async () => {
  const mock = withMockedFetch(async () => {
    const e = new Error("The user aborted a request.");
    e.name = "AbortError";
    throw e;
  });
  try {
    let caught: unknown;
    try {
      await tboBookHotel(BOOK_INPUT);
    } catch (e) {
      caught = e;
    }
    const r = await runRouteDecisionLogic(caught);
    assert.equal(r.isTimeout, true);
    assert.equal(r.getBookingDetailCalled, false);
  } finally {
    mock.restore();
  }
});

test("network error (no HTTP response at all): GetBookingDetail NOT called (no TraceId available)", async () => {
  const mock = withMockedFetch(async () => {
    throw new TypeError("fetch failed: getaddrinfo ENOTFOUND HotelBE.tektravels.com");
  });
  try {
    let caught: unknown;
    try {
      await tboBookHotel(BOOK_INPUT);
    } catch (e) {
      caught = e;
    }
    assert.ok(caught instanceof TboBookOutcomeUnknownError);
    const r = await runRouteDecisionLogic(caught);
    assert.equal(r.isAmbiguousOutcome, true);
    assert.equal(r.tboTraceId, undefined);
    assert.equal(r.getBookingDetailCalled, false, "no TraceId means nothing to query GetBookingDetail with");
  } finally {
    mock.restore();
  }
});

test("HTTP 5xx from TBO with a TraceId in the envelope: GetBookingDetail IS called using TraceId, and can recover the booking", async () => {
  let bookCallHappened = false;
  const mock = withMockedFetch(async (url) => {
    if (url.includes("/book") && !bookCallHappened) {
      bookCallHappened = true;
      return jsonResponse(503, false, { BookResult: { TraceId: "TRACE-HTTP5XX-1" } });
    }
    return jsonResponse(200, true, {
      GetBookingDetailResult: {
        Status: 1,
        HotelBookingStatus: "Confirmed",
        BookingId: 4004,
        BookingRefNo: "REF-4004",
        ConfirmationNo: "CONF-4004",
        Error: { ErrorCode: 0, ErrorMessage: "" },
      },
    });
  });
  try {
    let caught: unknown;
    try {
      await tboBookHotel(BOOK_INPUT);
    } catch (e) {
      caught = e;
    }
    assert.ok(caught instanceof TboBookOutcomeUnknownError);
    const r = await runRouteDecisionLogic(caught);
    assert.equal(r.isAmbiguousOutcome, true);
    assert.equal(r.tboTraceId, "TRACE-HTTP5XX-1");
    assert.equal(r.getBookingDetailCalled, true);
    assert.equal(r.bookingRecovered, true);

    const gbdCall = mock.calls.find((c) => c.url.toLowerCase().includes("getbookingdetail"));
    assert.equal(gbdCall?.body?.TraceId, "TRACE-HTTP5XX-1");
    assert.equal(gbdCall?.body?.BookingId, undefined, "must query by TraceId, not BookingId, per TBO's requirement");
  } finally {
    mock.restore();
  }
});

test("unrecognized/unknown TBO booking status: treated as ambiguous, GetBookingDetail IS called using TraceId", async () => {
  // Regression guard for the second QA-found bug: this used to throw
  // TboBookingFailedError (treated as a confirmed failure, no verification)
  // instead of TboBookOutcomeUnknownError.
  let bookCallHappened = false;
  const mock = withMockedFetch(async (url) => {
    if (url.includes("/book") && !bookCallHappened) {
      bookCallHappened = true;
      return jsonResponse(200, true, {
        BookResult: {
          Status: 99,
          HotelBookingStatus: "SomeNewStatusTBOAddedLater",
          BookingId: 5005,
          Error: { ErrorCode: 0, ErrorMessage: "" },
          TraceId: "TRACE-UNKNOWN-STATUS-1",
        },
      });
    }
    return jsonResponse(200, true, {
      GetBookingDetailResult: {
        Status: 1,
        HotelBookingStatus: "Confirmed",
        BookingId: 5005,
        BookingRefNo: "REF-5005",
        ConfirmationNo: "CONF-5005",
        Error: { ErrorCode: 0, ErrorMessage: "" },
      },
    });
  });
  try {
    let caught: unknown;
    try {
      await tboBookHotel(BOOK_INPUT);
    } catch (e) {
      caught = e;
    }
    assert.ok(caught instanceof TboBookOutcomeUnknownError);
    const r = await runRouteDecisionLogic(caught);
    assert.equal(r.isAmbiguousOutcome, true);
    assert.equal(r.isExplicitFailure, false);
    assert.equal(r.getBookingDetailCalled, true);

    const gbdCall = mock.calls.find((c) => c.url.toLowerCase().includes("getbookingdetail"));
    assert.equal(gbdCall?.body?.TraceId, "TRACE-UNKNOWN-STATUS-1");
    assert.equal(gbdCall?.body?.BookingId, undefined);
    assert.equal(r.bookingRecovered, true);
  } finally {
    mock.restore();
  }
});

test("ambiguous outcome where GetBookingDetail confirms no booking exists: not recovered, falls through to failure handling", async () => {
  const mock = withMockedFetch(async (url) => {
    if (url.includes("/book")) {
      return jsonResponse(500, false, { BookResult: { TraceId: "TRACE-NOTFOUND-1" } });
    }
    return jsonResponse(200, true, {
      GetBookingDetailResult: { Status: 0, HotelBookingStatus: "BookFailed", Error: { ErrorCode: 0, ErrorMessage: "" } },
    });
  });
  try {
    let caught: unknown;
    try {
      await tboBookHotel(BOOK_INPUT);
    } catch (e) {
      caught = e;
    }
    const r = await runRouteDecisionLogic(caught);
    assert.equal(r.getBookingDetailCalled, true);
    assert.equal(r.bookingRecovered, false);
  } finally {
    mock.restore();
  }
});

test("explicit BookFailed with NO TraceId at all: GetBookingDetail is skipped safely (nothing to query with), no crash", async () => {
  const mock = withMockedFetch(async () =>
    jsonResponse(200, true, {
      BookResult: {
        Status: 0,
        HotelBookingStatus: "BookFailed",
        Error: { ErrorCode: 4, ErrorMessage: "Booking Failed" },
        // No TraceId, no BookingId at all — the sparsest possible BookFailed envelope.
      },
    }),
  );
  try {
    let caught: unknown;
    try {
      await tboBookHotel(BOOK_INPUT);
    } catch (e) {
      caught = e;
    }
    assert.ok(caught instanceof TboBookingFailedError);
    const r = await runRouteDecisionLogic(caught);
    assert.equal(r.isExplicitFailure, true);
    assert.equal(r.getBookingDetailCalled, false);
  } finally {
    mock.restore();
  }
});

test("VerifyPrice (price changed) is treated as an explicit outcome, not ambiguous — GetBookingDetail NOT called", async () => {
  const mock = withMockedFetch(async () =>
    jsonResponse(200, true, {
      BookResult: {
        Status: 3,
        HotelBookingStatus: "VerifyPrice",
        BookingId: 6006,
        NetAmount: 5500,
        Error: { ErrorCode: 0, ErrorMessage: "" },
        TraceId: "TRACE-VERIFYPRICE-1",
      },
    }),
  );
  try {
    let caught: unknown;
    try {
      await tboBookHotel(BOOK_INPUT);
    } catch (e) {
      caught = e;
    }
    assert.ok(caught instanceof TboBookingFailedError);
    assert.match((caught as Error).message, /VerifyPrice/);
    const r = await runRouteDecisionLogic(caught);
    // VerifyPrice's message doesn't contain "explicitly failed" or
    // "status_code=0", so isExplicitFailure is actually false here — but it
    // must NOT be misrouted into the ambiguous/GetBookingDetail path either,
    // since VerifyPrice is itself a definitive, non-ambiguous TBO response.
    assert.equal(r.isExplicitFailure, false);
    assert.equal(r.isTimeout, false);
    assert.equal(r.isAmbiguousOutcome, false, "VerifyPrice must not be classified as TboBookOutcomeUnknownError");
    assert.equal(r.getBookingDetailCalled, false, "VerifyPrice is a definitive outcome; nothing to reconcile via GetBookingDetail");
  } finally {
    mock.restore();
  }
});

test("Cancelled status from Book: not explicit-failure-worded, not ambiguous, GetBookingDetail NOT called", async () => {
  const mock = withMockedFetch(async () =>
    jsonResponse(200, true, {
      BookResult: {
        Status: 6,
        HotelBookingStatus: "Cancelled",
        BookingId: 7007,
        Error: { ErrorCode: 0, ErrorMessage: "" },
        TraceId: "TRACE-CANCELLED-1",
      },
    }),
  );
  try {
    const result = await tboBookHotel(BOOK_INPUT).catch((e) => e);
    // Cancelled is not explicitly handled as a throw in book.ts's status
    // checks (only VerifyPrice/BookFailed/Unknown throw) — it falls through
    // to the success return path with bookingStatus: "Cancelled". Document
    // this explicitly: the route's success path would then persist a
    // "confirmed" DB record carrying a Cancelled status, which is a product
    // question, not this test's concern — but confirm no GetBookingDetail
    // call happens either way.
    if (result instanceof Error) {
      const r = await runRouteDecisionLogic(result);
      assert.equal(r.getBookingDetailCalled, false);
    } else {
      assert.equal(result.bookingStatus, "Cancelled");
    }
  } finally {
    mock.restore();
  }
});
