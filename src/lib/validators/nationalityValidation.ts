/**
 * TBO Identity Validation
 *
 * Passport requirement is derived from nationality/destination (foreign
 * guest at a domestic hotel needs a passport). PAN requirement is NOT
 * derived here — PreBook's ValidationInfo.PanMandatory is the single
 * source of truth for PAN (see HotelPreBookInfo.panMandatory /
 * panCountRequired), regardless of nationality or destination.
 */

export type IdentityRequirement = {
  passportRequired: boolean;
  reason: string;
};

export function getIdentityRequirement(
  guestNationality: string,
  hotelCountry: string | undefined,
): IdentityRequirement {
  const isIndian = guestNationality === "IN";
  const isDomestic = hotelCountry?.toUpperCase() === "INDIA" || hotelCountry?.toUpperCase() === "IN";

  if (!isIndian && isDomestic) {
    // Domestic hotel, foreign guest
    return {
      passportRequired: true,
      reason: "Domestic hotel, foreign guest — passport required",
    };
  }

  if (!isIndian && !isDomestic) {
    return {
      passportRequired: false,
      reason: "International hotel, foreign guest — not allowed per TBO India policy",
    };
  }

  return {
    passportRequired: false,
    reason: "",
  };
}

export function validatePAN(pan: string): { valid: boolean; error?: string } {
  if (!pan) return { valid: false, error: "PAN is required" };

  // PAN format: AAAPN5055K (10 characters, pattern: 5 letters, 4 digits, 1 letter)
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(pan.toUpperCase())) {
    return { valid: false, error: "Invalid PAN format. Expected: AAAPN5055K" };
  }

  return { valid: true };
}

export function validatePassport(passport: string): { valid: boolean; error?: string } {
  if (!passport) return { valid: false, error: "Passport is required" };

  if (passport.length < 6 || passport.length > 20) {
    return { valid: false, error: "Passport must be 6-20 characters" };
  }

  // Basic validation: alphanumeric
  if (!/^[A-Z0-9]{6,20}$/i.test(passport)) {
    return { valid: false, error: "Passport must contain only letters and numbers" };
  }

  return { valid: true };
}

export function validatePassportDate(dateStr: string): { valid: boolean; error?: string } {
  if (!dateStr) return { valid: false, error: "Date is required" };

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return { valid: false, error: "Invalid date format" };
  }

  return { valid: true };
}

export function validatePassportExpiry(expiryDate: string): { valid: boolean; error?: string } {
  if (!expiryDate) return { valid: false, error: "Expiry date is required" };

  const expiry = new Date(expiryDate);
  if (isNaN(expiry.getTime())) {
    return { valid: false, error: "Invalid date format" };
  }

  // Check if expired
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (expiry < today) {
    return { valid: false, error: "Passport has expired" };
  }

  // Check if expiring within 6 months (good practice)
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

  if (expiry < sixMonthsFromNow) {
    return { valid: false, error: "Passport expires within 6 months" };
  }

  return { valid: true };
}
