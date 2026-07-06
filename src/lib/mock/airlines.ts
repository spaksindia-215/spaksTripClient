export type Airline = {
  code: string;   // IATA 2-letter
  name: string;
  country: string;
  alliance?: "Star Alliance" | "SkyTeam" | "Oneworld";
  logoHue: number; // 0-360 for deterministic logo bg
};

export const AIRLINES: Airline[] = [
  { code: "AI", name: "Air India", country: "India", alliance: "Star Alliance", logoHue: 10 },
  { code: "6E", name: "IndiGo", country: "India", logoHue: 220 },
  { code: "UK", name: "Vistara", country: "India", logoHue: 310 },
  { code: "SG", name: "SpiceJet", country: "India", logoHue: 0 },
  { code: "I5", name: "AIX Connect", country: "India", logoHue: 30 },
  { code: "QP", name: "Akasa Air", country: "India", logoHue: 20 },
  { code: "EK", name: "Emirates", country: "UAE", logoHue: 0 },
  { code: "EY", name: "Etihad Airways", country: "UAE", logoHue: 40 },
  { code: "QR", name: "Qatar Airways", country: "Qatar", alliance: "Oneworld", logoHue: 330 },
  { code: "SV", name: "Saudia", country: "Saudi Arabia", alliance: "SkyTeam", logoHue: 140 },
  { code: "WY", name: "Oman Air", country: "Oman", logoHue: 150 },
  { code: "SQ", name: "Singapore Airlines", country: "Singapore", alliance: "Star Alliance", logoHue: 210 },
  { code: "MH", name: "Malaysia Airlines", country: "Malaysia", alliance: "Oneworld", logoHue: 200 },
  { code: "TG", name: "Thai Airways", country: "Thailand", alliance: "Star Alliance", logoHue: 270 },
  { code: "CX", name: "Cathay Pacific", country: "Hong Kong", alliance: "Oneworld", logoHue: 160 },
  { code: "BA", name: "British Airways", country: "UK", alliance: "Oneworld", logoHue: 220 },
  { code: "LH", name: "Lufthansa", country: "Germany", alliance: "Star Alliance", logoHue: 50 },
  { code: "AF", name: "Air France", country: "France", alliance: "SkyTeam", logoHue: 230 },
  { code: "KL", name: "KLM", country: "Netherlands", alliance: "SkyTeam", logoHue: 200 },
  { code: "TK", name: "Turkish Airlines", country: "Turkey", alliance: "Star Alliance", logoHue: 0 },
  { code: "UA", name: "United Airlines", country: "USA", alliance: "Star Alliance", logoHue: 215 },
  { code: "AA", name: "American Airlines", country: "USA", alliance: "Oneworld", logoHue: 210 },
  { code: "DL", name: "Delta Air Lines", country: "USA", alliance: "SkyTeam", logoHue: 0 },
  { code: "QF", name: "Qantas", country: "Australia", alliance: "Oneworld", logoHue: 0 },
];

export function getAirline(code: string) {
  return AIRLINES.find((a) => a.code === code.toUpperCase()) ?? null;
}
