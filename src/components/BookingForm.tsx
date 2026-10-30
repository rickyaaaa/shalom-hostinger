"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { customerFetch } from "@/lib/customer-client";
import { availableCurrencies, currencyOption, priceView } from "@/lib/currency";
import { money } from "@/lib/format";
import { quoteSchema, type Quote } from "@/lib/customer-types";
import type { CurrencyCode, Tour } from "@/lib/types";
import { earliestTravelDate, isOrderableTravelDate, latestTravelDate, TRAVEL_DATE_CLOSED, TRAVEL_DATE_NOTE } from "@/lib/booking-date";
import { useCurrency } from "./CurrencyProvider";
import { CurrencySelector } from "./CurrencySelector";
import { QuoteCard } from "./QuoteCard";

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
/** INCLUDE / NOT INCLUDING terms from WordPress: the same source as the WhatsApp reconfirmation. */
export type BookingTerms = { not_included: string[]; included: string[] };

/** 1.33 island package: price per person and the optional per-car round-trip shuttle, both in whole IDR from WordPress. */
export type IslandPackage = { personPrice: number; shuttle: { price: number; capacity: number } | null; maxPersons: number };

export type BookingSelection =
  | { kind: "tour"; tourId: number; title: string; area: { slug: string; name: string }; terms?: BookingTerms; pricing: Tour["pricing"]; prices?: Tour["prices"]; price_status?: Tour["price_status"]; island?: IslandPackage }
  | { kind: "custom" };

type TourOrder = { kind: "tour"; tour_id: number; requested_travel_date: string; pickup_place: string; pickup_time: string; currency?: CurrencyCode; cars?: number; persons?: number; shuttle?: boolean };
type CustomOrder = { kind: "custom"; tour_id: 0; requested_travel_date: string; pickup_place: string; pickup_time: string };
type Order = TourOrder | CustomOrder;

type RequestError = Error & { status?: number; code?: string; data?: { quote?: unknown; available?: unknown; status?: number } };

const idr = (amount: number) => `IDR ${amount.toLocaleString("en-US")}`;

/** The same arithmetic WordPress uses, for display only: WordPress calculates and stores the total itself. */
export function islandTotal(island: IslandPackage, persons: number, shuttle: boolean) {
  const cars = shuttle && island.shuttle ? Math.ceil(persons / island.shuttle.capacity) : 0;
  const people = island.personPrice * persons;
  const carsTotal = cars && island.shuttle ? island.shuttle.price * cars : 0;
  return { people, cars, carsTotal, total: people + carsTotal };
}

