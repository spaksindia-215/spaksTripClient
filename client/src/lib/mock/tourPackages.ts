export type Availability = "available" | "limited" | "sold_out";

export type CalendarDate = {
  date: string;
  price: number;
  availability: Availability;
  seats_left: number;
  total_seats: number;
};

export type GroupTour = {
  id: string;
  start_date: string;
  end_date: string;
  group_size: number;
  seats_left: number;
  price: number;
  type: "Backpacking" | "Luxury" | "Family" | "Adventure" | "Cultural";
};

export type TourListItem = {
  id: number;
  categoryId: number;
  categoryType: "national" | "international";
  title: string;
  location: string;
  locationLabel: string;
  duration: string;
  rating: number;
  reviews: number;
  price: number;
  originalPrice: number;
  image: string;
};

export type ItineraryDay = {
  day: string;
  title: string;
  content: string;
  image: string;
};

export type TourDetail = TourListItem & {
  images: string[];
  description: string;
  highlights: string;
  itinerary: ItineraryDay[];
  documents: string[];
  cancellationPolicy: string[];
  termsAndConditions: string;
  gallery: string[];
  calendar?: CalendarDate[];
  groupTours?: GroupTour[];
};

// ------------------------------------------------------------------
// National tour categories (matches order in national-tour-packages page)
// ------------------------------------------------------------------
export const NATIONAL_CATEGORY_TITLES: Record<number, string> = {
  1: "Jammu, Srinagar & Leh Ladakh",
  2: "Andaman Tour Package",
  3: "Kerala Tour Package",
  4: "Uttarakhand Tour Package",
  5: "Ujjain and Mahakaleshwar Tour Packages",
  6: "Jagannath Puri Temple Tour Packages",
  7: "Tripura Tour Packages",
  8: "Manipur Tour Packages",
  9: "Punjab Tour Package",
  10: "Delhi Sightseeing Tour",
  11: "Rajasthan Tour Package",
  12: "Golden Temple Tour",
  13: "Himachal Tour Package",
  14: "Assam Tours",
  15: "Ajmer and Pushkar Tour Packages",
  16: "Varanasi Temple Tour Packages",
  17: "Shirdi Tour Packages",
  18: "Tirupati Balaji Tour Packages",
  19: "Tamil Nadu Tour Packages",
  20: "Delhi Golden Triangle Trip",
  21: "Odisha Tour Package",
  22: "Karnataka Tour Package",
  23: "Goa Tour Package",
  24: "Gujarat Tour",
  25: "Sikkim Tour Package",
  26: "Maharashtra Tour Package",
};

// ------------------------------------------------------------------
// International tour categories
// ------------------------------------------------------------------
export const INTERNATIONAL_CATEGORY_TITLES: Record<number, string> = {
  1: "Dubai Tour Package",
  2: "Singapore Tour Packages",
  3: "Singapore Malaysia Tour Package",
  4: "Hong Kong Tour Package",
  5: "Australia Tour Package",
  6: "Sri Lanka Tour Packages",
  7: "Thailand Tour Package",
  8: "Bali Tour Packages",
  9: "Nepal Tour Package",
  10: "Mauritius Trip",
  11: "France Tour Package",
};

// ------------------------------------------------------------------
// National packages
// ------------------------------------------------------------------
const LEH_LADAKH_IMAGE =
  "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=600&q=80";
const LEH_LADAKH_IMAGE_2 =
  "https://images.unsplash.com/photo-1600011689032-8b628b8a8747?auto=format&fit=crop&w=600&q=80";
const LEH_LADAKH_IMAGE_3 =
  "https://images.unsplash.com/photo-1583224994869-f20a61c55552?auto=format&fit=crop&w=600&q=80";
const NUBRA_IMAGE =
  "https://images.unsplash.com/photo-1605541624-e13e1f09aec0?auto=format&fit=crop&w=600&q=80";
const PANGONG_IMAGE =
  "https://images.unsplash.com/photo-1516912481808-3406841bd33c?auto=format&fit=crop&w=600&q=80";

