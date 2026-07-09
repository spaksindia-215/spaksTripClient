import { NextRequest, NextResponse } from "next/server";
import { tboGetHotelDetail } from "@/lib/adapters/tbo/hotel/detail";
import { buildFarePricer, AgentPricingUnavailableError } from "@/lib/server/agentMarkup";

function err(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id) return err("hotel id (HotelCode) is required.", 400);

    const sp              = req.nextUrl.searchParams;
    const checkIn         = sp.get("checkIn")  ?? "";
    const checkOut        = sp.get("checkOut") ?? "";
    const rooms           = parseInt(sp.get("rooms")    ?? "1", 10);
    const adults          = parseInt(sp.get("adults")   ?? "2", 10);
    const children        = parseInt(sp.get("children") ?? "0", 10);
    const childrenAges = (sp.get("childrenAges") ?? "")
      .split(",").map(Number).filter((n) => !isNaN(n) && n >= 0);

    if (!checkIn || !checkOut) {
      return err("checkIn and checkOut query params are required.", 400);
    }

    const distributionType = sp.get("distributionType") ?? "b2c";
    const hotel = await tboGetHotelDetail(
      decodeURIComponent(id),
      checkIn,
      checkOut,
      adults,
      children,
      rooms,
      distributionType as "b2c" | "b2b",
      childrenAges,
    );

    if (!hotel) return err("Hotel not found.", 404);

    const priceHotel = await buildFarePricer("hotels", req);
    for (const room of hotel.rooms) {
      room.basePrice = priceHotel(room.basePrice);
    }
    hotel.lowestPrice =
      hotel.rooms.length > 0
        ? Math.min(...hotel.rooms.map((r) => r.basePrice))
        : hotel.lowestPrice;

    return NextResponse.json({ success: true, data: hotel });
  } catch (e) {
    // Fail CLOSED: this is the final quote the customer books against — an
    // unresolvable agent markup must never silently fall back to the raw
    // TBO fare (undercharges relative to what the agent configured).
    if (e instanceof AgentPricingUnavailableError) {
      return err("Pricing temporarily unavailable — please retry.", 503);
    }
    const message = e instanceof Error ? e.message : "Hotel detail fetch failed";
    return err(message, 500);
  }
}
