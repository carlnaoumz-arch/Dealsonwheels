'use client';
import {useEffect,useRef,useState} from 'react';
export default function HeroFilm(){
 const video=useRef<HTMLVideoElement>(null);
 const [visible,setVisible]=useState(false),[fallback,setFallback]=useState(false);
 useEffect(()=>{
  const element=video.current!;
  const section=element.closest('section')!;
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  let disposed=false,inView=true,blocked=false,failed=false,pending=false,frame=0,lastFrame=0;
  let seekTimer:ReturnType<typeof setTimeout>|undefined,loadTimer:ReturnType<typeof setTimeout>|undefined;
  const active=()=>!disposed&&!document.hidden&&inView&&!media.matches&&!failed;
  const revealPoster=()=>{if(!disposed)setFallback(true)};
  const stop=()=>{cancelAnimationFrame(frame);frame=0;lastFrame=0;clearTimeout(seekTimer);element.pause()};
  const schedule=()=>{if(!frame&&active()&&blocked)frame=requestAnimationFrame(tick)};
  // If the browser refuses autoplay, advance the same footage without a play overlay.
  // Only one frame decode can be outstanding; never queue up work on a slow phone.
  function tick(now:number){
   frame=0;
   if(!active()||!blocked)return;
   if(element.readyState<2||element.seeking||!Number.isFinite(element.duration)||element.duration<=.05){lastFrame=0;return}
   if(!lastFrame){lastFrame=now;schedule();return}
   const elapsed=now-lastFrame;
   if(elapsed<33){schedule();return}
   lastFrame=now;
   clearTimeout(seekTimer);seekTimer=setTimeout(revealPoster,1500);
   try{element.currentTime=(element.currentTime+Math.min(elapsed,100)*.00055)%(element.duration-.02)}catch{revealPoster()}
  }
  const play=()=>{
   if(!active()||pending)return;
   if(blocked){schedule();return}
   if(!element.paused)return;
   pending=true;
   void element.play().then(()=>{
    pending=false;
    if(!active())element.pause();
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
  const change=()=>{
   if(media.matches){stop();setVisible(false);setFallback(true);element.removeAttribute('src');element.load();return}
   if(!element.getAttribute('src')){
    // Set the actual DOM properties before the source: required for reliable iPhone autoplay.
    element.muted=true;element.defaultMuted=true;element.playsInline=true;element.autoplay=true;element.loop=true;element.controls=false;element.playbackRate=.55;
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
  media.addEventListener('change',change);document.addEventListener('visibilitychange',visibility);window.addEventListener('pageshow',visibility);
  // A normal touch is also a retry opportunity if the device restricts video playback.
  window.addEventListener('pointerdown',retry,{passive:true});window.addEventListener('touchstart',retry,{passive:true});
  change();
  return()=>{disposed=true;stop();clearTimeout(loadTimer);observer.disconnect();element.removeEventListener('loadeddata',decoded);element.removeEventListener('canplay',decoded);element.removeEventListener('seeked',decoded);element.removeEventListener('error',error);media.removeEventListener('change',change);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pageshow',visibility);window.removeEventListener('pointerdown',retry);window.removeEventListener('touchstart',retry)};
 },[]);
 return <div className={`hero-film ${fallback?'film-fallback':''}`}><img className="hero-film-poster" src="/images/aventador-gray-poster.jpg" alt="Gray Lamborghini Aventador S LP740-4 Roadster — cinematic visualization based on the actual dealer vehicle" fetchPriority="high" width={1920} height={1080}/><video ref={video} className={`hero-film-video ${visible&&!fallback?'is-ready':''}`} autoPlay loop muted playsInline controls={false} disablePictureInPicture preload="auto" aria-hidden="true"/></div>;
}
