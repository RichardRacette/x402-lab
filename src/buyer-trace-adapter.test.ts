import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { encodePaymentRequiredHeader } from "@x402/core/http";
import type { PaymentRequired } from "@x402/core/types";
import {
  BuyerTraceError, buyerTraceIntent, createBuyerTracePlan, runBuyerTrace,
  type BuyerTraceDependencies
} from "./buyer-trace-adapter.js";
import { mintOwnerCliPurchaseAuthorization, type PurchaseAuthorization } from "./trust-boundary.js";

async function fixture() {
  const directory = await mkdtemp(join(tmpdir(), "buyer-trace-fixture-"));
  const sessionFile = join(directory, "one-call.json");
  const plan = createBuyerTracePlan();
  const challenge: PaymentRequired = {
    x402Version: 2, resource: { url: plan.url, description: "Fixture only", mimeType: "application/json" },
    accepts: [structuredClone(plan.requirement)]
  };
  const body = { data: [{ sender: "synthetic-buyer", amount: "10000", decimals: 6 }],
    pagination: { page: 0, page_size: 100, has_next_page: true } };
  const requests: Request[] = [];
  let walletCalls = 0;
  const dependencies: BuyerTraceDependencies = {
    send: async request => {
      requests.push(request);
      if (!request.headers.has("PAYMENT-SIGNATURE")) {
        return new Response(null, { status: 402,
          headers: { "PAYMENT-REQUIRED": encodePaymentRequiredHeader(challenge) } });
      }
      return Response.json(body);
    },
    createPayment: async requirement => {
      walletCalls++;
      assert.deepEqual(requirement, createBuyerTracePlan().requirement);
      const reservation = JSON.parse(await readFile(sessionFile, "utf8"));
      assert.equal(reservation.reservedAtomic, "10000");
      return "SYNTHETIC_PAYMENT_NOT_A_SIGNATURE";
    }
  };
  const options = { execute: true, sessionFile,
    authorization: mintOwnerCliPurchaseAuthorization(buyerTraceIntent(plan, sessionFile)) };
  return { plan, challenge, body, dependencies, options, requests, sessionFile,
    walletCalls: () => walletCalls };
}

function code(expected: string) {
  return (error: unknown) => error instanceof BuyerTraceError && error.code === expected;
}

test("dry-run defaults to zero spend and touches no transport, wallet or ledger", async () => {
  const f = await fixture();
  const result = await runBuyerTrace(f.plan, {}, f.dependencies);
  assert.equal(result.mode, "dry-run");
  assert.equal(result.audit.network, "eip155:8453");
  assert.equal(result.audit.amountAtomic, "10000");
  assert.equal(f.requests.length, 0);
  assert.equal(f.walletCalls(), 0);
  await assert.rejects(readFile(f.sessionFile), { code: "ENOENT" });
});

test("one fake payment constructs the exact GET and preserves untrusted provenance", async t => {
  t.mock.method(globalThis, "fetch", async () => { throw new Error("Real network forbidden"); });
  const f = await fixture();
  const result = await runBuyerTrace(f.plan, f.options, f.dependencies);
  assert.equal(result.mode, "response-received");
  assert.equal(f.walletCalls(), 1);
  assert.equal(f.requests.length, 2);
  for (const request of f.requests) {
    assert.equal(request.url, f.plan.url);
    assert.equal(request.method, "GET");
    assert.equal(request.redirect, "error");
    assert.equal(request.body, null);
  }
  assert.equal(f.requests[0].headers.has("PAYMENT-SIGNATURE"), false);
  assert.equal(f.requests[1].headers.get("PAYMENT-SIGNATURE"), "SYNTHETIC_PAYMENT_NOT_A_SIGNATURE");
  assert.equal(result.response?.trust, "untrusted");
  assert.deepEqual(result.response?.transformations, ["json-parse"]);
  assert.doesNotMatch(JSON.stringify(result.audit), /SYNTHETIC_PAYMENT|synthetic-buyer/u);
  assert.doesNotMatch(await readFile(f.sessionFile, "utf8"), /SYNTHETIC_PAYMENT|synthetic-buyer/u);
});

