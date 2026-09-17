'use client';
import {useEffect,useRef,useState} from 'react';
export default function HeroFilm(){
 const video=useRef<HTMLVideoElement>(null);
 const [visible,setVisible]=useState(false),[fallback,setFallback]=useState(false);
 useEffect(()=>{
  const element=video.current!;
  const section=element.closest('section')!;
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  let disposed=false,inView=true,blocked=false,failed=false,pending=false,finishRequested=false,frame=0,lastFrame=0;
  let seekTimer:ReturnType<typeof setTimeout>|undefined,loadTimer:ReturnType<typeof setTimeout>|undefined;
  const active=()=>!disposed&&!document.hidden&&inView&&!media.matches&&!failed;
  const revealPoster=()=>{if(!disposed)setFallback(true)};
  const stop=()=>{cancelAnimationFrame(frame);frame=0;lastFrame=0;clearTimeout(seekTimer);element.pause()};
  // Play the opening once, reserving the last 1.2 seconds for the first scroll.
  const limit=()=>Number.isFinite(element.duration)?Math.max(0,element.duration-(finishRequested ? .035 : 1.2)):Infinity;
  const canAdvance=()=>active()&&element.currentTime<limit()-.015;
  const schedule=()=>{if(!frame&&canAdvance())frame=requestAnimationFrame(tick)};
  // If the browser refuses autoplay, advance the same footage without a play overlay.
  // Only one frame decode can be outstanding; never queue up work on a slow phone.
  function tick(now:number){
   frame=0;
   if(!active())return;
   if(!canAdvance()){stop();return}
   if(element.readyState<2||element.seeking||!Number.isFinite(element.duration)||element.duration<=.05){lastFrame=0;return}
   if(!blocked){if(!element.paused)schedule();return}
   if(!lastFrame){lastFrame=now;schedule();return}
   const elapsed=now-lastFrame;
   if(elapsed<33){schedule();return}
   lastFrame=now;
   clearTimeout(seekTimer);seekTimer=setTimeout(revealPoster,1500);
   try{element.currentTime=Math.min(limit(),element.currentTime+Math.min(elapsed,100)*.001*element.playbackRate)}catch{revealPoster()}
  }
  const play=()=>{
   if(!canAdvance()||pending)return;
   element.playbackRate=finishRequested?1.2:1;
   if(blocked){schedule();return}
   if(!element.paused){schedule();return}
   pending=true;
   void element.play().then(()=>{
    pending=false;
    if(!canAdvance())element.pause();else schedule();
   }).catch(()=>{
    pending=false;
    if(!active())return;
    blocked=true;lastFrame=0;schedule();
   });
  };
  const decoded=()=>{
   if(disposed||media.matches||failed||element.readyState<2||element.seeking)return;
   clearTimeout(loadTimer);clearTimeout(seekTimer);setVisible(true);setFallback(false);play();
  };
  const retry=()=>{if(active()){blocked=false;cancelAnimationFrame(frame);frame=0;lastFrame=0;play()}};
  const progress=(event:Event)=>{
   if((event as CustomEvent<number>).detail<=.015||finishRequested)return;
   // Latch once: reverse scrolling, touches and resizing must never rewind the film.
   finishRequested=true;play();schedule();
  };
  const change=()=>{
   if(media.matches){stop();setVisible(false);setFallback(true);element.removeAttribute('src');element.load();return}
   if(!element.getAttribute('src')){
    // Set the actual DOM properties before the source: required for reliable iPhone autoplay.
    element.muted=true;element.defaultMuted=true;element.playsInline=true;element.autoplay=true;element.loop=false;element.controls=false;element.playbackRate=1;
    element.src=matchMedia('(max-width:700px)').matches?'/videos/aventador-gray-hero-mobile.mp4':'/videos/aventador-gray-hero.mp4';
    failed=false;blocked=false;loadTimer=setTimeout(revealPoster,5000);element.load();
   }
   decoded();play();
  };
  const visibility=()=>{if(!active())stop();else{decoded();retry()}};
  const error=()=>{failed=true;stop();revealPoster()};
  const observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;visibility()},{rootMargin:'100px'});
  observer.observe(section);
  element.addEventListener('loadeddata',decoded);element.addEventListener('canplay',decoded);element.addEventListener('seeked',decoded);element.addEventListener('error',error);
  section.addEventListener('hero-film-progress',progress);
  media.addEventListener('change',change);document.addEventListener('visibilitychange',visibility);window.addEventListener('pageshow',visibility);
  // A normal touch is also a retry opportunity if the device restricts video playback.
  window.addEventListener('pointerdown',retry,{passive:true});window.addEventListener('touchstart',retry,{passive:true});
  change();
  return()=>{disposed=true;stop();clearTimeout(loadTimer);observer.disconnect();element.removeEventListener('loadeddata',decoded);element.removeEventListener('canplay',decoded);element.removeEventListener('seeked',decoded);element.removeEventListener('error',error);section.removeEventListener('hero-film-progress',progress);media.removeEventListener('change',change);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pageshow',visibility);window.removeEventListener('pointerdown',retry);window.removeEventListener('touchstart',retry)};
 },[]);
 return <div className={`hero-film ${fallback?'film-fallback':''}`}><img className="hero-film-poster" src="/images/aventador-gray-poster.jpg" alt="Gray Lamborghini Aventador S LP740-4 Roadster — cinematic visualization based on the actual dealer vehicle" fetchPriority="high" width={1920} height={1080}/><video ref={video} className={`hero-film-video ${visible&&!fallback?'is-ready':''}`} autoPlay muted playsInline controls={false} disablePictureInPicture preload="auto" aria-hidden="true"/></div>;
}
