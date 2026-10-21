import type { Tour } from "@/lib/types";
import styles from "./WestBali.module.css";

// Client-approved West Bali presentation only. Canonical WordPress values are not rewritten.
export const westBaliPriceNote = "Note : The price listed will remain the same at the time you place your order, but it may change in the future, depending on the circumstances and conditions at that time.";
const cardTitles: Readonly<Record<number,string>> = {
  633: "A. Temple Tour", 644: "B. Trekking Tour", 651: "C. Healing Tour", 655: "D. Relaxing Tour",
};
const supersededFragments = new Set(["NB:“NOT INCLUDING”", "NB:\nNOT"]);

export function westBaliCardPresentation(tour: Tour) {
  const originalNote = tour.price_note?.trim() || "";
  // Replace only the two known incomplete NB fragments in this page's display.
  // Preserve other supplied text, including the unchanged Trekking start-time wording.
  const additionalNote = supersededFragments.has(originalNote) ? "" : originalNote.replace(westBaliPriceNote, "").trim();
  return { title: cardTitles[tour.id] || tour.title, priceNote: westBaliPriceNote, additionalNote };
}

export function WestBaliNotice() {
  return <section className={styles.noticeSection} aria-label="West Bali tour inclusions and exclusions">
    <div className={styles.notice}>
      <div className={styles.noticeColumn}>
        <h2>NB: <span>NOT INCLUDING</span></h2>
        <ul><li>ticket entrace</li><li>activities payment</li><li>lunch</li></ul>
      </div>
      <div className={styles.noticeColumn}>
        <h2>INCLUDE</h2>
        <ul><li>driver</li><li>fuel</li><li>parking ticket</li><li>more than 10hours will extra charges 100.000idr/hours</li></ul>
      </div>
    </div>
  </section>;
}
