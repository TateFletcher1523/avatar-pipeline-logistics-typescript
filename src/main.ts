import { InfraiClient } from "./infrai_client.ts";
import { processAvatar } from "./avatar_pipeline.ts";

const key = process.env.INFRAI_API_KEY;
if (!key) throw new Error("Set INFRAI_API_KEY before running the example");
const result = await processAvatar({ shipmentId: "SHP-2048", driverId: "DRV-17", filename: "driver-avatar.jpg", file: "data:image/jpeg;base64,REPLACE_WITH_IMAGE_DATA", aspect: "1:1" }, new InfraiClient(key));
console.log(JSON.stringify(result, null, 2));
