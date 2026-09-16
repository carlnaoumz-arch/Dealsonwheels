# Vercel deployment

The original `pnpm build` target is a Cloudflare Worker for Sites. Serving its
`dist` directory as a Vite static site returns a 404 because it has no HTML entry.

`vercel.json` selects `pnpm build:vercel`. This uses Vinext's Nitro integration to
produce the Vercel Build Output API structure in `.vercel/output`, including the
server function, static media, and routing configuration. The original Sites
build remains available and independent.

## Verification

- `pnpm build:vercel`
- `pnpm exec vite preview --config vite.vercel.config.ts --port 3015`
- `pnpm exec tsc --noEmit`
- `node --experimental-strip-types --test tests/*.test.mjs`
- `pnpm build` to check the existing Sites build

Verify `/`, a vehicle detail URL, `/privacy`, JavaScript/CSS, and all three video
files. An unknown vehicle and `/appointments` must return 404 on Vercel, including
when a caller supplies an `oai-authenticated-user-email` header.

## Appointment storage

Vercel does not have the original host's Cloudflare D1 binding or trusted Sites
identity gate. Its adapter deliberately has no database binding. The appointment
dialog offers a vehicle-specific WhatsApp handoff with an explicit availability
message, and the private inbox fails closed. No request is reported as saved.
The Sites build keeps its existing D1 request form and private inbox.

Before enabling online appointment storage on Vercel, connect a durable database,
migrate the appointment schema, configure staff authentication and notification
handling, and verify privacy/retention details. Never reuse a caller-supplied
identity header as authentication on a public host.