export const NATIONAL_PACKAGES: TourListItem[] = [
  // Category 1: Leh Ladakh (10 packages)
  {
    id: 1,
    categoryId: 1,
    categoryType: "national",
    title: "Leh Ladakh 5Nights 6Days",
    location: "Delhi",
    locationLabel: "Leh Ladakh",
    duration: "5Nights 6Days",
    rating: 5.0,
    reviews: 105,
    price: 19999,
    originalPrice: 25600,
    image: LEH_LADAKH_IMAGE,
  },
  {
    id: 2,
    categoryId: 1,
    categoryType: "national",
    title: "Leh Ladakh 4 NIGHT 5 DAY",
    location: "Delhi",
    locationLabel: "Leh Ladakh",
    duration: "4 NIGHT 5 DAY",
    rating: 5.0,
    reviews: 105,
    price: 18500,
    originalPrice: 25000,
    image: LEH_LADAKH_IMAGE_2,
  },
  {
    id: 3,
    categoryId: 1,
    categoryType: "national",
    title: "Leh / Alchi / Pangong Lake / KhardungLa pass / Leh 6n/7d",
    location: "Delhi",
    locationLabel: "Leh Ladakh",
    duration: "6 Nights 7 Days",
    rating: 5.0,
    reviews: 105,
    price: 19000,
    originalPrice: 25000,
    image: LEH_LADAKH_IMAGE_3,
  },
  {
    id: 4,
    categoryId: 1,
    categoryType: "national",
    title: "Leh / Nubra Valley / Pangon Lake / Leh 5n/6d",
    location: "Delhi",
    locationLabel: "Leh Ladakh",
    duration: "5 Nights 6 Days",
    rating: 5.0,
    reviews: 105,
    price: 17999,
    originalPrice: 24000,
    image: NUBRA_IMAGE,
  },
  {
    id: 5,
    categoryId: 1,
    categoryType: "national",
    title: "Beautiful Leh With Pangong Lake (Standard)",
    location: "Leh Ladakh",
    locationLabel: "Leh Ladakh",
    duration: "4 Nights 5 Days",
    rating: 5.0,
    reviews: 105,
    price: 22290,
    originalPrice: 25999,
    image: PANGONG_IMAGE,
  },
  {
    id: 6,
    categoryId: 1,
    categoryType: "national",
    title: "Leh Ladakh Adventure Special 7N/8D",
    location: "Delhi",
    locationLabel: "Leh Ladakh",
    duration: "7 Nights 8 Days",
    rating: 4.8,
    reviews: 88,
    price: 24999,
    originalPrice: 32000,
    image: LEH_LADAKH_IMAGE,
  },
  {
    id: 7,
    categoryId: 1,
    categoryType: "national",
    title: "Srinagar Gulmarg Pahalgam 6N/7D",
    location: "Srinagar",
    locationLabel: "Leh Ladakh",
    duration: "6 Nights 7 Days",
    rating: 4.9,
    reviews: 120,
    price: 21500,
    originalPrice: 28000,
    image: LEH_LADAKH_IMAGE_2,
  },
  {
    id: 8,
    categoryId: 1,
    categoryType: "national",
    title: "Kashmir Honeymoon Package 5N/6D",
    location: "Srinagar",
    locationLabel: "Leh Ladakh",
    duration: "5 Nights 6 Days",
    rating: 5.0,
    reviews: 95,
    price: 23500,
    originalPrice: 30000,
    image: PANGONG_IMAGE,
  },
  {
    id: 9,
    categoryId: 1,
    categoryType: "national",
    title: "Zanskar Valley Explorer 8N/9D",
    location: "Leh",
    locationLabel: "Leh Ladakh",
    duration: "8 Nights 9 Days",
    rating: 4.7,
    reviews: 67,
    price: 29999,
    originalPrice: 38000,
    image: NUBRA_IMAGE,
  },
  {
    id: 10,
    categoryId: 1,
    categoryType: "national",
    title: "Leh Ladakh Bike Expedition 10N/11D",
    location: "Delhi",
    locationLabel: "Leh Ladakh",
    duration: "10 Nights 11 Days",
    rating: 4.9,
    reviews: 143,
    price: 34999,
    originalPrice: 45000,
    image: LEH_LADAKH_IMAGE_3,
  },

  // Category 2: Andaman
  {
    id: 11,
    categoryId: 2,
    categoryType: "national",
    title: "Andaman Honeymoon Package 4N/5D",
    location: "Port Blair",
    locationLabel: "Andaman",
    duration: "4 Nights 5 Days",
    rating: 4.9,
    reviews: 88,
    price: 18999,
    originalPrice: 24000,
    image:
      "https://images.unsplash.com/photo-1589197331516-4d84b72ebde3?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 12,
    categoryId: 2,
    categoryType: "national",
    title: "Andaman Island Tour 5N/6D",
    location: "Port Blair",
    locationLabel: "Andaman",
    duration: "5 Nights 6 Days",
    rating: 5.0,
    reviews: 112,
    price: 22499,
    originalPrice: 28000,
    image:
      "https://images.unsplash.com/photo-1489462386070-6f52b524c8b1?auto=format&fit=crop&w=600&q=80",
  },

  // Category 3: Kerala
  {
    id: 13,
    categoryId: 3,
    categoryType: "national",
    title: "Kerala Backwater Tour 4N/5D",
    location: "Kochi",
    locationLabel: "Kerala",
    duration: "4 Nights 5 Days",
    rating: 4.8,
    reviews: 95,
    price: 14999,
    originalPrice: 19000,
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 14,
    categoryId: 3,
    categoryType: "national",
    title: "God's Own Country Kerala 6N/7D",
    location: "Thiruvananthapuram",
    locationLabel: "Kerala",
    duration: "6 Nights 7 Days",
    rating: 5.0,
    reviews: 134,
    price: 19999,
    originalPrice: 26000,
    image:
      "https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=600&q=80",
  },
];

