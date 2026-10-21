export type BookingIntent = { kind: "tour"; tour_id: number } | { kind: "custom"; tour_id: 0 };
export function bookingPath(intent: BookingIntent) { return intent.kind === "custom" ? "/book/custom" : `/book/${intent.tour_id}`; }
export function intentQuery(intent: BookingIntent | null) { return intent ? intent.kind === "custom" ? "?booking=custom" : `?tour=${intent.tour_id}` : ""; }
export function parseIntent(params: Record<string, string | string[] | undefined>): BookingIntent | null {
  if (params.booking === "custom") return {kind:"custom", tour_id:0};
  return typeof params.tour === "string" && /^[1-9]\d{0,9}$/.test(params.tour) ? {kind:"tour", tour_id:Number(params.tour)} : null;
}
