import { db } from "./_core/dbClient";
import { users, type User } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export { db };

export async function upsertUserByOpenId(args: {
  openId: string;
  name: string;
  email?: string | null;
  avatar?: string | null;
}): Promise<User> {
  const existing = await db.select().from(users).where(eq(users.openId, args.openId)).limit(1);
  if (existing[0]) {
    await db
      .update(users)
      .set({ name: args.name, email: args.email ?? null, avatar: args.avatar ?? null })
      .where(eq(users.openId, args.openId));
    const updated = await db.select().from(users).where(eq(users.openId, args.openId)).limit(1);
    return updated[0];
  }
  const count = await db.select().from(users).limit(1);
  const role = count.length === 0 ? "admin" : "user";
  await db.insert(users).values({
    openId: args.openId,
    name: args.name,
    email: args.email ?? null,
    avatar: args.avatar ?? null,
    role,
  });
  const created = await db.select().from(users).where(eq(users.openId, args.openId)).limit(1);
  return created[0];
}
