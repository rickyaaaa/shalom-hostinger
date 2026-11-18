"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { accountSchema, previousTourResult, type CustomerAccount as AccountData } from "@/lib/customer-types";
import { customerFetch, customerUpload } from "@/lib/customer-client";
import { ReviewPhotoPicker, type PickedPhoto } from "./ReviewPhotoPicker";
import { ReviewPhotos } from "./ReviewPhotos";
import { useCustomerSession } from "./CustomerSession";
import { intentQuery,type BookingIntent } from "@/lib/booking-intent";
import { ShareSite } from "./ShareSite";
import { areas, type Package } from "./BookingForm";
import { formatDate, orderNumber, orderStatus, tourDateLabel } from "@/lib/account-display";
import { itineraryTitle, money } from "@/lib/format";
import { scrollToAnchor } from "@/lib/anchor";

function ReviewForm({onSubmitted,title,tourId,entitlementId,context,publishes=false}:{onSubmitted:(published:boolean)=>void;title:string;tourId:number;entitlementId?:string|number;context?:string;publishes?:boolean}) {
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");
  const [photos,setPhotos] = useState<PickedPhoto[]>([]);
  // Previews are object URLs; release them when the form closes.
  const previews = useRef<PickedPhoto[]>([]);
  previews.current = photos;
  useEffect(() => () => previews.current.forEach(photo => URL.revokeObjectURL(photo.url)), []);
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return; setBusy(true); setError("");
    // WordPress decides: a review from a completed order publishes now; a previous-itinerary review awaits approval.
    const fields: Record<string, unknown> = {...Object.fromEntries(new FormData(event.currentTarget)),tour_id:tourId,...(entitlementId === undefined ? {} : {entitlement_id:entitlementId})};
    try {
      let result;
      if (photos.length) {
        // 1.36: a review with photos goes as multipart; without photos it stays JSON.
        const form = new FormData();
        for (const [key, value] of Object.entries(fields)) form.set(key, String(value));
        photos.forEach(photo => form.append("photos", photo.file));
        result = await customerUpload("reviews", form);
      } else result = await customerFetch("reviews", fields);
      onSubmitted(result?.status === "approved");
    }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Please try again."); setBusy(false); }
  }
  return <form className="customer-form" onSubmit={submit} aria-busy={busy}>
    <h3 id="review-form-title" tabIndex={-1}>Review {itineraryTitle(title)}</h3>{context && <p className="review-context">{context}</p>}<p>{publishes ? "Your review will be published right away." : "Your review will appear publicly after approval."}</p>
    {error && <p role="alert" className="customer-error">{error}</p>}
    <div className="customer-columns">{[["driving_skill","Driving Skill"],["service","Service"],["car","Car"]].map(([key,label])=><label key={key}>{label}<select name={key} required defaultValue=""><option value="">Choose 1–10</option>{Array.from({length:10},(_,i)=><option key={i} value={i+1}>{i+1}</option>)}</select></label>)}</div>
    <label>Was the itinerary worth it?<select name="price" required defaultValue=""><option value="">Choose an answer</option><option value="worth_it">Worth it</option><option value="not_worth_it">Not worth it</option></select></label>
    <label>Would you recommend us?<select name="recommend" required defaultValue=""><option value="">Choose an answer</option><option value="yes">Yes</option><option value="no">No</option></select></label>
    <label>Your Experience<textarea name="experience" required maxLength={1000} rows={5} /><span className="field-help">Up to 1,000 characters.</span></label>
    <ReviewPhotoPicker photos={photos} onChange={setPhotos} disabled={busy} />
    <button className="button" disabled={busy}>{busy ? (photos.length ? "Uploading photos…" : "Submitting review…") : "Submit Review"}</button>
  </form>;
}

type Entitlement = NonNullable<AccountData["review_entitlements"]>[number];
type PreviousTourReviews = NonNullable<AccountData["previous_tour_reviews"]>;

/** "Ubud · 14 Jul 2023 · Pickup: Svara Hotel" for a previous-tour slot. */
function previousTourLine(previous: NonNullable<Entitlement["previous_tour"]>) {
  return [previous.area, previous.tour_date && formatDate(previous.tour_date), previous.pickup_place && `Pickup: ${previous.pickup_place}`].filter(Boolean).join(" · ");
}

