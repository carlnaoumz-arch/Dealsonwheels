import {env} from 'cloudflare:workers';
export function appointmentStorageAvailable(){return Boolean((env as unknown as {DB?:D1Database}).DB)}
export function appointmentDB(){const db=(env as unknown as {DB:D1Database}).DB;if(!db)throw new Error('Appointment storage unavailable');return db}
