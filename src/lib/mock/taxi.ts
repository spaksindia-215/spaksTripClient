import { mulberry32, rngInt, rngPick, seedFromString } from "./rng";

// ─── Shared ───────────────────────────────────────────────────────────────────

export type CancelPolicy = "free-24h" | "partial-50" | "no-refund";

const OPERATORS = [
  "SpaksRide Premium", "CityWheels", "MetroCab Services", "RoyalDrive India",
  "SwiftTaxi Pro", "NationWide Cabs", "PremiumWheels", "SafeRide Co.",
];

// ─── 1. Airport Transfer ──────────────────────────────────────────────────────

export type TransferType = "mini" | "sedan" | "suv" | "van" | "luxury";

export type AirportTransferOffer = {
  id: string;
  transferType: TransferType;
  vehicleName: string;
  seats: number;
  maxLuggage: number;
  ac: boolean;
  imageHue: number;
  baseFare: number;
  meetGreetFee: number;
  childSeatFee: number;
  flightDelayProtection: number; // fee
  rating: number;
  ratingCount: number;
  operator: string;
  cancellation: CancelPolicy;
  features: string[];
  driverName: string;
  driverPhone: string;
  driverRating: number;
  vehicleNumber: string;
  estimatedMinutes: number;
};

export type AirportTransferSearch = {
  airport: string;
  address: string;
  direction: "pickup" | "dropoff";
  flightNo: string;
  date: string;
  time: string;
  pax: number;
  luggage: number;
};

export type AirportCode = { code: string; name: string; city: string };

export const AIRPORTS: AirportCode[] = [
  { code: "DEL", name: "Indira Gandhi International Airport", city: "New Delhi" },
  { code: "BOM", name: "Chhatrapati Shivaji Maharaj International", city: "Mumbai" },
  { code: "MAA", name: "Chennai International Airport", city: "Chennai" },
  { code: "HYD", name: "Rajiv Gandhi International Airport", city: "Hyderabad" },
  { code: "BLR", name: "Kempegowda International Airport", city: "Bangalore" },
  { code: "CCU", name: "Netaji Subhas Chandra Bose International", city: "Kolkata" },
  { code: "PNQ", name: "Pune International Airport", city: "Pune" },
  { code: "AMD", name: "Sardar Vallabhbhai Patel International", city: "Ahmedabad" },
  { code: "COK", name: "Cochin International Airport", city: "Kochi" },
  { code: "JAI", name: "Jaipur International Airport", city: "Jaipur" },
  { code: "LKO", name: "Chaudhary Charan Singh International", city: "Lucknow" },
  { code: "TRV", name: "Trivandrum International Airport", city: "Thiruvananthapuram" },
  { code: "IXC", name: "Chandigarh International Airport", city: "Chandigarh" },
  { code: "GAU", name: "Lokpriya Gopinath Bordoloi International", city: "Guwahati" },
];

export function searchAirports(q: string): AirportCode[] {
  if (!q.trim()) return AIRPORTS.slice(0, 8);
  const lq = q.toLowerCase();
  return AIRPORTS.filter((a) =>
    a.code.toLowerCase().includes(lq) || a.name.toLowerCase().includes(lq) || a.city.toLowerCase().includes(lq),
  ).slice(0, 8);
}

const TRANSFER_MODELS: Record<TransferType, string[]> = {
  mini:    ["Maruti Dzire", "Toyota Etios", "Tata Tiago CNG", "Hyundai Xcent"],
  sedan:   ["Honda City", "Hyundai Verna", "Skoda Slavia", "VW Virtus"],
  suv:     ["Toyota Innova Crysta", "Mahindra Xylo", "Kia Carens", "Maruti Ertiga"],
  van:     ["Force Traveller 12S", "Toyota HiAce", "Tempo Traveller 13", "Tata Winger"],
  luxury:  ["Mercedes E-Class", "BMW 5 Series", "Audi A6", "Toyota Camry Hybrid"],
};

