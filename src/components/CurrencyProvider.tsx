"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { customerFetch } from "@/lib/customer-client";
import { currencyPreferenceSchema } from "@/lib/customer-types";
import { DEFAULT_CURRENCY, isCurrencyCode, resolveCurrency } from "@/lib/currency";
import type { CurrencyCapability, CurrencyCode } from "@/lib/types";
import { useCustomerSession } from "./CustomerSession";

const STORAGE_KEY = "shalom_currency";

type CurrencyContextValue = {
  capability: CurrencyCapability | null;
  supported: CurrencyCode[];
  multicurrency: boolean;
  currency: CurrencyCode;
  saving: boolean;
  error: string;
  setCurrency: (currency: CurrencyCode) => Promise<void>;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function readStored(): CurrencyCode | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return isCurrencyCode(value) ? value : null;
  } catch {
    return null;
  }
}

function writeStored(currency: CurrencyCode) {
  try {
    window.localStorage.setItem(STORAGE_KEY, currency);
  } catch {
    // Private mode / storage disabled: the in-memory selection still works.
  }
}

export function CurrencyProvider({ initial, children }: { initial: CurrencyCapability | null; children: ReactNode }) {
  const { account, loading, guest } = useCustomerSession();
  const capability = initial;
  const supported = useMemo(() => capability?.enabled ? capability.supported : [], [capability]);
  const multicurrency = Boolean(capability?.enabled && supported.length > 1);
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const request = useRef(0);
  const appliedPreference = useRef("");
  const accountId = account?.customer.id ?? null;

  useEffect(() => {
    const stored = readStored();
    if (stored && (!capability || supported.includes(stored))) setCurrencyState(stored);
  }, [capability, supported]);

  useEffect(() => {
    // Invalidate any preference save that belonged to the previous session/account.
    request.current += 1;
    setSaving(false);
    if (loading) return;
    // Logout / guest: restore only the guest's own browser choice, never a previous account's preference.
    if (accountId === null && guest) {
      appliedPreference.current = "";
      setCurrencyState(resolveCurrency(null, readStored()));
      setError("");
      return;
    }
    if (accountId === null || !multicurrency) return;
    const preference = account?.currency_preference ?? null;
    const key = `${accountId}:${preference?.source ?? "none"}:${preference?.currency ?? ""}:${preference?.recommended ?? ""}:${preference?.updated_at ?? ""}`;
    if (appliedPreference.current === key) return;
    appliedPreference.current = key;
    // Explicit backend preference wins; otherwise the backend recommendation wins, even if this
    // browser previously held another account's guest selection.
    setCurrencyState(resolveCurrency(preference, null));
    setError("");
  }, [accountId, account?.currency_preference, guest, loading, multicurrency]);

  const setCurrency = useCallback(async (next: CurrencyCode) => {
    if (!multicurrency || !supported.includes(next) || next === currency) return;
    const previous = currency;
    const id = ++request.current;
    setError("");
    setCurrencyState(next);
    // Only a confirmed guest selection is browser-persisted. Signed-in choices live in WordPress
    // and must not be written into the guest bucket used by the next account on this browser.
    if (!account) {
      if (guest && !loading) writeStored(next);
      return;
    }
    setSaving(true);
    try {
      const preference = currencyPreferenceSchema.parse(await customerFetch("currency", { currency: next }));
      if (request.current !== id) return;
      setCurrencyState(preference.currency);
    } catch (reason) {
      if (request.current !== id) return;
      setCurrencyState(previous);
      setError(reason instanceof Error ? reason.message : "Your currency preference could not be saved.");
    } finally {
      if (request.current === id) setSaving(false);
    }
  }, [account, currency, guest, loading, multicurrency, supported]);

  return <CurrencyContext.Provider value={{ capability, supported, multicurrency, currency, saving, error, setCurrency }}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const value = useContext(CurrencyContext);
  if (!value) throw new Error("CurrencyProvider is required.");
  return value;
}