// ------------------------------------------------------------------
// International packages
// ------------------------------------------------------------------
const DUBAI_IMAGE =
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80";
const DUBAI_IMAGE_2 =
  "https://images.unsplash.com/photo-1548813395-76469feebc42?auto=format&fit=crop&w=600&q=80";
const DUBAI_IMAGE_3 =
  "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=600&q=80";

export const INTERNATIONAL_PACKAGES: TourListItem[] = [
  // Category 1: Dubai (10 packages)
  {
    id: 101,
    categoryId: 1,
    categoryType: "international",
    title: "Dubai 4 Nights 5 Days Package",
    location: "Dubai",
    locationLabel: "Dubai",
    duration: "4 Nights 5 Days",
    rating: 5.0,
    reviews: 210,
    price: 34999,
    originalPrice: 45000,
    image: DUBAI_IMAGE,
  },
  {
    id: 102,
    categoryId: 1,
    categoryType: "international",
    title: "Dubai Luxury Tour 5N/6D",
    location: "Dubai",
    locationLabel: "Dubai",
    duration: "5 Nights 6 Days",
    rating: 4.9,
    reviews: 178,
    price: 42999,
    originalPrice: 55000,
    image: DUBAI_IMAGE_2,
  },
  {
    id: 103,
    categoryId: 1,
    categoryType: "international",
    title: "Dubai Explorer 3N/4D Budget Package",
    location: "Dubai",
    locationLabel: "Dubai",
    duration: "3 Nights 4 Days",
    rating: 4.7,
    reviews: 132,
    price: 26999,
    originalPrice: 35000,
    image: DUBAI_IMAGE_3,
  },
  {
    id: 104,
    categoryId: 1,
    categoryType: "international",
    title: "Dubai Family Delight 6N/7D",
    location: "Dubai",
    locationLabel: "Dubai",
    duration: "6 Nights 7 Days",
    rating: 5.0,
    reviews: 98,
    price: 52999,
    originalPrice: 68000,
    image: DUBAI_IMAGE,
  },
  {
    id: 105,
    categoryId: 1,
    categoryType: "international",
    title: "Dubai Honeymoon Special 5N/6D",
    location: "Dubai",
    locationLabel: "Dubai",
    duration: "5 Nights 6 Days",
    rating: 5.0,
    reviews: 245,
    price: 48999,
    originalPrice: 60000,
    image: DUBAI_IMAGE_2,
  },
  {
    id: 106,
    categoryId: 1,
    categoryType: "international",
    title: "Dubai & Abu Dhabi Combo 7N/8D",
    location: "Dubai",
    locationLabel: "Dubai",
    duration: "7 Nights 8 Days",
    rating: 4.8,
    reviews: 87,
    price: 58999,
    originalPrice: 72000,
    image: DUBAI_IMAGE_3,
  },
  {
    id: 107,
    categoryId: 1,
    categoryType: "international",
    title: "Dubai Premium Stay 4N/5D",
    location: "Dubai",
    locationLabel: "Dubai",
    duration: "4 Nights 5 Days",
    rating: 4.9,
    reviews: 156,
    price: 39999,
    originalPrice: 50000,
    image: DUBAI_IMAGE,
  },
  {
    id: 108,
    categoryId: 1,
    categoryType: "international",
    title: "Dubai City & Desert Safari 5N/6D",
    location: "Dubai",
    locationLabel: "Dubai",
    duration: "5 Nights 6 Days",
    rating: 4.8,
    reviews: 119,
    price: 44999,
    originalPrice: 57000,
    image: DUBAI_IMAGE_2,
  },
  {
    id: 109,
    categoryId: 1,
    categoryType: "international",
    title: "Dubai Shopping Festival Tour 4N/5D",
    location: "Dubai",
    locationLabel: "Dubai",
    duration: "4 Nights 5 Days",
    rating: 5.0,
    reviews: 201,
    price: 37999,
    originalPrice: 48000,
    image: DUBAI_IMAGE_3,
  },
  {
    id: 110,
    categoryId: 1,
    categoryType: "international",
    title: "Dubai Royal Experience 8N/9D",
    location: "Dubai",
    locationLabel: "Dubai",
    duration: "8 Nights 9 Days",
    rating: 5.0,
    reviews: 73,
    price: 72999,
    originalPrice: 90000,
    image: DUBAI_IMAGE,
  },

  // Category 2: Singapore
  {
    id: 111,
    categoryId: 2,
    categoryType: "international",
    title: "Singapore City Tour 4N/5D",
    location: "Singapore",
    locationLabel: "Singapore",
    duration: "4 Nights 5 Days",
    rating: 4.9,
    reviews: 165,
    price: 38999,
    originalPrice: 49000,
    image:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 112,
    categoryId: 2,
    categoryType: "international",
    title: "Singapore & Universal Studios 5N/6D",
    location: "Singapore",
    locationLabel: "Singapore",
    duration: "5 Nights 6 Days",
    rating: 5.0,
    reviews: 198,
    price: 44999,
    originalPrice: 58000,
    image:
      "https://images.unsplash.com/photo-1524986500000-99d2e5b07ec3?auto=format&fit=crop&w=600&q=80",
  },
];

