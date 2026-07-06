import { mulberry32, rngInt, rngPick, seedFromString } from "./rng";

export type CruiseOffer = {
  id: string;
  shipName: string;
  line: string;
  departurePorts: string[];
  itinerary: string[];
  nights: number;
  pricePerPerson: number;
  highlights: string[];
  rating: number;
  ratingCount: number;
  imageHue: number;
  image: string;
  cabinTypes: string[];
  departure: string;
};

const SHIP_NAMES = [
  "Symphony of the Seas", "MSC Bellissima", "Costa Fortuna", "Norwegian Joy",
  "Carnival Vista", "Royal Princess", "Quantum of the Seas", "Harmony Explorer",
  "Pacific Queen", "Mediterranean Star", "Indian Ocean Pearl", "Aurora Voyager",
];

const CRUISE_LINES = [
  "Royal Caribbean", "MSC Cruises", "Costa Cruises", "Norwegian Cruise Line",
  "Carnival Cruise Line", "Princess Cruises", "Celebrity Cruises",
];

const PORTS: Record<string, string[]> = {
  MED: ["Barcelona", "Rome (Civitavecchia)", "Santorini", "Athens (Piraeus)", "Dubrovnik", "Venice", "Marseille", "Naples"],
  GULF: ["Dubai", "Abu Dhabi", "Muscat", "Doha", "Bahrain"],
  ASIA: ["Singapore", "Bangkok (Laem Chabang)", "Penang", "Bali (Benoa)", "Hong Kong", "Vietnam (Ho Chi Minh)"],
  INDIA: ["Mumbai", "Goa", "Kochi", "Chennai", "Colombo"],
};

const HIGHLIGHTS: string[] = [
  "All-inclusive dining", "World-class entertainment", "Casino & spa on board",
  "Kids' adventure club", "Shore excursions included", "Butler service in suites",
  "Free Wi-Fi throughout", "Celebrity chef restaurants", "Private beach access",
  "Sunset cocktail parties", "Cultural immersion tours", "Snorkeling & diving packages",
];

const CRUISE_IMAGES = [
  "https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=800&q=70",
  "https://images.unsplash.com/photo-1599640842225-85d111c60e6b?auto=format&fit=crop&w=800&q=70",
  "https://images.unsplash.com/photo-1580541832626-2a7131ee809f?auto=format&fit=crop&w=800&q=70",
  "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?auto=format&fit=crop&w=800&q=70",
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=70",
];

export function generateCruises(port: string, month: string): CruiseOffer[] {
  const seed = seedFromString(`${port}-${month}`);
  const rng = mulberry32(seed);
  const count = rngInt(rng, 8, 14);
  const offers: CruiseOffer[] = [];

  const regionKeys = Object.keys(PORTS);
  const regionKey = rngPick(rng, regionKeys);
  const portList = PORTS[regionKey];

  for (let i = 0; i < count; i++) {
    const nights = rngPick(rng, [3, 5, 7, 10, 14] as const);
    const itineraryCount = Math.min(portList.length, rngInt(rng, 3, 6));
    const itinerary = [...portList].sort(() => rng() - 0.5).slice(0, itineraryCount);
    const basePrice = nights * (nights > 7 ? 8500 : 6000);
    const highlights = [...HIGHLIGHTS].sort(() => rng() - 0.5).slice(0, rngInt(rng, 3, 5));

    const departDay = rngInt(rng, 1, 28);
    const monthNum = rngInt(rng, 1, 12);
    const departureDate = `2025-${String(monthNum).padStart(2, "0")}-${String(departDay).padStart(2, "0")}`;

    offers.push({
      id: `CRZ-${port}-${month}-${i}`,
      shipName: rngPick(rng, SHIP_NAMES),
      line: rngPick(rng, CRUISE_LINES),
      departurePorts: [rngPick(rng, portList)],
      itinerary,
      nights,
      pricePerPerson: Math.round(basePrice * (0.8 + rng() * 0.4)),
      highlights,
      rating: +(3.8 + rng() * 1.2).toFixed(1),
      ratingCount: rngInt(rng, 80, 3000),
      imageHue: rngInt(rng, 190, 240),
      image: CRUISE_IMAGES[i % CRUISE_IMAGES.length],
      cabinTypes: ["Interior", "Ocean View", "Balcony", "Suite"].slice(0, rngInt(rng, 2, 4)),
      departure: departureDate,
    });
  }

  return offers;
}
