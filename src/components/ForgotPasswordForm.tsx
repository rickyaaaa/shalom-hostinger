"use client";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { customerFetch } from "@/lib/customer-client";
import { PhoneInput } from "./PhoneInput";
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
    try { const result = await customerFetch("forgot-password",data);setMessage(result.message); }
    catch(reason) { setError(reason instanceof Error ? reason.message : "Please try again.");requestAnimationFrame(()=>alert.current?.focus()); }
    finally {setBusy(false);}
  }
  return <section className="customer-section"><div className="customer-panel">
    <h1>Forgot your password?</h1>
    <p className="customer-intro">Enter your phone number. Automatic SMS recovery is not available yet, so no message will be sent.</p>
    {message ? <p className="customer-notice" role="status">{message}</p> : <form className="customer-form" onSubmit={submit} aria-busy={busy}>
      {error && <p className="customer-error" role="alert" tabIndex={-1} ref={alert}>{error}</p>}
      <PhoneInput />
      <button className="button" disabled={busy}>{busy ? "Checking…" : "Request Help"}</button>
    </form>}
    <p className="customer-footer"><Link href={`/login${intentQuery(intent)}`}>Back to Log In</Link> · <Link href="/#contact">Contact Shalom Bali Tour</Link></p>
  </div></section>;
}
