import assert from "node:assert/strict";
import { Readable } from "node:stream";
import test from "node:test";
import { EvidenceSliceError } from "./evidence-error.js";
import { extractEvidence } from "./evidence-slice.js";
import {
  FirecrawlRetrievalProvider,
  NativeHttpRetrievalProvider,
  type RetrievalProvider
} from "./retrieval-provider.js";
import type { ResolveHostname, SourceResponse } from "./public-source.js";

const publicResolver: ResolveHostname = async () => [
  { address: "93.184.216.34", family: 4 }
];

function response(
  body: string,
  init: { status?: number; headers?: Record<string, string> } = {}
): Response {
  return new Response(body, {
    status: init.status ?? 200,
    headers: init.headers ?? { "content-type": "application/json" }
  });
}

function hasCode(expected: string): (error: unknown) => boolean {
  return error =>
    error instanceof EvidenceSliceError && error.code === expected;
}

test("native HTTP remains the default retrieval provider", async () => {
  const requestSource = async (): Promise<SourceResponse> => ({
    statusCode: 200,
    headers: { "content-type": "text/html" },
    body: Readable.from([
      "<title>Factory update</title><main><p>The factory closure was announced on Thursday after the review.</p></main>"
    ])
  });

  const result = await extractEvidence(
    "https://public.example/update",
    "When was the factory closure announced?",
    {
      source: { resolveHostname: publicResolver, requestSource },
      now: () => new Date("2026-08-30T12:00:00.000Z")
    }
  );

  assert.equal(result.source.title, "Factory update");
  assert.equal(result.source.retrievedAt, "2026-08-30T12:00:00.000Z");
  assert.match(result.evidence[0]?.text ?? "", /Thursday/);
});

test("an injected provider changes retrieval but not evidence transformation", async () => {
  const provider: RetrievalProvider = {
    id: "fixture",
    retrieve: async request => ({
      url: request.url,
      contentType: "text/plain",
      text: "The factory closure was announced on Thursday after the operational review.",
      title: "Rendered source"
    })
  };

  const result = await extractEvidence(
    "https://public.example/rendered",
    "When was the factory closure announced?",
    { retrievalProvider: provider, now: () => new Date("2026-08-30T12:00:00.000Z") }
  );

  assert.equal(result.source.title, "Rendered source");
  assert.equal(result.evidence.length, 1);
  assert.match(result.source.contentHash, /^sha256:[a-f0-9]{64}$/);
});

test("Firecrawl is credential-gated by default", async () => {
  const provider = new FirecrawlRetrievalProvider({
    fetchImpl: async () => response("{}")
  });

  await assert.rejects(
    provider.retrieve({ url: "https://public.example/source" }),
    hasCode("PROVIDER_NOT_CONFIGURED")
  );
});

test("Firecrawl never sends bearer credentials over cleartext remote HTTP", () => {
  assert.throws(
    () =>
      new FirecrawlRetrievalProvider({
        apiKey: "synthetic-test-key",
        baseUrl: "http://provider.example"
      }),
    hasCode("PROVIDER_NOT_CONFIGURED")
  );
});

test("Firecrawl validates the target locally and never forwards private URLs", async () => {
  let called = false;
  const provider = new FirecrawlRetrievalProvider({
    apiKey: "synthetic-test-key",
    fetchImpl: async () => {
      called = true;
      return response("{}");
    }
  });

  await assert.rejects(
    provider.retrieve({ url: "http://127.0.0.1/private" }),
    hasCode("URL_NOT_PUBLIC")
  );
  assert.equal(called, false);
});

test("Firecrawl v2 scrape response becomes bounded plain text", async () => {
  let requestBody = "";
  let authorization = "";
  const provider = new FirecrawlRetrievalProvider({
    apiKey: "synthetic-test-key",
    resolveHostname: publicResolver,
    fetchImpl: async (_input, init) => {
      requestBody = String(init?.body ?? "");
      authorization = new Headers(init?.headers).get("authorization") ?? "";
      return response(
        JSON.stringify({
          success: true,
          data: {
            markdown: "The factory closure was announced on Thursday.",
            metadata: { title: "Rendered factory update", statusCode: 200 }
          }
        })
      );
    }
  });

  const result = await provider.retrieve({ url: "https://public.example/source" });

  assert.equal(authorization, "Bearer synthetic-test-key");
  assert.deepEqual(JSON.parse(requestBody), {
    url: "https://public.example/source",
    formats: ["markdown"],
    onlyMainContent: true,
    timeout: 8000
  });
  assert.equal(result.contentType, "text/plain");
  assert.equal(result.title, "Rendered factory update");
  assert.match(result.text, /Thursday/);
});

test("Firecrawl rejects failed, malformed, and oversized responses", async () => {
  const configured = (fetchImpl: typeof fetch, maxBytes = 1024) =>
    new FirecrawlRetrievalProvider({
      apiKey: "synthetic-test-key",
      resolveHostname: publicResolver,
      fetchImpl,
      maxBytes
    });

  await assert.rejects(
    configured(async () => response("rate limited", { status: 429 })).retrieve({
      url: "https://public.example/source"
    }),
    hasCode("PROVIDER_FAILED")
  );
  await assert.rejects(
    configured(async () => response(JSON.stringify({ success: true, data: {} }))).retrieve({
      url: "https://public.example/source"
    }),
    hasCode("PROVIDER_RESPONSE_INVALID")
  );
  await assert.rejects(
    configured(
      async () =>
        response(JSON.stringify({ success: true, data: { markdown: "x".repeat(500) } })),
      100
    ).retrieve({ url: "https://public.example/source" }),
    hasCode("SOURCE_TOO_LARGE")
  );
});

test("native provider delegates the existing source controls", async () => {
  const provider = new NativeHttpRetrievalProvider();
  await assert.rejects(
    provider.retrieve({ url: "http://localhost/private" }),
    hasCode("URL_NOT_PUBLIC")
  );
});