const TRANSFER_FEATURES: Record<TransferType, string[]> = {
  mini:    ["AC", "GPS tracked", "24×7 support", "Sanitized vehicle"],
  sedan:   ["AC", "GPS tracked", "Bottle water", "Phone charger", "Sanitized"],
  suv:     ["AC", "GPS tracked", "Extra luggage space", "6 pax", "Sanitized"],
  van:     ["AC", "GPS tracked", "12+ pax", "Large luggage bay", "Group travel"],
  luxury:  ["AC", "GPS tracked", "Premium interior", "Wi-Fi", "Complimentary water", "Newspaper"],
};

const DRIVER_NAMES = [
  "Rajesh Kumar", "Sunil Sharma", "Amit Verma", "Pradeep Singh", "Vikram Nair",
  "Suresh Pillai", "Mahesh Reddy", "Anil Gupta", "Ravi Patel", "Deepak Yadav",
];

function mockVehicleNo(rng: () => number): string {
  const states = ["DL", "MH", "KA", "TN", "AP", "UP", "RJ", "GJ"];
  const s = rngPick(rng, states);
  const n = `${rngInt(rng, 10, 99)} ${String.fromCharCode(65 + rngInt(rng, 0, 25))}${String.fromCharCode(65 + rngInt(rng, 0, 25))} ${rngInt(rng, 1000, 9999)}`;
  return `${s}-${n}`;
}

const FARE_BASE: Record<TransferType, number> = {
  mini: 700, sedan: 1100, suv: 1700, van: 2600, luxury: 4500,
};

export function generateAirportTransfers(s: AirportTransferSearch): AirportTransferOffer[] {
  const rng = mulberry32(seedFromString(`${s.airport}-${s.date}-${s.pax}`));
  const types: TransferType[] = ["mini", "sedan", "suv", "van", "luxury"];
  return types.map((t, i) => {
    const base = Math.round(FARE_BASE[t] * (0.85 + rng() * 0.3));
    return {
      id: `AT-${s.airport}-${s.date}-${s.pax}-${i}`,
      transferType: t,
      vehicleName: rngPick(rng, TRANSFER_MODELS[t]),
      seats: t === "van" ? rngInt(rng, 10, 14) : t === "suv" ? 6 : 4,
      maxLuggage: t === "van" ? 8 : t === "suv" ? 4 : t === "luxury" ? 3 : 2,
      ac: true,
      imageHue: rngInt(rng, 0, 360),
      baseFare: base,
      meetGreetFee: t === "luxury" ? 0 : rngInt(rng, 150, 400),
      childSeatFee: 200,
      flightDelayProtection: 150,
      rating: +(3.8 + rng() * 1.2).toFixed(1),
      ratingCount: rngInt(rng, 200, 6000),
      operator: rngPick(rng, OPERATORS),
      cancellation: rngPick(rng, ["free-24h", "free-24h", "partial-50", "no-refund"] as CancelPolicy[]),
      features: TRANSFER_FEATURES[t],
      driverName: rngPick(rng, DRIVER_NAMES),
      driverPhone: `+91 ${rngInt(rng, 70000, 99999)} ${rngInt(rng, 10000, 99999)}`,
      driverRating: +(4.0 + rng() * 1.0).toFixed(1),
      vehicleNumber: mockVehicleNo(rng),
      estimatedMinutes: rngInt(rng, 20, 55),
    };
  });
}

export function getAirportTransferById(id: string): AirportTransferOffer | null {
  const p = id.split("-");
  if (p[0] !== "AT" || p.length < 5) return null;
  const airport = p[1];
  const date = p[2];
  const pax = parseInt(p[3], 10) || 1;
  const idx = parseInt(p[4], 10);
  return generateAirportTransfers({ airport, date, pax, address: "", direction: "pickup", flightNo: "", time: "", luggage: 0 })[idx] ?? null;
}

// ─── 2. Outstation ────────────────────────────────────────────────────────────

export type OutstationVehicle = "mini" | "sedan" | "suv" | "traveller";
export type TripType = "one-way" | "round" | "multi";

