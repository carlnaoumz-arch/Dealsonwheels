'use client';
import {useEffect,useRef,useState} from 'react';
export default function HeroFilm(){
 const video=useRef<HTMLVideoElement>(null);
 const [visible,setVisible]=useState(false);
 const [failed,setFailed]=useState(false);
 const [reduced,setReduced]=useState(false);
 useEffect(()=>{
  const element=video.current!;
  const section=element.closest('section')!;
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  let target=0;
  const seek=()=>{
   if(media.matches||!Number.isFinite(element.duration)||element.seeking||element.readyState<2)return;
   const time=Math.min(element.duration-.05,target*element.duration);
   if(Math.abs(element.currentTime-time)>.045)element.currentTime=Math.max(0,time);
  };
  const update=(event:Event)=>{target=(event as CustomEvent<number>).detail;seek()};
  const decoded=()=>{setVisible(true);seek()};
  const change=()=>{setReduced(media.matches);if(media.matches)element.pause();else seek()};
  change();media.addEventListener('change',change);
  section.addEventListener('hero-film-progress',update);
  element.addEventListener('loadeddata',decoded);element.addEventListener('seeked',decoded);
  if(element.readyState>=2)decoded();
  return()=>{media.removeEventListener('change',change);section.removeEventListener('hero-film-progress',update);element.removeEventListener('loadeddata',decoded);element.removeEventListener('seeked',decoded)};
 },[]);
 return <div className="hero-film"><img className="hero-film-poster" src="/images/aventador-gray-poster.jpg" alt="Gray Lamborghini Aventador S LP740-4 Roadster — cinematic visualization based on the actual dealer vehicle" fetchPriority="high"/><video ref={video} className={`hero-film-video ${visible&&!failed&&!reduced?'is-ready':''}`} src={reduced?undefined:'/videos/aventador-gray-hero.mp4'} muted playsInline preload="auto" aria-hidden="true" onError={()=>setFailed(true)}/></div>;
}
