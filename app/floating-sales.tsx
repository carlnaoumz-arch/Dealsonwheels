'use client';
import {useEffect,useRef,useState} from 'react';
import {MessageCircle,ArrowUpRight} from 'lucide-react';
export default function FloatingSales({href}:{href:string}){
 const ref=useRef<HTMLAnchorElement>(null),[covered,setCovered]=useState(false);
 useEffect(()=>{let frame=0;const update=()=>{frame=0;const link=ref.current;if(!link)return;const r=link.getBoundingClientRect();const points=[[r.left+5,r.top+5],[r.right-5,r.top+5],[r.left+5,r.bottom-5],[r.right-5,r.bottom-5],[(r.left+r.right)/2,(r.top+r.bottom)/2]];setCovered(points.some(([x,y])=>document.elementsFromPoint(x,y).some(element=>!link.contains(element)&&!element.contains(link)&&!!element.closest('a,button,input,select,textarea,dd,p,h1,h2,h3'))))};const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};schedule();addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);return()=>{cancelAnimationFrame(frame);removeEventListener('scroll',schedule);removeEventListener('resize',schedule)}},[]);
 return <a ref={ref} aria-label="Contact sales on WhatsApp" aria-hidden={covered||undefined} tabIndex={covered?-1:undefined} className={`concierge ${covered?'avoids-content':''}`} href={href} target="_blank" rel="noopener noreferrer"><MessageCircle size={19}/><span className="concierge-label">Speak with our sales team</span><ArrowUpRight size={16}/></a>;
}
