'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowDown,ArrowUpRight} from 'lucide-react';
import {clamp,heroMotion} from '../lib/hero-motion';
const story=['Based in Beirut.','A destination for luxury and high-performance automobiles.','Turning automotive dreams into reality.','Welcome to the Special League.'];
export default function Hero(){
  const ref=useRef<HTMLElement>(null);
  const [ready,setReady]=useState(false);
  const [reduced,setReduced]=useState(false);
  useEffect(()=>{
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    const el=ref.current!;
    let frame=0,active=false,current=0,last=0;
    const apply=(time:number)=>{
      frame=0;
      const target=clamp(-el.getBoundingClientRect().top/Math.max(1,el.offsetHeight-innerHeight));
      const dt=last?Math.min(64,time-last):16;
      last=time;
      current=media.matches?target:current+(target-current)*(1-Math.exp(-dt/85));
      if(Math.abs(target-current)<.0001)current=target;
      const m=heroMotion(current,media.matches);
      const a=active||media.matches?1:0;
      const s=el.style;
      s.setProperty('--body',String(m.body*a));
      s.setProperty('--beam',`${m.body*150}%`);
      s.setProperty('--headlights',String(m.headlights*a));
      s.setProperty('--sweep',`${m.sweep}%`);
      s.setProperty('--reflection',String(m.reflection*a));
      s.setProperty('--camera',String(m.camera));
      s.setProperty('--shift',`${m.shift}%`);
      s.setProperty('--depth',`${m.depth}%`);
      s.setProperty('--title',String(m.title*a));
      s.setProperty('--signature-links',m.title*a>.05?'visible':'hidden');
      s.setProperty('--exit',String(m.exit));
      s.setProperty('--progress',`${current*100}%`);
      m.stories.forEach((value,i)=>s.setProperty(`--story${i}`,String(value*a)));
      if(current!==target)frame=requestAnimationFrame(apply);
    };
    const schedule=()=>{if(!frame){last=0;frame=requestAnimationFrame(apply)}};
    const change=()=>{setReduced(media.matches);schedule()};
    change();
    const timer=setTimeout(()=>{active=true;setReady(true);document.documentElement.classList.add('intro-ready');schedule()},media.matches?0:1000);
    addEventListener('scroll',schedule,{passive:true});
    addEventListener('resize',schedule);
    media.addEventListener('change',change);
    return()=>{clearTimeout(timer);cancelAnimationFrame(frame);removeEventListener('scroll',schedule);removeEventListener('resize',schedule);media.removeEventListener('change',change);document.documentElement.classList.remove('intro-ready')};
  },[]);
  return <section ref={ref} className={`cinema brand-cinema ${reduced?'reduced':''}`} aria-label="Discover Deals On Wheels"><div className="stage">
    <div className="car-scene"><img className="reveal-base" src="/images/aventador-studio.webp" alt="Blue Lamborghini Aventador S Roadster in a dark studio — edited model concept imagery" fetchPriority="high"/><img className="headlight-layer" src="/images/aventador-studio.webp" alt="" aria-hidden="true"/><img className="light-pass" src="/images/aventador-studio.webp" alt="" aria-hidden="true"/></div>
    <div className="hero-narrative" aria-hidden="true">{story.map((line,i)=><div className={`story-mask story-${i}`} key={line}><p>{line}</p></div>)}</div>
    <p className="sr-only">{story.join(' ')}</p>
    <div className="hero-signature"><p className="eyebrow">WELCOME TO THE SPECIAL LEAGUE</p><h1>Deals On Wheels.</h1><div className="hero-actions"><a className="text-link" href="#collection">Explore collection <ArrowUpRight size={16}/></a></div></div>
    <div className={`scroll-cue ${ready?'visible':''}`}><span>{reduced?'DISCOVER THE COLLECTION':'SCROLL TO DISCOVER'}</span><ArrowDown size={21}/></div><a className={`skip ${ready?'visible':''}`} href="#collection">Skip to collection ↘</a><div className="model-note">Edited model imagery · Actual vehicle shown below</div><div className="hero-outro"/><div className="timeline"/>
  </div></section>;
}
