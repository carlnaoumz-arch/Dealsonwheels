'use client';

import {useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent} from 'react';
import {ArrowLeft, ArrowRight, Images, MoveHorizontal, RotateCw, LoaderCircle} from 'lucide-react';
import {Tabs, TabsList, TabsTrigger, TabsContent} from '@/components/ui/tabs';
import {Slider} from '@/components/ui/slider';
import {photoIndexFromDrag, wrapPhotoIndex} from '@/lib/photo-tour';

type Drag = {pointerId: number; x: number; index: number; width: number};

export default function Gallery({photos, title}: {photos: string[]; title: string}) {
  const [mode, setMode] = useState('photos');
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState(0);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [retry, setRetry] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<Drag | null>(null);
  const loaded = useRef(new Set<string>());
  const instructionId = useId();
  const sliderId = useId();
  const count = photos.length;

  // Decode the requested photo before replacing the current one. Only warm adjacent
  // frames, avoiding an eager download of the entire gallery when a client opens a car.
  useEffect(() => {
    let active = true;
    const source = photos[index];
    if (!source) return;
    const photo = new Image();
    setLoadState('loading');
    const ready = () => {
      if (!active) return;
      loaded.current.add(source);
      setDisplayed(index);
      setLoadState('ready');
      if (mode === 'tour') {
        for (const neighbor of [wrapPhotoIndex(index - 1, count), wrapPhotoIndex(index + 1, count)]) {
          const next = photos[neighbor];
          if (loaded.current.has(next)) continue;
          const preload = new Image();
          preload.onload = () => loaded.current.add(next);
          preload.src = next;
        }
      }
    };
    photo.onload = () => { void photo.decode().catch(() => {}).then(ready); };
    photo.onerror = () => { if (active) setLoadState('error'); };
    photo.src = source;
    if (loaded.current.has(source)) ready();
    return () => { active = false; photo.onload = null; photo.onerror = null; };
  }, [photos, index, mode, retry, count]);

  function move(delta: number) { setIndex(current => wrapPhotoIndex(current + delta, count)); }
  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (mode !== 'tour' || count < 2 || !event.isPrimary || event.button !== 0) return;
    drag.current = {pointerId: event.pointerId, x: event.clientX, index, width: event.currentTarget.getBoundingClientRect().width};
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus({preventScroll: true});
    setDragging(true);
  }
  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const start = drag.current;
    if (!start || start.pointerId !== event.pointerId) return;
    setIndex(photoIndexFromDrag(start.index, event.clientX - start.x, start.width, count));
  }
  function stopDrag(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.pointerId !== event.pointerId) return;
    drag.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }
  function keyControl(event: KeyboardEvent<HTMLDivElement>) {
    if (mode !== 'tour') return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault(); setIndex(event.key === 'Home' ? 0 : count - 1);
    }
  }

  function viewer(tour: boolean) {
    return <div className="gallery-main">
      <div className={`photo-stage ${tour ? 'tour-stage' : ''} ${dragging ? 'is-dragging' : ''}`}
        role={tour ? 'group' : undefined} tabIndex={tour ? 0 : undefined}
        aria-label={tour ? `${title} interactive photo tour` : undefined}
        aria-describedby={tour ? instructionId : undefined} aria-busy={loadState === 'loading'}
        onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={stopDrag}
        onPointerCancel={stopDrag} onLostPointerCapture={() => {drag.current = null; setDragging(false);}}
        onKeyDown={keyControl}>
        <img src={photos[displayed]} alt={`${title}, photograph ${displayed + 1}`} draggable={false} fetchPriority="high" width={1080} height={1200}/>
        {tour && <span className="tour-badge"><RotateCw size={15}/> PHOTO TOUR</span>}
        {loadState !== 'ready' && <div className="photo-status" role="status">
          {loadState === 'loading' ? <><LoaderCircle size={21} className="photo-loader"/><span>Loading photo {index + 1}…</span></> : <><span>This photo is unavailable.</span><button onPointerDown={event => event.stopPropagation()} onClick={() => setRetry(n => n + 1)}>Retry photo</button><span>Or choose another view below.</span></>}
        </div>}
        {tour && loadState === 'ready' && <div className="drag-hint" aria-hidden="true"><MoveHorizontal size={20}/><span>{dragging ? 'EXPLORING' : 'DRAG TO EXPLORE'}</span></div>}
      </div>
      <div className="gallery-controls"><button aria-label="Previous photograph" disabled={count < 2} onClick={() => move(-1)}><ArrowLeft size={21}/></button><span aria-live="polite">{String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</span><button aria-label="Next photograph" disabled={count < 2} onClick={() => move(1)}><ArrowRight size={21}/></button></div>
    </div>;
  }

  if (!count) return <p className="availability">Vehicle photography is available from our sales team.</p>;
  return <section className="vehicle-gallery" aria-label={`${title} photo gallery`}>
    <Tabs value={mode} onValueChange={value => {setMode(String(value)); drag.current = null; setDragging(false);}}>
      <TabsList variant="line" className="gallery-mode-list" aria-label="Vehicle viewing mode">
        <TabsTrigger value="photos"><Images size={16}/> Gallery</TabsTrigger>
        <TabsTrigger value="tour" disabled={count < 2}><RotateCw size={16}/> Interactive tour</TabsTrigger>
      </TabsList>
      <TabsContent value="photos">{viewer(false)}</TabsContent>
      <TabsContent value="tour">{viewer(true)}<div className="tour-controls">
        <p id={instructionId}><MoveHorizontal size={19}/><span>Drag left or right. On mobile, swipe. Arrow keys work too.</span></p>
        <div className="tour-scrubber"><span id={sliderId}>EXPLORE THE PHOTOS</span><Slider aria-labelledby={sliderId} value={[index + 1]} min={1} max={Math.max(2, count)} step={1} onValueChange={value => setIndex((Array.isArray(value) ? value[0] : value) - 1)} /></div>
        <p className="tour-disclosure">A tour of the available photographs, including details and interior views. This is not a continuous 360° scan.</p>
      </div></TabsContent>
    </Tabs>
    <div className="thumbnails">{photos.map((url, photoIndex) => <button key={url} aria-label={`View photograph ${photoIndex + 1}`} aria-pressed={index === photoIndex} onClick={() => setIndex(photoIndex)}><img src={url} alt="" loading="lazy" draggable={false} width={130} height={100}/></button>)}</div>
  </section>;
}
