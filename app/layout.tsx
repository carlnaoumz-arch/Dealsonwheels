import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {icons:{icon:'/favicon.svg'},title:'Deals On Wheels — Automotive Extravagance',description:'Exceptional automobiles. A personal experience. Explore Deals On Wheels, Dbayeh, Lebanon.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
