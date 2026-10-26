"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useCustomerSession } from "./CustomerSession";
import { customerFetch } from "@/lib/customer-client";
import { itineraryTitle } from "@/lib/format";
import { scrollToAnchor } from "@/lib/anchor";
import { earliestTravelDate, isOrderableTravelDate, latestTravelDate, TRAVEL_DATE_CLOSED, TRAVEL_DATE_NOTE } from "@/lib/booking-date";

export const areas = [
  { label: "South Kuta", slug: "south-kuta" },
  { label: "Ubud", slug: "ubud" },
  { label: "West Bali", slug: "west-bali" },
];
const CUSTOM = "custom";
export type Package = { id: number; title: string };

type PackageGroup = { label: string; items: Package[] };

/** `initialSelection`: the fixed itinerary clicked on a card, or "custom" for Customized Itinerary. */
export function BookingSearch({ initialSelection, initialDate }: { initialSelection?: number | typeof CUSTOM; initialDate?: string }) {
  const { account } = useCustomerSession();
  const [groups, setGroups] = useState<PackageGroup[] | null>(null);
  const [packagesError, setPackagesError] = useState("");
  // A canonical Tour ID, or CUSTOM for a Customized Itinerary request (no fixed itinerary). WordPress derives the area from the Tour ID.
  const [tourId, setTourId] = useState(initialSelection === CUSTOM ? CUSTOM : "");
  const [date, setDate] = useState(() => initialDate && isOrderableTravelDate(initialDate) ? initialDate : "");
  const initialTourId = typeof initialSelection === "number" ? initialSelection : undefined;
  const [pickupPlace, setPickupPlace] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  // A ticket is bound to the exact order details; any change requests a new one.
  const ticket = useRef<{ key: string; value: string } | null>(null);
  // Synchronous guard: two submits in one tick both still see busy === false.
  const submitting = useRef(false);

  // Every fixed itinerary, grouped by area; an area that fails to load is left out and reported.
  useEffect(() => {
    const controller = new AbortController();
    Promise.allSettled(areas.map(async item => {
      const response = await fetch(`/api/tours?area=${encodeURIComponent(item.slug)}`, { cache: "no-store", signal: controller.signal });
      const value = await response.json(); if (!response.ok) throw new Error();
      return { label: item.label, items: value.items as Package[] };
    })).then(results => {
      if (controller.signal.aborted) return;
      const loaded = results.flatMap(result => result.status === "fulfilled" && result.value.items.length ? [result.value] : []);
      setGroups(loaded);
      setPackagesError(results.some(result => result.status === "rejected") ? "Some itineraries could not be loaded. Please try again." : "");
      // The itinerary chosen on a card is selected unless the customer already picked one.
      if (initialTourId && loaded.some(group => group.items.some(item => item.id === initialTourId))) setTourId(current => current || String(initialTourId));
    });
    return () => controller.abort();
  }, [initialTourId]);

  // The form mounts only once the session loads, after the browser's own #order-tour jump, so position it here:
  // below the measured sticky header, then once more after fonts settle in case the text above reflowed.
  const signedIn = Boolean(account);
  useEffect(() => {
    if (!signedIn || window.location.hash !== "#order-tour") return;
    const place = () => scrollToAnchor(document.getElementById("order-tour"));
    const frame = requestAnimationFrame(place);
    void document.fonts?.ready.then(() => requestAnimationFrame(place));
    return () => cancelAnimationFrame(frame);
  }, [signedIn]);

  // Keep the form mounted while the session refreshes on navigation; only signed-out visitors never see it.
  if (!account) return null;
  const custom = tourId === CUSTOM;
  // Bali clock, not the device's: recomputed on every render so a page left open past 20:00 Bali time updates.
  const earliest = earliestTravelDate();
  const latest = latestTravelDate();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!tourId) { setError("Choose an itinerary."); return; }
    if (!date) { setError("Choose the date you want to travel."); return; }
    // WordPress re-checks this rule; the early message just saves a round trip.
    if (date < earliestTravelDate()) { setError(TRAVEL_DATE_CLOSED); return; }
    if (date > latestTravelDate()) { setError("Choose a travel date within the next two years."); return; }
    if (!pickupTime) { setError("Choose your pickup time."); return; }
    if (!pickupPlace.trim()) { setError("Enter your pickup place or hotel."); return; }
    const details = { requested_travel_date: date, pickup_place: pickupPlace.trim(), pickup_time: pickupTime };
    // Fixed itinerary → Marketing WhatsApp; Customized Itinerary → Customer Service. WordPress picks the number.
    const order = custom ? { kind: "custom" as const, tour_id: 0 as const, ...details } : { kind: "tour" as const, tour_id: Number(tourId), ...details };
    const key = JSON.stringify(order);
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true); setError(""); setWhatsapp("");
    try {
      if (ticket.current?.key !== key) ticket.current = { key, value: (await customerFetch("booking-ticket", order)).ticket };
      const result = await customerFetch("inquiries", { ...order, ticket: ticket.current.value });
      setWhatsapp(result.whatsapp_url);
      // The inquiry is saved; hand over to WhatsApp, where the customer presses Send themselves.
      window.location.assign(result.whatsapp_url);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Please try again.");
    } finally { submitting.current = false; setBusy(false); }
  }

  return <section id="order-tour" className="booking-search" aria-labelledby="booking-search-title">
    <div className="booking-search-copy"><p className="section-label">PLAN YOUR DAY IN BALI</p><h2 id="booking-search-title">Order your Bali itinerary</h2><p>Choose your itinerary, date and pickup details. We&apos;ll save your order and open WhatsApp with a reconfirmation message for you to send.</p></div>
    <form className="booking-search-form" onSubmit={submit} noValidate>
      <div className="booking-search-fields">
        <label className="booking-search-field booking-search-field-wide">Itinerary<select value={tourId} onChange={event => setTourId(event.target.value)} required><option value="">{groups ? "Choose an itinerary" : "Loading itineraries…"}</option>
          {groups?.map(group => <optgroup key={group.label} label={group.label}>{group.items.map(item => <option key={item.id} value={item.id}>{itineraryTitle(item.title)}</option>)}</optgroup>)}
          {/* Not a fixed itinerary: a custom request, sent to Customer Service. */}
          <optgroup label="Plan your own"><option value={CUSTOM}>Customized Itinerary</option></optgroup>
        </select>{packagesError && <span className="field-help">{packagesError}</span>}</label>
        <label className="booking-search-field">Travel Date<input type="date" value={date} min={earliest} max={latest} onChange={event => setDate(event.target.value)} required aria-describedby="travel-date-note" /><span className="field-help" id="travel-date-note">{TRAVEL_DATE_NOTE}</span></label>
        <label className="booking-search-field">Pickup Time<input type="time" value={pickupTime} step={900} onChange={event => setPickupTime(event.target.value)} required /><span className="field-help">Local Bali time.</span></label>
        <label className="booking-search-field booking-search-field-wide">Pickup Place / Hotel<input type="text" value={pickupPlace} maxLength={200} autoComplete="off" placeholder="e.g. Svara by Mazari, Uluwatu" onChange={event => setPickupPlace(event.target.value)} required /></label>
      </div>
      <button className="button booking-search-submit" type="submit" disabled={busy}>{busy ? "Saving your order…" : <>Order Now <span aria-hidden="true">→</span></>}</button>
      {error && <p className="customer-error booking-search-error" role="alert">{error}</p>}
      {whatsapp && <p className="customer-notice" role="status">Your order is saved. If WhatsApp did not open, <a href={whatsapp} target="_blank" rel="noreferrer">continue on WhatsApp</a> and press Send.</p>}
    </form>
  </section>;
}