// Shared guest/loading/error handling for every signed-in account page.
export function AccountGate({ title, wide = false, intent = null, children }: { title: string; wide?: boolean; intent?: BookingIntent | null; children: (account: AccountData, reload: () => void) => ReactNode }) {
  const {account,guest,error,loading,reload}=useCustomerSession();
  const load = () => {void reload();};
  const suffix = intentQuery(intent);
  // A guest arriving with a Tour to order signs in first; the intent comes back here afterwards.
  useEffect(()=>{if(guest&&intent)window.location.replace(`/login${suffix}`);},[guest,intent,suffix]);
  return <section className="customer-section account-section"><div className={`customer-panel${wide ? " account-panel" : ""}`}>
    <h1>{title}</h1>
    {!guest && error && !account && <p className="customer-error" role="alert">{error} <button className="text-button" onClick={load}>Retry</button></p>}
    {guest ? <p><Link className="button" href={`/login${suffix}`}>Log In</Link> <Link href={`/register${suffix}`}>Sign Up</Link></p> : loading && !account ? <p role="status">Loading your account…</p> : account && children(account, load)}
  </div></section>;
}

/** WordPress-configured Shalom WhatsApp when the backend provides it; otherwise the site contact section. */
export function supportHref(account: AccountData | null) { return account?.support_whatsapp_url ?? "/#contact"; }


export function CustomerAccount() {
  return <AccountGate title="My Account" wide>{(account, reload) => <AccountDashboard account={account} reload={reload} />}</AccountGate>;
}

type ReviewFocus = "review-form-title" | "leave-review" | "previous-tour-title" | "review-notice";

function AccountDashboard({ account, reload }: { account: AccountData; reload: () => void }) {
  const [review,setReview] = useState<string|number|null>(null);
  const [notice,setNotice] = useState("");
  const [focusRequest, setFocusRequest] = useState<{ id: ReviewFocus }>();
  // A just-bound previous-tour slot shows immediately; the account reload then lists it as well.
  const [bound,setBound] = useState<Entitlement|null>(null);
  const listed: Entitlement[] = account.review_entitlements ?? account.completed_tours.filter(tour => tour.can_review).map(tour => ({id:`legacy-${tour.id}`,tour_id:tour.id,title:tour.title}));
  const entitlements = bound && !listed.some(item => item.id === bound.id) && review === bound.id ? [...listed, bound] : listed;
  const previousTours = account.previous_tour_reviews;
  const canAddPreviousTour = previousTours?.eligible === true && previousTours.remaining > 0;
  const canWriteReview = entitlements.length > 0 || canAddPreviousTour;

  useEffect(() => {
    if (!focusRequest) return;
    const target = document.getElementById(focusRequest.id);
    if (!target) return;
    target.focus({ preventScroll: true });
    scrollToAnchor(target);
  }, [focusRequest]);

  function openReview(id: Entitlement["id"]) {
    setReview(id);
    setFocusRequest({ id: "review-form-title" });
  }

  function startReview() {
    if (entitlements.length === 1) {
      openReview(entitlements[0].id);
    } else if (entitlements.length > 1) {
      setFocusRequest({ id: "leave-review" });
    } else if (canAddPreviousTour) {
      setFocusRequest({ id: "previous-tour-title" });
    }
  }

  function submitted(published: boolean) {
    setReview(null);
    setBound(null);
    setNotice(published ? "Thank you. Your review is now published." : "Thank you. Your review is awaiting approval.");
    setFocusRequest({ id: "review-notice" });
    reload();
  }

  return <>
    <p className="customer-intro">Welcome, {account.customer.name}.</p>
    <div className="account-actions">
      {canWriteReview && <button className="button" type="button" onClick={startReview}>Write a Review</button>}
      <Link className={canWriteReview ? "button button-outline" : "button"} href="/#itineraries">Book a Tour</Link>
    </div>
    {notice && <p id="review-notice" className="customer-notice" role="status" tabIndex={-1}>{notice}</p>}
    <OrderHistory key={account.customer.id} initial={account.inquiries} entitlements={entitlements} onReview={openReview} />
    {previousTours?.eligible && <PreviousTourSection summary={previousTours} onBound={row => {setBound(row);setNotice("");openReview(row.id);reload();}} />}
    <ReviewsSection account={account} entitlements={entitlements} review={review} onOpen={openReview} onClose={() => setReview(null)} onSubmitted={submitted} />
    {account.customer.referral_enabled === true && <ShareSite referralSlug={account.referral?.slug ?? null} />}
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
  // General Contact messages are inquiries, not orders. Grouped by the WordPress status only; a past travel date never completes an order.
  const orders = history.items.filter(item => item.kind !== "contact");
  const groups = [
    { key: "open", title: "Not completed", items: orders.filter(item => item.status === "inquiry" || item.status === "confirmed" || item.status === "unavailable") },
    { key: "completed", title: "Completed", items: orders.filter(item => item.status === "completed") },
    { key: "cancelled", title: "Cancelled", items: orders.filter(item => item.status === "cancelled") },
  ].filter(group => group.items.length);
  const card = (item: (typeof orders)[number]) => {
      const status = orderStatus[item.status];
      const entitlement = item.status === "completed" ? entitlements.find(row => row.inquiry_id === item.id) : undefined;
      return <li key={item.id} className="order-card">
        {item.order_code && <p className="order-code">Order <strong>{orderNumber(item.order_code, item.order_number)}</strong></p>}
        <div className="order-card-head"><h3>{itineraryTitle(item.title)}</h3><span className={`order-status order-status-${status.tone}`}>{status.label}</span></div>
        {status.note && <p className="order-status-note">{status.note}</p>}
        <dl className="order-details">
          <dt>Travel date</dt><dd>{tourDateLabel(item)}</dd>
          {item.pickup_place && <><dt>Pickup</dt><dd>{item.pickup_place}{item.pickup_time ? ` · ${item.pickup_time}` : ""}</dd></>}
          {item.quote && <><dt>Quoted price</dt><dd>{money(item.quote.amount, item.quote.currency)}{item.quote.per_car ? " per car" : ""}{item.quote.currency !== "IDR" && item.quote.rate_date ? ` · indicative rate ${formatDate(item.quote.rate_date)}` : ""}</dd></>}
          <dt>Ordered</dt><dd>{item.submitted_at ? <time dateTime={item.submitted_at}>{formatDate(item.submitted_at, true)}</time> : "Date unavailable"}</dd>
        </dl>
        {entitlement && <button type="button" className="button button-outline" onClick={() => onReview(entitlement.id)}>Leave a Review</button>}
      </li>;
  };
  return <section className="account-block" aria-labelledby="order-history-title">
    <h2 id="order-history-title">Order History</h2>
    {orders.length ? groups.map(group => <div key={group.key} className="order-group">
      <h3 className="account-subheading" id={`orders-${group.key}`}>{group.title} <span className="order-group-count">({group.items.length})</span></h3>
      <ul className="order-list" aria-labelledby={`orders-${group.key}`}>{group.items.map(card)}</ul>
    </div>) : !history.has_more && <p className="order-empty">You have no orders yet.</p>}
    {error && <p className="customer-error" role="alert">{error}</p>}
    {history.has_more && <button type="button" className="button button-outline order-more" disabled={busy} onClick={more}>{busy?"Loading orders…":error?"Retry loading orders":"Load more orders"}</button>}
  </section>;
}

