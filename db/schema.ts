import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
export const items=sqliteTable('items',{id:text('id').primaryKey(),workspace:text('workspace').notNull(),status:text('status').notNull(),data:text('data').notNull()},t=>[index('idx_items_status_workspace').on(t.status,t.workspace)]);
export const evidence=sqliteTable('evidence',{id:text('id').primaryKey(),itemId:text('item_id'),data:text('data').notNull()});
export const alerts=sqliteTable('alerts',{id:text('id').primaryKey(),itemId:text('item_id').notNull().references(()=>items.id),status:text('status').notNull(),data:text('data').notNull()},t=>[index('idx_alerts_status').on(t.status)]);
