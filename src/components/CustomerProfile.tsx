"use client";
import Link from "next/link";
import { useState, type AnchorHTMLAttributes, type FormEvent, type ReactNode } from "react";
import type { CustomerAccount as AccountData } from "@/lib/customer-types";
import { customerFetch } from "@/lib/customer-client";
import { AccountGate, supportHref } from "./CustomerAccount";
import { Icon } from "./Icon";

export function CustomerProfile() {
  return <AccountGate title="My Profile">{(account, reload) => <ProfileEditor account={account} onUpdated={reload} />}</AccountGate>;
}

type Status = { message: string; error: string };
const idle: Status = { message: "", error: "" };

function ProfileEditor({ account, onUpdated }: { account: AccountData; onUpdated: () => void }) {
  return <>
    <p className="customer-intro">Your photo and name appear in the profile control at the top of the page.</p>
    <PhotoSection account={account} onUpdated={onUpdated} />
    <NameSection account={account} onUpdated={onUpdated} />
    <section className="profile-section" aria-labelledby="profile-email-title">
      <h2 id="profile-email-title">Email</h2>
      {account.customer.email ? <><p className="profile-email">{account.customer.email}</p><p className="field-help">Used for password reset. To change it, <SupportLink account={account}>contact Customer Service</SupportLink>.</p></>
        : <p className="field-help">No email address is saved on your account. <SupportLink account={account}>Contact Customer Service</SupportLink> to add one for password reset.</p>}
    </section>
    <p className="customer-footer"><Link href="/account">Back to My Account</Link></p>
  </>;
}

// Upload and removal use the existing avatar endpoint unchanged.
function PhotoSection({ account, onUpdated }: { account: AccountData; onUpdated: () => void }) {
  const [status, setStatus] = useState(idle);
  const [busy, setBusy] = useState(false);
  async function send(init: RequestInit, done: string, failed: string) {
    setBusy(true); setStatus(idle);
    try { const response = await fetch("/api/customer/profile", { ...init, credentials: "same-origin" }); const value = await response.json(); if (!response.ok) throw new Error(value.message || failed); setStatus({ message: done, error: "" }); onUpdated(); }
    catch (reason) { setStatus({ message: "", error: reason instanceof Error ? reason.message : failed }); }
    finally { setBusy(false); }
  }
  function upload(file: File) { const body = new FormData(); body.set("avatar", file); void send({ method: "POST", body }, "Your profile photo was updated.", "We could not update your profile photo."); }
  return <section className="profile-section" aria-labelledby="profile-photo-title">
    <h2 id="profile-photo-title">Profile photo</h2>
    <div className="profile-photo">
      <span className="profile-avatar profile-avatar-xl">{account.customer.avatar_url ? <img src={account.customer.avatar_url} alt="Your profile photo" /> : <Icon name="user" />}</span>
      <div className="profile-photo-actions">
        <label className={`button button-outline profile-file${busy ? " is-busy" : ""}`}>{busy ? "Saving…" : account.customer.avatar_url ? "Change photo" : "Upload photo"}
          <input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; if (file) upload(file); }} /></label>
        {account.customer.avatar_url && <button className="button button-outline" type="button" disabled={busy} onClick={() => void send({ method: "DELETE" }, "Your profile photo was removed.", "We could not remove your profile photo.")}>Remove photo</button>}
      </div>
    </div>
    <p className="field-help">JPEG, PNG or WebP, up to 5 MB. SVG files are not accepted.</p>
    {status.message && <p className="customer-notice" role="status">{status.message}</p>}
    {status.error && <p className="customer-error" role="alert">{status.error}</p>}
  </section>;
}

function NameSection({ account, onUpdated }: { account: AccountData; onUpdated: () => void }) {
  const [name, setName] = useState(account.customer.name);
  const [status, setStatus] = useState(idle);
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    setBusy(true); setStatus(idle);
    try { const result = await customerFetch("profile", { display_name: name.trim() }); setName(result.customer.name); setStatus({ message: "Your name was updated.", error: "" }); onUpdated(); }
    catch (reason) { setStatus({ message: "", error: reason instanceof Error ? reason.message : "We could not save your name." }); }
    finally { setBusy(false); }
  }
  return <section className="profile-section" aria-labelledby="profile-name-title">
    <h2 id="profile-name-title">Name</h2>
    <form className="customer-form" onSubmit={submit} aria-busy={busy}>
      <label>Full name<input name="display_name" value={name} onChange={event => setName(event.target.value)} autoComplete="name" minLength={2} maxLength={100} required /></label>
      {status.message && <p className="customer-notice" role="status">{status.message}</p>}
      {status.error && <p className="customer-error" role="alert">{status.error}</p>}
      <button className="button" disabled={busy || name.trim() === account.customer.name}>{busy ? "Saving…" : "Save Changes"}</button>
    </form>
  </section>;
}

export function SupportLink({ account, children, ...rest }: { account: AccountData | null; children: ReactNode } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "target" | "rel">) {
  const href = supportHref(account);
  return href.startsWith("https://") ? <a {...rest} href={href} target="_blank" rel="noreferrer">{children}</a> : <Link {...rest} href={href}>{children}</Link>;
}
