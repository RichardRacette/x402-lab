import assert from "node:assert/strict";
import { Readable } from "node:stream";
import test from "node:test";
import { EvidenceSliceError } from "./evidence-error.js";
import {
  fetchPublicSource,
  validatePublicUrl,
  type RequestSource,
  type ResolveHostname,
  type SourceResponse
} from "./public-source.js";

const publicResolver: ResolveHostname = async () => [
  { address: "93.184.216.34", family: 4 }
];

function sourceResponse(
  statusCode: number,
  headers: SourceResponse["headers"],
  chunks: Array<string | Uint8Array> = []
): SourceResponse {
  return {
    statusCode,
    headers,
    body: Readable.from(chunks)
  };
}

function hasCode(expectedCode: string): (error: unknown) => boolean {
  return error =>
    error instanceof EvidenceSliceError && error.code === expectedCode;
}

test("rejects localhost and private IP URLs", async () => {
  await assert.rejects(
    validatePublicUrl("http://localhost/source"),
    hasCode("URL_NOT_PUBLIC")
  );
  await assert.rejects(
    validatePublicUrl("http://127.0.0.1/source"),
    hasCode("URL_NOT_PUBLIC")
  );
  await assert.rejects(
    validatePublicUrl("http://10.12.0.8/source"),
    hasCode("URL_NOT_PUBLIC")
  );
  await assert.rejects(
    validatePublicUrl("http://169.254.169.254/latest/meta-data"),
    hasCode("URL_NOT_PUBLIC")
  );
  await assert.rejects(
    validatePublicUrl("http://[::1]/source"),
    hasCode("URL_NOT_PUBLIC")
  );
});

test("rejects unsupported URL schemes and embedded credentials", async () => {
  await assert.rejects(
    validatePublicUrl("file:///etc/passwd"),
    hasCode("INVALID_INPUT")
  );
  await assert.rejects(
    validatePublicUrl("https://user:password@public.example/source", publicResolver),
    hasCode("URL_NOT_PUBLIC")
  );
});

test("rejects a hostname if any DNS result is not public", async () => {
  const mixedResolver: ResolveHostname = async () => [
    { address: "93.184.216.34", family: 4 },
    { address: "169.254.169.254", family: 4 }
  ];

  await assert.rejects(
    validatePublicUrl("https://public.example/source", mixedResolver),
    hasCode("URL_NOT_PUBLIC")
  );
});

test("revalidates redirect destinations before connecting", async () => {
  let requestCount = 0;
  const requester: RequestSource = async () => {
    requestCount += 1;
    return sourceResponse(302, { location: "http://127.0.0.1/private" });
  };

  await assert.rejects(
    fetchPublicSource("https://public.example/start", {
      resolveHostname: publicResolver,
      requestSource: requester
    }),
    hasCode("URL_NOT_PUBLIC")
  );
  assert.equal(requestCount, 1);
});

test("enforces the redirect limit", async () => {
  let requestCount = 0;
  const requester: RequestSource = async () => {
    requestCount += 1;
    return sourceResponse(302, { location: "/next" });
  };

  await assert.rejects(
    fetchPublicSource("https://public.example/start", {
      maxRedirects: 3,
      resolveHostname: publicResolver,
      requestSource: requester
    }),
    hasCode("TOO_MANY_REDIRECTS")
  );
  assert.equal(requestCount, 4);
});

test("enforces the overall fetch timeout", async () => {
  const requester: RequestSource = async () =>
    new Promise<SourceResponse>(() => undefined);

  await assert.rejects(
    fetchPublicSource("https://public.example/slow", {
      timeoutMs: 10,
      resolveHostname: publicResolver,
      requestSource: requester
    }),
    hasCode("FETCH_TIMEOUT")
  );
});

test("rejects unsupported content types", async () => {
  const requester: RequestSource = async () =>
    sourceResponse(200, { "content-type": "application/pdf" }, ["not a PDF"]);

  await assert.rejects(
    fetchPublicSource("https://public.example/report", {
      resolveHostname: publicResolver,
      requestSource: requester
    }),
    hasCode("UNSUPPORTED_CONTENT_TYPE")
  );
});

test("enforces the streamed source-size limit", async () => {
  const requester: RequestSource = async () =>
    sourceResponse(200, { "content-type": "text/plain" }, ["1234", "5678"]);

  await assert.rejects(
    fetchPublicSource("https://public.example/large.txt", {
      maxBytes: 7,
      resolveHostname: publicResolver,
      requestSource: requester
    }),
    hasCode("SOURCE_TOO_LARGE")
  );
});
