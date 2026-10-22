"use client";
import { useState } from "react";

// Shares only the public website link. No referral code, tracking or reward is attached.
export function useShareSite() {
  const [status, setStatus] = useState("");
  async function share() {
    const url = `${window.location.origin}/`;
    if (typeof navigator.share === "function") {
      try { await navigator.share({ title: "Shalom Bali Tour", text: "Private Bali tours with Shalom Bali Tour.", url }); setStatus(""); return; }
      catch (reason) { if (reason instanceof Error && reason.name === "AbortError") return; }
    }
    try { await navigator.clipboard.writeText(url); setStatus("Website link copied."); }
    catch { setStatus(`Copy this link: ${url}`); }
  }
  return { share, status };
}

export function ShareSite() {
  const { share, status } = useShareSite();
  return <section className="account-block" aria-labelledby="share-title">
    <h2 id="share-title">Share Shalom Bali Tour</h2>
    <p>Know someone planning a Bali trip? Share our website with them.</p>
    <button type="button" className="button button-outline" onClick={() => void share()}>Share Shalom Bali Tour</button>
    <p className="field-help" role="status">{status}</p>
  </section>;
}
