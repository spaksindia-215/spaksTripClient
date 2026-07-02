import { mulberry32, rngInt, rngPick, seedFromString } from "./rng";

export type CabType = "Mini" | "Sedan" | "SUV" | "Luxury" | "Van";

export type CabOffer = {
  id: string;
  type: CabType;
  name: string;
  seats: number;
  ac: boolean;
  rating: number;
  ratingCount: number;
  basePrice: number;
  pricePerKm: number;
  eta: number; // minutes
  features: string[];
  imageHue: number;
};

const CAB_MODELS: Record<CabType, string[]> = {
  Mini: ["Tata Tiago", "Maruti Swift", "Hyundai i10", "Alto K10"],
  Sedan: ["Honda City", "Maruti Dzire", "Hyundai Verna", "Toyota Etios"],
  SUV: ["Toyota Innova", "Mahindra Scorpio", "Hyundai Creta", "Tata Safari"],
  Luxury: ["Mercedes E-Class", "BMW 5 Series", "Audi A6", "Toyota Camry"],
  Van: ["Force Traveller", "Toyota Hiace", "Maruti Eeco", "Innova Crysta"],
};

const CAB_FEATURES: Record<CabType, string[]> = {
  Mini: ["AC", "GPS tracked", "Metered fare"],
  Sedan: ["AC", "GPS tracked", "Bottle water"],
  SUV: ["AC", "GPS tracked", "Extra legroom", "Luggage space"],
  Luxury: ["AC", "GPS tracked", "Premium interior", "Complementary water", "USB charging"],
  Van: ["AC", "GPS tracked", "Spacious", "Group travel"],
};

export function generateCabs(from: string, to: string, date: string): CabOffer[] {
  const seed = seedFromString(`${from}-${to}-${date}`);
  const rng = mulberry32(seed);

  const types: CabType[] = ["Mini", "Sedan", "SUV", "Luxury", "Van"];
  const offers: CabOffer[] = [];

  for (let i = 0; i < types.length; i++) {
    const type = types[i];
    const basePrice = type === "Mini" ? 500 : type === "Sedan" ? 800 : type === "SUV" ? 1200 : type === "Luxury" ? 2500 : 1800;
    const priceVariant = 0.85 + rng() * 0.3;

    offers.push({
      id: `CAB-${from}-${to}-${date}-${i}`,
      type,
      name: rngPick(rng, CAB_MODELS[type]),
      seats: type === "Mini" ? 4 : type === "Van" ? 8 : type === "SUV" ? 6 : 4,
      ac: true,
      rating: +(3.8 + rng() * 1.2).toFixed(1),
      ratingCount: rngInt(rng, 120, 4500),
      basePrice: Math.round(basePrice * priceVariant),
      pricePerKm: type === "Mini" ? 12 : type === "Sedan" ? 16 : type === "SUV" ? 22 : type === "Luxury" ? 35 : 20,
      eta: rngInt(rng, 3, 18),
      features: CAB_FEATURES[type],
      imageHue: rngInt(rng, 0, 360),
    });
  }

  return offers;
}

export function getCabById(id: string): CabOffer | null {
  const parts = id.split("-");
  if (parts.length < 5 || parts[0] !== "CAB") return null;
  const from = parts[1];
  const to = parts[2];
  const date = parts[3];
  const index = parseInt(parts[4], 10);
  if (isNaN(index)) return null;
  const cabs = generateCabs(from, to, date);
  return cabs[index] ?? null;
}
