"use client";

import { useEffect, useRef, useState } from "react";
import { reviewPageSchema, type ReviewPage } from "@/lib/types";
import { ReviewEntry } from "./ReviewEntry";
import { ReviewScore } from "./ReviewScore";
import { Icon } from "./Icon";

export function ReviewModal({ tourId, title }: { tourId: number; title: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<ReviewPage | null>(null);
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open) return;
    const element = dialog.current!;
    element.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { element.close(); document.body.style.overflow = previous; trigger.current?.focus(); };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setBusy(true); setError(false);
    fetch(`/api/tours/${tourId}/reviews?page=${page}`, { cache: "no-store", signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error("unavailable");
        return reviewPageSchema.parse(await response.json());
      })
      .then(next => setData(previous => page === 1 || !previous ? next : { ...next, reviews: [...previous.reviews, ...next.reviews] }))
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => controller.abort();
  }, [open, page, attempt, tourId]);

  const close = () => setOpen(false);
  return <>
    <button ref={trigger} type="button" className="button button-outline" aria-haspopup="dialog" onClick={() => { setData(null); setPage(1); setOpen(true); }}>Reviews</button>
    <dialog ref={dialog} className="reviews-dialog" aria-labelledby={`reviews-${tourId}-title`} onKeyDown={event => {
      if(event.key!=="Tab")return;
      const items=Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')).filter(item=>item.tabIndex>=0 && item.getClientRects().length>0 && !item.closest("[inert]"));
      const first=items[0],last=items.at(-1);
      if(!first){event.preventDefault();return;}
      const active=document.activeElement;
      if(event.shiftKey && (active===first || !event.currentTarget.contains(active))){event.preventDefault();last!.focus();}
      else if(!event.shiftKey && (active===last || !event.currentTarget.contains(active))){event.preventDefault();first.focus();}
    }} onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close(); } }}>
      <div className="modal-header"><h2 id={`reviews-${tourId}-title`}>{data?.title || title}</h2><button type="button" className="icon-button" aria-label="Close reviews" onClick={close} autoFocus><Icon name="close" /></button></div>
      <div className="modal-body">
        {data && <ReviewScore rating={data.summary} large />}
        {busy && <p className="status-message" role="status">Loading reviews…</p>}
        {error && <div className="review-error" role="alert"><p>Reviews couldn’t be loaded. Please try again.</p><button type="button" className="button button-outline" onClick={() => setAttempt(attempt + 1)} disabled={busy}>Try again</button></div>}
        {data && data.reviews.length === 0 && !busy && <p className="status-message">No reviews yet for this tour.</p>}
        {data && data.reviews.map((review, index) => <ReviewEntry key={`${review.published_at}-${review.name}-${index}`} review={review} />)}
        {data?.has_more && data.next_page && !error && <button type="button" className="button button-outline load-more" disabled={busy} onClick={() => setPage(data.next_page!)}>{busy ? "Loading…" : "Load more reviews"}</button>}
      </div>
    </dialog>
  </>;
}
