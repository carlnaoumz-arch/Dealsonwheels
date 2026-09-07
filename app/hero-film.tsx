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
  let target=0,introFloor=0,frame=0,introStarted=false,introRunning=false;
  const finishIntro=()=>{introRunning=false;cancelAnimationFrame(frame);element.pause();introFloor=element.currentTime};
  const seek=()=>{
   if(introRunning||media.matches||!Number.isFinite(element.duration)||element.seeking||element.readyState<2)return;
   const time=introFloor+target*Math.max(0,element.duration-.05-introFloor);
   if(Math.abs(element.currentTime-time)>.045)element.currentTime=Math.max(0,time);
  };
  const monitor=()=>{
   if(!introRunning)return;
   if(element.currentTime>=1.2){finishIntro();seek();return}
   frame=requestAnimationFrame(monitor);
  };
  const startIntro=()=>{
   if(introStarted||media.matches||document.hidden||target>.002)return;
   introStarted=true;introRunning=true;element.playbackRate=.55;
   element.play().then(()=>{if(introRunning)monitor();else element.pause()}).catch(()=>{finishIntro();seek()});
  };
  const update=(event:Event)=>{target=(event as CustomEvent<number>).detail;if(target>.002&&introRunning)finishIntro();seek()};
  const decoded=()=>{setVisible(true);startIntro();seek()};
  const change=()=>{setReduced(media.matches);if(media.matches)finishIntro();else if(element.readyState>=2)decoded()};
  const visibility=()=>{if(document.hidden&&introRunning)finishIntro();else if(!document.hidden&&element.readyState>=2)decoded()};
  change();media.addEventListener('change',change);
  document.addEventListener('visibilitychange',visibility);
  section.addEventListener('hero-film-progress',update);
  element.addEventListener('loadeddata',decoded);element.addEventListener('seeked',decoded);
  if(element.readyState>=2)decoded();
  return()=>{finishIntro();document.removeEventListener('visibilitychange',visibility);media.removeEventListener('change',change);section.removeEventListener('hero-film-progress',update);element.removeEventListener('loadeddata',decoded);element.removeEventListener('seeked',decoded)};
 },[]);
 return <div className={`hero-film ${failed?'film-fallback':''}`}><img className="hero-film-poster" src="/images/aventador-gray-poster.jpg" alt="Gray Lamborghini Aventador S LP740-4 Roadster — cinematic visualization based on the actual dealer vehicle" fetchPriority="high"/><video ref={video} className={`hero-film-video ${visible&&!failed&&!reduced?'is-ready':''}`} src={reduced?undefined:'/videos/aventador-gray-hero.mp4'} muted playsInline preload="auto" aria-hidden="true" onError={()=>setFailed(true)}/></div>;
}
