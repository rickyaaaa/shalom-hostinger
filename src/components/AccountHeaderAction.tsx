"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { useCustomerSession } from "./CustomerSession";
import { SupportLink } from "./CustomerProfile";

function Avatar({ url }: { url?: string | null }) {
  return <span className="profile-avatar" aria-hidden="true">{url ? <img src={url} alt="" /> : <Icon name="user" />}</span>;
}

export function AccountHeaderAction() {
  const { account } = useCustomerSession();
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!wrapper.current?.contains(event.target as Node)) { setOpen(false); toggle.current?.focus(); } };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); setOpen(false); toggle.current?.focus(); } };
    document.addEventListener("pointerdown", outside); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);
  if (!account) return <><Link href="/login" className="button header-signin">Sign In</Link><Link href="/login" className="mobile-account" aria-label="Login or Register"><Icon name="user"/><span>LOGIN / REGISTER</span></Link></>;
  return <div className="profile-control" ref={wrapper}>
    <button ref={toggle} type="button" className="profile-trigger" aria-expanded={open} aria-haspopup="menu" aria-controls="profile-menu" onClick={() => setOpen(value => !value)}>
      <span className="profile-avatar-wrap"><Avatar url={account.customer.avatar_url}/><span className="profile-status" /></span><span className="profile-label">PROFILE</span><Icon name="chevron" className="profile-chevron"/>
    </button>
    {open && <div id="profile-menu" className="profile-menu" role="menu">
      {/* Client-approved menu: exactly these five items. Ordering, history and reviews live on /account. */}
      <Link role="menuitem" href="/account" onClick={() => setOpen(false)}>My Account</Link>
      <Link role="menuitem" href="/account/password" onClick={() => setOpen(false)}>Change Password</Link>
      <SupportLink account={account} role="menuitem" onClick={() => setOpen(false)}>Contact Customer Service</SupportLink>
      <Link role="menuitem" href="/account/profile" onClick={() => setOpen(false)}>Change Profile</Link>
      <button role="menuitem" type="button" onClick={async () => { setOpen(false); await fetch("/api/customer/logout", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: "{}" }); window.location.assign("/login"); }}>Log out</button>
    </div>}
  </div>;
}
