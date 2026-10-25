export function money(value: number, currency: string | null) {
  if (!currency) return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value);
  } catch { return `${currency} ${value}`; }
}

const BRAND = "Shalom Bali Tour";
/** Customer-facing wording for a WordPress Tour title ("A. Ubud Tour" → "A. Ubud Itinerary"); the brand and canonical data stay unchanged. */
export function itineraryTitle(title: string) {
  return title.split(BRAND).map(part => part.replace(/\bTours\b/g, "Itineraries").replace(/\bTour\b/g, "Itinerary").replace(/\btours\b/g, "itineraries").replace(/\btour\b/g, "itinerary")).join(BRAND);
}

export function displayDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}
