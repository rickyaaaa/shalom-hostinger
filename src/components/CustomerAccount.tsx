"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { accountSchema, type CustomerAccount as AccountData } from "@/lib/customer-types";
import { customerFetch } from "@/lib/customer-client";
import { useCustomerSession } from "./CustomerSession";
import { intentQuery,type BookingIntent } from "@/lib/booking-intent";
import { ShareSite } from "./ShareSite";
import { BookingSearch } from "./BookingSearch";
import { formatDate, orderStatus, tourDateLabel } from "@/lib/account-display";

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

type Entitlement = { id: string | number; tour_id: number; title: string; inquiry_id?: number | null };

// Shared guest/loading/error handling for every signed-in account page.
export function AccountGate({ title, wide = false, children }: { title: string; wide?: boolean; children: (account: AccountData, reload: () => void) => ReactNode }) {
  const {account,guest,error,loading,reload}=useCustomerSession();
  const load = () => {void reload();};
  return <section className="customer-section account-section"><div className={`customer-panel${wide ? " account-panel" : ""}`}>
    <h1>{title}</h1>
    {!guest && error && !account && <p className="customer-error" role="alert">{error} <button className="text-button" onClick={load}>Retry</button></p>}
    {guest ? <p><Link className="button" href="/login">Log In</Link> <Link href="/register">Create Account</Link></p> : loading && !account ? <p role="status">Loading your account…</p> : account && children(account, load)}
  </div></section>;
}

/** WordPress-configured Shalom WhatsApp when the backend provides it; otherwise the site contact section. */
export function supportHref(account: AccountData | null) { return account?.support_whatsapp_url ?? "/#contact"; }


export function CustomerAccount() {
  return <AccountGate title="My Account" wide>{(account, reload) => <AccountDashboard account={account} reload={reload} />}</AccountGate>;
}

function AccountDashboard({ account, reload }: { account: AccountData; reload: () => void }) {
  const [review,setReview] = useState<string|number|null>(null);
  const [notice,setNotice] = useState("");
  const entitlements: Entitlement[] = account.review_entitlements ?? account.completed_tours.filter(tour => tour.can_review).map(tour => ({id:`legacy-${tour.id}`,tour_id:tour.id,title:tour.title}));
  const submitted = () => {setReview(null);setNotice("Thank you. Your review is awaiting approval.");reload();};
  const openReview = (id: string | number) => { setReview(id); requestAnimationFrame(() => document.getElementById("leave-review")?.scrollIntoView({behavior:"smooth",block:"start"})); };
  return <>
    <p className="customer-intro">Welcome, {account.customer.name}.</p>
    {notice && <p className="customer-notice" role="status">{notice}</p>}
    <BookingSearch />
    <OrderHistory key={account.customer.id} initial={account.inquiries} entitlements={entitlements} onReview={openReview} />
    <ReviewsSection account={account} entitlements={entitlements} review={review} setReview={setReview} onSubmitted={submitted} />
    {account.customer.referral_enabled === true && <ShareSite />}
  </>;
}

function OrderHistory({initial,entitlements,onReview}:{initial:AccountData["inquiries"];entitlements:Entitlement[];onReview:(id:string|number)=>void}) {
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
    } catch(reason) {setError(reason instanceof Error?reason.message:"Your order history could not be loaded. Please try again.");}
    finally {setBusy(false);}
  }
  // General Contact messages are inquiries, not orders.
  const orders = history.items.filter(item => item.kind !== "contact");
  return <section className="account-block" aria-labelledby="order-history-title">
    <h2 id="order-history-title">Order History</h2>
    {orders.length ? <ul className="order-list">{orders.map(item => {
      const status = orderStatus[item.status];
      const entitlement = item.status === "completed" ? entitlements.find(row => row.inquiry_id === item.id) : undefined;
      return <li key={item.id} className="order-card">
        <div className="order-card-head"><h3>{item.title}</h3><span className={`order-status order-status-${status.tone}`}>{status.label}</span></div>
        {status.note && <p className="order-status-note">{status.note}</p>}
        <dl className="order-details">
          <dt>Tour date</dt><dd>{tourDateLabel(item)}</dd>
          {item.pickup_place && <><dt>Pickup</dt><dd>{item.pickup_place}{item.pickup_time ? ` · ${item.pickup_time}` : ""}</dd></>}
          <dt>Ordered</dt><dd>{item.submitted_at ? <time dateTime={item.submitted_at}>{formatDate(item.submitted_at, true)}</time> : "Date unavailable"}</dd>
        </dl>
        {entitlement && <button type="button" className="button button-outline" onClick={() => onReview(entitlement.id)}>Leave a Review</button>}
      </li>;
    })}</ul> : !history.has_more && <div className="order-empty"><p>You have no orders yet.</p><Link className="button" href="/">Explore Bali Tours</Link></div>}
    {error && <p className="customer-error" role="alert">{error}</p>}
    {history.has_more && <button type="button" className="button button-outline order-more" disabled={busy} onClick={more}>{busy?"Loading orders…":error?"Retry loading orders":"Load more orders"}</button>}
  </section>;
}

function ReviewsSection({account,entitlements,review,setReview,onSubmitted}:{account:AccountData;entitlements:Entitlement[];review:string|number|null;setReview:(id:string|number|null)=>void;onSubmitted:()=>void}) {
  const selected = entitlements.find(item => item.id === review);
  const booking = (item: Entitlement) => account.inquiries.items.find(order => order.id === item.inquiry_id);
  return <section id="reviews" className="account-block" aria-labelledby="reviews-title">
    <h2 id="reviews-title">Reviews</h2>
    {/* One row per unused review entitlement: each completed booking funds one review of its Tour. */}
    <h3 id="leave-review" className="account-subheading">Ready to review</h3>
    {entitlements.length ? <ul className="account-list">{entitlements.map(item => { const order = booking(item); const date = order?.booking_date ?? order?.travel_date; return <li key={String(item.id)}><div><strong>{item.title}</strong>{date && <p className="field-help">Tour on {formatDate(date)}</p>}</div><button className="button button-outline" onClick={()=>setReview(review===item.id?null:item.id)} aria-expanded={review===item.id}>{review===item.id ? "Close review form" : "Leave Review"}</button></li>; })}</ul> : <p className="account-empty-review">You can leave a review after Shalom Bali Tour marks your booking as completed.</p>}
    {selected && <ReviewForm key={String(selected.id)} tourId={selected.tour_id} entitlementId={selected.id} onSubmitted={onSubmitted} title={selected.title} />}
    <h3 className="account-subheading">My Reviews</h3>
    {account.reviews.length ? <ul className="account-list">{account.reviews.map((item,i)=><li key={item.id??i}><div><strong>{item.title}</strong><ReviewStatus status={item.status}/><p className="customer-experience">{item.experience}</p></div></li>)}</ul> : <p className="account-empty-review">You have not submitted any reviews yet.</p>}
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