function ReviewsSection({account,entitlements,review,onOpen,onClose,onSubmitted}:{account:AccountData;entitlements:Entitlement[];review:Entitlement["id"]|null;onOpen:(id:Entitlement["id"])=>void;onClose:()=>void;onSubmitted:(published:boolean)=>void}) {
  const selected = entitlements.find(item => item.id === review);
  const booking = (item: Entitlement) => account.inquiries.items.find(order => order.id === item.inquiry_id);
  return <section id="reviews" className="account-block" aria-labelledby="reviews-title">
    <h2 id="reviews-title">Reviews</h2>
    {/* One row per unused review entitlement: each completed booking funds one review of its Tour. */}
    <h3 id="leave-review" className="account-subheading" tabIndex={-1}>{entitlements.length > 1 ? "Choose a tour to review" : "Ready to review"}</h3>
    {entitlements.length ? <ul className="account-list">{entitlements.map(item => {
      const order = booking(item);
      const date = order?.booking_date ?? order?.travel_date;
      const isOpen = review === item.id;
      const label = item.previous_tour ? "Continue Review" : "Leave Review";
      return <li key={String(item.id)}>
        <div><strong>{itineraryTitle(item.title)}</strong>{item.previous_tour ? <p className="field-help">Previous itinerary · {previousTourLine(item.previous_tour)}</p> : date && <p className="field-help">Travel date {formatDate(date)}</p>}</div>
        <button type="button" className="button button-outline" onClick={() => isOpen ? onClose() : onOpen(item.id)} aria-expanded={isOpen}>{isOpen ? "Close review form" : label}</button>
      </li>;
    })}</ul> : <p className="account-empty-review">{account.previous_tour_reviews?.eligible && account.previous_tour_reviews.remaining > 0 ? "Enter your past tour details above to start a review." : "You can leave a review after Shalom Bali Tour marks your booking as completed."}</p>}
    {selected && <ReviewForm key={String(selected.id)} tourId={selected.tour_id} entitlementId={selected.id} onSubmitted={onSubmitted} publishes={selected.source === "booking"} title={selected.title} context={selected.previous_tour ? `Your previous itinerary: ${previousTourLine(selected.previous_tour)}` : undefined} />}
    <h3 className="account-subheading">My Reviews</h3>
    {account.reviews.length ? <ul className="account-list">{account.reviews.map((item,i)=><li key={item.id??i}><div><strong>{itineraryTitle(item.title)}</strong><ReviewStatus status={item.status}/><p className="customer-experience">{item.experience}</p><ReviewPhotos photos={item.photos} label="Your photos" /></div></li>)}</ul> : <p className="account-empty-review">You have not submitted any reviews yet.</p>}
  </section>;
}

