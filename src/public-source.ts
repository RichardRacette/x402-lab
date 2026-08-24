import { lookup } from "node:dns/promises";
import http, { type IncomingHttpHeaders, type RequestOptions } from "node:http";
import https from "node:https";
import { isIP } from "node:net";
import { EvidenceSliceError } from "./evidence-error.js";

const DEFAULT_TIMEOUT_MS = 8_000;
const DEFAULT_MAX_BYTES = 1024 * 1024;
const DEFAULT_MAX_REDIRECTS = 3;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const ALLOWED_CONTENT_TYPES = new Set(["text/html", "text/plain"]);

export interface ResolvedAddress {
  address: string;
  family: 4 | 6;
}

export interface ValidatedTarget {
  url: URL;
  address: string;
  family: 4 | 6;
}

export interface SourceResponse {
  statusCode: number;
  headers: IncomingHttpHeaders;
  body: AsyncIterable<Uint8Array | string>;
  close?: () => void;
}

export type ResolveHostname = (
  hostname: string
) => Promise<readonly ResolvedAddress[]>;

export type RequestSource = (
  target: ValidatedTarget,
  signal: AbortSignal
) => Promise<SourceResponse>;

export interface PublicSourceOptions {
  timeoutMs?: number;
  maxBytes?: number;
  maxRedirects?: number;
  resolveHostname?: ResolveHostname;
  requestSource?: RequestSource;
}

export interface PublicSource {
  url: string;
  contentType: "text/html" | "text/plain";
  text: string;
}

function parseIpv4(address: string): number[] | null {
  const parts = address.split(".");
  if (parts.length !== 4) return null;

  const numbers = parts.map(Number);
  if (numbers.some(value => !Number.isInteger(value) || value < 0 || value > 255)) {
    return null;
  }

  return numbers;
}

function isPublicIpv4(address: string): boolean {
  const parts = parseIpv4(address);
  if (!parts) return false;

  const [a, b] = parts;

  if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
  if (a === 100 && b >= 64 && b <= 127) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && b === 0) return false;
  if (a === 192 && b === 88 && parts[2] === 99) return false;
  if (a === 192 && b === 168) return false;
  if (a === 198 && (b === 18 || b === 19)) return false;
  if (a === 198 && b === 51 && parts[2] === 100) return false;
  if (a === 203 && b === 0 && parts[2] === 113) return false;

  return true;
}

function parseIpv6(address: string): number[] | null {
  let normalized = address.toLowerCase();
  const zoneIndex = normalized.indexOf("%");
  if (zoneIndex >= 0) normalized = normalized.slice(0, zoneIndex);

  const ipv4Tail = normalized.match(/(?:^|:)(\d+\.\d+\.\d+\.\d+)$/)?.[1];
  if (ipv4Tail) {
    const ipv4 = parseIpv4(ipv4Tail);
    if (!ipv4) return null;
    const replacement = `${((ipv4[0] << 8) | ipv4[1]).toString(16)}:${(
      (ipv4[2] << 8) |
      ipv4[3]
    ).toString(16)}`;
    normalized = normalized.slice(0, -ipv4Tail.length) + replacement;
  }

  const halves = normalized.split("::");
  if (halves.length > 2) return null;

  const left = halves[0] ? halves[0].split(":") : [];
  const right = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const missing = 8 - left.length - right.length;

  if ((halves.length === 1 && missing !== 0) || missing < 0) return null;

  const groups = [
    ...left,
    ...Array.from({ length: missing }, () => "0"),
    ...right
  ].map(group => Number.parseInt(group, 16));

  if (
    groups.length !== 8 ||
    groups.some(group => !Number.isInteger(group) || group < 0 || group > 0xffff)
  ) {
    return null;
  }

  return groups;
}

function isPublicIpv6(address: string): boolean {
  const groups = parseIpv6(address);
  if (!groups) return false;

  const isMappedIpv4 =
    groups.slice(0, 5).every(group => group === 0) && groups[5] === 0xffff;
  if (isMappedIpv4) {
    return isPublicIpv4(
      `${groups[6] >> 8}.${groups[6] & 0xff}.${groups[7] >> 8}.${groups[7] & 0xff}`
    );
  }

  if (groups[0] < 0x2000 || groups[0] > 0x3fff) return false;

  // Documentation, transition, benchmarking, and deprecated special-use ranges.
  if (groups[0] === 0x2001 && groups[1] === 0x0000) return false;
  if (groups[0] === 0x2001 && groups[1] === 0x0002) return false;
  if (groups[0] === 0x2001 && (groups[1] & 0xfff0) === 0x0010) return false;
  if (groups[0] === 0x2001 && (groups[1] & 0xfff0) === 0x0020) return false;
  if (groups[0] === 0x2001 && groups[1] === 0x0db8) return false;
  if (groups[0] === 0x2002 || groups[0] === 0x3ffe) return false;

  return true;
}

