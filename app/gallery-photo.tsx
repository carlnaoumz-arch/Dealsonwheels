'use client';
import {useEffect,useRef,useState} from 'react';
import {LoaderCircle} from 'lucide-react';
import {photoSources} from '@/lib/responsive-photo';

/** The displayed element is the only authority on whether a photograph loaded. */
export default function GalleryPhoto({source,title,index}:{source:string;title:string;index:number}) {
  const image=useRef<HTMLImageElement>(null);
  const [state,setState]=useState<'loading'|'slow'|'ready'|'error'>('loading');
  const [attempt,setAttempt]=useState(0);
  useEffect(()=>{
    const photo=image.current;
    if(photo?.complete&&photo.currentSrc){setState(photo.naturalWidth>0?'ready':'error');return}
    // Slow mobile connections are not image failures. A late load always recovers.
    const timer=setTimeout(()=>setState(value=>value==='loading'?'slow':value),12000);
    return()=>clearTimeout(timer);
  },[attempt]);
  return <div className="photo-stage" aria-busy={state==='loading'||state==='slow'}>
    <img key={attempt} ref={image} src={source} srcSet={photoSources(source)} sizes="(max-width: 900px) 90vw, 52vw" alt={`${title}, photograph ${index+1}`} draggable={false} fetchPriority="high" decoding="async" width={1080} height={1200} onLoad={()=>setState('ready')} onError={()=>setState(image.current?.naturalWidth?'ready':'error')}/>
    {state!=='ready'&&<div className="photo-status" role="status">{state==='error'?<span>This photo could not load.</span>:<><LoaderCircle size={21} className="photo-loader"/><span>{state==='slow'?'This photo is taking a little longer…':`Loading photo ${index+1}…`}</span></>}{(state==='error'||state==='slow')&&<><button onClick={()=>{setState('loading');setAttempt(value=>value+1)}}>Retry photo</button><span>Or choose another view below.</span></>}</div>}
  </div>;
}