// ------------------------------------------------------------------
// Tour details (full data for detail pages)
// ------------------------------------------------------------------
const LADAKH_DETAIL_IMAGES = [
  "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1583224994869-f20a61c55552?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1605541624-e13e1f09aec0?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1516912481808-3406841bd33c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600011689032-8b628b8a8747?auto=format&fit=crop&w=900&q=80",
];

const LADAKH_ITINERARY: ItineraryDay[] = [
  {
    day: "Day 01",
    title: "Arrive Leh",
    content:
      "Our services start with your arrival at Leh airport. Meet & greet and transfer to the Hotel. Welcome drink on arrival. We recommend you completely relax for the rest of the day to enable yourselves to acclimatize to the rarefied air at the high altitude. Dinner at the hotel. Overnight at the hotel.",
    image:
      "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=600&q=80",
  },
  {
    day: "Day 02",
    title: "Leh (Full day monasteries tour)",
    content:
      "After breakfast at take a full day excursion to renowned monasteries of Ladakh region. Visit Thiksey monastery, Hemis monastery which is one of the most famous monasteries of the Ladakh region. On the way back to Leh visit Shey Palace and 3 Idiot Fame Rancho School. Explore Leh market on your own in the evening or relax at hotel. Dinner and overnight stay at hotel.",
    image:
      "https://images.unsplash.com/photo-1583224994869-f20a61c55552?auto=format&fit=crop&w=600&q=80",
  },
  {
    day: "Day 03",
    title: "Leh to Nubra Valley.",
    content:
      "After breakfast at hotel start your drive to Nubra Valley. En-route stop at Khardung la Pass, the highest motorable road in the world at 5600 meters. The views from the top of the pass are amazing. After spending some time continue drive on to Nubra Valley. On arrival check-in at the Tents. In the afternoon visit Diskit Monastery and walk around the town of Diskit. Dinner and overnight at the tents.",
    image:
      "https://images.unsplash.com/photo-1516912481808-3406841bd33c?auto=format&fit=crop&w=600&q=80",
  },
  {
    day: "Day 04",
    title: "Nubra Valley to Leh.",
    content:
      "After breakfast drive back to Leh via Khardung La Pass. On the way enjoy the panoramic views of Nubra Valley and surrounding mountains. Arrive Leh by afternoon. Evening free to explore the local market. Dinner and overnight at hotel.",
    image:
      "https://images.unsplash.com/photo-1600011689032-8b628b8a8747?auto=format&fit=crop&w=600&q=80",
  },
  {
    day: "Day 05",
    title: "Leh (Full day tour of Pangong Lake - 130 Kms)",
    content:
      "Leave early morning at 5AM to Pangong Lake through Changla pass 5486 Mtrs. While ascending Changla pass 5486 Mtrs. Enjoy the beautiful panoramic view of the villages below the pass. After crossing the pass halt at Tsultak, the summer pastureland of the yaks. Arrive Durbuk and from there a short drive takes you to the western shore of the lake. Enjoy the landscape in the back drop of the Lake. This famous blue brackish Lake of Pangong is 5/6 Kms wide and over 144 Kms long with half of its running the other side of the \"INDO CHINA BORDER\". One rarely feels so close to nature and environment and the scenery is unforgettable. In the late afternoon drive back to Leh. Dinner and Overnight at Hotel.",
    image:
      "https://images.unsplash.com/photo-1605541624-e13e1f09aec0?auto=format&fit=crop&w=600&q=80",
  },
  {
    day: "Day 06",
    title: "Leh - Departure",
    content:
      "After breakfast time free till departure. Transfer to the airport for your onward flight.",
    image:
      "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=600&q=80",
  },
];

