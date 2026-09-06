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
