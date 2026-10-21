"use client";
import Script from "next/script";
import { useId, useState } from "react";

// Same bundled libphonenumber build as the working WordPress portal. This is
// presentation only; PHP normalize_phone remains authoritative on submission.
type ParsedPhone = {country?:string; isPossible():boolean; isValid():boolean; getPossibleCountries():string[]};
declare global { interface Window { libphonenumber?: {parsePhoneNumberFromString(value:string):ParsedPhone|undefined; AsYouType:new()=>{input(value:string):void;getCountry():string|undefined}} } }

export function PhoneInput() {
  const id = useId();
  const [phone,setPhone] = useState("+");
  const [ready,setReady] = useState(false);
  let region = "Enter the country code and phone number";
  let hint = "ID";
  if (ready && phone.length > 1 && window.libphonenumber) {
    try {
      const lib = window.libphonenumber;
      const parsed = lib.parsePhoneNumberFromString(phone);
      const partial = new lib.AsYouType(); partial.input(phone);
      const code = parsed?.country || partial.getCountry();
      const names = new Intl.DisplayNames(["en"],{type:"region"});
      if (code) {
        hint = code;
        region = names.of(code) || code;
        if (!parsed?.isPossible()) region += " — enter the complete number";
        else if (!parsed.isValid()) region += " — check the number format";
      } else {
        const possible = parsed?.getPossibleCountries() || [];
        region = possible.length > 1 ? `Multiple possible regions: ${possible.map(code=>names.of(code) || code).join(", ")}` : "Enter a valid country code and phone number";
      }
    } catch { region = "Enter a valid country code and phone number"; }
  }
  return <>
    <Script src="/vendor/libphonenumber-max.js" strategy="afterInteractive" onReady={()=>setReady(true)} />
    <p className="field-help" id={`${id}-region`} role="status">Phone country/region: {region}</p>
    <label>Phone Number<input name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={32} pattern="\+[0-9]{7,15}" title="Enter + followed by your country code and phone number." required value={phone} onChange={event=>setPhone("+" + event.target.value.replace(/\D/g,""))} aria-describedby={`${id}-region ${id}-help`} /><span className="field-help" id={`${id}-help`}>Enter the country code and phone number after +, for example +62 812345678.</span></label>
    <input type="hidden" name="phone_region_hint" value={hint} />
  </>;
}
