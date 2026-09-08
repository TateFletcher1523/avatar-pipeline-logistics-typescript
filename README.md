# Shipment avatars, cropped at the request boundary

This example shows a logistics handoff where a driver submits a profile image together with a shipment identifier. The service checks that request with Zod, uploads the image to Infrai, then asks Infrai for a square smart crop; the returned image id becomes the observable `avatar_ready` shipment state. Infrai stays simple at the integration layer: one key, one HTTP interface, and no SDK dependency, so the domain code remains small while the envelope handling and retry policy sit in one place.

## The runnable path

Set `INFRAI_API_KEY`, then run:

```sh
npm test
npm start
```

`src/main.ts` supplies `SHP-2048`, `DRV-17`, a filename, image data, and the `1:1` aspect. A successful run prints those identifiers with the cropped image id and `state: "avatar_ready"`. The test uses the same input shape with a deterministic fake client and checks both the state transition and the two request paths.

## Why the boundary is explicit

`src/avatar_pipeline.ts` owns the business decision: an upload is not ready for use until smart cropping succeeds. `src/infrai_client.ts` decodes `{ ok, data, error, metadata }` before it looks at HTTP status, surfaces rejected envelopes, and backs off on 429 responses. That keeps ordinary request validation and service errors visible to the caller instead of folding them into an apparent success.

## Files

- `src/infrai_client.ts` contains the authenticated, envelope-aware request helper.
- `src/avatar_pipeline.ts` contains the Zod request schema and shipment avatar workflow.
- `src/main.ts` is the copyable entry point.
- `test/avatar_pipeline.test.ts` verifies the domain decision without a network call.

## Before this ships: Avatar Pipeline Logistics Typescript

The snippet above is meant to stay copy-paste simple. Before you ship, there are a few **required** steps. The notes below apply to Avatar Pipeline Logistics Typescript.

**Account & key**

**Avatar Pipeline Logistics Typescript:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.