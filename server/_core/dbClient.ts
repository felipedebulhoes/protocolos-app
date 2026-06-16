import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "./env";
import * as schema from "../../drizzle/schema";

const globalForDb = globalThis as unknown as {
  __pool?: mysql.Pool;
};

function createPool(): mysql.Pool {
  return mysql.createPool(env.DATABASE_URL);
}

const pool = globalForDb.__pool ?? createPool();
if (env.NODE_ENV !== "production") globalForDb.__pool = pool;

export const db = drizzle(pool, { schema, mode: "default" });
export { schema };