export function isPublicIpAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) return isPublicIpv4(address);
  if (family === 6) return isPublicIpv6(address);
  return false;
}

const defaultResolver: ResolveHostname = async hostname => {
  const results = await lookup(hostname, { all: true, verbatim: true });
  return results.map(result => ({
    address: result.address,
    family: result.family as 4 | 6
  }));
};

function abortError(): EvidenceSliceError {
  return new EvidenceSliceError(
    "FETCH_TIMEOUT",
    "The source did not respond within the Evidence Slice timeout.",
    true
  );
}

async function resolveWithAbort(
  hostname: string,
  resolver: ResolveHostname,
  signal: AbortSignal
): Promise<readonly ResolvedAddress[]> {
  if (signal.aborted) throw abortError();

  return new Promise((resolve, reject) => {
    const onAbort = () => reject(abortError());
    signal.addEventListener("abort", onAbort, { once: true });

    resolver(hostname).then(
      addresses => {
        signal.removeEventListener("abort", onAbort);
        resolve(addresses);
      },
      error => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      }
    );
  });
}

export async function validatePublicUrl(
  value: string,
  resolver: ResolveHostname = defaultResolver,
  signal: AbortSignal = new AbortController().signal
): Promise<ValidatedTarget> {
  if (typeof value !== "string" || !value.trim() || value.length > 2_048) {
    throw new EvidenceSliceError(
      "INVALID_INPUT",
      "url must be a non-empty string no longer than 2,048 characters."
    );
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new EvidenceSliceError("INVALID_INPUT", "url must be a valid absolute URL.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new EvidenceSliceError(
      "INVALID_INPUT",
      "Evidence Slice V0 accepts only http or https URLs."
    );
  }

  if (url.username || url.password) {
    throw new EvidenceSliceError(
      "URL_NOT_PUBLIC",
      "URLs containing credentials are not allowed."
    );
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  const normalizedHostname = hostname.toLowerCase().replace(/\.$/, "");
  if (
    normalizedHostname === "localhost" ||
    normalizedHostname.endsWith(".localhost")
  ) {
    throw new EvidenceSliceError("URL_NOT_PUBLIC", "The URL must use a public host.");
  }

  let addresses: readonly ResolvedAddress[];
  const literalFamily = isIP(hostname);
  if (literalFamily === 4 || literalFamily === 6) {
    addresses = [{ address: hostname, family: literalFamily }];
  } else {
    try {
      addresses = await resolveWithAbort(hostname, resolver, signal);
    } catch (error) {
      if (error instanceof EvidenceSliceError) throw error;
      throw new EvidenceSliceError(
        "FETCH_FAILED",
        "The source hostname could not be resolved.",
        true
      );
    }
  }

  if (
    addresses.length === 0 ||
    addresses.some(result => !isPublicIpAddress(result.address))
  ) {
    throw new EvidenceSliceError(
      "URL_NOT_PUBLIC",
      "The URL must resolve only to public internet addresses."
    );
  }

  return { url, ...addresses[0] };
}

const defaultRequester: RequestSource = (target, signal) =>
  new Promise((resolve, reject) => {
    const originalHostname = target.url.hostname.replace(/^\[|\]$/g, "");
    const options: RequestOptions = {
      protocol: target.url.protocol,
      hostname: target.address,
      family: target.family,
      port: target.url.port || undefined,
      method: "GET",
      path: `${target.url.pathname}${target.url.search}`,
      headers: {
        accept: "text/html,text/plain;q=0.9",
        "accept-encoding": "identity",
        host: target.url.host,
        "user-agent": "x402-lab-evidence-slice/0.1"
      },
      ...(target.url.protocol === "https:" && isIP(originalHostname) === 0
        ? { servername: originalHostname }
        : {})
    };

    const transport = target.url.protocol === "https:" ? https : http;
    const request = transport.request(options, response => {
      resolve({
        statusCode: response.statusCode ?? 0,
        headers: response.headers,
        body: response,
        close: () => response.destroy()
      });
    });

    const onAbort = () => request.destroy(abortError());
    signal.addEventListener("abort", onAbort, { once: true });
    request.once("close", () => signal.removeEventListener("abort", onAbort));
    request.once("error", reject);
    request.end();
  });

async function requestWithAbort(
  target: ValidatedTarget,
  requester: RequestSource,
  signal: AbortSignal
): Promise<SourceResponse> {
  if (signal.aborted) throw abortError();

  return new Promise((resolve, reject) => {
    const onAbort = () => reject(abortError());
    signal.addEventListener("abort", onAbort, { once: true });

    requester(target, signal).then(
      response => {
        signal.removeEventListener("abort", onAbort);
        if (signal.aborted) {
          response.close?.();
          reject(abortError());
          return;
        }
        resolve(response);
      },
      error => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      }
    );
  });
}

