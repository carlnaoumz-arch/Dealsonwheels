import test from 'node:test';
import assert from 'node:assert/strict';
import {loadTourPhotos} from '../lib/load-tour-photos.ts';
import {photoVariant,photoSources} from '../lib/responsive-photo.ts';
import {existsSync,readFileSync} from 'node:fs';

function images(behaviour){
  let active=0,peak=0,created=0,cancelled=0;
  return {stats:()=>({active,peak,created,cancelled}),create:()=>{
    created++;let timer;
    const photo={complete:false,naturalWidth:0,onload:null,onerror:null,decode:()=>Promise.reject(Error('Safari decoder busy')),removeAttribute(){clearTimeout(timer);cancelled++},set src(source){
      active++;peak=Math.max(peak,active);
      if(behaviour==='cached'){this.complete=true;this.naturalWidth=1080;active--;return}
      if(behaviour==='pending')return;
      timer=setTimeout(()=>{active--;this.complete=true;this.naturalWidth=source==='missing'?0:1080;(source==='missing'?this.onerror:this.onload)?.()},5);
    }};
    return photo;
  }};
}
test('cached photos remain usable without decode() or a subsequent load event',async()=>{
 const factory=images('cached');
 assert.deepEqual(await loadTourPhotos(['a','b'],new AbortController().signal,factory.create,100),['a','b']);
});
test('loads are bounded, retain order and do not depend on Safari decode()',async()=>{
 const factory=images('load');const sources=['a','b','missing','d','e','f','g'];
 assert.deepEqual(await loadTourPhotos(sources,new AbortController().signal,factory.create,100),['a','b','d','e','f','g']);
 assert.equal(factory.stats().peak,3);
});
test('closing a tour cancels outstanding image loads and starts no queued work',async()=>{
 const factory=images('pending'),controller=new AbortController();
 const pending=loadTourPhotos(['a','b','c','d','e'],controller.signal,factory.create,100);
 controller.abort();assert.deepEqual(await pending,[]);
 assert.equal(factory.stats().created,3);assert.equal(factory.stats().cancelled,3);
});
test('a stalled tour request finishes and can be retried',async()=>{
 assert.deepEqual(await loadTourPhotos(['a'],new AbortController().signal,images('pending').create,5),[]);
 assert.deepEqual(await loadTourPhotos(['a'],new AbortController().signal,images('load').create,100),['a']);
});
test('responsive sources preserve the full photo and use small thumbnails',()=>{
 const source='/images/inventory/abc-1728.webp';
 assert.equal(photoVariant(source,240),'/images/inventory/abc-240.webp');
 assert.match(photoSources(source),/800\.webp 800w/);
 assert.match(photoSources(source),/1728\.webp 1728w/);
 assert.equal(photoVariant('https://dealer/photo.jpg',240),'https://dealer/photo.jpg');
 assert.equal(photoSources('https://dealer/photo.jpg'),undefined);
});
test('every inventory photo has deployable same-origin thumbnail, phone and full-size assets',()=>{
 const cars=JSON.parse(readFileSync(new URL('../lib/inventory.json',import.meta.url)));
 const assets=JSON.parse(readFileSync(new URL('../lib/inventory-images.json',import.meta.url)));
 const originals=new Set(cars.flatMap(car=>[car.image_url,...car.gallery_images.map(photo=>photo.image_url)]));
 assert.equal(originals.size,844);
 for(const source of originals){
  const variants=assets[source];assert.ok(variants,source);
  assert.ok(variants.some(v=>v.width===240));assert.ok(variants.some(v=>v.width===800));
  for(const {src} of variants){assert.ok(src.startsWith('/images/inventory/'));assert.ok(existsSync(new URL('../public'+src,import.meta.url)),src);}
 }
});
