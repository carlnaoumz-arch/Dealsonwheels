'use client';
import {useRef,useState,type FormEvent} from 'react';
import {CalendarDays,ArrowRight,Check,LoaderCircle} from 'lucide-react';
import {Dialog,DialogTrigger,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {beirutNow} from '@/lib/appointments';
import {branches} from '@/lib/branches';
export default function BookAppointment({vehicleId,vehicleName}:{vehicleId:string;vehicleName:string}){
 const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[receipt,setReceipt]=useState<{id:string;date:string;time:string;branch:string}|null>(null);
 const request=useRef({id:'',details:''});
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy)return;
  const data=new FormData(event.currentTarget);
  const details={vehicleId,...Object.fromEntries(['name','phone','email','branch','date','time','message'].map(key=>[key,String(data.get(key)||'').trim()]))};
  const serialized=JSON.stringify(details);
  if(request.current.details!==serialized)request.current={id:crypto.randomUUID(),details:serialized};
  const payload={id:request.current.id,...details};
  setBusy(true);setError('');
  try{const response=await fetch('/api/appointments',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const result=await response.json() as {id?:string;error?:string};if(!response.ok||!result.id)throw new Error(result.error||'Please try again.');setReceipt({id:result.id,date:String(data.get('date')),time:String(data.get('time')),branch:String(data.get('branch'))});}
  catch(cause){setError(cause instanceof Error?cause.message:'Unable to save your request. Please try again.')}finally{setBusy(false)}
 }
 return <Dialog open={open} onOpenChange={value=>{if(!busy)setOpen(value)}}><DialogTrigger className="button outline book-appointment-trigger"><CalendarDays size={17}/> Book an appointment</DialogTrigger><DialogContent className="private-search-dialog appointment-dialog"><DialogTitle className="private-search-label">YOUR PRIVATE VIEWING</DialogTitle><DialogDescription className="search-hint">{vehicleName}</DialogDescription>{receipt?<div className="appointment-success"><Check size={28}/><h3>Request received.</h3><p>{branches.find(b=>b.id===receipt.branch)?.name} · {receipt.date} · {receipt.time}</p><p>Your preferred time has been saved. This is an appointment request, subject to confirmation.</p><small>Reference: {receipt.id.slice(0,8).toUpperCase()}</small><button className="button" onClick={()=>setOpen(false)}>Done <ArrowRight size={17}/></button></div>:<form onSubmit={submit}><div className="appointment-fields"><label>Full name<input name="name" required maxLength={120} autoComplete="name"/></label><label>Phone number<input name="phone" type="tel" required minLength={7} maxLength={25} autoComplete="tel" placeholder="+961 …"/></label><label className="appointment-wide">Email <span>Optional</span><input name="email" type="email" maxLength={254} autoComplete="email"/></label><fieldset className="appointment-wide search-choices"><legend>Preferred branch</legend>{branches.map((branch,i)=><label key={branch.id}><input type="radio" name="branch" value={branch.id} defaultChecked={i===0}/><span>{branch.name}</span></label>)}</fieldset><label>Preferred date<input name="date" type="date" required min={beirutNow().date}/></label><label>Preferred time<input name="time" type="time" required/></label><label className="appointment-wide">Anything we should know? <span>Optional</span><textarea name="message" maxLength={1000} rows={3}/></label></div><p className="appointment-policy">Private preview: requests are saved for review, not confirmed bookings. All times are in Beirut local time.</p><p className="appointment-policy">We use your contact details to respond to this request. <a className="privacy-inline" href="/privacy" target="_blank" rel="noopener noreferrer">Privacy & contact ↗</a></p>{error&&<p className="appointment-error" role="alert">{error}</p>}<button className="button appointment-submit" disabled={busy}>{busy?<><LoaderCircle className="photo-loader" size={17}/> Saving request…</>:<>Request appointment <ArrowRight size={17}/></>}</button></form>}</DialogContent></Dialog>;
}
