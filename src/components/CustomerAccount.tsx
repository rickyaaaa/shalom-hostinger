"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { accountSchema, type CustomerAccount as AccountData } from "@/lib/customer-types";
import { customerFetch } from "@/lib/customer-client";
import { useCustomerSession } from "./CustomerSession";
import { intentQuery,type BookingIntent } from "@/lib/booking-intent";
import { Icon } from "./Icon";

function ReviewForm({onSubmitted,title,tourId,entitlementId}:{onSubmitted:()=>void;title:string;tourId:number;entitlementId?:string|number}) {
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return; setBusy(true); setError("");
    try { await customerFetch("reviews",{...Object.fromEntries(new FormData(event.currentTarget)),tour_id:tourId,...(entitlementId === undefined ? {} : {entitlement_id:entitlementId})}); onSubmitted(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Please try again."); setBusy(false); }
  }
  return <form className="customer-form" onSubmit={submit} aria-busy={busy}>
    <h3>Review {title}</h3><p>Your review will appear publicly after approval.</p>
    {error && <p role="alert" className="customer-error">{error}</p>}
    <div className="customer-columns">{[["driving_skill","Driving Skill"],["service","Service"],["car","Car"]].map(([key,label])=><label key={key}>{label}<select name={key} required defaultValue=""><option value="">Choose 1–10</option>{Array.from({length:10},(_,i)=><option key={i} value={i+1}>{i+1}</option>)}</select></label>)}</div>
    <label>Was the tour worth it?<select name="price" required defaultValue=""><option value="">Choose an answer</option><option value="worth_it">Worth it</option><option value="not_worth_it">Not worth it</option></select></label>
    <label>Would you recommend us?<select name="recommend" required defaultValue=""><option value="">Choose an answer</option><option value="yes">Yes</option><option value="no">No</option></select></label>
    <label>Your Experience<textarea name="experience" required maxLength={1000} rows={5} /><span className="field-help">Up to 1,000 characters.</span></label>
    <button className="button" disabled={busy}>{busy ? "Submitting review…" : "Submit Review"}</button>
  </form>;
}

export function CustomerAccount() {
  const {account,guest,error:loadError,loading,reload}=useCustomerSession();
  const [error,setError] = useState("");
  const [review,setReview] = useState<number|null>(null);
  const [notice,setNotice] = useState("");
  const [busy,setBusy] = useState(false);
  const entitlements = account?.review_entitlements ?? account?.completed_tours.filter(tour => tour.can_review).map(tour => ({id:`legacy-${tour.id}`,tour_id:tour.id,title:tour.title})) ?? [];
  const authoritativeEntitlements = account?.review_entitlements;
  const load = () => {setError("");void reload();};
  const submitted = () => {setReview(null);setNotice("Thank you. Your review is awaiting approval.");load();};
  async function logout() { setBusy(true);try {await customerFetch("logout",{});window.location.assign("/login");}catch(reason){setError(reason instanceof Error ? reason.message : "Please try again.");setBusy(false);} }
  return <section className="customer-section account-section"><div className="customer-panel account-panel">
    <div className="account-heading"><h1>My Account</h1>{account && <button className="button button-outline" onClick={logout} disabled={busy}>{busy ? "Signing out…" : "Log Out"}</button>}</div>
    {notice && <p className="customer-notice" role="status">{notice}</p>}
    {(error||(!guest&&loadError)) && <p className="customer-error" role="alert">{error||loadError} {!guest && <button className="text-button" onClick={load}>Retry</button>}</p>}
    {guest ? <p><Link className="button" href="/login">Log In</Link> <Link href="/register">Create Account</Link></p> : loading && !account ? <p role="status">Loading your account…</p> : account && <>
      <p className="customer-intro">Welcome, {account.customer.name}.</p>
      <ProfilePanel account={account} onUpdated={load} />
      <section className="account-block"><h2>Completed Tours</h2><p>Completed Tours are confirmed by Shalom Bali Tour.</p>
        {account.completed_tours.length ? <ul className="account-list">{account.completed_tours.map(tour=>{const entitlement=entitlements.find(item=>item.tour_id===tour.id);return <li key={tour.id}><strong>{tour.title}</strong>{entitlement ? <button className="button button-outline" onClick={()=>setReview(review===tour.id?null:tour.id)} aria-expanded={review===tour.id}>{review===tour.id ? "Close review form" : "Leave Review"}</button>:account.reviews.some(item=>item.tour_id===tour.id)&&<ReviewStatus status={account.reviews.find(item=>item.tour_id===tour.id)!.status}/>}</li>})}</ul> : <p>You have no completed Tours yet. <Link href="/">Explore Bali Tours</Link>.</p>}
        {!entitlements.length && <p className="account-empty-review">You can leave a review after completing an eligible tour.</p>}
      </section>
      {review && entitlements.some(tour=>tour.tour_id===review) && <section id="leave-review" className="account-block"><ReviewForm key={review} tourId={review} entitlementId={authoritativeEntitlements?.find(tour=>tour.tour_id===review)?.id} onSubmitted={submitted} title={entitlements.find(tour=>tour.tour_id===review)!.title} /></section>}
      <InquiryHistory key={account.customer.id} initial={account.inquiries} />
      <section id="reviews" className="account-block"><h2>My Reviews</h2>{account.reviews.length ? <ul className="account-list">{account.reviews.map((item,i)=><li key={item.id??i}><div><h3>{item.title}</h3><ReviewStatus status={item.status}/><p className="customer-experience">{item.experience}</p></div></li>)}</ul> : <p>You have not submitted any reviews yet.</p>}</section>
    </>}
  </div></section>;
}

function ProfilePanel({ account, onUpdated }: { account: AccountData; onUpdated: () => void }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function upload(file: File) {
    setBusy(true); setError(""); setMessage("");
    const body = new FormData(); body.set("avatar", file);
    try { const response = await fetch("/api/customer/profile", { method: "POST", body, credentials: "same-origin" }); const value = await response.json(); if (!response.ok) throw new Error(value.message || "We could not update your profile photo."); setMessage("Your profile photo was updated."); onUpdated(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "We could not update your profile photo."); }
    finally { setBusy(false); }
  }
  async function remove() {
    setBusy(true); setError(""); setMessage("");
    try { const response = await fetch("/api/customer/profile", { method: "DELETE", credentials: "same-origin" }); const value = await response.json(); if (!response.ok) throw new Error(value.message || "We could not remove your profile photo."); setMessage("Your profile photo was removed."); onUpdated(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "We could not remove your profile photo."); }
    finally { setBusy(false); }
  }
  return <section id="profile" className="account-block profile-panel"><div className="profile-panel-heading"><div><h2>My Profile</h2><p>Update the photo shown beside your profile control.</p></div><span className="profile-avatar profile-avatar-large">{account.customer.avatar_url ? <img src={account.customer.avatar_url} alt="" /> : <Icon name="user" />}</span></div><label className="profile-upload">Profile photo<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={event => { const file=event.target.files?.[0]; if(file) void upload(file); }} /><span className="field-help">JPEG, PNG or WebP. SVG files are not accepted.</span></label>{account.customer.avatar_url && <button className="button button-outline" type="button" disabled={busy} onClick={remove}>Remove photo</button>}{message && <p className="customer-notice" role="status">{message}</p>}{error && <p className="customer-error" role="alert">{error}</p>}<p id="password" className="field-help profile-password-note">To change your password, use <Link href="/request-help">Request Help</Link>.</p></section>;
}

function InquiryHistory({initial}:{initial:AccountData["inquiries"]}) {
  const [history,setHistory]=useState(initial);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  useEffect(()=>{setHistory(initial);setError("");},[initial]);
  async function more() {
    if(busy)return;
    setBusy(true);setError("");
    try {
      const next=accountSchema.parse(await customerFetch(`me?inquiry_page=${history.page+1}`)).inquiries;
      setHistory(previous=>({...next,items:[...previous.items,...next.items.filter(item=>!previous.items.some(old=>old.id===item.id))]}));
    } catch(reason) {setError(reason instanceof Error?reason.message:"Your inquiry history could not be loaded. Please try again.");}
    finally {setBusy(false);}
  }
  const statuses={inquiry:"Inquiry",confirmed:"Confirmed",completed:"Completed",cancelled:"Cancelled",unavailable:"Status unavailable"};
  return <section className="account-block" aria-labelledby="my-inquiries-title">
    <h2 id="my-inquiries-title">My Inquiries</h2>
    {history.items.length ? <>
      <p className="field-help">Dates are shown in UTC. An inquiry is not a confirmed booking.</p>
      <table className="inquiry-history"><caption className="sr-only">Your inquiry history</caption><thead><tr><th scope="col">Tour</th><th scope="col">Date</th><th scope="col">Status</th></tr></thead>
      <tbody>{history.items.map(item=><tr key={item.id}><th scope="row">{item.title}</th><td>{item.submitted_at ? <time dateTime={item.submitted_at}>{new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"}).format(new Date(item.submitted_at))}</time>:"Date unavailable"}</td><td>{statuses[item.status]}</td></tr>)}</tbody></table>
    </> : <p>You have no inquiries yet. <Link href="/">Explore Bali Tours</Link>.</p>}
    {error && <p className="customer-error" role="alert">{error}</p>}
    {history.has_more && <button type="button" className="button button-outline" disabled={busy} onClick={more}>{busy?"Loading inquiries…":error?"Retry loading inquiries":"Load more inquiries"}</button>}
  </section>;
}

export function ReviewStatus({status}:{status:"pending"|"approved"|"unavailable"}){return <p className="review-status">{status==="pending"?"Pending approval":status==="approved"?"Approved":"Unavailable"}</p>;}

export function BookingFlow({title,intent,backHref}:{title:string;intent:BookingIntent;backHref:string}) {
  const {account,guest,error:sessionError,loading}=useCustomerSession();
  const [ready,setReady] = useState(false);
  const [error,setError] = useState("");
  const [busy,setBusy] = useState(false);
  const [whatsapp,setWhatsapp] = useState("");
  const ticket = useRef("");
  const loginUrl=`/login${intentQuery(intent)}`;
  useEffect(()=>{if(loading)return;if(guest)window.location.replace(loginUrl);else if(account)setReady(true);else setError(sessionError);},[account,guest,loading,loginUrl,sessionError]);
  async function book() {
    if (busy) return; setBusy(true);setError("");
    try {
      if (!ticket.current) ticket.current = (await customerFetch("booking-ticket",intent)).ticket;
      const result = await customerFetch("inquiries",{...intent,ticket:ticket.current});
      setWhatsapp(result.whatsapp_url);
    } catch(reason) {setError(reason instanceof Error ? reason.message : "Please try again.");} finally {setBusy(false);}
  }
  return <section className="customer-section"><div className="customer-panel"><h1>Book {title}</h1><p className="customer-intro">Ask Shalom Bali Tour about availability. Your inquiry stays linked to your account.</p>
    {error && <p role="alert" className="customer-error">{error} {!ready && <Link href={loginUrl}>Sign in again</Link>}</p>}
    {whatsapp ? <><p className="customer-notice" role="status">Your inquiry is ready. Continue on WhatsApp to discuss your Tour.</p><a className="button" href={whatsapp} target="_blank" rel="noreferrer">Continue on WhatsApp</a></> : ready ? <button className="button" onClick={book} disabled={busy}>{busy ? "Preparing your inquiry…" : "Request Availability"}</button> : !error && <p role="status">Checking your account…</p>}
    <p className="customer-footer"><Link href={backHref}>Back to Tours</Link> · <Link href="/account">My Account</Link></p>
  </div></section>;
}
