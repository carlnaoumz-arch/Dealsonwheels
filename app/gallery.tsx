'use client';
import {useEffect,useState} from 'react';
import {ArrowLeft,ArrowRight,Images,RotateCw,LoaderCircle} from 'lucide-react';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/tabs';
import {wrapPhotoIndex} from '@/lib/photo-tour';
import ExteriorTour from './exterior-tour';
export default function Gallery({photos,exteriorPhotos,title}:{photos:string[];exteriorPhotos:string[];title:string}){
  const [mode,setMode]=useState('photos');
  const [index,setIndex]=useState(0);
  const [displayed,setDisplayed]=useState(0);
  const [loadState,setLoadState]=useState<'loading'|'ready'|'error'>('loading');
  const [retry,setRetry]=useState(0);
  useEffect(()=>{
    let active=true;const photo=new Image();setLoadState('loading');
    photo.onload=()=>{void photo.decode().catch(()=>{}).then(()=>{if(active){setDisplayed(index);setLoadState('ready')}})};
    photo.onerror=()=>{if(active)setLoadState('error')};photo.src=photos[index];
    return()=>{active=false;photo.onload=null;photo.onerror=null};
  },[photos,index,retry]);
  if(!photos.length)return <p className="availability">Vehicle photography is available from our sales team.</p>;
  const move=(delta:number)=>setIndex(value=>wrapPhotoIndex(value+delta,photos.length));
  return <section className="vehicle-gallery" aria-label={`${title} photo gallery`}><Tabs value={mode} onValueChange={value=>setMode(String(value))}>
    <TabsList variant="line" className="gallery-mode-list" aria-label="Vehicle viewing mode"><TabsTrigger value="photos"><Images size={16}/> Gallery</TabsTrigger><TabsTrigger value="tour" disabled={exteriorPhotos.length<2}><RotateCw size={16}/> Exterior tour</TabsTrigger></TabsList>
    <TabsContent value="photos"><div className="gallery-main"><div className="photo-stage" aria-busy={loadState==='loading'}><img src={photos[displayed]} alt={`${title}, photograph ${displayed+1}`} draggable={false} fetchPriority="high" width={1080} height={1200}/>{loadState!=='ready'&&<div className="photo-status" role="status">{loadState==='loading'?<><LoaderCircle size={21} className="photo-loader"/><span>Loading photo {index+1}…</span></>:<><span>This photo is unavailable.</span><button onClick={()=>setRetry(value=>value+1)}>Retry photo</button><span>Or choose another view below.</span></>}</div>}</div><div className="gallery-controls"><button aria-label="Previous photograph" disabled={photos.length<2} onClick={()=>move(-1)}><ArrowLeft size={21}/></button><span aria-live="polite">{String(index+1).padStart(2,'0')} / {String(photos.length).padStart(2,'0')}</span><button aria-label="Next photograph" disabled={photos.length<2} onClick={()=>move(1)}><ArrowRight size={21}/></button></div></div>
      <div className="thumbnails">{photos.map((url,i)=><button key={url} aria-label={`View photograph ${i+1}`} aria-pressed={index===i} onClick={()=>setIndex(i)}><img src={url} alt="" loading="lazy" draggable={false} width={130} height={100}/></button>)}</div>
    </TabsContent><TabsContent value="tour">{mode==='tour'&&<ExteriorTour photos={exteriorPhotos} title={title}/>}</TabsContent>
  </Tabs></section>;
}
