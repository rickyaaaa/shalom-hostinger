"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCustomerSession } from "./CustomerSession";
import { customerFetch } from "@/lib/customer-client";
import { itineraryTitle } from "@/lib/format";

export const areas = [
  { label: "South Kuta", slug: "south-kuta" },
  { label: "Ubud", slug: "ubud" },
  { label: "West Bali", slug: "west-bali" },
];
const CUSTOM = "custom";
export type Package = { id: number; title: string };

type PackageGroup = { label: string; items: Package[] };

export function BookingSearch({ initialTourId, initialDate }: { initialTourId?: number; initialDate?: string }) {
  const { account } = useCustomerSession();
  const router = useRouter();
  const [groups, setGroups] = useState<PackageGroup[] | null>(null);
  const [packagesError, setPackagesError] = useState("");
  // A canonical Tour ID, or CUSTOM for the Customized Itinerary request page. WordPress derives the area from the Tour ID.
  const [tourId, setTourId] = useState("");
  const [date, setDate] = useState(() => initialDate && initialDate >= new Date().toISOString().slice(0, 10) ? initialDate : "");
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

  // The form mounts only once the session loads, after the browser's own #order-tour jump.
  const signedIn = Boolean(account);
  useEffect(() => {
    if (signedIn && window.location.hash === "#order-tour") document.getElementById("order-tour")?.scrollIntoView({ block: "start" });
  }, [signedIn]);

  // Keep the form mounted while the session refreshes on navigation; only signed-out visitors never see it.
  if (!account) return null;
  const custom = tourId === CUSTOM;
  const today = new Date().toISOString().slice(0, 10);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!tourId) { setError("Choose an itinerary."); return; }
    if (!date) { setError("Choose the date you want to travel."); return; }
    if (custom) { setError(""); router.push(`/book/custom?requested_travel_date=${encodeURIComponent(date)}`); return; }
    if (!pickupPlace.trim()) { setError("Enter your pickup place or hotel."); return; }
    if (!pickupTime) { setError("Choose your pickup time."); return; }
    const order = { kind: "tour" as const, tour_id: Number(tourId), requested_travel_date: date, pickup_place: pickupPlace.trim(), pickup_time: pickupTime };
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
          {/* Not a fixed itinerary: a shortcut to the separate Customized Itinerary request page. */}
          <optgroup label="Plan your own"><option value={CUSTOM}>Customized Itinerary</option></optgroup>
        </select>{packagesError && <span className="field-help">{packagesError}</span>}</label>
        <label className="booking-search-field">Travel Date<input type="date" value={date} min={today} onChange={event => setDate(event.target.value)} required /><span className="field-help">The date you want to travel.</span></label>
        {!custom && <label className="booking-search-field">Pickup Time<input type="time" value={pickupTime} step={900} onChange={event => setPickupTime(event.target.value)} required /><span className="field-help">Local Bali time.</span></label>}
        {!custom && <label className="booking-search-field booking-search-field-wide">Pickup Place / Hotel<input type="text" value={pickupPlace} maxLength={200} autoComplete="off" placeholder="e.g. Svara by Mazari, Uluwatu" onChange={event => setPickupPlace(event.target.value)} required /></label>}
      </div>
      <button className="button booking-search-submit" type="submit" disabled={busy}>{busy ? "Saving your order…" : <>Order Now <span aria-hidden="true">→</span></>}</button>
      {error && <p className="customer-error booking-search-error" role="alert">{error}</p>}
      {whatsapp && <p className="customer-notice" role="status">Your order is saved. If WhatsApp did not open, <a href={whatsapp} target="_blank" rel="noreferrer">continue on WhatsApp</a> and press Send.</p>}
    </form>
  </section>;
}
