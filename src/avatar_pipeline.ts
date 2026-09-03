import { z } from "zod";
import { InfraiClient } from "./infrai_client.ts";

export const avatarRequest = z.object({
  shipmentId: z.string().min(1),
  driverId: z.string().min(1),
  filename: z.string().min(1),
  file: z.string().min(1),
  aspect: z.string().regex(/^\d+:\d+$/)
});
export type AvatarRequest = z.infer<typeof avatarRequest>;

export async function processAvatar(input: unknown, client: InfraiClient) {
  const request = avatarRequest.parse(input);
  const uploaded = await client.request<{ id: string }>("/v1/image/upload", { file: request.file, filename: request.filename });
  const cropped = await client.request<{ id: string }>("/v1/image/smart_crop", { image: uploaded.id, aspect: request.aspect });
  return { shipmentId: request.shipmentId, driverId: request.driverId, avatarImageId: cropped.id, state: "avatar_ready" as const };
}
