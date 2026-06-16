import {
  mysqlTable,
  varchar,
  int,
  timestamp,
  mysqlEnum,
} from "drizzle-orm/mysql-core";

// ---------------------------------------------------------------------------
// Doctor / staff users (Manus OAuth)
// ---------------------------------------------------------------------------
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("open_id", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull().default(""),
  email: varchar("email", { length: 255 }),
  avatar: varchar("avatar", { length: 1024 }),
  role: mysqlEnum("role", ["admin", "user"]).notNull().default("user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
