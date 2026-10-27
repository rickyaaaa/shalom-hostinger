"use client";
import Script from "next/script";
import { useId, useState } from "react";
import { browserRegion, normalizePhone, phoneFieldValue } from "@/lib/phone-number";

// Same bundled libphonenumber build as the working WordPress portal. This is
// presentation only; PHP normalize_phone remains authoritative on submission.
type ParsedPhone = {country?:string; number:string; isPossible():boolean; isValid():boolean; getPossibleCountries():string[]};
type Library = {parsePhoneNumberFromString(value:string, region?:string):ParsedPhone|undefined; AsYouType:new()=>{input(value:string):void;getCountry():string|undefined}};
declare global { interface Window { libphonenumber?: Library } }

export function PhoneInput() {
  const id = useId();
  const [phone,setPhone] = useState("+");
  const [ready,setReady] = useState(false);
  let region = "Enter the country code and phone number";
  let hint = "ID";
  if (ready && /\d/.test(phone) && window.libphonenumber) {
    try {
      const lib = window.libphonenumber;
      // The number as it will be submitted: local numbers in the visitor's region, then Indonesia.
      const resolved = normalizePhone(phone, browserRegion(), lib);
      const parsed = lib.parsePhoneNumberFromString(resolved ?? phone);
      let code = parsed?.country;
      if (!code && phone.startsWith("+")) { const partial = new lib.AsYouType(); partial.input(phone); code = partial.getCountry(); }
      const names = new Intl.DisplayNames(["en"],{type:"region"});
      if (code) {
        hint = code;
        region = names.of(code) || code;
        if (!parsed?.isPossible()) region += " — enter the complete number";
        else if (!resolved) region += " — check the number format";
      } else if (!phone.startsWith("+")) {
        region = "Enter a valid phone number, with its country code if it is not Indonesian";
      } else {
        const possible = parsed?.getPossibleCountries() || [];
        region = possible.length > 1 ? `Multiple possible regions: ${possible.map(code=>names.of(code) || code).join(", ")}` : "Enter a valid country code and phone number";
      }
    } catch { region = "Enter a valid country code and phone number"; }
  }
  return <>
    <Script src="/vendor/libphonenumber-max.js" strategy="afterInteractive" onReady={()=>setReady(true)} />
    <p className="field-help" id={`${id}-region`} role="status">Phone country/region: {region}</p>
    <label>Phone Number<input name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={32} pattern="\+?[0-9]{6,18}" title="Enter your phone number with its country code, or a local number." required value={phone} onChange={event=>setPhone(phoneFieldValue(event.target.value))} aria-describedby={`${id}-region ${id}-help`} /><span className="field-help" id={`${id}-help`}>Include your country code, for example +62 812 3456 7890. An Indonesian number such as 0812 3456 7890 also works.</span></label>
    <input type="hidden" name="phone_region_hint" value={hint} />
  </>;
}
