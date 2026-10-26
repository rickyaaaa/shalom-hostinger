"use client";
import { useState } from "react";
import { referralUrl } from "@/lib/referral";

// Shares the partner's referral link when an admin has set one up; otherwise the public website link.
// Attribution only: no commission, reward or code is attached.
export function useShareSite(referralSlug?: string | null) {
  const [status, setStatus] = useState("");
  const link = () => referralSlug ? referralUrl(window.location.origin, referralSlug) : `${window.location.origin}/`;
  async function copy() {
    const url = link();
    try { await navigator.clipboard.writeText(url); setStatus(referralSlug ? "Referral link copied." : "Website link copied."); }
    catch { setStatus(`Copy this link: ${url}`); }
  }
  async function share() {
    const url = link();
    if (typeof navigator.share === "function") {
      try { await navigator.share({ title: "Shalom Bali Tour", text: "Private Bali itineraries with Shalom Bali Tour.", url }); setStatus(""); return; }
      catch (reason) { if (reason instanceof Error && reason.name === "AbortError") return; }
    }
    await copy();
  }
  return { share, copy, status };
}

export function ShareSite({ referralSlug = null }: { referralSlug?: string | null }) {
  const { share, copy, status } = useShareSite(referralSlug);
  if (!referralSlug) {
    return <section className="account-block" aria-labelledby="share-title">
      <h2 id="share-title">Share Shalom Bali Tour</h2>
      <p>Know someone planning a Bali trip? Share our website with them.</p>
      <button type="button" className="button button-outline" onClick={() => void share()}>Share Shalom Bali Tour</button>
      <p className="field-help" role="status">{status}</p>
    </section>;
  }
  return <section className="account-block" aria-labelledby="share-title">
    <h2 id="share-title">Share Shalom Bali Tour</h2>
    <p>Share your personal link. Orders placed after someone visits through it are recorded as your referral.</p>
    <p className="referral-link"><span>Referral Link</span><code suppressHydrationWarning>{typeof window === "undefined" ? `/ref/${referralSlug}` : referralUrl(window.location.host, referralSlug)}</code></p>
    <div className="referral-actions">
      <button type="button" className="button" onClick={() => void copy()}>Copy Link</button>
      <button type="button" className="button button-outline" onClick={() => void share()}>Share</button>
    </div>
    <p className="field-help" role="status">{status}</p>
  </section>;
}
