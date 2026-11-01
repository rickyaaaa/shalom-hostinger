"use client";
import Link from "next/link";
import type { RefObject } from "react";
import { Icon } from "./Icon";
import { CurrencySelector } from "./CurrencySelector";
import { islandPackagesLive } from "@/lib/marketing";
const areas=[["South Kuta","/south-kuta"],["Ubud","/ubud"],["West Bali & North Bali","/west-bali"],["Nusa Penida & Lembongan","/nusa-penida-lembongan"]].filter(([,url])=>islandPackagesLive||url!=="/nusa-penida-lembongan");
const anchors=[["Customized Itinerary","customizedtour"],["Review & Comments","review"],["Answer Travel Concerns","answer"]];
const homeAnchors=[["About","about"],["Contact","contact"]];
// One semantic navigation tree is shared by desktop and the mobile disclosure.
// blog: the travel guides exist (an article is published); the layout decides, so the article copy never reaches the browser bundle.
export function MobileMenu({open,itinerary,setItinerary,pathname,close,toggleRef,blog}:{open:boolean;itinerary:boolean;setItinerary:(value:boolean)=>void;pathname:string;close:()=>void;toggleRef:RefObject<HTMLButtonElement|null>;blog:boolean}){
  return <nav id="primary-navigation" aria-label="Main navigation" className={`primary-nav${open?" is-open":""}`}>
    <CurrencySelector id="currency-mobile" variant="menu" />
    <Link href="/" aria-current={pathname==="/"?"page":undefined} onClick={close}>Home</Link>
    <div className="itinerary-nav"><button ref={toggleRef} type="button" aria-expanded={itinerary} aria-controls="itinerary-navigation" className={areas.some(([,url])=>url===pathname)?"nav-current":undefined} onClick={()=>setItinerary(!itinerary)}>Itineraries <Icon name="chevron"/></button>
      {itinerary&&<ul id="itinerary-navigation" className="itinerary-dropdown">{areas.map(([name,url])=><li key={url}><Link href={url} aria-current={pathname===url?"page":undefined} onClick={close}>{name}</Link></li>)}</ul>}
    </div>
    {anchors.map(([name,id])=><Link href={`/#${id}`} onClick={close} key={id}>{name}</Link>)}
    {blog&&<Link href="/blog" aria-current={pathname==="/blog"||pathname.startsWith("/blog/")?"page":undefined} onClick={close}>Blog</Link>}
    {homeAnchors.map(([name,id])=><Link href={`/#${id}`} onClick={close} key={id}>{name}</Link>)}
  </nav>;
}