for (const kind of ["missing", "forged", "different-session"] as const) {
  test(`approval ${kind} is refused before any dependency`, async () => {
    const f = await fixture();
    const options = { ...f.options };
    if (kind === "missing") options.authorization = undefined as unknown as PurchaseAuthorization;
    if (kind === "forged") options.authorization = JSON.parse(JSON.stringify(options.authorization));
    if (kind === "different-session") options.sessionFile += ".other";
    await assert.rejects(runBuyerTrace(f.plan, options, f.dependencies));
    assert.equal(f.requests.length, 0);
    assert.equal(f.walletCalls(), 0);
  });
}

const drifts: [string, (challenge: PaymentRequired) => void][] = [
  ["price", c => { c.accepts[0].amount = "10001"; }],
  ["lower-price", c => { c.accepts[0].amount = "9999"; }],
  ["network", c => { c.accepts[0].network = "eip155:84532"; }],
  ["asset", c => { c.accepts[0].asset = "0x0000000000000000000000000000000000000001"; }],
  ["recipient", c => { c.accepts[0].payTo = "0x0000000000000000000000000000000000000002"; }],
  ["request", c => { c.resource.url += "&secret=SYNTHETIC_SECRET"; }],
  ["pagination", c => { c.resource.url = c.resource.url.replace("page=0", "page=1"); }],
  ["scheme", c => { c.accepts[0].scheme = "upto"; }],
  ["version", c => { c.x402Version = 1; }],
  ["timeout", c => { c.accepts[0].maxTimeoutSeconds++; }],
  ["asset-domain", c => { c.accepts[0].extra!.name = "Other Coin"; }],
  ["extra-signing-field", c => { c.accepts[0].extra!.spender = "SYNTHETIC_UNAPPROVED"; }],
  ["ambiguous-alternative", c => { c.accepts.push(structuredClone(c.accepts[0])); }],
  ["extension", c => { c.extensions = { instruction: "SYNTHETIC_SECRET" }; }]
];
for (const [name, drift] of drifts) {
  test(`runtime ${name} drift is refused before signing`, async () => {
    const f = await fixture();
    drift(f.challenge);
    await assert.rejects(runBuyerTrace(f.plan, f.options, f.dependencies), code("CHALLENGE_DRIFT"));
    assert.equal(f.walletCalls(), 0);
    assert.equal(f.requests.length, 1);
    await assert.rejects(runBuyerTrace(f.plan, f.options, f.dependencies), code("SESSION_REFUSED"));
  });
}

test("mutating approved method, query or page size is refused", async () => {
  for (const field of ["method", "url", "pageSize"] as const) {
    const f = await fixture();
    if (field === "method") Object.assign(f.plan, { method: "POST" });
    if (field === "url") f.plan.url += "&sort_order=asc";
    if (field === "pageSize") f.plan.pageSize = 10;
    await assert.rejects(runBuyerTrace(f.plan, f.options, f.dependencies), code("PREFLIGHT_DRIFT"));
    assert.equal(f.requests.length, 0);
  }
});

test("approved plan is copied before an asynchronous dependency can mutate the caller", async () => {
  const f = await fixture();
  const send = f.dependencies.send;
  f.dependencies.send = async request => {
    f.plan.url = "https://example.org/collect";
    f.plan.requirement.payTo = "0x0000000000000000000000000000000000000002";
    return send(request);
  };
  await runBuyerTrace(f.plan, f.options, f.dependencies);
  assert.equal(f.requests[1].url, createBuyerTracePlan().url);
});

for (const budget of [0n, 9999n, 10001n]) {
  test(`session budget ${budget} is refused without dependencies`, async () => {
    const f = await fixture();
    await assert.rejects(runBuyerTrace(f.plan, { ...f.options, sessionBudgetAtomic: budget }, f.dependencies), code("BUDGET_REFUSED"));
    assert.equal(f.requests.length, 0);
    await assert.rejects(readFile(f.sessionFile), { code: "ENOENT" });
  });
}

