"use client";
import Link from "next/link";
import type { RefObject } from "react";
import { Icon } from "./Icon";
const areas=[["South Kuta","/south-kuta"],["Ubud","/ubud"],["West Bali & North Bali","/west-bali"]];
const anchors=[["Customized Itinerary","customizedtour"],["Review & Comments","review"],["Answer Travel Concerns","answer"],["About","about"],["Contact","contact"]];
// One semantic navigation tree is shared by desktop and the mobile disclosure.
export function MobileMenu({open,itinerary,setItinerary,pathname,close,toggleRef}:{open:boolean;itinerary:boolean;setItinerary:(value:boolean)=>void;pathname:string;close:()=>void;toggleRef:RefObject<HTMLButtonElement|null>}){
  return <nav id="primary-navigation" aria-label="Main navigation" className={`primary-nav${open?" is-open":""}`}>
    <Link href="/" aria-current={pathname==="/"?"page":undefined} onClick={close}>Home</Link>
    <div className="itinerary-nav"><button ref={toggleRef} type="button" aria-expanded={itinerary} aria-controls="itinerary-navigation" className={areas.some(([,url])=>url===pathname)?"nav-current":undefined} onClick={()=>setItinerary(!itinerary)}>Itineraries <Icon name="chevron"/></button>
      {itinerary&&<ul id="itinerary-navigation" className="itinerary-dropdown">{areas.map(([name,url])=><li key={url}><Link href={url} aria-current={pathname===url?"page":undefined} onClick={close}>{name}</Link></li>)}</ul>}
    </div>
    {anchors.map(([name,id])=><Link href={`/#${id}`} onClick={close} key={id}>{name}</Link>)}
  </nav>;
}
