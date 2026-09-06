import test from 'node:test';
import assert from 'node:assert/strict';
import {appointmentError,beirutNow} from '../lib/appointments.ts';
const now=new Date('2026-09-07T21:30:00Z');
const valid={id:'76bbec24-1f5a-43b8-8f20-06aaf5d2279d',vehicleId:'zhwev4zd7jla07350',name:'Test Client',phone:'+961 81 123 456',email:'',branch:'dbayeh',date:'2026-09-09',time:'14:00',message:''};
test('appointment time validation follows Beirut across UTC midnight',()=>{
 assert.deepEqual(beirutNow(now),{date:'2026-09-08',time:'00:30'});
 assert.equal(appointmentError(valid,now),null);
 assert.ok(appointmentError({...valid,date:'2026-09-07',time:'23:59'},now));
 assert.ok(appointmentError({...valid,date:'2026-09-08',time:'00:30'},now));
 assert.equal(appointmentError({...valid,date:'2026-09-08',time:'00:31'},now),null);
});
test('rejects invalid calendar dates, unknown branches and malformed fields',()=>{
 for(const changes of [{date:'2026-09-31'},{date:'2028-01-01'},{time:'24:00'},{branch:'unknown'},{name:' '},{phone:'--- ---'},{email:'invalid'},{message:'a'.repeat(1001)},{id:'not-a-uuid'},{phone:123}])assert.ok(appointmentError({...valid,...changes},now));
 for(const value of [null,[],{},'text'])assert.ok(appointmentError(value,now));
 assert.equal(appointmentError({...valid,branch:'beirut',email:'client@example.com'},now),null);
});
