"use client";
import { usePathname } from "next/navigation";
import { csWhatsApp } from "@/lib/marketing";

/** Order, account and sign-in pages have their own WhatsApp step; a floating button there would cover form buttons. */
const hiddenOn = /^\/(book|account|login|register|forgot-password|reset-password|request-help|ref)(\/|$)/;

/** Click-to-WhatsApp bubble, bottom right on every public page: opens a chat with Shalom on the footer's WhatsApp number. */
export function WhatsAppBubble() {
  if (hiddenOn.test(usePathname() ?? "")) return null;
  return <a className="wa-bubble" href={csWhatsApp} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp" title="Chat with us on WhatsApp">
    <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true" focusable="false"><path fill="currentColor" d="M16.04 3C8.86 3 3.03 8.82 3.03 16c0 2.3.6 4.53 1.74 6.5L3 29l6.67-1.74A12.94 12.94 0 0 0 16.04 29C23.2 29 29 23.18 29 16S23.2 3 16.04 3Zm0 23.8c-1.98 0-3.9-.53-5.6-1.53l-.4-.24-3.96 1.04 1.06-3.86-.26-.4A10.76 10.76 0 0 1 5.23 16c0-5.96 4.85-10.8 10.81-10.8 5.95 0 10.77 4.84 10.77 10.8 0 5.96-4.82 10.8-10.77 10.8Zm5.92-8.08c-.32-.16-1.92-.95-2.22-1.06-.3-.11-.51-.16-.73.16-.22.33-.84 1.06-1.03 1.28-.19.22-.38.24-.7.08-.33-.16-1.38-.51-2.62-1.62-.97-.86-1.62-1.93-1.81-2.25-.19-.33-.02-.5.14-.66.15-.15.33-.38.49-.57.16-.19.22-.33.33-.54.1-.22.05-.41-.03-.57-.08-.16-.73-1.76-1-2.41-.26-.63-.53-.55-.73-.56h-.62c-.22 0-.57.08-.86.41-.3.32-1.14 1.11-1.14 2.71s1.16 3.14 1.33 3.36c.16.22 2.29 3.5 5.55 4.9.78.34 1.38.54 1.86.69.78.25 1.49.21 2.05.13.63-.09 1.92-.78 2.19-1.54.27-.76.27-1.41.19-1.54-.08-.14-.3-.22-.62-.38Z"/></svg>
  </a>;
}
