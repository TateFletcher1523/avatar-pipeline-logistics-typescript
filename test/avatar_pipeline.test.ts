import assert from "node:assert/strict";
import { processAvatar } from "../src/avatar_pipeline.ts";

class FakeClient { calls: Array<{ path: string; body: Record<string, unknown> }> = []; async request<T>(path: string, body: Record<string, unknown>): Promise<T> { this.calls.push({ path, body }); return (path.includes("upload") ? { id: "img-uploaded" } : { id: "img-cropped" }) as T; } }
const client = new FakeClient();
const result = await processAvatar({ shipmentId: "SHP-1", driverId: "DRV-1", filename: "avatar.png", file: "data:image/png;base64,abc", aspect: "1:1" }, client as never);
assert.deepEqual(result, { shipmentId: "SHP-1", driverId: "DRV-1", avatarImageId: "img-cropped", state: "avatar_ready" });
assert.deepEqual(client.calls.map(call => call.path), ["/v1/image/upload", "/v1/image/smart_crop"]);
assert.equal(client.calls[1].body.aspect, "1:1");
console.log("avatar decision test passed");
