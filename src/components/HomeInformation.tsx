import { Suspense } from "react";
import Image from "next/image";
import { benefits,faqs } from "@/lib/marketing";
import { getBookingTerms } from "@/lib/wordpress";
import { wordpressConfig } from "@/lib/config";
export function WhyChooseUs(){
  const site=wordpressConfig().site;
  return <section className="why-section"><div className="information-inner why-grid"><div><p className="section-label">WHY CHOOSE SHALOM BALI TOUR</p><h2>Your Trusted Bali Travel Partner</h2><div className="why-image"><Image src="/images/west-bali.jpeg" alt="A waterside temple in Bali" width={800} height={600} sizes="(max-width:767px) 100vw, 42vw"/><div><span>Follow Us:</span><a href="https://www.tiktok.com/@shalombalitrans" target="_blank" rel="noreferrer">TikTok</a></div></div></div><div className="benefits-grid">{benefits.map(item=><article key={item.title}><Image src={`${site}/wp-content/uploads/2026/09/${item.image}`} alt="" width={64} height={64}/><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></div></section>;
}
export function FAQ(){return <section className="faq-section" id="answer"><div className="information-inner"><p className="section-label">FREQUENTLY ASKED</p><h2>Answers For Your Travel Concerns</h2><div className="faq-list">{faqs.map((faq,i)=><details key={faq.question} name="travel-faq" open={i===0}><summary>{faq.question}</summary>{"terms" in faq ? <Suspense fallback={<p>Loading…</p>}><BookingTermsAnswer/></Suspense> : faq.answer.split("\n\n").map((paragraph,j)=><p key={j}>{paragraph}</p>)}</details>)}</div></div></section>;}
/** NOT INCLUDING / INCLUDE as WordPress defines them for the WhatsApp NB, so the FAQ never keeps its own copy. */
async function BookingTermsAnswer(){
  const terms=await getBookingTerms().catch(()=>null);
  if(!terms)return <p>These details are temporarily unavailable. Please try again shortly.</p>;
  const groups=([["NOT INCLUDING",terms.not_included],["INCLUDE",terms.included]] as const).filter(([,items])=>items.length);
  return <>{groups.map(([label,items])=><div key={label} className="faq-terms"><p className="faq-terms-label">{label}</p><ul>{items.map(item=><li key={item}>{item}</li>)}</ul></div>)}</>;
}
export function AboutSection(){return <section className="about-section" id="about"><div className="information-inner about-grid"><div><p className="section-label">ABOUT SHALOM BALI TOUR</p><h2>Your Trusted Bali Travel Partner</h2><p className="about-copy">Since 2016, Shalom Bali Tour has been helping travelers explore Bali through private, flexible itineraries and professional drivers. We focus on providing a comfortable, safe, and personal travel experience, whether you choose one of our recommended itineraries or create your own.</p></div><div className="about-facts"><p><strong>Since 2016</strong><span>Serving Bali Travelers</span></p><p><strong>3</strong><span>South Kuta, Ubud &amp; West Bali</span></p></div></div></section>;}