const STANDARD_CANCELLATION = [
  "10% cancellation charge + Rs. 1,000 per person will be charged if the booking is cancelled 30 days before departure.",
  "25% cancellation charge + Rs. 1,000 per person will be charged if the booking is cancelled between 29th to 7th days before departure.",
  "No refund if cancelled within 7 days before the departure.",
];

const STANDARD_TERMS = `The website owner, along with its subsidiaries and affiliates ("Spakstrip", "we", "us", or "our"), provides the information contained on this website to visitors ("you", "your") subject to the terms and conditions set out in this document, our Privacy Policy, and any other relevant notices applicable to specific sections of the website.

1. Acceptance of Terms
By accessing and using this website, you agree to be bound by these terms and conditions. If you do not agree with any part of these terms, please do not use our website. The term "Spakstrip" refers to the owner of the website whose registered office is: E-38, Budh Vihar, Badarpur, New Delhi – 110044, India

2. Use of the Website
• The content on this website is for your general information and use only and is subject to change without notice.
• We and any third parties do not provide any warranty or guarantee as to the accuracy, timeliness, or suitability of the information provided.
• You acknowledge that such information may contain errors or inaccuracies, and we expressly exclude liability for any such inaccuracies to the fullest extent permitted by law.

3. Intellectual Property
• This website contains material which is owned or licensed to us. This includes, but is not limited to, the design, layout, graphics, and appearance. Reproduction is prohibited other than in accordance with the copyright notice.
• All trademarks reproduced in this website, which are not the property of or licensed to Spakstrip, are acknowledged.

4. External Links
• This website may include links to other websites for your convenience. They do not signify endorsement, and we have no responsibility for the content of linked websites.

5. Linking to Spakstrip
• You may not create a link to this website from another website without prior written consent from Spakstrip.`;

