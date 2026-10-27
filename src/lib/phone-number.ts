// Phone numbers for sign-in and sign-up, prepared in the browser before WordPress normalizes them again.
// WordPress reads a local number ("0812…") only in the region it is given, so an Indonesian visitor whose phone is
// set to, say, English (United States) could not use one; and it rejects the invisible characters that numbers
// copied from WhatsApp or Contacts carry. Both forms share these rules, and the bundled libphonenumber build.
type ParsedPhone = { isValid(): boolean; number: string; country?: string };
export type PhoneLibrary = { parsePhoneNumberFromString(value: string, region?: string): ParsedPhone | undefined };

const separators = /[\s().-]/g;
/** Unicode spaces become plain spaces; direction marks, zero-width characters and BOMs are removed. */
export const cleanPhoneText = (value: string) => value.replace(/[  -   　]/g, " ").replace(/[​-‏‪-‮⁠-⁤﻿]/g, "").trim();
export const isLocalPhone = (value: string) => !value.includes("@") && /^0[1-9][0-9]{5,14}$/.test(cleanPhoneText(value).replace(separators, ""));

/**
 * The sign-up phone field as typed. It starts with "+"; a leading 0 is a local number ("0812…", or "00…"
 * international), so it is kept without "+" rather than becoming "+0812…", which no country accepts.
 */
export function phoneFieldValue(value: string) {
  const text = cleanPhoneText(value);
  const digits = text.replace(/\D/g, "");
  return digits.startsWith("0") || (!text.startsWith("+") && digits) ? digits : "+" + digits;
}

/** The visitor's region from the browser language ("en-US" → "US"); Indonesia when it names none, as in WordPress. */
export function browserRegion() {
  if (typeof navigator === "undefined") return "ID";
  const region = navigator.language.split("-")[1]?.toUpperCase();
  return region && /^[A-Z]{2}$/.test(region) ? region : "ID";
}

/**
 * E.164 for a valid number, null otherwise. The same order as WordPress normalize_phone: "+…" and "00…" as written;
 * other digits as international first, then in `region`. A local number (one leading 0) is read in `region`, then
 * in Indonesia, so it never depends on the phone's language alone.
 */
export function normalizePhone(value: string, region: string, library: PhoneLibrary) {
  const compact = cleanPhoneText(value).replace(separators, "");
  const valid = (number: string, country?: string) => {
    try { const parsed = library.parsePhoneNumberFromString(number, country); return parsed?.isValid() ? parsed.number : null; } catch { return null; }
  };
  if (/^\+[0-9]{6,17}$/.test(compact)) return valid(compact);
  if (/^00[1-9][0-9]{5,15}$/.test(compact)) return valid("+" + compact.slice(2));
  if (/^[1-9][0-9]{5,16}$/.test(compact)) return valid("+" + compact) ?? valid(compact, region);
  if (isLocalPhone(compact)) { for (const country of new Set([region, "ID"])) { const number = valid(compact, country); if (number) return number; } }
  return null;
}

/** A sign-in identifier ready to send: emails trimmed; phones cleaned, and local numbers resolved when the library is at hand. */
export function prepareLoginIdentifier(identifier: string, region: string, library: PhoneLibrary | null) {
  if (identifier.includes("@")) return identifier.trim();
  const phone = cleanPhoneText(identifier);
  return library && isLocalPhone(phone) ? normalizePhone(phone, region, library) ?? phone : phone;
}

const LIBRARY_SRC = "/vendor/libphonenumber-max.js";
let loading: Promise<PhoneLibrary | null> | undefined;
/** The bundled libphonenumber build (already on the page, or fetched once on demand); null if it cannot load. */
export function loadPhoneLibrary(): Promise<PhoneLibrary | null> {
  const current = () => (window as { libphonenumber?: PhoneLibrary }).libphonenumber ?? null;
  if (current()) return Promise.resolve(current());
  return loading ??= new Promise(resolve => {
    const script = document.createElement("script");
    const done = (library: PhoneLibrary | null) => { clearTimeout(timer); if (!library) loading = undefined; resolve(library); };
    const timer = setTimeout(() => done(null), 5000);
    script.src = LIBRARY_SRC; script.async = true;
    script.onload = () => done(current());
    script.onerror = () => done(null);
    document.head.append(script);
  });
}
