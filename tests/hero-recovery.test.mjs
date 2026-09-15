import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
// Run the actual hero effect against a deterministic media element and clock.
function heroHarness({reduced=false,mobile=true}={}){
 let now=0,id=0,cleanup;const frames=new Map(),timers=new Map(),states=[];
 const section=new EventTarget(),document=new EventTarget(),window=new EventTarget(),media=new EventTarget();
 document.hidden=false;media.matches=reduced;let time=0;
 const video=new EventTarget();Object.assign(video,{readyState:0,duration:8,seeking:false,paused:true,src:'',playbackRate:1,closest:()=>section,load(){},pause(){this.paused=true},play(){this.paused=false;return Promise.resolve()},getAttribute(k){return this[k]||null},removeAttribute(k){this[k]=''}});
 Object.defineProperty(video,'currentTime',{get:()=>time,set:v=>{time=v;video.seeking=true;video.readyState=1}});
 const react={useRef:()=>({current:video}),useState:v=>{const n=states.length;states.push(v);return[v,next=>states[n]=typeof next==='function'?next(states[n]):next]},useEffect:fn=>{cleanup=fn()}};
 const code=ts.transpileModule(readFileSync(new URL('../app/hero-film.tsx',import.meta.url),'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const context={exports:{},require:name=>name==='react'?react:{jsx:()=>null,jsxs:()=>null},document,window,matchMedia:query=>query.includes('reduced')?media:{matches:mobile},performance:{now:()=>now},requestAnimationFrame:fn=>{frames.set(++id,fn);return id},cancelAnimationFrame:key=>frames.delete(key),setTimeout:(fn,delay)=>{timers.set(++id,{fn,at:now+delay});return id},clearTimeout:key=>timers.delete(key),IntersectionObserver:class{observe(){}disconnect(){}}};
 vm.runInNewContext(code,context);context.exports.default();
 const advance=ms=>{now+=ms;for(const [key,t]of[...timers])if(t.at<=now){timers.delete(key);t.fn()}for(const[key,fn]of[...frames]){frames.delete(key);fn(now)}};
 return {video,states,frames,timers,advance,cleanup,media,document,ready(){video.readyState=4;video.seeking=false;video.dispatchEvent(new Event('loadeddata'))},seeked(){video.readyState=4;video.seeking=false;video.dispatchEvent(new Event('seeked'))},progress(value){const event=new Event('hero-film-progress');event.detail=value;section.dispatchEvent(event)}};
}
test('hero selects lightweight mobile footage and falls back on slow loading, then recovers',()=>{const h=heroHarness();assert.match(h.video.src,/-mobile.mp4$/);h.advance(5001);assert.equal(h.states[1],true);h.ready();assert.equal(h.states[0],true);assert.equal(h.states[1],false);h.cleanup();assert.equal(h.frames.size,0);assert.equal(h.timers.size,0)});
test('rapid reverse scrolling keeps only the latest target while a seek is decoding',()=>{const h=heroHarness({mobile:false});h.progress(.5);h.ready();h.advance(40);assert.equal(h.video.currentTime,3.975);h.progress(.2);h.progress(1);h.advance(40);assert.equal(h.video.currentTime,3.975);h.seeked();h.advance(40);assert.equal(h.video.currentTime,7.95);h.advance(1501);assert.equal(h.states[1],true);h.seeked();assert.equal(h.states[1],false);h.cleanup()});
test('intro has a time limit and does not keep an animation loop alive when playback stalls',()=>{const h=heroHarness();h.ready();assert.equal(h.video.paused,false);h.advance(3100);assert.equal(h.video.paused,true);assert.equal(h.frames.size,0);h.cleanup()});
test('reduced motion loads no video, and hiding the page stops intro work',()=>{const h=heroHarness({reduced:true});assert.equal(h.video.src,'');assert.equal(h.states[1],true);assert.equal(h.frames.size,0);h.cleanup();const v=heroHarness();v.ready();v.document.hidden=true;v.document.dispatchEvent(new Event('visibilitychange'));assert.equal(v.video.paused,true);assert.equal(v.frames.size,0);v.cleanup()});
