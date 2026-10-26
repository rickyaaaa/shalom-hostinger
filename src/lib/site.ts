import "server-only";
import type { SiteLinks } from "./types";

export function siteLinks(): SiteLinks {
  return {
    southKuta: "/south-kuta", westBali: "/west-bali",
    concerns: "/#answer", about: "/#about",
    customBooking: "/account?booking=custom#order-tour",
  };
}
