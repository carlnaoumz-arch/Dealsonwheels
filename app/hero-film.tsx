'use client';
import {useEffect,useRef,useState} from 'react';
export default function HeroFilm(){
 const video=useRef<HTMLVideoElement>(null);
 const [visible,setVisible]=useState(false),[fallback,setFallback]=useState(false);
 useEffect(()=>{
  const element=video.current!;
  const section=element.closest('section')!;
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  let disposed=false,target=0,introFloor=0,frame=0,introStarted=false,introRunning=false,inView=true;
  let introDeadline=0,lastSeek=0,seekTimer:ReturnType<typeof setTimeout>|undefined,loadTimer:ReturnType<typeof setTimeout>|undefined;
  const revealPoster=()=>{if(!disposed)setFallback(true)};
  const finishIntro=()=>{introRunning=false;element.pause();introFloor=Math.min(1.25,element.currentTime||0)};
  const schedule=()=>{if(!frame&&!disposed&&!document.hidden&&inView&&!media.matches)frame=requestAnimationFrame(tick)};
  function tick(now:number){
   frame=0;
   if(disposed||document.hidden||!inView||media.matches)return;
   if(introRunning){
    if(element.currentTime>=1.2||now>=introDeadline){finishIntro()}else{schedule();return}
   }
   if(element.readyState<2||element.seeking||!Number.isFinite(element.duration))return;
   const time=introFloor+target*Math.max(0,element.duration-.05-introFloor);
   if(Math.abs(element.currentTime-time)<=.045)return;
   // Only one outstanding decode, at most 30 seeks/second. Seeked resumes at the latest scroll target.
   if(now-lastSeek<33){schedule();return}
   lastSeek=now;
   clearTimeout(seekTimer);
   seekTimer=setTimeout(revealPoster,1500);
   try{element.currentTime=Math.max(0,time)}catch{revealPoster()}
  }
  const startIntro=()=>{
   if(introStarted||media.matches||document.hidden||!inView||target>.002)return;
   introStarted=true;introRunning=true;introDeadline=performance.now()+3000;element.playbackRate=.55;
   schedule();
   void element.play().catch(()=>{if(!disposed){finishIntro();schedule()}});
  };
  const decoded=()=>{
   if(disposed||element.readyState<2||element.seeking)return;
   clearTimeout(loadTimer);clearTimeout(seekTimer);setVisible(true);setFallback(false);
   startIntro();schedule();
  };
  const update=(event:Event)=>{
   target=Math.max(0,Math.min(1,(event as CustomEvent<number>).detail));
   if(target>.002&&introRunning)finishIntro();schedule();
  };
  const change=()=>{
   if(media.matches){finishIntro();cancelAnimationFrame(frame);frame=0;setVisible(false);setFallback(true);element.removeAttribute('src');element.load();return}
   if(!element.getAttribute('src')){
    // Choose once; rotating a phone must not restart or download a second film.
    element.src=matchMedia('(max-width:700px)').matches?'/videos/aventador-gray-hero-mobile.mp4':'/videos/aventador-gray-hero.mp4';
    loadTimer=setTimeout(revealPoster,5000);element.load();
   }
   decoded();schedule();
  };
  const visibility=()=>{if(document.hidden){if(introRunning)finishIntro();cancelAnimationFrame(frame);frame=0}else{decoded();schedule()}};
  const observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(!inView){if(introRunning)finishIntro();cancelAnimationFrame(frame);frame=0}else{decoded();schedule()}},{rootMargin:'100px'});
  observer.observe(section);
  element.addEventListener('loadeddata',decoded);element.addEventListener('canplay',decoded);element.addEventListener('seeked',decoded);element.addEventListener('error',revealPoster);
  section.addEventListener('hero-film-progress',update);media.addEventListener('change',change);document.addEventListener('visibilitychange',visibility);window.addEventListener('pageshow',visibility);
  change();
  return()=>{disposed=true;finishIntro();cancelAnimationFrame(frame);clearTimeout(loadTimer);clearTimeout(seekTimer);observer.disconnect();element.removeEventListener('loadeddata',decoded);element.removeEventListener('canplay',decoded);element.removeEventListener('seeked',decoded);element.removeEventListener('error',revealPoster);section.removeEventListener('hero-film-progress',update);media.removeEventListener('change',change);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pageshow',visibility)};
 },[]);
 return <div className={`hero-film ${fallback?'film-fallback':''}`}><img className="hero-film-poster" src="/images/aventador-gray-poster.jpg" alt="Gray Lamborghini Aventador S LP740-4 Roadster — cinematic visualization based on the actual dealer vehicle" fetchPriority="high" width={1920} height={1080}/><video ref={video} className={`hero-film-video ${visible&&!fallback?'is-ready':''}`} muted playsInline preload="auto" aria-hidden="true"/></div>;
}
