"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { customerFetch } from "@/lib/customer-client";

export function ResetPasswordForm() {
  const [link,setLink] = useState<{login:string;key:string}|null|undefined>(undefined);
  const [busy,setBusy] = useState(false);
  const [show,setShow] = useState(false);
  const [done,setDone] = useState("");
  const [error,setError] = useState("");
  const alert = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    // The reset key arrives in the URL fragment, which browsers never send to servers.
    // Read it once, then drop it from the address bar and history.
    const params = new URLSearchParams(window.location.hash.slice(1));
    const login = params.get("login") ?? "", key = params.get("key") ?? "";
    setLink(login && /^[A-Za-z0-9]{1,100}$/.test(key) ? {login,key} : null);
    if (window.location.hash) window.history.replaceState(null, "", window.location.pathname);
  }, []);
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy || !link) return;
    const form = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true); setError("");
    try { const result = await customerFetch("reset-password", {...link, password:form.password, confirm_password:form.confirm_password}); setDone(result.message); }
    catch(reason) { setError(reason instanceof Error ? reason.message : "Please try again."); requestAnimationFrame(()=>alert.current?.focus()); }
    finally { setBusy(false); }
  }
  return <section className="customer-section"><div className="customer-panel">
    <h1>Choose a new password</h1>
    {link === undefined ? <p role="status">Checking your reset link…</p>
      : done ? <><p className="customer-notice" role="status">{done}</p><p><Link className="button" href="/login">Log In</Link></p></>
      : !link ? <p className="customer-error" role="alert">This password reset link is incomplete. Please open the link from your email again, or <Link href="/request-help">request a new link</Link>.</p>
      : <form className="customer-form" onSubmit={submit} aria-busy={busy}>
        {error && <p className="customer-error" role="alert" tabIndex={-1} ref={alert}>{error} {/expired|invalid/i.test(error) && <Link href="/request-help">Request a new link</Link>}</p>}
        <label>New Password<input name="password" type={show ? "text" : "password"} autoComplete="new-password" minLength={8} maxLength={128} required /><span className="field-help">Use at least 8 characters.</span></label>
        <label>Confirm Password<input name="confirm_password" type={show ? "text" : "password"} autoComplete="new-password" minLength={8} maxLength={128} required /></label>
        <label className="customer-check"><input type="checkbox" checked={show} onChange={event=>setShow(event.target.checked)} /><span>Show passwords</span></label>
        <button className="button" disabled={busy}>{busy ? "Saving…" : "Reset Password"}</button>
      </form>}
    <p className="customer-footer"><Link href="/login">Back to Log In</Link></p>
  </div></section>;
}