// ------------------------------------------------------------------
// Calendar dates for Leh Ladakh packages (ID 1)
// ------------------------------------------------------------------
const LADAKH_CALENDAR: CalendarDate[] = [
  { date: "2026-05-02", price: 19999, availability: "available",  seats_left: 16, total_seats: 20 },
  { date: "2026-05-09", price: 19999, availability: "available",  seats_left: 18, total_seats: 20 },
  { date: "2026-05-16", price: 21999, availability: "limited",    seats_left: 3,  total_seats: 20 },
  { date: "2026-05-23", price: 19999, availability: "sold_out",   seats_left: 0,  total_seats: 20 },
  { date: "2026-05-30", price: 19999, availability: "available",  seats_left: 14, total_seats: 20 },
  { date: "2026-06-06", price: 22999, availability: "available",  seats_left: 20, total_seats: 20 },
  { date: "2026-06-13", price: 22999, availability: "limited",    seats_left: 5,  total_seats: 20 },
  { date: "2026-06-20", price: 22999, availability: "sold_out",   seats_left: 0,  total_seats: 20 },
  { date: "2026-06-27", price: 22999, availability: "available",  seats_left: 12, total_seats: 20 },
  { date: "2026-07-04", price: 24999, availability: "available",  seats_left: 18, total_seats: 20 },
  { date: "2026-07-11", price: 24999, availability: "available",  seats_left: 15, total_seats: 20 },
  { date: "2026-07-18", price: 24999, availability: "limited",    seats_left: 2,  total_seats: 20 },
  { date: "2026-07-25", price: 24999, availability: "available",  seats_left: 10, total_seats: 20 },
  { date: "2026-08-01", price: 24999, availability: "available",  seats_left: 19, total_seats: 20 },
  { date: "2026-08-08", price: 24999, availability: "available",  seats_left: 17, total_seats: 20 },
  { date: "2026-08-15", price: 24999, availability: "sold_out",   seats_left: 0,  total_seats: 20 },
  { date: "2026-08-22", price: 22999, availability: "available",  seats_left: 11, total_seats: 20 },
  { date: "2026-08-29", price: 22999, availability: "limited",    seats_left: 4,  total_seats: 20 },
  { date: "2026-09-05", price: 19999, availability: "available",  seats_left: 16, total_seats: 20 },
  { date: "2026-09-12", price: 19999, availability: "available",  seats_left: 20, total_seats: 20 },
];

const LADAKH_GROUP_TOURS: GroupTour[] = [
  { id: "grp_001", start_date: "2026-05-02", end_date: "2026-05-07", group_size: 14, seats_left: 6,  price: 19999, type: "Backpacking" },
  { id: "grp_002", start_date: "2026-05-16", end_date: "2026-05-21", group_size: 8,  seats_left: 3,  price: 21999, type: "Adventure"  },
  { id: "grp_003", start_date: "2026-05-30", end_date: "2026-06-04", group_size: 16, seats_left: 8,  price: 19999, type: "Family"     },
  { id: "grp_004", start_date: "2026-06-13", end_date: "2026-06-18", group_size: 10, seats_left: 4,  price: 22999, type: "Cultural"   },
  { id: "grp_005", start_date: "2026-07-04", end_date: "2026-07-09", group_size: 20, seats_left: 11, price: 24999, type: "Backpacking" },
  { id: "grp_006", start_date: "2026-07-18", end_date: "2026-07-23", group_size: 6,  seats_left: 2,  price: 24999, type: "Luxury"     },
  { id: "grp_007", start_date: "2026-08-01", end_date: "2026-08-06", group_size: 18, seats_left: 9,  price: 24999, type: "Adventure"  },
  { id: "grp_008", start_date: "2026-09-05", end_date: "2026-09-10", group_size: 12, seats_left: 7,  price: 19999, type: "Family"     },
];

// ------------------------------------------------------------------
// Calendar dates for Dubai packages (ID 101)
// ------------------------------------------------------------------
const DUBAI_CALENDAR: CalendarDate[] = [
  { date: "2026-05-03", price: 34999, availability: "available",  seats_left: 18, total_seats: 25 },
  { date: "2026-05-10", price: 34999, availability: "limited",    seats_left: 4,  total_seats: 25 },
  { date: "2026-05-17", price: 36999, availability: "available",  seats_left: 20, total_seats: 25 },
  { date: "2026-05-24", price: 36999, availability: "sold_out",   seats_left: 0,  total_seats: 25 },
  { date: "2026-05-31", price: 34999, availability: "available",  seats_left: 15, total_seats: 25 },
  { date: "2026-06-07", price: 38999, availability: "available",  seats_left: 22, total_seats: 25 },
  { date: "2026-06-14", price: 38999, availability: "limited",    seats_left: 3,  total_seats: 25 },
  { date: "2026-06-21", price: 38999, availability: "available",  seats_left: 19, total_seats: 25 },
  { date: "2026-07-05", price: 40999, availability: "available",  seats_left: 25, total_seats: 25 },
  { date: "2026-07-19", price: 40999, availability: "limited",    seats_left: 2,  total_seats: 25 },
  { date: "2026-08-02", price: 38999, availability: "available",  seats_left: 14, total_seats: 25 },
  { date: "2026-08-16", price: 36999, availability: "sold_out",   seats_left: 0,  total_seats: 25 },
  { date: "2026-08-30", price: 34999, availability: "available",  seats_left: 17, total_seats: 25 },
];

