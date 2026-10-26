// Online ordering cutoff, on the Bali clock whatever the visitor's device time zone. WordPress enforces the
// same rule (Booking::earliest_travel_date); this copy only shapes the form and gives an early message.
export const BALI_TIME_ZONE = "Asia/Makassar";
export const NEXT_DAY_CUTOFF_HOUR = 20;
export const TRAVEL_DATE_NOTE = "Orders must be placed at least one day in advance. Orders for the next day close at 20:00 Bali time.";
export const TRAVEL_DATE_CLOSED = "This travel date is no longer available for online ordering. Next-day orders close at 20:00 Bali time.";

/** Bali calendar date and hour for an instant. */
function baliParts(now: Date) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: BALI_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" }).formatToParts(now).map(part => [part.type, part.value]));
  return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day), hour: Number(parts.hour) };
}

function addDays(year: number, month: number, day: number, days: number) {
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

/** Earliest orderable travel date (YYYY-MM-DD): tomorrow before 20:00 Bali time, otherwise the day after tomorrow. */
export function earliestTravelDate(now = new Date()) {
  const bali = baliParts(now);
  return addDays(bali.year, bali.month, bali.day, bali.hour >= NEXT_DAY_CUTOFF_HOUR ? 2 : 1);
}

/** Latest orderable travel date: two years after the earliest one, matching WordPress. */
export function latestTravelDate(now = new Date()) {
  const [year, month, day] = earliestTravelDate(now).split("-").map(Number);
  return new Date(Date.UTC(year + 2, month - 1, day)).toISOString().slice(0, 10);
}

export function isOrderableTravelDate(date: string, now = new Date()) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= earliestTravelDate(now) && date <= latestTravelDate(now);
}
