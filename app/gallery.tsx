'use client';
import {useState} from 'react';
import {ArrowLeft,ArrowRight,Images,RotateCw} from 'lucide-react';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/tabs';
import {wrapPhotoIndex} from '@/lib/photo-tour';
import ExteriorTour from './exterior-tour';
import VideoTour from './video-tour';
import GalleryPhoto from './gallery-photo';
import {photoVariant} from '@/lib/responsive-photo';
export default function Gallery({photos,exteriorPhotos,title,tourVideo}:{photos:string[];exteriorPhotos:string[];title:string;tourVideo?:string}){
  const [mode,setMode]=useState('photos');
  const [index,setIndex]=useState(0);
  if(!photos.length)return <p className="availability">Vehicle photography is available from our sales team.</p>;
  const move=(delta:number)=>setIndex(value=>wrapPhotoIndex(value+delta,photos.length));
  return <section className="vehicle-gallery" aria-label={`${title} photo gallery`}><Tabs value={mode} onValueChange={value=>setMode(String(value))}>
    <TabsList variant="line" className="gallery-mode-list" aria-label="Vehicle viewing mode"><TabsTrigger value="photos"><Images size={16}/> Gallery</TabsTrigger><TabsTrigger value="tour" disabled={exteriorPhotos.length<2}><RotateCw size={16}/> Exterior tour</TabsTrigger></TabsList>
    <TabsContent value="photos"><div className="gallery-main"><GalleryPhoto key={photos[index]} source={photos[index]} title={title} index={index}/><div className="gallery-controls"><button aria-label="Previous photograph" disabled={photos.length<2} onClick={()=>move(-1)}><ArrowLeft size={21}/></button><span aria-live="polite">{String(index+1).padStart(2,'0')} / {String(photos.length).padStart(2,'0')}</span><button aria-label="Next photograph" disabled={photos.length<2} onClick={()=>move(1)}><ArrowRight size={21}/></button></div></div>
      <div className="thumbnails">{photos.map((url,i)=><button key={url} aria-label={`View photograph ${i+1}`} aria-pressed={index===i} onClick={()=>setIndex(i)}><img src={photoVariant(url,240)} alt="" loading="lazy" draggable={false} width={130} height={100}/></button>)}</div>
    </TabsContent><TabsContent value="tour">{mode==='tour'&&(tourVideo?<VideoTour src={tourVideo} photos={exteriorPhotos} title={title}/>:<ExteriorTour photos={exteriorPhotos} title={title}/>)}</TabsContent>
  </Tabs></section>;
}
