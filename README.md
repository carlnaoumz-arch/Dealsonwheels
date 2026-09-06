# Deals On Wheels redesign concept

Cinematic responsive site built with React/Vinext. Native requestAnimationFrame scroll scrubbing and a CSS sticky stage reveal the Lamborghini, headlights, moving light and sequential dealer-listed specifications. Reduced-motion preferences show a static vehicle and specs.

## Content
- `lib/inventory.json`: dated public inventory snapshot (77 in-stock/reserved records, 06 September 2026). Update this structured file to refresh listings; never fabricate absent values.
- `lib/cars.ts`: price formatting, vehicle naming and WhatsApp message construction.
- `app/page.tsx`: homepage story and service text. Only verified sales, worldwide network and personal assistance are described.
- `app/site-shell.tsx`: public contact details and navigation.
- `app/vehicles/[id]/page.tsx`: individual vehicle pages with actual dealer gallery and technical data.

The Aventador structured power is 730 hp; dealer prose says 740HP. The site uses the structured field with dealer-listed attribution. The atmospheric blue Lamborghini is edited model imagery, not the gray inventory car. Test-drive buttons open a request in WhatsApp; they do not book or send messages automatically. No unconnected lead form is presented.

## Assets
Studio image: one built-in imagegen background edit of Lamborghini's official Aventador S Roadster model photograph. Final WebP is ~72 KB. The image is explicitly identified as model concept imagery. Dealer images use the original public photo URLs. Aviation is a lifestyle reference from Air Charter Service and does not imply aviation services. Source imagery needs appropriate clearance before a public commercial launch. This site is intended for private concept review.

## Runtime
Use the package scripts in package.json. `dev` runs the local site, `build` produces the Cloudflare Worker build. Dependencies and pinned scaffold versions are preserved. No database or authentication is required by the dealership journey; hosting access is managed by Sites.

## Agent interaction
`filter_vehicle_collection` is feature-detected through document.modelContext. It changes the same brand-filter state as the visible controls and returns matching page links. Unsupported browsers retain the ordinary UI.

Validation: TypeScript check and production build passed. All 77 primary dealer image URLs responded with HTTP 200. Homepage and Aventador route responded with HTTP 200. The WebMCP filter returned seven Lamborghinis; an invalid brand was rejected while preserving the current seven-vehicle result; All restored 77 listings. Full visual/browser/device QA was not requested and has not been performed.

## Interactive photo tours
Every vehicle gallery offers an optional Interactive tour tab. Clients can drag horizontally with the mouse, swipe on touchscreens, use arrow/Home/End keys, select thumbnails or move the photo slider. The experience uses the available dealer photographs in their published order, including interiors/details; it is explicitly not described as a continuous 360-degree scan. Duplicate cover/gallery uploads are removed using the original media filename, while genuine views remain. Adjacent frames preload on demand, selected images decode before display, and failed images have retry/navigation controls. No synthetic vehicle views are created.

Tour validation: TypeScript and production build checks plus Node tests for forward/reverse drag, wrapping, jitter, degenerate inputs, duplicate uploads, and valid sequences across all 77 listings.