export type OutstationOffer = {
  id: string;
  vehicleType: OutstationVehicle;
  vehicleName: string;
  seats: number;
  ac: boolean;
  imageHue: number;
  baseFare: number;
  perKmRate: number;
  includedKm: number;
  estimatedDistanceKm: number;
  estimatedFare: number;
  tollCharges: number;
  nightCharges: number;
  driverAllowance: number;
  rating: number;
  ratingCount: number;
  operator: string;
  cancellation: CancelPolicy;
  features: string[];
  estimatedTime: string;
  inclusions: string[];
  exclusions: string[];
};

export type OutstationSearch = {
  fromCity: string;
  toCity: string;
  date: string;
  returnDate?: string;
  tripType: TripType;
  pax: number;
};

export type CityOption = { code: string; name: string; state: string };

export const OUTSTATION_CITIES: CityOption[] = [
  { code: "DEL", name: "Delhi", state: "Delhi" },
  { code: "MUM", name: "Mumbai", state: "Maharashtra" },
  { code: "BLR", name: "Bangalore", state: "Karnataka" },
  { code: "CHN", name: "Chennai", state: "Tamil Nadu" },
  { code: "HYD", name: "Hyderabad", state: "Telangana" },
  { code: "PNQ", name: "Pune", state: "Maharashtra" },
  { code: "AGR", name: "Agra", state: "Uttar Pradesh" },
  { code: "JAI", name: "Jaipur", state: "Rajasthan" },
  { code: "MSO", name: "Mysore", state: "Karnataka" },
  { code: "KLK", name: "Kolkata", state: "West Bengal" },
  { code: "AHM", name: "Ahmedabad", state: "Gujarat" },
  { code: "SRT", name: "Surat", state: "Gujarat" },
  { code: "LKO", name: "Lucknow", state: "Uttar Pradesh" },
  { code: "VNS", name: "Varanasi", state: "Uttar Pradesh" },
  { code: "DDN", name: "Dehradun", state: "Uttarakhand" },
  { code: "RSK", name: "Rishikesh", state: "Uttarakhand" },
  { code: "SML", name: "Shimla", state: "Himachal Pradesh" },
  { code: "MNL", name: "Manali", state: "Himachal Pradesh" },
  { code: "UDR", name: "Udaipur", state: "Rajasthan" },
  { code: "JDH", name: "Jodhpur", state: "Rajasthan" },
  { code: "GOA", name: "Goa", state: "Goa" },
  { code: "KCH", name: "Kochi", state: "Kerala" },
  { code: "MNR", name: "Munnar", state: "Kerala" },
  { code: "OOT", name: "Ooty", state: "Tamil Nadu" },
  { code: "CHD", name: "Chandigarh", state: "Punjab" },
  { code: "AMR", name: "Amritsar", state: "Punjab" },
];

export function searchCities(q: string): CityOption[] {
  if (!q.trim()) return OUTSTATION_CITIES.slice(0, 8);
  const lq = q.toLowerCase();
  return OUTSTATION_CITIES.filter((c) =>
    c.name.toLowerCase().includes(lq) || c.state.toLowerCase().includes(lq) || c.code.toLowerCase().includes(lq),
  ).slice(0, 8);
}

// Approx distances between common city pairs (km)
const DISTANCES: Record<string, number> = {
  "DEL-AGR": 230, "DEL-JAI": 290, "DEL-AHM": 940, "DEL-LKO": 555, "DEL-VNS": 820,
  "DEL-DDN": 290, "DEL-SML": 360, "DEL-CHD": 260, "DEL-AMR": 465,
  "MUM-GOA": 590, "MUM-PNQ": 155, "MUM-AHM": 530, "MUM-HYD": 705,
  "BLR-MSO": 145, "BLR-CHN": 350, "BLR-OOT": 270, "BLR-GOA": 560, "BLR-KCH": 550,
  "CHN-OOT": 335, "CHN-MNR": 460, "KCH-MNR": 130,
  "JAI-AGR": 235, "JAI-UDR": 395, "JAI-JDH": 345,
};

