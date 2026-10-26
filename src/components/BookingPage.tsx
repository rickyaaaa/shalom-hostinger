"use client";
import type { BookingIntent } from "@/lib/booking-intent";
import { AccountGate } from "./CustomerAccount";
import { BookingForm, type BookingSelection } from "./BookingForm";

/** Dedicated booking page: guests sign in first and return to this exact itinerary (the intent carries it). */
export function BookingPage({ selection, intent }: { selection: BookingSelection; intent: BookingIntent }) {
  return <AccountGate title="Order your Bali itinerary" intent={intent}>{() => <BookingForm selection={selection} initialDate={intent.requested_travel_date} />}</AccountGate>;
}
