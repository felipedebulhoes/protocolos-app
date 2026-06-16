import { env } from "./env";

const base = () => (env.BUILT_IN_FORGE_API_URL || "").replace(/\/+$/, "");

/**
 * Upload bytes to Manus storage. Returns the storage key and the
 * app-served url (/manus-storage/{key}).
 */
export async function storagePut(
  key: string,
  data: Buffer | Uint8Array | string,
  contentType: string = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  // Get presigned PUT url
  const presignUrl = new URL("v1/storage/presign/put", base() + "/");
  presignUrl.searchParams.set("path", key);
  presignUrl.searchParams.set("content_type", contentType);

  const presignResp = await fetch(presignUrl, {
    headers: { Authorization: `Bearer ${env.BUILT_IN_FORGE_API_KEY}` },
  });
  if (!presignResp.ok) {
    throw new Error(`storagePut presign failed (${presignResp.status}): ${await presignResp.text()}`);
  }
  const { url: putUrl } = (await presignResp.json()) as { url: string };
  if (!putUrl) throw new Error("storagePut: empty presigned url");

  const bodyData: BodyInit =
    typeof data === "string" ? data : new Uint8Array(data as Uint8Array);

  const putResp = await fetch(putUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: bodyData,
  });
  if (!putResp.ok) {
    throw new Error(`storagePut upload failed (${putResp.status}): ${await putResp.text()}`);
  }

  return { key, url: `/manus-storage/${key}` };
}

/**
 * Get a presigned GET url for a stored object (server-side use, e.g. feeding
 * a file to the LLM).
 */
export async function storageGetSignedUrl(key: string): Promise<string> {
  const getUrl = new URL("v1/storage/presign/get", base() + "/");
  getUrl.searchParams.set("path", key);
  const resp = await fetch(getUrl, {
    headers: { Authorization: `Bearer ${env.BUILT_IN_FORGE_API_KEY}` },
  });
  if (!resp.ok) {
    throw new Error(`storageGetSignedUrl failed (${resp.status})`);
  }
  const { url } = (await resp.json()) as { url: string };
  return url;
}
