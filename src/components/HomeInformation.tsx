import { Suspense } from "react";
import Image from "next/image";
import { benefits,faqs,howItWorks,tiktokProfile } from "@/lib/marketing";
import { getBookingTerms, getItineraries } from "@/lib/wordpress";
import { pickItineraryPhotos } from "@/lib/itinerary-photos";
import { PhotoSlider } from "./PhotoSlider";
import { wordpressConfig } from "@/lib/config";
import { Icon } from "./Icon";
/** Targets "bali private driver", "driver at/in bali" and "bali private tour" with facts already published on the site (10 hours, private car, fuel and parking, pickup). */
export function DriverSection(){return <section className="driver-section" id="private-driver" aria-labelledby="driver-title"><div className="information-inner driver-grid"><div><p className="section-label">PRIVATE DRIVER</p><h2 id="driver-title">Your Bali Private Driver for the Day</h2><p className="driver-copy">Looking to hire a driver in Bali for the day? Every Bali private tour from Shalom includes a private car and your own driver for 10 hours, with fuel and parking included. Only you and your group travel in the car, so there is no need to hire a separate driver in Bali.</p><p className="driver-copy">Your driver picks you up at your hotel or pickup place and follows the itinerary you booked. The order of the stops is agreed with our team when you reconfirm on WhatsApp, and if you would rather plan the day yourself, a customized itinerary lets you choose the destinations.</p><div className="driver-actions"><a href="#itineraries" className="button">Choose an Itinerary</a><a href="#customizedtour" className="button button-outline">Customize Your Itinerary</a></div></div><ul className="driver-facts">{["Private car and driver, no shared seats","10 hours with your driver","Fuel and parking included","Pickup from your hotel or pickup place","Ubud, Uluwatu & South Kuta and West Bali & North Bali itineraries"].map(item=><li key={item}><Icon name="check"/>{item}</li>)}</ul></div></section>;}
export function WhyChooseUs(){
  const site=wordpressConfig().site;
  return <section className="why-section"><div className="information-inner why-grid"><div><p className="section-label">WHY CHOOSE SHALOM</p><h2>Why Choose Shalom Bali Tour?</h2><p className="why-intro">Enjoy a more personal way to explore Bali with a private driver, flexible travel plans, and local assistance throughout your journey.</p><div className="why-image"><Suspense fallback={<div className="photo-slider why-slider" aria-hidden="true"/>}><WhyPhotos/></Suspense><div className="why-follow"><span>Follow Us:</span><a href={tiktokProfile} target="_blank" rel="noopener noreferrer">TikTok</a></div></div></div><div className="benefits-grid">{benefits.map(item=><article key={item.title}><Image src={`${site}/wp-content/uploads/2026/09/${item.image}`} alt="" width={64} height={64}/><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></div></section>;
}
const whySizes="(max-width:767px) 100vw, 42vw";
/** Photos from the itineraries themselves, streamed so Home never waits for them; the original photo if WordPress cannot answer. */
async function WhyPhotos(){
  const photos=await getItineraries().then(tours=>pickItineraryPhotos(tours)).catch(()=>[]);
  if(photos.length<2)return <Image src="/images/west-bali.jpeg" alt="A waterside temple in Bali" width={800} height={600} sizes={whySizes}/>;
  return <PhotoSlider slides={photos} label="Photos from our itineraries" sizes={whySizes} className="why-slider" autoplay={4000} controls={false}/>;
}
export function HowItWorks(){return <section className="how-section" id="how-it-works" aria-labelledby="how-title"><div className="information-inner"><p className="section-label">HOW IT WORKS</p><h2 id="how-title">Planning Your Private Bali Tour Is Simple</h2><ol className="how-steps">{howItWorks.map(step=><li key={step.title}><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol></div></section>;}
export function FAQ(){return <section className="faq-section" id="answer"><div className="information-inner"><p className="section-label">FAQ</p><h2>Answers to Your Bali Tour Questions</h2><div className="faq-list">{faqs.map((faq,i)=><details key={faq.question} name="travel-faq" open={i===0}><summary>{faq.question}</summary>{"terms" in faq ? <Suspense fallback={<p>Loading…</p>}><BookingTermsAnswer/></Suspense> : faq.answer.split("\n\n").map((paragraph,j)=><p key={j}>{paragraph}</p>)}</details>)}</div></div></section>;}
/** NOT INCLUDING / INCLUDE as WordPress defines them for the WhatsApp NB, so the FAQ never keeps its own copy. */
async function BookingTermsAnswer(){
  const terms=await getBookingTerms().catch(()=>null);
  if(!terms)return <p>These details are temporarily unavailable. Please try again shortly.</p>;
  const groups=([["NOT INCLUDING",terms.not_included],["INCLUDE",terms.included]] as const).filter(([,items])=>items.length);
  return <>{groups.map(([label,items])=><div key={label} className="faq-terms"><p className="faq-terms-label">{label}</p><ul>{items.map(item=><li key={item}>{item}</li>)}</ul></div>)}</>;
}
export function AboutSection(){return <section className="about-section" id="about"><div className="information-inner about-grid"><div><p className="section-label">ABOUT SHALOM BALI TOUR</p><h2>Bali Tour Service Since 2016</h2><p className="about-copy">Since 2016, Shalom Bali Tour has helped travelers explore Bali through private transportation and flexible itineraries.</p><p className="about-copy">We focus on providing a comfortable and personal travel experience, whether you choose one of our recommended itineraries or create a customized Bali tour based on the destinations you want to visit.</p></div><div className="about-facts"><p><strong>Since 2016</strong><span>Serving Bali Travelers</span></p><p><strong>3</strong><span className="about-fact-title">Main Tour Areas</span><span>Ubud · Uluwatu &amp; South Kuta · West Bali &amp; North Bali</span></p></div></div></section>;}
