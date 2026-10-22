"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCustomerSession } from "./CustomerSession";

const destinations = [
  { label: "South Kuta", path: "/south-kuta" },
  { label: "Ubud", path: "/ubud" },
  { label: "West Bali", path: "/west-bali" },
];

export function BookingSearch({ initialDestination, initialDate }: { initialDestination?: string; initialDate?: string }) {
  const { account, guest, loading } = useCustomerSession();
  const router = useRouter();
  const [destination, setDestination] = useState(initialDestination ?? "");
  const [date, setDate] = useState(initialDate ?? "");
  const [error, setError] = useState("");

  if (loading || guest || !account) return null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!destination) { setError("Choose a destination to continue."); return; }
    if (!date) { setError("Choose the date you want your tour to take place."); return; }
    setError("");
    const target = destination === "/#customizedtour" ? `/book/custom?requested_travel_date=${encodeURIComponent(date)}` : `${destination}?requested_travel_date=${encodeURIComponent(date)}#tour-packages`;
    router.push(target);
  }

  return <section className="booking-search" aria-labelledby="booking-search-title">
    <div className="booking-search-copy"><p className="section-label">PLAN YOUR DAY IN BALI</p><h2 id="booking-search-title">Where would you like to go?</h2><p>Choose a destination and the date you want your tour to happen. We&apos;ll keep the date with your inquiry.</p></div>
    <form className="booking-search-form" onSubmit={submit}>
      <div className="booking-search-fields">
        <label className="booking-search-field">Destination<select value={destination} onChange={event => setDestination(event.target.value)} required><option value="">Choose a destination</option>{destinations.map(item => <option key={item.path} value={item.path}>{item.label}</option>)}<option value="/#customizedtour">Customized Tour</option></select></label>
        <label className="booking-search-field">Travel date<input type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={event => setDate(event.target.value)} required /><span className="field-help">The day you want to take the tour.</span></label>
      </div>
      <button className="button booking-search-submit" type="submit">Order Now <span aria-hidden="true">→</span></button>
      {error && <p className="customer-error booking-search-error" role="alert">{error}</p>}
    </form>
  </section>;
}