function firstHeader(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

async function readBoundedBody(
  response: SourceResponse,
  maxBytes: number,
  signal: AbortSignal
): Promise<string> {
  const declaredLength = Number(firstHeader(response.headers["content-length"]));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    response.close?.();
    throw new EvidenceSliceError(
      "SOURCE_TOO_LARGE",
      `The source exceeds the ${maxBytes}-byte Evidence Slice limit.`
    );
  }

  const chunks: Buffer[] = [];
  let totalBytes = 0;
  const iterator = response.body[Symbol.asyncIterator]();

  while (true) {
    const next = await new Promise<IteratorResult<Uint8Array | string>>(
      (resolve, reject) => {
        const onAbort = () => {
          response.close?.();
          reject(abortError());
        };
        signal.addEventListener("abort", onAbort, { once: true });
        iterator.next().then(
          result => {
            signal.removeEventListener("abort", onAbort);
            resolve(result);
          },
          error => {
            signal.removeEventListener("abort", onAbort);
            reject(error);
          }
        );
      }
    );

    if (next.done) break;

    const buffer =
      typeof next.value === "string"
        ? Buffer.from(next.value)
        : Buffer.from(next.value);
    totalBytes += buffer.byteLength;
    if (totalBytes > maxBytes) {
      response.close?.();
      throw new EvidenceSliceError(
        "SOURCE_TOO_LARGE",
        `The source exceeds the ${maxBytes}-byte Evidence Slice limit.`
      );
    }
    chunks.push(buffer);
  }

  return Buffer.concat(chunks).toString("utf8");
}

export async function fetchPublicSource(
  inputUrl: string,
  options: PublicSourceOptions = {}
): Promise<PublicSource> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const maxRedirects = options.maxRedirects ?? DEFAULT_MAX_REDIRECTS;
  const resolver = options.resolveHostname ?? defaultResolver;
  const requester = options.requestSource ?? defaultRequester;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let currentUrl = inputUrl;

    for (let redirectCount = 0; ; redirectCount += 1) {
      const target = await validatePublicUrl(currentUrl, resolver, controller.signal);

      let response: SourceResponse;
      try {
        response = await requestWithAbort(target, requester, controller.signal);
      } catch (error) {
        if (error instanceof EvidenceSliceError) throw error;
        if (controller.signal.aborted) throw abortError();
        throw new EvidenceSliceError(
          "FETCH_FAILED",
          "The public source could not be fetched.",
          true
        );
      }

      if (REDIRECT_STATUSES.has(response.statusCode)) {
        response.close?.();
        const location = firstHeader(response.headers.location);
        if (!location) {
          throw new EvidenceSliceError(
            "FETCH_FAILED",
            "The source returned a redirect without a destination."
          );
        }
        if (redirectCount >= maxRedirects) {
          throw new EvidenceSliceError(
            "TOO_MANY_REDIRECTS",
            `The source exceeded the ${maxRedirects}-redirect limit.`
          );
        }
        currentUrl = new URL(location, target.url).toString();
        continue;
      }

      if (response.statusCode < 200 || response.statusCode >= 300) {
        response.close?.();
        throw new EvidenceSliceError(
          "FETCH_FAILED",
          `The source returned HTTP ${response.statusCode}.`,
          response.statusCode === 429 || response.statusCode >= 500
        );
      }

      const contentTypeHeader = firstHeader(response.headers["content-type"]);
      const contentType = contentTypeHeader?.split(";", 1)[0].trim().toLowerCase();
      if (!contentType || !ALLOWED_CONTENT_TYPES.has(contentType)) {
        response.close?.();
        throw new EvidenceSliceError(
          "UNSUPPORTED_CONTENT_TYPE",
          "Evidence Slice V0 accepts text/html or text/plain sources."
        );
      }

      const contentEncoding = firstHeader(response.headers["content-encoding"]);
      if (contentEncoding && contentEncoding.toLowerCase() !== "identity") {
        response.close?.();
        throw new EvidenceSliceError(
          "FETCH_FAILED",
          "Compressed source responses are not supported in Evidence Slice V0."
        );
      }

      const text = await readBoundedBody(response, maxBytes, controller.signal);
      return {
        url: target.url.toString(),
        contentType: contentType as PublicSource["contentType"],
        text
      };
    }
  } catch (error) {
    if (error instanceof EvidenceSliceError) throw error;
    if (controller.signal.aborted) throw abortError();
    throw new EvidenceSliceError(
      "FETCH_FAILED",
      "The public source could not be fetched.",
      true
    );
  } finally {
    clearTimeout(timeout);
  }
}
