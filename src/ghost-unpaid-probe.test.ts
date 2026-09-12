import test from "node:test";
import assert from "node:assert/strict";
import { GhostProbeError, ghostUnsignedRequests, probeGhostUnpaid } from "./ghost-unpaid-probe.js";

// Synthetic fixture only: this is NOT a captured Ghost quote or trusted payee.
function challenge() {
  return { x402Version: 2, resource: { url: ghostUnsignedRequests[2].url, mimeType: "application/json" }, accepts: [{
    scheme: "exact", network: "eip155:8453", amount: "10000", asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    payTo: "0x1111111111111111111111111111111111111111", maxTimeoutSeconds: 300, extra: { name: "USD Coin", version: "2" }
  }] };
}
function reply(request: Request, body: unknown = {}, header = "", status = request.method === "POST" ? 402 : 200) {
  const response = new Response(JSON.stringify(body), { status, headers: header ? { "PAYMENT-REQUIRED": header } : {} });
  Object.defineProperty(response, "url", { value: request.url });
  return response;
}
const encoded = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64");

test("Ghost probe sends only the three pinned unsigned requests and cannot certify a fixture", async () => {
  const calls: Request[] = [];
  const result = await probeGhostUnpaid(async request => {
    calls.push(request);
    assert.equal(request.redirect, "error");
    assert.equal(request.credentials, "omit");
    assert.deepEqual([...request.headers.keys()].sort(), request.method === "POST" ? ["accept", "content-type"] : ["accept"]);
    if (request.method === "POST") {
      assert.equal(await request.text(), ghostUnsignedRequests[2].body);
      return reply(request, challenge(), encoded(challenge()));
    }
    return reply(request);
  });
  assert.deepEqual(calls.map(r => [r.method, r.url]), ghostUnsignedRequests.map(r => [r.method, r.url]));
  assert.equal(result.report.status, "CAPTURED_REQUIRES_METADATA_REVIEW");
  assert.equal(result.report.paymentAttempts, 0);
  assert.equal(result.report.signingAttempts, 0);
  assert.equal(result.report.walletLoaded, false);
  assert.equal(result.report.unverified.includes("DSSE receipt verification"), true);
});

test("Ghost quote/body drift is reported without any retry", async () => {
  let calls = 0;
  const result = await probeGhostUnpaid(async request => {
    calls++;
    const body = challenge(); body.accepts[0].amount = "20000";
    return request.method === "POST" ? reply(request, body, encoded(challenge())) : reply(request);
  });
  assert.equal(calls, 3);
  assert.equal(result.report.checks.headerBodyTerms, false);
  assert.equal(result.report.status, "CHALLENGE_CHECKS_NEED_REVIEW");
});

for (const kind of ["redirect", "oversized-body", "oversized-header", "dependency-error", "wrong-status"] as const) {
  test(`Ghost probe stops safely on ${kind}`, async () => {
    let calls = 0;
    await assert.rejects(probeGhostUnpaid(async request => {
      calls++;
      if (kind === "dependency-error") throw new Error("SENSITIVE_PROVIDER_ERROR");
      if (kind === "oversized-body") return reply(request, "x".repeat(262144));
      if (kind === "wrong-status") return reply(request, {}, "", 502);
      if (kind === "redirect") {
        const response = reply(request); Object.defineProperty(response, "redirected", { value: true }); return response;
      }
      return request.method === "POST" ? reply(request, {}, "x".repeat(16385)) : reply(request);
    }), error => error instanceof GhostProbeError && !error.message.includes("SENSITIVE_PROVIDER_ERROR"));
    assert.equal(calls, kind === "oversized-header" ? 3 : 1);
  });
}