export function BookingForm({ selection, initialDate }: { selection: BookingSelection; initialDate?: string }) {
  const { currency, multicurrency, error: currencyError } = useCurrency();
  const [date, setDate] = useState(() => initialDate && isOrderableTravelDate(initialDate) ? initialDate : "");
  const [pickupPlace, setPickupPlace] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [stage, setStage] = useState<"edit" | "confirm">("edit");
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

  const available = selection.kind === "tour" ? availableCurrencies(selection) : [];
  // An island package is always quoted in IDR by WordPress, whatever currency the visitor picked.
  const currencyAvailable = selection.kind === "custom" || !multicurrency || Boolean(island) || available.includes(currency);
  const selectedView = selection.kind === "tour" ? priceView(selection, currency) : null;

  // Editing any bound detail invalidates the quote and the ticket. A currency change does the same.
  const bindKey = `${selection.kind === "tour" ? selection.tourId : "custom"}|${currency}|${date}|${pickupPlace}|${pickupTime}|${persons}|${shuttle}`;
  useEffect(() => {
    ticket.current = null;
    setQuote(null);
    setStage("edit");
    setError("");
    setWhatsapp("");
  }, [bindKey]);

  function buildOrder(): Order {
    const details = { requested_travel_date: date, pickup_place: pickupPlace.trim(), pickup_time: pickupTime };
    if (selection.kind === "custom") return { kind: "custom", tour_id: 0, ...details };
    if (island) return { kind: "tour", tour_id: selection.tourId, ...details, persons: Number(persons), shuttle: shuttle && Boolean(island.shuttle) };
    return { kind: "tour", tour_id: selection.tourId, ...details, ...(multicurrency ? { currency, cars: 1 } : {}) };
  }

  function validationError() {
    if (!date) return "Choose the date you want to travel.";
    if (date < earliestTravelDate()) return TRAVEL_DATE_CLOSED;
    if (date > latestTravelDate()) return "Choose a travel date within the next two years.";
    if (!pickupTime) return "Choose your pickup time.";
    if (!pickupPlace.trim()) return "Enter your pickup place or hotel.";
    const people = Number(persons);
    if (island && (!Number.isInteger(people) || people < 1 || people > island.maxPersons)) return `Enter the number of people (1–${island.maxPersons}).`;
    return "";
  }

  function unavailableMessage() {
    if (available.length === 0) return `A ${currency} price is not available for this itinerary. Choose another currency.`;
    const names = available.map(code => currencyOption(code).label).join(" or ");
    return `A ${currency} price is not available for this itinerary. Choose ${names} to continue.`;
  }

  function handleError(reason: unknown) {
    const value = reason as RequestError;
    const code = value.code;
    if (code === "quote_changed") {
      const next = quoteSchema.safeParse(value.data?.quote);
      ticket.current = null;
      // An island package has no quote card: back to the form, whose total shows the price after a reload.
      if (!next.success) { setQuote(null); setStage("edit"); setError(value.message || "The price of this package has changed. Review the new total and order again."); return; }
      setQuote(next.data);
      setStage("confirm");
      setError("The price for this itinerary changed. Review the new price and confirm again.");
      return;
    }
    if (code === "quote_expired") {
      ticket.current = null;
      setQuote(null);
      setStage("edit");
      setError("This price expired. Review the current price and confirm again.");
      return;
    }
    if (code === "currency_unavailable") {
      const offered = Array.isArray(value.data?.available) ? value.data.available.filter((item): item is string => typeof item === "string") : [];
      setError(`${value.message || "This itinerary is not available in the selected currency."}${offered.length ? ` Available: ${offered.join(", ")}.` : ""}`);
      return;
    }
    setError(value.message || "Please try again.");
  }

  async function requestTicket(order: Order) {
    const key = JSON.stringify(order);
    if (ticket.current?.key === key) return Boolean(quote);
    const response = await customerFetch("booking-ticket", order);
    ticket.current = { key, value: response.ticket };
    if (response.quote !== undefined) {
      const parsed = quoteSchema.safeParse(response.quote);
      if (!parsed.success) throw new Error("The price could not be read. Please try again.");
      setQuote(parsed.data);
      setStage("confirm");
      return true;
    }
    return false;
  }

  async function submitInquiry(order: Order, ticketValue: string, quoteId?: string) {
    const result = await customerFetch("inquiries", { ...order, ticket: ticketValue, ...(quoteId ? { quote_id: quoteId } : {}) });
    setWhatsapp(result.whatsapp_url);
    // The inquiry is saved; hand over to WhatsApp, where the customer presses Send themselves.
    window.location.assign(result.whatsapp_url);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || submitting.current || stage === "confirm") return;
    if (!currencyAvailable) { setError(unavailableMessage()); return; }
    const invalid = validationError();
    if (invalid) { setError(invalid); return; }
    submitting.current = true;
    setBusy(true);
    setError("");
    setWhatsapp("");
    const order = buildOrder();
    try {
      const hasQuote = await requestTicket(order);
      if (!hasQuote) {
        if (!ticket.current) throw new Error("The booking ticket could not be created. Please try again.");
        await submitInquiry(order, ticket.current.value);
      }
    } catch (reason) {
      handleError(reason);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  async function confirm() {
    if (busy || submitting.current || !quote) return;
    if (!currencyAvailable) { setError(unavailableMessage()); return; }
    submitting.current = true;
    setBusy(true);
    setError("");
    const order = buildOrder();
    try {
      const key = JSON.stringify(order);
      if (!ticket.current || ticket.current.key !== key) {
        const refreshed = await requestTicket(order);
        if (refreshed) {
          setError("The price was refreshed. Review it and confirm again.");
          return;
        }
        if (!ticket.current) throw new Error("The booking ticket could not be created. Please try again.");
      }
      await submitInquiry(order, ticket.current.value, quote.id);
    } catch (reason) {
      handleError(reason);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  function changeDetails() {
    ticket.current = null;
    setQuote(null);
    setStage("edit");
    setError("");
  }

  const disabled = busy || stage === "confirm";
  const selectedCurrencyName = currencyOption(currency).label;
  const submitLabel = multicurrency && selection.kind === "tour" ? "Review price" : "Order Now";

  return <>
    <p className="customer-intro">Choose your travel date and pickup details. We&apos;ll save your order and open WhatsApp with a message for you to send.</p>
    <div className="booking-selected" role="group" aria-labelledby="selected-itinerary-label">
      <p className="booking-selected-label" id="selected-itinerary-label">Selected Itinerary</p>
      {selection.kind === "tour" ? <>
        <p className="booking-selected-title">{selection.title}</p>
        <p className="booking-selected-meta">{selection.area.name}</p>
        {multicurrency && selectedView?.kind === "available" && currencyAvailable && <p className="booking-selected-price"><strong>{money(selectedView.current, selectedView.currency)}</strong>{selectedView.perCar ? " per car" : ""} · {selectedCurrencyName}</p>}
        <a className="booking-selected-change" href={`/${selection.area.slug}#tour-packages`}>Choose a different itinerary</a>
      </> : <>
        <p className="booking-selected-title">Customized Itinerary</p>
        <p className="booking-selected-meta">Your own plan, arranged with our Customer Service.</p>
      </>}
    </div>
    {selection.kind === "tour" && multicurrency && <div className="booking-currency"><CurrencySelector id="currency-booking" variant="inline" /></div>}
    {selection.kind === "tour" && selection.terms && <BookingTermsBlock terms={selection.terms} />}
    <form className="booking-search-form" onSubmit={submit} noValidate>
      <div className="booking-search-fields">
        <label className="booking-search-field">Travel Date<input type="date" value={date} min={earliest} max={latest} onChange={event => setDate(event.target.value)} required aria-describedby="travel-date-note" disabled={disabled} /><span className="field-help" id="travel-date-note">{TRAVEL_DATE_NOTE}</span></label>
        <label className="booking-search-field">Pickup Time<input type="time" value={pickupTime} step={900} onChange={event => setPickupTime(event.target.value)} required disabled={disabled} /><span className="field-help">Local Bali time.</span></label>
        <label className="booking-search-field booking-search-field-wide">Pickup Place / Hotel<input type="text" value={pickupPlace} maxLength={200} autoComplete="off" placeholder="e.g. Svara by Mazari, Uluwatu" onChange={event => setPickupPlace(event.target.value)} required disabled={disabled} /></label>
        {island && <>
          <label className="booking-search-field">Number of People<input type="number" inputMode="numeric" min={1} max={island.maxPersons} step={1} value={persons} onChange={event => setPersons(event.target.value)} required disabled={disabled} /><span className="field-help">{idr(island.personPrice)} per person.</span></label>
          {island.shuttle && <label className="booking-search-field booking-shuttle"><span><input type="checkbox" checked={shuttle} onChange={event => setShuttle(event.target.checked)} disabled={disabled} /> Hotel shuttle (round trip)</span><span className="field-help">{idr(island.shuttle.price)} per car, up to {island.shuttle.capacity} people per car.</span></label>}
        </>}
      </div>
      {island && <IslandTotal island={island} persons={Number(persons)} shuttle={shuttle} />}
      {!currencyAvailable && <p className="customer-error booking-search-error" role="alert">{unavailableMessage()}</p>}
      {currencyError && <p className="customer-error booking-search-error" role="alert">{currencyError}</p>}
      {quote && stage === "confirm"
        ? <QuoteCard quote={quote} title={selection.kind === "tour" ? selection.title : "Customized Itinerary"} travelDate={date} pickupPlace={pickupPlace.trim()} pickupTime={pickupTime} busy={busy} onConfirm={() => { void confirm(); }} onChange={changeDetails} />
        : <button className="button booking-search-submit" type="submit" disabled={busy || !currencyAvailable}>{busy ? "Saving your order…" : <>{submitLabel} <span aria-hidden="true">→</span></>}</button>}
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
