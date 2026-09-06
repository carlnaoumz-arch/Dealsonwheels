import test from 'node:test';
import assert from 'node:assert/strict';
import {heroMotion} from '../lib/hero-motion.ts';
test('headlights precede the car and the completed reveal precedes the transition',()=>{
 assert.equal(heroMotion(0).body,0);
 assert.equal(heroMotion(0).headlights,0);
 assert.ok(heroMotion(.06).headlights>.5);
 assert.equal(heroMotion(.06).body,0);
 assert.equal(heroMotion(.8).body,1);
 assert.equal(heroMotion(.8).exit,0);
 assert.equal(heroMotion(1).exit,1);
});
test('only one brand line appears at a time and the camera always pushes in slowly',()=>{
 let previous=1;
 for(let i=0;i<=1000;i++){
  const motion=heroMotion(i/1000);
  assert.ok(motion.stories.filter(value=>value>0).length<=1);
  assert.ok(motion.camera>=previous&&motion.camera<=1.055);
  if(motion.title>0)assert.ok(motion.stories.every(value=>value===0));
  previous=motion.camera;
 }
});
test('reduced motion presents the car and title without moving reflections or a fade out',()=>{
 const m=heroMotion(.4,true);
 assert.equal(m.body,1);assert.equal(m.title,1);assert.equal(m.camera,1);
 assert.equal(m.reflection,0);assert.equal(m.exit,0);
});
