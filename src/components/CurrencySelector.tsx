"use client";

import { CURRENCY_OPTIONS } from "@/lib/currency";
import { useCurrency } from "./CurrencyProvider";

type Props = {
  id: string;
  variant?: "header" | "menu" | "inline";
  label?: string;
};

type ViewProps = Props & {
  currency: string;
  supported: string[];
  saving: boolean;
  error: string;
  onChange: (currency: string) => void;
};

export function CurrencySelectorView({ id, variant = "header", label = "Currency", currency, supported, saving, error, onChange }: ViewProps) {
  if (supported.length < 2) return null;
  const options = CURRENCY_OPTIONS.filter(option => supported.includes(option.code));
  const helpId = `${id}-status`;
  return <div className={`currency-switcher currency-switcher-${variant}`}>
    <label htmlFor={id} className="currency-switcher-label">{label}</label>
    <select
      id={id}
      value={currency}
      disabled={saving}
      onChange={event => onChange(event.target.value)}
      aria-describedby={helpId}
      aria-label={`${label} for displayed prices`}
      className="currency-switcher-select"
    >
      {options.map(option => <option key={option.code} value={option.code} aria-label={`${option.code} — ${option.name}`}>{variant === "header" ? option.code : `${option.code} — ${option.name}`}</option>)}
    </select>
    <span id={helpId} className={`currency-switcher-status${error ? " is-error" : ""}`} role="status" aria-live="polite">
      {saving ? "Saving…" : error || ""}
    </span>
  </div>;
}

/** Compact native select; no flags, no client-side conversion. Hidden unless WordPress enables >1 currency. */
export function CurrencySelector({ id, variant = "header", label = "Currency" }: Props) {
  const { currency, supported, multicurrency, saving, error, setCurrency } = useCurrency();
  if (!multicurrency) return null;
  return <CurrencySelectorView id={id} variant={variant} label={label} currency={currency} supported={supported} saving={saving} error={error} onChange={value => { void setCurrency(value as typeof currency); }} />;
}

