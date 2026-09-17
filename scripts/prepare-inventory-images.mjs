import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
const root=new URL('../',import.meta.url);
const cars=JSON.parse(await readFile(new URL('lib/inventory.json',root)));
const urls=[...new Set(cars.flatMap(c=>[c.image_url,...c.gallery_images.map(p=>p.image_url)]))];
const output=new URL('public/images/inventory/',root);await mkdir(output,{recursive:true});
const manifest={},errors=[];let cursor=0,done=0,totalBytes=0;
async function worker(){while(cursor<urls.length){const url=urls[cursor++];const id=createHash('sha256').update(url).digest('hex').slice(0,20);try{
 let data;
 for(let attempt=0;attempt<3;attempt++){try{const res=await fetch(url,{signal:AbortSignal.timeout(45000)});if(!res.ok)throw Error(String(res.status));data=Buffer.from(await res.arrayBuffer());break}catch(e){if(attempt===2)throw e}}
 const meta=await sharp(data).metadata();totalBytes+=data.length;
 const widths=[240,800,Math.min(1800,meta.width)];const variants=[];
 for(const width of [...new Set(widths)].sort((a,b)=>a-b)){const name=`${id}-${width}.webp`;const path=new URL(name,output);try{await stat(path)}catch{await sharp(data).rotate().resize({width,withoutEnlargement:true}).webp({quality:width<=240?82:width<=800?88:92,effort:4}).toFile(path.pathname)}variants.push({width:Math.min(width,meta.width),src:`/images/inventory/${name}`})}
 manifest[url]=variants;
 }catch(e){errors.push({url,error:String(e)})}
 done++;if(done%50===0)console.log(`${done}/${urls.length}`);
}}
await Promise.all(Array.from({length:6},worker));
if(errors.length)console.error(JSON.stringify(errors,null,2));
if(errors.length)throw Error(`${errors.length} images failed; see errors above`);
await writeFile(new URL('lib/inventory-images.json',root),JSON.stringify(Object.fromEntries(Object.entries(manifest).sort()),null,0)+'\n');
console.log(JSON.stringify({count:done,totalBytes,errors}));
