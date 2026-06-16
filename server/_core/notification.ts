import { env } from "./env";

const base = () => (env.BUILT_IN_FORGE_API_URL || "").replace(/\/+$/, "");

/**
 * Push an operational notification to the Manus project owner (the doctor).
 * Returns true on success, false if upstream is unavailable.
 */
export async function notifyOwner(args: { title: string; content: string }): Promise<boolean> {
  try {
    const resp = await fetch(`${base()}/v1/notifications/owner`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.BUILT_IN_FORGE_API_KEY}`,
      },
      body: JSON.stringify({
        title: args.title,
        content: args.content,
        owner_open_id: env.OWNER_OPEN_ID,
      }),
    });
    return resp.ok;
  } catch (e) {
    console.error("[notifyOwner] failed", e);
    return false;
  }
}
