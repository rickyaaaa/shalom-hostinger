export type BookingIntent = { kind: "tour"; tour_id: number; requested_travel_date?: string } | { kind: "custom"; tour_id: 0; requested_travel_date?: string };
// The dedicated booking page: /book/<id> locks one fixed itinerary; /book/custom is a Customized Itinerary request.
export function bookingPath(intent: BookingIntent) { return `/book/${intent.kind === "custom" ? "custom" : intent.tour_id}${intent.requested_travel_date ? `?requested_travel_date=${encodeURIComponent(intent.requested_travel_date)}` : ""}`; }
export function intentQuery(intent: BookingIntent | null) {
  if (!intent) return "";
  const params = new URLSearchParams(intent.kind === "custom" ? { booking: "custom" } : { tour: String(intent.tour_id) });
  if (intent.requested_travel_date) params.set("requested_travel_date", intent.requested_travel_date);
  return `?${params.toString()}`;
}
export function parseIntent(params: Record<string, string | string[] | undefined>): BookingIntent | null {
  const requested = typeof params.requested_travel_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.requested_travel_date) ? params.requested_travel_date : undefined;
  if (params.booking === "custom") return {kind:"custom", tour_id:0, ...(requested ? {requested_travel_date: requested} : {})};
  return typeof params.tour === "string" && /^[1-9]\d{0,9}$/.test(params.tour) ? {kind:"tour", tour_id:Number(params.tour), ...(requested ? {requested_travel_date: requested} : {})} : null;
}
