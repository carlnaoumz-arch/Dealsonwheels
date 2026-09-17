/** Inventory assets have a small thumbnail, a phone version and a high-resolution version. */
export function photoVariant(source:string,width:240|800):string {
  return source.startsWith('/images/inventory/')?source.replace(/-\d+\.webp$/,`-${width}.webp`):source;
}
export function photoSources(source:string):string|undefined {
  const full=source.match(/^\/images\/inventory\/.+-(\d+)\.webp$/);
  if(!full)return undefined;
  return [`${photoVariant(source,240)} 240w`,`${photoVariant(source,800)} 800w`,...(Number(full[1])>800?[`${source} ${full[1]}w`]:[])].join(', ');
}
