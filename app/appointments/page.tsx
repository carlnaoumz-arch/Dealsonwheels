import {headers} from 'next/headers';
import {notFound} from 'next/navigation';
import {appointmentDB,appointmentStorageAvailable} from '@/lib/appointment-db';
import {Header,Footer} from '../site-shell';
export const dynamic='force-dynamic';
export const metadata={title:'Appointment requests | Deals On Wheels',robots:{index:false,follow:false}};
export default async function Appointments(){
 if(!appointmentStorageAvailable())notFound();
 const h=await headers();if(h.get('oai-authenticated-user-email')?.toLowerCase()!=='carlnaoumz@gmail.com')notFound();
 const result=await appointmentDB().prepare('SELECT id,vehicle_name,name,phone,email,branch,date,time,message,status,created_at FROM appointments ORDER BY created_at DESC LIMIT 200').all<{id:string;vehicle_name:string;name:string;phone:string;email:string;branch:string;date:string;time:string;message:string;status:string;created_at:string}>();
 return <main className="detail-page"><Header/><section className="section appointment-inbox"><p className="eyebrow">PRIVATE / APPOINTMENT REQUESTS</p><h1>Your appointments.</h1><p>Preferred times are requests. Contact each client to confirm availability. Times are in Beirut local time.</p>{result.results.length?result.results.map(a=><article className="appointment-record" key={a.id}><p className="eyebrow">{a.branch.toUpperCase()} · {a.date} · {a.time}</p><h2>{a.vehicle_name}</h2><p>{a.name} · <a href={`tel:${a.phone.replace(/[^+\d]/g,'')}`}>{a.phone}</a>{a.email&&<> · <a href={`mailto:${a.email}`}>{a.email}</a></>}</p>{a.message&&<p className="appointment-note">{a.message}</p>}<small>Request {a.id} · {a.status}</small></article>):<p>No appointment requests yet.</p>}</section><Footer/></main>;
}
