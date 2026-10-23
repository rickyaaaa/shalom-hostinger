"use client";
import Link from "next/link";
import { useState } from "react";
import type { CustomerAccount as AccountData } from "@/lib/customer-types";
import { customerFetch } from "@/lib/customer-client";
import { AccountGate } from "./CustomerAccount";
import { SupportLink } from "./CustomerProfile";
import { resetRequestMessage } from "./ForgotPasswordForm";

export function ChangePassword() {
  return <AccountGate title="Change Password">{account => <PasswordReset account={account} />}</AccountGate>;
}

// Reuses the existing email reset (WordPress keys, Brevo, rate limits, generic answers); there is no second password flow.
function PasswordReset({ account }: { account: AccountData }) {
  const email = account.customer.email;
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function send() {
    if (busy || !email) return;
    setBusy(true); setError("");
    try { setMessage(resetRequestMessage((await customerFetch("forgot-password", { email })).message)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Please try again."); }
    finally { setBusy(false); }
  }
  if (!email) return <>
    <p className="customer-intro">Your account has no email address, so a reset link cannot be sent. Customer Service can help you change your password.</p>
    <SupportLink account={account} className="button">Contact Customer Service</SupportLink>
    <p className="customer-footer"><Link href="/account">Back to My Account</Link></p>
  </>;
  return <>
    <p className="customer-intro">We&apos;ll email a secure link to <strong className="profile-email">{email}</strong>. Open it to choose your new password.</p>
    {message ? <p className="customer-notice" role="status">{message}</p> : <>
      {error && <p className="customer-error" role="alert">{error}</p>}
      <button type="button" className="button" disabled={busy} onClick={() => void send()}>{busy ? "Sending…" : "Send Reset Link"}</button>
    </>}
    <p className="customer-footer"><Link href="/account">Back to My Account</Link> · <SupportLink account={account}>Contact Customer Service</SupportLink></p>
  </>;
}
