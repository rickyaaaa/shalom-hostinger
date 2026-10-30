"use client";

import { money } from "@/lib/format";
import { rateDateLabel, tourPriceView, type TourPriceView as View } from "@/lib/currency";
import { useCurrency } from "./CurrencyProvider";
import type { CurrencyCode, Tour } from "@/lib/types";

/** Backend-selected amount for one currency. No conversion or rate fetching happens here. */
export function TourPriceView({ tour, currency }: { tour: Tour; currency: CurrencyCode }) {
  const view: View = tourPriceView(tour, currency);
  if (view.kind === "none") return <p><strong>Contact for price</strong></p>;
  if (view.kind === "unavailable") return <p className="price-unavailable"><strong>Price unavailable in {currency}</strong><span className="price-unit">Choose another currency</span></p>;
  const rate = view.perCar && currency !== "IDR" && view.rateDate
    ? `${view.rateStatus === "stale" ? "Estimated price" : "Indicative price"} \u00b7 rate ${rateDateLabel(view.rateDate)}`
    : "";
  return <>
    <p>
      {view.discounted && view.regular !== null && <del>{money(view.regular, view.currency)}</del>}
      <strong>{money(view.current, view.currency)}</strong>
      {view.perCar && <span className="price-unit">per car</span>}
      {!view.perCar && !view.currency && <span className="currency-missing">Currency not specified</span>}
      {tour.duration && <span className="tour-duration">/ {tour.duration}</span>}
    </p>
    {rate && <span className="currency-rate-note">{rate}</span>}
  </>;
}

/** Active-currency wrapper. The same backend amounts feed the card in every currency. */
export function TourPrice({ tour }: { tour: Tour }) {
  const { currency } = useCurrency();
  return <TourPriceView tour={tour} currency={currency} />;
}
