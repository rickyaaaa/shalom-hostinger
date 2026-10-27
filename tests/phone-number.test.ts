import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { cleanPhoneText, isLocalPhone, loadPhoneLibrary, normalizePhone, phoneFieldValue, prepareLoginIdentifier, type PhoneLibrary } from "../src/lib/phone-number";
import { loginInput, registerInput } from "../src/lib/customer-types";

// The same bundled libphonenumber build the browser loads from /vendor.
const sandbox: { libphonenumber?: PhoneLibrary } = {};
vm.runInNewContext(readFileSync(new URL("../public/vendor/libphonenumber-max.js", import.meta.url), "utf8"), sandbox);
const library = sandbox.libphonenumber!;
const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

// Expected values are what the plugin's own normalize_phone() returns (1.14–1.28), plus the Indonesian fallback for local numbers.
test("Normalization matches WordPress for international numbers, with or without +", () => {
  const cases: [string, string, string][] = [
    ["+6281234567890", "US", "+6281234567890"], ["6281234567890", "US", "+6281234567890"], ["62 812-3456-7890", "GB", "+6281234567890"],
    ["0062 81234567890", "AU", "+6281234567890"], ["+62 0812 3456 7890", "ID", "+6281234567890"],
    ["+447911123456", "ID", "+447911123456"], ["447911123456", "ID", "+447911123456"], ["61412345678", "ID", "+61412345678"],
    ["+12025550123", "ID", "+12025550123"], ["12025550123", "ID", "+12025550123"], ["6591234567", "ID", "+6591234567"],
    ["2025550123", "US", "+12025550123"], // US national digits, read in the visitor's region as WordPress does
  ];
  for (const [value, region, expected] of cases) assert.equal(normalizePhone(value, region, library), expected, `${value} (${region})`);
});

test("Indonesian local numbers resolve to +62 whatever region the phone's language names", () => {
  for (const region of ["ID", "US", "GB", "AU", "SG", "ZZ"]) {
    for (const value of ["081234567890", "0812-3456-7890", " 0812 3456 7890 "]) assert.equal(normalizePhone(value, region, library), "+6281234567890", `${value} (${region})`);
  }
});

test("Other countries' local numbers follow the visitor's own region and are never assumed Indonesian", () => {
  assert.equal(normalizePhone("07911 123456", "GB", library), "+447911123456");
  assert.equal(normalizePhone("0412 345 678", "AU", library), "+61412345678");
  // Not valid in the visitor's region (US) nor in Indonesia: no guess is made.
  assert.equal(normalizePhone("0412345678", "US", library), null);
  assert.equal(normalizePhone("07911123456", "US", library), null);
});

test("Invalid numbers are rejected rather than guessed", () => {
  for (const value of ["", "+", "0812", "+081234567890", "+0812 3456 7890", "12345", "0000000000", "+99912345678", "08123456789012345", "phone"]) {
    assert.equal(normalizePhone(value, "ID", library), null, JSON.stringify(value));
  }
});

test("Every spelling of one number is the same account, so sign-up cannot create a duplicate", () => {
  const spellings = ["+6281277000093", "6281277000093", "081277000093", "0812-7700-0093", "+62 812 7700 0093", "0062 812 7700 0093", "‪+62 812-7700-0093‬"];
  assert.deepEqual(new Set(spellings.map(value => normalizePhone(value, "US", library))), new Set(["+6281277000093"]));
});

test("Invisible characters copied from WhatsApp or Contacts are removed (WordPress rejects them)", () => {
  assert.equal(cleanPhoneText("62 812 7700 0093"), "62 812 7700 0093");
  assert.equal(cleanPhoneText("‪+62 812-7700-0093‬"), "+62 812-7700-0093");
  assert.equal(cleanPhoneText("6281277​000093"), "6281277000093");
  assert.equal(cleanPhoneText("62 812 77000093"), "62 812 77000093");
  assert.equal(cleanPhoneText("﻿6281277000093"), "6281277000093");
});

test("Sign-up phone field keeps a local number local instead of prefixing +", () => {
  const cases: [string, string][] = [
    ["+", "+"], ["", "+"], ["+6", "+6"], ["+62 812-3456", "+628123456"],
    ["+0", "0"], ["+0812 3456 7890", "081234567890"], ["0812", "0812"],
    ["6281234567890", "6281234567890"], ["0062 812", "0062812"],
    ["‪+62 812-7700-0093‬", "+6281277000093"], ["(0812) 3456.7890", "081234567890"],
  ];
  for (const [input, shown] of cases) assert.equal(phoneFieldValue(input), shown, JSON.stringify(input));
  const field = source("../src/components/PhoneInput.tsx");
  assert.ok(field.includes('pattern="\\+?[0-9]{6,18}"'), "the field accepts numbers without +");
  assert.ok(field.includes("onChange={event=>setPhone(phoneFieldValue(event.target.value))}"));
});

