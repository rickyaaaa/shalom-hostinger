"use client";

import { useRef, useState, type FormEvent } from "react";
import { customerFetch } from "@/lib/customer-client";
import { earliestTravelDate, isOrderableTravelDate, latestTravelDate, TRAVEL_DATE_CLOSED, TRAVEL_DATE_NOTE } from "@/lib/booking-date";

export const areas = [
  { label: "South Kuta", slug: "south-kuta" },
  { label: "Ubud", slug: "ubud" },
  { label: "West Bali & North Bali", slug: "west-bali" },
];
export type Package = { id: number; title: string };

/**
 * What is being ordered, fixed by the page that renders the form: a canonical itinerary resolved
 * server-side from the /book/<id> route, or a Customized Itinerary request. It is never editable here.
 */
/** INCLUDE / NOT INCLUDING terms from WordPress: the same source the WhatsApp reconfirmation uses. */
export type BookingTerms = { not_included: string[]; included: string[] };

/** 1.33 island package: price per person and the optional per-car round-trip shuttle, both in whole IDR from WordPress. */
export type IslandPackage = { personPrice: number; shuttle: { price: number; capacity: number } | null; maxPersons: number };

export type BookingSelection =
  | { kind: "tour"; tourId: number; title: string; area: { slug: string; name: string }; terms?: BookingTerms; island?: IslandPackage }
  | { kind: "custom" };

const idr = (amount: number) => `IDR ${amount.toLocaleString("en-US")}`;

/** The same arithmetic WordPress uses, for display only: WordPress calculates and stores the total itself. */
export function islandTotal(island: IslandPackage, persons: number, shuttle: boolean) {
  const cars = shuttle && island.shuttle ? Math.ceil(persons / island.shuttle.capacity) : 0;
  const people = island.personPrice * persons;
  const carsTotal = cars && island.shuttle ? island.shuttle.price * cars : 0;
  return { people, cars, carsTotal, total: people + carsTotal };
}