/** WordPress saves the past tour details and returns a review entitlement. */
function PreviousTourSection({summary,onBound}:{summary:PreviousTourReviews;onBound:(row:Entitlement)=>void}) {
  const [area,setArea] = useState("");
  const [packages,setPackages] = useState<Package[]|null>(null);
  const [packagesError,setPackagesError] = useState("");
  const [tourId,setTourId] = useState("");
  const [date,setDate] = useState("");
  const [place,setPlace] = useState("");
  const [error,setError] = useState("");
  const [busy,setBusy] = useState(false);
  useEffect(() => {
    setTourId(""); setPackages(null); setPackagesError("");
    if (!area) return;
    const controller = new AbortController();
    fetch(`/api/tours?area=${encodeURIComponent(area)}`, { cache: "no-store", signal: controller.signal })
      .then(async response => { const value = await response.json(); if (!response.ok) throw new Error(); setPackages(value.items); })
      .catch(() => { if (!controller.signal.aborted) setPackagesError("Itineraries could not be loaded. Please try again."); });
    return () => controller.abort();
  }, [area]);
  const today = new Date().toISOString().slice(0, 10);
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!area) { setError("Choose the area of your previous itinerary."); return; }
    if (!tourId) { setError("Choose the itinerary you took."); return; }
    if (!date) { setError("Choose your previous travel date."); return; }
    if (date > today) { setError("The previous travel date cannot be in the future."); return; }
    if (!place.trim()) { setError("Enter your pickup place or hotel."); return; }
    setBusy(true); setError("");
    try {
      const result = previousTourResult.parse(await customerFetch("previous-tour", { area, tour_id: Number(tourId), tour_date: date, pickup_place: place.trim() }));
      setArea(""); setDate(""); setPlace("");
      onBound(result.entitlement);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Please try again."); }
    finally { setBusy(false); }
  }
  return <section className="account-block previous-tour" aria-labelledby="previous-tour-title">
    <h2 id="previous-tour-title" tabIndex={-1}>Review a Past Tour</h2>
    <p className="account-block-intro">Traveled with Shalom Bali Tour before? Tell us which itinerary you took, then share your experience.</p>
    {summary.remaining > 0 && <p className="previous-tour-count">Past tour reviews remaining: <strong>{summary.remaining}</strong></p>}
    {summary.remaining > 0 ? <form className="booking-search-form" onSubmit={submit} noValidate aria-busy={busy}>
      <div className="booking-search-fields">
        <label className="booking-search-field">Previous Itinerary Area<select value={area} onChange={event => setArea(event.target.value)} required><option value="">Choose the area</option>{areas.map(item => <option key={item.slug} value={item.slug}>{item.label}</option>)}</select></label>
        <label className="booking-search-field">Previous Itinerary<select value={tourId} onChange={event => setTourId(event.target.value)} required disabled={!packages?.length}><option value="">{!area ? "Choose the area first" : packages ? (packages.length ? "Choose the itinerary you took" : "No itineraries available") : packagesError ? "Unavailable" : "Loading itineraries…"}</option>{packages?.map(item => <option key={item.id} value={item.id}>{itineraryTitle(item.title)}</option>)}</select>{packagesError && <span className="field-help">{packagesError}</span>}</label>
        <label className="booking-search-field">Previous Travel Date<input type="date" value={date} max={today} onChange={event => setDate(event.target.value)} required /><span className="field-help">The date you traveled (approximate is fine).</span></label>
        <label className="booking-search-field">Pickup Place / Hotel<input type="text" value={place} maxLength={200} autoComplete="off" placeholder="e.g. Svara by Mazari, Uluwatu" onChange={event => setPlace(event.target.value)} required /></label>
      </div>
      <button className="button booking-search-submit" type="submit" disabled={busy}>{busy ? "Saving tour details…" : "Continue to Review"}</button>
      {error && <p className="customer-error booking-search-error" role="alert">{error}</p>}
    </form> : <p className="account-empty-review">You have used all {summary.limit} previous-itinerary review opportunities. Complete a new booking to leave another review.</p>}
    {summary.items.length > 0 && <><h3 className="account-subheading">Your previous itineraries</h3><ul className="account-list">{summary.items.map((item,i) => <li key={i}><div><strong>{itineraryTitle(item.title)}</strong><p className="field-help">{previousTourLine(item)}</p></div><p className="review-status">{item.status === "submitted" ? "Review submitted" : "Ready to review"}</p></li>)}</ul></>}
  </section>;
}

const reviewStatusLabels = { pending: "Pending review", approved: "Published", rejected: "Rejected", unavailable: "Unavailable" } as const;
export function ReviewStatus({status}:{status:keyof typeof reviewStatusLabels}){return <p className={`review-status review-status-${status}`}>{reviewStatusLabels[status]}</p>;}