const DUBAI_GROUP_TOURS: GroupTour[] = [
  { id: "dxb_001", start_date: "2026-05-03", end_date: "2026-05-07", group_size: 15, seats_left: 7,  price: 34999, type: "Luxury"     },
  { id: "dxb_002", start_date: "2026-05-17", end_date: "2026-05-21", group_size: 12, seats_left: 5,  price: 36999, type: "Family"     },
  { id: "dxb_003", start_date: "2026-06-07", end_date: "2026-06-11", group_size: 20, seats_left: 11, price: 38999, type: "Backpacking" },
  { id: "dxb_004", start_date: "2026-07-05", end_date: "2026-07-09", group_size: 8,  seats_left: 3,  price: 40999, type: "Adventure"  },
  { id: "dxb_005", start_date: "2026-08-02", end_date: "2026-08-06", group_size: 16, seats_left: 9,  price: 38999, type: "Cultural"   },
];

export const NATIONAL_DETAILS: Record<number, TourDetail> = {
  1: {
    ...NATIONAL_PACKAGES[0],
    images: LADAKH_DETAIL_IMAGES,
    description:
      "Arrive Leh>Leh(Full day monasteries tour)>Leh to Nubra Valley.>Nubra Valley to Leh.> Leh (Full day tour of Pangong Lake - 130 Kms)>Leh - Departure>",
    highlights:
      "dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.",
    itinerary: LADAKH_ITINERARY,
    documents: [
      "Photo copy (Xerox copy) of Government issued Id card (Any one- Election ID, driving license, Aadhar card, Passport etc)",
    ],
    cancellationPolicy: STANDARD_CANCELLATION,
    termsAndConditions: STANDARD_TERMS,
    gallery: LADAKH_DETAIL_IMAGES,
    calendar: LADAKH_CALENDAR,
    groupTours: LADAKH_GROUP_TOURS,
  },
  2: {
    ...NATIONAL_PACKAGES[1],
    images: [
      "https://images.unsplash.com/photo-1600011689032-8b628b8a8747?auto=format&fit=crop&w=900&q=80",
      ...LADAKH_DETAIL_IMAGES.slice(1),
    ],
    description:
      "Arrive Leh>Leh(Full day monasteries tour)>Leh to Nubra Valley.>Leh (Full day tour of Pangong Lake)>Leh - Departure>",
    highlights:
      "dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    itinerary: LADAKH_ITINERARY.slice(0, 5),
    documents: [
      "Photo copy (Xerox copy) of Government issued Id card (Any one- Election ID, driving license, Aadhar card, Passport etc)",
    ],
    cancellationPolicy: STANDARD_CANCELLATION,
    termsAndConditions: STANDARD_TERMS,
    gallery: LADAKH_DETAIL_IMAGES,
    calendar: LADAKH_CALENDAR,
    groupTours: LADAKH_GROUP_TOURS,
  },
};

// Generic fallback detail for any package not in the map above
export function getFallbackDetail(pkg: TourListItem): TourDetail {
  return {
    ...pkg,
    images: [pkg.image, ...LADAKH_DETAIL_IMAGES.slice(0, 4)],
    description: `Explore ${pkg.title} – a carefully crafted itinerary that covers all the major highlights of the destination. Our expert guides ensure a comfortable and memorable journey.`,
    highlights:
      "dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.",
    itinerary: LADAKH_ITINERARY,
    documents: [
      "Photo copy (Xerox copy) of Government issued Id card (Any one- Election ID, driving license, Aadhar card, Passport etc)",
    ],
    cancellationPolicy: STANDARD_CANCELLATION,
    termsAndConditions: STANDARD_TERMS,
    gallery: [pkg.image, ...LADAKH_DETAIL_IMAGES.slice(0, 5)],
  };
}