function getDistance(from: string, to: string): number {
  return DISTANCES[`${from}-${to}`] ?? DISTANCES[`${to}-${from}`] ?? rngInt(mulberry32(seedFromString(from + to)), 180, 900);
}

const OUTSTATION_MODELS: Record<OutstationVehicle, string[]> = {
  mini:       ["Maruti Swift Dzire", "Toyota Etios", "Hyundai Xcent"],
  sedan:      ["Honda City", "Hyundai Verna", "Skoda Slavia"],
  suv:        ["Toyota Innova Crysta", "Kia Carens", "Mahindra Xylo", "Maruti Ertiga"],
  traveller:  ["Force Traveller 12S", "Tempo Traveller 13", "Force Traveller 17S"],
};

const OUTSTATION_FEATURES: Record<OutstationVehicle, string[]> = {
  mini:      ["AC", "GPS", "4 pax", "2 bags"],
  sedan:     ["AC", "GPS", "4 pax", "3 bags", "USB charging"],
  suv:       ["AC", "GPS", "6 pax", "Large boot", "USB charging", "Extra legroom"],
  traveller: ["AC", "GPS", "12 pax", "Large luggage bay", "Push-back seats"],
};

const PER_KM: Record<OutstationVehicle, number> = { mini: 11, sedan: 14, suv: 19, traveller: 28 };

export function generateOutstationOffers(s: OutstationSearch): OutstationOffer[] {
  const rng = mulberry32(seedFromString(`${s.fromCity}-${s.toCity}-${s.date}`));
  const types: OutstationVehicle[] = ["mini", "sedan", "suv", "traveller"];
  const dist = getDistance(s.fromCity, s.toCity);
  const multiplier = s.tripType === "round" ? 2 : 1;

  return types.map((v, i) => {
    const perKm = PER_KM[v] * (0.9 + rng() * 0.2);
    const base = Math.round(perKm * dist * multiplier);
    const toll = rngInt(rng, 80, 280);
    const night = dist > 400 ? rngInt(rng, 200, 400) : 0;
    const driverAllow = Math.ceil(dist / 250) * 300;
    const hrs = Math.round((dist / 50) * 10) / 10;
    return {
      id: `OS-${s.fromCity}-${s.toCity}-${s.date}-${s.tripType}-${i}`,
      vehicleType: v,
      vehicleName: rngPick(rng, OUTSTATION_MODELS[v]),
      seats: v === "traveller" ? 13 : v === "suv" ? 6 : 4,
      ac: true,
      imageHue: rngInt(rng, 0, 360),
      baseFare: base,
      perKmRate: Math.round(perKm),
      includedKm: dist * multiplier,
      estimatedDistanceKm: dist,
      estimatedFare: base + toll + night + driverAllow,
      tollCharges: toll,
      nightCharges: night,
      driverAllowance: driverAllow,
      rating: +(3.8 + rng() * 1.2).toFixed(1),
      ratingCount: rngInt(rng, 100, 4000),
      operator: rngPick(rng, OPERATORS),
      cancellation: rngPick(rng, ["free-24h", "free-24h", "partial-50", "no-refund"] as CancelPolicy[]),
      features: OUTSTATION_FEATURES[v],
      estimatedTime: `${Math.floor(hrs)}h ${Math.round((hrs % 1) * 60)}m`,
      inclusions: ["Driver allowance", "Fuel charges", s.tripType === "round" ? "Return trip" : "One-way trip", "GST"],
      exclusions: ["Toll charges (paid extra)", "Parking fees", "State permits (if applicable)"],
    };
  });
}

export function getOutstationOfferById(id: string): OutstationOffer | null {
  const p = id.split("-");
  if (p[0] !== "OS" || p.length < 6) return null;
  const fromCity = p[1];
  const toCity = p[2];
  const date = p[3];
  const tripType = p[4] as TripType;
  const idx = parseInt(p[5], 10);
  return generateOutstationOffers({ fromCity, toCity, date, tripType, pax: 1 })[idx] ?? null;
}

