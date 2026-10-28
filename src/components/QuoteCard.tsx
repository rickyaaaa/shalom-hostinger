"use client";

import { money } from "@/lib/format";
import { rateDateLabel } from "@/lib/currency";
import type { Quote } from "@/lib/customer-types";

type Props = {
  quote: Quote;
  title: string;
  travelDate: string;
  pickupPlace: string;
  pickupTime: string;
  busy: boolean;
  onConfirm: () => void;
  onChange: () => void;
};

function rate(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
}

export function QuoteCard({ quote, title, travelDate, pickupPlace, pickupTime, busy, onConfirm, onChange }: Props) {
  const date = travelDate ? new Date(`${travelDate}T00:00:00Z`) : null;
  const travel = date && !Number.isNaN(date.valueOf())
    ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(date)
    : "";
  return <section className="quote-card" aria-labelledby="quote-card-title" data-quote-id={quote.id} data-quote-currency={quote.currency}>
    <p className="booking-selected-label">Your price</p>
    <h2 id="quote-card-title">Confirm before WhatsApp</h2>
    <p className="quote-card-route">{title}{travel ? ` · ${travel}` : ""}</p>
    <dl className="quote-card-details">
      <div><dt>Price</dt><dd>{quote.regular_amount > quote.amount && <del>{money(quote.regular_amount, quote.currency)}</del>}<strong>{money(quote.amount, quote.currency)}</strong>{quote.per_car ? " per car" : ""}</dd></div>
      {quote.cars > 1 && <div><dt>Cars</dt><dd>{quote.cars}</dd></div>}
      <div><dt>Pickup</dt><dd>{pickupPlace || "Not provided"}{pickupTime ? ` · ${pickupTime}` : ""}</dd></div>
      {quote.currency !== "IDR" && quote.base_idr !== null && <div><dt>Base</dt><dd>{money(quote.base_idr, "IDR")}{quote.per_car ? " per car" : ""}</dd></div>}
      {quote.currency !== "IDR" && quote.idr_per_unit !== null && <div><dt>Rate</dt><dd>1 {quote.currency} = IDR {rate(quote.idr_per_unit)}{quote.rate_date ? ` · ${rateDateLabel(quote.rate_date)}` : ""} · {quote.rate_source}</dd></div>}
    </dl>
    {quote.status === "stale" && <p className="quote-card-note">Estimated price — the latest daily rate is from {rateDateLabel(quote.rate_date) || "an earlier date"}.</p>}
    {quote.currency !== "IDR" && <p className="quote-card-note">Indicative price. The final amount is confirmed by Shalom Bali Tour on WhatsApp.</p>}
    <div className="quote-card-actions">
      <button className="button" type="button" onClick={onConfirm} disabled={busy}>{busy ? "Saving your order…" : "Confirm price & continue"}</button>
      <button className="button button-outline" type="button" onClick={onChange} disabled={busy}>Change details</button>
    </div>
  </section>;
}