const DUBAI_DETAIL_IMAGES = [
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1548813395-76469feebc42?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?auto=format&fit=crop&w=900&q=80",
];

const DUBAI_ITINERARY: ItineraryDay[] = [
  {
    day: "Day 01",
    title: "Arrive Dubai",
    content:
      "Arrive at Dubai International Airport. Our representative will meet and greet you and transfer to the hotel. Check-in at the hotel. Evening free for leisure. Welcome dinner at a local restaurant. Overnight at hotel.",
    image: DUBAI_DETAIL_IMAGES[0],
  },
  {
    day: "Day 02",
    title: "Dubai City Tour",
    content:
      "After breakfast, embark on a full-day Dubai city tour. Visit the iconic Burj Khalifa, Dubai Mall, Gold Souk, Spice Souk, Dubai Creek, and the historic Al Fahidi district. In the evening enjoy a dhow cruise dinner on Dubai Creek. Overnight at hotel.",
    image: DUBAI_DETAIL_IMAGES[1],
  },
  {
    day: "Day 03",
    title: "Desert Safari",
    content:
      "Morning free for leisure or optional water park visit. In the afternoon depart for an exciting desert safari experience. Enjoy dune bashing, camel riding, sandboarding, henna painting, and a BBQ dinner under the stars with live entertainment. Overnight at hotel.",
    image: DUBAI_DETAIL_IMAGES[2],
  },
  {
    day: "Day 04",
    title: "Abu Dhabi Excursion",
    content:
      "After breakfast, proceed for a full-day Abu Dhabi city tour. Visit the magnificent Sheikh Zayed Grand Mosque, Emirates Palace, Corniche, and Ferrari World (entry optional). Return to Dubai by evening. Overnight at hotel.",
    image: DUBAI_DETAIL_IMAGES[3],
  },
  {
    day: "Day 05",
    title: "Departure",
    content:
      "After breakfast, enjoy some leisure time for last-minute shopping. Transfer to Dubai International Airport for your return flight home. We hope you had a wonderful experience!",
    image: DUBAI_DETAIL_IMAGES[4],
  },
];

export const INTERNATIONAL_DETAILS: Record<number, TourDetail> = {
  101: {
    ...INTERNATIONAL_PACKAGES[0],
    images: DUBAI_DETAIL_IMAGES,
    description:
      "Arrive Dubai>Dubai City Tour (Burj Khalifa, Dubai Mall, Gold Souk)>Desert Safari Adventure>Abu Dhabi Excursion (Sheikh Zayed Mosque)>Departure>",
    highlights:
      "dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.",
    itinerary: DUBAI_ITINERARY,
    documents: [
      "Valid Passport (minimum 6 months validity from date of travel)",
      "Visa approval / UAE Visa (arranged by us)",
      "Photo copy (Xerox copy) of Government issued Id card",
      "Passport size photographs (2 copies)",
    ],
    cancellationPolicy: STANDARD_CANCELLATION,
    termsAndConditions: STANDARD_TERMS,
    gallery: DUBAI_DETAIL_IMAGES,
    calendar: DUBAI_CALENDAR,
    groupTours: DUBAI_GROUP_TOURS,
  },
};

// Helpers
export function getNationalPackagesByCategory(categoryId: number): TourListItem[] {
  return NATIONAL_PACKAGES.filter((p) => p.categoryId === categoryId);
}

export function getInternationalPackagesByCategory(categoryId: number): TourListItem[] {
  return INTERNATIONAL_PACKAGES.filter((p) => p.categoryId === categoryId);
}

export function getNationalDetail(id: number): TourDetail | undefined {
  const detail = NATIONAL_DETAILS[id];
  if (detail) return detail;
  const pkg = NATIONAL_PACKAGES.find((p) => p.id === id);
  if (pkg) return getFallbackDetail(pkg);
  return undefined;
}

export function getInternationalDetail(id: number): TourDetail | undefined {
  const detail = INTERNATIONAL_DETAILS[id];
  if (detail) return detail;
  const pkg = INTERNATIONAL_PACKAGES.find((p) => p.id === id);
  if (pkg) return getFallbackDetail(pkg);
  return undefined;
}
