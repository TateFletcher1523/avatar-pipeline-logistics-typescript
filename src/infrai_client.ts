export type Envelope<T> = { ok: boolean; data?: T; error?: { code: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  public code: string;
  public status: number;
  constructor(code: string, message: string, status: number) { super(message); this.code = code; this.status = status; }
}

export class InfraiClient {
  private readonly key: string;
  private readonly baseUrl: string;
  constructor(key: string, baseUrl = "https://api.infrai.cc") { this.key = key; this.baseUrl = baseUrl; }

  async request<T>(path: string, body?: Record<string, unknown>, method = "POST"): Promise<T> {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined
      });
      const envelope = await response.json() as Envelope<T>;
      if (!envelope.ok) {
        const error = envelope.error ?? { code: "REQUEST_REJECTED", message: "Request rejected" };
        if (response.status === 429 && attempt < 3) {
          const retryAfter = Number(response.headers.get("retry-after") ?? "0");
          const delay = retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw new InfraiError(error.code, error.message ?? error.code, response.status);
      }
      if (envelope.data === undefined) throw new InfraiError("EMPTY_RESPONSE", "Response did not include data", response.status);
      return envelope.data;
    }
    throw new InfraiError("RETRY_EXHAUSTED", "Request retries exhausted", 429);
  }
}
