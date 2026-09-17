'use client';
import {useEffect,useId,useRef,useState,type PointerEvent} from 'react';
import {ArrowLeft,ArrowRight,LoaderCircle,MoveHorizontal,Pause,Play,RotateCw} from 'lucide-react';
import {Slider} from '@/components/ui/slider';
import {wrapPhotoIndex,tourBlend} from '@/lib/photo-tour';
import {photoVariant} from '@/lib/responsive-photo';
import {loadTourPhotos} from '@/lib/load-tour-photos';

type Drag={id:number;x:number;position:number;width:number};
export default function ExteriorTour({photos,title}:{photos:string[];title:string}){
  const [ready,setReady]=useState<string[]>([]);
  const [loading,setLoading]=useState(true);
  const [failed,setFailed]=useState(false);
  const [retry,setRetry]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [dragging,setDragging]=useState(false);
  const [position,setPosition]=useState(0);
  const [reduced,setReduced]=useState(false);
  const current=useRef(0),target=useRef(0),frame=useRef(0),last=useRef(0);
  const drag=useRef<Drag|null>(null);
  const playingRef=useRef(false);
  const motionRef=useRef(false);
  const instructions=useId();
  const sliderLabel=useId();
  const [hidden,setHidden]=useState(false);
  useEffect(()=>{const onVisibility=()=>{setHidden(document.hidden);if(document.hidden)setPlaying(false)};document.addEventListener('visibilitychange',onVisibility);return()=>document.removeEventListener('visibilitychange',onVisibility)},[]);
  useEffect(()=>{
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>{motionRef.current=media.matches;setReduced(media.matches);if(media.matches)setPlaying(false)};
    update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);
  },[]);
  useEffect(()=>{
    const controller=new AbortController();
    setLoading(true);setPlaying(false);setFailed(false);
    const sources=photos.map(source=>matchMedia('(max-width: 700px)').matches?photoVariant(source,800):source);
    // On-load is authoritative; Safari decode() failures must not discard visible photos.
    loadTourPhotos(sources,controller.signal).then(available=>{
      if(controller.signal.aborted)return;
      current.current=0;target.current=0;setPosition(0);
      setReady(available);setFailed(available.length!==photos.length);setLoading(false);
    });
    return()=>controller.abort();
  },[photos,retry]);
  function tick(time:number){
    frame.current=0;
    const dt=last.current?Math.min(48,time-last.current):16;
    last.current=time;
    if(playingRef.current)target.current+=dt/2400;
    current.current=motionRef.current?target.current:current.current+(target.current-current.current)*(1-Math.exp(-dt/95));
    if(Math.abs(target.current-current.current)<.0001)current.current=target.current;
    setPosition(current.current);
    if(playingRef.current||current.current!==target.current)frame.current=requestAnimationFrame(tick);
  }
  function wake(){if(!frame.current){last.current=0;frame.current=requestAnimationFrame(tick)}}
  useEffect(()=>{playingRef.current=playing;if(playing)wake()},[playing]);
  useEffect(()=>()=>cancelAnimationFrame(frame.current),[]);
  function seek(value:number){setPlaying(false);playingRef.current=false;target.current=value;wake()}
  function start(event:PointerEvent<HTMLDivElement>){
    if(loading||ready.length<2||!event.isPrimary||event.button!==0)return;
    setPlaying(false);playingRef.current=false;target.current=current.current;
    drag.current={id:event.pointerId,x:event.clientX,position:current.current,width:event.currentTarget.clientWidth};
    event.currentTarget.setPointerCapture(event.pointerId);event.currentTarget.focus({preventScroll:true});setDragging(true);
  }
  function move(event:PointerEvent<HTMLDivElement>){const d=drag.current;if(d?.id!==event.pointerId)return;seek(d.position-(event.clientX-d.x)/Math.max(1,d.width)*ready.length)}
  function stop(event:PointerEvent<HTMLDivElement>){if(drag.current?.id!==event.pointerId)return;drag.current=null;setDragging(false);if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId)}
  const blend=tourBlend(position,ready.length,reduced);
  const scrub=ready.length?wrapPhotoIndex(position,ready.length):0;
  return <div className="exterior-tour">
    <div className={`photo-stage tour-stage exterior-stage ${dragging?'is-dragging':''}`} tabIndex={0} role="group" aria-label={`${title} exterior photo tour`} aria-describedby={instructions} aria-busy={loading}
      onPointerDown={start} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={()=>{drag.current=null;setDragging(false)}}
      onKeyDown={event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();seek(event.key==='Home'?0:event.key==='End'?ready.length-1:Math.round(target.current)+(event.key==='ArrowRight'?1:-1))}}}>
      {ready.length>0&&<><img className="tour-frame" src={ready[blend.from]} alt={`${title}, exterior view ${blend.from+1}`} draggable={false}/><img className="tour-frame tour-frame-next" src={ready[blend.to]} alt="" aria-hidden="true" draggable={false} style={{opacity:blend.mix}}/></>}
      <span className="tour-badge"><RotateCw size={15}/> EXTERIOR TOUR</span>
      {loading?<div className="photo-status" role="status"><LoaderCircle className="photo-loader" size={22}/><span>Preparing exterior views…</span></div>:ready.length<2?<div className="photo-status" role="status"><span>Exterior tour unavailable.</span><button onPointerDown={e=>e.stopPropagation()} onClick={()=>setRetry(n=>n+1)}>Retry photos</button></div>:<div className="drag-hint" aria-hidden="true"><MoveHorizontal size={20}/><span>{dragging?'EXPLORING':playing?'PLAYING · DRAG TO TAKE CONTROL':'DRAG TO EXPLORE'}</span></div>}
    </div>
    <div className="gallery-controls exterior-controls"><button aria-label="Previous exterior view" disabled={loading||ready.length<2} onClick={()=>seek(Math.round(target.current)-1)}><ArrowLeft size={21}/></button><button className="tour-play" disabled={loading||ready.length<2||hidden} onClick={()=>setPlaying(value=>!value)} aria-label={playing?'Pause exterior tour':'Play exterior tour'}>{playing?<Pause size={17}/>:<Play size={17}/>}<span>{playing?'Pause tour':'Play tour'}</span></button><button aria-label="Next exterior view" disabled={loading||ready.length<2} onClick={()=>seek(Math.round(target.current)+1)}><ArrowRight size={21}/></button></div>
    <div className="tour-controls"><p id={instructions}><MoveHorizontal size={19}/><span>Drag or swipe to explore the exterior. Use Play for a hands-free tour.</span></p><div className="tour-scrubber"><span id={sliderLabel}>EXTERIOR VIEWS</span><Slider aria-labelledby={sliderLabel} disabled={loading||ready.length<2} min={0} max={Math.max(1,ready.length-.001)} step={.01} value={[scrub]} onValueChange={value=>seek(Array.isArray(value)?value[0]:value)}/></div><p className="tour-disclosure">Original exterior photographs with blended transitions. Available angles vary; this is not a continuous 3D scan.</p>{failed&&<p className="tour-disclosure">Some photographs could not load. <button className="text-link" onClick={()=>setRetry(n=>n+1)}>Retry</button></p>}</div>
  </div>;
}
