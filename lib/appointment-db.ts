import {env} from 'cloudflare:workers';
export function appointmentDB(){const db=(env as unknown as {DB:D1Database}).DB;if(!db)throw new Error('Appointment storage unavailable');return db}
