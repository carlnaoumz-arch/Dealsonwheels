// Cloudflare D1 bindings and the Sites identity gate do not exist on Vercel.
// Never fabricate successful appointment saves or trust a public identity header.
export const env: {DB?: D1Database} = {};
