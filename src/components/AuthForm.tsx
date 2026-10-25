"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { customerConfigSchema, type CustomerConfig } from "@/lib/customer-types";
import { customerFetch } from "@/lib/customer-client";
import { PhoneInput } from "./PhoneInput";
import { bookingPath,intentQuery,type BookingIntent } from "@/lib/booking-intent";

// Local numbers without "+" are read in the visitor's region; WordPress normalization stays authoritative.
function regionHint() {
  if (typeof navigator === "undefined") return "ID";
  const region = navigator.language.split("-")[1]?.toUpperCase();
  return region && /^[A-Z]{2}$/.test(region) ? region : "ID";
}

export function AuthForm({register, intent, created}: {register?:boolean; intent:BookingIntent|null; created?:boolean}) {
  const [config,setConfig] = useState<CustomerConfig|null>(null);
  const [configError,setConfigError] = useState("");
  const [error,setError] = useState("");
  const [busy,setBusy] = useState(false);
  const [show,setShow] = useState(false);
  const alert = useRef<HTMLParagraphElement>(null);
  const load = () => { setConfigError(""); customerFetch("config").then(value => setConfig(customerConfigSchema.parse(value))).catch(() => setConfigError("We could not load the account service. Please try again.")); };
  useEffect(load,[]);
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    const form = new FormData(event.currentTarget);
    const data = Object.fromEntries(form.entries());
    setBusy(true); setError("");
    try {
      const value = await customerFetch(register ? "register" : "login",data);
      window.location.assign(value.signed_in ? (intent ? bookingPath(intent) : "/account") : `/login?created=1${intent ? `&${intentQuery(intent).slice(1)}` : ""}`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Please try again."); setBusy(false); requestAnimationFrame(() => alert.current?.focus()); }
  }
  const suffix = intentQuery(intent);
  return <section className="customer-section"><div className="customer-panel">
    <h1>{register ? "Create Your Account" : "Log In to Your Account"}</h1>
    <p className="customer-intro">{intent ? (register ? "Create your account to continue your booking." : "Sign in to continue your booking.") : register ? "Create your account to plan your Bali journey." : "Welcome back to Shalom Bali Tour."}</p>
    {created && <p className="customer-notice" role="status">Your account was created. Please sign in to continue.</p>}
    {configError ? <p className="customer-notice" role="alert">{configError} <button className="text-button" onClick={load}>Retry</button></p> : !config ? <p role="status">Loading account service…</p> : register && !config.registration_enabled ? <p role="status">Online sign-up is currently unavailable. Please contact Shalom Bali Tour.</p> : <form className="customer-form" onSubmit={submit} aria-busy={busy}>
      {error && <p className="customer-error" role="alert" tabIndex={-1} ref={alert}>{error}</p>}
      {register && <label>Full Name<input name="full_name" autoComplete="name" maxLength={100} required /></label>}
      {register ? <>
        <PhoneInput />
        <label>Email Address<input name="email" type="email" autoComplete="email" inputMode="email" maxLength={100} required /><span className="field-help">Used to sign in and to reset your password.</span></label>
      </> : <>
        <label>Email or Phone Number<input name="identifier" autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={254} required /><span className="field-help">Use your email address, or your phone number with country code (for example +62 812 3456 7890).</span></label>
        <input type="hidden" name="phone_region_hint" value={regionHint()} />
      </>}
      <div className={register ? "customer-columns" : undefined}>
        <label>Password<input name="password" type={show ? "text" : "password"} autoComplete={register ? "new-password" : "current-password"} minLength={register ? 8 : undefined} maxLength={register ? 128 : 4096} required />{register && <span className="field-help">Use at least 8 characters.</span>}</label>
        {register && <label>Confirm Password<input name="confirm_password" type={show ? "text" : "password"} autoComplete="new-password" minLength={8} maxLength={128} required /></label>}
      </div>
      <label className="customer-check"><input type="checkbox" checked={show} onChange={event=>setShow(event.target.checked)} /><span>Show password{register ? "s" : ""}</span></label>
      {register && <>
        <fieldset><legend>Customer Type</legend><label className="customer-check"><input type="radio" name="customer_type" value="new_customer" required /><span>New Customer</span></label><label className="customer-check"><input type="radio" name="customer_type" value="existing_customer" /><span>I Have Been a Customer Before</span></label></fieldset>
        <label className="customer-check"><input name="terms" type="checkbox" value="1" required /><span>I agree to the <a href={config.terms_url} target="_blank" rel="noreferrer">terms</a> and <a href={config.privacy_url} target="_blank" rel="noreferrer">privacy policy</a>.</span></label>
      </>}
      <button className="button" type="submit" disabled={busy}>{busy ? (register ? "Creating account…" : "Signing in…") : register ? "Sign Up" : "Log In"}</button>
      {!register && <p className="field-help"><Link href={`/request-help${suffix}`}>Forgot Password?</Link></p>}
    </form>}
    <p className="customer-footer">{register ? <>Already have an account? <Link href={`/login${suffix}`}>Log In</Link></> : <>Don&apos;t have an account? <Link href={`/register${suffix}`}>Sign Up</Link></>}</p>
  </div></section>;
}
