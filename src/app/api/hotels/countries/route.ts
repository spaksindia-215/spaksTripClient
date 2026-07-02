import { NextResponse } from "next/server";
import { tboGetCountryList } from "@/lib/adapters/tbo/hotel/countryList";
import { TboNoResultsError, TboError } from "@/lib/adapters/tbo/errors";

function err(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET() {
  try {
    const countries = await tboGetCountryList();
    return NextResponse.json({ success: true, data: { countries } });
  } catch (e) {
    const stack = e instanceof Error ? e.stack : String(e);
    console.error("[API /api/hotels/countries] FAILED");
    console.error("  stack:", stack);

    if (e instanceof TboNoResultsError) {
      return err("No countries returned by TBO.", 404);
    }
    if (e instanceof TboError) {
      return err(`TBO error (${e.code}): ${e.message}`, 502);
    }
    const message = e instanceof Error ? e.message : "Country list fetch failed";
    return err(message, 500);
  }
}
