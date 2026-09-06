import {sqliteTable,text,index} from 'drizzle-orm/sqlite-core';
export const appointments=sqliteTable('appointments',{
 id:text('id').primaryKey(),vehicleId:text('vehicle_id').notNull(),vehicleName:text('vehicle_name').notNull(),name:text('name').notNull(),phone:text('phone').notNull(),email:text('email').notNull().default(''),branch:text('branch').notNull(),date:text('date').notNull(),time:text('time').notNull(),message:text('message').notNull().default(''),status:text('status').notNull().default('requested'),createdAt:text('created_at').notNull()
},table=>[index('appointments_created_at_idx').on(table.createdAt)]);