test("atomic persistent reservation blocks simultaneous calls and replay with fresh authorization", async () => {
  const f = await fixture();
  const results = await Promise.allSettled([
    runBuyerTrace(f.plan, f.options, f.dependencies), runBuyerTrace(f.plan, f.options, f.dependencies)
  ]);
  assert.equal(results.filter(r => r.status === "fulfilled").length, 1);
  assert.equal(f.walletCalls(), 1);
  const fresh = { ...f.options, authorization: mintOwnerCliPurchaseAuthorization(buyerTraceIntent(f.plan, f.sessionFile)) };
  await assert.rejects(runBuyerTrace(f.plan, fresh, f.dependencies), code("SESSION_REFUSED"));
  assert.equal(f.requests.length, 2);
});

for (const phase of ["challenge", "wallet", "paid-response"] as const) {
  test(`${phase} failure burns reservation, refuses retry and hides dependency secrets`, async () => {
    const f = await fixture();
    const boom = async () => { throw new Error("SYNTHETIC_SECRET_PRIVATE_KEY"); };
    if (phase === "wallet") f.dependencies.createPayment = boom;
    else {
      const send = f.dependencies.send;
      f.dependencies.send = request => phase === "challenge" || request.headers.has("PAYMENT-SIGNATURE") ? boom() : send(request);
    }
    await assert.rejects(runBuyerTrace(f.plan, f.options, f.dependencies), code("DEPENDENCY_FAILED"));
    await assert.rejects(runBuyerTrace(f.plan, f.options, f.dependencies), code("SESSION_REFUSED"));
    assert.doesNotMatch(await readFile(f.sessionFile, "utf8"), /PRIVATE_KEY/u);
  });
}

for (const drift of ["page", "page_size", "too-many-rows"] as const) {
  test(`fulfillment ${drift} drift is refused without another paid request`, async () => {
    const f = await fixture();
    if (drift === "page") f.body.pagination.page = 1;
    if (drift === "page_size") f.body.pagination.page_size = 101;
    if (drift === "too-many-rows") f.body.data = Array(101).fill(f.body.data[0]);
    await assert.rejects(runBuyerTrace(f.plan, f.options, f.dependencies), code("PAGINATION_DRIFT"));
    assert.equal(f.walletCalls(), 1);
    assert.equal(f.requests.length, 2);
  });
}

test("page sizes are bounded and a new valid page size still requires matching approval", async () => {
  for (const size of [0, -1, 101, 1.5, NaN]) assert.throws(() => createBuyerTracePlan(size));
  const f = await fixture();
  await assert.rejects(runBuyerTrace(createBuyerTracePlan(10), f.options, f.dependencies));
  assert.equal(f.requests.length, 0);
});

test("paid mode has no default live transport or wallet", async () => {
  const f = await fixture();
  await assert.rejects(runBuyerTrace(f.plan, f.options), code("LIVE_COMPONENTS_UNAVAILABLE"));
  await assert.rejects(readFile(f.sessionFile), { code: "ENOENT" });
});

test("unapproved caller metadata never enters wallet input", async () => {
  const f = await fixture();
  f.plan.requirement.extra.spender = "SYNTHETIC_UNAPPROVED";
  await runBuyerTrace(f.plan, f.options, f.dependencies);
  assert.equal(f.walletCalls(), 1); // fake wallet asserts exact canonical terms
});

test("a paid response with another challenge cannot trigger a second signature", async () => {
  const f = await fixture();
  const send = f.dependencies.send;
  f.dependencies.send = request => request.headers.has("PAYMENT-SIGNATURE")
    ? Promise.resolve(new Response(null, { status: 402 })) : send(request);
  await assert.rejects(runBuyerTrace(f.plan, f.options, f.dependencies), code("FULFILLMENT_REFUSED"));
  assert.equal(f.walletCalls(), 1);
  await assert.rejects(runBuyerTrace(f.plan, f.options, f.dependencies), code("SESSION_REFUSED"));
});
