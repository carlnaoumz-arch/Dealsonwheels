export type AppointmentInput={id:string;vehicleId:string;name:string;phone:string;email:string;branch:string;date:string;time:string;message:string};
export function beirutNow(now=new Date()){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Beirut',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now);
 const part=(type:string)=>parts.find(p=>p.type===type)!.value;
 return {date:`${part('year')}-${part('month')}-${part('day')}`,time:`${part('hour')}:${part('minute')}`};
}
export function appointmentError(value:unknown,now=new Date()):string|null{
 if(!value||typeof value!=='object')return 'Please complete the appointment details.';
 const v=value as Record<string,unknown>;
 for(const key of ['id','vehicleId','name','phone','email','branch','date','time','message'])if(typeof v[key]!=='string')return 'Please complete the appointment details.';
 const p=v as unknown as AppointmentInput;
 if(!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(p.id))return 'Please refresh and try again.';
 if(!p.name.trim()||p.name.length>120)return 'Please enter your name.';
 if(!/^\+?[\d\s().-]{7,25}$/.test(p.phone)||p.phone.replace(/\D/g,'').length<7)return 'Please enter a valid phone number.';
 if(p.email.length>254||(p.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)))return 'Please enter a valid email address.';
 if(!['dbayeh','beirut'].includes(p.branch))return 'Please choose a branch.';
 if(!/^\d{4}-\d{2}-\d{2}$/.test(p.date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(p.time))return 'Please choose a date and time.';
 const date=new Date(p.date+'T12:00:00Z');
 if(Number.isNaN(date.valueOf())||date.toISOString().slice(0,10)!==p.date)return 'Please choose a valid date.';
 const local=beirutNow(now);
 if(p.date<local.date||(p.date===local.date&&p.time<=local.time))return 'Please choose a future date and time (Beirut time).';
 if(date.valueOf()>now.valueOf()+366*86400000)return 'Please choose a date within the next year.';
 if(p.message.length>1000)return 'Please keep your message under 1,000 characters.';
 return null;
}
