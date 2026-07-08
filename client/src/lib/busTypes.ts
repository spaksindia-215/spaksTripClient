export type BusSearchInput = {
  source: string;
  destination: string;
  travelDate: string;
};

export type BusSearchResult = {
  id: string;
  operatorName: string;
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  seatsAvailable: number;
  busType: string;
  boardingPoint: string;
  droppingPoint: string;
  durationMinutes: number;
  amenities: string[];
};

export type SeatType = "seater" | "sleeper";
export type SeatStatus = "available" | "booked";
export type SeatDeck = "lower" | "upper";

export type BusSeat = {
  seatNumber: string;
  deck: SeatDeck;
  row: number;
  column: number;
  type: SeatType;
  status: SeatStatus;
  price: number;
};

export type BusPassenger = {
  seatNumber: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
};

export type BusContact = {
  email: string;
  phone: string;
};

export type BusBookingInput = {
  busId: string;
  travelDate: string;
  selectedSeats: string[];
  passengers: BusPassenger[];
  contact: BusContact;
};

export type BusBooking = {
  bookingId: string;
  pnr: string;
  busId: string;
  operatorName: string;
  source: string;
  destination: string;
  travelDate: string;
  departureTime: string;
  arrivalTime: string;
  busType: string;
  selectedSeats: string[];
  passengers: BusPassenger[];
  contact: BusContact;
  totalPrice: number;
  status: "CONFIRMED";
  createdAt: string;
};

export type BusSeatLayoutResponse = {
  bus: Omit<BusSearchResult, "seatsAvailable">;
  seats: BusSeat[];
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export const BUS_LOCATIONS = [
  "Delhi",
  "Jaipur",
  "Agra",
  "Chandigarh",
  "Manali",
  "Dehradun",
  "Lucknow",
  "Varanasi",
  "Mumbai",
  "Pune",
  "Goa",
  "Ahmedabad",
  "Udaipur",
  "Bengaluru",
  "Chennai",
  "Hyderabad",
] as const;
