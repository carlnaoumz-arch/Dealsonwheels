/** Photo sequences retain the dealer's order; no synthetic views or degree labels. */
export function wrapPhotoIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return ((index % count) + count) % count;
}

export function photoIndexFromDrag(start: number, deltaX: number, width: number, count: number): number {
  if (count < 2 || width <= 0) return wrapPhotoIndex(start, count);
  const pixelsPerPhoto = Math.max(24, width / count);
  return wrapPhotoIndex(start + Math.round(-deltaX / pixelsPerPhoto), count);
}

export function uniqueVehiclePhotos(urls: string[]): string[] {
  const seen = new Set<string>();
  return urls.filter(url => {
    if (!url) return false;
    let key = url;
    try {
      const parsed = new URL(url);
      // The dealer duplicates the cover in gallery storage under a new upload timestamp.
      if (parsed.pathname.includes('/dealership_assets/vehicle_images/')) {
        key = decodeURIComponent(parsed.pathname.split('/').pop() || url).replace(/^\d{10,}-/, '');
      }
    } catch { /* Retain non-URL local assets using their exact source. */ }
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Fractional cursor position blends two genuine adjacent views without inventing angles. */
export function tourBlend(position:number,count:number,reduced=false){
  if(count<2)return {from:0,to:0,mix:0};
  const wrapped=wrapPhotoIndex(position,count);
  if(reduced){const index=wrapPhotoIndex(Math.round(wrapped),count);return {from:index,to:index,mix:0}}
  const from=Math.floor(wrapped),fraction=wrapped-from;
  return {from,to:wrapPhotoIndex(from+1,count),mix:fraction*fraction*(3-2*fraction)};
}
