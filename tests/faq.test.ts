import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { faqs } from "../src/lib/marketing";
import { bookingTermsSchema } from "../src/lib/types";

const answer = (question: string) => { const faq = faqs.find(item => item.question === question); return faq && "answer" in faq ? faq.answer : undefined; };

test("FAQ uses the client-approved questions and answers", () => {
  assert.equal(answer("How do I order a Bali tour?"), "You can sign up, then select your preferred itinerary, specify the pickup date and time, and provide the name of the hotel or resort where you are staying.");
  assert.equal(answer("The itinerary I wanted isn't here"), "No need to worry, we provide option for this, you can choose the Customized Itinerary section.");
  assert.equal(answer("How long is the tour and can I take a short tour?"), "The trip duration is 10 hours, calculated from the agreed-upon pickup time. If the duration exceeds 10 hours, an additional charge will apply. We exclusively offer 10-hour daily tour services, as we specialize in private, 10-hour day tours.");
  assert.deepEqual(answer("What happens if I need to cancel?")?.split("\n\n"), [
    "If you wish to cancel, please provide notification as soon as possible.",
    "Once an agreement has been reached, cancellations are no longer permitted, and you remain obligated to pay the full, agreed-upon amount.",
    "This policy includes full payment for any booked activities, and the timeframe for the engagement is calculated from the moment the agreement is made.",
    "Thank you.",
  ]);
});

test("Superseded FAQ wording is gone; included and not included are one item", () => {
  const all = JSON.stringify(faqs);
  for (const old of ["up to 10 hours", "contact us via WhatsApp", "How do I book a Bali itinerary?", "What is included in the itinerary price?", "What is not included in the itinerary price?", "cancellation charges may apply"]) assert.equal(all.includes(old), false, old);
  const combined = faqs.filter(item => "terms" in item);
  assert.equal(combined.length, 1);
  assert.equal(combined[0].question, "What is included and not included in the itinerary?");
});

test("The FAQ keeps no copy of the NB terms: they come from WordPress, like the WhatsApp NB", () => {
  const source = fs.readFileSync(path.join(import.meta.dirname, "../src/lib/marketing.ts"), "utf8");
  for (const term of ["ticket entrance", "activities booking", "parking ticket", "100.000idr"]) assert.equal(source.includes(term), false, term);
  const terms = { not_included: ["ticket entrance", "activities booking", "lunch"], included: ["driver", "fuel", "parking ticket", "more than 10hours will extra charges 100.000idr/hours"] };
  assert.deepEqual(bookingTermsSchema.parse(terms), terms);
  assert.equal(bookingTermsSchema.safeParse({ not_included: "lunch", included: [] }).success, false);
});
