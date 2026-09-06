import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {photoIndexFromDrag, wrapPhotoIndex, uniqueVehiclePhotos} from '../lib/photo-tour.ts';

test('dragging advances and reverses frames, wraps, and ignores small cursor movement', () => {
  assert.equal(photoIndexFromDrag(0, -100, 600, 6), 1);
  assert.equal(photoIndexFromDrag(0, 100, 600, 6), 5);
  assert.equal(photoIndexFromDrag(3, 8, 600, 6), 3);
  assert.equal(photoIndexFromDrag(0, -600, 600, 6), 0);
  assert.equal(photoIndexFromDrag(0, -4000, 300, 1), 0);
  assert.equal(photoIndexFromDrag(2, -4000, 0, 6), 2);
  assert.equal(wrapPhotoIndex(-13, 6), 5);
});

test('duplicate cover uploads are removed without dropping distinct gallery views', () => {
  const base='https://example.com/storage/v1/object/public/dealership_assets/vehicle_images/';
  const cover=base+'main/car/1756496772860-front.jpg';
  const duplicate=base+'gallery/car/1756496773738-front.jpg';
  const rear=base+'gallery/car/1756496774790-rear.jpg';
  assert.deepEqual(uniqueVehiclePhotos([cover, duplicate, rear, rear]), [cover, rear]);
  assert.deepEqual(uniqueVehiclePhotos(['/one.jpg', '/two.jpg', '/one.jpg', '']), ['/one.jpg', '/two.jpg']);
});

test('all 77 vehicles retain multiple genuine photos and a valid selectable sequence', () => {
  const cars=JSON.parse(readFileSync(new URL('../lib/inventory.json', import.meta.url)));
  assert.equal(cars.length,77);
  for(const car of cars){
    const source=[car.image_url,...[...car.gallery_images].sort((a,b)=>a.order_index-b.order_index).map(i=>i.image_url)];
    const photos=uniqueVehiclePhotos(source);
    assert.ok(photos.length>=2,car.id);
    assert.equal(photos[0],car.image_url);
    assert.ok(photos.every(p=>source.includes(p)));
    for(const offset of [-6000,-300,-1,0,1,300,6000]){
      const index=photoIndexFromDrag(0,offset,600,photos.length);
      assert.ok(index>=0&&index<photos.length,car.id);
    }
  }
});

test('fractional exterior scrubbing blends continuously, including reverse and loop seams',async()=>{
 const {tourBlend}=await import('../lib/photo-tour.ts');
 assert.deepEqual(tourBlend(0,4),{from:0,to:1,mix:0});
 assert.deepEqual(tourBlend(.5,4),{from:0,to:1,mix:.5});
 assert.deepEqual(tourBlend(-.5,4),{from:3,to:0,mix:.5});
 assert.ok(tourBlend(.9999,4).mix>.999);
 assert.equal(tourBlend(1,4).from,1);
 assert.equal(tourBlend(3.9999,4).to,0);
 assert.equal(tourBlend(4,4).from,0);
 assert.deepEqual(tourBlend(.7,4,true),{from:1,to:1,mix:0});
 for(let i=-200;i<200;i++){
  const blend=tourBlend(i/100,4);
  assert.ok(blend.mix>=0&&blend.mix<=1);
  assert.ok(Number.isInteger(blend.from)&&Number.isInteger(blend.to));
 }
});

test('every vehicle has a curated exterior sequence drawn only from its original photographs',()=>{
 const tours=JSON.parse(readFileSync(new URL('../lib/exterior-tours.json',import.meta.url)));
 const cars=JSON.parse(readFileSync(new URL('../lib/inventory.json',import.meta.url)));
 assert.equal(Object.keys(tours).length,cars.length);
 for(const car of cars){
  const originals=new Set([car.image_url,...car.gallery_images.map(photo=>photo.image_url)]);
  assert.ok(tours[car.id].length>=2,car.id);
  assert.equal(new Set(tours[car.id]).size,tours[car.id].length,car.id);
  assert.ok(tours[car.id].every(photo=>originals.has(photo)),car.id);
 }
});
