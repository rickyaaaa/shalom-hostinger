"use client";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { customerFetch } from "@/lib/customer-client";
import { intentQuery,type BookingIntent } from "@/lib/booking-intent";

export function ForgotPasswordForm({intent}:{intent:BookingIntent|null}) {
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState("");
  const [error,setError] = useState("");
  const alert = useRef<HTMLParagraphElement>(null);
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true);setError("");
    // WordPress answers identically whether or not the address has an account.
    // An "unavailable" answer (delivery off or paused) is shown as-is; never claim an email is on its way then.
    try { const result = await customerFetch("forgot-password",data);setMessage(/not available/i.test(result.message) ? result.message : "If an account exists for this email, password reset instructions will be sent."); }
    catch(reason) { setError(reason instanceof Error ? reason.message : "Please try again.");requestAnimationFrame(()=>alert.current?.focus()); }
    finally {setBusy(false);}
  }
  return <section className="customer-section"><div className="customer-panel">
    <h1>Forgot your password?</h1>
    <p className="customer-intro">Enter the email address on your account. If it matches, we&apos;ll email you a link to choose a new password.</p>
    {message ? <p className="customer-notice" role="status">{message}</p> : <form className="customer-form" onSubmit={submit} aria-busy={busy}>
      {error && <p className="customer-error" role="alert" tabIndex={-1} ref={alert}>{error}</p>}
      <label>Email Address<input name="email" type="email" autoComplete="email" inputMode="email" maxLength={254} required /></label>
      <button className="button" disabled={busy}>{busy ? "Sending…" : "Send Reset Link"}</button>
      <p className="field-help">Signed up with a phone number only? <Link href="/#contact">Contact Shalom Bali Tour</Link> to recover your account.</p>
    </form>}
    <p className="customer-footer"><Link href={`/login${intentQuery(intent)}`}>Back to Log In</Link> · <Link href="/#contact">Contact Shalom Bali Tour</Link></p>
  </div></section>;
}