// ─── 3. Sightseeing ───────────────────────────────────────────────────────────

export type Theme = "heritage" | "nature" | "adventure" | "religious" | "food" | "culture" | "shopping";
export type PackageDuration = "half-day" | "full-day" | "multi-day";

export type ItineraryStop = {
  time: string;
  place: string;
  duration: string;
  description: string;
};

export type SightseeingPackage = {
  id: string;
  title: string;
  city: string;
  durationHours: number;
  durationType: PackageDuration;
  themes: Theme[];
  stops: string[];
  imageUrl: string;
  imageHue: number;
  pricePerPerson: number;
  maxPax: number;
  minPax: number;
  inclusions: string[];
  exclusions: string[];
  meals: string[];
  guideIncluded: boolean;
  guideLanguages: string[];
  vehicleType: string;
  rating: number;
  ratingCount: number;
  operator: string;
  cancellation: CancelPolicy;
  itinerary: ItineraryStop[];
  highlights: string[];
};

export type SightseeingSearch = {
  city: string;
  date: string;
  pax: number;
  themes?: Theme[];
  durationType?: PackageDuration;
};

export type SightseeingCity = { code: string; name: string; state: string; image: string };

export const SIGHTSEEING_CITIES: SightseeingCity[] = [
  { code: "JAI", name: "Jaipur", state: "Rajasthan", image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400&q=70" },
  { code: "AGR", name: "Agra", state: "Uttar Pradesh", image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&q=70" },
  { code: "UDR", name: "Udaipur", state: "Rajasthan", image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=400&q=70" },
  { code: "MSO", name: "Mysore", state: "Karnataka", image: "https://images.unsplash.com/photo-1591726093769-3cd9df2e7ad1?w=400&q=70" },
  { code: "MNR", name: "Munnar", state: "Kerala", image: "https://images.unsplash.com/photo-1582972236019-ea4af5ffe587?w=400&q=70" },
  { code: "VNS", name: "Varanasi", state: "Uttar Pradesh", image: "https://images.unsplash.com/photo-1561361058-c24e019a7af8?w=400&q=70" },
  { code: "RSK", name: "Rishikesh", state: "Uttarakhand", image: "https://images.unsplash.com/photo-1611502677935-a68f9c5a7c42?w=400&q=70" },
  { code: "GOA", name: "Goa", state: "Goa", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=70" },
  { code: "SML", name: "Shimla", state: "Himachal Pradesh", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=70" },
  { code: "OOT", name: "Ooty", state: "Tamil Nadu", image: "https://images.unsplash.com/photo-1591086344849-b82daedfdf44?w=400&q=70" },
  { code: "DEL", name: "Delhi", state: "Delhi", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&q=70" },
  { code: "MUM", name: "Mumbai", state: "Maharashtra", image: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=400&q=70" },
];

export function searchSightseeingCities(q: string): SightseeingCity[] {
  if (!q.trim()) return SIGHTSEEING_CITIES.slice(0, 8);
  const lq = q.toLowerCase();
  return SIGHTSEEING_CITIES.filter((c) => c.name.toLowerCase().includes(lq) || c.state.toLowerCase().includes(lq)).slice(0, 8);
}

// Package templates per city
const PACKAGE_TEMPLATES: Record<string, Array<{ title: string; stops: string[]; themes: Theme[]; hrs: number; type: PackageDuration; highlights: string[] }>> = {
  JAI: [
    { title: "Pink City Heritage Tour", stops: ["Amber Fort","City Palace","Hawa Mahal","Jantar Mantar","Albert Hall"], themes: ["heritage","culture"], hrs: 8, type: "full-day", highlights: ["Amber Fort elephant ride (optional)","Local street food","Guided tour of palaces"] },
    { title: "Jaipur Sunrise Amber Walk", stops: ["Amber Fort","Panna Meena Ka Kund","Maota Lake"], themes: ["heritage","nature"], hrs: 4, type: "half-day", highlights: ["Sunrise view from Amber Fort","Step-well photography","Hill fort walk"] },
    { title: "Bazaar & Street Food Trail", stops: ["Johari Bazaar","Bapu Bazaar","LMB Sweets","Lassiwala"], themes: ["food","shopping","culture"], hrs: 4, type: "half-day", highlights: ["Dal Baati Churma","Traditional handicraft shopping","Rabri dessert"] },
  ],
  AGR: [
    { title: "Taj Mahal Sunrise Tour", stops: ["Taj Mahal","Agra Fort","Mehtab Bagh"], themes: ["heritage","culture"], hrs: 6, type: "full-day", highlights: ["Sunrise view of Taj","UNESCO World Heritage Site","Mughal architecture"] },
    { title: "Agra Heritage Full Day", stops: ["Taj Mahal","Agra Fort","Fatehpur Sikri","Itmad-ud-Daulah"], themes: ["heritage"], hrs: 10, type: "full-day", highlights: ["4 UNESCO sites","Marble craftsmanship","Mughal history"] },
  ],
  GOA: [
    { title: "North Goa Beach Hopping", stops: ["Baga Beach","Calangute","Anjuna","Vagator","Chapora Fort"], themes: ["nature","adventure","culture"], hrs: 8, type: "full-day", highlights: ["Sunset at Chapora Fort","Portuguese architecture","Seafood lunch"] },
    { title: "South Goa Heritage & Spice", stops: ["Dudhsagar Falls","Spice Plantation","Old Goa Churches","Colva Beach"], themes: ["nature","heritage","food"], hrs: 10, type: "full-day", highlights: ["Dudhsagar waterfall hike","Spice farm tour","Goan cuisine"] },
    { title: "Goa Sunset Cruise", stops: ["Mandovi River","Old Goa","Panaji Waterfront"], themes: ["culture","food"], hrs: 3, type: "half-day", highlights: ["River cruise","Live Goan music","Cocktails onboard"] },
  ],
  VNS: [
    { title: "Varanasi Ghat Sunrise Boat", stops: ["Dashashwamedh Ghat","Manikarnika Ghat","Assi Ghat","Kashi Vishwanath"], themes: ["religious","culture"], hrs: 4, type: "half-day", highlights: ["Sunrise on Ganges","Ancient Ghats","Kashi Vishwanath Temple"] },
    { title: "Spiritual Varanasi Full Day", stops: ["Kashi Vishwanath","Sarnath","Ganga Aarti","BHU Museum"], themes: ["religious","heritage","culture"], hrs: 10, type: "full-day", highlights: ["Ganga Aarti ceremony","Sarnath Buddhist site","Evening boat ride"] },
  ],
  RSK: [
    { title: "Rishikesh Adventure Day", stops: ["Lakshman Jhula","River Rafting","Bungee Jump Zone","Triveni Ghat"], themes: ["adventure","religious","nature"], hrs: 8, type: "full-day", highlights: ["White-water rafting","Bungee jumping","Ganges bridge walk"] },
    { title: "Yoga & Wellness Morning", stops: ["Parmarth Niketan","Beatles Ashram","Rajaji Trail"], themes: ["culture","nature"], hrs: 4, type: "half-day", highlights: ["Morning yoga session","Ashram meditation","Forest walk"] },
  ],
  DEL: [
    { title: "Old Delhi Heritage Walk", stops: ["Red Fort","Jama Masjid","Chandni Chowk","Raj Ghat","India Gate"], themes: ["heritage","food","culture"], hrs: 8, type: "full-day", highlights: ["Mughal monuments","Street food at Paranthe Wali Gali","Rickshaw ride in Chandni Chowk"] },
    { title: "Delhi Monuments Express", stops: ["India Gate","Qutub Minar","Lotus Temple","Humayun Tomb"], themes: ["heritage"], hrs: 6, type: "full-day", highlights: ["4 UNESCO sites","Architecture across dynasties","Professional guide"] },
  ],
};

function getTemplates(city: string) {
  return PACKAGE_TEMPLATES[city] ?? [
    { title: `${city} City Highlights`, stops: ["City Center", "Heritage Site 1", "Local Market", "Scenic Viewpoint"], themes: ["culture", "heritage"] as Theme[], hrs: 6, type: "full-day" as PackageDuration, highlights: ["City landmarks", "Local cuisine", "Photo spots"] },
    { title: `${city} Half Day Tour`, stops: ["Main Attraction", "Shopping Area", "Restaurant"], themes: ["culture"] as Theme[], hrs: 4, type: "half-day" as PackageDuration, highlights: ["Key sights", "Shopping", "Local food"] },
  ];
}

const CITY_IMAGES: Record<string, string> = {
  JAI: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&q=80",
  AGR: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=80",
  GOA: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
  VNS: "https://images.unsplash.com/photo-1561361058-c24e019a7af8?w=600&q=80",
  RSK: "https://images.unsplash.com/photo-1611502677935-a68f9c5a7c42?w=600&q=80",
  DEL: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80",
  MUM: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=600&q=80",
  MSO: "https://images.unsplash.com/photo-1591726093769-3cd9df2e7ad1?w=600&q=80",
  MNR: "https://images.unsplash.com/photo-1582972236019-ea4af5ffe587?w=600&q=80",
  UDR: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=600&q=80",
  SML: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&q=80",
  OOT: "https://images.unsplash.com/photo-1591086344849-b82daedfdf44?w=600&q=80",
};

function genItinerary(stops: string[], hrs: number): ItineraryStop[] {
  const startH = 7;
  let elapsed = 0;
  const perStop = Math.floor((hrs * 60) / stops.length);
  return stops.map((place) => {
    const h = startH + Math.floor(elapsed / 60);
    const m = elapsed % 60;
    const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    elapsed += perStop;
    return { time, place, duration: `${perStop} min`, description: `Visit ${place} and explore the surroundings` };
  });
}

export function generateSightseeingPackages(s: SightseeingSearch): SightseeingPackage[] {
  const rng = mulberry32(seedFromString(`${s.city}-${s.date}`));
  const templates = getTemplates(s.city);
  const cityImg = CITY_IMAGES[s.city] ?? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80";

  return templates.map((t, i) => {
    const price = t.type === "half-day" ? rngInt(rng, 800, 1500) : rngInt(rng, 1500, 3500);
    return {
      id: `SG-${s.city}-${s.date}-${i}`,
      title: t.title,
      city: s.city,
      durationHours: t.hrs,
      durationType: t.type,
      themes: t.themes,
      stops: t.stops,
      imageUrl: cityImg,
      imageHue: rngInt(rng, 0, 360),
      pricePerPerson: price,
      maxPax: rngInt(rng, 6, 15),
      minPax: 1,
      inclusions: ["Private cab", "Driver", t.hrs > 5 ? "Bottled water" : "Refreshments", ...(rng() > 0.5 ? ["Guide"] : [])],
      exclusions: ["Entry tickets", "Meals", "Personal expenses"],
      meals: t.hrs >= 8 ? ["Lunch"] : [],
      guideIncluded: rng() > 0.4,
      guideLanguages: ["English", "Hindi", ...(rng() > 0.7 ? ["French"] : [])],
      vehicleType: s.pax > 6 ? "SUV/Traveller" : s.pax > 4 ? "SUV" : "Sedan/Hatchback",
      rating: +(3.9 + rng() * 1.1).toFixed(1),
      ratingCount: rngInt(rng, 80, 3000),
      operator: rngPick(rng, OPERATORS),
      cancellation: rngPick(rng, ["free-24h", "free-24h", "partial-50"] as CancelPolicy[]),
      itinerary: genItinerary(t.stops, t.hrs),
      highlights: t.highlights,
    };
  });
}

export function getSightseeingPackageById(id: string): SightseeingPackage | null {
  const p = id.split("-");
  if (p[0] !== "SG" || p.length < 4) return null;
  const city = p[1];
  const date = p[2];
  const idx = parseInt(p[3], 10);
  return generateSightseeingPackages({ city, date, pax: 1 })[idx] ?? null;
}
