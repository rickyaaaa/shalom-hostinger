"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCustomerSession } from "./CustomerSession";
import { customerFetch } from "@/lib/customer-client";

export const areas = [
  { label: "South Kuta", slug: "south-kuta" },
  { label: "Ubud", slug: "ubud" },
  { label: "West Bali", slug: "west-bali" },
];
const CUSTOM = "custom";
export type Package = { id: number; title: string };

export function BookingSearch({ initialDestination, initialTourId, initialDate }: { initialDestination?: string; initialTourId?: number; initialDate?: string }) {
  const { account } = useCustomerSession();
  const router = useRouter();
  const [area, setArea] = useState(initialDestination ?? "");
  const [packages, setPackages] = useState<Package[] | null>(null);
  const [packagesError, setPackagesError] = useState("");
  const [tourId, setTourId] = useState("");
  const [date, setDate] = useState(() => initialDate && initialDate >= new Date().toISOString().slice(0, 10) ? initialDate : "");
  // The Tour chosen on a Tour card is selected once its area's packages load, until the customer picks another area.
  const preselect = useRef(initialTourId);
  const [pickupPlace, setPickupPlace] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  // A ticket is bound to the exact order details; any change requests a new one.
  const ticket = useRef<{ key: string; value: string } | null>(null);

  useEffect(() => {
    setTourId(""); setPackages(null); setPackagesError("");
    if (!area || area === CUSTOM) return;
    const controller = new AbortController();
    fetch(`/api/tours?area=${encodeURIComponent(area)}`, { cache: "no-store", signal: controller.signal })
      .then(async response => {
        const value = await response.json(); if (!response.ok) throw new Error();
        const items: Package[] = value.items;
        setPackages(items);
        if (items.some(item => item.id === preselect.current)) setTourId(String(preselect.current));
      })
      .catch(() => { if (!controller.signal.aborted) setPackagesError("Tour packages could not be loaded. Please try again."); });
    return () => controller.abort();
  }, [area]);

  // The form mounts only once the session loads, after the browser's own #order-tour jump.
  const signedIn = Boolean(account);
  useEffect(() => {
    if (signedIn && window.location.hash === "#order-tour") document.getElementById("order-tour")?.scrollIntoView({ block: "start" });
  }, [signedIn]);

  // Keep the form mounted while the session refreshes on navigation; only signed-out visitors never see it.
  if (!account) return null;
  const custom = area === CUSTOM;
  const today = new Date().toISOString().slice(0, 10);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!area) { setError("Choose a tour area to continue."); return; }
    if (!date) { setError("Choose the date you want your tour to take place."); return; }
    if (custom) { setError(""); router.push(`/book/custom?requested_travel_date=${encodeURIComponent(date)}`); return; }
    if (!tourId) { setError("Choose a tour package."); return; }
    if (!pickupPlace.trim()) { setError("Enter your pickup place or hotel."); return; }
    if (!pickupTime) { setError("Choose your pickup time."); return; }
    const order = { kind: "tour" as const, tour_id: Number(tourId), requested_travel_date: date, pickup_place: pickupPlace.trim(), pickup_time: pickupTime };
    const key = JSON.stringify(order);
    setBusy(true); setError(""); setWhatsapp("");
    try {
      if (ticket.current?.key !== key) ticket.current = { key, value: (await customerFetch("booking-ticket", order)).ticket };
      const result = await customerFetch("inquiries", { ...order, ticket: ticket.current.value });
      setWhatsapp(result.whatsapp_url);
      // The inquiry is saved; hand over to WhatsApp, where the customer presses Send themselves.
      window.location.assign(result.whatsapp_url);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Please try again.");
    } finally { setBusy(false); }
  }

  const areaLabel = areas.find(item => item.slug === area)?.label;
  return <section id="order-tour" className="booking-search" aria-labelledby="booking-search-title">
    <div className="booking-search-copy"><p className="section-label">PLAN YOUR DAY IN BALI</p><h2 id="booking-search-title">Order your Bali tour</h2><p>Choose your tour, date and pickup details. We&apos;ll save your order and open WhatsApp with a reconfirmation message for you to send.</p></div>
    <form className="booking-search-form" onSubmit={submit} noValidate>
      <div className="booking-search-fields">
        <label className="booking-search-field">Tour area<select value={area} onChange={event => { preselect.current = undefined; setArea(event.target.value); }} required><option value="">Choose a tour area</option>{areas.map(item => <option key={item.slug} value={item.slug}>{item.label}</option>)}<option value={CUSTOM}>Customized Tour</option></select></label>
        {!custom && <label className="booking-search-field">Tour package<select value={tourId} onChange={event => setTourId(event.target.value)} required disabled={!packages?.length}><option value="">{!area ? "Choose a tour area first" : packages ? (packages.length ? "Choose a tour package" : "No packages available") : packagesError ? "Unavailable" : "Loading packages…"}</option>{packages?.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select>
          <span className="field-help">{packagesError || (areaLabel && date ? <a href={`/${area}?requested_travel_date=${encodeURIComponent(date)}#tour-packages`}>View {areaLabel} package details</a> : areaLabel ? <a href={`/${area}#tour-packages`}>View {areaLabel} package details</a> : "")}</span></label>}
        <label className="booking-search-field">Tour date<input type="date" value={date} min={today} onChange={event => setDate(event.target.value)} required /><span className="field-help">The day you want to take the tour.</span></label>
        {!custom && <label className="booking-search-field">Pickup time<input type="time" value={pickupTime} step={900} onChange={event => setPickupTime(event.target.value)} required /><span className="field-help">Local Bali time.</span></label>}
        {!custom && <label className="booking-search-field booking-search-field-wide">Pickup place / hotel<input type="text" value={pickupPlace} maxLength={200} autoComplete="off" placeholder="e.g. Svara by Mazari, Uluwatu" onChange={event => setPickupPlace(event.target.value)} required /></label>}
      </div>
      <button className="button booking-search-submit" type="submit" disabled={busy}>{busy ? "Saving your order…" : <>Order Now <span aria-hidden="true">→</span></>}</button>
      {error && <p className="customer-error booking-search-error" role="alert">{error}</p>}
      {whatsapp && <p className="customer-notice" role="status">Your order is saved. If WhatsApp did not open, <a href={whatsapp} target="_blank" rel="noreferrer">continue on WhatsApp</a> and press Send.</p>}
    </form>
  </section>;
}
