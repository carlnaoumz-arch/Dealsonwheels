/** Limit concurrent photo requests on mobile and release them when a tour closes. */
export async function loadTourPhotos(sources:string[],signal:AbortSignal,createImage:()=>HTMLImageElement=()=>new Image(),timeoutMs=45000):Promise<string[]> {
  const results:(string|null)[]=sources.map(()=>null);
  let cursor=0;
  async function worker(){
    while(!signal.aborted&&cursor<sources.length){
      const index=cursor++,source=sources[index];
      results[index]=await new Promise<string|null>(resolve=>{
        const photo=createImage();let settled=false;
        const finish=(value:string|null)=>{if(settled)return;settled=true;clearTimeout(timer);photo.onload=null;photo.onerror=null;signal.removeEventListener('abort',abort);resolve(value)};
        const abort=()=>{finish(null);photo.removeAttribute('src')};
        const timer=setTimeout(()=>{finish(photo.naturalWidth>0?source:null);photo.removeAttribute('src')},timeoutMs);
        photo.onload=()=>finish(photo.naturalWidth>0?source:null);
        photo.onerror=()=>finish(photo.naturalWidth>0?source:null);
        signal.addEventListener('abort',abort,{once:true});
        photo.src=source;
        // Cached images can complete before their load listener is observed.
        if(photo.complete&&photo.naturalWidth>0)finish(source);
      });
    }
  }
  await Promise.all(Array.from({length:Math.min(3,sources.length)},worker));
  return signal.aborted?[]:results.filter((source):source is string=>source!==null);
}
