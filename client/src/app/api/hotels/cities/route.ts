import { NextRequest, NextResponse } from "next/server";
import { tboGetCityList } from "@/lib/adapters/tbo/hotel/cityList";
import { TboNoResultsError, TboError } from "@/lib/adapters/tbo/errors";

function err(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET(request: NextRequest) {
  const country = request.nextUrl.searchParams.get("country");
  if (!country) return err("country query param is required.", 400);

  try {
    const cities = await tboGetCityList(country);
    return NextResponse.json({ success: true, data: { cities } });
  } catch (e) {
    const stack = e instanceof Error ? e.stack : String(e);
    console.error("[API /api/hotels/cities] FAILED");
    console.error("  country:", country);
    console.error("  stack:", stack);

    if (e instanceof TboNoResultsError) {
      return err(`No cities returned for country "${country}".`, 404);
    }
    if (e instanceof TboError) {
      return err(`TBO error (${e.code}): ${e.message}`, 502);
    }
    const message = e instanceof Error ? e.message : "City list fetch failed";
    return err(message, 500);
  }
}
