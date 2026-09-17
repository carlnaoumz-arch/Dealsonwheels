# Inventory photography

The original dealership URLs remain in `lib/inventory.json` and `lib/exterior-tours.json` as provenance. `lib/inventory-images.json` maps those sources to same-origin static WebP photographs. This avoids loading a full-size third-party photograph for every thumbnail and removes a third-party availability dependency from the published inventory.

The 240px thumbnails, 800px phone/tour versions, and high-resolution versions preserve the photograph without cropping, synthetic changes, or upscaling. The cinematic hero and animated Aventador tour are separate, unchanged media.

After an authorized inventory refresh, install the isolated photo tool with `npm install --prefix scripts`, then run `node scripts/prepare-inventory-images.mjs`. Test and deploy the generated manifest and `public/images/inventory` together. Sharp is only a maintenance tool, not an application or deployment dependency. The command fails rather than writing a partial manifest if any original cannot be downloaded. Existing output files are reused. The dated inventory notice remains until listing details are verified.

Gallery loading is driven by the visible image element, including images that complete before hydration. A slow connection displays a loading message, not an unavailable warning. Exterior tours use at most three concurrent requests and cancel pending work when closed; image decoding is not a prerequisite for accepting a successfully loaded photograph.