test("Sign-up submits the normalized number; the form contract and customer-type choice are unchanged", () => {
  const form = source("../src/components/AuthForm.tsx");
  assert.match(form, /data\.phone = \(library && normalizePhone\(phone, browserRegion\(\), library\)\) \|\| phone;/);
  for (const part of ['name="customer_type" value="new_customer"', 'name="customer_type" value="existing_customer"', 'name="terms" type="checkbox" value="1"']) assert.ok(form.includes(part), part);
  const signup = { full_name: "Harry", phone: "+6281234567890", phone_region_hint: "ID", email: "harry@example.com", password: "LongEnough1", confirm_password: "LongEnough1", customer_type: "new_customer", terms: "1" };
  assert.equal(registerInput.safeParse(signup).success, true);
  assert.equal(registerInput.safeParse({ ...signup, phone: "081234567890" }).success, true, "an unresolved number still reaches WordPress, which answers it");
});

test("Sign-in identifiers: emails trimmed, phones cleaned, local numbers resolved", () => {
  assert.equal(prepareLoginIdentifier(" harry@example.com ", "US", null), "harry@example.com");
  assert.equal(prepareLoginIdentifier("‪62 812 7700 0093‬", "US", null), "62 812 7700 0093");
  assert.equal(prepareLoginIdentifier("+6281277000093", "US", null), "+6281277000093");
  assert.equal(prepareLoginIdentifier("081277000093", "US", library), "+6281277000093");
  assert.equal(prepareLoginIdentifier("081277000093", "US", null), "081277000093", "without the library the number is sent as typed");
  assert.equal(prepareLoginIdentifier("0412345678", "US", library), "0412345678");
  for (const value of ["harry@example.com", "+6281234567890", "6281234567890", "0062812"]) assert.equal(isLocalPhone(value), false, value);
  assert.equal(loginInput.safeParse({ identifier: "harry@example.com", phone_region_hint: "US", password: "x" }).success, true);
});

test("An empty identifier is stopped before sign-in, in the browser and on the server", () => {
  for (const identifier of ["", "   "]) assert.equal(loginInput.safeParse({ identifier, phone_region_hint: "ID", password: "x" }).success, false, JSON.stringify(identifier));
  assert.equal(cleanPhoneText("​  "), "");
  const form = source("../src/components/AuthForm.tsx");
  assert.ok(form.includes('"Please enter your phone number or email address."'));
  assert.match(form, /if \(!cleanPhoneText\(String\(data\.identifier \?\? ""\)\)\) \{ setIdentifierError\(IDENTIFIER_REQUIRED\)/);
  assert.match(form, /onInvalid=\{event => \{ event\.preventDefault\(\); setIdentifierError\(IDENTIFIER_REQUIRED\)/);
});

test("Wrong credentials get one generic message that never says whether the account exists", () => {
  const server = source("../src/lib/customer-server.ts");
  assert.ok(server.includes('login: "Incorrect phone number, email, or password."'));
  assert.equal(server.includes("We could not sign you in"), false);
});

test("The login field suits mobile keyboards and screen readers", () => {
  const form = source("../src/components/AuthForm.tsx");
  const start = form.indexOf("<label>Phone Number or Email Address");
  const field = form.slice(start, form.indexOf("</label>", start));
  for (const part of ['name="identifier"', 'autoComplete="username"', 'autoCapitalize="none"', "spellCheck={false}", 'placeholder="Enter your phone number or email"', "required", "aria-invalid=", 'aria-describedby={identifierError ? "identifier-help identifier-error" : "identifier-help"}', 'role="alert"']) assert.ok(field.includes(part), part);
  assert.ok(field.includes("For phone numbers, include your country code without the + sign (e.g. 6281234567890)."));
  // A tel or email type would hide one of the two keyboards this field needs.
  assert.equal(/\stype=/.test(field.slice(0, field.indexOf("/>"))), false);
  // Inputs stay at 16px on phones so iOS does not zoom into the form.
  assert.match(source("../src/app/globals.css"), /@media\(max-width:767px\) \{\s*\.customer-form input:not\(\[type=checkbox\],\[type=radio\],\[type=hidden\]\), \.customer-form select, \.customer-form textarea \{ font-size: 16px; \}/);
});

test("The phone library loads once, on demand, and a failed load falls back to the number as typed", async () => {
  const appended: { src: string; onload?: () => void; onerror?: () => void }[] = [];
  const win: { libphonenumber?: PhoneLibrary } = {};
  Object.assign(globalThis, { window: win, document: { createElement: () => ({}), head: { append: (script: (typeof appended)[number]) => appended.push(script) } } });
  try {
    const failed = loadPhoneLibrary();
    appended[0].onerror!();
    assert.equal(await failed, null);
    const first = loadPhoneLibrary(), second = loadPhoneLibrary();
    assert.equal(appended.length, 2, "a failed load is retried; concurrent calls share one request");
    assert.equal(appended[1].src, "/vendor/libphonenumber-max.js");
    win.libphonenumber = library; appended[1].onload!();
    assert.equal(await first, library); assert.equal(await second, library);
    assert.equal(await loadPhoneLibrary(), library); assert.equal(appended.length, 2);
  } finally { delete (globalThis as { window?: unknown }).window; delete (globalThis as { document?: unknown }).document; }
});
