import type { CustomerAccount } from "./customer-types";

type HistoryItem = CustomerAccount["inquiries"]["items"][number];

// Canonical WordPress status only: a travel date in the past never makes a booking Completed.
export const orderStatus: Record<HistoryItem["status"], {label:string;note?:string;tone:"done"|"pending"|"muted"}> = {
  completed: {label:"Completed",tone:"done"},
  inquiry: {label:"Not completed",note:"Pending confirmation from Shalom Bali Tour",tone:"pending"},
  confirmed: {label:"Not completed",note:"Confirmed — itinerary not completed yet",tone:"pending"},
  cancelled: {label:"Cancelled",tone:"muted"},
  unavailable: {label:"Status unavailable",tone:"muted"},
};

/** `YYYY-MM-DD` calendar dates and UTC timestamps, shown without shifting the day. */
export const formatDate = (value: string, withTime = false) => new Intl.DateTimeFormat("en-GB", {day:"numeric",month:"short",year:"numeric",timeZone:"UTC"}).format(new Date(withTime ? value : `${value}T00:00:00Z`));

/** The admin-verified Booking Date wins; otherwise the date the customer requested. */
export function tourDateLabel(item: Pick<HistoryItem, "booking_date" | "travel_date">) {
  return item.booking_date ? `${formatDate(item.booking_date)} (confirmed)` : item.travel_date ? `${formatDate(item.travel_date)} (requested)` : "Not set yet";
}

/**
 * Customer-facing order number: the one WordPress gave on WhatsApp ("#10001", or "#rck10001" for a referral order, 1.32),
 * else derived from the stored code "AU-10001" for older backends. Admin keeps the full code.
 */
export function orderNumber(code: string, shown?: string | null) {
  return shown || `#${code.slice(code.indexOf("-") + 1)}`;
}
