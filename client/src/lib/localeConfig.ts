export type CountryLocale = {
  locale: string;
  currency: string;
  symbol: string;
};

export const COUNTRY_LOCALES: Record<string, CountryLocale> = {
  "Afghanistan":            { locale: "fa-AF", currency: "AFN", symbol: "؋" },
  "Australia":              { locale: "en-AU", currency: "AUD", symbol: "A$" },
  "Austria":                { locale: "de-AT", currency: "EUR", symbol: "€" },
  "Bahrain":                { locale: "ar-BH", currency: "BHD", symbol: ".د.ب" },
  "Bangladesh":             { locale: "bn-BD", currency: "BDT", symbol: "৳" },
  "Belgium":                { locale: "fr-BE", currency: "EUR", symbol: "€" },
  "Brazil":                 { locale: "pt-BR", currency: "BRL", symbol: "R$" },
  "Canada":                 { locale: "en-CA", currency: "CAD", symbol: "CA$" },
  "China":                  { locale: "zh-CN", currency: "CNY", symbol: "¥" },
  "Denmark":                { locale: "da-DK", currency: "DKK", symbol: "kr" },
  "Egypt":                  { locale: "ar-EG", currency: "EGP", symbol: "£" },
  "Finland":                { locale: "fi-FI", currency: "EUR", symbol: "€" },
  "France":                 { locale: "fr-FR", currency: "EUR", symbol: "€" },
  "Germany":                { locale: "de-DE", currency: "EUR", symbol: "€" },
  "Greece":                 { locale: "el-GR", currency: "EUR", symbol: "€" },
  "India":                  { locale: "en-IN", currency: "INR", symbol: "₹" },
  "Indonesia":              { locale: "id-ID", currency: "IDR", symbol: "Rp" },
  "Ireland":                { locale: "en-IE", currency: "EUR", symbol: "€" },
  "Israel":                 { locale: "he-IL", currency: "ILS", symbol: "₪" },
  "Italy":                  { locale: "it-IT", currency: "EUR", symbol: "€" },
  "Japan":                  { locale: "ja-JP", currency: "JPY", symbol: "¥" },
  "Jordan":                 { locale: "ar-JO", currency: "JOD", symbol: "د.ا" },
  "Kenya":                  { locale: "sw-KE", currency: "KES", symbol: "KSh" },
  "Kuwait":                 { locale: "ar-KW", currency: "KWD", symbol: "د.ك" },
  "Malaysia":               { locale: "ms-MY", currency: "MYR", symbol: "RM" },
  "Maldives":               { locale: "en-MV", currency: "MVR", symbol: "Rf" },
  "Mexico":                 { locale: "es-MX", currency: "MXN", symbol: "MX$" },
  "Morocco":                { locale: "ar-MA", currency: "MAD", symbol: "MAD" },
  "Nepal":                  { locale: "ne-NP", currency: "NPR", symbol: "रू" },
  "Netherlands":            { locale: "nl-NL", currency: "EUR", symbol: "€" },
  "New Zealand":            { locale: "en-NZ", currency: "NZD", symbol: "NZ$" },
  "Nigeria":                { locale: "en-NG", currency: "NGN", symbol: "₦" },
  "Norway":                 { locale: "nb-NO", currency: "NOK", symbol: "kr" },
  "Oman":                   { locale: "ar-OM", currency: "OMR", symbol: "﷼" },
  "Pakistan":               { locale: "ur-PK", currency: "PKR", symbol: "₨" },
  "Philippines":            { locale: "fil-PH", currency: "PHP", symbol: "₱" },
  "Poland":                 { locale: "pl-PL", currency: "PLN", symbol: "zł" },
  "Portugal":               { locale: "pt-PT", currency: "EUR", symbol: "€" },
  "Qatar":                  { locale: "ar-QA", currency: "QAR", symbol: "﷼" },
  "Romania":                { locale: "ro-RO", currency: "RON", symbol: "lei" },
  "Russia":                 { locale: "ru-RU", currency: "RUB", symbol: "₽" },
  "Saudi Arabia":           { locale: "ar-SA", currency: "SAR", symbol: "﷼" },
  "Singapore":              { locale: "en-SG", currency: "SGD", symbol: "S$" },
  "South Africa":           { locale: "en-ZA", currency: "ZAR", symbol: "R" },
  "South Korea":            { locale: "ko-KR", currency: "KRW", symbol: "₩" },
  "Spain":                  { locale: "es-ES", currency: "EUR", symbol: "€" },
  "Sri Lanka":              { locale: "si-LK", currency: "LKR", symbol: "₨" },
  "Sweden":                 { locale: "sv-SE", currency: "SEK", symbol: "kr" },
  "Switzerland":            { locale: "de-CH", currency: "CHF", symbol: "CHF" },
  "Taiwan":                 { locale: "zh-TW", currency: "TWD", symbol: "NT$" },
  "Thailand":               { locale: "th-TH", currency: "THB", symbol: "฿" },
  "Turkey":                 { locale: "tr-TR", currency: "TRY", symbol: "₺" },
  "Ukraine":                { locale: "uk-UA", currency: "UAH", symbol: "₴" },
  "United Arab Emirates":   { locale: "ar-AE", currency: "AED", symbol: "د.إ" },
  "United Kingdom":         { locale: "en-GB", currency: "GBP", symbol: "£" },
  "United States":          { locale: "en-US", currency: "USD", symbol: "$" },
  "Vietnam":                { locale: "vi-VN", currency: "VND", symbol: "₫" },
};

export const DEFAULT_COUNTRY = "India";
export const DEFAULT_LOCALE: CountryLocale = { locale: "en-IN", currency: "INR", symbol: "₹" };

export function getCountryLocale(country: string): CountryLocale {
  return COUNTRY_LOCALES[country] ?? DEFAULT_LOCALE;
}