export function BookingForm({ selection, initialDate }: { selection: BookingSelection; initialDate?: string }) {
  const [date, setDate] = useState(() => initialDate && isOrderableTravelDate(initialDate) ? initialDate : "");
  const [pickupPlace, setPickupPlace] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const island = selection.kind === "tour" ? selection.island : undefined;
  const [persons, setPersons] = useState("2");
  const [shuttle, setShuttle] = useState(Boolean(island?.shuttle));
  // A ticket is bound to the exact order details; any change requests a new one.
  const ticket = useRef<{ key: string; value: string } | null>(null);
  // Synchronous guard: two submits in one tick both still see busy === false.
  const submitting = useRef(false);
  // Bali clock, not the device's: recomputed on every render so a page left open past 20:00 Bali time updates.
  const earliest = earliestTravelDate();
  const latest = latestTravelDate();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!date) { setError("Choose the date you want to travel."); return; }
    // WordPress re-checks this rule; the early message just saves a round trip.
    if (date < earliestTravelDate()) { setError(TRAVEL_DATE_CLOSED); return; }
    if (date > latestTravelDate()) { setError("Choose a travel date within the next two years."); return; }
    if (!pickupTime) { setError("Choose your pickup time."); return; }
    if (!pickupPlace.trim()) { setError("Enter your pickup place or hotel."); return; }
    const people = Number(persons);
    if (island && (!Number.isInteger(people) || people < 1 || people > island.maxPersons)) { setError(`Enter the number of people (1–${island.maxPersons}).`); return; }
    const details = { requested_travel_date: date, pickup_place: pickupPlace.trim(), pickup_time: pickupTime, ...(island ? { persons: people, shuttle: shuttle && Boolean(island.shuttle) } : {}) };
    // Fixed itinerary → Marketing WhatsApp; Customized Itinerary → Customer Service. WordPress picks the number
    // and resolves title, area and price from the canonical Tour ID.
    const order = selection.kind === "custom" ? { kind: "custom" as const, tour_id: 0 as const, ...details } : { kind: "tour" as const, tour_id: selection.tourId, ...details };
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
      // A changed package price (409) needs a fresh ticket with the new total; any other failure keeps the ticket for a safe retry.
      if ((reason as { status?: number })?.status === 409 && reason instanceof Error && /price/i.test(reason.message)) ticket.current = null;
      setError(reason instanceof Error ? reason.message : "Please try again.");
    } finally { submitting.current = false; setBusy(false); }
  }

  return <>
    <p className="customer-intro">Choose your travel date and pickup details. We&apos;ll save your order and open WhatsApp with a message for you to send.</p>
    <div className="booking-selected" role="group" aria-labelledby="selected-itinerary-label">
      <p className="booking-selected-label" id="selected-itinerary-label">Selected Itinerary</p>
      {selection.kind === "tour" ? <>
        <p className="booking-selected-title">{selection.title}</p>
        <p className="booking-selected-meta">{selection.area.name}</p>
        <a className="booking-selected-change" href={`/${selection.area.slug}#tour-packages`}>Choose a different itinerary</a>
      </> : <>
        <p className="booking-selected-title">Customized Itinerary</p>
        <p className="booking-selected-meta">Your own plan, arranged with our Customer Service.</p>
      </>}
    </div>
    {selection.kind === "tour" && selection.terms && <BookingTermsBlock terms={selection.terms} />}
    <form className="booking-search-form" onSubmit={submit} noValidate>
      <div className="booking-search-fields">
        <label className="booking-search-field">Travel Date<input type="date" value={date} min={earliest} max={latest} onChange={event => setDate(event.target.value)} required aria-describedby="travel-date-note" /><span className="field-help" id="travel-date-note">{TRAVEL_DATE_NOTE}</span></label>
        <label className="booking-search-field">Pickup Time<input type="time" value={pickupTime} step={900} onChange={event => setPickupTime(event.target.value)} required /><span className="field-help">Local Bali time.</span></label>
        <label className="booking-search-field booking-search-field-wide">Pickup Place / Hotel<input type="text" value={pickupPlace} maxLength={200} autoComplete="off" placeholder="e.g. Svara by Mazari, Uluwatu" onChange={event => setPickupPlace(event.target.value)} required /></label>
        {island && <>
          <label className="booking-search-field">Number of People<input type="number" inputMode="numeric" min={1} max={island.maxPersons} step={1} value={persons} onChange={event => setPersons(event.target.value)} required /><span className="field-help">{idr(island.personPrice)} per person.</span></label>
          {island.shuttle && <label className="booking-search-field booking-shuttle"><span><input type="checkbox" checked={shuttle} onChange={event => setShuttle(event.target.checked)} /> Hotel shuttle (round trip)</span><span className="field-help">{idr(island.shuttle.price)} per car, up to {island.shuttle.capacity} people per car.</span></label>}
        </>}
      </div>
      {island && <IslandTotal island={island} persons={Number(persons)} shuttle={shuttle} />}
      <button className="button booking-search-submit" type="submit" disabled={busy}>{busy ? "Saving your order…" : <>Order Now <span aria-hidden="true">→</span></>}</button>
      {error && <p className="customer-error booking-search-error" role="alert">{error}</p>}
      {whatsapp && <p className="customer-notice" role="status">Your order is saved. If WhatsApp did not open, <a href={whatsapp} target="_blank" rel="noreferrer">continue on WhatsApp</a> and press Send.</p>}
    </form>
  </>;
}

/** The total before ordering, from WordPress's prices. WordPress recalculates it and stores it on the order. */
function IslandTotal({ island, persons, shuttle }: { island: IslandPackage; persons: number; shuttle: boolean }) {
  if (!Number.isInteger(persons) || persons < 1 || persons > island.maxPersons) return null;
  const { people, cars, carsTotal, total } = islandTotal(island, persons, shuttle);
  return <dl className="booking-island-total" aria-live="polite">
    <div><dt>{idr(island.personPrice)} × {persons} {persons === 1 ? "person" : "people"}</dt><dd>{idr(people)}</dd></div>
    {cars > 0 && island.shuttle && <div><dt>Hotel shuttle, round trip{cars > 1 ? ` (${cars} cars)` : ""}</dt><dd>{idr(carsTotal)}</dd></div>}
    <div className="booking-island-sum"><dt>Total</dt><dd>{idr(total)}</dd></div>
  </dl>;
}

/** What a fixed itinerary includes and excludes, shown before the customer orders. */
function BookingTermsBlock({ terms }: { terms: BookingTerms }) {
  // Headings follow the client's NB wording (rendered uppercase), matching the WhatsApp reconfirmation.
  const lists = [{ key: "excluded", title: "Not including", items: terms.not_included }, { key: "included", title: "Include", items: terms.included }].filter(list => list.items.length);
  if (!lists.length) return null;
  return <section className="booking-terms" aria-labelledby="booking-terms-title">
    <h2 id="booking-terms-title">Important Information</h2>
    <div className="booking-terms-lists">{lists.map(list => <div key={list.key} className={`booking-terms-list booking-terms-${list.key}`}>
      <h3>{list.title}</h3>
      <ul>{list.items.map((item, i) => <li key={i}>{item}</li>)}</ul>
    </div>)}</div>
  </section>;
}
