import { EvidenceSliceError } from "./evidence-error.js";
import {
  fetchPublicSource,
  validatePublicUrl,
  type PublicSource,
  type PublicSourceOptions,
  type ResolveHostname
} from "./public-source.js";

const DEFAULT_FIRECRAWL_BASE_URL = "https://api.firecrawl.dev";
const DEFAULT_TIMEOUT_MS = 8_000;
const DEFAULT_MAX_BYTES = 1024 * 1024;

export interface RetrievalRequest {
  url: string;
  source?: PublicSourceOptions;
}

export interface RetrievedSource extends PublicSource {
  title?: string;
}

export interface RetrievalProvider {
  readonly id: string;
  retrieve(request: RetrievalRequest): Promise<RetrievedSource>;
}

export class NativeHttpRetrievalProvider implements RetrievalProvider {
  readonly id = "native-http";

  retrieve(request: RetrievalRequest): Promise<RetrievedSource> {
    return fetchPublicSource(request.url, request.source);
  }
}

export const nativeHttpRetrievalProvider = new NativeHttpRetrievalProvider();

export interface FirecrawlRetrievalProviderOptions {
  apiKey?: string;
  authentication?: "bearer" | "none";
  baseUrl?: string;
  timeoutMs?: number;
  maxBytes?: number;
  fetchImpl?: typeof fetch;
  resolveHostname?: ResolveHostname;
}

async function readBoundedResponse(response: Response, maxBytes: number): Promise<string> {
  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new EvidenceSliceError(
      "SOURCE_TOO_LARGE",
      `The retrieval provider response exceeds ${maxBytes} bytes.`
    );
  }

  if (!response.body) return "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let totalBytes = 0;
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      await reader.cancel();
      throw new EvidenceSliceError(
        "SOURCE_TOO_LARGE",
        `The retrieval provider response exceeds ${maxBytes} bytes.`
      );
    }
    text += decoder.decode(value, { stream: true });
  }

  return text + decoder.decode();
}

function configuredEndpoint(
  baseUrl: string,
  authentication: "bearer" | "none"
): string {
  let parsed: URL;
  try {
    parsed = new URL(baseUrl);
  } catch {
    throw new EvidenceSliceError(
      "PROVIDER_NOT_CONFIGURED",
      "The Firecrawl base URL is invalid."
    );
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new EvidenceSliceError(
      "PROVIDER_NOT_CONFIGURED",
      "The Firecrawl base URL must use http or https."
    );
  }
  const loopback =
    parsed.hostname === "localhost" ||
    parsed.hostname === "127.0.0.1" ||
    parsed.hostname === "[::1]";
  if (authentication === "bearer" && parsed.protocol === "http:" && !loopback) {
    throw new EvidenceSliceError(
      "PROVIDER_NOT_CONFIGURED",
      "Firecrawl bearer credentials require HTTPS or a loopback endpoint."
    );
  }
  return `${parsed.toString().replace(/\/$/, "")}/v2/scrape`;
}

export class FirecrawlRetrievalProvider implements RetrievalProvider {
  readonly id = "firecrawl-v2";
  private readonly apiKey?: string;
  private readonly authentication: "bearer" | "none";
  private readonly endpoint: string;
  private readonly timeoutMs: number;
  private readonly maxBytes: number;
  private readonly fetchImpl: typeof fetch;
  private readonly resolveHostname?: ResolveHostname;

  constructor(options: FirecrawlRetrievalProviderOptions = {}) {
    this.apiKey = options.apiKey;
    this.authentication = options.authentication ?? "bearer";
    this.endpoint = configuredEndpoint(
      options.baseUrl ?? DEFAULT_FIRECRAWL_BASE_URL,
      this.authentication
    );
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.resolveHostname = options.resolveHostname;
  }

  async retrieve(request: RetrievalRequest): Promise<RetrievedSource> {
    if (this.authentication === "bearer" && !this.apiKey) {
      throw new EvidenceSliceError(
        "PROVIDER_NOT_CONFIGURED",
        "Firecrawl retrieval requires an API key."
      );
    }
    if (!Number.isFinite(this.timeoutMs) || this.timeoutMs <= 0 || this.timeoutMs > 60_000) {
      throw new EvidenceSliceError(
        "PROVIDER_NOT_CONFIGURED",
        "Firecrawl timeout must be between 1 and 60,000 milliseconds."
      );
    }
    if (!Number.isInteger(this.maxBytes) || this.maxBytes <= 0) {
      throw new EvidenceSliceError(
        "PROVIDER_NOT_CONFIGURED",
        "Firecrawl response limit must be a positive integer."
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const validated = await validatePublicUrl(
        request.url,
        this.resolveHostname ?? request.source?.resolveHostname,
        controller.signal
      );
      const headers = new Headers({ "content-type": "application/json" });
      if (this.authentication === "bearer") {
        headers.set("authorization", `Bearer ${this.apiKey}`);
      }

      const response = await this.fetchImpl(this.endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          url: validated.url.toString(),
          formats: ["markdown"],
          onlyMainContent: true,
          timeout: this.timeoutMs
        }),
        redirect: "error",
        signal: controller.signal
      });

      if (!response.ok) {
        throw new EvidenceSliceError(
          "PROVIDER_FAILED",
          `Firecrawl returned HTTP ${response.status}.`,
          response.status === 429 || response.status >= 500
        );
      }
      const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
      if (!contentType.startsWith("application/json")) {
        throw new EvidenceSliceError(
          "PROVIDER_RESPONSE_INVALID",
          "Firecrawl returned a non-JSON response."
        );
      }

      const raw = await readBoundedResponse(response, this.maxBytes);
      let payload: unknown;
      try {
        payload = JSON.parse(raw);
      } catch {
        throw new EvidenceSliceError(
          "PROVIDER_RESPONSE_INVALID",
          "Firecrawl returned malformed JSON."
        );
      }

      if (typeof payload !== "object" || payload === null) {
        throw new EvidenceSliceError(
          "PROVIDER_RESPONSE_INVALID",
          "Firecrawl response did not contain an object."
        );
      }
      const result = payload as {
        success?: unknown;
        data?: { markdown?: unknown; metadata?: { title?: unknown } };
      };
      if (
        result.success !== true ||
        typeof result.data?.markdown !== "string" ||
        !result.data.markdown.trim()
      ) {
        throw new EvidenceSliceError(
          "PROVIDER_RESPONSE_INVALID",
          "Firecrawl response did not contain Markdown."
        );
      }

      const title = result.data.metadata?.title;
      return {
        url: validated.url.toString(),
        contentType: "text/plain",
        text: result.data.markdown,
        ...(typeof title === "string" && title.trim() ? { title: title.trim() } : {})
      };
    } catch (error) {
      if (error instanceof EvidenceSliceError) throw error;
      throw new EvidenceSliceError(
        "PROVIDER_FAILED",
        controller.signal.aborted
          ? "Firecrawl did not respond within the configured timeout."
          : "Firecrawl retrieval failed.",
        true
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}
