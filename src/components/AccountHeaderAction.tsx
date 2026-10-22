"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { useCustomerSession } from "./CustomerSession";
import { useShareSite } from "./ShareSite";

function Avatar({ url }: { url?: string | null }) {
  return <span className="profile-avatar" aria-hidden="true">{url ? <img src={url} alt="" /> : <Icon name="user" />}</span>;
}

export function AccountHeaderAction() {
  const { account } = useCustomerSession();
  const { share, status } = useShareSite();
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
  const canReview = (account.review_entitlements?.length ?? account.completed_tours.filter(tour => tour.can_review).length) > 0;
  return <div className="profile-control" ref={wrapper}>
    <button ref={toggle} type="button" className="profile-trigger" aria-expanded={open} aria-haspopup="menu" aria-controls="profile-menu" onClick={() => setOpen(value => !value)}>
      <span className="profile-avatar-wrap"><Avatar url={account.customer.avatar_url}/><span className="profile-status" /></span><span className="profile-label">PROFILE</span><Icon name="chevron" className="profile-chevron"/>
    </button>
    {open && <div id="profile-menu" className="profile-menu" role="menu">
      <Link role="menuitem" href="/account#profile" onClick={() => setOpen(false)}>My Profile</Link>
      <Link role="menuitem" href="/request-help" onClick={() => setOpen(false)}>Change Password</Link>
      <Link role="menuitem" href="/account#reviews" onClick={() => setOpen(false)}>My Reviews</Link>
      {canReview && <Link role="menuitem" href="/account#leave-review" onClick={() => setOpen(false)}>Leave a Review</Link>}
      {account.customer.referral_enabled === true && <button role="menuitem" type="button" onClick={() => void share()}>{status ? status : "Share Shalom Bali Tour"}</button>}
      <button role="menuitem" type="button" onClick={async () => { setOpen(false); await fetch("/api/customer/logout", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: "{}" }); window.location.assign("/login"); }}>Log out</button>
    </div>}
  </div>;
}
