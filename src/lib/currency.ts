import type { CurrencyCode, Tour } from "./types";

export const DEFAULT_CURRENCY: CurrencyCode = "USD";
export type CurrencyPreferenceLike = { currency: CurrencyCode; source: "explicit" | "recommended" | "default"; recommended: CurrencyCode };

/** Auth preference is authoritative; guest/local selection is only used when there is no signed-in preference. */
export function resolveCurrency(preference: CurrencyPreferenceLike | null | undefined, stored: CurrencyCode | null): CurrencyCode {
  if (preference?.source === "explicit") return preference.currency;
  if (preference) return preference.recommended;
  return stored ?? DEFAULT_CURRENCY;
}
export const CURRENCY_OPTIONS: ReadonlyArray<{ code: CurrencyCode; label: string; name: string }> = [
  { code: "USD", label: "USD", name: "US Dollar" },
  { code: "EUR", label: "EUR", name: "Euro" },
  { code: "IDR", label: "IDR", name: "Indonesian Rupiah" },
];

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return value === "USD" || value === "EUR" || value === "IDR";
}

export function currencyOption(code: CurrencyCode) {
  return CURRENCY_OPTIONS.find(option => option.code === code) ?? CURRENCY_OPTIONS[0];
}

export type TourPriceView =
  | { kind: "available"; currency: string | null; regular: number | null; sale: number | null; current: number; discounted: boolean; perCar: boolean; rateDate: string | null; rateStatus: "ok" | "stale" }
  | { kind: "unavailable"; currency: CurrencyCode }
  | { kind: "none"; currency: string | null };

export type PriceSource = Pick<Tour, "pricing" | "price_status" | "prices">;

/** Server amounts only. This function never converts; it selects one backend-provided value. */
export function priceView(tour: PriceSource, currency: CurrencyCode): TourPriceView {
  if (tour.prices) {
    const row = tour.prices.amounts[currency];
    if (!row || row.regular === null || row.status === "unavailable") return { kind: "unavailable", currency };
    const current = row.sale ?? row.regular;
    return {
      kind: "available",
      currency,
      regular: row.regular,
      sale: row.sale,
      current,
      discounted: row.sale !== null && row.regular !== null && row.sale < row.regular,
      perCar: tour.price_status === "converted",
      rateDate: tour.prices.rate_date,
      rateStatus: row.status === "stale" ? "stale" : "ok",
    };
  }
  const regular = tour.pricing.regular;
  const sale = tour.pricing.sale;
  const current = sale ?? regular;
  if (current === null) return { kind: "none", currency: tour.pricing.currency };
  return {
    kind: "available",
    currency: tour.pricing.currency,
    regular,
    sale,
    current,
    discounted: sale !== null && regular !== null && sale < regular,
    perCar: false,
    rateDate: null,
    rateStatus: "ok",
  };
}

export function tourPriceView(tour: Tour, currency: CurrencyCode): TourPriceView {
  return priceView(tour, currency);
}

/** Currencies the backend actually priced for this Tour. Never inferred from today's rate. */
export function availableCurrencies(tour: PriceSource): CurrencyCode[] {
  if (tour.prices) {
    return (Object.keys(tour.prices.amounts) as CurrencyCode[]).filter(code => {
      const row = tour.prices?.amounts[code];
      return Boolean(row && row.regular !== null && row.status !== "unavailable");
    });
  }
  const code = tour.pricing.currency;
  return isCurrencyCode(code) ? [code] : [];
}

export function rateDateLabel(date: string | null): string {
  if (!date) return "";
  const value = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(value.valueOf())) return "";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(value);
}
