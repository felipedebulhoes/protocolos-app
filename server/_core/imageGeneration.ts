import { env } from "./env";

const base = () => (env.BUILT_IN_FORGE_API_URL || "").replace(/\/+$/, "");

export interface GenerateImageParams {
  prompt: string;
  originalImages?: Array<{ url: string; mimeType?: string }>;
}

export async function generateImage(params: GenerateImageParams): Promise<{ url: string }> {
  const resp = await fetch(`${base()}/v1/images/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.BUILT_IN_FORGE_API_KEY}`,
    },
    body: JSON.stringify({
      prompt: params.prompt,
      original_images: params.originalImages,
    }),
  });
  if (!resp.ok) {
    throw new Error(`generateImage failed (${resp.status}): ${await resp.text()}`);
  }
  const data = (await resp.json()) as { url?: string; data?: Array<{ url: string }> };
  const url = data.url ?? data.data?.[0]?.url ?? "";
  return { url };
}
