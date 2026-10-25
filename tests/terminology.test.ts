import test from "node:test";
import assert from "node:assert/strict";
import { itineraryTitle } from "../src/lib/format";

test("WordPress Tour titles read as itineraries without touching the brand", () => {
  const cases: [string, string][] = [
    ["A. Uluwatu, Beach & Jimbaran Tour", "A. Uluwatu, Beach & Jimbaran Itinerary"],
    ["B. ATV, Uluwatu & Sunset Tour", "B. ATV, Uluwatu & Sunset Itinerary"],
    ["C. Family Watersport & Uluwatu Tour", "C. Family Watersport & Uluwatu Itinerary"],
    ["E. Watersport & Spa Tour", "E. Watersport & Spa Itinerary"],
    ["F. ATV, Spa & Jimbaran Sunset Tour", "F. ATV, Spa & Jimbaran Sunset Itinerary"],
    ["F. Bali Safari Tour for Kids", "F. Bali Safari Itinerary for Kids"],
    ["A. Temple Tour", "A. Temple Itinerary"],
    ["Customized Tour", "Customized Itinerary"],
    ["South Kuta Tours", "South Kuta Itineraries"],
    ["D. South Kuta Fun & Fun", "D. South Kuta Fun & Fun"],
    ["Touring Tourism Detour", "Touring Tourism Detour"],
    ["Shalom Bali Tour", "Shalom Bali Tour"],
    ["Ubud Tour by Shalom Bali Tour", "Ubud Itinerary by Shalom Bali Tour"],
  ];
  for (const [title, expected] of cases) assert.equal(itineraryTitle(title), expected, title);
  assert.equal(itineraryTitle(itineraryTitle("A. Ubud Tour")), "A. Ubud Itinerary");
});
