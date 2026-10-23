"use client";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { customerFetch } from "@/lib/customer-client";
import { AccountGate } from "./CustomerAccount";

export function ChangePassword() {
  return <AccountGate title="Change Password">{(_account, reload) => <PasswordForm onChanged={reload} />}</AccountGate>;
}

// Signed-in change: WordPress checks the current password, so no email is needed and phone-only
// accounts can use it. Customers who cannot sign in keep using Forgot Password (email reset).
function PasswordForm({ onChanged }: { onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ message: string; signedIn: boolean } | null>(null);
  const alert = useRef<HTMLParagraphElement>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    if (data.password !== data.confirm_password) { setError("The new passwords do not match."); requestAnimationFrame(() => alert.current?.focus()); return; }
    setBusy(true); setError("");
    try {
      const result = await customerFetch("change-password", data);
      form.reset();
      setDone({ message: result.message, signedIn: result.signed_in === true });
      if (result.signed_in === true) onChanged();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Please try again."); requestAnimationFrame(() => alert.current?.focus()); }
    finally { setBusy(false); }
  }
  if (done) return <>
    <p className="customer-notice" role="status">{done.message}</p>
    {done.signedIn ? <p className="field-help">Other devices signed in to your account have been signed out.</p> : <Link className="button" href="/login">Log In</Link>}
    <p className="customer-footer"><Link href="/account">Back to My Account</Link></p>
  </>;
  return <>
    <p className="customer-intro">Enter your current password, then choose a new one.</p>
    <form className="customer-form" onSubmit={submit} aria-busy={busy}>
      {error && <p className="customer-error" role="alert" tabIndex={-1} ref={alert}>{error}</p>}
      <label>Current Password<input name="current_password" type="password" autoComplete="current-password" required /></label>
      <label>New Password<input name="password" type="password" autoComplete="new-password" minLength={8} required /><span className="field-help">At least 8 characters.</span></label>
      <label>Confirm New Password<input name="confirm_password" type="password" autoComplete="new-password" minLength={8} required /></label>
      <button className="button" disabled={busy}>{busy ? "Changing password…" : "Change Password"}</button>
      <p className="field-help">Forgot your current password? <Link href="/request-help">Reset it by email</Link>.</p>
    </form>
    <p className="customer-footer"><Link href="/account">Back to My Account</Link></p>
  </>;
}
