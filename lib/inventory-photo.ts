import assets from './inventory-images.json';
/** Keep the dealer source in inventory records; resolve photography at the server boundary. */
export function inventoryPhoto(source:string):string {
  const variants=(assets as Record<string,{src:string;width:number}[]>)[source];
  return variants?.at(-1)?.src || source;
}
