import {appointmentDB} from '@/lib/appointment-db';
import {appointmentError,type AppointmentInput} from '@/lib/appointments';
import {cars,name} from '@/lib/cars';
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Please submit from this website.'},{status:403});
 if(Number(request.headers.get('content-length')||0)>8192)return Response.json({error:'Request is too large.'},{status:413});
 let value:unknown;try{const raw=await request.text();if(raw.length>8192)return Response.json({error:'Request is too large.'},{status:413});value=JSON.parse(raw)}catch{return Response.json({error:'Please check the details and try again.'},{status:400})}
 const error=appointmentError(value);if(error)return Response.json({error},{status:400});
 const data=value as AppointmentInput;const vehicle=cars.find(c=>c.id===data.vehicleId);if(!vehicle)return Response.json({error:'This vehicle was not found.'},{status:400});
 try{
  const result=await appointmentDB().prepare('INSERT INTO appointments (id,vehicle_id,vehicle_name,name,phone,email,branch,date,time,message,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(data.id,vehicle.id,name(vehicle),data.name.trim(),data.phone.trim(),data.email.trim(),data.branch,data.date,data.time,data.message.trim(),'requested',new Date().toISOString()).run();
  if(!result.success)throw new Error('Save failed');
  return Response.json({id:data.id,status:'requested'},{status:201,headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Your appointment could not be saved. Please try again or contact sales on WhatsApp.'},{status:503})}
}
