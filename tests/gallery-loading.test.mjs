import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function gallery(photo){
 const states=[],timers=new Map();let cleanup;
 const react={useRef:()=>({current:photo}),useState:value=>{const index=states.length;states.push(value);return[value,next=>states[index]=typeof next==='function'?next(states[index]):next]},useEffect:fn=>{cleanup=fn()}};
 const jsx=(type,props)=>({type,props});
 const code=ts.transpileModule(readFileSync(new URL('../app/gallery-photo.tsx',import.meta.url),'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const context={exports:{},require:name=>name==='react'?react:name.includes('responsive-photo')?{photoSources:()=>undefined}:{jsx,jsxs:jsx},setTimeout:fn=>{timers.set(1,fn);return 1},clearTimeout:id=>timers.delete(id)};
 vm.runInNewContext(code,context);const tree=context.exports.default({source:'/photo.webp',title:'Car',index:0});
 return{states,photo,timers,cleanup,img:tree.props.children[0].props,slow:()=>{for(const fn of timers.values())fn()}};
}
test('a cached visible image clears the overlay even when hydration misses load',()=>{
 const h=gallery({complete:true,naturalWidth:1080,currentSrc:'/photo.webp'});assert.equal(h.states[0],'ready');assert.equal(h.timers.size,0);
});
test('a request that failed before hydration is retryable rather than stuck loading',()=>{
 const h=gallery({complete:true,naturalWidth:0,currentSrc:'/photo.webp'});assert.equal(h.states[0],'error');
});
test('a slow image is not marked unavailable and a late load removes its overlay',()=>{
 const h=gallery({complete:false,naturalWidth:0,currentSrc:'/photo.webp'});h.slow();assert.equal(h.states[0],'slow');h.photo.naturalWidth=1080;h.img.onLoad();assert.equal(h.states[0],'ready');h.slow();assert.equal(h.states[0],'ready');h.cleanup();assert.equal(h.timers.size,0);
});
test('a real image failure is recoverable, and visible photos never receive a false error',()=>{
 const h=gallery({complete:false,naturalWidth:0,currentSrc:'/photo.webp'});h.img.onError();assert.equal(h.states[0],'error');h.photo.naturalWidth=1080;h.img.onLoad();assert.equal(h.states[0],'ready');h.img.onError();assert.equal(h.states[0],'ready');h.cleanup();
});
